// Medieval character avatars — one per cannabis archetype
// viewBox 0 0 200 260, designed to sit inside a gradient card hero

export function AlchemistAvatar() {
  // The Creative Explorer — Electric Nebula (purple / amber)
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* ── Wizard hat ── */}
      <polygon points="100,6 54,106 146,106" fill="#2e1065" />
      <polygon points="100,6 54,106 100,106" fill="#4c1d95" opacity="0.5" />
      <ellipse cx="100" cy="106" rx="52" ry="13" fill="#3b0764" />
      <ellipse cx="100" cy="102" rx="48" ry="10" fill="#5b21b6" />
      {/* Stars */}
      <circle cx="84" cy="38" r="5" fill="#fbbf24" />
      <circle cx="108" cy="65" r="4" fill="#fbbf24" opacity="0.9" />
      <circle cx="80" cy="76" r="3" fill="#fbbf24" opacity="0.75" />
      <circle cx="117" cy="44" r="3" fill="#fbbf24" opacity="0.8" />
      <circle cx="91" cy="22" r="2.5" fill="#fbbf24" />
      <circle cx="110" cy="88" r="2" fill="#fbbf24" opacity="0.6" />
      {/* ── Head ── */}
      <circle cx="100" cy="136" r="35" fill="#fde8c8" />
      <circle cx="82" cy="142" r="9" fill="#fca5a5" opacity="0.28" />
      <circle cx="118" cy="142" r="9" fill="#fca5a5" opacity="0.28" />
      {/* Beard */}
      <path d="M 76 155 Q 100 178 124 155 Q 114 187 100 190 Q 86 187 76 155Z" fill="#c4b5fd" opacity="0.4" />
      <path d="M 80 159 Q 100 170 120 159" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.5" />
      {/* ── Eyebrows ── */}
      <path d="M 79 124 Q 88 121 96 125" stroke="#44403c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 104 125 Q 112 121 121 124" stroke="#44403c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* ── Eyes — glowing violet ── */}
      <ellipse cx="88" cy="131" rx="6.5" ry="6" fill="#4c1d95" />
      <ellipse cx="112" cy="131" rx="6.5" ry="6" fill="#4c1d95" />
      <circle cx="87" cy="130" r="3" fill="white" />
      <circle cx="111" cy="130" r="3" fill="white" />
      <circle cx="86.5" cy="129.5" r="1.2" fill="#a78bfa" />
      <circle cx="110.5" cy="129.5" r="1.2" fill="#a78bfa" />
      {/* ── Nose ── */}
      <path d="M 100 139 Q 96 145 100 147 Q 104 145 100 139" fill="#d4a574" />
      {/* ── Smile ── */}
      <path d="M 91 152 Q 100 159 109 152" stroke="#7c4b30" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* ── Robes ── */}
      <path d="M 65 164 Q 54 192 34 258 L 166 258 Q 146 192 135 164 Q 100 156 65 164Z" fill="#2e1065" />
      <path d="M 65 164 Q 54 192 34 258 L 166 258 Q 146 192 135 164 Q 100 156 65 164Z" fill="#6d28d9" opacity="0.22" />
      <line x1="100" y1="164" x2="100" y2="258" stroke="#7c3aed" strokeWidth="1.5" opacity="0.2" />
      {/* Belt */}
      <rect x="58" y="179" width="84" height="10" rx="5" fill="#d97706" />
      <rect x="84" y="176" width="32" height="17" rx="4" fill="#92400e" />
      <circle cx="100" cy="184" r="7" fill="#fbbf24" />
      <circle cx="100" cy="184" r="4" fill="#fef9c3" />
      {/* ── Left arm + flask ── */}
      <path d="M 68 172 Q 42 196 30 218 L 46 224 Q 60 204 80 182Z" fill="#2e1065" />
      <circle cx="31" cy="220" r="12" fill="#fde8c8" />
      <rect x="14" y="218" width="12" height="12" rx="3" fill="#5b21b6" />
      <ellipse cx="20" cy="234" rx="13" ry="16" fill="#7c3aed" />
      <ellipse cx="20" cy="231" rx="9" ry="11" fill="#a78bfa" opacity="0.3" />
      <path d="M 10 234 Q 20 228 30 234" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4" />
      <ellipse cx="20" cy="234" rx="20" ry="23" fill="#7c3aed" opacity="0.1" />
      <circle cx="16" cy="236" r="2" fill="#c4b5fd" opacity="0.55" />
      <circle cx="23" cy="229" r="1.5" fill="#c4b5fd" opacity="0.5" />
      {/* ── Right arm + orb ── */}
      <path d="M 132 172 Q 158 196 170 218 L 154 224 Q 140 204 120 182Z" fill="#2e1065" />
      <circle cx="169" cy="220" r="12" fill="#fde8c8" />
      <line x1="169" y1="207" x2="178" y2="194" stroke="#5b21b6" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="178" cy="191" r="10" fill="#fbbf24" opacity="0.9" />
      <circle cx="178" cy="191" r="6" fill="#fef9c3" />
      <circle cx="178" cy="191" r="22" fill="#fbbf24" opacity="0.07" />
    </svg>
  );
}

