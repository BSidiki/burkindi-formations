# Alignement du monorepo sur le prototype HTML (v1.1)

Source : « Plateforme_Web_de_Formation__Proposition_Technique_et_Fina_2.html » (prototype interactif).

| Élément du prototype | Implémentation dans le monorepo |
|---|---|
| 2 profils RBAC (APPRENANT / ADMIN), portails cloisonnés | `Role`, `RolesGuard`, `/apprenant/*` et `/admin-portal/*`, `middleware.ts` |
| Voies Direct / Professionnel, niveaux CEP→Master, Cat. A→D, concours multiples | `Voie`, `User.niveau`, modèle `Concours`, page `/inscription` |
| Statuts ACTIF / EN_ATTENTE / SUSPENDU | `AccountStatus` |
| Argon2id | `argon2` (`auth.service.ts`, `seed.ts`) |
| Access JWT + Refresh HttpOnly | cookies `access` (15 min) et `refresh` (rotatif, jti dans Redis) |
| Admin : IP whitelist + 2FA TOTP + FIDO2 | `IpWhitelistGuard`, `otplib` ; FIDO2 = point d'extension (`fido.service.ts`) |
| Session unique + device hash, suspension au 3e changement/mois | `SessionsService`, `FORCE_LOGOUT` (WebSocket authentifié par cookie) |
| Anti-triche : perte de focus, anti-copie, `security_logs` | `useExamGuard`, `POST /exams/focus-loss`, `SecurityLog` |
| QCM : révision libre / examen blanc chronométré, copie via BullMQ | `ExamsController`, queue `copies`, `CopiesProcessor` |
| Signalement contextuel, relances, édition QCM + note publique | `FeedbacksController`, `PATCH /admin/questions/:id` |
| Paiement WhatsApp validé en 1 clic + ristourne 15 % | `PaymentsService.validate` (transaction) |
| Parrainage `BURK-XXXX`, retrait Orange/Moov (min 2 000 FCFA, pas de 500) | `WithdrawalsController` (débit atomique) |
| Hors ligne PWA, Dexie, AES-GCM, quota 100 Mo, file de synchronisation | `lib/offline/*` |
| Bibliothèque & annales (Cloudflare R2), assistance | `LibraryController` (URL présignée R2 à brancher) |
| Export Excel | `GET /admin/students/export.xlsx` (vrai .xlsx, le prototype produit un CSV) |

## À confirmer / limites connues
- Tarifs (10 000 FCFA Direct, 15 000 FCFA Pro) : valeurs de démonstration lues dans le prototype, à valider (`packages/config`).
- FIDO2/WebAuthn : non implémenté (flag `FIDO_ENFORCE`).
- `FLAG_SECURE` n'existe que dans une application Android native ; le web ne peut pas empêcher les captures d'écran.
- Le prototype ne contient pas de partie « financière » (devis, coûts d'hébergement) : seuls des montants de démonstration y figurent.
- URL présignées R2, intégration WhatsApp Business et paiement Mobile Money automatisé : à brancher.
- Le code TypeScript de l'API compile, hors types Prisma (client non généré sans accès réseau) ; migrations non exécutées.
