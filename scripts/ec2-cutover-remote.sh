#!/usr/bin/env bash
# Runs ON the EC2 host as root. Builds /opt/tradnest API + B2B storefront,
# reuses the live Medusa DATABASE_URL when found, then switches nginx.
set -euo pipefail

DEPLOY_DIR="${TRADNEST_DEPLOY_DIR:-/opt/tradnest}"
PUBLIC_ORIGIN="${TRADNEST_PUBLIC_ORIGIN:-http://13.60.11.98}"
API_PORT="${TRADNEST_API_PORT:-9000}"
STORE_PORT="${TRADNEST_STORE_PORT:-3000}"
export PATH="/usr/local/bin:/root/.bun/bin:/home/ubuntu/.bun/bin:${PATH}"

log() { echo "[cutover $(date +'%H:%M:%S')] $*"; }

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root (sudo)" >&2
  exit 1
fi

if [[ ! -d "$DEPLOY_DIR/.git" ]]; then
  echo "Missing $DEPLOY_DIR — run deploy first" >&2
  exit 1
fi

if ! command -v bun >/dev/null; then
  echo "bun not on PATH" >&2
  exit 1
fi

find_env_file() {
  local f
  while IFS= read -r f; do
    [[ -f "$f" ]] || continue
    if grep -qE '^DATABASE_URL=.+' "$f" 2>/dev/null; then
      echo "$f"
      return 0
    fi
  done < <(find /home /opt /var/www /root /srv /etc -name '.env' -o -name '.env.production' -o -name '.env.local' 2>/dev/null | grep -v "$DEPLOY_DIR" | head -80)
  return 1
}

upsert() {
  local file="$1" key="$2" val="$3"
  mkdir -p "$(dirname "$file")"
  touch "$file"
  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$file"
  else
    printf '%s=%s\n' "$key" "$val" >>"$file"
  fi
}

copy_key() {
  local src="$1" dest="$2" key="$3"
  local line
  line="$(grep -E "^${key}=" "$src" 2>/dev/null | tail -1 || true)"
  [[ -n "$line" ]] || return 0
  grep -q "^${key}=" "$dest" 2>/dev/null && return 0
  printf '%s\n' "$line" >>"$dest"
}

log "Discovering existing DATABASE_URL"
OLD_ENV=""
if OLD_ENV="$(find_env_file)"; then
  log "Using credentials from $OLD_ENV"
else
  log "No existing .env with DATABASE_URL found"
fi

API_ENV="$DEPLOY_DIR/apps/api/.env"
STORE_ENV="$DEPLOY_DIR/apps/storefront/.env"
ORIGIN_HOST="${PUBLIC_ORIGIN#http://}"
ORIGIN_HOST="${ORIGIN_HOST#https://}"
ORIGIN_HOST="${ORIGIN_HOST%/}"

if [[ -n "$OLD_ENV" ]]; then
  cp "$OLD_ENV" "$API_ENV"
else
  touch "$API_ENV"
fi

upsert "$API_ENV" PORT "$API_PORT"
upsert "$API_ENV" NODE_ENV production
upsert "$API_ENV" STORE_CORS "$PUBLIC_ORIGIN,http://127.0.0.1:$STORE_PORT"
upsert "$API_ENV" ADMIN_CORS "$PUBLIC_ORIGIN,http://127.0.0.1:9000"
upsert "$API_ENV" VENDOR_CORS "$PUBLIC_ORIGIN"
upsert "$API_ENV" AUTH_CORS "$PUBLIC_ORIGIN,http://127.0.0.1:9000,http://127.0.0.1:7001,http://127.0.0.1:7002"
upsert "$API_ENV" FILE_BACKEND_URL "${PUBLIC_ORIGIN}/static"
upsert "$API_ENV" MERCUR_VENDOR_URL "${PUBLIC_ORIGIN}/seller"
upsert "$API_ENV" STOREFRONT_REVALIDATE_URL "$PUBLIC_ORIGIN"
grep -q '^JWT_SECRET=' "$API_ENV" || upsert "$API_ENV" JWT_SECRET supersecret
grep -q '^COOKIE_SECRET=' "$API_ENV" || upsert "$API_ENV" COOKIE_SECRET supersecret
grep -q '^REDIS_URL=' "$API_ENV" || upsert "$API_ENV" REDIS_URL redis://127.0.0.1:6379

if ! grep -qE '^DATABASE_URL=.+' "$API_ENV"; then
  echo "DATABASE_URL is missing in $API_ENV. Refusing to cut over an empty database." >&2
  echo "Put the live Medusa DATABASE_URL into $API_ENV and rerun cutover." >&2
  exit 1
fi

: >"$STORE_ENV"
if [[ -n "$OLD_ENV" ]]; then
  copy_key "$OLD_ENV" "$STORE_ENV" NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  copy_key "$OLD_ENV" "$STORE_ENV" NEXT_PUBLIC_STRIPE_KEY
  copy_key "$OLD_ENV" "$STORE_ENV" REVALIDATE_SECRET
