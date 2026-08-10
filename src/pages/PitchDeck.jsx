import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./PitchDeck.css";

// Pitch pages are public, standalone, and must always load fresh.
// Unregister any stale SW on first render so the live bundle is served.
function useUnregisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
  }, []);
}

// ── Shared felt SVG defs (texture, knit pattern, shadow) ─────────────────────
function FeltDefs() {
  return (
    <defs>
      <filter id="pd-felt" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.82 0.78" numOctaves="5" seed="9" result="n"/>
        <feColorMatrix in="n" type="matrix"
          values="0 0 0 0 0.67  0 0 0 0 0.54  0 0 0 0 0.36  0 0 0 0.065 0" result="c"/>
        <feComposite in="c" in2="SourceGraphic" operator="in"/>
      </filter>
      <filter id="pd-shadow">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.22)"/>
      </filter>
      <filter id="pd-shadow-sm">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.18)"/>
      </filter>
      <filter id="pd-glow-gold">
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(200,168,75,0.5)"/>
      </filter>

      {/* Cream weave background */}
      <pattern id="pd-bg" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#F5EDD8"/>
        <line x1="0" y1="2" x2="8" y2="2" stroke="#C9A84B" strokeWidth="0.5" opacity="0.22"/>
        <line x1="0" y1="6" x2="8" y2="6" stroke="#C9A84B" strokeWidth="0.5" opacity="0.13"/>
        <line x1="2" y1="0" x2="2" y2="8" stroke="#C9A84B" strokeWidth="0.5" opacity="0.18"/>
        <line x1="6" y1="0" x2="6" y2="8" stroke="#C9A84B" strokeWidth="0.5" opacity="0.10"/>
      </pattern>

      {/* Green clothing weave */}
      <pattern id="pd-green" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
        <path d="M0,3 C1.3,1.2 2.7,4.8 4,3 C5.3,1.2 6.7,4.8 8,3"
          fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.9"/>
        <path d="M0,6 C1.3,4.2 2.7,7.8 4,6 C5.3,4.2 6.7,7.8 8,6"
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.9"/>
      </pattern>

      {/* Cream knit */}
      <pattern id="pd-cream" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
        <path d="M0,3 C1.3,1.2 2.7,4.8 4,3 C5.3,1.2 6.7,4.8 8,3"
          fill="none" stroke="rgba(110,70,20,0.08)" strokeWidth="0.9"/>
        <path d="M0,6 C1.3,4.2 2.7,7.8 4,6 C5.3,4.2 6.7,7.8 8,6"
          fill="none" stroke="rgba(110,70,20,0.05)" strokeWidth="0.9"/>
      </pattern>

      {/* Gold stitch pattern */}
      <pattern id="pd-gold" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
        <path d="M0,3 C1.3,1.2 2.7,4.8 4,3 C5.3,1.2 6.7,4.8 8,3"
          fill="none" stroke="rgba(200,168,75,0.35)" strokeWidth="1"/>
      </pattern>
    </defs>
  );
}

// ── Reusable plush figure (scaled, posed per scene) ───────────────────────────
function PlushFigure({ x = 0, y = 0, scale = 1, style = {}, className = "" }) {
  const felt = "#e8d5b8", feltS = "#d4bfa0", clothing = "#3d6b4a";
  const stitch = "#9b7d5a", hair = "#3a2810";
  const g = `translate(${x} ${y}) scale(${scale})`;
  return (
    <g transform={g} style={style} className={className}>
      {/* Arms */}
      <ellipse cx={47} cy={148} rx={15} ry={44} fill={clothing}
        transform="rotate(-12 47 148)" filter="url(#pd-shadow-sm)"/>
      <ellipse cx={47} cy={148} rx={15} ry={44} fill="url(#pd-green)"
        transform="rotate(-12 47 148)"/>
      <ellipse cx={36} cy={190} rx={13} ry={11} fill={felt}/>
      <ellipse cx={36} cy={190} rx={13} ry={11} fill="url(#pd-cream)"/>

      <ellipse cx={153} cy={148} rx={15} ry={44} fill={clothing}
        transform="rotate(12 153 148)" filter="url(#pd-shadow-sm)"/>
      <ellipse cx={153} cy={148} rx={15} ry={44} fill="url(#pd-green)"
        transform="rotate(12 153 148)"/>
      <ellipse cx={164} cy={190} rx={13} ry={11} fill={felt}/>
      <ellipse cx={164} cy={190} rx={13} ry={11} fill="url(#pd-cream)"/>

      {/* Torso */}
      <path d="M68 100 C55 120 57 145 65 168 C68 188 76 204 82 208 L118 208 C124 204 132 188 135 168 C143 145 145 120 132 100 Z"
        fill={clothing} filter="url(#pd-shadow)"/>
      <path d="M68 100 C55 120 57 145 65 168 C68 188 76 204 82 208 L118 208 C124 204 132 188 135 168 C143 145 145 120 132 100 Z"
        fill="url(#pd-green)"/>
      <line x1="100" y1="100" x2="100" y2="206"
        stroke={stitch} strokeWidth="1.1" strokeDasharray="4 3" opacity=".45"/>

      {/* Legs */}
      <rect x="74" y="202" width="24" height="58" rx="12" fill={clothing}/>
      <rect x="74" y="202" width="24" height="58" rx="12" fill="url(#pd-green)"/>
      <rect x="102" y="202" width="24" height="58" rx="12" fill={clothing}/>
      <rect x="102" y="202" width="24" height="58" rx="12" fill="url(#pd-green)"/>

      {/* Feet */}
      <ellipse cx="86"  cy="262" rx="17" ry="11" fill={felt}/>
      <ellipse cx="86"  cy="262" rx="17" ry="11" fill="url(#pd-cream)"/>
      <ellipse cx="114" cy="262" rx="17" ry="11" fill={felt}/>
      <ellipse cx="114" cy="262" rx="17" ry="11" fill="url(#pd-cream)"/>

      {/* Neck + head */}
      <rect x="88" y="80" width="24" height="24" rx="12" fill={felt}/>
      <circle cx="100" cy="46" r="42" fill={felt} filter="url(#pd-shadow)"/>
      <circle cx="100" cy="46" r="42" fill="url(#pd-cream)"/>
      <circle cx="100" cy="46" r="42" fill="none" stroke={stitch} strokeWidth="1.3" strokeDasharray="5 4" opacity=".28"/>

      {/* Hair */}
      <path d="M60 38 Q62 6 100 4 Q138 6 140 38 Q132 18 100 17 Q68 18 60 38Z" fill={hair}/>
      {/* Eyes */}
      <circle cx="87" cy="45" r="4.5" fill={hair}/>
      <circle cx="113" cy="45" r="4.5" fill={hair}/>
      <circle cx="88.5" cy="43.5" r="1.4" fill="rgba(255,255,255,.55)"/>
      <circle cx="114.5" cy="43.5" r="1.4" fill="rgba(255,255,255,.55)"/>
      {/* Smile */}
      <path d="M90 58 Q100 66 110 58" fill="none" stroke={stitch} strokeWidth="2" strokeLinecap="round"/>
      {/* Cheeks */}
      <ellipse cx="78" cy="57" rx="9" ry="6" fill="rgba(220,110,80,.18)"/>
      <ellipse cx="122" cy="57" rx="9" ry="6" fill="rgba(220,110,80,.18)"/>
    </g>
  );
}

