#!/usr/bin/env bash
# Runs ON the EC2 host as root. Builds /opt/tradnest API + B2B storefront,
# reuses the live Medusa DATABASE_URL when found, then switches nginx.
set -euo pipefail

DEPLOY_DIR="${TRADNEST_DEPLOY_DIR:-/opt/tradnest}"
PUBLIC_ORIGIN="${TRADNEST_PUBLIC_ORIGIN:-http://13.60.11.98}"
API_PORT="${TRADNEST_API_PORT:-9000}"
STORE_PORT="${TRADNEST_STORE_PORT:-3000}"
VENDOR_PORT="${TRADNEST_VENDOR_PORT:-7001}"
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

ensure_http_session_cookies() {
  local api_env="$DEPLOY_DIR/apps/api/.env"
  touch "$api_env"
  if [[ "$PUBLIC_ORIGIN" == https://* ]]; then
    upsert "$api_env" COOKIE_SECURE true
    log "COOKIE_SECURE=true (HTTPS origin)"
  else
    upsert "$api_env" COOKIE_SECURE false
    log "COOKIE_SECURE=false so /app session cookies work on HTTP"
  fi
  bash "$DEPLOY_DIR/scripts/patch-medusa-session-cookie.sh" "$DEPLOY_DIR" || true
}

verify_admin_session_cookie() {
  local email="${TRADNEST_ADMIN_EMAIL:-admin@tradnest.il}"
  local pass="${TRADNEST_ADMIN_PASSWORD:-supersecret}"
  local token headers
  token="$(curl -sS -X POST "http://127.0.0.1:${API_PORT}/auth/user/emailpass" \
    -H 'content-type: application/json' \
    -d "{\"email\":\"${email}\",\"password\":\"${pass}\"}" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin).get("token",""))' 2>/dev/null || true)"
  if [[ -z "$token" ]]; then
    log "WARN: could not mint admin JWT for ${email} — skip session-cookie check"
    return 0
  fi
  headers="$(curl -sS -D - -o /dev/null -X POST "http://127.0.0.1:${API_PORT}/auth/session" \
    -H "authorization: Bearer ${token}" \
    -H 'content-type: application/json' || true)"
  if printf '%s\n' "$headers" | grep -qi '^set-cookie:.*connect\.sid'; then
    log "POST /auth/session sets connect.sid"
  else
    log "WARN: POST /auth/session did not Set-Cookie connect.sid"
    printf '%s\n' "$headers" | sed -n '1,20p' || true
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

find_publishable_key() {
  local key="" f line
  for f in \
    "$DEPLOY_DIR/apps/storefront/.env" \
    /opt/b2b-starter/apps/web/.env \
    /opt/b2b-starter/apps/storefront/.env \
    /opt/b2b-starter/apps/backend/.env \
    /opt/b2b-starter/.env
  do
    [[ -f "$f" ]] || continue
    line="$(grep -E '^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_' "$f" 2>/dev/null | tail -1 || true)"
    key="${line#NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=}"
    key="${key%\"}"
    key="${key#\"}"
    if [[ "$key" == pk_* ]] && publishable_key_works "$key"; then
      echo "$key"
      return 0
    fi
  done
  while IFS= read -r f; do
    [[ -f "$f" ]] || continue
    line="$(grep -E '^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_' "$f" 2>/dev/null | tail -1 || true)"
    key="${line#NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=}"
    key="${key%\"}"
    key="${key#\"}"
    if [[ "$key" == pk_* ]] && publishable_key_works "$key"; then
      echo "$key"
      return 0
    fi
  done < <(grep -rl --include='.env*' 'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_' /opt /home /var/www 2>/dev/null | grep -v "$DEPLOY_DIR" | head -20 || true)
  return 1
}

publishable_key_works() {
  local key="$1" code
  code="$(curl -sS -o /tmp/tradnest-regions.json -w '%{http_code}' \
    -H "x-publishable-api-key: ${key}" \
    "http://127.0.0.1:${API_PORT}/store/regions" || echo 000)"
  [[ "$code" == "200" ]]
}

