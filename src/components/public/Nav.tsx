'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavProps {
  transparent?: boolean;
  darkBackground?: boolean;
}

const navLinks = [
  { label: 'Projects', href: '/projects' },
  { label: 'People', href: '/people/team' },
  { label: 'Practice', href: '/practice' },
  { label: 'Journal', href: '/journal' },
];

export default function Nav({ transparent = false, darkBackground = false }: NavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const prevScrolledRef = useRef(false);

  useEffect(() => {
    if (!transparent) return;
    const nav = navRef.current;
    if (!nav) return;

    function onScroll() {
      const y = window.scrollY;
      const wasScrolled = prevScrolledRef.current;
      const scrolled = wasScrolled ? y > 60 : y > 80;
      if (scrolled === wasScrolled) return;
      prevScrolledRef.current = scrolled;
      nav!.dataset.scrolled = scrolled ? 'true' : 'false';
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isTransparentMode = transparent && !mobileOpen;
  const showDualLogos = isTransparentMode && darkBackground;

  const isActive = (href: string) => {
    if (href === '/projects') return pathname.startsWith('/projects');
    if (href === '/people/team') return pathname.startsWith('/people');
    if (href === '/practice') return pathname.startsWith('/practice');
    if (href === '/journal') return pathname.startsWith('/journal');
    return pathname === href;
  };

  return (
    <>
      <nav
        ref={navRef}
        className={isTransparentMode ? 'site-nav site-nav-transparent' : 'site-nav site-nav-solid'}
        data-scrolled="false"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          zIndex: 100,
          backgroundColor: isTransparentMode ? 'transparent' : 'rgb(255,255,255)',
          borderBottom: isTransparentMode ? 'none' : '1px solid rgb(232,230,226)',
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
          <Link href="/" className="nav-logo-link">
            {showDualLogos ? (
              <>
                <Image
                  src="/images/logo-white.png"
                  alt="Latitude Architects"
                  width={200}
                  height={32}
                  className="nav-logo nav-logo-white"
                  priority
                />
                <Image
                  src="/images/logo-dark.png"
                  alt="Latitude Architects"
                  width={200}
                  height={32}
                  className="nav-logo nav-logo-dark"
                  priority
                />
              </>
            ) : (
              <Image
                src="/images/logo-dark.png"
                alt="Latitude Architects"
                width={200}
                height={32}
                style={{ height: 32, width: 'auto' }}
                priority
              />
            )}
          </Link>

          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="nav-hamburger-icon">
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="1.5" />
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.5" />
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </nav>

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

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: 32,
                fontWeight: 300,
                color: isActive(link.href) ? '#111111' : '#999999',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style jsx global>{`
        /* === Base nav === */
        .site-nav {
          transition: background-color 0.3s ease, border-bottom-color 0.3s ease;
        }

        /* Transparent mode (homepage hero) */
        .site-nav-transparent {
          background-color: transparent;
          border-bottom: 1px solid transparent;
        }
        .site-nav-transparent[data-scrolled="true"] {
          background-color: rgb(255, 255, 255);
          border-bottom-color: rgb(232, 230, 226);
        }

        /* Solid mode (all other pages) */
        .site-nav-solid {
          background-color: rgb(255, 255, 255);
          border-bottom: 1px solid rgb(232, 230, 226);
        }

        /* === Logo === */
        .nav-logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: opacity 0.25s ease;
        }
        .nav-logo-link:hover { opacity: 0.6; }
        .nav-logo { height: 32px !important; width: auto !important; }

        .nav-logo-white { display: block; }
        .nav-logo-dark { display: none; }
        .site-nav[data-scrolled="true"] .nav-logo-white { display: none; }
        .site-nav[data-scrolled="true"] .nav-logo-dark { display: block; }

        /* === Nav links === */
        .nav-link {
          font-size: 15px;
          font-weight: 300;
          text-decoration: none;
          transition: color 0.3s ease, opacity 0.25s ease;
        }
        .nav-link:hover { opacity: 0.6; }

        /* Transparent mode link colors */
        .site-nav-transparent .nav-link-active { color: #ffffff; }
        .site-nav-transparent .nav-link-inactive { color: rgba(255, 255, 255, 0.65); }
        .site-nav-transparent[data-scrolled="true"] .nav-link-active { color: #111111; }
        .site-nav-transparent[data-scrolled="true"] .nav-link-inactive { color: #999999; }

        /* Solid mode link colors */
        .site-nav-solid .nav-link-active { color: #111111; }
        .site-nav-solid .nav-link-inactive { color: #999999; }

        /* === Hamburger icon === */
        .site-nav-transparent .nav-hamburger-icon line { stroke: #ffffff; transition: stroke 0.3s ease; }
        .site-nav-transparent[data-scrolled="true"] .nav-hamburger-icon line { stroke: #111111; }
        .site-nav-solid .nav-hamburger-icon line { stroke: #111111; }

        .nav-mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }
      `}</style>
    </>
  );
}
