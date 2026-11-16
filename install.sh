#!/usr/bin/env bash
# =============================================================================
#  Installeur BURKINDI Formations — Ubuntu 24.04 LTS (VPS vierge)
#
#  Usage :
#    sudo ./install.sh                         assistant interactif
#    sudo ./install.sh --domain exemple.bf --email moi@exemple.bf \
#         --admin-email admin@exemple.bf --admin-ips 41.2.3.4 --yes
#    sudo ./install.sh --update                met à jour le code déjà installé
#
#  Pré-requis : un nom de domaine dont l'enregistrement DNS (type A) pointe
#  vers l'IP du serveur. N'activez pas le proxy Cloudflare (nuage orange).
# =============================================================================
set -Eeuo pipefail

INSTALL_DIR=/opt/burkindi
LOG=/var/log/burkindi-install.log
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN=""; EMAIL=""; ADMIN_EMAIL=""; ADMIN_IPS=""; WHATSAPP=""; PAY_ORANGE=""; PAY_MOOV=""; ASSUME_YES=0; UPDATE=0

c_ok=$'\e[32m'; c_warn=$'\e[33m'; c_err=$'\e[31m'; c_off=$'\e[0m'
say()  { printf '%s==>%s %s\n' "$c_ok" "$c_off" "$*"; }
warn() { printf '%s!!%s  %s\n' "$c_warn" "$c_off" "$*"; }
die()  { printf '%sERREUR%s %s\n' "$c_err" "$c_off" "$*" >&2; exit 1; }
trap 'die "Échec à la ligne $LINENO (journal : $LOG)"' ERR

while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN=$2; shift 2;;
    --email) EMAIL=$2; shift 2;;
    --admin-email) ADMIN_EMAIL=$2; shift 2;;
    --admin-ips) ADMIN_IPS=$2; shift 2;;
    --whatsapp) WHATSAPP=$2; shift 2;;
    --orange) PAY_ORANGE=$2; shift 2;;
    --moov) PAY_MOOV=$2; shift 2;;
    --yes|-y) ASSUME_YES=1; shift;;
    --update) UPDATE=1; shift;;
    -h|--help) sed -n '2,14p' "$0"; exit 0;;
    *) die "Option inconnue : $1";;
  esac
done

[ "$(id -u)" -eq 0 ] || die "Lancez l'installeur avec sudo."
mkdir -p "$(dirname "$LOG")"; exec > >(tee -a "$LOG") 2>&1

ask() {   # ask VARIABLE "Question" "valeur par défaut"
  local var=$1 q=$2 def=${3:-} val
  [ -z "${!var}" ] || return 0
  if [ "$ASSUME_YES" -eq 1 ]; then
    [ -n "$def" ] || die "Paramètre manquant : $q"
    printf -v "$var" '%s' "$def"; return 0
  fi
  read -r -p "$q${def:+ [$def]} : " val
  printf -v "$var" '%s' "${val:-$def}"
  [ -n "${!var}" ] || die "Valeur obligatoire : $q"
}

# ------------------------------------------------------------------ 0. contrôles
. /etc/os-release
[ "${ID:-}" = ubuntu ] || warn "Testé sur Ubuntu 24.04 ; système détecté : ${PRETTY_NAME:-inconnu}"
MEM_MB=$(awk '/MemTotal/{print int($2/1024)}' /proc/meminfo)
DISK_GB=$(df --output=avail -BG / | tail -1 | tr -dc '0-9')
[ "$MEM_MB" -ge 3500 ] || warn "RAM : ${MEM_MB} Mo. 4 Go minimum ; 16 à 32 Go conseillés pour 5 000 utilisateurs simultanés."
[ "$DISK_GB" -ge 20 ] || warn "Espace disque libre : ${DISK_GB} Go. 20 Go minimum."

sync_code() {
  mkdir -p "$INSTALL_DIR"
  if [ "$SRC_DIR" != "$INSTALL_DIR" ]; then
    rsync -a --delete --exclude node_modules --exclude .next --exclude dist --exclude .env --exclude '*.zip' "$SRC_DIR"/ "$INSTALL_DIR"/
  fi
  cd "$INSTALL_DIR"
}

wait_api() {
  say "Attente du démarrage de l'API…"
  for _ in $(seq 1 90); do
    curl -fsS http://127.0.0.1:4000/health >/dev/null 2>&1 && { say "API opérationnelle."; return 0; }
    sleep 2
  done
  docker compose logs --tail=40 api || true
  die "L'API ne répond pas après 3 minutes."
}

