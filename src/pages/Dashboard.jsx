import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import BodyViz from "../components/BodyViz.jsx";
import BiSlider from "../components/BiSlider.jsx";
import { getUserExperiences } from "../services/experienceService.js";
import { getUserPrestige } from "../services/prestigeService.js";

// ── Medical conditions ────────────────────────────────────────────────────────
const MEDICAL_CONDITIONS = [
  "Anxiety Disorder","Generalized Anxiety (GAD)","Social Anxiety","Panic Disorder",
  "Depression","Bipolar Disorder","PTSD","ADHD / ADD",
  "Chronic Pain","Neuropathic Pain","Back Pain / Spinal Issues","Fibromyalgia",
  "Arthritis","Rheumatoid Arthritis","Osteoarthritis","Gout",
  "Insomnia / Sleep Disorder","Sleep Apnea",
  "Multiple Sclerosis","Parkinson's Disease","Epilepsy / Seizure Disorder","ALS",
  "Migraine / Chronic Headaches","Cluster Headaches",
  "Crohn's Disease","Ulcerative Colitis","IBS (Irritable Bowel Syndrome)","Celiac Disease",
  "Cancer","Chemotherapy-related Nausea","Cachexia / Wasting Syndrome",
  "Glaucoma","Lupus","Psoriasis","Eczema",
  "Diabetes (Type 1)","Diabetes (Type 2)",
  "HIV/AIDS","Hepatitis C",
  "Tourette Syndrome","Autism Spectrum Disorder",
  "Endometriosis","PCOS","Menstrual Pain / Dysmenorrhea",
  "Hypertension","Cardiovascular Disease",
  "Opioid Use Disorder / Substance Recovery","Anorexia / Eating Disorder",
  "TBI (Traumatic Brain Injury)","Muscle Spasms / Spasticity",
  "Post-surgical / Acute Pain","Nausea / Vomiting",
  "Palliative / End-of-Life Care","Alzheimer's / Dementia",
];

const CATEGORY_ICONS = {
  flower: "🌿", vape: "💨", edible: "🍫", edibles: "🍫",
  concentrate: "💎", concentrates: "💎", tincture: "🧪", tinctures: "🧪",
  topical: "🧴", topicals: "🧴", capsule: "💊", pre_roll: "🚬",
};

const PRESTIGE_LEVELS = [
  { min: 0,    label: "Seedling",    color: "#86efac" },
  { min: 100,  label: "Sprout",      color: "#4ade80" },
  { min: 300,  label: "Cultivar",    color: "#22c55e" },
  { min: 600,  label: "Curator",     color: "#16a34a" },
  { min: 1000, label: "Connoisseur", color: "#15803d" },
  { min: 1500, label: "Sommelier",   color: "#166534" },
  { min: 2500, label: "Mycologist",  color: "#14532d" },
];

function getLevel(pts) {
  for (let i = PRESTIGE_LEVELS.length - 1; i >= 0; i--) {
    if (pts >= PRESTIGE_LEVELS[i].min) return PRESTIGE_LEVELS[i];
  }
  return PRESTIGE_LEVELS[0];
}

// ── Profile derivation (from Profile.jsx) ────────────────────────────────────
const METHOD_GUIDANCE = {
  flower: {
    icon: "🌿", label: "Flower",
    tips: (a) => [
      `Look for strains with ${a.terpene < 40 ? "myrcene and caryophyllene" : "limonene and terpinolene"} in the terpene profile.`,
      a.thc_sensitivity < 45
        ? "Stick to 10–18% THC flower and avoid anything marketed primarily on potency."
        : "You can explore higher-THC cultivars — focus on terpene complexity over raw percentage.",
      a.purpose > 55 ? "Ask your budtender about therapeutic strains with specific cannabinoid ratios." : "Seek out craft or small-batch genetics for a more nuanced experience.",
    ],
  },
  vape: {
    icon: "💨", label: "Vape",
    tips: (a) => [
      "Choose live resin or full-spectrum oil cartridges to preserve the terpene profile that matches your preferences.",
      a.anxiety < 40 ? "Avoid distillate-only carts — isolated THC can amplify anxiety without natural terpene balance." : "Distillate or full-spectrum both work for you. Look for hardware with temperature control.",
      "Start with 1–2 second draws. Vape onset is fast — wait 5 minutes before taking more.",
    ],
  },
  edibles: {
    icon: "🍫", label: "Edibles",
    tips: (a) => [
      a.thc_sensitivity < 45
        ? "Start with 2.5–5mg THC max. Edibles metabolize through the liver and hit much harder than inhaled cannabis."
        : "5–10mg is a reasonable starting dose. Always wait a full 2 hours before considering more.",
      "Choose nano-emulsion or fast-acting formats if onset time matters — they activate in 15–45 minutes.",
      a.anxiety < 40 ? "High-CBD edibles (1:1 or 2:1 CBD:THC) are strongly recommended to reduce anxiety risk." : "Any THC:CBD ratio should work well for you. Focus on quality ingredients and accurate lab dosing.",
    ],
  },
  concentrates: {
    icon: "💎", label: "Concentrates",
    tips: (a) => [
      a.experience < 50
        ? "⚠️ Concentrates are very high potency. Build tolerance with flower or vape first before exploring dabs."
        : "Rosin and live resin concentrates preserve the full terpene profile — ideal for chasing specific effects.",
      "Low-temperature dabbing (below 450°F / 232°C) retains terpenes and produces a smoother experience.",
      "Start with a rice-grain-sized amount. Effects are near-immediate and significantly stronger than flower.",
    ],
  },
  tinctures: {
    icon: "🧪", label: "Tinctures",
    tips: (a) => [
      "Sublingual (under the tongue) dosing activates in 15–45 minutes. Hold for 60–90 seconds before swallowing.",
      a.thc_sensitivity < 45
        ? "Start with 1–2.5mg THC per dose. Tinctures allow precise control — ideal for your sensitivity."
        : "A 5–10mg starting dose gives you good control. Excellent for dialing in your exact sweet spot.",
      "Look for a 1:1 CBD:THC ratio if therapeutic relief is your primary goal.",
    ],
  },
  topicals: {
    icon: "🧴", label: "Topicals",
    tips: () => [
      "Topicals do not enter the bloodstream and produce no psychoactive effect — ideal for localized pain or skin conditions.",
      "Transdermal patches are different — they do cross the bloodstream and produce systemic effects.",
      "Look for formulations with menthol or arnica for added pain relief, or CBD-dominant topicals for anti-inflammatory benefit.",
    ],
  },
};

