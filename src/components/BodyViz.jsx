import { useRef, useEffect, useState, useCallback } from "react";

// ── Hotspot definitions ──────────────────────────────────────────────────────
const HOTSPOTS = [
  // ─ Original system hotspots ─
  {
    id: "brain", x: 0.5, y: 0.065, r: 0.06, color: "#a78bfa", ffCount: 14,
    label: "Brain & Central Nervous System",
    info: "The brain has the highest density of CB1 receptors — hippocampus, cerebellum, basal ganglia, prefrontal cortex. Cannabis affects memory, coordination, mood, and executive function through these dense CB1 populations.",
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
    info: "Inhaled cannabinoids reach peak blood concentration in 3–10 minutes via alveolar absorption. Short-term bronchodilation occurs; chronic smoke exposure can irritate airways.",
    effects: ["Rapid systemic absorption", "Short-term bronchodilation", "Airways sensitivity (chronic smoke)", "Fastest onset of all delivery methods"],
  },
  {
    id: "gut", x: 0.5, y: 0.425, r: 0.038, color: "#34d399", ffCount: 8,
    label: "GI Tract & Enteric System",
    info: "The gut has its own enteric nervous system rich with CB1 and CB2 receptors. Cannabinoids reduce gut motility, decrease intestinal inflammation, and regulate the gut-brain axis.",
    effects: ["Appetite stimulation", "Nausea suppression", "Gut motility regulation", "IBS / Crohn's symptom relief", "Gut-brain axis modulation"],
  },
  {
    id: "immune", x: 0.38, y: 0.355, r: 0.03, color: "#fbbf24", ffCount: 6,
    label: "Immune System (CB2 Receptors)",
    info: "CB2 receptors are concentrated in immune tissue — spleen, lymph nodes, and white blood cells. Cannabinoids profoundly modulate immune response, driving anti-inflammatory effects central to arthritis, MS, and lupus.",
    effects: ["Anti-inflammatory response", "Immune cell modulation", "Autoimmune symptom relief", "Cytokine regulation", "Reduced oxidative stress"],
  },
  {
    id: "spine", x: 0.505, y: 0.48, r: 0.028, color: "#c084fc", ffCount: 5,
    label: "Spinal Cord & Peripheral Nerves",
    info: "The spinal cord routes endocannabinoid signals from the brain to the body. CB1 receptors in the dorsal horn gate pain signals — the basis of cannabis analgesia for neuropathic and chronic pain.",
    effects: ["Pain signal gating (gate theory)", "Neuropathic pain reduction", "Spasticity / muscle spasm control", "Anti-nociception", "Signal propagation to limbs"],
  },
  {
    id: "joints", x: 0.625, y: 0.695, r: 0.032, color: "#6ee7b7", ffCount: 8,
    label: "Joints, Muscles & Connective Tissue",
    info: "CB2 receptors in synovial tissue reduce joint inflammation directly at the site. Muscle relaxation occurs via CNS pathways and peripheral muscle CB1 receptors.",
    effects: ["Joint inflammation reduction", "Muscle relaxation", "Spasm reduction (spasticity)", "Arthritis pain relief", "Fibromyalgia symptom management"],
  },

  // ─ Lymph node / inflammation hotspots ─
  {
    id: "lymph_cervical", x: 0.5, y: 0.138, r: 0.034, color: "#f97316", ffCount: 5,
    label: "Cervical Lymph Nodes (Neck)",
    info: "The cervical lymph chain runs along both sides of the neck through 7–8 node groups. CB2 receptors on these immune cells regulate local inflammation. Cannabis reduces inflammatory cytokine release (TNF-α, IL-6) here, relevant for head/neck autoimmune flares and post-infection swelling.",
    effects: ["Reduced cervical inflammation", "TNF-α and IL-6 cytokine suppression", "CB2-mediated immune cell regulation", "Post-infection lymph node relief", "Head & neck autoimmune support"],
  },
  {
    id: "lymph_axillary_l", x: 0.318, y: 0.228, r: 0.034, color: "#f97316", ffCount: 6,
    label: "Left Axillary Lymph Nodes (Armpit)",
    info: "20–30 lymph nodes cluster in each axilla (armpit), draining the arm, chest wall, and breast. CB2 receptor activation by cannabinoids suppresses macrophage inflammatory activity in these nodes, reducing swelling in shoulder, upper arm, and lateral chest conditions.",
    effects: ["Upper arm inflammation reduction", "Shoulder / rotator cuff anti-inflammatory support", "CB2 macrophage modulation", "Lymphedema symptom relief", "Breast tissue immune regulation"],
  },
  {
    id: "lymph_axillary_r", x: 0.682, y: 0.228, r: 0.034, color: "#f97316", ffCount: 6,
    label: "Right Axillary Lymph Nodes (Armpit)",
    info: "20–30 lymph nodes cluster in each axilla (armpit), draining the arm, chest wall, and breast. CB2 receptor activation by cannabinoids suppresses macrophage inflammatory activity in these nodes, reducing swelling in shoulder, upper arm, and lateral chest conditions.",
    effects: ["Upper arm inflammation reduction", "Shoulder / rotator cuff anti-inflammatory support", "CB2 macrophage modulation", "Lymphedema symptom relief", "Breast tissue immune regulation"],
  },
  {
    id: "lymph_inguinal_l", x: 0.424, y: 0.558, r: 0.034, color: "#f97316", ffCount: 6,
    label: "Left Inguinal Lymph Nodes (Groin)",
    info: "The inguinal nodes (8–10 per side) drain the entire lower extremity, external genitalia, and lower abdominal wall. CB2 activation by cannabinoids reduces prostaglandin production and neutrophil recruitment here, directly addressing inflammation in the legs, hips, and knee joints drained by these nodes.",
    effects: ["Lower limb inflammation gating", "Hip & knee anti-inflammatory drainage", "Prostaglandin production suppression", "Neutrophil recruitment reduction", "Groin / pelvic autoimmune support"],
  },
  {
    id: "lymph_inguinal_r", x: 0.576, y: 0.558, r: 0.034, color: "#f97316", ffCount: 6,
    label: "Right Inguinal Lymph Nodes (Groin)",
    info: "The inguinal nodes (8–10 per side) drain the entire lower extremity, external genitalia, and lower abdominal wall. CB2 activation by cannabinoids reduces prostaglandin production and neutrophil recruitment here, directly addressing inflammation in the legs, hips, and knee joints drained by these nodes.",
    effects: ["Lower limb inflammation gating", "Hip & knee anti-inflammatory drainage", "Prostaglandin production suppression", "Neutrophil recruitment reduction", "Groin / pelvic autoimmune support"],
  },
  {
    id: "lymph_popliteal_l", x: 0.415, y: 0.775, r: 0.030, color: "#f97316", ffCount: 5,
    label: "Left Popliteal Lymph Nodes (Back of Knee)",
    info: "The popliteal fossa (back of the knee) contains 6–7 lymph nodes that drain the foot, ankle, and lower leg. Inflammatory conditions like knee osteoarthritis, Achilles tendinitis, and plantar fasciitis all route waste fluid through these nodes. CB2 receptor activation reduces joint effusion and the inflammatory cascade at this drainage hub.",
    effects: ["Knee joint effusion reduction", "Achilles & calf anti-inflammatory support", "Ankle / foot inflammatory drainage", "Osteoarthritis symptom modulation", "CB2-driven synovial fluid regulation"],
  },
  {
    id: "lymph_popliteal_r", x: 0.585, y: 0.775, r: 0.030, color: "#f97316", ffCount: 5,
    label: "Right Popliteal Lymph Nodes (Back of Knee)",
    info: "The popliteal fossa (back of the knee) contains 6–7 lymph nodes that drain the foot, ankle, and lower leg. Inflammatory conditions like knee osteoarthritis, Achilles tendinitis, and plantar fasciitis all route waste fluid through these nodes. CB2 receptor activation reduces joint effusion and the inflammatory cascade at this drainage hub.",
    effects: ["Knee joint effusion reduction", "Achilles & calf anti-inflammatory support", "Ankle / foot inflammatory drainage", "Osteoarthritis symptom modulation", "CB2-driven synovial fluid regulation"],
  },
];

