#!/usr/bin/env bash
# Inspect or deploy Tradnest on the eu-north-1 EC2 box.
#
# Run on a machine that has AWS profile `tradnest` (your Mac, not the cloud VM):
#
#   AWS_PROFILE=tradnest ./scripts/deploy-ec2-tradnest.sh ensure-ssm
#   AWS_PROFILE=tradnest ./scripts/deploy-ec2-tradnest.sh inspect
#   AWS_PROFILE=tradnest ./scripts/deploy-ec2-tradnest.sh deploy
#   AWS_PROFILE=tradnest ./scripts/deploy-ec2-tradnest.sh open-ssh
#
# Prefers SSM Run Command. `ensure-ssm` attaches AmazonSSMManagedInstanceCore
# (creates profile TradnestEC2SSM if the instance has none). If SSM still
# never comes Online, open SSH from your IP and set TRADNEST_SSH_HOST.
set -euo pipefail

PROFILE="${AWS_PROFILE:-tradnest}"
REGION="${AWS_REGION:-eu-north-1}"
INSTANCE_ID="${TRADNEST_INSTANCE_ID:-i-001784445ba93c534}"
PUBLIC_IP="${TRADNEST_PUBLIC_IP:-13.60.11.98}"
REPO_URL="${TRADNEST_REPO_URL:-https://github.com/tradnest-aws/tradnest.git}"
BRANCH="${TRADNEST_BRANCH:-cursor/b2b-multi-vendor-storefront-81d5}"
DEPLOY_DIR="${TRADNEST_DEPLOY_DIR:-/opt/tradnest}"
SSM_PROFILE_NAME="${TRADNEST_SSM_PROFILE:-TradnestEC2SSM}"
ACTION="${1:-inspect}"

export AWS_PROFILE="$PROFILE"
export AWS_REGION="$REGION"
export AWS_DEFAULT_REGION="$REGION"

log() { echo "→ $*"; }

need_aws() {
  if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "AWS profile '$PROFILE' is not usable from this machine." >&2
    echo "Configure it locally (do not paste access keys into chat)." >&2
    exit 1
  fi
}

ssm_online() {
  aws ssm describe-instance-information \
    --filters "Key=InstanceIds,Values=$INSTANCE_ID" \
    --query 'InstanceInformationList[0].PingStatus' \
    --output text 2>/dev/null || echo "None"
}

instance_profile_arn() {
  aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].IamInstanceProfile.Arn' \
    --output text
}

ensure_ssm_role() {
  need_aws
  local existing
  existing="$(instance_profile_arn)"
  if [[ -n "$existing" && "$existing" != "None" ]]; then
    local pname
    pname="${existing##*/}"
    log "Instance already has profile $pname — attaching AmazonSSMManagedInstanceCore to its role(s)"
    local roles
    roles="$(aws iam get-instance-profile \
      --instance-profile-name "$pname" \
      --query 'InstanceProfile.Roles[].RoleName' \
      --output text)"
    local role
    for role in $roles; do
      aws iam attach-role-policy \
        --role-name "$role" \
        --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore \
        2>/dev/null || true
      log "Ensured SSM policy on role $role"
    done
    return
  fi

  log "No instance profile — creating $SSM_PROFILE_NAME"
  local trust
  trust="$(mktemp)"
  cat >"$trust" <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
JSON
  aws iam get-role --role-name "$SSM_PROFILE_NAME" >/dev/null 2>&1 || \
    aws iam create-role \
      --role-name "$SSM_PROFILE_NAME" \
      --assume-role-policy-document "file://$trust" >/dev/null
  rm -f "$trust"

  aws iam attach-role-policy \
    --role-name "$SSM_PROFILE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore \
    2>/dev/null || true

  aws iam get-instance-profile --instance-profile-name "$SSM_PROFILE_NAME" >/dev/null 2>&1 || \
    aws iam create-instance-profile --instance-profile-name "$SSM_PROFILE_NAME" >/dev/null

  aws iam add-role-to-instance-profile \
    --instance-profile-name "$SSM_PROFILE_NAME" \
    --role-name "$SSM_PROFILE_NAME" \
    2>/dev/null || true

  log "Waiting 12s for IAM to propagate"
  sleep 12

  aws ec2 associate-iam-instance-profile \
    --instance-id "$INSTANCE_ID" \
    --iam-instance-profile "Name=$SSM_PROFILE_NAME" >/dev/null
  log "Associated instance profile $SSM_PROFILE_NAME with $INSTANCE_ID"
}

wait_for_ssm() {
  local ping tries="${1:-36}"
  log "Waiting for SSM Online (up to $((tries * 10))s)"
  for _ in $(seq 1 "$tries"); do
    ping="$(ssm_online)"
    if [[ "$ping" == "Online" ]]; then
      log "SSM is Online"
      return 0
    fi
    printf '.'
    sleep 10
  done
  echo
  return 1
}

