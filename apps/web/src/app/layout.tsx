import '@fontsource-variable/montserrat';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '../styles/globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata = {
  title: 'BURKINDI Formations', description: 'Votre réussite commence ici ! Préparation aux concours directs et professionnels.',
  manifest: '/manifest.json', appleWebApp: { capable: true, title: 'BURKINDI' },
  icons: { icon: '/favicon.png', apple: '/icons/apple-touch-icon.png' },
};
export const viewport = { themeColor: '#E4C048', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}<ServiceWorkerRegister /></body></html>;
}
