#!/usr/bin/env bash
# Add missing product_id columns that make GET /admin/products 400.
# Uses psql + DATABASE_URL (no Node `pg` package).
# Usage: ensure-product-id-columns.sh /path/to/apps/api/.env
set -euo pipefail

ENV_FILE="${1:-}"
if [[ -z "$ENV_FILE" || ! -f "$ENV_FILE" ]]; then
  echo "Usage: $0 /path/to/apps/api/.env" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SQL_FILE="$ROOT/scripts/ensure-product-id-columns.sql"
if [[ ! -f "$SQL_FILE" ]]; then
  echo "Missing $SQL_FILE" >&2
  exit 1
fi

DATABASE_URL="$(python3 - "$ENV_FILE" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
for line in path.read_text().splitlines():
    if line.startswith("DATABASE_URL="):
        value = line.split("=", 1)[1].strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        print(value)
        break
else:
    raise SystemExit("DATABASE_URL missing in " + str(path))
PY
)"
export DATABASE_URL

echo "ensure-product-id-columns: using $(python3 - <<'PY'
import os
from urllib.parse import urlparse
u = urlparse(os.environ["DATABASE_URL"])
print(f"{u.hostname}:{u.port or 5432}/{u.path.lstrip('/')}")
PY
)"

if ! command -v psql >/dev/null 2>&1; then
  echo "ensure-product-id-columns: installing postgresql-client"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y postgresql-client
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
echo "ensure-product-id-columns: SQL applied"