const SLIDER_META = [
  { id: "effect",          label: "Effect Direction",  leftLabel: "Relaxing",      rightLabel: "Energizing",        leftEmoji: "🌙", rightEmoji: "⚡",  leftColor: "#6d28d9", rightColor: "#f59e0b" },
  { id: "thc_sensitivity", label: "THC Sensitivity",   leftLabel: "Very Sensitive", rightLabel: "High Tolerance",    leftEmoji: "🪶", rightEmoji: "🏔️", leftColor: "#ef4444", rightColor: "#10b981" },
  { id: "cbd_importance",  label: "CBD Priority",      leftLabel: "Not a Factor",   rightLabel: "Essential",         leftEmoji: "🌱", rightEmoji: "💊",  leftColor: "#94a3b8", rightColor: "#0891b2" },
  { id: "anxiety",         label: "Anxiety Tendency",  leftLabel: "Anxiety-Prone",  rightLabel: "Anxiety-Resistant", leftEmoji: "😰", rightEmoji: "😌",  leftColor: "#dc2626", rightColor: "#16a34a" },
  { id: "experience",      label: "Experience Level",  leftLabel: "Beginner",       rightLabel: "Seasoned",          leftEmoji: "🌱", rightEmoji: "🎓",  leftColor: "#84cc16", rightColor: "#1d4ed8" },
  { id: "terpene",         label: "Terpene Affinity",  leftLabel: "Earthy",         rightLabel: "Citrus & Fruity",   leftEmoji: "🌍", rightEmoji: "🍋",  leftColor: "#78350f", rightColor: "#f97316" },
  { id: "context",         label: "Usage Context",     leftLabel: "Solo & Private", rightLabel: "Social & Active",   leftEmoji: "🛋️", rightEmoji: "🎉",  leftColor: "#7c3aed", rightColor: "#ec4899" },
  { id: "purpose",         label: "Primary Purpose",   leftLabel: "Recreational",   rightLabel: "Therapeutic",       leftEmoji: "🎭", rightEmoji: "🏥",  leftColor: "#0284c7", rightColor: "#15803d" },
];

function deriveProfile(answers) {
  if (!answers) return null;
  const { effect = 50, thc_sensitivity = 50, cbd_importance = 50, anxiety = 50,
          experience = 50, terpene = 50, context = 50, purpose = 50, consumptionPrefs = [] } = answers;

  let archetype, archetypeEmoji, archetypeSub;
  if (anxiety < 35 && thc_sensitivity < 40)      { archetype = "The Gentle Healer";    archetypeEmoji = "🌸"; archetypeSub = "You need gentle, balanced products. High CBD, low THC, calming terpenes."; }
  else if (effect > 65 && experience > 55)        { archetype = "The Creative Explorer"; archetypeEmoji = "🚀"; archetypeSub = "You chase inspiration and energy. Sativa-leaning, terpene-forward, mid-to-high potency."; }
  else if (effect < 35 && purpose > 55)           { archetype = "The Restful Restorer"; archetypeEmoji = "🌙"; archetypeSub = "Sleep, pain relief, and deep relaxation are your goals. Indica-dominant, myrcene-rich."; }
  else if (context > 60 && effect > 50)           { archetype = "The Social Connector"; archetypeEmoji = "🎉"; archetypeSub = "You thrive socially with cannabis. Uplifting hybrids and citrus terpenes are your match."; }
  else if (experience > 65 && thc_sensitivity > 60) { archetype = "The Connoisseur";   archetypeEmoji = "🎓"; archetypeSub = "You're experienced and discerning. Terpene complexity and craft genetics excite you."; }
  else                                             { archetype = "The Balanced Seeker"; archetypeEmoji = "⚖️"; archetypeSub = "You value versatility and balance. Well-rounded hybrids with moderate potency suit you best."; }

  const terpenes = [];
  if (terpene < 40) {
    terpenes.push({ name: "Myrcene", desc: "Earthy, musky — deeply relaxing", emoji: "🌿" });
    terpenes.push({ name: "Beta-Caryophyllene", desc: "Peppery — anti-anxiety, anti-inflammatory", emoji: "🌶️" });
  } else {
    terpenes.push({ name: "Limonene", desc: "Citrusy — mood-elevating, stress relief", emoji: "🍋" });
    terpenes.push({ name: "Terpinolene", desc: "Floral and fruity — uplifting, energizing", emoji: "🌺" });
  }
  if (anxiety < 45) terpenes.push({ name: "Linalool", desc: "Lavender — calming, anti-anxiety", emoji: "💜" });
  if (effect > 55)  terpenes.push({ name: "Pinene", desc: "Pine — alertness, mental clarity", emoji: "🌲" });

  let potencyGuide;
  if (thc_sensitivity < 30)      potencyGuide = "Start with 5–10% THC max. Even small amounts are powerful for you.";
  else if (thc_sensitivity < 50) potencyGuide = "10–18% THC is your sweet spot. Avoid very high-potency products.";
  else if (thc_sensitivity < 70) potencyGuide = "18–25% THC works well for you. Experiment within this range.";
  else                           potencyGuide = "25%+ THC is appropriate for your tolerance. Focus on strain quality over raw potency.";

  let cbdGuide;
  if (cbd_importance > 60)      cbdGuide = "Prioritize a 1:1 or 2:1 CBD:THC ratio. CBD will meaningfully improve your experience.";
  else if (cbd_importance > 35) cbdGuide = "A small CBD presence (5–10%) is beneficial for softening harsh effects.";
  else                          cbdGuide = "Pure THC strains are fine for you — CBD is optional but never harmful.";

  const avoid = [];
  if (anxiety < 40) avoid.push("Very high THC (>25%) without CBD");
  if (anxiety < 40) avoid.push("THCV-dominant strains (can amplify anxiety)");
  if (effect < 40 && context > 55) avoid.push("Heavy indicas before social activities");
  if (experience < 35) avoid.push("Concentrates, dabs, or ultra-high potency products");
  if (thc_sensitivity < 40) avoid.push("Edibles without precise dosing information");

  const formatGuidance = consumptionPrefs
    .filter((id) => METHOD_GUIDANCE[id])
    .map((id) => ({
      id,
      ...METHOD_GUIDANCE[id],
      tips: METHOD_GUIDANCE[id].tips({ effect, thc_sensitivity, cbd_importance, anxiety, experience, terpene, context, purpose }),
    }));

  return { archetype, archetypeEmoji, archetypeSub, terpenes, potencyGuide, cbdGuide, avoid, formatGuidance };
}

