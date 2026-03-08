'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/players', label: 'Players' },
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/fixtures/new', label: 'New Fixture' }
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav-shell">
      <div>
        <p className="eyebrow">Leonard Stanley Sharks</p>
        <h1 className="nav-title">Team Manager</h1>
      </div>
      <div className="nav-links">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} className={active ? 'nav-link active' : 'nav-link'}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