create_publishable_key() {
  local out key
  log "Creating a new publishable API key via Medusa (DB token is hashed; only create returns pk_)"
  out="$(cd "$DEPLOY_DIR/apps/api" && bunx medusa exec ./src/scripts/ensure-publishable-key.ts 2>&1)" || {
    echo "$out" >&2
    return 1
  }
  echo "$out" >&2
  key="$(printf '%s\n' "$out" | sed -n 's/.*TRADNEST_PUBLISHABLE_KEY=//p' | tail -1 | tr -d '[:space:]')"
  if [[ "$key" != pk_* ]]; then
    echo "ensure-publishable-key.ts did not print a pk_ token" >&2
    return 1
  fi
  echo "$key"
}

ensure_storefront_publishable_key() {
  local key=""
  mkdir -p "$DEPLOY_DIR/apps/storefront"
  touch "$DEPLOY_DIR/apps/storefront/.env"
  if key="$(find_publishable_key)"; then
    log "Existing publishable key works against /store/regions (${key:0:12}…)"
  elif key="$(create_publishable_key)"; then
    log "Created publishable key (${key:0:12}…)"
  else
    echo "Could not obtain a working Medusa publishable API key." >&2
    exit 1
  fi
  upsert "$DEPLOY_DIR/apps/storefront/.env" NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY "$key"
  upsert "$DEPLOY_DIR/apps/storefront/.env" MEDUSA_BACKEND_URL "http://127.0.0.1:${API_PORT}"
  upsert "$DEPLOY_DIR/apps/storefront/.env" NEXT_PUBLIC_BASE_URL "$PUBLIC_ORIGIN"
  upsert "$DEPLOY_DIR/apps/storefront/.env" NEXT_PUBLIC_DEFAULT_REGION il
  upsert "$DEPLOY_DIR/apps/storefront/.env" NEXT_PUBLIC_SITE_NAME "טרדנסט"
  upsert "$DEPLOY_DIR/apps/storefront/.env" NEXT_PUBLIC_VENDOR_URL "${PUBLIC_ORIGIN}/seller"
}

