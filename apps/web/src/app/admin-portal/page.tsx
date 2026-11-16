'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatutBadge } from '@/components/ui';
import { NIVEAU_LABEL, fcfa } from '@/lib/config';

const FILTRES = [['', 'Tous'], ['EN_ATTENTE', 'À valider'], ['ACTIF', 'Actifs'], ['SUSPENDU', 'Suspendus']] as const;
export default function Students() {
  const [rows, setRows] = useState<any[]>([]); const [k, setK] = useState<any>(null); const [q, setQ] = useState(''); const [statut, setStatut] = useState('');
  const load = () => { api(`/admin/students?q=${encodeURIComponent(q)}&statut=${statut}`).then(r => setRows(statut ? r.filter((x: any) => x.statut === statut) : r)); api('/admin/kpis').then(setK); };
  useEffect(load, [q, statut]);
  const act = async (path: string, init?: RequestInit) => { await api(path, init); load(); };
  return (<div className="stack-6">
    <h1>Apprenants et paiements</h1>
    {k && <div className="kpis"><div className="tile"><b>{k.inscrits.toLocaleString('fr-FR')}</b><span>Inscrits</span></div><div className="tile"><b>{k.actifs.toLocaleString('fr-FR')}</b><span>Comptes actifs</span></div>
      <div className="tile"><b>{k.paiementsEnAttente}</b><span>Paiements à valider</span></div><div className="tile"><b>{k.alertes24h}</b><span>Alertes sur 24 h</span></div></div>}
    <div className="row row-wrap">
      <input className="input grow" style={{ minWidth: 220 }} type="search" placeholder="Rechercher un nom, un numéro, un code parrain" aria-label="Rechercher" onChange={e => setQ(e.target.value)} />
      <a className="btn btn-secondary" href={`${process.env.NEXT_PUBLIC_API_URL}/admin/students/export.xlsx?statut=${statut}&q=${encodeURIComponent(q)}`}>Exporter en Excel</a></div>
    <div className="row row-wrap" role="group" aria-label="Filtrer par statut">{FILTRES.map(([v, l]) => <button key={v} className="chip" aria-pressed={statut === v} onClick={() => setStatut(v)}>{l}</button>)}</div>
    <div className="table-wrap"><table><thead><tr><th>Apprenant</th><th>Voie</th><th>Statut</th><th>Paiement</th><th>Actions</th></tr></thead><tbody>
      {rows.map(r => <tr key={r.id}><td><b>{r.prenom} {r.nom}</b></td><td>{r.voie === 'DIRECT' ? 'Direct' : 'Professionnel'} · {NIVEAU_LABEL[r.niveau] ?? r.niveau}</td><td><StatutBadge statut={r.statut} /></td>
        <td>{r.payments[0] ? <>{fcfa(r.payments[0].amount)} <StatutBadge statut={r.payments[0].status} /></> : '—'}</td>
        <td><div className="row row-wrap">
          {r.statut === 'EN_ATTENTE' && r.payments[0] && <button className="btn btn-primary btn-sm" onClick={() => act(`/admin/payments/${r.payments[0].id}/validate`, { method: 'POST' })}>Valider le paiement</button>}
          <button className="btn btn-secondary btn-sm" onClick={() => act(`/admin/students/${r.id}/reset-device`, { method: 'POST' })}>Libérer l'appareil</button>
          <button className="btn btn-secondary btn-sm" onClick={() => act(`/admin/students/${r.id}/suspend`, { method: 'PATCH', body: JSON.stringify({ suspended: r.statut !== 'SUSPENDU' }) })}>{r.statut === 'SUSPENDU' ? 'Réactiver' : 'Suspendre'}</button></div></td></tr>)}
      {!rows.length && <tr><td colSpan={5} className="muted">Aucun apprenant ne correspond à votre recherche.</td></tr>}</tbody></table></div>
  </div>);
}
