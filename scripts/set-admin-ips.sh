#!/usr/bin/env bash
# Change les IP autorisées pour le back-office : sudo ./scripts/set-admin-ips.sh "41.xx.xx.xx,196.xx.xx.xx"
set -euo pipefail
[ -n "${1:-}" ] || { echo "Usage : $0 \"ip1,ip2\""; exit 1; }
cd /opt/burkindi
sed -i "s|^ADMIN_ALLOWED_IPS=.*|ADMIN_ALLOWED_IPS=$1|" .env
docker compose up -d api
echo "IP autorisées : $1"
