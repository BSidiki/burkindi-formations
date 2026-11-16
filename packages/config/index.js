// Valeurs issues du prototype HTML : à confirmer avant mise en production.
module.exports = {
  referralRate: Number(process.env.REFERRAL_RATE ?? 0.15),   // 15 % du montant payé par le filleul
  loginMaxAttempts: Number(process.env.LOGIN_MAX_ATTEMPTS ?? 3),
  subscriptionPrice: { DIRECT: 10000, PROFESSIONNEL: 15000 }, // FCFA (montants de démonstration)
  withdrawal: { min: 2000, step: 500 },                       // FCFA
  deviceChangesBeforeSuspension: 3,                           // par mois
  offlineQuotaMb: 100,
};
