'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavProps {
  transparent?: boolean;
}

const navLinks = [
  { label: 'Projects', href: '/projects' },
  { label: 'People', href: '/people', dropdown: [{ label: 'Team', href: '/people/team' }] },
  {
    label: 'Practice',
    href: '/practice',
    dropdown: [
      { label: 'About', href: '/practice' },
      { label: 'Clients', href: '/practice/clients' },
      { label: 'Awards', href: '/practice/awards' },
      { label: 'Contact', href: '/practice/contact' },
    ],
  },
  { label: 'Journal', href: '/journal' },
];

export default function Nav({ transparent = false }: NavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isTransparentMode = transparent && !scrolled && !mobileOpen;
  const textColor = isTransparentMode ? '#ffffff' : '#111111';
  const inactiveColor = isTransparentMode ? 'rgba(255,255,255,0.65)' : '#999999';
  const bgColor = isTransparentMode ? 'transparent' : '#ffffff';
  const borderColor = isTransparentMode ? 'transparent' : '#e8e6e2';

  const isActive = (href: string) => {
    if (href === '/projects') return pathname.startsWith('/projects');
    if (href === '/people') return pathname.startsWith('/people');
    if (href === '/practice') return pathname.startsWith('/practice');
    if (href === '/journal') return pathname.startsWith('/journal');
    return pathname === href;
  };

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          zIndex: 100,
          backgroundColor: bgColor,
          borderBottom: `1px solid ${borderColor}`,
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 40px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 15,
              fontWeight: 300,
              textTransform: 'lowercase',
              letterSpacing: '0.02em',
              color: textColor,
              textDecoration: 'none',
              transition: 'opacity 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            latitude architects
          </Link>

          {/* Desktop nav */}
          <div
            className="nav-desktop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 60,
            }}
          >
            {navLinks.map((link) => (
              <div
                key={link.label}
                style={{ position: 'relative' }}
                onMouseEnter={() => link.dropdown && handleDropdownEnter(link.label)}
                onMouseLeave={() => link.dropdown && handleDropdownLeave()}
              >
                <Link
                  href={link.href}
                  style={{
                    fontSize: 15,
                    fontWeight: 300,
                    color: isActive(link.href) ? textColor : inactiveColor,
                    textDecoration: 'none',
                    transition: 'opacity 0.25s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {link.label}
                </Link>

                {link.dropdown && openDropdown === link.label && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      paddingTop: 8,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8e6e2',
                        padding: '12px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{
                            fontSize: 14,
                            fontWeight: 300,
                            color: '#999999',
                            textDecoration: 'none',
                            transition: 'color 0.25s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#111111')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" stroke={textColor} strokeWidth="1.5" />
              <line x1="3" y1="12" x2="21" y2="12" stroke={textColor} strokeWidth="1.5" />
              <line x1="3" y1="18" x2="21" y2="18" stroke={textColor} strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
          }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            style={{
              position: 'absolute',
              top: 18,
              right: 40,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="4" y1="4" x2="20" y2="20" stroke="#111111" strokeWidth="1.5" />
              <line x1="20" y1="4" x2="4" y2="20" stroke="#111111" strokeWidth="1.5" />
            </svg>
          </button>

          <Link
            href="/projects"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: 32,
              fontWeight: 300,
              color: isActive('/projects') ? '#111111' : '#999999',
              textDecoration: 'none',
            }}
          >
            Projects
          </Link>
          <Link
            href="/people/team"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: 32,
              fontWeight: 300,
              color: isActive('/people') ? '#111111' : '#999999',
              textDecoration: 'none',
            }}
          >
            People
          </Link>
          <Link
            href="/practice"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: 32,
              fontWeight: 300,
              color: isActive('/practice') ? '#111111' : '#999999',
              textDecoration: 'none',
            }}
          >
            Practice
          </Link>
          <Link
            href="/journal"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: 32,
              fontWeight: 300,
              color: isActive('/journal') ? '#111111' : '#999999',
              textDecoration: 'none',
            }}
          >
            Journal
          </Link>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 767px) {
          .nav-desktop {
            display: none !important;
          }
          .nav-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
