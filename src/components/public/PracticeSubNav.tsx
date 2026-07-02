'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { label: 'ABOUT', href: '/practice' },
  { label: 'CLIENTS', href: '/practice/clients' },
  { label: 'CAREERS', href: '/practice/careers' },
];

export default function PracticeSubNav({
  variant = 'dark',
}: {
  variant?: 'dark' | 'light';
}) {
  const pathname = usePathname();
  const light = variant === 'light';

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
        // In light (overlay) mode the parent positions this over the hero, so
        // no vertical padding of its own.
        paddingTop: light ? 0 : 48,
        marginBottom: light ? 0 : 48,
      }}
    >
      {links.map((link) => {
        const active = pathname === link.href;
        const color = light
          ? active
            ? '#ffffff'
            : 'rgba(255,255,255,0.7)'
          : active
            ? '#111111'
            : '#aaaaaa';
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 13,
              fontWeight: 300,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color,
              textDecoration: 'none',
              transition: 'opacity 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