migrate_db() {
  if ls apps/api/prisma/migrations/*/migration.sql >/dev/null 2>&1; then
    docker compose exec -T -w /app/apps/api api npx prisma migrate deploy
  else
    warn "Aucune migration versionnée : synchronisation directe du schéma (prisma db push)."
    docker compose exec -T -w /app/apps/api api npx prisma db push --skip-generate
  fi
}

# ------------------------------------------------------------------ mode mise à jour
if [ "$UPDATE" -eq 1 ]; then
  [ -f "$INSTALL_DIR/.env" ] || die "Aucune installation trouvée dans $INSTALL_DIR."
  command -v rsync >/dev/null || apt-get install -y rsync
  say "Mise à jour du code…"; sync_code
  "$INSTALL_DIR/scripts/backup.sh" || warn "Sauvegarde préalable impossible."
  docker compose up -d --build
  wait_api; migrate_db
  say "Mise à jour terminée."; exit 0
fi

# ------------------------------------------------------------------ 1. questions
say "Installation de BURKINDI Formations"
FIRST_IP="${SSH_CLIENT%% *}"
ask DOMAIN "Nom de domaine (ex. burkindi.bf)" ""
ask EMAIL "E-mail pour le certificat SSL et les alertes" ""
ask ADMIN_EMAIL "E-mail du compte administrateur" "$EMAIL"
ask ADMIN_IPS "IP autorisées pour le back-office (séparées par des virgules)" "${FIRST_IP:-127.0.0.1}"
if [ "$ASSUME_YES" -eq 0 ]; then
  [ -n "$WHATSAPP" ] || read -r -p "Numéro WhatsApp de contact, format international sans + (ex. 22670000000) [vide = à renseigner plus tard] : " WHATSAPP
  [ -n "$PAY_ORANGE" ] || read -r -p "Numéro Orange Money qui reçoit les paiements [vide = plus tard] : " PAY_ORANGE
  [ -n "$PAY_MOOV" ] || read -r -p "Numéro Moov Money qui reçoit les paiements [vide = plus tard] : " PAY_MOOV
fi
WHATSAPP="${WHATSAPP:-22600000000}"; PAY_ORANGE="${PAY_ORANGE:-+226 00 00 00 00}"; PAY_MOOV="${PAY_MOOV:-+226 00 00 00 00}"
DOMAIN="${DOMAIN,,}"
[[ "$DOMAIN" =~ ^[a-z0-9.-]+\.[a-z]{2,}$ ]] || die "Nom de domaine invalide : $DOMAIN"
warn "Back-office limité aux IP : $ADMIN_IPS (modifiable ensuite : scripts/set-admin-ips.sh)"

# ------------------------------------------------------------------ 2. paquets système
say "Installation des paquets système…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg rsync ufw fail2ban nginx certbot python3-certbot-nginx \
  qrencode openssl docker.io docker-compose-v2 cron
systemctl enable --now docker nginx fail2ban cron

# ------------------------------------------------------------------ 3. pare-feu
SSH_PORT=$(sshd -T 2>/dev/null | awk '/^port /{print $2; exit}'); SSH_PORT=${SSH_PORT:-22}
say "Pare-feu : SSH ($SSH_PORT), HTTP, HTTPS."
ufw allow "${SSH_PORT}/tcp" >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

# ------------------------------------------------------------------ 4. code + .env
sync_code
FRESH=0
if [ -f .env ]; then
  warn ".env déjà présent : conservé (secrets inchangés)."
else
  FRESH=1
  PG_PASS=$(openssl rand -hex 24)
  cat > .env <<ENVEOF
# Généré par install.sh le $(date -u +%FT%TZ) — NE PAS PARTAGER
POSTGRES_PASSWORD=$PG_PASS
DATABASE_URL=postgresql://burkindi:$PG_PASS@pgbouncer:6432/burkindi?pgbouncer=true
DIRECT_URL=postgresql://burkindi:$PG_PASS@postgres:5432/burkindi
REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
ACCESS_TTL=15m
REFRESH_TTL_DAYS=30
COOKIE_DOMAIN=
REFRESH_COOKIE_PATH=/api/auth/refresh
WEB_ORIGIN=https://$DOMAIN
ADMIN_ALLOWED_IPS=$ADMIN_IPS
LOGIN_MAX_ATTEMPTS=3
REFERRAL_RATE=0.15
FIDO_ENFORCE=false
R2_ENDPOINT=
R2_BUCKET=
R2_ACCESS_KEY=
R2_SECRET_KEY=
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
ALERT_WHATSAPP_TO=
ALERT_EMAIL_TO=$EMAIL
SMTP_URL=
NEXT_PUBLIC_WHATSAPP=$WHATSAPP
NEXT_PUBLIC_PAY_ORANGE=$PAY_ORANGE
NEXT_PUBLIC_PAY_MOOV=$PAY_MOOV
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_WS_URL=https://$DOMAIN
ENVEOF
  chmod 600 .env
fi

# ------------------------------------------------------------------ 5. build + démarrage
say "Construction et démarrage des services (5 à 10 minutes la première fois)…"
docker compose up -d --build
wait_api
migrate_db

# ------------------------------------------------------------------ 6. compte administrateur
SUMMARY=/root/burkindi-installation.txt
if [ "$FRESH" -eq 1 ]; then
  say "Création du compte administrateur…"
  ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-16)A1!"
  TOTP_SECRET=$(head -c 20 /dev/urandom | base32 | tr -d '=')
  docker compose exec -T -w /app/apps/api \
    -e "SEED_ADMIN_EMAIL=$ADMIN_EMAIL" -e "SEED_ADMIN_PASSWORD=$ADMIN_PASSWORD" -e "SEED_ADMIN_TOTP_SECRET=$TOTP_SECRET" \
    api npx ts-node prisma/seed.ts
  TOTP_URI="otpauth://totp/BURKINDI:${ADMIN_EMAIL//@/%40}?secret=${TOTP_SECRET}&issuer=BURKINDI"
  umask 077
  cat > "$SUMMARY" <<SUMEOF
BURKINDI Formations — installation du $(date '+%d/%m/%Y %H:%M')
Site apprenants   : https://$DOMAIN
Back-office       : https://$DOMAIN/admin-portal/login   (IP autorisées : $ADMIN_IPS)
Administrateur    : $ADMIN_EMAIL
Mot de passe      : $ADMIN_PASSWORD      (à changer / à conserver dans un gestionnaire de mots de passe)
Secret 2FA (TOTP) : $TOTP_SECRET
URI 2FA           : $TOTP_URI
Code source       : $INSTALL_DIR      Sauvegardes : /var/backups/burkindi (chaque nuit à 02 h)
Journal           : $LOG
SUMEOF
  umask 022
fi

# ------------------------------------------------------------------ 7. Nginx + SSL
say "Configuration de Nginx…"
rm -f /etc/nginx/sites-enabled/default
sed "s/example\.com/$DOMAIN/g" nginx.conf > /etc/nginx/sites-available/burkindi
ln -sf /etc/nginx/sites-available/burkindi /etc/nginx/sites-enabled/burkindi
nginx -t && systemctl reload nginx

PUBLIC_IP=$(curl -fsS -4 --max-time 8 https://api.ipify.org || true)
DNS_IP=$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}' || true)
SSL_OK=0
if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" = "$DNS_IP" ]; then
  say "Certificat SSL (Let's Encrypt)…"
  certbot --nginx -d "$DOMAIN" -m "$EMAIL" --agree-tos --no-eff-email --non-interactive --redirect && SSL_OK=1
else
  warn "Le DNS de $DOMAIN ($DNS_IP) ne pointe pas vers ce serveur ($PUBLIC_IP)."
  warn "Corrigez l'enregistrement A puis lancez : certbot --nginx -d $DOMAIN -m $EMAIL --agree-tos --redirect"
fi

# ------------------------------------------------------------------ 8. sauvegardes
echo "0 2 * * * root $INSTALL_DIR/scripts/backup.sh >>/var/log/burkindi-backup.log 2>&1" > /etc/cron.d/burkindi-backup
chmod 644 /etc/cron.d/burkindi-backup

# ------------------------------------------------------------------ 9. récapitulatif
echo
say "Installation terminée."
if [ "$FRESH" -eq 1 ]; then
  echo "  Site        : https://$DOMAIN"
  echo "  Back-office : https://$DOMAIN/admin-portal/login"
  echo "  Admin       : $ADMIN_EMAIL"
  echo "  Mot de passe: $ADMIN_PASSWORD"
  echo "  2FA : scannez ce QR code avec Google Authenticator / FreeOTP :"
  qrencode -t ANSIUTF8 "$TOTP_URI" || true
  echo "  Ces informations sont enregistrées dans $SUMMARY (lisible par root uniquement)."
fi
[ "$SSL_OK" -eq 1 ] || warn "HTTPS non activé : la connexion des comptes exige HTTPS (cookies sécurisés)."
echo "  Mise à jour : sudo $INSTALL_DIR/install.sh --update"