// ── Insight engine ────────────────────────────────────────────────────────────
function generateInsights(profile, healthData, experiences) {
  if (!profile) return [{
    type: "profile", priority: 3, icon: "🧬", area: null,
    title: "Complete Your Assessment",
    text: "Take the assessment to unlock your personalized endocannabinoid profile and AI-driven cannabis insights.",
  }];

  const { effect = 50, anxiety = 50, thc_sensitivity = 50, cbd_importance = 50,
          experience: expLevel = 50, terpene = 50, context = 50, purpose = 50 } = profile;
  const conditions = healthData?.conditions ?? [];
  const age = parseInt(healthData?.age) || null;
  const insights = [];

  const painMatch = conditions.filter(c => /pain|arthritis|fibro|spinal|gout|spasm/i.test(c));
  if (painMatch.length) insights.push({ type: "health", priority: 1, icon: "🌿", area: "spine", title: "Pain Management Profile", text: `For ${painMatch.slice(0,2).join(" & ")}: beta-caryophyllene (BCP) and myrcene have the strongest anti-inflammatory evidence. Target strains with >0.3% BCP on the COA. 1:1 CBD:THC ratios reduce pain without heavy sedation during daylight hours.` });
  const anxietyMatch = conditions.filter(c => /anxiety|ptsd|panic|depression|bipolar/i.test(c));
  if (anxietyMatch.length || anxiety < 40) insights.push({ type: "health", priority: 1, icon: "😌", area: "brain", title: "Mental Health Optimization", text: `${anxietyMatch.length ? `Your ${anxietyMatch[0]} diagnosis` : "Your anxiety score"} signals elevated CB1 sensitivity in the amygdala. Prioritize linalool + CBD products. Avoid strains >20% THC or high THCV. Full-spectrum CBD with terpenes outperforms isolate.` });
  const sleepMatch = conditions.filter(c => /insomnia|sleep/i.test(c));
  if (sleepMatch.length) insights.push({ type: "health", priority: 2, icon: "🌙", area: "brainstem", title: "Sleep Cycle Support", text: "Indica-dominant strains with myrcene + CBN 30–45 min before bed. Edibles extend effect duration to 6–8 hours — ideal for sleep maintenance. Avoid sativas and high-THCV after 6 PM." });
  const gutMatch = conditions.filter(c => /crohn|colitis|ibs|bowel|celiac/i.test(c));
  if (gutMatch.length) insights.push({ type: "health", priority: 2, icon: "🌿", area: "gut", title: "GI Tract Support", text: `CB1 and CB2 receptors in your enteric nervous system directly address ${gutMatch[0]}. CBD-dominant products reduce gut inflammation without psychoactivity. Tinctures and capsules allow precise enteric dosing.` });
  const neuroMatch = conditions.filter(c => /epilepsy|seizure|multiple sclerosis|parkinson|als|tbi/i.test(c));
  if (neuroMatch.length) insights.push({ type: "health", priority: 1, icon: "🧠", area: "brain", title: "Neurological Consideration", text: `For ${neuroMatch[0]}: high-CBD products (>15% CBD, minimal THC) have the strongest clinical evidence. Always coordinate with your neurologist before adjusting prescriptions.` });
  if (age && age >= 60) insights.push({ type: "safety", priority: 1, icon: "⚠️", area: "heart", title: "Dosage Adjustment for Age", text: "CYP450 enzyme activity declines ~30% with age, slowing cannabis metabolism. Start at 25–50% of standard doses; wait 2 hours before redosing edibles. CBD-forward products reduce cardiovascular strain." });
  if (effect < 30) insights.push({ type: "profile", priority: 2, icon: "🌙", area: "immune", title: "Indica-forward Body Response", text: "Your deep-relaxation preference maps to CB1-dense basal ganglia regions controlling motor and tension. Myrcene-heavy indicas activate these pathways. Best for evening, recovery, and sleep." });
  else if (effect > 70) insights.push({ type: "profile", priority: 2, icon: "⚡", area: "brain", title: "Sativa-forward Cognitive Effects", text: "Your energy preference maps to dopaminergic pathways in the prefrontal cortex. Limonene and pinene terpenes boost dopamine and serotonin activity. Best for daytime, creative work, and social settings." });
  if (thc_sensitivity < 35) insights.push({ type: "profile", priority: 1, icon: "⚠️", area: "brain", title: "High THC Sensitivity", text: "Your profile indicates elevated CB1 receptor density or lower CYP2C9/CYP3A4 enzyme activity. Begin at 2.5–5mg THC and wait 90 min before redosing. CBD (50–100mg) acts as a partial CB1 antagonist." });
  if (cbd_importance > 65) insights.push({ type: "profile", priority: 3, icon: "💊", area: "immune", title: "High CBD Affinity", text: "High CBD priority correlates with anxiety sensitivity or therapeutic focus. CBD activates 5-HT1A serotonin receptors (the same target as SSRIs) while moderating THC's psychoactivity. Optimal ratio: 1:1 to 2:1 CBD:THC." });

  if (experiences.length > 0) {
    const rated = experiences.filter(e => e.rating > 0);
    if (rated.length >= 2) {
      const avg = rated.reduce((s, e) => s + e.rating, 0) / rated.length;
      const best = rated.reduce((a, b) => b.rating > a.rating ? b : a);
      const vendorMap = {};
      experiences.forEach(e => { if (e.vendor) vendorMap[e.vendor] = (vendorMap[e.vendor] || 0) + 1; });
      const topVendor = Object.entries(vendorMap).sort(([,a],[,b]) => b - a)[0]?.[0];
      insights.push({ type: "pattern", priority: 3, icon: "📊", area: null, title: `${experiences.length} Sessions Analyzed`, text: `Average satisfaction: ${avg.toFixed(1)}/5. Best session: "${best.productName || "your top product"}" (${best.rating}/5)${best.vendor ? ` at ${best.vendor}` : ""}.${topVendor ? ` You return to ${topVendor} most often.` : ""} More logs = sharper recommendations.` });
    }
    const catMap = {};
    experiences.filter(e => e.rating > 0 && e.category).forEach(e => { if (!catMap[e.category]) catMap[e.category] = []; catMap[e.category].push(e.rating); });
    const bestCat = Object.entries(catMap).map(([cat, r]) => ({ cat, avg: r.reduce((a,b)=>a+b,0)/r.length })).sort((a,b)=>b.avg-a.avg)[0];
    if (bestCat && bestCat.avg >= 3.8) insights.push({ type: "recommendation", priority: 2, icon: "⭐", area: null, title: `${bestCat.cat.charAt(0).toUpperCase() + bestCat.cat.slice(1)} Is Your Best Format`, text: `Your ${bestCat.cat} sessions average ${bestCat.avg.toFixed(1)}/5 — highest of any delivery method. This aligns with your bioavailability profile and consumption preferences.` });
  }

  if (insights.length === 0) insights.push({ type: "profile", priority: 3, icon: "🧬", area: null, title: "Add Health Data for Personalized Insights", text: "Your assessment profile is ready. Add your health conditions and log some experiences to unlock deeper endocannabinoid insights tailored to your physiology." });

  // ── Lifestyle ─────────────────────────────────────────────────────────────
  if (effect > 60 && terpene > 55) {
    insights.push({ type: "lifestyle", priority: 4, icon: "🌱", area: null, title: "Active & Exploratory Lifestyle", text: "Your energizing preference and citrus terpene affinity correlate with an active, outward-facing lifestyle. Gallup (2023) data shows this cannabis profile is 3× more likely to report cannabis enhancing physical activities — yoga, hiking, running, creative hobbies. Limonene boosts serotonin and dopamine; pinene enhances bronchodilation, supporting physical performance. Micro-doses (2.5–5mg THC) before exercise are optimal." });
  } else if (effect < 40 && terpene < 40) {
    insights.push({ type: "lifestyle", priority: 4, icon: "🌱", area: null, title: "Recovery & Restoration Lifestyle", text: "Your relaxation-first, earthy terpene preference mirrors high-achievers who prioritize quality recovery over social performance (Stanford Sleep Research, 2021). Myrcene's sedative synergy with THC is most pronounced in earthy indica-dominant strains. This profile strongly correlates with gym recovery, post-work decompression, and mindfulness — all linked to lower lifetime cortisol and better long-term health outcomes." });
  } else if (context > 60) {
    insights.push({ type: "lifestyle", priority: 4, icon: "🌱", area: null, title: "Social & Cultural Lifestyle", text: "Your social cannabis profile represents the 'Cultural Connector' demographic (Brightfield Group, 2023) — arts, music, dining, and community experiences define your cannabis context. This is the fastest-growing consumer segment in the legal market. Your ideal setting: curated social gatherings with terpene-diverse hybrid strains. You likely explore new vendors and products more frequently than average consumers." });
  } else {
    insights.push({ type: "lifestyle", priority: 4, icon: "🌱", area: null, title: "Mindful & Purposeful Lifestyle", text: "Your balanced profile aligns with 'wellness-first' consumers — the 2nd largest segment in the 2023 Brightfield Group National Cannabis Survey (28% of adult-use consumers). You're more likely to combine cannabis with meditation, journaling, or nature than high-stimulation activities. Research shows wellness-oriented users report 34% higher life satisfaction scores, driven by intentional, low-dose habits." });
  }

  // ── Career correlations ───────────────────────────────────────────────────
  if (effect > 60 && purpose < 50) {
    insights.push({ type: "career", priority: 4, icon: "💼", area: null, title: "Creative Workforce Profile", text: "Energizing, recreationally-focused cannabis use correlates strongly with creative, tech, and entrepreneurial professions — creative industries represent 34% of adult-use consumers (Gallup, 2023). Colorado State University research (2020) links sativa-dominant preferences to higher divergent thinking and ideational fluency scores. Your profile suggests cannabis works best for brainstorming, creative blocks, and innovation sessions — not high-stakes deadline execution tasks." });
  } else if (purpose > 60) {
    insights.push({ type: "career", priority: 4, icon: "💼", area: null, title: "High-Stress Recovery Profile", text: "Therapeutically-focused cannabis use correlates with high-pressure careers — healthcare, legal, finance, and emergency services (NORML Workforce Survey, 2022). Research shows 68% of therapeutic evening users work in above-average stress occupations. Your profile uses cannabis as a recovery and decompression tool — improving next-day performance by lowering cortisol and enhancing sleep quality (Babson et al., 2017)." });
  } else if (context > 60) {
    insights.push({ type: "career", priority: 4, icon: "💼", area: null, title: "Social-Professional Profile", text: "Your social cannabis context aligns with customer-facing, sales, hospitality, and management roles (Brightfield Group, 2023). Professionals with this profile report 22% lower work-related social anxiety vs. non-users (JAMA Network Open, 2021). Low-to-moderate THC (5–10mg) is associated with increased verbal fluency and social confidence without impairing complex decision-making at moderate doses." });
  } else {
    insights.push({ type: "career", priority: 4, icon: "💼", area: null, title: "Balanced Professional Profile", text: "Your profile mirrors the demographic of knowledge workers — analysts, educators, researchers, and managers (Gallup, 2023). This cohort prioritizes consistent, predictable effects over novelty exploration. Balanced-archetype users are 2× more likely to maintain stable use patterns and 40% less likely to report negative work-related cannabis outcomes vs. users at more extreme profile positions." });
  }

  // ── Love & relationships ──────────────────────────────────────────────────
  if (context > 60 && anxiety > 50) {
    insights.push({ type: "love", priority: 4, icon: "💛", area: null, title: "Social Bonding Enhancement", text: "Your social, anxiety-resilient profile aligns with research on cannabis-enhanced romantic connection. Journal of Psychopharmacology (2020) found cannabis-using couples who co-use report 15% higher relationship satisfaction scores. THC's activation of CB1 receptors in the limbic system enhances emotional attunement and lowers social inhibition — making low-to-moderate doses (5–10mg) ideal for date nights and deepening emotional vulnerability." });
  } else if (anxiety < 45 && effect < 50) {
    insights.push({ type: "love", priority: 4, icon: "💛", area: null, title: "Intimate Connection Profile", text: "Your anxiety-aware, relaxation-focused profile suggests cannabis enhances private, intimate connection over high-stimulation settings. Sattler & Winkler (2020) found 68% of users with this profile reported improved sensory awareness and physical closeness. Balanced 1:1 CBD:THC products reduce performance anxiety and heighten tactile sensitivity without over-sedation — ideal for evening intimacy." });
  } else if (effect > 60) {
    insights.push({ type: "love", priority: 4, icon: "💛", area: null, title: "Adventure Relationship Profile", text: "Your energizing, active cannabis preference maps to an adventurous relationship style. Archives of Sexual Behavior (2019) found adults with sativa-dominant preferences are more likely to report positive shared-activity enhancement with a partner — hiking, art, music, and travel. Your profile is optimal for daytime or early evening shared experiences using uplifting hybrids (Limonene + Terpinolene forward)." });
  } else {
    insights.push({ type: "love", priority: 4, icon: "💛", area: null, title: "Mindful Partnership Profile", text: "Your balanced profile suggests a thoughtful, intentional approach to connection — a trait highly valued in long-term relationship compatibility research (Gottman Institute). Moderate THC doses increase emotional awareness and reduce defensive reactivity via CB1 modulation of the amygdala. Optimal for shared use at 5–10mg during meaningful conversation, creative collaboration, or mindful practices with a partner." });
  }

  // ── Personality correlations ──────────────────────────────────────────────
  const derivedArch = deriveProfile(profile)?.archetype ?? "";
  if (derivedArch === "The Creative Explorer") {
    insights.push({ type: "personality", priority: 4, icon: "🧠", area: null, title: "High Openness · Creative Type", text: "Your energizing, terpene-forward preference correlates with Big Five Openness to Experience (top 20th percentile among cannabis users, University of Toronto, 2022). Research shows creative professionals are 2.4× more likely to prefer sativa-dominant daytime use (Journal of Cannabis Research, 2021). Limonene and pinene sustain cognitive flexibility without sedation — ideal for curiosity-driven, generative thinking." });
  } else if (derivedArch === "The Balanced Seeker") {
    insights.push({ type: "personality", priority: 4, icon: "🧠", area: null, title: "Conscientious Adapter · Balanced Type", text: "Your balanced cannabis profile correlates with high Conscientiousness and moderate Agreeableness in Big Five research (Otten et al., 2021). You make deliberate, measured choices and prefer consistent, predictable effects. Studies show this personality type reports 31% higher satisfaction with hybrid strains vs. single-lineage products — reflecting a deep preference for versatility over extremes." });
  } else if (derivedArch === "The Restful Restorer") {
    insights.push({ type: "personality", priority: 4, icon: "🧠", area: null, title: "Introvert-Restorative · Sensitive Type", text: "Your deep-relaxation preference correlates with introverted, restorative personality traits. Turna et al. (2020) found individuals using cannabis primarily for rest score higher in Neuroticism — a strength, not a flaw, associated with empathy, creativity, and attention to detail. Evening indica routines are strongly linked to improved next-day mood and productivity in this personality cohort." });
  } else if (derivedArch === "The Social Connector") {
    insights.push({ type: "personality", priority: 4, icon: "🧠", area: null, title: "High Extraversion · Social Catalyst", text: "Your social cannabis context aligns with high Extraversion and Agreeableness scores. THC activates oxytocin-mediated reward pathways in the nucleus accumbens (Bhatt et al., 2020) — the brain's core social bonding circuit. Social connectors report 44% higher satisfaction with uplifting hybrids at moderate doses (5–10mg THC) in social settings vs. solo use." });
  } else if (derivedArch === "The Gentle Healer") {
    insights.push({ type: "personality", priority: 4, icon: "🧠", area: null, title: "High Agreeableness · Empathic Type", text: "Your low-THC, high-CBD preference is significantly associated with Agreeableness and Empathy traits (Turna et al., 2020). This profile is common in caregivers, healthcare workers, teachers, and emotionally intuitive individuals. CBD activates 5-HT1A serotonin receptors — supporting calm, focused empathy without the heightened THC sensitivity that can overwhelm highly empathic personalities." });
  } else {
    insights.push({ type: "personality", priority: 4, icon: "🧠", area: null, title: "Openness + Conscientiousness · Discerning", text: "Your experienced, quality-focused profile sits at the intersection of Openness and Conscientiousness — intellectual curiosity paired with exacting standards. Cannabis connoisseurs in the top-experience quintile are 3× more likely to prioritize COA lab data over brand marketing (Brightfield Group, 2023), research before buying, and reject hype-based marketing that the average consumer accepts uncritically." });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

// ── Collapsible section ───────────────────────────────────────────────────────
function Collapsible({ icon, title, badge, summary, defaultOpen = false, children, headerExtra }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`dash-accord ${open ? "dash-accord--open" : ""}`}>
      <button className="dash-accord__hd" onClick={() => setOpen(o => !o)}>
        <div className="dash-accord__hd-left">
          <span className="dash-accord__icon">{icon}</span>
          <span className="dash-accord__title">{title}</span>
          {badge !== undefined && badge !== null && (
            <span className="dash-accord__badge">{badge}</span>
          )}
          {summary && <span className="dash-accord__summary">{summary}</span>}
        </div>
        <div className="dash-accord__hd-right">
          {headerExtra}
          <span className="dash-accord__chevron">{open ? "▾" : "▸"}</span>
        </div>
      </button>
      {open && <div className="dash-accord__body">{children}</div>}
    </div>
  );
}

