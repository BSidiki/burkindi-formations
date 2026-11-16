const withPWA = (cfg) => cfg; // brancher next-pwa / Workbox ici
module.exports = withPWA({ transpilePackages: ['@burkindi/ui', '@burkindi/shared-types'] });
