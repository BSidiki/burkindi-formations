# Système de design BURKINDI Formations

Planches : `docs/design/planche-1-marque-et-systeme.png`, `docs/design/planche-2-parcours-mobiles.png`.
Captures de chaque écran : `docs/design/ecrans/`. Code : `apps/web/src/styles/globals.css`.

## Idée directrice
- **La montée** : la flèche rouge du logo devient la progression du candidat (composant `Trajectory`) : ses notes forment la flèche, qui vise une étoile (l'objectif).
- **La feuille de concours** : les réponses d'un QCM se cochent dans des cases A, B, C, D, comme sur la copie papier ; la case cochée se remplit.

## Couleurs (extraites du logo)
| Rôle | Valeur | Usage | Contraste du texte associé |
|---|---|---|---|
| Or | #E4C048 | Bouton principal, accents (jamais en texte) | encre dessus : 9:1 |
| Rouge | #B03020 | Flèche, erreurs, actions risquées | blanc dessus : 6,4:1 |
| Vert | #0A7A3C | Bonne réponse, validé | 5,4:1 sur blanc |
| Encre | #2A2118 | Texte, bordures fortes | 15,8:1 sur blanc |
| Fond / surface | #F2F3F5 / #FFFFFF | Page / cartes | — |

## Typographie
Montserrat (titres, 800) : famille du logotype. Atkinson Hyperlegible (texte, 400/700) : lisibilité maximale. Les deux sont auto-hébergées (`@fontsource`), donc utilisables hors ligne.

## Règles
1. Mobile d'abord. Barre d'onglets en bas (5 entrées) sur téléphone, colonne à gauche dès 960 px.
2. Cibles tactiles de 52 px (44 px au minimum). Un bouton principal par écran.
3. L'état n'est jamais exprimé par la couleur seule : icône + texte (badges, bonnes et mauvaises réponses).
4. Messages d'erreur = ce qui s'est passé + quoi faire.
5. Mouvement limité à deux gestes (le tracé de la courbe, le « tampon » de la case cochée) ; coupé si `prefers-reduced-motion`.
6. Le filigrane (nom, téléphone, IP) reste discret (opacité 5,5 %) : dissuasif sans gêner la lecture.

## Assets de marque (`apps/web/public`)
`brand/logo.png`, `brand/mark.png` (fonds transparents, détourés du fichier fourni), `icons/*` (PWA, Apple, favicon).
Le fichier source est un JPG sur fond blanc : le détourage convient aux fonds clairs. Pour des fonds sombres ou l'impression, demander le logo vectoriel (SVG ou AI) au graphiste.

## Aperçu sans serveur (mode démo)
`npm install` puis `npm run build -w @burkindi/shared-types` puis `npm run demo -w @burkindi/web` : l'interface s'ouvre sur http://localhost:3000 avec des données fictives (compte « Awa Ouédraogo »). Pour le back-office : http://localhost:3000/admin-portal.

## À valider avec de vrais utilisateurs (5 candidats suffisent)
Compréhension de l'écran de paiement, lisibilité sur un téléphone d'entrée de gamme en plein soleil, repérage du bouton « Signaler un problème », perception de l'avertissement de sortie d'écran en examen blanc.
