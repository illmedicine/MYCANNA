import { useState } from "react";

// ── Endocannabinoid system regions — positions tuned to plush figure ──────────
export const ENDO_REGIONS = [
  {
    id: "brain",
    label: "Brain & CNS",
    emoji: "🧠",
    color: "#a78bfa",
    hx: 100, hy: 44,
    receptor: "CB1 dominant",
    effects: ["Mood regulation", "Anxiety control", "Memory", "Creativity"],
    insight: "CB1 receptors are densest in the brain — especially the prefrontal cortex and amygdala. THC's psychoactive effects stem from CB1 activation here. Linalool and CBD calm anxiety via 5-HT1A serotonin receptors — the same target as SSRIs.",
  },
  {
    id: "heart",
    label: "Cardiovascular",
    emoji: "❤️",
    color: "#f87171",
    hx: 83, hy: 128,
    receptor: "CB1 & CB2",
    effects: ["Heart rate modulation", "Blood pressure", "Vascular tone"],
    insight: "CB1 and CB2 receptors regulate cardiovascular function. Low THC doses briefly raise heart rate via CB1. CBD relaxes blood vessels and reduces cardiac inflammation — beneficial for hypertension. Avoid high-THC products if you have cardiovascular conditions.",
  },
  {
    id: "gut",
    label: "GI System",
    emoji: "🌿",
    color: "#34d399",
    hx: 100, hy: 162,
    receptor: "CB1 & CB2",
    effects: ["Nausea relief", "Gut motility", "Inflammation", "Appetite"],
    insight: "The enteric nervous system ('the second brain') is packed with CB1 receptors. Cannabis addresses Crohn's, IBS, and chemotherapy nausea via CB1-mediated gut regulation. CBD reduces intestinal inflammation through CB2 — tinctures and capsules allow precise enteric dosing.",
  },
  {
    id: "immune",
    label: "Immune System",
    emoji: "🛡️",
    color: "#fbbf24",
    hx: 120, hy: 120,
    receptor: "CB2 dominant",
    effects: ["Anti-inflammatory", "Immune modulation", "Cytokine balance"],
    insight: "CB2 receptors are concentrated in immune tissues — lymph nodes, spleen, thymus. Beta-caryophyllene (BCP) is the only dietary terpene that directly activates CB2. CBD and THC reduce pro-inflammatory cytokines, directly benefiting autoimmune and inflammatory conditions.",
  },
  {
    id: "spine",
    label: "Spine & Pain",
    emoji: "⚡",
    color: "#fb923c",
    hx: 142, hy: 155,
    receptor: "CB1 & CB2",
    effects: ["Pain gate control", "Neuropathic relief", "Spasm reduction"],
    insight: "CB1 receptors in the dorsal horn of the spinal cord act as pain 'gates.' Myrcene enhances CB1 binding affinity, amplifying analgesic effects significantly. Indica-dominant strains with myrcene are the most effective for chronic and neuropathic pain relief.",
  },
  {
    id: "muscles",
    label: "Muscles & Joints",
    emoji: "💪",
    color: "#6ee7b7",
    hx: 36, hy: 162,
    receptor: "CB2 dominant",
    effects: ["Inflammation reduction", "Recovery", "Soreness relief", "Flexibility"],
    insight: "CB2 receptors in muscle and joint tissue modulate local inflammation without psychoactive effects. Topical CBD reaches these receptors directly. Research shows topical cannabinoids reduce exercise-induced inflammation markers by up to 38% — ideal for post-workout recovery.",
  },
];

// ── Knitted SVG patterns ──────────────────────────────────────────────────────
const SVG_DEFS = (
  <defs>
    {/* Cream felt knit texture */}
    <pattern id="knit-cream" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
      <path d="M0,3 C1.3,1.2 2.7,4.8 4,3 C5.3,1.2 6.7,4.8 8,3"
        fill="none" stroke="rgba(110,70,20,.07)" strokeWidth=".85"/>
      <path d="M0,6 C1.3,4.2 2.7,7.8 4,6 C5.3,4.2 6.7,7.8 8,6"
        fill="none" stroke="rgba(110,70,20,.07)" strokeWidth=".85"/>
    </pattern>
    {/* Green felt knit texture */}
    <pattern id="knit-green" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
      <path d="M0,3 C1.3,1.2 2.7,4.8 4,3 C5.3,1.2 6.7,4.8 8,3"
        fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".85"/>
      <path d="M0,6 C1.3,4.2 2.7,7.8 4,6 C5.3,4.2 6.7,7.8 8,6"
        fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".85"/>
    </pattern>
    {/* Drop shadow filter */}
    <filter id="plush-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,.25)"/>
    </filter>
    <filter id="btn-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,.35)"/>
    </filter>
  </defs>
);

