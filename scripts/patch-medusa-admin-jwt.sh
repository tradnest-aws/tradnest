#!/usr/bin/env bash
# The prebuilt Medusa /app dashboard hardcodes JS SDK auth type "session".
# On HTTP that never persists connect.sid, so switch those bundles to JWT.
set -euo pipefail

ROOT="${1:-${TRADNEST_DEPLOY_DIR:-/opt/tradnest}}"
patched=0

while IFS= read -r -d '' f; do
  if grep -q 'wje="session"\|auth:{type:"session"}' "$f"; then
    sed -i 's/wje="session"/wje="jwt"/g; s/auth:{type:"session"}/auth:{type:"jwt"}/g' "$f"
    echo "patched admin jwt: $f"
    patched=$((patched + 1))
  fi
done < <(find "$ROOT" \
  \( -path '*/.medusa/*' -o -path '*/@medusajs/dashboard/*' -o -path '*/public/admin/*' \) \
  -name '*.js' -print0 2>/dev/null || true)

echo "admin jwt patches: $patched"
exit 0