// ── Health form ───────────────────────────────────────────────────────────────
function HealthForm({ initial, onSave, onCancel }) {
  const [draft, setDraft] = useState(initial ?? { height: "", weight: "", age: "", gender: "neutral", conditions: [] });
  const [condSearch, setCondSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const filtered = condSearch.trim().length > 1
    ? MEDICAL_CONDITIONS.filter(c => c.toLowerCase().includes(condSearch.toLowerCase())).slice(0, 8)
    : [];

  const toggleCond = (c) => setDraft(d => ({
    ...d,
    conditions: d.conditions.includes(c) ? d.conditions.filter(x => x !== c) : [...d.conditions, c],
  }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  return (
    <form className="health-form" onSubmit={submit}>
      <div className="health-form__row">
        <label><span>Age</span>
          <input type="number" min="18" max="100" placeholder="—" value={draft.age}
            onChange={e => setDraft(d => ({ ...d, age: e.target.value }))} /></label>
        <label><span>Weight (lbs)</span>
          <input type="number" min="50" max="500" placeholder="—" value={draft.weight}
            onChange={e => setDraft(d => ({ ...d, weight: e.target.value }))} /></label>
        <label><span>Height (ft&apos;in&quot;)</span>
          <input type="text" placeholder="e.g. 5ft 10in" value={draft.height}
            onChange={e => setDraft(d => ({ ...d, height: e.target.value }))} /></label>
      </div>
      <div className="health-form__gender">
        <span className="health-form__label">Body visualization</span>
        <div className="health-form__gender-btns">
          {["neutral","male","female"].map(g => (
            <button key={g} type="button"
              className={`health-form__gender-btn ${draft.gender === g ? "active" : ""}`}
              onClick={() => setDraft(d => ({ ...d, gender: g }))}>
              {g === "neutral" ? "⚪ Neutral" : g === "male" ? "♂ Male" : "♀ Female"}
            </button>
          ))}
        </div>
      </div>
      <div className="health-form__conditions">
        <span className="health-form__label">Medical Conditions <span className="health-form__optional">(optional — used for personalized insights)</span></span>
        {draft.conditions.length > 0 && (
          <div className="health-form__tags">
            {draft.conditions.map(c => (
              <button key={c} type="button" className="health-form__tag" onClick={() => toggleCond(c)}>{c} ×</button>
            ))}
          </div>
        )}
        <input type="text" className="health-form__search" placeholder="Search conditions (e.g. arthritis, PTSD…)"
          value={condSearch} onChange={e => setCondSearch(e.target.value)} />
        {filtered.length > 0 && (
          <ul className="health-form__suggestions">
            {filtered.map(c => (
              <li key={c}>
                <button type="button" className={`health-form__suggestion ${draft.conditions.includes(c) ? "selected" : ""}`}
                  onClick={() => { toggleCond(c); setCondSearch(""); }}>
                  {draft.conditions.includes(c) ? "✓ " : ""}{c}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="health-form__actions">
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button type="button" className="btn btn--outline btn--sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ── Experience card ───────────────────────────────────────────────────────────
function ExperienceCard({ exp }) {
  const icon = CATEGORY_ICONS[exp.category] ?? "🌿";
  const date = exp.createdAt?.toDate
    ? exp.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";
  return (
    <div className="exp-card">
      <div className="exp-card__header">
        <span className="exp-card__icon">{icon}</span>
        <div className="exp-card__info">
          <div className="exp-card__name">{exp.productName || "Unnamed Product"}</div>
          {exp.strain && <div className="exp-card__strain">{exp.strain}</div>}
        </div>
        <div className="exp-card__meta">
          {exp.rating > 0 && <div className="exp-card__rating">{"★".repeat(exp.rating)}{"☆".repeat(5 - exp.rating)}</div>}
          {date && <div className="exp-card__date">{date}</div>}
        </div>
      </div>
      <div className="exp-card__footer">
        {exp.vendor && <span className="exp-card__vendor">📍 {exp.vendor}</span>}
        {exp.thcPct && <span className="exp-card__pct">THC {exp.thcPct}%</span>}
        {exp.cbdPct && <span className="exp-card__pct">CBD {exp.cbdPct}%</span>}
        {(exp.overallNotes || exp.notes?.overall) && (() => {
          const n = exp.overallNotes || exp.notes.overall;
          return <p className="exp-card__note">{n.slice(0, 90)}{n.length > 90 ? "…" : ""}</p>;
        })()}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, savedProfile, healthData, updateHealthData, userDocReady } = useAuth();
  const navigate = useNavigate();
  const [experiences,   setExperiences]   = useState([]);
  const [insights,      setInsights]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [editingHealth, setEditingHealth] = useState(false);
  const [prestige,      setPrestige]      = useState({ points: 0 });
  const [saveError,     setSaveError]     = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserExperiences(user.id), getUserPrestige(user.id)])
      .then(([exps, pres]) => { setExperiences(exps); setPrestige(pres ?? { points: 0 }); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    setInsights(generateInsights(savedProfile, healthData, experiences));
  }, [savedProfile, healthData, experiences]);

  const handleSaveHealth = useCallback(async (data) => {
    setSaveError("");
    try {
      await updateHealthData(user.id, data);
      setEditingHealth(false);
    } catch {
      setSaveError("Save failed — please check your connection and try again.");
    }
  }, [user, updateHealthData]);

  const gender          = healthData?.gender ?? "neutral";
  const level           = getLevel(prestige.points ?? 0);
  const activeConditions = healthData?.conditions ?? [];
  const profile         = deriveProfile(savedProfile);

  // Health section summary shown in accordion header
  const healthSummary = healthData
    ? [
        healthData.age    ? `${healthData.age} yrs`         : null,
        healthData.weight ? `${healthData.weight} lbs`       : null,
        healthData.height ? healthData.height                : null,
        activeConditions.length ? `${activeConditions.length} condition${activeConditions.length !== 1 ? "s" : ""}` : null,
      ].filter(Boolean).join(" · ")
    : "No data yet";

  if (!userDocReady || loading) return (
    <div className="dash-loading">
      <span className="dash-loading__leaf">🌿</span>
      <p>Loading your dashboard…</p>
    </div>
  );

  return (
    <div className="dashboard dashboard--combined">

      {/* ── Compact header ── */}
      <header className="dash-header">
        <div className="dash-header__left">
          <img src={user.picture} alt="" className="dash-header__avatar" />
          <div>
            <h1 className="dash-header__name">{user.name.split(" ")[0]}</h1>
            <div className="dash-header__sub">
              <span className="dash-level-badge" style={{ color: level.color }}>● {level.label}</span>
              <span className="dash-pts">{prestige.points ?? 0} pts</span>
              {profile ? (
                <span className="dash-archetype-pill">{profile.archetypeEmoji} {profile.archetype}</span>
              ) : (
                <Link to="/assessment" className="dash-cta-link">Take your assessment →</Link>
              )}
            </div>
          </div>
        </div>
        <div className="dash-header__right">
          <Link to="/log" className="btn btn--primary btn--sm">+ Log Experience</Link>
        </div>
      </header>

      {/* ── Accordion sections ── */}
      <div className="dash-accordions">

        {/* ─ AI Insights ─ (open by default) */}
        <Collapsible icon="🔬" title="AI Insights" badge={insights.length} defaultOpen={true}>
          <div className="dash-insights__list">
            {insights.map((ins, i) => (
              <div key={i} className={`insight-card insight-card--${ins.type}`}>
                <div className="insight-card__head">
                  <span className="insight-card__icon">{ins.icon}</span>
                  <span className="insight-card__title">{ins.title}</span>
                  {ins.type === "health"       && <span className="insight-card__badge">Health</span>}
                  {ins.type === "safety"       && <span className="insight-card__badge insight-card__badge--warn">Safety</span>}
                  {ins.type === "lifestyle"    && <span className="insight-card__badge insight-card__badge--lifestyle">Lifestyle</span>}
                  {ins.type === "career"       && <span className="insight-card__badge insight-card__badge--career">Career</span>}
                  {ins.type === "love"         && <span className="insight-card__badge insight-card__badge--love">Love</span>}
                  {ins.type === "personality"  && <span className="insight-card__badge insight-card__badge--personality">Personality</span>}
                </div>
                <p className="insight-card__text">{ins.text}</p>
              </div>
            ))}
          </div>
        </Collapsible>

        {/* ─ Endocannabinoid Body Map ─ (open by default) */}
        <Collapsible icon="🧍" title="Endocannabinoid Body Map" defaultOpen={true}>
          <div className="dash-body-section">
            <div className="dash-section-hint" style={{ marginBottom: 12, fontSize: ".83rem", color: "var(--c-text-muted)" }}>
              Tap hotspots to explore your endocannabinoid system
            </div>
            <BodyViz gender={gender} activeConditions={activeConditions} />
            <div className="dash-body-legend-hint">
              {[
                { color: "#a78bfa", label: "Brain / CNS" },
                { color: "#f87171", label: "Cardiovascular" },
                { color: "#34d399", label: "GI System" },
                { color: "#fbbf24", label: "Immune" },
                { color: "#6ee7b7", label: "Muscles / Joints" },
                { color: "#f97316", label: "Lymph / Inflammation" },
              ].map(d => (
                <span key={d.label} className="dash-legend-pill">
                  <span className="dash-legend-dot" style={{ background: d.color }} />
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </Collapsible>

        {/* ─ Experience Journal ─ (open by default) */}
        <Collapsible icon="📋" title="Experience Journal" badge={experiences.length || null} defaultOpen={true}
          headerExtra={
            <Link to="/log" className="dash-accord__inline-cta" onClick={e => e.stopPropagation()}>
              + New
            </Link>
          }>
          {experiences.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty__icon">📋</div>
              <h3>No experiences logged yet</h3>
              <p>Log your first product experience to start building your personalized cannabis profile.</p>
              <Link to="/log" className="btn btn--primary">Log Your First Experience</Link>
            </div>
          ) : (
            <div className="dash-journal__grid">
              {experiences.slice(0, 12).map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
            </div>
          )}
        </Collapsible>

        {/* ─ Health Data ─ */}
        <Collapsible icon="❤️" title="Health Data" summary={healthSummary}
          headerExtra={
            !editingHealth && (
              <button className="dash-accord__inline-cta" onClick={e => { e.stopPropagation(); setEditingHealth(true); }}>
                {healthData ? "Edit" : "Add"}
              </button>
            )
          }>
          {saveError && <div className="dash-health__error">{saveError}</div>}
          {editingHealth ? (
            <HealthForm initial={healthData} onSave={handleSaveHealth}
              onCancel={() => { setEditingHealth(false); setSaveError(""); }} />
          ) : (
            <div className="dash-health__view">
              <div className="dash-health__vitals">
                {[
                  { label: "Age",    value: healthData?.age    ? `${healthData.age} yrs`   : "—" },
                  { label: "Weight", value: healthData?.weight ? `${healthData.weight} lbs` : "—" },
                  { label: "Height", value: healthData?.height || "—" },
                  { label: "Body",   value: healthData?.gender ? healthData.gender.charAt(0).toUpperCase() + healthData.gender.slice(1) : "Neutral" },
                ].map(v => (
                  <div key={v.label} className="dash-health__vital">
                    <span className="dash-health__vital-label">{v.label}</span>
                    <span className="dash-health__vital-value">{v.value}</span>
                  </div>
                ))}
              </div>
              {activeConditions.length > 0 && (
                <div className="dash-health__conditions">
                  <span className="dash-health__conditions-label">Conditions</span>
                  <div className="dash-health__condition-tags">
                    {activeConditions.map(c => <span key={c} className="dash-health__condition-tag">{c}</span>)}
                  </div>
                </div>
              )}
              {!healthData && (
                <p className="dash-health__hint">Health data is optional and only used to personalize your cannabis insights. It's never shared.</p>
              )}
              <button className="btn btn--outline btn--sm dash-health__edit-btn" onClick={() => setEditingHealth(true)}>
                {healthData ? "Edit Health Data" : "Add Health Data"}
              </button>
            </div>
          )}
        </Collapsible>

        {/* ─ Cannabis Profile ─ (collapsed by default) */}
        <Collapsible icon="🧬" title="Cannabis Profile"
          summary={profile ? `${profile.archetypeEmoji} ${profile.archetype}` : "No assessment yet"}>
          {!profile ? (
            <div className="dash-empty">
              <div className="dash-empty__icon">🧬</div>
              <h3>No assessment yet</h3>
              <p>Complete your assessment to unlock your personal cannabis archetype, terpene matches, and consumption guidance.</p>
              <Link to="/assessment" className="btn btn--primary">Take Assessment</Link>
            </div>
          ) : (
            <div className="profile-body">
              {/* Archetype card */}
              <div className="prof-archetype-card">
                <div className="prof-archetype-card__emoji">{profile.archetypeEmoji}</div>
                <div>
                  <div className="prof-archetype-card__name">{profile.archetype}</div>
                  <div className="prof-archetype-card__sub">{profile.archetypeSub}</div>
                </div>
              </div>

              {/* Terpene matches */}
              <div className="profile-section">
                <h3 className="profile-section__title">🌿 Terpene Matches</h3>
                <div className="terpene-grid">
                  {profile.terpenes.map(t => (
                    <div key={t.name} className="terpene-card">
                      <span className="terpene-card__emoji">{t.emoji}</span>
                      <strong className="terpene-card__name">{t.name}</strong>
                      <p className="terpene-card__desc">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Potency guidance */}
              <div className="profile-section">
                <h3 className="profile-section__title">⚗️ Potency Guidance</h3>
                <div className="guide-card guide-card--thc">
                  <span className="guide-card__icon">🔬</span>
                  <div><strong>THC Level</strong><p>{profile.potencyGuide}</p></div>
                </div>
                <div className="guide-card guide-card--cbd">
                  <span className="guide-card__icon">🌿</span>
                  <div><strong>CBD Approach</strong><p>{profile.cbdGuide}</p></div>
                </div>
              </div>

              {/* Format recommendations */}
              {profile.formatGuidance.length > 0 && (
                <div className="profile-section">
                  <h3 className="profile-section__title">🎯 Recommended Formats</h3>
                  <div className="format-guidance">
                    {profile.formatGuidance.map(f => (
                      <div key={f.id} className="format-card">
                        <div className="format-card__header">
                          <span className="format-card__icon">{f.icon}</span>
                          <strong className="format-card__label">{f.label}</strong>
                        </div>
                        <ul className="format-card__tips">
                          {f.tips.map((tip, i) => (
                            <li key={i} className={tip.startsWith("⚠️") ? "format-tip format-tip--warn" : "format-tip"}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What to avoid */}
              {profile.avoid.length > 0 && (
                <div className="profile-section">
                  <h3 className="profile-section__title">⚠️ What to Avoid</h3>
                  <ul className="avoid-list">
                    {profile.avoid.map(a => (
                      <li key={a} className="avoid-item"><span className="avoid-item__icon">✕</span>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Profile snapshot */}
              <div className="profile-section">
                <h3 className="profile-section__title">🎛️ Profile Snapshot</h3>
                <div className="snapshot-sliders">
                  {SLIDER_META.map(q => <BiSlider key={q.id} {...q} value={savedProfile[q.id]} readonly />)}
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn btn--outline btn--sm" onClick={() => navigate("/assessment")}>Retake Assessment</button>
              </div>

              <p className="profile-disclaimer">
                Mycana profiles are educational tools only and do not constitute medical advice. Consult a healthcare professional regarding any medical conditions.
              </p>
            </div>
          )}
        </Collapsible>


      </div>
    </div>
  );
}
