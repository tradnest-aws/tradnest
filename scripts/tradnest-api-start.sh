#!/usr/bin/env bash
# systemd ExecStart for tradnest-api. Prefer a Medusa production build;
# otherwise run develop so vendor/store routes load without a 2GB-killing
# `medusa build` on the EC2 box.
set -euo pipefail

ROOT="${TRADNEST_DEPLOY_DIR:-/opt/tradnest}"
API="$ROOT/apps/api"
export PATH="/usr/local/bin:/root/.bun/bin:/home/ubuntu/.bun/bin:/usr/bin:/bin:${PATH}"

if ! command -v bun >/dev/null; then
  echo "bun not on PATH" >&2
  exit 127
fi

cd "$API"

ADMIN_INDEX="$API/.medusa/server/public/admin/index.html"
if [[ -f "$ADMIN_INDEX" ]]; then
  echo "Starting Medusa production server from $API/.medusa/server"
  cd "$API/.medusa/server"
  if [[ ! -f .env && -f "$API/.env" ]]; then
    cp "$API/.env" .env
  fi
  if [[ ! -e node_modules ]]; then
    ln -sfn "$API/node_modules" node_modules
  fi
  export NODE_ENV=production
  exec bun run start
fi

echo "No $ADMIN_INDEX — starting medusa develop (NODE_ENV=development)"
export NODE_ENV=development
exec bun x medusa develop
