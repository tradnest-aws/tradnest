#!/usr/bin/env bash
# Inspect or deploy Tradnest on the eu-north-1 EC2 box.
#
# This cloud agent cannot use AWS profile `tradnest` (no credentials here).
# Run the script on a machine that already has that profile, typically:
#
#   AWS_PROFILE=tradnest ./scripts/deploy-ec2-tradnest.sh inspect
#   AWS_PROFILE=tradnest ./scripts/deploy-ec2-tradnest.sh deploy
#
# Prefers SSM Run Command (port 22 is closed from the public internet).
# Falls back to SSH if TRADNEST_SSH_HOST is set (e.g. ubuntu@13.60.11.98).
set -euo pipefail

PROFILE="${AWS_PROFILE:-tradnest}"
REGION="${AWS_REGION:-eu-north-1}"
INSTANCE_ID="${TRADNEST_INSTANCE_ID:-i-001784445ba93c534}"
PUBLIC_IP="${TRADNEST_PUBLIC_IP:-13.60.11.98}"
REPO_URL="${TRADNEST_REPO_URL:-https://github.com/tradnest-aws/tradnest.git}"
BRANCH="${TRADNEST_BRANCH:-cursor/b2b-multi-vendor-storefront-81d5}"
DEPLOY_DIR="${TRADNEST_DEPLOY_DIR:-/opt/tradnest}"
ACTION="${1:-inspect}"

export AWS_PROFILE="$PROFILE"
export AWS_REGION="$REGION"
export AWS_DEFAULT_REGION="$REGION"

log() { echo "→ $*"; }

need_aws() {
  if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "AWS profile '$PROFILE' is not usable from this machine." >&2
    echo "Configure it locally (do not paste access keys into chat):" >&2
    echo "  aws configure --profile tradnest" >&2
    echo "  aws sts get-caller-identity --profile tradnest" >&2
    exit 1
  fi
}

ssm_online() {
  aws ssm describe-instance-information \
    --filters "Key=InstanceIds,Values=$INSTANCE_ID" \
    --query 'InstanceInformationList[0].PingStatus' \
    --output text 2>/dev/null || echo "None"
}

run_remote() {
  local script="$1"
  if [[ -n "${TRADNEST_SSH_HOST:-}" ]]; then
    log "SSH ${TRADNEST_SSH_HOST}"
    # shellcheck disable=SC2029
    ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new \
      "$TRADNEST_SSH_HOST" "sudo bash -s" <<<"$script"
    return
  fi

  need_aws
  local ping
  ping="$(ssm_online)"
  if [[ "$ping" != "Online" ]]; then
    echo "SSM is not Online for $INSTANCE_ID (got: $ping)." >&2
    echo "Fix on the instance: AmazonSSMManagedInstanceCore IAM role + SSM agent." >&2
    echo "Or open SSH and rerun with TRADNEST_SSH_HOST=ubuntu@$PUBLIC_IP" >&2
    exit 1
  fi

  log "SSM SendCommand on $INSTANCE_ID"
  local cmd_id
  cmd_id="$(aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name AWS-RunShellScript \
    --comment "tradnest $ACTION" \
    --parameters commands=["$script"] \
    --query 'Command.CommandId' \
    --output text)"

  log "Waiting for command $cmd_id"
  local status="Pending"
  for _ in $(seq 1 90); do
    status="$(aws ssm get-command-invocation \
      --command-id "$cmd_id" \
      --instance-id "$INSTANCE_ID" \
      --query 'Status' \
      --output text)"
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

case "$ACTION" in
  inspect)
    echo "Instance $INSTANCE_ID ($PUBLIC_IP) region $REGION profile $PROFILE"
    run_remote "$INSPECT_REMOTE"
    ;;
  deploy)
    echo "Instance $INSTANCE_ID ($PUBLIC_IP) clone $REPO_URL#$BRANCH → $DEPLOY_DIR"
    echo "This stages the Mercur/Tradnest tree; it does not rewrite live nginx."
    run_remote "$DEPLOY_REMOTE"
    ;;
  *)
    echo "Usage: $0 inspect|deploy" >&2
    exit 1
    ;;
esac