install_nginx_vhost() {
  log "Backing up nginx and installing Tradnest vhost (only enabled site on :80)"
  BACKUP="/etc/nginx/tradnest-backup-$(date +%Y%m%d%H%M%S)"
  mkdir -p "$BACKUP"
  cp -a /etc/nginx/sites-enabled "$BACKUP/" 2>/dev/null || true
  cp -a /etc/nginx/conf.d "$BACKUP/" 2>/dev/null || true

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

  location /cloud {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Cookie \$http_cookie;
  }

  location /admin {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Cookie \$http_cookie;
  }

  location /auth {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Cookie \$http_cookie;
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

  location /vendor {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Cookie \$http_cookie;
  }

  location /seller/ {
    proxy_pass http://127.0.0.1:$VENDOR_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location = /seller {
    proxy_pass http://127.0.0.1:$VENDOR_PORT/seller/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /app {
    proxy_pass http://127.0.0.1:$API_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Cookie \$http_cookie;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location / {
    proxy_pass http://127.0.0.1:$STORE_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-Host \$host;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX

  # Duplicate default_server comes from the previous b2b-starter site still
  # enabled next to tradnest. Clear sites-enabled, then enable only Tradnest.
  find /etc/nginx/sites-enabled -mindepth 1 -delete
  ln -sfn /etc/nginx/sites-available/tradnest /etc/nginx/sites-enabled/tradnest

  shopt -s nullglob
  for f in /etc/nginx/conf.d/*.conf; do
    if grep -Eq 'listen[[:space:]]+\[?::\]?:?80.*default_server|listen[[:space:]]+80.*default_server' "$f"; then
      log "Disabling $f (also default_server on :80)"
      mv "$f" "${f}.tradnest-disabled"
    fi
  done
  shopt -u nullglob

  if nginx -t; then
    systemctl reload nginx
    log "nginx reloaded"
  else
    log "nginx -t failed — restoring $BACKUP"
    find /etc/nginx/sites-enabled -mindepth 1 -delete
    cp -a "$BACKUP/sites-enabled/." /etc/nginx/sites-enabled/ 2>/dev/null || true
    for f in /etc/nginx/conf.d/*.tradnest-disabled; do
      [[ -f "$f" ]] || continue
      mv "$f" "${f%.tradnest-disabled}"
    done
    nginx -t && systemctl reload nginx
    exit 1
  fi
}

write_storefront_unit() {
  local bun_bin
  bun_bin="$(command -v bun 2>/dev/null || true)"
  [[ -n "$bun_bin" ]] || bun_bin="/root/.bun/bin/bun"
  [[ -x "$bun_bin" ]] || bun_bin="/home/ubuntu/.bun/bin/bun"
  log "Writing tradnest-storefront.service (bun=$bun_bin)"
  cat >/etc/systemd/system/tradnest-storefront.service <<EOF
[Unit]
Description=Tradnest B2B storefront
After=network.target tradnest-api.service

[Service]
Type=simple
WorkingDirectory=$DEPLOY_DIR/apps/storefront
EnvironmentFile=-$DEPLOY_DIR/apps/storefront/.env
Environment=NODE_ENV=production
Environment=PORT=$STORE_PORT
Environment=PATH=/usr/local/bin:/root/.bun/bin:/home/ubuntu/.bun/bin:/usr/bin:/bin
ExecStart=$bun_bin x next start -H 127.0.0.1 -p $STORE_PORT
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/tradnest-storefront.log
StandardError=append:/var/log/tradnest-storefront.err.log

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
  systemctl enable tradnest-storefront >/dev/null
  systemctl restart tradnest-storefront
}

build_vendor_spa() {
  # tsup DTS workers OOM on the 2–4GB EC2 box after ESM succeeds.
  # The SPA only needs JS + CSS; skip declaration emit on deploy.
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
  log "Build vendor package JS only (skip DTS; HEAD=$(git -C "$DEPLOY_DIR" rev-parse --short HEAD))"
  ( cd "$DEPLOY_DIR" && bunx turbo run build --filter=@mercurjs/vendor^... )
  ( cd "$DEPLOY_DIR/packages/vendor" && TSUP_DTS=0 bunx tsup && bun run generate:targets )
  log "Build vendor SPA at /seller/"
  ( cd "$DEPLOY_DIR/apps/vendor" && \
    VITE_MERCUR_BACKEND_URL="$PUBLIC_ORIGIN" VITE_VENDOR_BASE=/seller/ bun run build )
}

write_vendor_unit() {
  local bun_bin
  bun_bin="$(command -v bun 2>/dev/null || true)"
  [[ -n "$bun_bin" ]] || bun_bin="/root/.bun/bin/bun"
  [[ -x "$bun_bin" ]] || bun_bin="/home/ubuntu/.bun/bin/bun"
  log "Writing tradnest-vendor.service (bun=$bun_bin port=$VENDOR_PORT)"
  cat >/etc/systemd/system/tradnest-vendor.service <<EOF
[Unit]
Description=Tradnest vendor panel
After=network.target tradnest-api.service

[Service]
Type=simple
WorkingDirectory=$DEPLOY_DIR/apps/vendor
Environment=NODE_ENV=production
Environment=PATH=/usr/local/bin:/root/.bun/bin:/home/ubuntu/.bun/bin:/usr/bin:/bin
ExecStart=$bun_bin x vite preview --host 127.0.0.1 --port $VENDOR_PORT --strictPort
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/tradnest-vendor.log
StandardError=append:/var/log/tradnest-vendor.err.log

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
  systemctl enable tradnest-vendor >/dev/null
  systemctl restart tradnest-vendor
}

health_check() {
  log "Health checks"
  local ok=0 i
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
  ok=0
  for i in $(seq 1 20); do
    if curl -fsS -o /dev/null "http://127.0.0.1:${STORE_PORT}/" 2>/dev/null; then
      ok=1
      break
    fi
    sleep 2
  done
  if [[ "$ok" -ne 1 ]]; then
    log "Storefront not listening on :$STORE_PORT"
    systemctl status tradnest-storefront --no-pager || true
    journalctl -u tradnest-storefront -n 80 --no-pager || true
    tail -n 80 /var/log/tradnest-storefront.err.log || true
    ls -la "$DEPLOY_DIR/apps/storefront/.next" 2>/dev/null | head || log "missing $DEPLOY_DIR/apps/storefront/.next"
    exit 1
  fi
  ok=0
  for i in $(seq 1 20); do
    if curl -fsS -o /dev/null "http://127.0.0.1:${VENDOR_PORT}/seller/" 2>/dev/null; then
      ok=1
      break
    fi
    sleep 2
  done
  if [[ "$ok" -ne 1 ]]; then
    log "Vendor panel not listening on :$VENDOR_PORT/seller/"
    systemctl status tradnest-vendor --no-pager || true
    journalctl -u tradnest-vendor -n 80 --no-pager || true
    tail -n 80 /var/log/tradnest-vendor.err.log || true
    exit 1
  fi
  curl -fsS "http://127.0.0.1:${API_PORT}/health"
  echo
  log "Cutover complete"
  echo "API:        $PUBLIC_ORIGIN/health"
  echo "Storefront: $PUBLIC_ORIGIN/"
  echo "Admin:      $PUBLIC_ORIGIN/app"
  echo "Vendor:     $PUBLIC_ORIGIN/seller"
  echo "HEAD: $(git -C "$DEPLOY_DIR" rev-parse --short HEAD)"
}

ORIGIN_HOST="${PUBLIC_ORIGIN#http://}"
ORIGIN_HOST="${ORIGIN_HOST#https://}"
ORIGIN_HOST="${ORIGIN_HOST%/}"

if [[ "${TRADNEST_STEP:-}" == "nginx" ]]; then
  log "nginx-only switch (no full monorepo rebuild)"
  ensure_http_session_cookies
  log "Restart API so HTTP session cookies / admin.disable from this tree are loaded"
  systemctl restart tradnest-api || true
  sleep 8
  ensure_storefront_publishable_key
  build_vendor_spa
  write_vendor_unit
  log "Rebuild storefront so NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY and vendor CTA URL are inlined"
  ( cd "$DEPLOY_DIR/apps/storefront" && bun run build )
  write_storefront_unit
  sleep 6
  install_nginx_vhost
  verify_admin_session_cookie
  health_check
  exit 0
fi

if [[ "${TRADNEST_STEP:-}" == "seed" ]]; then
  log "Ensuring Medusa /app admin user"
  ( cd "$DEPLOY_DIR/apps/api" && bunx medusa exec ./src/scripts/ensure-admin-user.ts )
  ensure_http_session_cookies
  log "Restart API so session cookies work on HTTP /app"
  systemctl restart tradnest-api || true
  sleep 8
  verify_admin_session_cookie
  log "Seeding Israel / Hebrew demo catalog"
  ( cd "$DEPLOY_DIR/apps/api" && bunx medusa exec ./src/scripts/seed-israel-he.ts )
  exit 0
fi

log "Discovering existing DATABASE_URL"
OLD_ENV=""
if OLD_ENV="$(find_env_file)"; then
  log "Using credentials from $OLD_ENV"
else
  log "No existing .env with DATABASE_URL found"
fi

API_ENV="$DEPLOY_DIR/apps/api/.env"
STORE_ENV="$DEPLOY_DIR/apps/storefront/.env"

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
ensure_http_session_cookies

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
upsert "$STORE_ENV" NEXT_PUBLIC_DEFAULT_REGION il
upsert "$STORE_ENV" NEXT_PUBLIC_SITE_NAME Tradnest
upsert "$STORE_ENV" NEXT_PUBLIC_SITE_DESCRIPTION "Tradnest B2B wholesale marketplace"
upsert "$STORE_ENV" NEXT_PUBLIC_VENDOR_URL "${PUBLIC_ORIGIN}/seller"
upsert "$STORE_ENV" REVALIDATE_SECRET "$(grep -E '^STOREFRONT_REVALIDATE_SECRET=' "$API_ENV" | cut -d= -f2- || echo supersecret)"
ensure_storefront_publishable_key

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=3072}"

log "bun install (monorepo)"
cd "$DEPLOY_DIR"
bun install

log "Build workspace packages (cli before core, plus storefront deps)"
cd "$DEPLOY_DIR"
bunx turbo run build --filter=@mercurjs/core... --filter=@mercurjs/storefront... --filter=@mercurjs/client...
build_vendor_spa

log "Medusa migrate (skip interactive link prompts; do not drop b2b-starter link tables)"
cd "$DEPLOY_DIR/apps/api"
# The live DB is b2b-starter (company/approval/cart links). Mercur does not
# define those links; an unattended "select all" would DELETE them.
# --skip-links runs module migrations only (including quote_request).
# --execute-safe then creates Mercur's new link tables and ignores deletes.
bunx medusa db:migrate --skip-links
bunx medusa db:sync-links --execute-safe

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
ExecStartPre=/bin/bash $DEPLOY_DIR/scripts/patch-medusa-session-cookie.sh $DEPLOY_DIR
ExecStart=$BUN_BIN run start
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/tradnest-api.log
StandardError=append:/var/log/tradnest-api.err.log

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
systemctl enable tradnest-api
systemctl restart tradnest-api
sleep 5
write_storefront_unit
write_vendor_unit

install_nginx_vhost
verify_admin_session_cookie
health_check