open_ssh() {
  need_aws
  local my_ip sg
  my_ip="$(curl -fsS --max-time 10 https://checkip.amazonaws.com | tr -d '[:space:]')"
  if [[ ! "$my_ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Could not determine your public IP ($my_ip)" >&2
    exit 1
  fi
  sg="$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text)"
  log "Authorizing tcp/22 from ${my_ip}/32 on $sg"
  aws ec2 authorize-security-group-ingress \
    --group-id "$sg" \
    --protocol tcp \
    --port 22 \
    --cidr "${my_ip}/32" \
    >/dev/null 2>&1 || log "Rule may already exist (ok)"
  local key
  key="$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].KeyName' \
    --output text)"
  echo
  echo "SSH from this Mac (use the .pem that matches key pair: $key):"
  echo "  TRADNEST_SSH_HOST=ubuntu@$PUBLIC_IP AWS_PROFILE=$PROFILE $0 inspect"
  echo "  ssh -i ~/.ssh/${key}.pem ubuntu@$PUBLIC_IP"
}

run_remote() {
  local script="$1"
  if [[ -n "${TRADNEST_SSH_HOST:-}" ]]; then
    log "SSH ${TRADNEST_SSH_HOST}"
    local ssh_opts=(
      -o ConnectTimeout=10
      -o StrictHostKeyChecking=accept-new
      -o ServerAliveInterval=15
      -o ServerAliveCountMax=240
    )
    if [[ -n "${TRADNEST_SSH_KEY:-}" ]]; then
      ssh_opts+=(-i "$TRADNEST_SSH_KEY")
    fi
    ssh "${ssh_opts[@]}" "$TRADNEST_SSH_HOST" "sudo bash -s" <<<"$script"
    return
  fi

  need_aws
  local ping
  ping="$(ssm_online)"
  if [[ "$ping" != "Online" ]]; then
    log "SSM not Online ($ping) — attaching IAM and waiting"
    ensure_ssm_role
    if ! wait_for_ssm 36; then
      echo "SSM still not Online. The agent may be missing on the AMI." >&2
      echo "Open SSH from this Mac, then rerun:" >&2
      echo "  AWS_PROFILE=$PROFILE $0 open-ssh" >&2
      echo "  TRADNEST_SSH_HOST=ubuntu@$PUBLIC_IP TRADNEST_SSH_KEY=~/.ssh/<keypair>.pem AWS_PROFILE=$PROFILE $0 $ACTION" >&2
      exit 1
    fi
  fi

  log "SSM SendCommand on $INSTANCE_ID"
  local payload
  payload="$(mktemp)"
  python3 - "$INSTANCE_ID" "$ACTION" "$script" "$payload" <<'PY'
import json, sys
instance_id, action, script, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
with open(out, "w") as f:
    json.dump({
        "InstanceIds": [instance_id],
        "DocumentName": "AWS-RunShellScript",
        "Comment": f"tradnest {action}",
        "Parameters": {"commands": [script]},
    }, f)
PY
  local cmd_id
  cmd_id="$(aws ssm send-command \
    --cli-input-json "file://$payload" \
    --query 'Command.CommandId' \
    --output text)"
  rm -f "$payload"

  log "Waiting for command $cmd_id"
  local status="Pending"
  for _ in $(seq 1 90); do
    status="$(aws ssm get-command-invocation \
      --command-id "$cmd_id" \
      --instance-id "$INSTANCE_ID" \
      --query 'Status' \
      --output text 2>/dev/null || echo Pending)"
    case "$status" in
      Success|Failed|Cancelled|TimedOut) break ;;
    esac
    sleep 5
  done

  aws ssm get-command-invocation \
    --command-id "$cmd_id" \
    --instance-id "$INSTANCE_ID" \
    --query '{Status:Status,Stdout:StandardOutputContent,Stderr:StandardErrorContent}' \
    --output json
}

INSPECT_REMOTE=$(cat <<'REMOTE'
set -eu
echo "=== identity ==="
id; hostname; date -Is; uname -a
echo
echo "=== listeners ==="
(ss -tlnp || netstat -tlnp) 2>/dev/null | head -80
echo
echo "=== nginx sites ==="
ls -la /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null || true
for f in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
  [ -f "$f" ] || continue
  echo "----- $f -----"
  cat "$f"
done
echo
echo "=== systemd (medusa/mercur/next/node/bun/caddy) ==="
systemctl list-units --type=service --all --no-pager 2>/dev/null | grep -iE 'medusa|mercur|tradnest|next|node|bun|caddy|nginx|pm2|docker|postgres|redis' || true
echo
echo "=== docker ==="
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}' 2>/dev/null || echo 'docker not available'
echo
echo "=== git checkouts ==="
find /home /opt /var/www /root /srv /ubuntu -name .git -type d 2>/dev/null | head -40
echo
echo "=== remotes ==="
while IFS= read -r g; do
  [ -n "$g" ] || continue
  root="$(dirname "$g")"
  echo "-- $root"
  git -C "$root" remote -v 2>/dev/null | head -4
  git -C "$root" rev-parse --abbrev-ref HEAD 2>/dev/null || true
  git -C "$root" log -1 --oneline 2>/dev/null || true
