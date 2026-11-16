import type { ReactNode } from 'react';
import { ICheck, IClock, IX, IAlert, IInfo } from './Icons';

export function StatutBadge({ statut }: { statut: string }) {
  const m: Record<string, [string, string, ReactNode]> = {
    ACTIF: ['badge-ok', 'Actif', <ICheck size={14} key="i" />], VALIDE: ['badge-ok', 'Validé', <ICheck size={14} key="i" />],
    EN_ATTENTE: ['badge-wait', 'En attente', <IClock size={14} key="i" />], SUSPENDU: ['badge-no', 'Suspendu', <IX size={14} key="i" />],
    REJETE: ['badge-no', 'Rejeté', <IX size={14} key="i" />],
  };
  const [cls, label, icon] = m[statut] ?? ['badge-info', statut, null];
  return <span className={`badge ${cls}`}>{icon}{label}</span>;
}
export function Alert({ kind = 'info', children }: { kind?: 'info' | 'err' | 'ok'; children: ReactNode }) {
  const Icon = kind === 'err' ? IAlert : kind === 'ok' ? ICheck : IInfo;
  return <div className={`alert alert-${kind}`} role={kind === 'err' ? 'alert' : 'status'}><Icon size={20} /><div>{children}</div></div>;
}
export const Field = ({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) => (
  <div className="field"><label htmlFor={id}>{label}</label>{children}{hint && <span className="hint">{hint}</span>}</div>);