// ── Variant plush figure (topColor, bottomColor, beardStyle, glasses, cap, showPatch) ─
function PlushFigureVariant({
  x = 0, y = 0, scale = 1, style = {},
  skinTone = "light", bald = false,
  beardStyle = "none", glasses = false, cap = "none",
  slim = false, showPatch = false,
  topColor = "#3d6b4a", bottomColor = "#3d6b4a",
}) {
  const felt = skinTone === "dark" ? "#8B5430" : "#e8d5b8";
  const stitch = "#9b7d5a";
  const hair = "#3a2810";
  const armRx = slim ? 12 : 15;
  const armRy = slim ? 40 : 44;
  const topPat = topColor === "#3d6b4a" ? "url(#pd-green)" : "url(#pd-cream)";
  const botPat = bottomColor === "#3d6b4a" ? "url(#pd-green)" : "url(#pd-cream)";
  const torsoPath = slim
    ? "M72 100 C62 120 64 145 70 168 C73 188 80 204 85 208 L115 208 C120 204 127 188 130 168 C136 145 138 120 128 100 Z"
    : "M68 100 C55 120 57 145 65 168 C68 188 76 204 82 208 L118 208 C124 204 132 188 135 168 C143 145 145 120 132 100 Z";
  const patchBg   = topColor !== "#3d6b4a" ? "#3d6b4a" : "#F5EDD8";
  const patchIcon = topColor !== "#3d6b4a" ? "rgba(255,255,255,.9)" : "#2E6B47";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={style}>
      {/* Arms */}
      <ellipse cx={47} cy={148} rx={armRx} ry={armRy} fill={topColor}
        transform="rotate(-12 47 148)" filter="url(#pd-shadow-sm)"/>
      <ellipse cx={47} cy={148} rx={armRx} ry={armRy} fill={topPat}
        transform="rotate(-12 47 148)"/>
      <ellipse cx={36} cy={190} rx={13} ry={11} fill={felt}/>
      <ellipse cx={36} cy={190} rx={13} ry={11} fill="url(#pd-cream)"/>
      <ellipse cx={153} cy={148} rx={armRx} ry={armRy} fill={topColor}
        transform="rotate(12 153 148)" filter="url(#pd-shadow-sm)"/>
      <ellipse cx={153} cy={148} rx={armRx} ry={armRy} fill={topPat}
        transform="rotate(12 153 148)"/>
      <ellipse cx={164} cy={190} rx={13} ry={11} fill={felt}/>
      <ellipse cx={164} cy={190} rx={13} ry={11} fill="url(#pd-cream)"/>
      {/* Torso */}
      <path d={torsoPath} fill={topColor} filter="url(#pd-shadow)"/>
      <path d={torsoPath} fill={topPat}/>
      <line x1="100" y1="100" x2="100" y2="206"
        stroke={stitch} strokeWidth="1.1" strokeDasharray="4 3" opacity=".45"/>
      {/* Legs */}
      <rect x="74" y="202" width="24" height="58" rx="12" fill={bottomColor}/>
      <rect x="74" y="202" width="24" height="58" rx="12" fill={botPat}/>
      <rect x="102" y="202" width="24" height="58" rx="12" fill={bottomColor}/>
      <rect x="102" y="202" width="24" height="58" rx="12" fill={botPat}/>
      {/* Feet */}
      <ellipse cx="86"  cy="262" rx="17" ry="11" fill={felt}/>
      <ellipse cx="86"  cy="262" rx="17" ry="11" fill="url(#pd-cream)"/>
      <ellipse cx="114" cy="262" rx="17" ry="11" fill={felt}/>
      <ellipse cx="114" cy="262" rx="17" ry="11" fill="url(#pd-cream)"/>
      {/* Neck + head */}
      <rect x="88" y="80" width="24" height="24" rx="12" fill={felt}/>
      <circle cx="100" cy="46" r="42" fill={felt} filter="url(#pd-shadow)"/>
      <circle cx="100" cy="46" r="42" fill="url(#pd-cream)"/>
      <circle cx="100" cy="46" r="42" fill="none" stroke={stitch} strokeWidth="1.3" strokeDasharray="5 4" opacity=".28"/>
      {/* Backwards baseball cap */}
      {cap === "backwards" && (
        <>
          <path d="M60 34 Q62 4 100 3 Q138 4 140 34 Q128 16 100 15 Q72 16 60 34Z" fill="#1A3D2B"/>
          <path d="M140 27 Q162 22 168 32 Q165 42 142 38 Z" fill="#1A3D2B" opacity="0.88"/>
          <circle cx="100" cy="5" r="4.5" fill="#C9A84B"/>
          <path d="M62 32 Q100 40 138 32" fill="none" stroke="#C9A84B" strokeWidth="2" opacity="0.55"/>
          <rect x="138" y="34" width="14" height="5" rx="2" fill="#C9A84B" opacity="0.55"/>
        </>
      )}
      {/* Hair (skip if bald or capped) */}
      {!bald && cap === "none" && (
        <path d="M60 38 Q62 6 100 4 Q138 6 140 38 Q132 18 100 17 Q68 18 60 38Z" fill={hair}/>
      )}
      {/* Eyes */}
      <circle cx="87" cy="45" r="4.5" fill={hair}/>
      <circle cx="113" cy="45" r="4.5" fill={hair}/>
      <circle cx="88.5" cy="43.5" r="1.4" fill="rgba(255,255,255,.55)"/>
      <circle cx="114.5" cy="43.5" r="1.4" fill="rgba(255,255,255,.55)"/>
      {/* Glasses */}
      {glasses && (
        <>
          <circle cx="87" cy="45" r="10" fill="rgba(200,230,255,0.07)" stroke={hair} strokeWidth="2.5" opacity="0.75"/>
          <circle cx="113" cy="45" r="10" fill="rgba(200,230,255,0.07)" stroke={hair} strokeWidth="2.5" opacity="0.75"/>
          <line x1="97" y1="45" x2="103" y2="45" stroke={hair} strokeWidth="2" opacity="0.75"/>
          <line x1="77" y1="46" x2="63" y2="49" stroke={hair} strokeWidth="2" opacity="0.75"/>
          <line x1="123" y1="46" x2="137" y2="49" stroke={hair} strokeWidth="2" opacity="0.75"/>
        </>
      )}
      {/* Smile */}
      <path d="M90 58 Q100 66 110 58" fill="none" stroke={stitch} strokeWidth="2" strokeLinecap="round"/>
      {/* Normal beard */}
      {beardStyle === "normal" && (
        <>
          <path d="M84 56 Q80 70 83 80 Q91 88 100 88 Q109 88 117 80 Q120 70 116 56 Q110 62 100 63 Q90 62 84 56Z"
            fill={hair} opacity="0.88"/>
          <path d="M88 53 Q94 48 100 49 Q106 48 112 53 Q107 57 100 56 Q93 57 88 53Z"
            fill={hair} opacity="0.9"/>
        </>
      )}
      {/* ZZ Top — very long flowing beard */}
      {beardStyle === "zztop" && (
        <>
          <path d="M81 56 Q77 82 79 115 Q82 155 85 195 Q90 228 100 248 Q110 228 115 195 Q118 155 121 115 Q123 82 119 56 Q112 63 100 64 Q88 63 81 56Z"
            fill={hair} opacity="0.93"/>
          <line x1="93" y1="90" x2="90" y2="220" stroke="rgba(255,255,255,.09)" strokeWidth="2.5"/>
          <line x1="100" y1="90" x2="100" y2="235" stroke="rgba(255,255,255,.07)" strokeWidth="2.5"/>
          <line x1="107" y1="90" x2="110" y2="220" stroke="rgba(255,255,255,.09)" strokeWidth="2.5"/>
          <path d="M86 53 Q93 47 100 48 Q107 47 114 53 Q108 57 100 56 Q92 57 86 53Z"
            fill={hair} opacity="0.95"/>
        </>
      )}
      {/* Cheeks */}
      <ellipse cx="78" cy="57" rx="9" ry="6" fill="rgba(220,110,80,.18)"/>
      <ellipse cx="122" cy="57" rx="9" ry="6" fill="rgba(220,110,80,.18)"/>
      {/* Mycana logo patch — actual favicon plant paths, always rendered on top */}
      {showPatch && (
        <g transform="translate(82 110) scale(0.818)">
          <rect x="1.5" y="1.5" width="41" height="41" rx="12" fill={patchBg}/>
          <rect x="5.5" y="5.5" width="33" height="33" rx="8" fill="none"
            stroke="rgba(255,255,255,.35)" strokeWidth="1.3" strokeDasharray="4 3"/>
          <line x1="22" y1="38" x2="22" y2="29.5" stroke={patchIcon} strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M22 30 C18 22 17 15 22 9 C27 15 26 22 22 30Z" fill={patchIcon}/>
          <path d="M21 28 C16 23 9 19 10 12 C14 12 18 18 21 24Z" fill={patchIcon} opacity="0.82"/>
          <path d="M23 28 C28 23 35 19 34 12 C30 12 26 18 23 24Z" fill={patchIcon} opacity="0.82"/>
          <path d="M21 27 C14 25 7 22 7 16 C11 15 17 20 21 24Z" fill={patchIcon} opacity="0.62"/>
          <path d="M23 27 C30 25 37 22 37 16 C33 15 27 20 23 24Z" fill={patchIcon} opacity="0.62"/>
        </g>
      )}
    </g>
  );
}