export function HerbalistAvatar() {
  // The Gentle Healer — Healing Garden (forest green / rose)
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* ── Flower crown ── */}
      <ellipse cx="68" cy="94" rx="15" ry="9" fill="#15803d" transform="rotate(-30 68 94)" />
      <ellipse cx="84" cy="84" rx="15" ry="9" fill="#16a34a" transform="rotate(-14 84 84)" />
      <ellipse cx="100" cy="80" rx="15" ry="9" fill="#15803d" />
      <ellipse cx="116" cy="84" rx="15" ry="9" fill="#16a34a" transform="rotate(14 116 84)" />
      <ellipse cx="132" cy="94" rx="15" ry="9" fill="#15803d" transform="rotate(30 132 94)" />
      {/* Flowers */}
      <circle cx="70" cy="89" r="8" fill="#fda4af" />
      <circle cx="70" cy="89" r="4.5" fill="#fce7f3" />
      <circle cx="100" cy="78" r="9" fill="#f9a8d4" />
      <circle cx="100" cy="78" r="5" fill="#fce7f3" />
      <circle cx="130" cy="89" r="8" fill="#fda4af" />
      <circle cx="130" cy="89" r="4.5" fill="#fce7f3" />
      <circle cx="85" cy="81" r="5.5" fill="#86efac" />
      <circle cx="85" cy="81" r="3" fill="#d1fae5" />
      <circle cx="115" cy="81" r="5.5" fill="#86efac" />
      <circle cx="115" cy="81" r="3" fill="#d1fae5" />
      {/* ── Head ── */}
      <circle cx="100" cy="128" r="35" fill="#fde8c8" />
      <circle cx="80" cy="136" r="10" fill="#fda4af" opacity="0.32" />
      <circle cx="120" cy="136" r="10" fill="#fda4af" opacity="0.32" />
      {/* ── Eyebrows ── */}
      <path d="M 80 116 Q 89 113 97 117" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 103 117 Q 111 113 120 116" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* ── Eyes — warm emerald ── */}
      <ellipse cx="89" cy="123" rx="7" ry="6.5" fill="#065f46" />
      <ellipse cx="111" cy="123" rx="7" ry="6.5" fill="#065f46" />
      <circle cx="88" cy="122" r="3" fill="white" />
      <circle cx="110" cy="122" r="3" fill="white" />
      <circle cx="87.5" cy="121.5" r="1.2" fill="#10b981" />
      <circle cx="109.5" cy="121.5" r="1.2" fill="#10b981" />
      {/* Lashes */}
      <line x1="84" y1="117" x2="83" y2="113" stroke="#374151" strokeWidth="1" opacity="0.55" />
      <line x1="89" y1="115" x2="89" y2="111" stroke="#374151" strokeWidth="1" opacity="0.55" />
      <line x1="94" y1="117" x2="95" y2="113" stroke="#374151" strokeWidth="1" opacity="0.55" />
      {/* ── Nose ── */}
      <ellipse cx="100" cy="132" rx="3.5" ry="2.5" fill="#d4a574" />
      {/* ── Warm smile ── */}
      <path d="M 89 144 Q 100 153 111 144" stroke="#7c4b30" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 91 144 Q 100 150 109 144" fill="#fda4af" opacity="0.3" />
      {/* ── Robes ── */}
      <path d="M 65 156 Q 54 184 36 258 L 164 258 Q 146 184 135 156 Q 100 148 65 156Z" fill="#064e3b" />
      <path d="M 65 156 Q 54 184 36 258 L 164 258 Q 146 184 135 156 Q 100 148 65 156Z" fill="#10b981" opacity="0.18" />
      {/* Leaf embroidery */}
      <path d="M 80 165 Q 72 177 80 188" stroke="#16a34a" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M 120 165 Q 128 177 120 188" stroke="#16a34a" strokeWidth="1.5" fill="none" opacity="0.6" />
      {/* Waist cord */}
      <path d="M 58 172 Q 100 162 142 172" stroke="#92400e" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Herb pouch */}
      <ellipse cx="116" cy="184" rx="11" ry="13" fill="#92400e" />
      <ellipse cx="116" cy="176" rx="6.5" ry="4.5" fill="#78350f" />
      <circle cx="112" cy="185" r="2" fill="#fef3c7" opacity="0.5" />
      <circle cx="119" cy="190" r="1.8" fill="#fef3c7" opacity="0.5" />
      {/* ── Left arm + staff ── */}
      <path d="M 68 162 Q 52 184 48 224 L 62 228 Q 66 190 80 170Z" fill="#064e3b" />
      <circle cx="50" cy="224" r="12" fill="#fde8c8" />
      <line x1="29" y1="88" x2="52" y2="236" stroke="#92400e" strokeWidth="5.5" strokeLinecap="round" />
      {/* Vines on staff */}
      <path d="M 33 108 Q 44 116 36 130" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.85" />
      <path d="M 38 142 Q 49 150 41 164" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.85" />
      {/* Staff top leaf */}
      <ellipse cx="30" cy="93" rx="11" ry="16" fill="#16a34a" transform="rotate(-22 30 93)" />
      <ellipse cx="30" cy="93" rx="6" ry="10" fill="#4ade80" opacity="0.45" transform="rotate(-22 30 93)" />
      <circle cx="38" cy="122" r="5" fill="#fda4af" />
      <circle cx="38" cy="122" r="3" fill="#fce7f3" />
      {/* ── Right arm ── */}
      <path d="M 132 162 Q 148 184 152 224 L 138 228 Q 134 190 120 170Z" fill="#064e3b" />
      <circle cx="150" cy="224" r="12" fill="#fde8c8" />
    </svg>
  );
}

