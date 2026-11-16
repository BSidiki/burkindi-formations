// Affiche le code 2FA courant de l'administrateur local (secret lu dans .env).
const { authenticator } = require('otplib');
const secret = process.env.SEED_ADMIN_TOTP_SECRET;
if (!secret) { console.error('SEED_ADMIN_TOTP_SECRET est vide dans .env'); process.exit(1); }
console.log('Code 2FA administrateur (valable 30 secondes) :', authenticator.generate(secret));
