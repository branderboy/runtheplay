/** Renders a JSON-LD structured-data block. Pass a plain schema.org object. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is server-rendered from our own trusted data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