// ── Nerve / CNS path definitions ─────────────────────────────────────────────
const NERVE_PATHS = [
  { from: [0.5, 0.09],   to: [0.5, 0.125],   ctrl: null,           color: "#a78bfa" },
  { from: [0.5, 0.125],  to: [0.46, 0.285],  ctrl: [0.5, 0.20],   color: "#f87171" },
  { from: [0.5, 0.125],  to: [0.545, 0.30],  ctrl: [0.5, 0.22],   color: "#60a5fa" },
  { from: [0.5, 0.125],  to: [0.505, 0.475], ctrl: [0.5, 0.30],   color: "#c084fc" },
  { from: [0.505, 0.35], to: [0.38, 0.345],  ctrl: [0.43, 0.33],  color: "#fbbf24" },
  { from: [0.505, 0.40], to: [0.5, 0.425],   ctrl: null,           color: "#34d399" },
  { from: [0.505, 0.475],to: [0.625, 0.68],  ctrl: [0.57, 0.575], color: "#6ee7b7" },
  { from: [0.505, 0.475],to: [0.375, 0.68],  ctrl: [0.43, 0.575], color: "#6ee7b7" },
  { from: [0.5, 0.20],   to: [0.73, 0.43],   ctrl: [0.65, 0.22],  color: "#6ee7b7" },
  { from: [0.5, 0.20],   to: [0.27, 0.43],   ctrl: [0.35, 0.22],  color: "#6ee7b7" },
];

