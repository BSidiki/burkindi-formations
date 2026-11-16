# Installation de BURKINDI Formations

## A. Sur le serveur (administrateur)

**Pré-requis** : un VPS Ubuntu 24.04 vierge (4 Go de RAM minimum ; 16 à 32 Go pour 5 000 utilisateurs simultanés),
un nom de domaine dont l'enregistrement DNS **A** pointe vers l'IP du serveur (sans proxy Cloudflare).

```bash
scp burkindi-formations.zip root@IP_DU_SERVEUR:/root/
ssh root@IP_DU_SERVEUR
apt-get update && apt-get install -y unzip
unzip burkindi-formations.zip && cd burkindi-formations
sudo ./install.sh
```

L'installeur : met à jour le système, installe Docker, Nginx, Let's Encrypt, le pare-feu (UFW) et Fail2ban ; génère tous
les secrets ; construit et démarre l'application ; crée le compte administrateur avec 2FA (QR code affiché) ; active
HTTPS ; programme une sauvegarde chaque nuit à 02 h. Les identifiants sont enregistrés dans `/root/burkindi-installation.txt`.

Mode non interactif :
`sudo ./install.sh --domain burkindi.bf --email contact@burkindi.bf --admin-email admin@burkindi.bf --admin-ips 41.2.3.4 --yes`

| Opération | Commande |
|---|---|
| Mettre à jour le code | `sudo /opt/burkindi/install.sh --update` |
| Changer les IP autorisées du back-office | `sudo /opt/burkindi/scripts/set-admin-ips.sh "ip1,ip2"` |
| Sauvegarde manuelle | `sudo /opt/burkindi/scripts/backup.sh` |
| Restaurer une sauvegarde | `sudo /opt/burkindi/scripts/restore.sh /var/backups/burkindi/db-AAAA-MM-JJ.sql.gz` |
| Voir les journaux | `cd /opt/burkindi && docker compose logs -f api` |

## B. Sur le téléphone de l'apprenant (PWA)

- **Android (Chrome)** : bouton « 📲 Installer l'application » sur l'accueil, ou menu ⋮ puis « Installer l'application ».
- **iPhone (Safari)** : Partager puis « Sur l'écran d'accueil ».

Un fichier APK (Google Play ou installation directe) n'est pas inclus : c'est l'option C du devis.

## C. Aperçu de l'interface sans serveur

Voir `docs/DESIGN_SYSTEM.md` (section « Aperçu sans serveur »).

## D. À renseigner après l'installation

`/opt/burkindi/.env` : `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_PAY_ORANGE`, `NEXT_PUBLIC_PAY_MOOV` (numéros affichés à l'inscription). Après modification : `cd /opt/burkindi && docker compose up -d --build web`.
