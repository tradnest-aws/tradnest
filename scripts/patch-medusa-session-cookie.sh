#!/usr/bin/env bash
# Medusa 2.18 defaults production session cookies to Secure. Behind HTTP nginx
# that means POST /auth/session returns 200 with no Set-Cookie, then
# GET /admin/users/me is 401. cookieOptions should override; this patches the
# hardcoded default so a missed config merge cannot leave /app unusable.
set -euo pipefail

ROOT="${1:-${TRADNEST_DEPLOY_DIR:-/opt/tradnest}}"
MARKER="secure: process.env.COOKIE_SECURE === \"true\""
OLD='return { sameSite: "lax", secure: true };'
NEW="return { sameSite: \"lax\", ${MARKER} };"

patched=0
found=0
while IFS= read -r -d '' f; do
  found=1
  if grep -Fq "$MARKER" "$f"; then
    echo "already patched: $f"
    continue
  fi
  if grep -Fq "$OLD" "$f"; then
    sed -i "s|${OLD}|${NEW}|" "$f"
    echo "patched: $f"
    patched=$((patched + 1))
    continue
  fi
  echo "unrecognized express-loader (left unchanged): $f"
done < <(find "$ROOT/node_modules/@medusajs/framework" \
  "$ROOT/apps/api/node_modules/@medusajs/framework" \
  -name express-loader.js -print0 2>/dev/null || true)

if [[ "$found" -eq 0 ]]; then
  echo "no @medusajs/framework express-loader.js under $ROOT"
fi
exit 0
