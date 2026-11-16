#!/usr/bin/env bash
# Restauration : ./scripts/restore.sh /var/backups/burkindi/db-AAAA-MM-JJ.sql.gz
set -euo pipefail
[ -f "${1:-}" ] || { echo "Usage : $0 fichier.sql.gz"; exit 1; }
cd /opt/burkindi
read -r -p "Cette opération REMPLACE la base actuelle. Taper OUI pour continuer : " a; [ "$a" = OUI ] || exit 1
docker compose exec -T postgres psql -U burkindi -d postgres -c "DROP DATABASE IF EXISTS burkindi;" -c "CREATE DATABASE burkindi;"
gunzip -c "$1" | docker compose exec -T postgres psql -U burkindi -d burkindi
docker compose restart api