// ── Lymphatic vessel paths (amber, animated lymph flow) ───────────────────────
const LYMPH_VESSEL_PATHS = [
  // Thoracic duct — main trunk up center
  { from: [0.494, 0.475], to: [0.494, 0.145], ctrl: [0.492, 0.30] },
  // Left subclavian — thoracic duct to left armpit
  { from: [0.494, 0.185], to: [0.318, 0.228], ctrl: [0.40, 0.185] },
  // Right lymphatic duct — to right armpit
  { from: [0.494, 0.175], to: [0.682, 0.228], ctrl: [0.595, 0.175] },
  // Left arm — axillary to epitrochlear to wrist
  { from: [0.318, 0.228], to: [0.270, 0.405], ctrl: [0.295, 0.315] },
  // Right arm — axillary to epitrochlear to wrist
  { from: [0.682, 0.228], to: [0.730, 0.405], ctrl: [0.705, 0.315] },
  // Left inguinal — up to thoracic duct
  { from: [0.424, 0.558], to: [0.494, 0.475], ctrl: [0.455, 0.515] },
  // Right inguinal — up to thoracic duct
  { from: [0.576, 0.558], to: [0.494, 0.475], ctrl: [0.540, 0.515] },
  // Left leg — inguinal down to popliteal
  { from: [0.424, 0.558], to: [0.415, 0.775], ctrl: [0.418, 0.665] },
  // Right leg — inguinal down to popliteal
  { from: [0.576, 0.558], to: [0.585, 0.775], ctrl: [0.582, 0.665] },
  // Left lower leg — popliteal to ankle
  { from: [0.415, 0.775], to: [0.424, 0.955], ctrl: [0.418, 0.865] },
  // Right lower leg — popliteal to ankle
  { from: [0.585, 0.775], to: [0.576, 0.955], ctrl: [0.582, 0.865] },
  // Mesenteric — gut area to thoracic duct
  { from: [0.5, 0.41],   to: [0.494, 0.475],  ctrl: null },
];