export function MonkAvatar() {
  // The Restful Restorer — Midnight Indigo (dark navy / violet)
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* ── Deep cowl hood ── */}
      <path d="M 28 126 Q 36 50 100 40 Q 164 50 172 126 Q 164 104 148 120 Q 128 88 100 86 Q 72 88 52 120 Z" fill="#0f172a" />
      <path d="M 52 118 Q 60 80 100 76 Q 140 80 148 118 Q 136 94 100 90 Q 64 94 52 118Z" fill="#1e293b" />
      {/* Moonlight glow above head */}
      <ellipse cx="100" cy="62" rx="38" ry="28" fill="#6d28d9" opacity="0.07" />
      {/* ── Head (shadowed) ── */}
      <circle cx="100" cy="130" r="34" fill="#e8c9a0" />
      {/* Hood shadow overlay */}
      <path d="M 53 117 Q 60 88 100 84 Q 140 88 147 117 Q 142 106 100 102 Q 58 106 53 117Z" fill="#0f172a" opacity="0.48" />
      {/* ── Closed / peaceful eyes ── */}
      <path d="M 80 124 Q 88 129 96 124" stroke="#374151" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M 104 124 Q 112 129 120 124" stroke="#374151" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      {/* Eyebrows — serene */}
      <path d="M 77 117 Q 87 114 95 118" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M 105 118 Q 113 114 123 117" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.65" />
      {/* ── Nose ── */}
      <ellipse cx="100" cy="134" rx="3.5" ry="2.5" fill="#c4926a" />
      {/* ── Peaceful mouth ── */}
      <path d="M 91 145 Q 100 150 109 145" stroke="#7c4b30" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* ── Prayer beads ── */}
      {[...Array(14)].map((_, i) => {
        const ang = (-65 + i * 10) * (Math.PI / 180);
        const cx = 100 + 44 * Math.cos(ang);
        const cy = 167 + 14 * Math.sin(ang);
        return <circle key={i} cx={cx} cy={cy} r="3.8" fill="#6d28d9" opacity="0.85" />;
      })}
      <circle cx="100" cy="180" r="7" fill="#4c1d95" />
      <circle cx="100" cy="180" r="3.5" fill="#a78bfa" opacity="0.7" />
      {/* ── Robe body ── */}
      <path d="M 63 158 Q 52 188 30 258 L 170 258 Q 148 188 137 158 Q 100 150 63 158Z" fill="#0f172a" />
      <path d="M 63 158 Q 52 188 30 258 L 170 258 Q 148 188 137 158 Q 100 150 63 158Z" fill="#1e3a5f" opacity="0.3" />
      <line x1="100" y1="158" x2="100" y2="258" stroke="#312e81" strokeWidth="1.5" opacity="0.45" />
      {/* ── Folded hands ── */}
      <path d="M 67 164 Q 55 182 68 202 L 82 196 Q 72 180 80 168Z" fill="#0f172a" />
      <circle cx="70" cy="202" r="12" fill="#e8c9a0" />
      <path d="M 133 164 Q 145 182 132 202 L 118 196 Q 128 180 120 168Z" fill="#0f172a" />
      <circle cx="130" cy="202" r="12" fill="#e8c9a0" />
      {/* Hands together */}
      <path d="M 75 206 Q 100 215 125 206 Q 118 213 100 217 Q 82 213 75 206Z" fill="#e8c9a0" opacity="0.88" />
    </svg>
  );
}

