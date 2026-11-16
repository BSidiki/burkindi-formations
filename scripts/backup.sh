#!/usr/bin/env bash
# Sauvegarde quotidienne de PostgreSQL (14 jours conservés)
set -euo pipefail
cd /opt/burkindi
mkdir -p /var/backups/burkindi
docker compose exec -T postgres pg_dump -U burkindi burkindi | gzip > "/var/backups/burkindi/db-$(date +%F).sql.gz"
find /var/backups/burkindi -name 'db-*.sql.gz' -mtime +14 -delete
