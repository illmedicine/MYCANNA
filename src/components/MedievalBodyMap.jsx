// Interactive medieval-style body map — replaces the old BodyViz accordion.
// Hotspot hover/click reveals endocannabinoid system insights in the card's info panel.
import { useState } from "react";

export const ENDO_REGIONS = [
  {
    id: "brain",
    label: "Brain & CNS",
    emoji: "🧠",
    color: "#a78bfa",
    // SVG hotspot position (viewBox 0 0 200 260)
    hx: 100, hy: 40,
    receptor: "CB1 dominant",
    effects: ["Mood regulation", "Anxiety control", "Memory", "Creativity"],
    insight: "CB1 receptors are densest in the brain — especially the prefrontal cortex and amygdala. THC's psychoactive effects stem from CB1 activation here. Linalool and CBD calm anxiety via 5-HT1A serotonin receptors — the same target as SSRIs.",
  },
  {
    id: "heart",
    label: "Cardiovascular",
    emoji: "❤️",
    color: "#f87171",
    hx: 82, hy: 112,
    receptor: "CB1 & CB2",
    effects: ["Heart rate modulation", "Blood pressure", "Vascular tone"],
    insight: "CB1 and CB2 receptors regulate cardiovascular function. Low THC doses briefly raise heart rate via CB1. CBD relaxes blood vessels and reduces cardiac inflammation — beneficial for hypertension. Avoid high-THC products if you have cardiovascular conditions.",
  },
  {
    id: "gut",
    label: "GI System",
    emoji: "🌿",
    color: "#34d399",
    hx: 100, hy: 152,
    receptor: "CB1 & CB2",
    effects: ["Nausea relief", "Gut motility", "Inflammation", "Appetite"],
    insight: "The enteric nervous system ('the second brain') is packed with CB1 receptors. Cannabis addresses Crohn's, IBS, and chemotherapy nausea via CB1-mediated gut regulation. CBD reduces intestinal inflammation through CB2 — tinctures and capsules allow precise enteric dosing.",
  },
  {
    id: "immune",
    label: "Immune System",
    emoji: "🛡️",
    color: "#fbbf24",
    hx: 122, hy: 106,
    receptor: "CB2 dominant",
    effects: ["Anti-inflammatory", "Immune modulation", "Cytokine balance"],
    insight: "CB2 receptors are concentrated in immune tissues — lymph nodes, spleen, thymus. Beta-caryophyllene (BCP) is the only dietary terpene that directly activates CB2. CBD and THC reduce pro-inflammatory cytokines, directly benefiting autoimmune and inflammatory conditions.",
  },
  {
    id: "spine",
    label: "Spine & Pain",
    emoji: "⚡",
    color: "#fb923c",
    hx: 140, hy: 140,
    receptor: "CB1 & CB2",
    effects: ["Pain gate control", "Neuropathic relief", "Spasm reduction"],
    insight: "CB1 receptors in the dorsal horn of the spinal cord act as pain 'gates.' Myrcene enhances CB1 binding affinity, amplifying analgesic effects significantly. Indica-dominant strains with myrcene are the most effective for chronic and neuropathic pain relief.",
  },
  {
    id: "muscles",
    label: "Muscles & Joints",
    emoji: "💪",
    color: "#6ee7b7",
    hx: 28, hy: 155,
    receptor: "CB2 dominant",
    effects: ["Inflammation reduction", "Recovery", "Soreness relief", "Flexibility"],
    insight: "CB2 receptors in muscle and joint tissue modulate local inflammation without psychoactive effects. Topical CBD reaches these receptors directly. Research shows topical cannabinoids reduce exercise-induced inflammation markers by up to 38% — ideal for post-workout recovery.",
  },
];

