export type Role = 'APPRENANT' | 'ADMIN';
export type AccountStatus = 'ACTIF' | 'EN_ATTENTE' | 'SUSPENDU';
export type Voie = 'DIRECT' | 'PROFESSIONNEL';
export type PaymentStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
export type Operator = 'ORANGE_MONEY' | 'MOOV_MONEY';
export type ExamMode = 'REVISION' | 'EXAMEN_BLANC';
export type SecurityEventType = 'FOCUS_LOST' | 'MULTI_DEVICE' | 'MULTI_DEVICE_BLOCKED' | 'LOGIN_BRUTE_FORCE' | 'ADMIN_IP_REFUSED' | 'ADMIN_2FA_FAILED';

export const NIVEAUX_DIRECT = ['CEP', 'BEPC', 'BAC', 'LICENCE', 'MASTER'] as const;
export const NIVEAUX_PRO = ['CAT_A', 'CAT_B', 'CAT_C', 'CAT_D'] as const;

export const WS_EVENTS = { FORCE_LOGOUT: 'FORCE_LOGOUT' } as const;
export const REFERRAL_PREFIX = 'BURK-';

export interface WatermarkInfo { name: string; phone: string; ip: string }
export interface MeResponse { id: string; role: Role; nom: string; prenom: string; voie?: Voie; watermark: WatermarkInfo }
