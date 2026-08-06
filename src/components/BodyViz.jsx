import { useRef, useEffect, useState, useCallback } from "react";

// ── Hotspot definitions ──────────────────────────────────────────────────────
// x/y = normalized position (0–1) on canvas, r = click radius (normalized)
const HOTSPOTS = [
  {
    id: "brain", x: 0.5, y: 0.065, r: 0.06, color: "#a78bfa", ffCount: 14,
    label: "Brain & Central Nervous System",
    info: "The brain has the highest density of CB1 receptors in the body — particularly in the hippocampus, cerebellum, basal ganglia, and prefrontal cortex. This is why cannabis affects memory, coordination, mood, and executive function.",
    effects: ["Memory modulation (hippocampus)", "Mood & euphoria (nucleus accumbens)", "Pain perception reduction", "Motor coordination (cerebellum)", "Appetite signaling", "Anxiety regulation (amygdala)"],
  },
  {
    id: "brainstem", x: 0.5, y: 0.125, r: 0.03, color: "#fb923c", ffCount: 6,
    label: "Brain Stem",
    info: "The brain stem controls nausea and vomiting reflexes via the chemoreceptor trigger zone. Cannabis anti-emetic effects are primarily mediated here, making it valuable for chemotherapy patients.",
    effects: ["Anti-nausea / anti-emetic", "Vomiting reflex suppression", "Autonomic nervous system regulation", "Sleep-wake cycle influence"],
  },
  {
    id: "heart", x: 0.46, y: 0.295, r: 0.035, color: "#f87171", ffCount: 7,
    label: "Cardiovascular System",
    info: "Cannabis temporarily elevates heart rate 20–100% within 15 minutes. Short-term vasodilation lowers blood pressure. CB1 receptors in heart muscle modulate contractility and vascular tone.",
    effects: ["Heart rate increase (tachycardia)", "Vasodilation", "Short-term blood pressure effects", "Reduced exercise capacity acutely"],
  },
  {
    id: "lungs", x: 0.545, y: 0.315, r: 0.038, color: "#60a5fa", ffCount: 7,
    label: "Lungs & Respiratory",
    info: "Inhaled cannabinoids reach peak blood concentration in 3–10 minutes via alveolar absorption — the fastest delivery route. Short-term bronchodilation occurs; chronic smoke exposure can irritate airways.",
    effects: ["Rapid systemic absorption", "Short-term bronchodilation", "Airways sensitivity (chronic smoke)", "Fastest onset of all delivery methods"],
  },
  {
    id: "gut", x: 0.5, y: 0.425, r: 0.038, color: "#34d399", ffCount: 8,
    label: "GI Tract & Enteric System",
    info: "The gut has its own enteric nervous system rich with CB1 and CB2 receptors. Cannabinoids reduce gut motility, decrease intestinal inflammation, and regulate the gut-brain axis, explaining relief for IBS and Crohn's.",
    effects: ["Appetite stimulation", "Nausea suppression", "Gut motility regulation", "IBS / Crohn's symptom relief", "Gut-brain axis modulation"],
  },
  {
    id: "immune", x: 0.38, y: 0.355, r: 0.03, color: "#fbbf24", ffCount: 6,
    label: "Immune System (CB2 Receptors)",
    info: "CB2 receptors are concentrated in immune tissue — spleen, lymph nodes, and white blood cells. Cannabinoids profoundly modulate immune response, driving anti-inflammatory effects central to conditions like arthritis, MS, and lupus.",
    effects: ["Anti-inflammatory response", "Immune cell modulation", "Autoimmune symptom relief", "Cytokine regulation", "Reduced oxidative stress"],
  },
  {
    id: "spine", x: 0.505, y: 0.48, r: 0.028, color: "#c084fc", ffCount: 5,
    label: "Spinal Cord & Peripheral Nerves",
    info: "The spinal cord routes endocannabinoid signals from the brain to the body. CB1 receptors in the dorsal horn gate pain signals before they reach the brain — the basis of cannabis analgesia for neuropathic and chronic pain.",
    effects: ["Pain signal gating (gate theory)", "Neuropathic pain reduction", "Spasticity / muscle spasm control", "Anti-nociception", "Signal propagation to limbs"],
  },
  {
    id: "joints", x: 0.625, y: 0.695, r: 0.032, color: "#6ee7b7", ffCount: 8,
    label: "Joints, Muscles & Connective Tissue",
    info: "CB2 receptors in synovial tissue (joint lining) reduce inflammation directly at the site. Muscle relaxation occurs via CNS pathways and peripheral muscle CB1 receptors, explaining relief for arthritis, fibromyalgia, and muscle spasms.",
    effects: ["Joint inflammation reduction", "Muscle relaxation", "Spasm reduction (spasticity)", "Arthritis pain relief", "Fibromyalgia symptom management"],
  },
];

