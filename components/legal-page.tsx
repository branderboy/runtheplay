export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-ink-faint">Last updated {updated}</p>
      <article className="legal mt-8">{children}</article>
    </div>
  );
}
