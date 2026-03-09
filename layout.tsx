import './globals.css';
import { Nav } from './Nav'
import type { Metadata } from 'next';

export const metadata = {
  title: "Sharks Team Manager",
  description: "Youth hockey team manager",
  manifest: "/manifest.json",
  themeColor: "#000000"
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
