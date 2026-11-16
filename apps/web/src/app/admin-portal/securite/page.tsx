'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { IAlert, IInfo, IShield } from '@/components/Icons';

const TYPES: Record<string, [string, string]> = {
  FOCUS_LOST: ['Sortie d\'écran', 'badge-wait'], MULTI_DEVICE: ['Nouvel appareil', 'badge-wait'], MULTI_DEVICE_BLOCKED: ['Compte bloqué', 'badge-no'],
  LOGIN_BRUTE_FORCE: ['Tentatives de connexion', 'badge-no'], ADMIN_IP_REFUSED: ['Réseau refusé', 'badge-no'], ADMIN_2FA_FAILED: ['Échec admin', 'badge-no'],
};
export default function Security() {
  const [rows, setRows] = useState<any[]>([]); useEffect(() => { api('/admin/security-logs').then(setRows); }, []);
  return (<div className="stack-6"><h1>Journal de sécurité</h1>
    <div className="table-wrap"><table><thead><tr><th>Date</th><th>Événement</th><th>Apprenant</th><th>Détail</th></tr></thead><tbody>
      {rows.map(l => { const [lib, cls] = TYPES[l.type] ?? [l.type, 'badge-info']; const Ic = cls === 'badge-no' ? IAlert : cls === 'badge-wait' ? IInfo : IShield;
        return <tr key={l.id}><td>{new Date(l.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
          <td><span className={`badge ${cls}`}><Ic size={14} />{lib}</span></td><td>{l.user ? `${l.user.prenom} ${l.user.nom}` : '—'}</td><td>{l.details}</td></tr>; })}
      {!rows.length && <tr><td colSpan={4} className="muted">Aucun événement.</td></tr>}</tbody></table></div></div>);
}
