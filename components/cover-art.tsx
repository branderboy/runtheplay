import { accentFor, initials, hashString } from "@/lib/cover";

/**
 * Square generated avatar for a podcast. Renders real artwork if a URL is
 * provided; otherwise a deterministic branded monogram.
 */
export function CoverArt({
  name,
  slug,
  artworkUrl,
  size = 48,
  radius = 12,
  className = "",
}: {
  name: string;
  slug: string;
  artworkUrl?: string | null;
  size?: number;
  radius?: number;
  className?: string;
}) {
  if (artworkUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={artworkUrl}
        alt={`${name} artwork`}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: radius }}
        className={`object-cover ${className}`}
      />
    );
  }

  const a = accentFor(slug);
  const id = `cv-${hashString(slug).toString(36)}`;
  const rot = (hashString(slug) % 40) - 20;
  const fontSize = size * (initials(name).length >= 3 ? 0.3 : 0.38);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${name} cover`}
      className={className}
      style={{ borderRadius: radius, display: "block" }}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a.accentDeep} />
          <stop offset="1" stopColor="#0b1a2c" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.28" cy="0.24" r="0.8">
          <stop offset="0" stopColor={a.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={a.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-g)`} />
      <rect width="100" height="100" fill={`url(#${id}-glow)`} />
      <g
        transform={`rotate(${rot} 78 78)`}
        stroke={a.accent}
        strokeWidth="2.4"
        fill="none"
        opacity="0.5"
      >
        <path d="M56 92 A36 36 0 0 1 92 56" />
        <path d="M64 96 A44 44 0 0 1 96 64" strokeOpacity="0.5" />
      </g>
      <text
        x="50"
        y="50"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily="-apple-system, Segoe UI, Roboto, Arial, sans-serif"
        fontWeight="800"
        fontSize={fontSize * (100 / size)}
        fill="#f4f7fb"
      >
        {initials(name)}
      </text>
    </svg>
  );
}
