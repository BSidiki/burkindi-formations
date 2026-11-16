// Montants de démonstration lus dans le prototype : à confirmer avant mise en ligne (voir packages/config).
export const TARIFS = { DIRECT: 10000, PROFESSIONNEL: 15000 } as const;
export const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '22600000000',
  orange: process.env.NEXT_PUBLIC_PAY_ORANGE ?? '+226 00 00 00 00',
  moov: process.env.NEXT_PUBLIC_PAY_MOOV ?? '+226 00 00 00 00',
};
export const NIVEAU_LABEL: Record<string, string> = {
  CEP: 'CEP', BEPC: 'BEPC', BAC: 'Baccalauréat', LICENCE: 'Licence', MASTER: 'Master / Maîtrise',
  CAT_A: 'Catégorie A', CAT_B: 'Catégorie B', CAT_C: 'Catégorie C', CAT_D: 'Catégorie D',
};
