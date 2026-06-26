// Shared thin grey divider used between homepage sections. Content-width
// aligned (matches the 1280px page grid) with the site's standard border grey.
export default function SectionDivider() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 40px' }}>
      <div style={{ borderTop: '1px solid #e8e6e2' }} />
    </div>
  );
}
