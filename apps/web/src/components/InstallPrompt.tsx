'use client';
import { useEffect, useState } from 'react';
import { IOffline } from './Icons';

/** « Installer l'application » : invite native sur Android/Chrome, mode d'emploi sur iPhone. */
export function InstallPrompt() {
  const [evt, setEvt] = useState<any>(null); const [installed, setInstalled] = useState(false); const [ios, setIos] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setInstalled(!!standalone); setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const before = (e: Event) => { e.preventDefault(); setEvt(e); }; const done = () => { setInstalled(true); setEvt(null); };
    window.addEventListener('beforeinstallprompt', before); window.addEventListener('appinstalled', done);
    return () => { window.removeEventListener('beforeinstallprompt', before); window.removeEventListener('appinstalled', done); };
  }, []);
  if (installed) return null;
  if (evt) return <button className="btn btn-secondary btn-block" onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null); }}><IOffline size={20} />Installer l'application</button>;
  if (ios) return <p className="hint">Pour installer l'application : touchez <b>Partager</b>, puis <b>Sur l'écran d'accueil</b>.</p>;
  return null;
}