// ── Cannabis leaf embroidery (decorative) ─────────────────────────────────────
function CannabisLeaf({ x, y, size = 1, color = "#2E6B47", opacity = 0.7 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} opacity={opacity}
      style={{ animation: "leaf-sway 5s ease-in-out infinite", transformOrigin: `${x}px ${y + 18}px` }}>
      <path d="M0,-20 C-4,-12 -14,-8 -18,0 C-12,2 -6,0 0,-4 C6,0 12,2 18,0 C14,-8 4,-12 0,-20Z"
        fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
      <path d="M0,-8 C-8,-4 -16,4 -14,14 C-8,10 -4,4 0,0 C4,4 8,10 14,14 C16,4 8,-4 0,-8Z"
        fill={color}/>
      <path d="M0,0 C-10,8 -12,18 -8,24 C-4,20 -2,10 0,4 C2,10 4,20 8,24 C12,18 10,8 0,0Z"
        fill={color}/>
      <line x1="0" y1="-20" x2="0" y2="26" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
    </g>
  );
}

// ── Stitched border rect helper ───────────────────────────────────────────────
function StitchedRect({ x, y, w, h, rx = 10, fill, stroke = "#8B6914", opacity = 0.45, animate = false }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} filter="url(#pd-shadow)"/>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill="url(#pd-bg)" filter="url(#pd-felt)"/>
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} rx={rx - 3}
        fill="none" stroke={stroke} strokeWidth="2" strokeDasharray="7 5" opacity={opacity}
        style={animate ? { animation: "stitch-draw 2s ease-out forwards" } : {}}/>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 1 — CANNABIS CONSUMER