fi
upsert "$STORE_ENV" MEDUSA_BACKEND_URL "http://127.0.0.1:${API_PORT}"
upsert "$STORE_ENV" NEXT_PUBLIC_BASE_URL "$PUBLIC_ORIGIN"
upsert "$STORE_ENV" NEXT_PUBLIC_DEFAULT_REGION dk
upsert "$STORE_ENV" NEXT_PUBLIC_SITE_NAME Tradnest
upsert "$STORE_ENV" NEXT_PUBLIC_SITE_DESCRIPTION "Tradnest B2B wholesale marketplace"
upsert "$STORE_ENV" NEXT_PUBLIC_VENDOR_URL "${PUBLIC_ORIGIN}/seller"
upsert "$STORE_ENV" REVALIDATE_SECRET "$(grep -E '^STOREFRONT_REVALIDATE_SECRET=' "$API_ENV" | cut -d= -f2- || echo supersecret)"

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=3072}"

log "bun install (monorepo)"
cd "$DEPLOY_DIR"
bun install

log "Build @mercurjs/types and @mercurjs/core"
( cd "$DEPLOY_DIR/packages/types" && bun run build )
( cd "$DEPLOY_DIR/packages/core" && bun run build )
if [[ -f "$DEPLOY_DIR/packages/client/package.json" ]]; then
  ( cd "$DEPLOY_DIR/packages/client" && bun run build )
fi

log "Medusa migrate"
cd "$DEPLOY_DIR/apps/api"
bunx medusa db:migrate

log "Build storefront"
cd "$DEPLOY_DIR/apps/storefront"
bun run build

BUN_BIN="$(command -v bun)"
log "Writing systemd units (bun=$BUN_BIN)"
cat >/etc/systemd/system/tradnest-api.service <<EOF
[Unit]
Description=Tradnest Medusa API
After=network.target postgresql.service redis-server.service redis.service
Wants=postgresql.service

[Service]
Type=simple
WorkingDirectory=$DEPLOY_DIR/apps/api
EnvironmentFile=$API_ENV
Environment=NODE_ENV=production
ExecStart=$BUN_BIN run start
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/tradnest-api.log
StandardError=append:/var/log/tradnest-api.err.log

[Install]
WantedBy=multi-user.target
EOF

cat >/etc/systemd/system/tradnest-storefront.service <<EOF
[Unit]
Description=Tradnest B2B storefront
After=network.target tradnest-api.service

[Service]
Type=simple
WorkingDirectory=$DEPLOY_DIR/apps/storefront
EnvironmentFile=$STORE_ENV
Environment=NODE_ENV=production
Environment=PORT=$STORE_PORT
ExecStart=$BUN_BIN run start -- --hostname 127.0.0.1 --port $STORE_PORT
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/tradnest-storefront.log
StandardError=append:/var/log/tradnest-storefront.err.log

[Install]
WantedBy=multi-user.target
EOF

ln -sfn "$BUN_BIN" /usr/local/bin/bun 2>/dev/null || true

log "Stopping processes on :$API_PORT and :$STORE_PORT (old Medusa/Next)"
for port in "$API_PORT" "$STORE_PORT"; do
  if command -v fuser >/dev/null; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  fi
  pids="$(ss -lptn "sport = :$port" 2>/dev/null | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | sort -u || true)"
  if [[ -n "${pids:-}" ]]; then
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 2
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
done

# Stop common unit names without failing if absent
for unit in medusa medusa-server nextjs storefront; do
  systemctl stop "$unit" 2>/dev/null || true
done
if command -v pm2 >/dev/null; then
  pm2 stop all 2>/dev/null || true
fi

systemctl daemon-reload
systemctl enable tradnest-api tradnest-storefront
systemctl restart tradnest-api
sleep 5
systemctl restart tradnest-storefront

log "Backing up nginx and installing Tradnest vhost"
BACKUP="/etc/nginx/tradnest-backup-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP"
cp -a /etc/nginx/sites-enabled "$BACKUP/" 2>/dev/null || true
cp -a /etc/nginx/conf.d "$BACKUP/" 2>/dev/null || true

rm -f /etc/nginx/sites-enabled/default
cat >/etc/nginx/sites-available/tradnest <<NGINX
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name $ORIGIN_HOST _;
  client_max_body_size 32m;

  location /health {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /admin {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /auth {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /store {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /hooks {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /static {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_set_header Host \$host;
  }

  location /app {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location / {
    proxy_pass http://127.0.0.1:$STORE_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX
ln -sfn /etc/nginx/sites-available/tradnest /etc/nginx/sites-enabled/tradnest

if nginx -t; then
  systemctl reload nginx
  log "nginx reloaded"
else
  log "nginx -t failed — restoring $BACKUP"
  rm -f /etc/nginx/sites-enabled/tradnest
  cp -a "$BACKUP/sites-enabled/." /etc/nginx/sites-enabled/ 2>/dev/null || true
  nginx -t && systemctl reload nginx
  exit 1
fi

log "Health checks"
ok=0
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 2
done
if [[ "$ok" -ne 1 ]]; then
  log "API not healthy — journalctl -u tradnest-api -n 80"
  journalctl -u tradnest-api -n 80 --no-pager || true
  tail -n 80 /var/log/tradnest-api.err.log || true
  exit 1
fi

curl -fsS -o /dev/null -w "storefront HTTP %{http_code}\n" "http://127.0.0.1:${STORE_PORT}/" || true
curl -fsS "http://127.0.0.1:${API_PORT}/health"
echo
log "Cutover complete"
echo "API:        $PUBLIC_ORIGIN/health"
echo "Storefront: $PUBLIC_ORIGIN/"
echo "Admin:      $PUBLIC_ORIGIN/app"
echo "HEAD: $(git -C "$DEPLOY_DIR" rev-parse --short HEAD)"
