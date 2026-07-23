export function PlayGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="none" stroke="#F26A1B" strokeWidth="1.6" />
      <path d="M8 6.5L13.5 10L8 13.5Z" fill="#F26A1B" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <PlayGlyph />
      <span className="text-[15px] font-extrabold uppercase tracking-[0.14em]">
        Run the Play
      </span>
    </span>
  );
}