done < <(find /home /opt /var/www /root /srv -name .git -type d 2>/dev/null | head -20)
echo
echo "=== .env candidates ==="
find /home /opt /var/www /root /srv -name '.env' -o -name '.env.production' 2>/dev/null | head -40
echo
echo "=== bun/node/yarn ==="
command -v bun; command -v node; command -v yarn; command -v npm; command -v git; command -v psql || true
node -v 2>/dev/null || true
bun -v 2>/dev/null || true
REMOTE
)

DEPLOY_REMOTE=$(cat <<REMOTE
set -eu
REPO_URL='$REPO_URL'
BRANCH='$BRANCH'
DEPLOY_DIR='$DEPLOY_DIR'
log() { echo "[deploy] \$*"; }

if ! command -v git >/dev/null; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y git curl ca-certificates
fi

if ! command -v bun >/dev/null; then
  log "Installing bun"
  curl -fsSL https://bun.sh/install | bash
  export PATH="\$HOME/.bun/bin:/root/.bun/bin:\$PATH"
  ln -sfn "\$HOME/.bun/bin/bun" /usr/local/bin/bun 2>/dev/null || ln -sfn /root/.bun/bin/bun /usr/local/bin/bun
fi
export PATH="/usr/local/bin:\$HOME/.bun/bin:/root/.bun/bin:\$PATH"

mkdir -p "\$DEPLOY_DIR"
if [ -d "\$DEPLOY_DIR/.git" ]; then
  log "Fetching \$BRANCH in \$DEPLOY_DIR"
  cd "\$DEPLOY_DIR"
  git remote set-url origin "\$REPO_URL" || git remote add origin "\$REPO_URL"
  git fetch --prune origin "+refs/heads/\$BRANCH:refs/remotes/origin/\$BRANCH"
  git checkout -B "\$BRANCH" "origin/\$BRANCH"
  git reset --hard "origin/\$BRANCH"
else
  log "Cloning \$REPO_URL (\$BRANCH) → \$DEPLOY_DIR"
  rm -rf "\$DEPLOY_DIR"
  git clone --branch "\$BRANCH" --single-branch "\$REPO_URL" "\$DEPLOY_DIR"
  cd "\$DEPLOY_DIR"
fi

log "Now at \$(git rev-parse --short HEAD) — \$(git log -1 --pretty=%s)"
log "Staged at \$DEPLOY_DIR. Existing nginx Medusa/Next app was NOT replaced."
log "Cut over only after confirming DB/.env and writing systemd + nginx for API + storefront."
echo "HEAD=\$(git rev-parse HEAD)"
REMOTE
)

CUTOVER_REMOTE=$(cat <<REMOTE
set -eu
REPO_URL='$REPO_URL'
BRANCH='$BRANCH'
DEPLOY_DIR='$DEPLOY_DIR'
PUBLIC_IP='$PUBLIC_IP'
log() { echo "[cutover] \$*"; }

export PATH="/usr/local/bin:/root/.bun/bin:/home/ubuntu/.bun/bin:\$PATH"
cd "\$DEPLOY_DIR"
git remote set-url origin "\$REPO_URL" || true
git fetch --prune origin "+refs/heads/\$BRANCH:refs/remotes/origin/\$BRANCH"
git checkout -B "\$BRANCH" "origin/\$BRANCH"
git reset --hard "origin/\$BRANCH"
log "Now at \$(git rev-parse --short HEAD)"
chmod +x scripts/ec2-cutover-remote.sh
export TRADNEST_DEPLOY_DIR="\$DEPLOY_DIR"
export TRADNEST_PUBLIC_ORIGIN="http://\$PUBLIC_IP"
bash scripts/ec2-cutover-remote.sh
REMOTE
)

case "$ACTION" in
  ensure-ssm)
    echo "Instance $INSTANCE_ID ($PUBLIC_IP) region $REGION profile $PROFILE"
    ensure_ssm_role
    if wait_for_ssm 36; then
      echo "SSM ready. Next: AWS_PROFILE=$PROFILE $0 deploy"
    else
      echo "SSM still not Online after attaching IAM. Run: AWS_PROFILE=$PROFILE $0 open-ssh" >&2
      exit 1
    fi
    ;;
  open-ssh)
    open_ssh
    ;;
  inspect)
    echo "Instance $INSTANCE_ID ($PUBLIC_IP) region $REGION profile $PROFILE"
    run_remote "$INSPECT_REMOTE"
    ;;
  deploy)
    echo "Instance $INSTANCE_ID ($PUBLIC_IP) clone $REPO_URL#$BRANCH → $DEPLOY_DIR"
    echo "This stages the Mercur/Tradnest tree; it does not rewrite live nginx."
    run_remote "$DEPLOY_REMOTE"
    ;;
  cutover)
    echo "Instance $INSTANCE_ID ($PUBLIC_IP) CUTOVER $REPO_URL#$BRANCH"
    echo "This builds API + storefront, reuses DATABASE_URL if found, and rewrites nginx."
    run_remote "$CUTOVER_REMOTE"
    ;;
  *)
    echo "Usage: $0 inspect|deploy|cutover|ensure-ssm|open-ssh" >&2
    exit 1
    ;;
esac
