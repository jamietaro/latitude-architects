'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { label: 'ABOUT', href: '/practice' },
  { label: 'CLIENTS', href: '/practice/clients' },
  { label: 'CAREERS', href: '/practice/careers' },
  { label: 'CONTACT', href: '/practice/contact' },
];

export default function PracticeSubNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
        paddingTop: 48,
        marginBottom: 48,
      }}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            fontSize: 13,
            fontWeight: 300,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: pathname === link.href ? '#111111' : '#aaaaaa',
            textDecoration: 'none',
            transition: 'opacity 0.25s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
