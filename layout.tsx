import './globals.css';
import { Nav } from './Nav'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sharks Team Manager',
  description: 'Simple mobile-first team picker for youth football.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Nav />
          <main className="page-shell">{children}</main>
        </div>
      </body>
    </html>
  );
}
