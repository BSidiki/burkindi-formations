'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mark } from '@/components/Logo';

const NAV = [['/admin-portal', 'Apprenants et paiements'], ['/admin-portal/feedbacks', 'Signalements'], ['/admin-portal/securite', 'Sécurité']] as const;
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith('/admin-portal/login')) return <>{children}</>;
  return (<div className="admin">
    <nav className="admin-nav" aria-label="Back-office">
      <span className="row" style={{ color: '#fff', padding: '.25rem .5rem' }}><span style={{ background: '#fff', borderRadius: 8, padding: 3, display: 'inline-flex' }}><Mark height={30} /></span><b style={{ fontFamily: 'var(--f-titre)' }}>Back-office</b></span>
      {NAV.map(([h, l]) => <Link key={h} href={h} aria-current={path === h ? 'page' : undefined}>{l}</Link>)}
    </nav>
    <main className="admin-main">{children}</main>
  </div>);
}