export function BardAvatar() {
  // The Social Connector — Amber Fire (rust / orange / gold)
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* ── Jester hat ── */}
      <path d="M 58 104 Q 62 64 100 54 Q 138 64 142 104Z" fill="#c2410c" />
      {/* Left prong */}
      <path d="M 60 102 Q 36 78 22 92 Q 46 76 62 102Z" fill="#9a3412" />
      <path d="M 60 102 Q 36 78 22 92 Q 32 90 60 102Z" fill="#f97316" opacity="0.5" />
      {/* Right prong */}
      <path d="M 140 102 Q 164 78 178 92 Q 154 76 138 102Z" fill="#9a3412" />
      <path d="M 140 102 Q 164 78 178 92 Q 168 90 140 102Z" fill="#f97316" opacity="0.5" />
      {/* Center prong */}
      <path d="M 88 56 Q 100 8 112 56Z" fill="#9a3412" />
      <path d="M 90 56 Q 100 14 110 56Z" fill="#f97316" opacity="0.4" />
      {/* Bells */}
      <circle cx="22" cy="95" r="8" fill="#fbbf24" />
      <circle cx="22" cy="95" r="3.5" fill="#92400e" />
      <circle cx="178" cy="95" r="8" fill="#fbbf24" />
      <circle cx="178" cy="95" r="3.5" fill="#92400e" />
      <circle cx="100" cy="10" r="9" fill="#fbbf24" />
      <circle cx="100" cy="10" r="4" fill="#92400e" />
      {/* Hat band */}
      <path d="M 56 104 Q 100 92 144 104" stroke="#fbbf24" strokeWidth="3.5" fill="none" />
      {/* Diamond pattern */}
      <path d="M 68 101 Q 78 70 88 101Z" fill="#fbbf24" opacity="0.55" />
      <path d="M 112 101 Q 122 70 132 101Z" fill="#fbbf24" opacity="0.55" />
      {/* ── Head ── */}
      <circle cx="100" cy="128" r="34" fill="#fde8c8" />
      <circle cx="76" cy="136" r="12" fill="#fca5a5" opacity="0.42" />
      <circle cx="124" cy="136" r="12" fill="#fca5a5" opacity="0.42" />
      {/* ── Eyebrows — lively ── */}
      <path d="M 78 116 Q 88 111 97 117" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 103 117 Q 112 111 122 116" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* ── Eyes — bright ── */}
      <ellipse cx="88" cy="124" rx="7.5" ry="7" fill="#7c2d12" />
      <ellipse cx="112" cy="124" rx="7.5" ry="7" fill="#7c2d12" />
      <circle cx="87" cy="122" r="3.5" fill="white" />
      <circle cx="111" cy="122" r="3.5" fill="white" />
      <circle cx="86.5" cy="121.5" r="1.5" fill="#f97316" />
      <circle cx="110.5" cy="121.5" r="1.5" fill="#f97316" />
      {/* ── Clown nose ── */}
      <circle cx="100" cy="133" r="4.5" fill="#f97316" opacity="0.75" />
      <circle cx="100" cy="133" r="2.8" fill="#fca5a5" />
      {/* ── Big toothy smile ── */}
      <path d="M 82 146 Q 100 162 118 146" stroke="#7c4b30" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 84 146 Q 100 160 116 146 Q 108 156 100 158 Q 92 156 84 146Z" fill="white" />
      <line x1="94" y1="146" x2="94" y2="156" stroke="#ccc" strokeWidth="0.8" />
      <line x1="100" y1="146" x2="100" y2="158" stroke="#ccc" strokeWidth="0.8" />
      <line x1="106" y1="146" x2="106" y2="156" stroke="#ccc" strokeWidth="0.8" />
      {/* ── Patchwork tunic ── */}
      <path d="M 64 156 Q 54 184 36 258 L 164 258 Q 146 184 136 156 Q 100 148 64 156Z" fill="#7c2d12" />
      {/* Patchwork panels */}
      <path d="M 64 156 Q 72 180 76 206 L 100 206 L 100 156 Q 82 150 64 156Z" fill="#f97316" opacity="0.8" />
      <path d="M 136 156 Q 128 180 124 206 L 100 206 L 100 156 Q 118 150 136 156Z" fill="#fbbf24" opacity="0.65" />
      <path d="M 76 206 Q 64 228 54 258 L 100 258 L 100 206Z" fill="#fbbf24" opacity="0.6" />
      <path d="M 124 206 Q 136 228 146 258 L 100 258 L 100 206Z" fill="#f97316" opacity="0.65" />
      {/* Belt */}
      <rect x="57" y="166" width="86" height="10" rx="5" fill="#92400e" />
      <rect x="85" y="162" width="30" height="17" rx="4" fill="#78350f" />
      <ellipse cx="100" cy="171" rx="9" ry="7.5" fill="#fbbf24" />
      <ellipse cx="100" cy="171" rx="5.5" ry="4.5" fill="#ca8a04" />
      {/* ── Left arm ── */}
      <path d="M 68 162 Q 44 188 36 214 L 52 220 Q 62 196 80 172Z" fill="#7c2d12" />
      <circle cx="37" cy="215" r="12" fill="#fde8c8" />
      {/* ── Right arm + lute ── */}
      <path d="M 132 162 Q 156 188 164 214 L 148 220 Q 138 196 120 172Z" fill="#7c2d12" />
      <circle cx="163" cy="215" r="12" fill="#fde8c8" />
      {/* Lute neck */}
      <rect x="156" y="155" width="8" height="52" rx="3.5" fill="#92400e" transform="rotate(18 160 180)" />
      {/* Lute body */}
      <ellipse cx="162" cy="224" rx="21" ry="27" fill="#b45309" transform="rotate(18 162 224)" />
      <ellipse cx="162" cy="224" rx="16" ry="21" fill="#d97706" opacity="0.45" transform="rotate(18 162 224)" />
      <circle cx="160" cy="222" r="5.5" fill="#78350f" />
      {/* Strings */}
      <line x1="151" y1="202" x2="172" y2="240" stroke="#fef3c7" strokeWidth="0.9" opacity="0.65" />
      <line x1="156" y1="200" x2="177" y2="238" stroke="#fef3c7" strokeWidth="0.9" opacity="0.65" />
    </svg>
  );
}

