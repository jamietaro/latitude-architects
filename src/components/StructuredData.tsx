// Renders a JSON-LD <script> tag. Pass any valid schema.org structured-data
// object (or array of objects) as `data`. The output is sanitised against
// </script> injection by escaping forward slashes.

interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function StructuredData({ data }: StructuredDataProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
