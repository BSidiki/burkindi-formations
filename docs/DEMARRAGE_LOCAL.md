# Démarrer BURKINDI Formations en local (branche `local-dev`)

Cette branche ajoute le nécessaire pour lancer le projet sur un poste de développement
(Windows, macOS ou Linux), sans nom de domaine ni serveur.

## Pré-requis

- Node.js 20.12 ou plus récent (`node -v`)
- Docker Desktop (pour PostgreSQL et Redis)
- Git

## Démarrage

```bash
git clone https://github.com/BSidiki/burkindi-formations
cd burkindi-formations
git checkout local-dev

npm install            # dépendances
npm run local:up       # PostgreSQL + Redis dans Docker
npm run local:setup    # crée .env, les tables et les données de démonstration
npm run dev            # API (port 4000) + site (port 3000)
```

Ouvrir ensuite <http://localhost:3000>. L'API répond sur <http://localhost:4000/health>.

## Comptes de démonstration

| Rôle | Adresse | Identifiant | Mot de passe |
|---|---|---|---|
| Apprenant | <http://localhost:3000/apprenant/login> | `+22670000001` | `Demo!2026` |
| Administrateur | <http://localhost:3000/admin-portal/login> | `admin@example.com` | `ChangeMe!2026` |

L'administrateur doit aussi saisir un code 2FA à 6 chiffres. Pour l'obtenir :

```bash
npm run local:totp
```

L'apprenant de démonstration dispose de 6 questions d'exemple (concours « Contrôleurs du Trésor »).

## Commandes utiles

| Commande | Effet |
|---|---|
| `npm run local:up` / `npm run local:down` | démarre / arrête PostgreSQL et Redis |
| `npm run local:db` | applique le schéma Prisma à la base locale (`prisma db push`) |
| `npm run local:seed` | recharge les concours, l'administrateur et les données de démonstration |
| `npm run local:totp` | affiche le code 2FA courant de l'administrateur |
| `npm run demo -w @burkindi/web` | aperçu de l'interface seule, sans API ni base (sous Windows : à lancer dans Git Bash) |

Pour repartir d'une base vide : `docker compose -f docker-compose.local.yml down -v`, puis `npm run local:up` et `npm run local:setup`.

## Sans Docker

Installer PostgreSQL 16 et Redis sur le poste, puis créer la base :

```sql
CREATE USER burkindi PASSWORD 'burkindi_local' CREATEDB;
CREATE DATABASE burkindi OWNER burkindi;
```

Lancer ensuite `npm run local:setup` puis `npm run dev`.

## Ce que cette branche change par rapport à `main`

- `docker-compose.local.yml` : PostgreSQL et Redis seuls, ports ouverts sur `127.0.0.1`.
- `.env.local.example` : configuration locale (copiée vers `.env` par `npm run local:setup`).
- `apps/web/.env.development` : adresse de l'API locale, lue uniquement par `next dev`.
- `apps/api/src/env.ts` : l'API charge le fichier `.env` de la racine s'il existe.
- `COOKIE_SECURE=false` : permet les cookies de session sur `http://localhost` (sécurisés par défaut ailleurs).
- `apps/api/prisma/seed.local.ts` : apprenant actif et questions d'exemple.
- Scripts `local:*` dans `package.json`.

## Limites connues

- Les valeurs de `.env.local.example` (mots de passe, secrets, secret 2FA) sont publiques : **ne jamais les utiliser en production**.
- Le dépôt ne contient pas de migrations Prisma : en local, les tables sont créées avec `prisma db push`.
- Le téléchargement des PDF (Cloudflare R2), les alertes WhatsApp / e-mail et FIDO2 ne sont pas configurés en local.
- Après 3 connexions depuis des navigateurs différents dans le mois, le compte apprenant est suspendu (règle anti-partage) :
  relancer `docker compose -f docker-compose.local.yml down -v` puis la mise en place pour repartir de zéro.

## Dépannage

- **`P1001: Can't reach database server`** : PostgreSQL n'est pas démarré. Ouvrir Docker Desktop, attendre qu'il soit prêt,
  lancer `npm run local:up`, puis vérifier avec `docker ps` que `postgres` et `redis` sont listés. Relancer ensuite `npm run local:setup`.
- **Un fichier `.env` existe déjà** : `npm run local:setup` le conserve. Pour reprendre la configuration locale à jour,
  supprimer `.env` puis relancer `npm run local:setup`.
- **Le port 5432 ou 6379 est déjà utilisé** : un PostgreSQL ou un Redis tourne déjà sur le poste. L'arrêter, ou utiliser
  la section « Sans Docker ».
