const styles: Record<string, string> = {
  public: "bg-navy-2 text-ink-dim border-line",
  verified: "bg-green/15 text-green border-green/30",
  estimated: "bg-orange/12 text-orange border-orange/30",
  unclaimed: "bg-navy-2 text-ink-faint border-line",
  featured: "bg-orange text-navy border-orange",
  contact: "bg-navy-2 text-ink-dim border-line",
};

export function Badge({
  children,
  tone = "public",
}: {
  children: React.ReactNode;
  tone?: keyof typeof styles;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