// ── Nerve path definitions ────────────────────────────────────────────────────
const NERVE_PATHS = [
  { from: [0.5, 0.09], to: [0.5, 0.125], ctrl: null, color: "#a78bfa" },
  { from: [0.5, 0.125], to: [0.46, 0.285], ctrl: [0.5, 0.20], color: "#f87171" },
  { from: [0.5, 0.125], to: [0.545, 0.30], ctrl: [0.5, 0.22], color: "#60a5fa" },
  { from: [0.5, 0.125], to: [0.505, 0.475], ctrl: [0.5, 0.30], color: "#c084fc" },
  { from: [0.505, 0.35], to: [0.38, 0.345], ctrl: [0.43, 0.33], color: "#fbbf24" },
  { from: [0.505, 0.40], to: [0.5, 0.425], ctrl: null, color: "#34d399" },
  { from: [0.505, 0.475], to: [0.625, 0.68], ctrl: [0.57, 0.575], color: "#6ee7b7" },
  { from: [0.505, 0.475], to: [0.375, 0.68], ctrl: [0.43, 0.575], color: "#6ee7b7" },
  { from: [0.5, 0.20], to: [0.73, 0.43], ctrl: [0.65, 0.22], color: "#6ee7b7" },
  { from: [0.5, 0.20], to: [0.27, 0.43], ctrl: [0.35, 0.22], color: "#6ee7b7" },
];

