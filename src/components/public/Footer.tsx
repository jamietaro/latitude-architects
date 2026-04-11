import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #e8e6e2',
      }}
    >
      <div
        className="footer-inner"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '28px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {/* Left */}
        <div
          className="footer-left"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 300, color: '#999999' }}>
            020 7998 5680
          </span>
          <a
            href="mailto:info@latitudearchitects.com"
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: '#999999',
              textDecoration: 'none',
              transition: 'opacity 0.25s ease',
            }}
          >
            info@latitudearchitects.com
          </a>
        </div>

        {/* Centre */}
        <div
          className="footer-centre"
          style={{ fontSize: 13, fontWeight: 300, color: '#999999' }}
        >
          &copy; Latitude Architects and Designers Ltd
        </div>

        {/* Right */}
        <div
          className="footer-right"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <a
            href="https://www.instagram.com/latitudearchitects/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: '#999999',
              textDecoration: 'none',
              transition: 'opacity 0.25s ease',
            }}
          >
            Instagram
          </a>
          <Link
            href="/privacy"
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: '#999999',
              textDecoration: 'none',
              transition: 'opacity 0.25s ease',
            }}
          >
            Privacy Policy
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .footer-inner {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
          }
          .footer-left {
            flex-direction: column !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </footer>
  );
}
