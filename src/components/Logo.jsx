export default function MycanaLogo({ size = 40, className = "" }) {
  return (
    <svg
      viewBox="0 0 44 44"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Mycana"
      style={{ display: "block", flexShrink: 0 }}
    >
      <title>Mycana</title>

      {/* ── Felt badge ── */}
      <rect x="1.5" y="1.5" width="41" height="41" rx="12" fill="#3d6b4a" />
      {/* Dark outer border — the felt edge */}
      <rect x="1.5" y="1.5" width="41" height="41" rx="12"
        fill="none" stroke="#2a4d34" strokeWidth="2.5" />
      {/* Subtle top-face highlight — gives badge depth */}
      <rect x="1.5" y="1.5" width="41" height="21" rx="12"
        fill="rgba(255,255,255,.05)" />
      {/* Inner dashed stitch border */}
      <rect x="5.5" y="5.5" width="33" height="33" rx="8" fill="none"
        stroke="rgba(255,255,255,.46)" strokeWidth="1.3" strokeDasharray="4 3" />

      {/* ── Wellness cross (upper-left corner) ── */}
      <line x1="9" y1="7.5" x2="9" y2="13"
        stroke="rgba(255,255,255,.7)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6.5" y1="10.25" x2="11.5" y2="10.25"
        stroke="rgba(255,255,255,.7)" strokeWidth="1.4" strokeLinecap="round" />

      {/* ── Cannabis leaf ── */}
      {/* Stem — thick, like a yarn stalk */}
      <line x1="22" y1="38" x2="22" y2="29.5"
        stroke="rgba(255,255,255,.92)" strokeWidth="2.2" strokeLinecap="round" />
      {/* Center vein — running stitch */}
      <line x1="22" y1="29" x2="22" y2="10"
        stroke="rgba(255,255,255,.3)" strokeWidth="0.9" strokeDasharray="2.5 2" />

      {/* Center lobe — tallest, most prominent */}
      <path d="M22 30 C18 22 17 15 22 9 C27 15 26 22 22 30Z"
        fill="rgba(255,255,255,.88)" />
      {/* Embroidery stitch outline on center lobe */}
      <path d="M22 30 C18 22 17 15 22 9 C27 15 26 22 22 30Z"
        fill="none" stroke="rgba(255,255,255,.32)" strokeWidth="1.1" strokeDasharray="3 2.5" />

      {/* Upper-left lobe */}
      <path d="M21 28 C16 23 9 19 10 12 C14 12 18 18 21 24Z"
        fill="rgba(255,255,255,.76)" />
      {/* Upper-right lobe */}
      <path d="M23 28 C28 23 35 19 34 12 C30 12 26 18 23 24Z"
        fill="rgba(255,255,255,.76)" />
      {/* Lower-left lobe */}
      <path d="M21 27 C14 25 7 22 7 16 C11 15 17 20 21 24Z"
        fill="rgba(255,255,255,.58)" />
      {/* Lower-right lobe */}
      <path d="M23 27 C30 25 37 22 37 16 C33 15 27 20 23 24Z"
        fill="rgba(255,255,255,.58)" />

      {/* ── Heart (wellness mark, lower-right corner) ── */}
      <path
        d="M34 37 C33 36.2 31.5 34.5 31.5 33.5 C31.5 32.2 33 32 34 32.8 C35 32 36.5 32.2 36.5 33.5 C36.5 34.5 35 36.2 34 37Z"
        fill="rgba(255,255,255,.62)"
      />
    </svg>
  );
}