export function NobleAvatar() {
  // The Connoisseur — Emerald Reserve (dark green / gold)
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* ── Crown ── */}
      {/* Crown base band */}
      <rect x="58" y="96" width="84" height="18" rx="4" fill="#92400e" />
      <rect x="60" y="97" width="80" height="14" rx="3" fill="#ca8a04" />
      {/* Crown points */}
      <rect x="62" y="70" width="14" height="30" rx="3" fill="#92400e" />
      <rect x="63" y="71" width="12" height="28" rx="2.5" fill="#ca8a04" />
      <rect x="93" y="58" width="14" height="42" rx="3" fill="#92400e" />
      <rect x="94" y="59" width="12" height="40" rx="2.5" fill="#ca8a04" />
      <rect x="124" y="70" width="14" height="30" rx="3" fill="#92400e" />
      <rect x="125" y="71" width="12" height="28" rx="2.5" fill="#ca8a04" />
      {/* Crown gems */}
      <circle cx="69" cy="76" r="5" fill="#065f46" />
      <circle cx="69" cy="76" r="3" fill="#34d399" opacity="0.8" />
      <circle cx="100" cy="64" r="6" fill="#7c2d12" />
      <circle cx="100" cy="64" r="3.5" fill="#fca5a5" opacity="0.8" />
      <circle cx="131" cy="76" r="5" fill="#065f46" />
      <circle cx="131" cy="76" r="3" fill="#34d399" opacity="0.8" />
      {/* Small gems on band */}
      <circle cx="80" cy="104" r="3.5" fill="#065f46" />
      <circle cx="100" cy="104" r="3.5" fill="#ca8a04" opacity="0.8" />
      <circle cx="120" cy="104" r="3.5" fill="#065f46" />
      {/* ── Head ── */}
      <circle cx="100" cy="134" r="35" fill="#fde8c8" />
      {/* ── Mustache / goatee ── */}
      <path d="M 84 148 Q 100 142 116 148 Q 108 155 100 156 Q 92 155 84 148Z" fill="#374151" opacity="0.55" />
      <path d="M 86 150 Q 100 145 114 150" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* ── Eyebrows — distinguished ── */}
      <path d="M 79 122 Q 88 118 96 122" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 104 122 Q 112 118 121 122" stroke="#374151" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* ── Eyes — dignified ── */}
      <ellipse cx="88" cy="128" rx="6.5" ry="6" fill="#022c22" />
      <ellipse cx="112" cy="128" rx="6.5" ry="6" fill="#022c22" />
      <circle cx="87" cy="127" r="2.8" fill="white" />
      <circle cx="111" cy="127" r="2.8" fill="white" />
      <circle cx="86.5" cy="126.5" r="1.1" fill="#10b981" />
      <circle cx="110.5" cy="126.5" r="1.1" fill="#10b981" />
      {/* ── Nose ── */}
      <ellipse cx="100" cy="136" rx="4" ry="3" fill="#d4a574" />
      {/* ── Dignified slight smile ── */}
      <path d="M 91 145 Q 100 151 109 145" stroke="#7c4b30" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* ── Rich doublet ── */}
      <path d="M 64 162 Q 54 190 36 258 L 164 258 Q 146 190 136 162 Q 100 154 64 162Z" fill="#022c22" />
      <path d="M 64 162 Q 54 190 36 258 L 164 258 Q 146 190 136 162 Q 100 154 64 162Z" fill="#065f46" opacity="0.35" />
      {/* Gold trim on doublet */}
      <path d="M 100 162 L 88 200 L 100 258 L 112 200 Z" fill="#ca8a04" opacity="0.3" />
      <path d="M 64 163 Q 100 154 136 163 Q 118 158 100 156 Q 82 158 64 163Z" fill="#ca8a04" opacity="0.5" />
      {/* Gold buttons */}
      <circle cx="100" cy="172" r="4" fill="#ca8a04" />
      <circle cx="100" cy="186" r="4" fill="#ca8a04" />
      <circle cx="100" cy="200" r="4" fill="#ca8a04" />
      {/* Gold collar trim */}
      <path d="M 68 165 Q 84 158 100 162 Q 116 158 132 165" stroke="#ca8a04" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Belt / sash */}
      <rect x="58" y="174" width="84" height="11" rx="5" fill="#ca8a04" />
      <rect x="84" y="170" width="32" height="18" rx="4" fill="#92400e" />
      <ellipse cx="100" cy="179" rx="9" ry="8" fill="#ca8a04" />
      <circle cx="100" cy="179" r="4.5" fill="#fef3c7" opacity="0.9" />
      {/* ── Left arm ── */}
      <path d="M 67 168 Q 46 192 38 216 L 54 222 Q 64 200 82 178Z" fill="#022c22" />
      <circle cx="39" cy="218" r="12" fill="#fde8c8" />
      {/* ── Right arm + goblet ── */}
      <path d="M 133 168 Q 154 192 162 216 L 146 222 Q 136 200 118 178Z" fill="#022c22" />
      <circle cx="161" cy="218" r="12" fill="#fde8c8" />
      {/* Goblet */}
      <path d="M 158 200 Q 162 212 170 216 Q 178 220 178 228 L 148 228 Q 148 220 156 216 Q 164 212 162 200Z" fill="#ca8a04" />
      <ellipse cx="163" cy="228" rx="15" ry="5" fill="#92400e" />
      <ellipse cx="163" cy="200" rx="12" ry="5" fill="#ca8a04" />
      {/* Wine in goblet */}
      <path d="M 154 214 Q 163 210 172 214 Q 170 224 163 226 Q 156 224 154 214Z" fill="#7c2d12" opacity="0.75" />
      {/* Goblet shine */}
      <line x1="157" y1="204" x2="155" y2="216" stroke="white" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
    </svg>
  );
}

