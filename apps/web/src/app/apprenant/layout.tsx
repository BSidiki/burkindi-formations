'use client';
import { usePathname } from 'next/navigation';
import { Watermark } from '@/components/Watermark';
import { Mark } from '@/components/Logo';
import { Tabs } from '@/components/Tabs';
import { useForceLogout } from '@/hooks/useForceLogout';
import { useMe } from '@/hooks/useMe';

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const isLogin = path?.endsWith('/login');
  const me = useMe(); useForceLogout();
  if (isLogin) return <>{children}</>;
  return (<div className="shell">
    {me && <Watermark info={me.watermark} />}
    <header className="topbar"><Mark height={38} /><b style={{ fontFamily: 'var(--f-titre)' }}>BURKINDI Formations</b></header>
    <Tabs />
    <main className="page">{children}</main>
  </div>);
}