// ── Drawing helpers ───────────────────────────────────────────────────────────
function drawBodySilhouette(ctx, W, H, gender) {
  const X = v => v * W, Y = v => v * H;
  const hipW = gender === "female" ? 0.145 : 0.125;
  const shoulderW = gender === "female" ? 0.155 : 0.165;

  ctx.save();
  ctx.shadowColor = "rgba(74,222,128,0.5)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(74,222,128,0.4)";
  ctx.fillStyle = "rgba(74,222,128,0.055)";
  ctx.lineWidth = 1.5;

  // Head
  ctx.beginPath();
  ctx.ellipse(X(0.5), Y(0.065), X(0.083), Y(0.067), 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Torso
  ctx.beginPath();
  ctx.moveTo(X(0.5 - shoulderW), Y(0.155));
  ctx.bezierCurveTo(X(0.5 - shoulderW - 0.02), Y(0.22), X(0.5 - shoulderW - 0.025), Y(0.36), X(0.5 - 0.11), Y(0.44));
  ctx.bezierCurveTo(X(0.5 - 0.07), Y(0.50), X(0.5 + 0.07), Y(0.50), X(0.5 + 0.11), Y(0.44));
  ctx.bezierCurveTo(X(0.5 + shoulderW + 0.025), Y(0.36), X(0.5 + shoulderW + 0.02), Y(0.22), X(0.5 + shoulderW), Y(0.155));
  ctx.bezierCurveTo(X(0.5 + 0.08), Y(0.145), X(0.5 - 0.08), Y(0.145), X(0.5 - shoulderW), Y(0.155));
  ctx.fill(); ctx.stroke();

  // Pelvis
  ctx.beginPath();
  ctx.ellipse(X(0.5), Y(0.545), X(hipW), Y(0.042), 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Left arm
  ctx.beginPath();
  ctx.moveTo(X(0.5 - shoulderW + 0.005), Y(0.165));
  ctx.bezierCurveTo(X(0.5 - shoulderW - 0.06), Y(0.25), X(0.5 - shoulderW - 0.09), Y(0.34), X(0.5 - shoulderW - 0.09), Y(0.46));
  ctx.bezierCurveTo(X(0.5 - shoulderW - 0.09), Y(0.50), X(0.5 - shoulderW - 0.055), Y(0.50), X(0.5 - shoulderW - 0.045), Y(0.46));
  ctx.bezierCurveTo(X(0.5 - shoulderW - 0.04), Y(0.34), X(0.5 - shoulderW - 0.02), Y(0.25), X(0.5 - shoulderW + 0.04), Y(0.19));
  ctx.fill(); ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(X(0.5 + shoulderW - 0.005), Y(0.165));
  ctx.bezierCurveTo(X(0.5 + shoulderW + 0.06), Y(0.25), X(0.5 + shoulderW + 0.09), Y(0.34), X(0.5 + shoulderW + 0.09), Y(0.46));
  ctx.bezierCurveTo(X(0.5 + shoulderW + 0.09), Y(0.50), X(0.5 + shoulderW + 0.055), Y(0.50), X(0.5 + shoulderW + 0.045), Y(0.46));
  ctx.bezierCurveTo(X(0.5 + shoulderW + 0.04), Y(0.34), X(0.5 + shoulderW + 0.02), Y(0.25), X(0.5 + shoulderW - 0.04), Y(0.19));
  ctx.fill(); ctx.stroke();

  // Left leg
  ctx.beginPath();
  ctx.moveTo(X(0.5 - 0.04), Y(0.57));
  ctx.bezierCurveTo(X(0.5 - 0.08), Y(0.65), X(0.5 - 0.085), Y(0.74), X(0.5 - 0.075), Y(0.82));
  ctx.bezierCurveTo(X(0.5 - 0.07), Y(0.91), X(0.5 - 0.065), Y(0.95), X(0.5 - 0.055), Y(0.985));
  ctx.bezierCurveTo(X(0.5 - 0.025), Y(0.99), X(0.5 - 0.01), Y(0.985), X(0.5 - 0.005), Y(0.975));
  ctx.bezierCurveTo(X(0.5 - 0.005), Y(0.94), X(0.5 - 0.01), Y(0.90), X(0.5 - 0.015), Y(0.82));
  ctx.bezierCurveTo(X(0.5 - 0.01), Y(0.74), X(0.5 - 0.005), Y(0.65), X(0.5 + 0.005), Y(0.58));
  ctx.bezierCurveTo(X(0.5 - 0.005), Y(0.565), X(0.5 - 0.025), Y(0.565), X(0.5 - 0.04), Y(0.57));
  ctx.fill(); ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(X(0.5 + 0.04), Y(0.57));
  ctx.bezierCurveTo(X(0.5 + 0.08), Y(0.65), X(0.5 + 0.085), Y(0.74), X(0.5 + 0.075), Y(0.82));
  ctx.bezierCurveTo(X(0.5 + 0.07), Y(0.91), X(0.5 + 0.065), Y(0.95), X(0.5 + 0.055), Y(0.985));
  ctx.bezierCurveTo(X(0.5 + 0.025), Y(0.99), X(0.5 + 0.01), Y(0.985), X(0.5 + 0.005), Y(0.975));
  ctx.bezierCurveTo(X(0.5 + 0.005), Y(0.94), X(0.5 + 0.01), Y(0.90), X(0.5 + 0.015), Y(0.82));
  ctx.bezierCurveTo(X(0.5 + 0.01), Y(0.74), X(0.5 + 0.005), Y(0.65), X(0.5 - 0.005), Y(0.58));
  ctx.bezierCurveTo(X(0.5 + 0.005), Y(0.565), X(0.5 + 0.025), Y(0.565), X(0.5 + 0.04), Y(0.57));
  ctx.fill(); ctx.stroke();

  ctx.restore();
}

function drawInternalOrgans(ctx, W, H) {
  const X = v => v * W, Y = v => v * H;
  ctx.save();
  ctx.lineWidth = 0.9;

  // Brain hemispheres
  ctx.strokeStyle = "rgba(167,139,250,0.35)";
  ctx.beginPath(); ctx.ellipse(X(0.483), Y(0.059), X(0.037), Y(0.028), -0.18, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(X(0.517), Y(0.059), X(0.037), Y(0.028), 0.18, 0, Math.PI * 2); ctx.stroke();
  // Brain stem
  ctx.beginPath(); ctx.moveTo(X(0.5), Y(0.09)); ctx.lineTo(X(0.5), Y(0.118)); ctx.stroke();

  // Spine
  ctx.setLineDash([2.5, 3.5]);
  ctx.strokeStyle = "rgba(192,132,252,0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(X(0.5), Y(0.118));
  ctx.bezierCurveTo(X(0.503), Y(0.22), X(0.503), Y(0.36), X(0.5), Y(0.50));
  ctx.stroke();
  ctx.setLineDash([]);

  // Heart
  ctx.strokeStyle = "rgba(248,113,113,0.35)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(X(0.488), Y(0.308));
  ctx.bezierCurveTo(X(0.488), Y(0.295), X(0.472), Y(0.29), X(0.467), Y(0.303));
  ctx.bezierCurveTo(X(0.459), Y(0.316), X(0.46), Y(0.333), X(0.488), Y(0.352));
  ctx.bezierCurveTo(X(0.516), Y(0.333), X(0.517), Y(0.316), X(0.509), Y(0.303));
  ctx.bezierCurveTo(X(0.504), Y(0.29), X(0.488), Y(0.295), X(0.488), Y(0.308));
  ctx.stroke();

  // Lungs
  ctx.strokeStyle = "rgba(96,165,250,0.25)";
  ctx.beginPath(); ctx.ellipse(X(0.454), Y(0.315), X(0.038), Y(0.062), 0.15, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(X(0.548), Y(0.315), X(0.038), Y(0.062), -0.15, 0, Math.PI * 2); ctx.stroke();

  // Stomach/gut
  ctx.strokeStyle = "rgba(52,211,153,0.25)";
  ctx.beginPath(); ctx.ellipse(X(0.5), Y(0.425), X(0.055), Y(0.04), 0, 0, Math.PI * 2); ctx.stroke();

  ctx.restore();
}

function drawNerves(ctx, W, H, pulses) {
  const X = v => v * W, Y = v => v * H;
  ctx.save();

  NERVE_PATHS.forEach((nerve, i) => {
    const [fx, fy] = nerve.from, [tx, ty] = nerve.to;

    // Base line
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = nerve.color;
    ctx.lineWidth = 0.7;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(X(fx), Y(fy));
    if (nerve.ctrl) {
      ctx.quadraticCurveTo(X(nerve.ctrl[0]), Y(nerve.ctrl[1]), X(tx), Y(ty));
    } else {
      ctx.lineTo(X(tx), Y(ty));
    }
    ctx.stroke();

    // Animated pulse dot
    const t = pulses[i] ?? 0;
    let px, py;
    if (nerve.ctrl) {
      const t1 = 1 - t;
      px = t1*t1*fx + 2*t1*t*nerve.ctrl[0] + t*t*tx;
      py = t1*t1*fy + 2*t1*t*nerve.ctrl[1] + t*t*ty;
    } else {
      px = fx + (tx - fx) * t;
      py = fy + (ty - fy) * t;
    }

    ctx.setLineDash([]);
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = nerve.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = nerve.color;
    ctx.beginPath();
    ctx.arc(X(px), Y(py), 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  ctx.restore();
}

function drawHotspotGlows(ctx, W, H, activeId, hoverId) {
  HOTSPOTS.forEach(spot => {
    const X = spot.x * W, Y = spot.y * H;
    const isActive = spot.id === activeId || spot.id === hoverId;
    const radius = spot.r * W;

    ctx.save();
    const grad = ctx.createRadialGradient(X, Y, 0, X, Y, radius * (isActive ? 2.2 : 1.6));
    const alpha = isActive ? 0.45 : 0.18;
    grad.addColorStop(0, spot.color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
    grad.addColorStop(1, spot.color + "00");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(X, Y, radius * (isActive ? 2.2 : 1.6), 0, Math.PI * 2);
    ctx.fill();

    // Ring
    if (isActive) {
      ctx.strokeStyle = spot.color;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.6;
      ctx.shadowColor = spot.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(X, Y, radius * 1.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawFireflies(ctx, W, H, particles) {
  ctx.save();
  particles.forEach(p => {
    ctx.globalAlpha = p.alpha;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.px * W, p.py * H, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

function initParticles() {
  const particles = [];
  HOTSPOTS.forEach(spot => {
    for (let i = 0; i < spot.ffCount; i++) {
      particles.push({
        spotId: spot.id,
        color: spot.color,
        angle: Math.random() * Math.PI * 2,
        orbitR: 0.025 + Math.random() * 0.04,
        speed: (0.006 + Math.random() * 0.009) * (Math.random() > 0.5 ? 1 : -1),
        size: 1.2 + Math.random() * 1.8,
        alpha: 0.3 + Math.random() * 0.6,
        alphaSpeed: 0.015 + Math.random() * 0.025,
        alphaDir: 1,
        px: spot.x, py: spot.y,
        phase: Math.random() * Math.PI * 2,
      });
    }
  });
  return particles;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function BodyViz({ gender = "neutral", activeConditions = [] }) {
  const canvasRef       = useRef(null);
  const animRef         = useRef(null);
  const particlesRef    = useRef(initParticles());
  const pulsesRef       = useRef(NERVE_PATHS.map(() => Math.random()));
  const [selected, setSelected]   = useState(null);
  const [hovered,  setHovered]    = useState(null);

  const getSpotAt = useCallback((clientX, clientY, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top)  / rect.height;
    return HOTSPOTS.find(s => {
      const dx = nx - s.x, dy = ny - s.y;
      return Math.sqrt(dx * dx + dy * dy) < s.r + 0.025;
    }) ?? null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width, H = rect.height;

      ctx.clearRect(0, 0, W, H);

      // Update particles
      particlesRef.current.forEach(p => {
        const spot = HOTSPOTS.find(s => s.id === p.spotId);
        if (!spot) return;
        p.angle += p.speed;
        p.alpha += p.alphaSpeed * p.alphaDir;
        if (p.alpha > 0.92 || p.alpha < 0.15) p.alphaDir *= -1;
        p.px = spot.x + Math.cos(p.angle + p.phase) * p.orbitR * (H / W);
        p.py = spot.y + Math.sin(p.angle + p.phase) * p.orbitR;
      });

      // Update nerve pulses
      pulsesRef.current = pulsesRef.current.map((t, i) =>
        (t + (0.003 + i * 0.0008)) % 1
      );

      drawBodySilhouette(ctx, W, H, gender);
      drawInternalOrgans(ctx, W, H);
      drawNerves(ctx, W, H, pulsesRef.current);
      drawHotspotGlows(ctx, W, H, selected?.id, hovered?.id);
      drawFireflies(ctx, W, H, particlesRef.current);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [gender, selected, hovered]);

  return (
    <div className="body-viz">
      <canvas
        ref={canvasRef}
        className="body-viz__canvas"
        onClick={e => setSelected(s => {
          const spot = getSpotAt(e.clientX, e.clientY, e.target);
          return spot?.id === s?.id ? null : spot;
        })}
        onMouseMove={e => {
          const spot = getSpotAt(e.clientX, e.clientY, e.target);
          setHovered(spot);
          e.target.style.cursor = spot ? "pointer" : "default";
        }}
        onMouseLeave={() => setHovered(null)}
        onTouchEnd={e => {
          const touch = e.changedTouches[0];
          const spot = getSpotAt(touch.clientX, touch.clientY, canvasRef.current);
          setSelected(s => spot?.id === s?.id ? null : spot);
        }}
      />

      {/* Hotspot legend dots */}
      <div className="body-viz__legend">
        {HOTSPOTS.map(s => (
          <button
            key={s.id}
            className={`body-viz__legend-dot ${selected?.id === s.id ? "active" : ""}`}
            style={{ background: s.color }}
            onClick={() => setSelected(p => p?.id === s.id ? null : s)}
            title={s.label}
          />
        ))}
      </div>

      {/* Info panel */}
      {selected && (
        <div className="body-viz__panel" style={{ borderColor: selected.color + "44" }}>
          <button className="body-viz__panel-close" onClick={() => setSelected(null)}>×</button>
          <div className="body-viz__panel-header">
            <span className="body-viz__panel-dot" style={{ background: selected.color }} />
            <h4 className="body-viz__panel-title">{selected.label}</h4>
          </div>
          <p className="body-viz__panel-info">{selected.info}</p>
          <ul className="body-viz__panel-effects">
            {selected.effects.map(e => (
              <li key={e}><span style={{ color: selected.color }}>→</span> {e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
