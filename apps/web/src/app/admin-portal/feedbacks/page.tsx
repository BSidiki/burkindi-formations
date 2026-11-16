'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatutBadge } from '@/components/ui';

export default function Feedbacks() {
  const [rows, setRows] = useState<any[]>([]); const [rep, setRep] = useState<Record<string, string>>({});
  const load = () => api('/admin/feedbacks').then(setRows); useEffect(() => { load(); }, []);
  return (<div className="stack-6"><h1>Signalements des apprenants</h1>
    <div className="stack-4">{rows.map(f => <article key={f.id} className="card stack-3">
      <div className="row between row-wrap"><b>{f.user.prenom} {f.user.nom} · {f.motif}</b><StatutBadge statut={f.statut} /></div>
      <p>{f.message}</p>
      {f.statut === 'EN_ATTENTE' && <><textarea className="textarea" aria-label="Votre réponse" placeholder="Votre réponse à l'apprenant" onChange={e => setRep({ ...rep, [f.id]: e.target.value })} />
        <div className="row row-wrap"><button className="btn btn-primary btn-sm" disabled={!rep[f.id]?.trim()} onClick={async () => { await api(`/admin/feedbacks/${f.id}/reply`, { method: 'PATCH', body: JSON.stringify({ reply: rep[f.id] }) }); load(); }}>Répondre</button>
          <button className="btn btn-secondary btn-sm" onClick={async () => { await api(`/admin/feedbacks/${f.id}/relance`, { method: 'POST' }); load(); }}>Relancer l'apprenant</button></div></>}
    </article>)}{!rows.length && <p className="muted">Aucun signalement pour le moment.</p>}</div></div>);
}
