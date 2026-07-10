import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

// V3.18: distraction-free routes (ad landing pages) render without the global
// header/footer so the only action is the CTA.
const BARE_ROUTES = ['/start'];

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const bare = BARE_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));

  if (bare) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-primary)' }}>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-primary)' }}>
      <Header />
      <main className="flex-1 pt-[72px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
