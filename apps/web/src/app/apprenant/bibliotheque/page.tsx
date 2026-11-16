'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Alert, Field } from '@/components/ui';
import { IFile } from '@/components/Icons';

export default function Library() {
  const [r, setR] = useState<{ id: string; titre: string }[]>([]); const [sujet, setSujet] = useState(''); const [question, setQ] = useState(''); const [ok, setOk] = useState(false);
  useEffect(() => { api('/library').then(setR).catch(() => {}); }, []);
  return (<div className="stack-6">
    <h1>Annales et fiches</h1>
    <ul className="stack-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {r.map(x => <li key={x.id} className="card row"><IFile /><span className="grow"><b>{x.titre}</b></span><span className="badge badge-info">PDF</span></li>)}
      {!r.length && <li><Alert>Les documents de votre voie apparaîtront ici.</Alert></li>}</ul>
    <section className="card stack-4"><h2 style={{ fontSize: 'var(--t-md)' }}>Une question à un formateur ?</h2>
      <Field id="sujet" label="Sujet"><input id="sujet" className="input" value={sujet} onChange={e => setSujet(e.target.value)} /></Field>
      <Field id="q" label="Votre question"><textarea id="q" className="textarea" value={question} onChange={e => setQ(e.target.value)} /></Field>
      {ok && <Alert kind="ok">Votre question est envoyée. Un formateur vous répondra.</Alert>}
      <button className="btn btn-primary btn-block" disabled={!sujet.trim() || !question.trim()} onClick={async () => { await api('/assistance', { method: 'POST', body: JSON.stringify({ sujet, question }) }); setOk(true); setSujet(''); setQ(''); }}>Envoyer ma question</button></section>
  </div>);
}
