export function PlayGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="none" stroke="#F26A1B" strokeWidth="1.6" />
      <path d="M8 6.5L13.5 10L8 13.5Z" fill="#F26A1B" />
    </svg>
  );
}

/** White transparent logo — sits directly on the navy header, no box. */
export function Wordmark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/runlogo-white.png"
      alt="Run the Play — Advertising Made Simple for the Culture"
      className="h-12 w-auto"
    />
  );
}
