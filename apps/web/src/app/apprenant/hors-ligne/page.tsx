'use client';
import { useEffect, useState } from 'react';
import { db, QUOTA_BYTES, syncQueue } from '@/lib/offline/db';
import { Alert } from '@/components/ui';

export default function Offline() {
  const [used, setUsed] = useState(0); const [pending, setPending] = useState(0); const [online, setOnline] = useState(true); const [msg, setMsg] = useState('');
  const refresh = async () => { setUsed((await db.packs.toArray()).reduce((s, p) => s + p.sizeBytes, 0)); setPending(await db.queue.count()); };
  useEffect(() => { refresh(); setOnline(navigator.onLine); const on = () => { setOnline(true); refresh(); }, off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off); return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); }; }, []);
  const pct = Math.min(100, Math.round((used / QUOTA_BYTES) * 100));
  return (<div className="stack-6">
    <h1>Espace hors ligne</h1>
    <Alert kind={online ? 'ok' : 'info'}>{online ? 'Vous êtes connecté. Tout est à jour.' : 'Vous êtes hors ligne. Vos copies et signalements sont gardés sur votre téléphone.'}</Alert>
    <section className="card stack-3"><h2 style={{ fontSize: 'var(--t-md)' }}>Stockage sécurisé</h2>
      <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Stockage utilisé"><i style={{ width: `${pct}%` }} /></div>
      <p className="small muted">{(used / 1048576).toFixed(1)} Mo utilisés sur {QUOTA_BYTES / 1048576} Mo. Les données sont chiffrées sur votre appareil.</p></section>
    <section className="card stack-3"><h2 style={{ fontSize: 'var(--t-md)' }}>À envoyer</h2>
      <p>{pending === 0 ? 'Rien en attente.' : `${pending} élément${pending > 1 ? 's' : ''} en attente d'envoi.`}</p>
      {msg && <Alert kind="ok">{msg}</Alert>}
      <button className="btn btn-primary btn-block" disabled={!online || pending === 0} onClick={async () => { await syncQueue(); await refresh(); setMsg('Synchronisation terminée.'); }}>Envoyer maintenant</button></section>
  </div>);
}