// ── Medieval scholar/anatomical figure SVG ─────────────────────────────────────
function FigureSVG({ activeId }) {
  const tunic = "#1e3a5f";
  const tunicLight = "#264d7a";
  const skin = "#fde8c8";
  const belt = "#92400e";
  const boot = "#451a03";
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>

      {/* ── Scholars robe / tunic body ── */}
      {/* Robe skirt */}
      <path d="M 64 174 L 136 174 L 132 258 L 68 258 Z" fill={tunic} />
      <path d="M 68 174 L 132 174 L 128 258 L 72 258 Z" fill={tunicLight} opacity="0.2" />
      {/* Left leg gap / robe fold */}
      <path d="M 100 174 L 100 258 L 92 258 Z" fill="#0f2744" opacity="0.35" />

      {/* Left arm sleeve */}
      <path d="M 64 88 L 44 86 L 22 162 L 40 166 Z" fill={tunic} />
      {/* Right arm sleeve */}
      <path d="M 136 88 L 156 86 L 178 162 L 160 166 Z" fill={tunic} />

      {/* Tunic upper body */}
      <path d="M 60 82 L 140 82 L 136 174 L 64 174 Z" fill={tunic} />
      <path d="M 62 82 L 138 82 L 134 174 L 66 174 Z" fill={tunicLight} opacity="0.18" />

      {/* Robe center seam */}
      <line x1="100" y1="82" x2="100" y2="258" stroke="#0f2744" strokeWidth="1.5" opacity="0.4" />

      {/* Collar */}
      <path d="M 84 82 Q 100 76 116 82 L 112 92 Q 100 87 88 92 Z" fill={tunicLight} opacity="0.6" />
      <path d="M 88 82 Q 100 76 112 82 L 110 90 Q 100 85 90 90 Z" fill="white" opacity="0.1" />

      {/* Belt */}
      <rect x="58" y="168" width="84" height="10" rx="5" fill={belt} />
      <rect x="84" y="165" width="32" height="16" rx="3" fill="#78350f" />
      <ellipse cx="100" cy="173" rx="9" ry="7" fill={belt} />
      <ellipse cx="100" cy="173" rx="5.5" ry="4.5" fill="#ca8a04" opacity="0.8" />

      {/* Rune/symbol on tunic (medieval touch) */}
      <text x="100" y="138" fontSize="18" textAnchor="middle" fill="white" opacity="0.08" fontFamily="serif">⚕</text>

      {/* ── Hands ── */}
      <circle cx="22" cy="166" r="11" fill={skin} />
      <circle cx="178" cy="166" r="11" fill={skin} />

      {/* ── Neck ── */}
      <rect x="88" y="67" width="24" height="17" rx="4" fill={skin} />

      {/* ── Head ── */}
      <circle cx="100" cy="44" r="28" fill={skin} />

      {/* Hair */}
      <path d="M 72 38 Q 72 14 100 12 Q 128 14 128 38 Q 124 28 100 26 Q 76 28 72 38Z" fill="#44403c" />

      {/* Cheeks */}
      <circle cx="82" cy="50" r="8" fill="#fca5a5" opacity="0.25" />
      <circle cx="118" cy="50" r="8" fill="#fca5a5" opacity="0.25" />

      {/* Eyebrows */}
      <path d="M 82 36 Q 90 33 97 37" stroke="#374151" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 103 37 Q 110 33 118 36" stroke="#374151" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="90" cy="43" rx="5.5" ry="5" fill="#1e3a5f" />
      <ellipse cx="110" cy="43" rx="5.5" ry="5" fill="#1e3a5f" />
      <circle cx="89" cy="42" r="2.2" fill="white" />
      <circle cx="109" cy="42" r="2.2" fill="white" />
      <circle cx="88.5" cy="41.5" r="0.9" fill="#4ade80" />
      <circle cx="108.5" cy="41.5" r="0.9" fill="#4ade80" />

      {/* Nose */}
      <ellipse cx="100" cy="51" rx="3" ry="2.2" fill="#d4a574" />

      {/* Calm smile */}
      <path d="M 92 59 Q 100 65 108 59" stroke="#7c4b30" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* ── Boots ── */}
      <ellipse cx="80" cy="257" rx="16" ry="6" fill={boot} />
      <ellipse cx="120" cy="257" rx="16" ry="6" fill={boot} />
      <rect x="66" y="246" width="28" height="14" rx="4" fill={boot} />
      <rect x="106" y="246" width="28" height="14" rx="4" fill={boot} />

      {/* ── Hotspot glow rings (background pulses behind dots) ── */}
      {ENDO_REGIONS.map(r => (
        <circle
          key={r.id + "-glow"}
          cx={r.hx} cy={r.hy} r={activeId === r.id ? 20 : 16}
          fill={r.color}
          opacity={activeId === r.id ? 0.22 : 0.12}
          style={{ transition: "all 0.25s ease" }}
        />
      ))}

      {/* ── Hotspot dots ── */}
      {ENDO_REGIONS.map(r => (
        <circle
          key={r.id + "-dot"}
          cx={r.hx} cy={r.hy} r={activeId === r.id ? 11 : 8}
          fill={r.color}
          opacity={activeId === r.id ? 1 : 0.85}
          stroke="white"
          strokeWidth={activeId === r.id ? 2 : 1.2}
          style={{ transition: "all 0.2s ease", cursor: "pointer" }}
        />
      ))}

      {/* ── System labels (tiny, visible when active) ── */}
      {ENDO_REGIONS.map(r => {
        if (activeId !== r.id) return null;
        const labelY = r.hy > 130 ? r.hy - 16 : r.hy + 22;
        return (
          <text
            key={r.id + "-label"}
            x={r.hx} y={labelY}
            fontSize="7.5" textAnchor="middle"
            fill="white" fontWeight="700"
            style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
          >
            {r.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Public component ────────────────────────────────────────────────────────────
export default function MedievalBodyMap({ onRegionChange, activeId }) {
  const handlePointer = (id) => {
    onRegionChange(id === activeId ? null : id);
  };

  return (
    <div
      className="mdbm"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {/* Invisible hit-targets on top of the figure */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <FigureSVG activeId={activeId} />

        {/* Transparent clickable / hoverable circles that sit over each hotspot */}
        <svg
          viewBox="0 0 200 260"
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
              onClick={() => handlePointer(r.id)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