// ── Plush knitted figure SVG ──────────────────────────────────────────────────
function PlushFigureSVG({ activeId, gender = "neutral", conditionRegions }) {
  const isFemale  = gender === "female";
  const isMale    = gender === "male";

  // Palette
  const felt        = "#e8d5b8";   // warm cream felt body
  const feltShade   = "#d4bfa0";   // slightly deeper felt for depth
  const clothing    = "#3d6b4a";   // brand green clothing
  const stitchLine  = "#9b7d5a";   // warm brown thread
  const hairDark    = "#3a2810";   // dark hair
  const eyeDark     = "#1e140a";   // dark button eyes
  const blush       = "rgba(220,110,80,.2)";

  // Gender shape offsets
  const sW  = isMale   ? 7  : 0;   // extra shoulder width for male
  const hW  = isFemale ? 7  : 0;   // extra hip width for female
  const wIn = isFemale ? 6  : 0;   // waist inward for female

  // Torso paths
  const torsoPath = isFemale
    ? `M ${72 - sW} 100 C ${58} 120 ${60 + wIn} 142 ${66} 160 C ${62 + hW} 178 ${68 + hW} 198 ${78 + hW} 204
       L ${122 - hW} 204 C ${132 - hW} 198 ${138 - hW} 178 ${134} 160 C ${140 - wIn} 142 ${142} 120 ${128 + sW} 100 Z`
    : `M ${68 - sW} 100 C ${55} 120 ${57} 145 ${65} 168 C ${68} 188 ${76} 204 ${82} 208
       L ${118} 208 C ${124} 204 ${132} 188 ${135} 168 C ${143} 145 ${145} 120 ${132 + sW} 100 Z`;

  return (
    <svg
      viewBox="0 0 200 282"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {SVG_DEFS}

      {/* ── Left arm ─────────────────────────────────── */}
      <ellipse cx={47} cy={148} rx={15} ry={44}
        fill={clothing} transform="rotate(-12 47 148)" filter="url(#plush-shadow)"/>
      <ellipse cx={47} cy={148} rx={15} ry={44}
        fill="url(#knit-green)" transform="rotate(-12 47 148)"/>
      {/* Left arm shoulder seam */}
      <line x1="56" y1="105" x2="42" y2="120"
        stroke={stitchLine} strokeWidth="1" strokeDasharray="3 2.5" opacity=".55"/>
      {/* Left hand */}
      <ellipse cx={36} cy={190} rx={13} ry={11} fill={felt} filter="url(#plush-shadow)"/>
      <ellipse cx={36} cy={190} rx={13} ry={11} fill="url(#knit-cream)"/>
      <ellipse cx={36} cy={190} rx={13} ry={11}
        fill="none" stroke={stitchLine} strokeWidth=".9" strokeDasharray="2.5 2" opacity=".4"/>

      {/* ── Right arm ────────────────────────────────── */}
      <ellipse cx={153} cy={148} rx={15} ry={44}
        fill={clothing} transform="rotate(12 153 148)" filter="url(#plush-shadow)"/>
      <ellipse cx={153} cy={148} rx={15} ry={44}
        fill="url(#knit-green)" transform="rotate(12 153 148)"/>
      {/* Right arm shoulder seam */}
      <line x1="144" y1="105" x2="158" y2="120"
        stroke={stitchLine} strokeWidth="1" strokeDasharray="3 2.5" opacity=".55"/>
      {/* Right hand */}
      <ellipse cx={164} cy={190} rx={13} ry={11} fill={felt} filter="url(#plush-shadow)"/>
      <ellipse cx={164} cy={190} rx={13} ry={11} fill="url(#knit-cream)"/>
      <ellipse cx={164} cy={190} rx={13} ry={11}
        fill="none" stroke={stitchLine} strokeWidth=".9" strokeDasharray="2.5 2" opacity=".4"/>

      {/* ── Torso ─────────────────────────────────────── */}
      <path d={torsoPath} fill={clothing} filter="url(#plush-shadow)"/>
      <path d={torsoPath} fill="url(#knit-green)"/>
      {/* Center seam */}
      <line x1="100" y1="100" x2="100" y2="206"
        stroke={stitchLine} strokeWidth="1.1" strokeDasharray="4 3" opacity=".45"/>
      {/* Female chest */}
      {isFemale && (
        <>
          <ellipse cx="86"  cy="122" rx="12" ry="10" fill={clothing}/>
          <ellipse cx="114" cy="122" rx="12" ry="10" fill={clothing}/>
          <ellipse cx="86"  cy="121" rx="12" ry="10" fill="rgba(255,255,255,.06)"/>
          <ellipse cx="114" cy="121" rx="12" ry="10" fill="rgba(255,255,255,.06)"/>
        </>
      )}

      {/* ── Left leg ─────────────────────────────────── */}
      <rect x="74" y="202" width="24" height="58" rx="12"
        fill={clothing} filter="url(#plush-shadow)"/>
      <rect x="74" y="202" width="24" height="58" rx="12" fill="url(#knit-green)"/>
      <line x1="86" y1="204" x2="86" y2="258"
        stroke={stitchLine} strokeWidth=".9" strokeDasharray="3 2.5" opacity=".35"/>

      {/* ── Right leg ────────────────────────────────── */}
      <rect x="102" y="202" width="24" height="58" rx="12"
        fill={clothing} filter="url(#plush-shadow)"/>
      <rect x="102" y="202" width="24" height="58" rx="12" fill="url(#knit-green)"/>
      <line x1="114" y1="204" x2="114" y2="258"
        stroke={stitchLine} strokeWidth=".9" strokeDasharray="3 2.5" opacity=".35"/>

      {/* ── Feet ─────────────────────────────────────── */}
      <ellipse cx="86"  cy="262" rx="17" ry="11" fill={felt} filter="url(#plush-shadow)"/>
      <ellipse cx="86"  cy="262" rx="17" ry="11" fill="url(#knit-cream)"/>
      <ellipse cx="86"  cy="262" rx="17" ry="11"
        fill="none" stroke={stitchLine} strokeWidth=".9" strokeDasharray="3 2.5" opacity=".35"/>
      <ellipse cx="114" cy="262" rx="17" ry="11" fill={felt} filter="url(#plush-shadow)"/>
      <ellipse cx="114" cy="262" rx="17" ry="11" fill="url(#knit-cream)"/>
      <ellipse cx="114" cy="262" rx="17" ry="11"
        fill="none" stroke={stitchLine} strokeWidth=".9" strokeDasharray="3 2.5" opacity=".35"/>

      {/* Ankle seam */}
      <line x1="70"  y1="257" x2="104" y2="257"
        stroke={stitchLine} strokeWidth=".9" strokeDasharray="3 2.5" opacity=".4"/>
      <line x1="98"  y1="257" x2="132" y2="257"
        stroke={stitchLine} strokeWidth=".9" strokeDasharray="3 2.5" opacity=".4"/>

      {/* ── Neck ─────────────────────────────────────── */}
      <rect x="88" y="80" width="24" height="24" rx="12" fill={felt}/>
      <rect x="88" y="80" width="24" height="24" rx="12" fill="url(#knit-cream)"/>
      <line x1="89" y1="82" x2="111" y2="82"
        stroke={stitchLine} strokeWidth=".9" strokeDasharray="2.5 2" opacity=".4"/>
      <line x1="89" y1="102" x2="111" y2="102"
        stroke={stitchLine} strokeWidth=".9" strokeDasharray="2.5 2" opacity=".4"/>

      {/* ── Head ─────────────────────────────────────── */}
      <circle cx="100" cy="46" r="42" fill={felt} filter="url(#plush-shadow)"/>
      <circle cx="100" cy="46" r="42" fill="url(#knit-cream)"/>
      {/* Head outline seam */}
      <circle cx="100" cy="46" r="42"
        fill="none" stroke={stitchLine} strokeWidth="1.3" strokeDasharray="5 4" opacity=".28"/>

      {/* ── Hair ─────────────────────────────────────── */}
      {isMale && (
        <>
          <path d="M 60 38 Q 62 6 100 4 Q 138 6 140 38 Q 132 18 100 17 Q 68 18 60 38Z"
            fill={hairDark}/>
          {/* Sideburns */}
          <path d="M 60 42 C 57 50 56 62 58 72" fill="none"
            stroke={hairDark} strokeWidth="5" strokeLinecap="round"/>
          <path d="M 140 42 C 143 50 144 62 142 72" fill="none"
            stroke={hairDark} strokeWidth="5" strokeLinecap="round"/>
        </>
      )}
      {isFemale && (
        <>
          <path d="M 60 38 Q 62 6 100 4 Q 138 6 140 38 Q 132 18 100 17 Q 68 18 60 38Z"
            fill={hairDark}/>
          {/* Long flowing sides */}
          <path d="M 62 42 C 56 60 54 78 56 94" fill="none"
            stroke={hairDark} strokeWidth="8" strokeLinecap="round"/>
          <path d="M 138 42 C 144 60 146 78 144 94" fill="none"
            stroke={hairDark} strokeWidth="8" strokeLinecap="round"/>
          {/* Hair sheen */}
          <path d="M 63 42 C 58 58 56 76 58 92" fill="none"
            stroke="rgba(255,255,255,.08)" strokeWidth="3" strokeLinecap="round"/>
          <path d="M 137 42 C 142 58 144 76 142 92" fill="none"
            stroke="rgba(255,255,255,.08)" strokeWidth="3" strokeLinecap="round"/>
        </>
      )}
      {!isMale && !isFemale && (
        /* Neutral — soft rounded top */
        <path d="M 65 28 Q 68 6 100 5 Q 132 6 135 28 Q 128 16 100 16 Q 72 16 65 28Z"
          fill={feltShade} opacity=".6"/>
      )}

      {/* ── Face ─────────────────────────────────────── */}
      {/* Blush cheeks */}
      <circle cx="80"  cy="57" r="10" fill={blush}/>
      <circle cx="120" cy="57" r="10" fill={blush}/>

      {/* Left eye — button */}
      <circle cx="88" cy="42" r="7.5" fill={eyeDark}/>
      <circle cx="88" cy="42" r="7.5" fill="none"
        stroke={stitchLine} strokeWidth="1.2" opacity=".5"/>
      {/* Button thread cross */}
      <line x1="86" y1="40" x2="90" y2="44" stroke={stitchLine} strokeWidth=".7" opacity=".45"/>
      <line x1="90" y1="40" x2="86" y2="44" stroke={stitchLine} strokeWidth=".7" opacity=".45"/>
      <circle cx="90" cy="40" r="3" fill="white" opacity=".9"/>
      <circle cx="86" cy="44" r="1.2" fill="white" opacity=".4"/>

      {/* Right eye — button */}
      <circle cx="112" cy="42" r="7.5" fill={eyeDark}/>
      <circle cx="112" cy="42" r="7.5" fill="none"
        stroke={stitchLine} strokeWidth="1.2" opacity=".5"/>
      <line x1="110" y1="40" x2="114" y2="44" stroke={stitchLine} strokeWidth=".7" opacity=".45"/>
      <line x1="114" y1="40" x2="110" y2="44" stroke={stitchLine} strokeWidth=".7" opacity=".45"/>
      <circle cx="114" cy="40" r="3" fill="white" opacity=".9"/>
      <circle cx="110" cy="44" r="1.2" fill="white" opacity=".4"/>

      {/* Nose — small felt bump */}
      <ellipse cx="100" cy="54" rx="3.5" ry="2.5" fill={feltShade} opacity=".8"/>

      {/* Mouth — stitched smile */}
      <path d="M 88 63 Q 100 75 112 63"
        fill="none" stroke={stitchLine} strokeWidth="2.2"
        strokeLinecap="round" strokeDasharray="3.5 2.2"/>

      {/* ── Condition alert rings (pulsing amber) ────── */}
      {conditionRegions && ENDO_REGIONS.map(r => {
        if (!conditionRegions.has(r.id)) return null;
        const isActive = activeId === r.id;
        return (
          <g key={r.id + "-condition"}>
            <circle
              cx={r.hx} cy={r.hy} r="28"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              opacity={isActive ? 0.9 : 0.7}
              style={{ pointerEvents: "none" }}
            >
              <animate attributeName="r" values="26;31;26" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle
              cx={r.hx} cy={r.hy} r="22"
              fill="#f59e0b"
              opacity="0.18"
              style={{ pointerEvents: "none" }}
            >
              <animate attributeName="opacity" values="0.18;0.05;0.18" dur="2s" repeatCount="indefinite"/>
            </circle>
            {/* Small amber alert badge */}
            <circle
              cx={r.hx + 11} cy={r.hy - 11} r="6"
              fill="#f59e0b"
              style={{ pointerEvents: "none" }}
            />
            <text
              x={r.hx + 11} y={r.hy - 8}
              fontSize="7" textAnchor="middle"
              fill="#1e1e1e" fontWeight="900"
              style={{ pointerEvents: "none" }}
            >!</text>
          </g>
        );
      })}

      {/* ── Hotspot glows ────────────────────────────── */}
      {ENDO_REGIONS.map(r => (
        <circle
          key={r.id + "-glow"}
          cx={r.hx} cy={r.hy}
          r={activeId === r.id ? 22 : 16}
          fill={r.color}
          opacity={activeId === r.id ? 0.28 : 0.14}
          style={{ transition: "all 0.25s ease" }}
        />
      ))}

      {/* ── Stitched button border ────────────────────── */}
      {ENDO_REGIONS.map(r => (
        <circle
          key={r.id + "-ring"}
          cx={r.hx} cy={r.hy}
          r={activeId === r.id ? 15 : 12}
          fill="none"
          stroke="rgba(255,255,255,.7)"
          strokeWidth="1.5"
          strokeDasharray="3 2.5"
          opacity={activeId === r.id ? 0.8 : 0.5}
          style={{ transition: "all 0.22s ease", pointerEvents: "none" }}
        />
      ))}

      {/* ── Felt hotspot dots ─────────────────────────── */}
      {ENDO_REGIONS.map(r => (
        <circle
          key={r.id + "-dot"}
          cx={r.hx} cy={r.hy}
          r={activeId === r.id ? 10.5 : 8.5}
          fill={r.color}
          stroke="white"
          strokeWidth={activeId === r.id ? 2.5 : 2}
          style={{
            transition: "all 0.2s ease",
            cursor: "pointer",
            filter: "drop-shadow(0 2px 5px rgba(0,0,0,.4))",
          }}
        />
      ))}

      {/* ── Active system label ───────────────────────── */}
      {ENDO_REGIONS.map(r => {
        if (activeId !== r.id) return null;
        const labelY = r.hy > 145 ? r.hy - 20 : r.hy + 26;
        const labelX = r.hx < 60 ? r.hx + 14 : r.hx > 140 ? r.hx - 14 : r.hx;
        return (
          <text
            key={r.id + "-lbl"}
            x={labelX} y={labelY}
            fontSize="7.5" textAnchor="middle"
            fill="white" fontWeight="800"
            style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,.8)" }}
          >
            {r.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export default function MedievalBodyMap({ onRegionChange, activeId, gender = "neutral", conditionRegions }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <PlushFigureSVG activeId={activeId} gender={gender} conditionRegions={conditionRegions} />

      {/* Transparent hit-targets over each hotspot */}
      <svg
        viewBox="0 0 200 282"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      >
        {ENDO_REGIONS.map(r => (
          <circle
            key={r.id}
            cx={r.hx} cy={r.hy} r="22"
            fill="transparent"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onRegionChange(r.id)}
            onMouseLeave={() => onRegionChange(null)}
            onClick={() => onRegionChange(r.id === activeId ? null : r.id)}
          />
        ))}
      </svg>
    </div>
  );
}
