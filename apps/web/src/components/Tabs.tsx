'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IHome, IQcm, IOffline, IBook, IGift } from './Icons';

const ITEMS = [['', 'Accueil', IHome], ['/qcm', 'QCM', IQcm], ['/hors-ligne', 'Hors ligne', IOffline], ['/bibliotheque', 'Annales', IBook], ['/parrainage', 'Parrainage', IGift]] as const;
export function Tabs() {
  const path = usePathname();
  return (<nav className="tabs" aria-label="Navigation principale">
    {ITEMS.map(([h, label, Icon]) => { const href = `/apprenant${h}`; const on = h === '' ? path === href : path?.startsWith(href);
      return <Link key={h} href={href} className="tab" aria-current={on ? 'page' : undefined}><Icon />{label}</Link>; })}
  </nav>);
}
