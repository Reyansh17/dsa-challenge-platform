import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'DSA Challenge Platform',
  description: 'A platform for daily DSA challenges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}