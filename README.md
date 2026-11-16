# BURKINDI Formations — Version Finale Consolidée (v1.0.0)
> Slogan : « Votre réussite commence ici ! »

Dossier monorepo complet et unifié fusionnant l'ensemble des versions (v1 à v9).

### 🌟 Synthèse des Modules Intégrés :
1. **Architecture Monorepo & Performance** : Next.js 14, NestJS, PostgreSQL (PgBouncer), Redis, BullMQ (5 000 VUs simultanés, latence < 150 ms).
2. **Sécurité Rapprochée & Anti-Triche** :
   - Session unique matérielle par `device_hash` avec déconnexion WebSocket immédiate (`FORCE_LOGOUT`).
   - Filigrane dynamique répété (Nom, Tél, IP) et détection de perte de focus (`visibilitychange`).
   - Portails d'accès strictement cloisonnés (`/apprenant/login` vs `/admin-portal/login`).
   - IP Whitelisting (`ADMIN_ALLOWED_IPS`) + en-tête sécurisé + rate limiting (3 échecs max).
   - Système d'alertes instantanées (WhatsApp + E-mail) à l'équipe technique en cas de détection d'intrusion.
3. **PWA & Mode Hors Ligne** : IndexDB / Dexie.js pour composer sans réseau et synchroniser au retour du réseau.
4. **Parrainage & Retraits Mobile Money** : Code parrain (`BURK-xxxx`), 15% de ristourne et retraits Orange Money / Moov Money.
5. **Gestion Admin & Validation WhatsApp** : Tableau de bord complet, filtres candidats, export Excel (.xlsx) et validation manuelle en 1 clic.
6. **Hébergement VPS** : installeur `install.sh` (Ubuntu 24.04 LTS, voir `docs/INSTALLATION.md`) + proxy Nginx (`nginx.conf`).