export function RangerAvatar() {
  // The Balanced Seeker — Balanced Earth (forest green / earth brown)
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* ── Cloak hood (down, resting on shoulders) ── */}
      {/* Hood draped behind head */}
      <path d="M 36 142 Q 40 96 100 84 Q 160 96 164 142 Q 148 122 130 128 Q 116 116 100 114 Q 84 116 70 128 Q 52 122 36 142Z" fill="#166534" />
      {/* Hood shadow/depth */}
      <path d="M 44 140 Q 52 108 100 98 Q 148 108 156 140 Q 146 120 116 126 Q 100 118 84 126 Q 54 120 44 140Z" fill="#14532d" opacity="0.5" />
      {/* Leaf motif on hood edge */}
      <path d="M 42 140 Q 50 128 44 118" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 158 140 Q 150 128 156 118" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* ── Head ── */}
      <circle cx="100" cy="130" r="34" fill="#fde8c8" />
      <circle cx="80" cy="136" r="9" fill="#fca5a5" opacity="0.22" />
      <circle cx="120" cy="136" r="9" fill="#fca5a5" opacity="0.22" />
      {/* ── Eyebrows — calm ── */}
      <path d="M 80 118 Q 89 115 97 119" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 103 119 Q 111 115 120 118" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* ── Eyes — steady, forest green ── */}
      <ellipse cx="88" cy="125" rx="6.5" ry="6" fill="#14532d" />
      <ellipse cx="112" cy="125" rx="6.5" ry="6" fill="#14532d" />
      <circle cx="87" cy="124" r="2.8" fill="white" />
      <circle cx="111" cy="124" r="2.8" fill="white" />
      <circle cx="86.5" cy="123.5" r="1.1" fill="#4ade80" />
      <circle cx="110.5" cy="123.5" r="1.1" fill="#4ade80" />
      {/* ── Nose ── */}
      <ellipse cx="100" cy="133" rx="3.5" ry="2.5" fill="#d4a574" />
      {/* ── Calm balanced smile ── */}
      <path d="M 91 144 Q 100 150 109 144" stroke="#7c4b30" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* ── Tunic / cloak body ── */}
      {/* Cloak outer */}
      <path d="M 56 158 Q 42 190 22 258 L 178 258 Q 158 190 144 158 Q 100 148 56 158Z" fill="#166534" />
      {/* Tunic inner */}
      <path d="M 70 160 Q 62 192 58 258 L 142 258 Q 138 192 130 160 Q 100 153 70 160Z" fill="#92400e" opacity="0.65" />
      <path d="M 70 160 Q 62 192 58 258 L 142 258 Q 138 192 130 160 Q 100 153 70 160Z" fill="#78350f" opacity="0.25" />
      {/* Earth-tone vest */}
      <path d="M 78 162 Q 74 192 72 240 L 128 240 Q 126 192 122 162 Q 100 155 78 162Z" fill="#92400e" opacity="0.5" />
      {/* Cloak seam */}
      <line x1="100" y1="158" x2="100" y2="258" stroke="#14532d" strokeWidth="1.5" opacity="0.3" />
      {/* Leather belt */}
      <rect x="60" y="171" width="80" height="10" rx="5" fill="#451a03" />
      <rect x="86" y="168" width="28" height="16" rx="4" fill="#292524" />
      <ellipse cx="100" cy="176" rx="8" ry="6" fill="#78350f" />
      <ellipse cx="100" cy="176" rx="5" ry="4" fill="#92400e" />
      {/* Belt pouches */}
      <rect x="62" y="172" width="14" height="16" rx="4" fill="#451a03" />
      <rect x="124" y="172" width="14" height="16" rx="4" fill="#451a03" />
      {/* ── Left arm + hand ── */}
      <path d="M 68 165 Q 48 192 42 218 L 58 224 Q 66 200 84 174Z" fill="#166534" />
      <circle cx="43" cy="220" r="12" fill="#fde8c8" />
      {/* ── Right arm ── */}
      <path d="M 132 165 Q 152 192 158 218 L 142 224 Q 134 200 116 174Z" fill="#166534" />
      <circle cx="157" cy="220" r="12" fill="#fde8c8" />
      {/* ── Bow (visible at right side) ── */}
      {/* Bow limb */}
      <path d="M 174 120 Q 190 152 174 184" stroke="#92400e" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Bow string */}
      <line x1="174" y1="120" x2="174" y2="184" stroke="#fef3c7" strokeWidth="1.2" opacity="0.8" />
      {/* Grip wrap */}
      <rect x="170" y="148" width="9" height="8" rx="2" fill="#451a03" />
      {/* Arrow quiver hint */}
      <rect x="162" y="160" width="8" height="28" rx="3" fill="#451a03" opacity="0.75" />
      <line x1="166" y1="160" x2="166" y2="148" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <path d="M 163 149 L 166 143 L 169 149Z" fill="#ca8a04" />
      {/* ── Leaf badge on cloak ── */}
      <ellipse cx="84" cy="188" rx="9" ry="12" fill="#16a34a" opacity="0.7" transform="rotate(-15 84 188)" />
      <line x1="84" y1="180" x2="84" y2="196" stroke="#14532d" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export const ARCHETYPE_AVATARS = {
  "The Creative Explorer": { Avatar: AlchemistAvatar, character: "Alchemist" },
  "The Gentle Healer":     { Avatar: HerbalistAvatar, character: "Herbalist" },
  "The Restful Restorer":  { Avatar: MonkAvatar,      character: "Monk" },
  "The Social Connector":  { Avatar: BardAvatar,      character: "Bard" },
  "The Connoisseur":       { Avatar: NobleAvatar,     character: "Noble" },
  "The Balanced Seeker":   { Avatar: RangerAvatar,    character: "Ranger" },
};