// ════════════════════════════════════════════════════════════════════════════
function SceneConsumer() {
  return (
    <svg viewBox="0 0 560 320" xmlns="http://www.w3.org/2000/svg" className="pd-scene">
      <FeltDefs/>

      {/* Felt background */}
      <rect width="560" height="320" rx="18" fill="url(#pd-bg)" filter="url(#pd-felt)"/>
      <rect x="8" y="8" width="544" height="304" rx="13"
        fill="none" stroke="#8B6914" strokeWidth="2.2" strokeDasharray="9 6" opacity=".42"
        style={{ animation: "stitch-draw 2.5s ease-out forwards" }}/>

      {/* Cannabis leaf accents */}
      <CannabisLeaf x={42} y={42} size={1.1} opacity={0.25}/>
      <CannabisLeaf x={520} y={50} size={0.85} opacity={0.2}/>
      <CannabisLeaf x={530} y={285} size={0.9} opacity={0.18}/>
      <CannabisLeaf x={28} y={295} size={0.8} opacity={0.2}/>

      {/* Plush figure — left side */}
      <PlushFigure x={-12} y={28} scale={0.5}
        style={{ animation: "felt-float 5s ease-in-out infinite" }}/>

      {/* Phone / tablet — center */}
      <g style={{ animation: "felt-slide-right 0.7s 0.3s ease-out both" }}>
        <StitchedRect x={185} y={50} w={110} h={175} rx={12} fill="#2a4a35" stroke="#C9A84B" opacity={0.5}/>
        {/* Screen */}
        <rect x={193} y={65} width={94} height={130} rx={6} fill="#1a2e22"/>
        <rect x={193} y={65} width={94} height={130} rx={6} fill="url(#pd-green)" opacity={0.4}/>

        {/* "Profile" label on screen */}
        <rect x={203} y={73} width={74} height={14} rx={4} fill="#C9A84B" filter="url(#pd-shadow-sm)"/>
        <rect x={203} y={73} width={74} height={14} rx={4} fill="url(#pd-gold)" opacity={0.6}/>
        <text x="240" y="83.5" textAnchor="middle" fontSize="7" fill="#1A3D2B" fontWeight="bold" letterSpacing="0.5">PROFILE</text>

        {/* Slider bars */}
        {[0,1,2,3].map(i => (
          <g key={i} transform={`translate(200 ${96 + i * 26})`}
            style={{ animation: `felt-slide-right ${0.6 + i * 0.15}s ${0.6 + i * 0.1}s ease-out both` }}>
            <rect x={0} y={2} width={80} height={6} rx={3} fill="rgba(255,255,255,0.08)"/>
            <rect x={0} y={2} width={[52,34,65,45][i]} height={6} rx={3} fill={["#C9A84B","#3d9b5a","#6B8BE0","#C9A84B"][i]}/>
            <circle cx={[52,34,65,45][i]} cy={5} r={5} fill="#F5EDD8" stroke="#8B6914" strokeWidth="1.5"/>
            <text x={0} y={0} fontSize="5.5" fill="rgba(255,255,255,0.6)" letterSpacing="0.3">
              {["THC Sensitivity","Effect Profile","CBD Balance","Anxiety"][i]}
            </text>
          </g>
        ))}

        {/* Bottom button */}
        <rect x={204} y={188} width={72} height={14} rx={7} fill="#2E6B47"/>
        <text x="240" y="197.5" textAnchor="middle" fontSize="6.5" fill="#fff" fontWeight="bold">Get My Profile</text>
      </g>

      {/* Archetype badge — floating top right */}
      <g transform="translate(335 38)"
        style={{ animation: "felt-pop 0.7s 1.2s cubic-bezier(.34,1.56,.64,1) both" }}>
        <StitchedRect x={0} y={0} w={160} h={82} rx={12} fill="#F5EDD8" stroke="#C9A84B" opacity={0.55}/>
        <CannabisLeaf x={16} y={20} size={0.7} color="#2E6B47" opacity={0.6}/>
        <text x="32" y="18" fontSize="7.5" fill="#8B6914" fontWeight="bold" letterSpacing="0.8">ARCHETYPE</text>
        <text x="16" y="36" fontSize="11" fill="#1A3D2B" fontFamily="Georgia, serif" fontWeight="normal">The Restful</text>
        <text x="16" y="50" fontSize="11" fill="#1A3D2B" fontFamily="Georgia, serif" fontWeight="normal">Restorer</text>
        <text x="16" y="66" fontSize="7" fill="#5A7A5A" letterSpacing="0.3">Indica · Myrcene-forward</text>
        <circle cx="148" cy="12" r="7" fill="#C9A84B" filter="url(#pd-glow-gold)"/>
        <text x="148" y="15.5" textAnchor="middle" fontSize="9">🌙</text>
      </g>

      {/* Prestige badge */}
      <g transform="translate(340 138)"
        style={{ animation: "badge-spin-in 0.8s 1.6s cubic-bezier(.34,1.56,.64,1) both" }}>
        <circle cx="50" cy="34" r="32" fill="#2E6B47" filter="url(#pd-shadow)"/>
        <circle cx="50" cy="34" r="32" fill="url(#pd-green)"/>
        <circle cx="50" cy="34" r="28" fill="none" stroke="#C9A84B" strokeWidth="2" strokeDasharray="5 3.5"/>
        <text x="50" y="27" textAnchor="middle" fontSize="14" fill="#C9A84B">🌱</text>
        <text x="50" y="39" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" letterSpacing="0.5">PRESTIGE</text>
        <text x="50" y="50" textAnchor="middle" fontSize="9" fill="#C9A84B" fontWeight="bold">+40 pts</text>
      </g>

      {/* Leaderboard snippet */}
      <g transform="translate(405 130)"
        style={{ animation: "felt-slide-left 0.7s 1.8s ease-out both" }}>
        <StitchedRect x={0} y={0} w={130} h={90} rx={10} fill="#F5EDD8" stroke="#8B6914" opacity={0.4}/>
        <text x="10" y="18" fontSize="7.5" fill="#8B6914" fontWeight="bold" letterSpacing="0.6">LEADERBOARD</text>
        {[
          { rank: "🥇", name: "You",        pts: "240" },
          { rank: "🥈", name: "JSmoke99",   pts: "185" },
          { rank: "🥉", name: "GreenMage",  pts: "120" },
        ].map((r, i) => (
          <g key={i} transform={`translate(8 ${26 + i * 20})`}>
            <text x="0" y="10" fontSize="9">{r.rank}</text>
            <text x="16" y="10" fontSize="7.5" fill="#3A4A38">{r.name}</text>
            <text x="100" y="10" fontSize="7.5" fill="#2E6B47" fontWeight="bold" textAnchor="end">{r.pts}</text>
          </g>
        ))}
      </g>

      {/* Bottom label */}
      <g style={{ animation: "felt-slide-up 0.6s 2s ease-out both" }}>
        <rect x="156" y="276" width="248" height="24" rx="12" fill="#1A3D2B"/>
        <rect x="156" y="276" width="248" height="24" rx="12" fill="url(#pd-green)"/>
        <text x="280" y="292" textAnchor="middle" fontSize="9" fill="#C9A84B" fontWeight="bold" letterSpacing="0.8">
          KNOW YOUR CANNABIS · mycana.info
        </text>
      </g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 2 — LICENSED DISPENSARY / STOREFRONT
// ════════════════════════════════════════════════════════════════════════════
function SceneStorefront() {
  return (
    <svg viewBox="0 0 560 320" xmlns="http://www.w3.org/2000/svg" className="pd-scene">
      <FeltDefs/>
      <rect width="560" height="320" rx="18" fill="url(#pd-bg)" filter="url(#pd-felt)"/>
      <rect x="8" y="8" width="544" height="304" rx="13"
        fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeDasharray="9 6" opacity=".4"
        style={{ animation: "stitch-draw 2.5s ease-out forwards" }}/>

      {/* Store building */}
      <g style={{ animation: "felt-slide-up 0.8s 0.2s ease-out both" }}>
        {/* Store facade */}
        <rect x="30" y="90" width="220" height="190" rx="10" fill="#2a4a35" filter="url(#pd-shadow)"/>
        <rect x="30" y="90" width="220" height="190" rx="10" fill="url(#pd-green)"/>
        {/* Awning */}
        <rect x="20" y="82" width="240" height="28" rx="6" fill="#C9A84B"/>
        <rect x="20" y="82" width="240" height="28" rx="6" fill="url(#pd-gold)"/>
        {[0,1,2,3,4,5].map(i => (
          <line key={i} x1={28 + i*40} y1="82" x2={28 + i*40} y2="110"
            stroke="#8B6914" strokeWidth="1.5" opacity="0.5"/>
        ))}
        <text x="140" y="101" textAnchor="middle" fontSize="10" fill="#1A3D2B" fontWeight="bold" letterSpacing="0.6">
          GREEN LEAF DISPENSARY
        </text>
        {/* Window */}
        <rect x="50" y="118" width="80" height="60" rx="5" fill="rgba(100,200,140,0.15)" stroke="#C9A84B" strokeWidth="1.5"/>
        <line x1="90" y1="118" x2="90" y2="178" stroke="#C9A84B" strokeWidth="1" opacity="0.5"/>
        <line x1="50" y1="148" x2="130" y2="148" stroke="#C9A84B" strokeWidth="1" opacity="0.5"/>
        {/* Door */}
        <rect x="160" y="138" width="60" height="90" rx="6" fill="#1a2e22"/>
        <circle cx="184" cy="185" r="4" fill="#C9A84B"/>
        {/* OPEN sign */}
        <rect x="155" y="118" width="70" height="16" rx="4" fill="#10b981"/>
        <text x="190" y="129" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold" letterSpacing="1">OPEN</text>
        {/* Sign board */}
        <rect x="40" y="245" width="200" height="28" rx="6" fill="#F5EDD8"/>
        <rect x="40" y="245" width="200" height="28" rx="6" fill="url(#pd-bg)" filter="url(#pd-felt)"/>
        <rect x="44" y="249" width="192" height="20" rx="4" fill="none" stroke="#8B6914" strokeWidth="1.5" strokeDasharray="5 3.5" opacity="0.5"/>
        <text x="140" y="261" textAnchor="middle" fontSize="7" fill="#1A3D2B" fontWeight="bold" letterSpacing="0.5">STANDARD · $49/mo</text>
        <text x="140" y="270" textAnchor="middle" fontSize="6" fill="#5A7A5A">List products · Appear on Discover</text>
      </g>

      {/* Plush figure at counter */}
      <PlushFigure x={135} y={30} scale={0.42}
        style={{ animation: "felt-float 5.5s 0.3s ease-in-out infinite" }}/>

      {/* Product shelf — right side */}
      <g style={{ animation: "felt-slide-left 0.8s 0.5s ease-out both" }}>
        <StitchedRect x={295} y={50} w={235} h={200} rx={12} fill="#F5EDD8" stroke="#7C3AED" opacity={0.45}/>
        <text x="412" y="72" textAnchor="middle" fontSize="9" fill="#7C3AED" fontWeight="bold" letterSpacing="0.8">VENDOR DASHBOARD</text>

        {/* Product cards on shelf */}
        {[
          { name: "Blue Dream", cat: "Flower", thc: "22%", col: "#3d9b5a" },
          { name: "OG Kush",    cat: "Vape",   thc: "78%", col: "#6B8BE0" },
          { name: "CBD Gummy",  cat: "Edible", thc: "10mg",col: "#C9A84B" },
        ].map((p, i) => (
          <g key={i} transform={`translate(308 ${82 + i * 54})`}
            style={{ animation: `felt-slide-left 0.5s ${0.8 + i * 0.15}s ease-out both` }}>
            <rect width="210" height="46" rx="8" fill={p.col} opacity={0.12}/>
            <rect width="210" height="46" rx="8" fill="none" stroke={p.col} strokeWidth="1.2" opacity={0.3}/>
            <rect x="6" y="6" width="34" height="34" rx="6" fill={p.col} opacity={0.25}/>
            <text x="23" y="27" textAnchor="middle" fontSize="16">🌿</text>
            <text x="50" y="20" fontSize="9" fill="#1A3D2B" fontWeight="bold">{p.name}</text>
            <text x="50" y="31" fontSize="7" fill="#5A7A5A">{p.cat}</text>
            <rect x="148" y="12" width="52" height="18" rx="9" fill={p.col} opacity={0.8}/>
            <text x="174" y="24" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">THC {p.thc}</text>
          </g>
        ))}

        {/* Catalog QR + link */}
        <g transform="translate(308 252)">
          <rect width="210" height="34" rx="8" fill="#1A3D2B" opacity={0.9}/>
          <rect x="6" y="6" width="22" height="22" rx="3" fill="#F5EDD8"/>
          {/* Mini QR */}
          {[0,1,2].map(r => [0,1,2].map(c => (
            <rect key={`${r}${c}`} x={9 + c*5} y={9 + r*5} width="3" height="3"
              fill={Math.random() > 0.4 ? "#1A3D2B" : "#F5EDD8"} rx="0.5"/>
          )))}
          <text x="34" y="18" fontSize="7.5" fill="#C9A84B" fontWeight="bold">Public Catalog URL</text>
          <text x="34" y="28" fontSize="6.5" fill="#a0c0a0">mycana.info/catalog/your-store</text>
        </g>
      </g>

      {/* Order notification */}
      <g transform="translate(330 262)"
        style={{ animation: "felt-pop 0.7s 1.8s cubic-bezier(.34,1.56,.64,1) both" }}>
        <rect width="120" height="30" rx="15" fill="#10b981" filter="url(#pd-shadow-sm)"/>
        <text x="14" y="19" fontSize="13">📦</text>
        <text x="33" y="15" fontSize="7.5" fill="#fff" fontWeight="bold">New Order!</text>
        <text x="33" y="25" fontSize="6.5" fill="rgba(255,255,255,0.8)">Riverside Cannabis</text>
      </g>

      <g style={{ animation: "felt-slide-up 0.6s 2.2s ease-out both" }}>
        <rect x="156" y="288" width="248" height="20" rx="10" fill="#7C3AED" opacity={0.9}/>
        <text x="280" y="301" textAnchor="middle" fontSize="8.5" fill="#fff" fontWeight="bold" letterSpacing="0.7">
          LIST · SELL · ORDER WHOLESALE
        </text>
      </g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 3 — WHOLESALE SUPPLIER
// ════════════════════════════════════════════════════════════════════════════
function SceneSupplier() {
  return (
    <svg viewBox="0 0 560 320" xmlns="http://www.w3.org/2000/svg" className="pd-scene">
      <FeltDefs/>
      <rect width="560" height="320" rx="18" fill="url(#pd-bg)" filter="url(#pd-felt)"/>
      <rect x="8" y="8" width="544" height="304" rx="13"
        fill="none" stroke="#C9A84B" strokeWidth="2.2" strokeDasharray="9 6" opacity=".45"
        style={{ animation: "stitch-draw 2.5s ease-out forwards" }}/>

      <CannabisLeaf x={50} y={45} size={1.3} opacity={0.22}/>
      <CannabisLeaf x={510} y={270} size={1.0} opacity={0.18}/>

      {/* Warehouse shelf — left */}
      <g style={{ animation: "felt-slide-right 0.8s 0.2s ease-out both" }}>
        <StitchedRect x={20} y={60} w={180} h={230} rx={10} fill="#2a4a35" stroke="#C9A84B" opacity={0.5}/>
        <text x="110" y="82" textAnchor="middle" fontSize="8.5" fill="#C9A84B" fontWeight="bold" letterSpacing="0.8">NY FARM CO</text>
        <text x="110" y="93" textAnchor="middle" fontSize="6" fill="rgba(200,168,75,0.6)" letterSpacing="0.5">WHOLESALE CATALOG</text>

        {/* Inventory boxes */}
        {[
          { label: "Flower",   n: "48 SKUs",  col: "#3d9b5a" },
          { label: "Vapes",    n: "24 SKUs",  col: "#6B8BE0" },
          { label: "Edibles",  n: "18 SKUs",  col: "#C9A84B" },
          { label: "Prerolls", n: "32 SKUs",  col: "#9b5a3d" },
        ].map((b, i) => (
          <g key={i} transform={`translate(30 ${102 + i * 44})`}
            style={{ animation: `felt-slide-right 0.5s ${0.5 + i * 0.12}s ease-out both` }}>
            <rect width="160" height="36" rx="7" fill={b.col} opacity={0.18}/>
            <rect width="160" height="36" rx="7" fill="none" stroke={b.col} strokeWidth="1.2" opacity={0.4}/>
            <rect x="6" y="6" width="24" height="24" rx="5" fill={b.col} opacity={0.5}/>
            <text x="18" y="22" textAnchor="middle" fontSize="13">📦</text>
            <text x="40" y="18" fontSize="9" fill="#F5EDD8" fontWeight="bold">{b.label}</text>
            <text x="40" y="29" fontSize="7" fill="rgba(245,237,216,0.65)">{b.n}</text>
            <circle cx="148" cy="18" r="5" fill={b.col}
              style={{ animation: "blink-dot 2s infinite", animationDelay: `${i * 0.5}s` }}/>
            <text x="148" y="21.5" textAnchor="middle" fontSize="5.5" fill="#fff">●</text>
          </g>
        ))}
      </g>

      {/* Plush figure with clipboard */}
      <PlushFigure x={89} y={18} scale={0.44}
        style={{ animation: "felt-float 4.5s 0.5s ease-in-out infinite" }}/>
      {/* Clipboard */}
      <g transform="translate(155 110)">
        <rect width="45" height="58" rx="4" fill="#8B6914" filter="url(#pd-shadow-sm)"/>
        <rect x="2" y="2" width="41" height="54" rx="3" fill="#F5EDD8"/>
        <rect x="14" y="-4" width="17" height="10" rx="3" fill="#8B6914"/>
        {[0,1,2,3,4].map(i => (
          <line key={i} x1="6" y1={14 + i * 8} x2="39" y2={14 + i * 8}
            stroke="#C9A84B" strokeWidth="1.2" strokeDasharray="2 2" opacity={0.6}/>
        ))}
      </g>

      {/* Order flow arrows */}
      <g style={{ animation: "order-flow 2s 1.2s ease-out both" }}>
        <path d="M205 155 Q280 130 340 175" fill="none" stroke="#C9A84B" strokeWidth="3"
          strokeDasharray="120" strokeDashoffset="0" strokeLinecap="round"/>
        <path d="M205 185 Q280 195 340 215" fill="none" stroke="#10b981" strokeWidth="2.5"
          strokeDasharray="120" strokeDashoffset="0" strokeLinecap="round" opacity={0.7}/>
        {/* Arrow heads */}
        <polygon points="338,168 350,175 338,183" fill="#C9A84B"/>
        <polygon points="338,208 350,215 338,222" fill="#10b981"/>
      </g>

      {/* Dispensary recipients — right side */}
      <g style={{ animation: "felt-slide-left 0.8s 0.8s ease-out both" }}>
        {[
          { name: "Buffalo Buds",    y: 80,  col: "#6B8BE0" },
          { name: "Niagara Greens",  y: 160, col: "#10b981" },
          { name: "WNY Cannabis Co", y: 240, col: "#C9A84B" },
        ].map((d, i) => (
          <g key={i} transform={`translate(348 ${d.y})`}>
            <StitchedRect x={0} y={0} w={190} h={60} rx={9} fill="#F5EDD8" stroke={d.col} opacity={0.5}/>
            <rect x="8" y="10" width="40" height="40" rx="6" fill={d.col} opacity={0.2}/>
            <text x="28" y="34" textAnchor="middle" fontSize="20">🏪</text>
            <text x="58" y="24" fontSize="9" fill="#1A3D2B" fontWeight="bold">{d.name}</text>
            <text x="58" y="35" fontSize="6.5" fill="#5A7A5A">Licensed Dispensary</text>
            <rect x="130" y="18" width="50" height="18" rx="9" fill={d.col} opacity={0.8}>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
            </rect>
            <text x="155" y="30" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">Order →</text>
          </g>
        ))}
      </g>

      {/* vs Leaflink comparison strip */}
      <g style={{ animation: "felt-slide-up 0.7s 2s ease-out both" }}>
        <rect x="18" y="295" width="524" height="18" rx="9" fill="#1A3D2B" opacity={0.9}/>
        <text x="280" y="307.5" textAnchor="middle" fontSize="8" fill="#C9A84B" fontWeight="bold" letterSpacing="0.8">
          REPLACES OR SUPPLEMENTS LEAFLINK · BUILT FOR NYS CULTIVATORS
        </text>
      </g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 4 — PLATFORM / ADMIN
// ════════════════════════════════════════════════════════════════════════════
function ScenePlatform() {
  return (
    <svg viewBox="0 0 560 320" xmlns="http://www.w3.org/2000/svg" className="pd-scene">
      <FeltDefs/>
      <rect width="560" height="320" rx="18" fill="url(#pd-bg)" filter="url(#pd-felt)"/>
      <rect x="8" y="8" width="544" height="304" rx="13"
        fill="none" stroke="#2E6B47" strokeWidth="2.2" strokeDasharray="9 6" opacity=".45"
        style={{ animation: "stitch-draw 2.5s ease-out forwards" }}/>

      <CannabisLeaf x={34} y={34} size={1.0} opacity={0.22}/>
      <CannabisLeaf x={526} y={34} size={0.85} opacity={0.2}/>

      {/* Main dashboard panel */}
      <g style={{ animation: "felt-slide-right 0.8s 0.2s ease-out both" }}>
        <StitchedRect x={20} y={50} w={250} h={230} rx={12} fill="#1A2E20" stroke="#C9A84B" opacity={0.5}/>
        <text x="145" y="74" textAnchor="middle" fontSize="9.5" fill="#C9A84B" fontWeight="bold" letterSpacing="0.8">ADMIN DASHBOARD</text>

        {/* Stat tiles */}
        {[
          { label: "Vendors",   n: "12",   col: "#3d9b5a", icon: "🏪" },
          { label: "Users",     n: "847",  col: "#6B8BE0", icon: "👤" },
          { label: "MRR",       n: "$1.2k",col: "#C9A84B", icon: "💰" },
          { label: "Logs",      n: "2,341",col: "#e05a3d", icon: "📋" },
        ].map((s, i) => (
          <g key={i} transform={`translate(${28 + (i % 2) * 120} ${86 + Math.floor(i / 2) * 68})`}
            style={{ animation: `felt-pop 0.6s ${0.6 + i * 0.12}s cubic-bezier(.34,1.56,.64,1) both` }}>
            <rect width="108" height="56" rx="8" fill={s.col} opacity={0.14}/>
            <rect width="108" height="56" rx="8" fill="none" stroke={s.col} strokeWidth="1.2" opacity={0.35}/>
            <text x="10" y="22" fontSize="16">{s.icon}</text>
            <text x="32" y="22" fontSize="15" fill={s.col} fontWeight="bold"
              style={{ animation: "count-up 0.5s 1s ease-out both", fontVariantNumeric: "tabular-nums" }}>
              {s.n}
            </text>
            <text x="10" y="38" fontSize="7.5" fill="rgba(245,237,216,0.6)" letterSpacing="0.4">{s.label}</text>
          </g>
        ))}

        {/* Revenue bar chart */}
        <g transform="translate(28 230)">
          <text x="0" y="0" fontSize="7" fill="#C9A84B" fontWeight="bold" letterSpacing="0.5">MONTHLY REVENUE</text>
          {[18, 28, 22, 42, 38, 58].map((h, i) => (
            <g key={i} transform={`translate(${i * 34} 5)`}>
              <rect x="4" y={55 - h} width="26" height={h} rx="4" fill="#C9A84B" opacity={0.7}
                style={{ animation: `felt-slide-up 0.5s ${1.2 + i * 0.08}s ease-out both`, transformOrigin: `${4 + 13}px 60px` }}/>
              <text x="17" y="68" textAnchor="middle" fontSize="5.5" fill="rgba(245,237,216,0.5)">
                {["M3","M4","M5","M6","M7","M8"][i]}
              </text>
            </g>
          ))}
        </g>
      </g>

      {/* Founding Team — centered at x=280 in 560-wide scene */}
      <g style={{ animation: "felt-float 5s 0.8s ease-in-out infinite" }}>
        {/* Felt backing card — x=190, width=180, center=280 */}
        <rect x={190} y={5} width={180} height={138} rx={10} fill="#F5EDD8" opacity={0.92} filter="url(#pd-shadow)"/>
        <rect x={190} y={5} width={180} height={138} rx={10} fill="url(#pd-bg)" filter="url(#pd-felt)"/>
        <rect x={195} y={10} width={170} height={128} rx={7} fill="none" stroke="#C9A84B" strokeWidth="1.5" strokeDasharray="5 3" opacity={0.45}/>
        {/* Label pill — centered at x=280 */}
        <rect x={238} y={7} width={84} height={13} rx={6} fill="#C9A84B" opacity={0.92}/>
        <text x={280} y={17} textAnchor="middle" fontSize="6" fill="#1A3D2B" fontWeight="bold" letterSpacing="0.8">FOUNDING TEAM</text>
        {/* John Girdlestone — cream top, green pants, cap/glasses/ZZ Top beard */}
        <PlushFigureVariant x={207} y={18} scale={0.38}
          cap="backwards" glasses={true} beardStyle="zztop" showPatch={true}
          topColor="#EDE3CE" bottomColor="#3d6b4a"/>
        <text x={245} y={126} textAnchor="middle" fontSize="6" fill="#1A3D2B" fontWeight="bold">John G.</text>
        <text x={245} y={134} textAnchor="middle" fontSize="5" fill="#8B6914">Visionary Founder</text>
        {/* DeMarkus Wilson — green top, tan pants, brown skin/bald/slim */}
        <PlushFigureVariant x={277} y={18} scale={0.38}
          skinTone="dark" bald={true} slim={true} showPatch={true}
          topColor="#3d6b4a" bottomColor="#C19A6B"/>
        <text x={315} y={126} textAnchor="middle" fontSize="6" fill="#1A3D2B" fontWeight="bold">DeMarkus W.</text>
        <text x={315} y={134} textAnchor="middle" fontSize="5" fill="#8B6914">Architect Founder</text>
      </g>

      {/* User network — right side */}
      <g style={{ animation: "felt-slide-left 0.8s 0.6s ease-out both" }}>
        <StitchedRect x={290} y={50} w={250} h={100} rx={10} fill="#F5EDD8" stroke="#3d9b5a" opacity={0.45}/>
        <text x="415" y="70" textAnchor="middle" fontSize="8.5" fill="#2E6B47" fontWeight="bold" letterSpacing="0.6">VENDOR VERIFICATION</text>
        {[
          { name: "NY Farm Co",       status: "premium", col: "#7C3AED" },
          { name: "Buffalo Buds",     status: "standard",col: "#C9A84B" },
          { name: "New Application",  status: "pending", col: "#f59e0b" },
        ].map((v, i) => (
          <g key={i} transform={`translate(300 ${80 + i * 22})`}
            style={{ animation: `felt-slide-left 0.5s ${0.8 + i * 0.1}s ease-out both` }}>
            <text x="0" y="11" fontSize="8.5" fill="#3A4A38">{v.name}</text>
            <rect x="155" y="1" width="60" height="14" rx="7" fill={v.col} opacity={0.8}/>
            <text x="185" y="11.5" textAnchor="middle" fontSize="6.5" fill="#fff" fontWeight="bold">
              {v.status}
            </text>
          </g>
        ))}
      </g>

      {/* Scientific data panel */}
      <g style={{ animation: "felt-slide-left 0.8s 0.9s ease-out both" }}>
        <StitchedRect x={290} y={165} w={250} h={115} rx={10} fill="#F5EDD8" stroke="#6B8BE0" opacity={0.45}/>
        <text x="415" y="183" textAnchor="middle" fontSize="8.5" fill="#1D4ED8" fontWeight="bold" letterSpacing="0.6">SCIENTIFIC DATA LAYER</text>
        <text x="302" y="198" fontSize="7" fill="#4A5A78">Experiences logged: 2,341</text>
        <text x="302" y="210" fontSize="7" fill="#4A5A78">Avg session rating: 4.2 / 5.0</text>
        <text x="302" y="222" fontSize="7" fill="#4A5A78">Top terpene: Myrcene (42%)</text>
        <text x="302" y="234" fontSize="7" fill="#4A5A78">Proprietary BiSlider dataset</text>
        {/* Data flow lines */}
        {[0,1,2,3].map(i => (
          <line key={i} x1={302} y1={244 + i * 6} x2={490} y2={244 + i * 6}
            stroke="#6B8BE0" strokeWidth="1.2" opacity={0.15 + i * 0.05}
            strokeDasharray="3 3">
            <animate attributeName="stroke-dashoffset" values="60;0" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite"/>
          </line>
        ))}
        <text x="302" y="272" fontSize="6.5" fill="#1D4ED8" fontStyle="italic">
          No competitor collects this data
        </text>
      </g>

      {/* Pitch deck launch buttons strip */}
      <g style={{ animation: "felt-slide-up 0.7s 2s ease-out both" }}>
        <rect x="18" y="291" width="524" height="22" rx="11" fill="#1A3D2B"/>
        <text x="280" y="305" textAnchor="middle" fontSize="8.5" fill="#C9A84B" fontWeight="bold" letterSpacing="0.8">
          ADMIN · VERIFY VENDORS · MANAGE TIERS · VIEW DATA
        </text>
      </g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PERSPECTIVE CONFIGS
// ════════════════════════════════════════════════════════════════════════════
const PERSPECTIVES = {
  consumer: {
    label: "Cannabis Consumer",
    eyebrow: "For Your Customers",
    eyebrowColor: "#2563EB",
    title: "Know Your Cannabis.\nBeyond THC%.",
    sub: "A free, personalized profile based on your biology — not the label. Log experiences, earn prestige, and discover products that actually work for you.",
    scene: <SceneConsumer/>,
    cta: { text: "Take the Assessment — Free", href: "/assessment" },
    panels: [
      {
        icon: "🧬",
        accent: "green",
        title: "8-Factor Profile Assessment",
        bullets: [
          "BiSlider system captures THC sensitivity, anxiety, CBD needs, terpene preference & more",
          "Results in a named archetype (e.g. 'The Restful Restorer') with tailored guidance",
          "Takes under 3 minutes · retake any time as you evolve",
        ],
      },
      {
        icon: "📋",
        accent: "blue",
        title: "Experience Logging + AI Scan",
        bullets: [
          "Photograph any product label — AI extracts OCM license, THC%, batch & expiry instantly",
          "Re-run BiSliders after use to record actual felt effects vs. your profile baseline",
          "Verified via NY State Metrc / 1A4 database for product authenticity",
        ],
      },
      {
        icon: "🏆",
        accent: "gold",
        title: "Prestige & Community",
        bullets: [
          "Earn points for every experience logged — reach 7 prestige levels up to 'Mycana Legend'",
          "Global leaderboard with rank, avatar, and level badge",
          "Referral bonuses, 7-day streak multipliers, and community milestones",
        ],
      },
    ],
  },

  storefront: {
    label: "Licensed Dispensary",
    eyebrow: "For Retail Storefronts",
    eyebrowColor: "#7C3AED",
    title: "List. Sell. Order.\nAll in One Place.",
    sub: "List your store and products for local discovery, publish a shareable digital menu, and place wholesale orders with registered suppliers — without a separate B2B portal.",
    scene: <SceneStorefront/>,
    cta: { text: "Register Your Store", href: "/vendor/register" },
    panels: [
      {
        icon: "📦",
        accent: "purple",
        title: "Standard — $49/mo",
        bullets: [
          "Vendor dashboard with full product catalog management",
          "Products appear on Mycana Discover page for consumer browsing",
          "In-stock toggles, THC badges, brand labels, and strain images",
        ],
      },
      {
        icon: "🏪",
        accent: "green",
        title: "Premium — $149/mo",
        bullets: [
          "Public store catalog at mycana.info/catalog/your-store — shareable QR code included",
          "Custom header banner, logo, and store branding",
          "No app download required for customers to browse your menu",
        ],
      },
      {
        icon: "🔗",
        accent: "blue",
        title: "Wholesale Ordering (built in)",
        bullets: [
          "Browse supplier catalogs directly on Discover — see live inventory",
          "Place wholesale orders through Mycana's built-in order form",
          "Orders land instantly in the supplier's dashboard — no emails or phone calls",
        ],
      },
    ],
  },

  supplier: {
    label: "Wholesale Supplier",
    eyebrow: "For Wholesale Cultivators",
    eyebrowColor: "#B07D10",
    title: "Your Catalog. Your Orders.\nOne Platform.",
    sub: "Replace or supplement Leaflink with a live digital product catalog, real-time order intake from licensed dispensaries, and built-in consumer-facing discovery — all under one Premium subscription.",
    scene: <SceneSupplier/>,
    cta: { text: "Register as a Supplier", href: "/vendor/register" },
    panels: [
      {
        icon: "📋",
        accent: "gold",
        title: "Live Inventory Catalog",
        bullets: [
          "Add products with name, brand, category, THC%, strain images, and pricing",
          "Toggle in/out of stock in real time — storefronts see live availability instantly",
          "Public catalog URL + scannable QR code for sharing with buyers offline",
        ],
      },
      {
        icon: "📬",
        accent: "green",
        title: "Wholesale Order Management",
        bullets: [
          "Licensed dispensaries place orders directly through your Mycana catalog",
          "Orders appear in your Vendor Dashboard with full line-item detail",
          "Update order status (pending → confirmed → fulfilled) in one click",
        ],
      },
      {
        icon: "⚖️",
        accent: "blue",
        title: "Mycana vs. Leaflink",
        bullets: [
          "Keep Leaflink and add Mycana as an additional channel — orders stack independently",
          "Or replace Leaflink entirely: same B2B ordering + consumer-facing Discover visibility",
          "Built for NYS cultivators like NY Farm Co — fraction of the cost, more reach",
        ],
      },
    ],
  },

  platform: {
    label: "Platform Owner / Admin",
    eyebrow: "Internal Operations",
    eyebrowColor: "#1A3D2B",
    title: "Verify. Manage.\nGrow.",
    sub: "Full visibility into vendor applications, subscription tiers, and the proprietary scientific dataset growing with every logged experience. The only cannabis platform collecting structured, profile-matched consumption data at scale.",
    scene: <ScenePlatform/>,
    cta: { text: "Admin Portal", href: "/admin" },
    panels: [
      {
        icon: "✅",
        accent: "green",
        title: "Vendor Lifecycle",
        bullets: [
          "All signups land in pending_verification — manually review NY State license before approving",
          "Upgrade or downgrade tiers; set priority ranking in the Discover feed",
          "Premium vendors auto-appear higher; pin or boost specific partners",
        ],
      },
      {
        icon: "💰",
        accent: "gold",
        title: "Revenue Model",
        bullets: [
          "Free · Standard $49/mo · Premium $149/mo",
          "PayPal hosted buttons — no Stripe dependency",
          "Tier upgrades unlock dashboard features instantly on approval",
        ],
      },
      {
        icon: "🔬",
        accent: "blue",
        title: "Proprietary Data Layer",
        bullets: [
          "Every log contributes: product, dosage, felt effects (BiSlider delta), terpene correlations",
          "Creates a dataset correlating product attributes → felt effects → consumer profiles",
          "No competitor collects structured, profile-matched experience data at this depth",
        ],
      },
    ],
  },
};

// ── Share bar component ───────────────────────────────────────────────────────
function ShareBar({ perspective }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/pitch/${perspective}`;
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="pd-share">
      <span className="pd-share__url">{url}</span>
      <button
        className={`pd-share__copy${copied ? " pd-share__copy--done" : ""}`}
        onClick={copy}
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}

// ── Main PitchDeck page ───────────────────────────────────────────────────────
export default function PitchDeck() {
  useUnregisterSW();
  const { perspective } = useParams();
  const config = PERSPECTIVES[perspective];

  if (!config) {
    return (
      <div className="pd-page" style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", color: "#1A3D2B", padding: 40 }}>
          <div style={{ fontSize: 48 }}>🌿</div>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 22, marginTop: 16 }}>Perspective not found</p>
          <Link to="/" style={{ color: "#2E6B47", fontSize: 14 }}>← Back to Mycana</Link>
        </div>
      </div>
    );
  }

  const titleLines = config.title.split("\n");

  return (
    <div className="pd-page">
      {/* Top bar */}
      <div className="pd-topbar">
        <Link to="/" className="pd-topbar__logo">
          <span className="pd-topbar__logo-leaf">🌿</span> Mycana
        </Link>
        <Link to="/admin" className="pd-topbar__back">Admin ←</Link>
      </div>

      {/* Hero */}
      <div className="pd-hero">
        <div className="pd-hero__eyebrow" style={{ background: config.eyebrowColor }}>
          {config.eyebrow}
        </div>
        <h1 className="pd-hero__title">
          {titleLines.map((l, i) => <span key={i}>{l}{i < titleLines.length - 1 && <br/>}</span>)}
        </h1>
        <p className="pd-hero__sub">{config.sub}</p>
      </div>

      {/* Animated scene */}
      {config.scene}

      {/* Feature panels */}
      <div className="pd-panels">
        {config.panels.map((p, i) => (
          <div key={i} className={`pd-panel pd-panel--${p.accent}`}
            style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="pd-panel__icon">{p.icon}</span>
            <div className="pd-panel__title">{p.title}</div>
            <ul>
              {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="pd-cta">
        <Link to={config.cta.href} className="pd-cta__btn">
          {config.cta.text} →
        </Link>
        <ShareBar perspective={perspective}/>
        <span className="pd-cta__note">mycana.info · Western New York · Cannabis Intelligence Platform</span>
      </div>

      <div className="pd-footer">
        © 2025 Mycana · For educational purposes only · Not medical advice
      </div>
    </div>
  );
}
