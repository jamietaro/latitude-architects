// Shared homepage section title. Extracted from the original "FEATURED
// PROJECTS" header markup so Featured Projects, News and Journal all render
// an identical title.
export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 40px 48px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: 14,
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#111111',
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}
