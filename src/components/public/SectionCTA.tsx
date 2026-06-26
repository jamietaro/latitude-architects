import Link from 'next/link';

// Shared centred call-to-action shown below a homepage section. Uppercase,
// letter-spaced and monochrome to match the section titles and banner CTA,
// with a minimal arrow icon (same stroke style as the carousel chevrons).
export default function SectionCTA({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <Link
        href={href}
        className="section-cta"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          fontWeight: 300,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#999999',
          textDecoration: 'none',
          transition: 'opacity 0.25s ease',
        }}
      >
        {label}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' }}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
      <style>{`.section-cta:hover { opacity: 0.6; }`}</style>
    </div>
  );
}