// ── Visual-only lymph node cluster positions (drawn but not clickable) ────────
const LYMPH_NODE_DRAW = [
  // Cervical chain — bilateral pairs along neck
  { x: 0.466, y: 0.130 }, { x: 0.534, y: 0.130 },
  { x: 0.458, y: 0.140 }, { x: 0.542, y: 0.140 },
  { x: 0.5,   y: 0.130 },
  // Left axillary cluster
  { x: 0.308, y: 0.220 }, { x: 0.320, y: 0.230 }, { x: 0.312, y: 0.240 },
  // Right axillary cluster
  { x: 0.692, y: 0.220 }, { x: 0.680, y: 0.230 }, { x: 0.688, y: 0.240 },
  // Left epitrochlear (inner elbow)
  { x: 0.268, y: 0.400 }, { x: 0.274, y: 0.410 },
  // Right epitrochlear (inner elbow)
  { x: 0.732, y: 0.400 }, { x: 0.726, y: 0.410 },
  // Mesenteric (around gut)
  { x: 0.470, y: 0.400 }, { x: 0.500, y: 0.398 }, { x: 0.530, y: 0.400 },
  // Para-aortic (along central trunk)
  { x: 0.487, y: 0.445 }, { x: 0.507, y: 0.440 },
  // Left inguinal cluster
  { x: 0.415, y: 0.555 }, { x: 0.425, y: 0.562 }, { x: 0.432, y: 0.570 },
  // Right inguinal cluster
  { x: 0.585, y: 0.555 }, { x: 0.575, y: 0.562 }, { x: 0.568, y: 0.570 },
  // Left upper leg (femoral chain)
  { x: 0.432, y: 0.625 }, { x: 0.425, y: 0.660 },
  // Right upper leg (femoral chain)
  { x: 0.568, y: 0.625 }, { x: 0.575, y: 0.660 },
  // Left popliteal cluster
  { x: 0.408, y: 0.772 }, { x: 0.418, y: 0.780 }, { x: 0.412, y: 0.790 },
  // Right popliteal cluster
  { x: 0.592, y: 0.772 }, { x: 0.582, y: 0.780 }, { x: 0.588, y: 0.790 },
  // Left ankle / dorsal foot
  { x: 0.421, y: 0.940 }, { x: 0.426, y: 0.955 },
  // Right ankle / dorsal foot
  { x: 0.579, y: 0.940 }, { x: 0.574, y: 0.955 },
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

// ── Lymphatic system drawing ──────────────────────────────────────────────────
function drawLymphaticSystem(ctx, W, H, lymphPulses) {
  const X = v => v * W, Y = v => v * H;
  const LYMPH_COLOR = "#f97316";

  ctx.save();

  // ─ Vessel lines ─
  ctx.strokeStyle = "rgba(249,115,22,0.22)";
  ctx.lineWidth = 0.8;
  ctx.setLineDash([1.5, 4]);

  LYMPH_VESSEL_PATHS.forEach(vessel => {
    const [fx, fy] = vessel.from, [tx, ty] = vessel.to;
    ctx.beginPath();
    ctx.moveTo(X(fx), Y(fy));
    if (vessel.ctrl) {
      ctx.quadraticCurveTo(X(vessel.ctrl[0]), Y(vessel.ctrl[1]), X(tx), Y(ty));
    } else {
      ctx.lineTo(X(tx), Y(ty));
    }
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // ─ Animated lymph flow pulses ─
  LYMPH_VESSEL_PATHS.forEach((vessel, i) => {
    const t = lymphPulses[i] ?? 0;
    const [fx, fy] = vessel.from, [tx, ty] = vessel.to;
    let px, py;
    if (vessel.ctrl) {
      const t1 = 1 - t;
      px = t1 * t1 * fx + 2 * t1 * t * vessel.ctrl[0] + t * t * tx;
      py = t1 * t1 * fy + 2 * t1 * t * vessel.ctrl[1] + t * t * ty;
    } else {
      px = fx + (tx - fx) * t;
      py = fy + (ty - fy) * t;
    }

    ctx.globalAlpha = 0.7;
    ctx.shadowColor = LYMPH_COLOR;
    ctx.shadowBlur = 6;
    ctx.fillStyle = LYMPH_COLOR;
    ctx.beginPath();
    ctx.arc(X(px), Y(py), 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ─ Lymph node dots ─
  ctx.globalAlpha = 1;
  LYMPH_NODE_DRAW.forEach(node => {
    const nx = X(node.x), ny = Y(node.y);
    // Outer glow
    const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, W * 0.016);
    grad.addColorStop(0, "rgba(249,115,22,0.35)");
    grad.addColorStop(1, "rgba(249,115,22,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(nx, ny, W * 0.016, 0, Math.PI * 2);
    ctx.fill();

    // Node body
    ctx.fillStyle = "rgba(249,115,22,0.55)";
    ctx.shadowColor = "rgba(249,115,22,0.6)";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(nx, ny, W * 0.007, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawNerves(ctx, W, H, pulses) {
  const X = v => v * W, Y = v => v * H;
  ctx.save();

  NERVE_PATHS.forEach((nerve, i) => {
    const [fx, fy] = nerve.from, [tx, ty] = nerve.to;

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

    const t = pulses[i] ?? 0;
    let px, py;
    if (nerve.ctrl) {
      const t1 = 1 - t;
      px = t1 * t1 * fx + 2 * t1 * t * nerve.ctrl[0] + t * t * tx;
      py = t1 * t1 * fy + 2 * t1 * t * nerve.ctrl[1] + t * t * ty;
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
    const isLymph  = spot.id.startsWith("lymph_");
    const radius   = spot.r * W;

    ctx.save();
    const grad = ctx.createRadialGradient(X, Y, 0, X, Y, radius * (isActive ? 2.2 : 1.6));
    const alpha = isActive ? 0.5 : (isLymph ? 0.22 : 0.18);
    grad.addColorStop(0, spot.color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
    grad.addColorStop(1, spot.color + "00");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(X, Y, radius * (isActive ? 2.2 : 1.6), 0, Math.PI * 2);
    ctx.fill();

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
  const canvasRef     = useRef(null);
  const animRef       = useRef(null);
  const particlesRef  = useRef(initParticles());
  const pulsesRef     = useRef(NERVE_PATHS.map(() => Math.random()));
  const lymphPulsesRef= useRef(LYMPH_VESSEL_PATHS.map(() => Math.random()));
  const [selected, setSelected] = useState(null);
  const [hovered,  setHovered]  = useState(null);

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

      // Update firefly particles
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

      // Update lymph pulses (slower than nerve — lymph moves slowly)
      lymphPulsesRef.current = lymphPulsesRef.current.map((t, i) =>
        (t + (0.0015 + i * 0.0003)) % 1
      );

      // Draw order: body → organs → lymphatics → nerves → glows → fireflies
      drawBodySilhouette(ctx, W, H, gender);
      drawInternalOrgans(ctx, W, H);
      drawLymphaticSystem(ctx, W, H, lymphPulsesRef.current);
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

      {/* Legend — group by system */}
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
            {selected.id.startsWith("lymph_") && (
              <span className="body-viz__panel-badge">CB2 · Anti-inflammatory</span>
            )}
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
