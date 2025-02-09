'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/';

  return (
    <div>
      {!isAuthPage && <Sidebar />}
      <main className={!isAuthPage ? 'ml-64' : ''}>{children}</main>
    </div>
  );
} 