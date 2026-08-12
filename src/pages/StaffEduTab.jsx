import { useState, useEffect, useCallback } from "react";
import {
  registerStaffMember,
  getStaffMembers,
  updateStaffProgress,
} from "../services/staffService.js";
import { logActivity } from "../services/activityService.js";
import "./StaffEduTab.css";

/* ── Gamification levels ─────────────────────────────────────────────────── */
const EDU_LEVELS = [
  { min: 0,    label: "Seedling",          emoji: "🌱", color: "#86efac" },
  { min: 150,  label: "Sprout",            emoji: "🌿", color: "#4ade80" },
  { min: 400,  label: "Cultivar",          emoji: "🍃", color: "#22c55e" },
  { min: 800,  label: "Curator",           emoji: "🌲", color: "#16a34a" },
  { min: 1100, label: "Connoisseur",       emoji: "🏆", color: "#15803d" },
  { min: 1500, label: "Mycana Consultant", emoji: "⭐", color: "#d4a843" },
];
function getEduLevel(xp) {
  for (let i = EDU_LEVELS.length - 1; i >= 0; i--)
    if (xp >= EDU_LEVELS[i].min) return EDU_LEVELS[i];
  return EDU_LEVELS[0];
}
function nextLevel(xp) {
  const idx = EDU_LEVELS.findIndex(l => xp < l.min);
  return idx === -1 ? null : EDU_LEVELS[idx];
}

function formatJoined(ts) {
  if (!ts) return "Recently";
  let d;
  if (ts.toDate) d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 86400) return "Today";
  if (diff < 172800) return "Yesterday";
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Curriculum data ─────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: "thc-sensitivity", factor: 1,
    title: "THC Sensitivity", subtitle: "Why no two people get the same high",
    icon: "🔬", color: "#6d28d9", xp: 100,
    sections: [
      {
        heading: "The Endocannabinoid System",
        body: `Every person is born with a unique endocannabinoid system (ECS) — a biological network of CB1 and CB2 receptors throughout the brain and body. CB1 receptors (concentrated in the nervous system) are the primary targets of THC. Because receptor density and baseline tone vary by individual, the same dose of THC produces wildly different experiences across people.\n\nThink of the ECS as a thermostat preset differently in every person. Cannabis is like adjusting the setting — but the starting point matters enormously.`,
      },
      {
        heading: "THC vs. THCA — The Decarboxylation Key",
        body: `Raw cannabis flower contains THCA (tetrahydrocannabinolic acid) — non-psychoactive until heat converts it to THC through **decarboxylation**. This is why eating raw flower produces no effect.\n\n• **Smoking/vaping:** instant decarboxylation → immediate psychoactivity\n• **Edibles:** decarbed during cooking or extraction\n• **THCA products:** require heat before activation\n\nWhen a label reads "24% THCA," effective smoked THC is approximately 20–21%. Use this to set accurate expectations with customers.`,
      },
      {
        heading: "The 5 Sensitivity Drivers",
        body: `**1. Genetics & ECS baseline** — Receptor density and natural endocannabinoid tone differ person to person.\n**2. Tolerance** — Regular use down-regulates CB1 receptors, reducing sensitivity over time.\n**3. Body chemistry** — Liver enzymes (CYP450), fat tissue, and metabolic rate all affect processing speed.\n**4. Mental state** — Anxiety or stress amplifies negative effects. Calm intent dampens them.\n**5. Nutrition & fatigue** — An empty stomach dramatically increases onset speed and intensity.`,
      },
      {
        heading: "Client Advocacy: The Sensitivity Conversation",
        body: `Open every new customer consultation with these:\n• "Have you used cannabis before? How did it make you feel?"\n• "Do you ever experience anxiety or discomfort?"\n• "Are you on any medications?"\n\n**High sensitivity:** Recommend 1:1 CBD:THC, low-potency flower (12–16% THC), 2.5mg edibles. Mycana slider → higher = more sensitive.\n**Low sensitivity / experienced:** Full-spectrum, higher potency, diverse terpene exploration. Focus on quality over raw THC%.`,
      },
    ],
    quiz: [
      { q: "THCA becomes psychoactive when:", a: 1,
        opts: ["Mixed with CBD", "Heated through decarboxylation", "Stored in a dark container", "Combined with myrcene"] },
      { q: "Which factor MOST determines an individual's THC sensitivity?", a: 2,
        opts: ["Body weight", "Age and gender", "Genetics and their ECS baseline", "Time of day"] },
      { q: "A new customer says cannabis always makes them anxious. Your best first recommendation is:", a: 2,
        opts: ["Avoid cannabis entirely", "Try higher-THC to build tolerance", "High-CBD or 1:1 at low dose", "Switch to concentrates"] },
      { q: "Regular use reduces THC sensitivity because:", a: 1,
        opts: ["The liver destroys THC faster", "CB1 receptors down-regulate", "THC loses potency over time", "Blood absorbs cannabinoids slower"] },
    ],
  },
  {
    id: "terpene-mastery", factor: 2,
    title: "Terpene Mastery", subtitle: "The molecules that shape every experience",
    icon: "🌿", color: "#059669", xp: 100,
    sections: [
      {
        heading: "What Are Terpenes?",
        body: `Terpenes are aromatic compounds found in cannabis and thousands of other plants. They define each strain's scent and flavor — but more critically, they interact with cannabinoids to shape the total effect through the **entourage effect**.\n\nOver 100 terpenes exist in cannabis. Mycana trains budtenders on the 10 most clinically relevant. Knowing them by aroma, plant, and effect is table stakes for consultative sales.`,
      },
      {
        heading: "The 10 Essential Terpenes",
        body: `**Myrcene** 🌿 — Earthy, musky. Most common in cannabis. Relaxing, sedating. Enhances THC uptake.\n**Limonene** 🍋 — Citrus, bright. Mood-elevating, anti-anxiety, energizing.\n**Caryophyllene** 🌶️ — Spicy, peppery. Unique: binds CB2 receptors directly. Anti-inflammatory.\n**Linalool** 💜 — Floral, lavender. Calming, sleep-promoting.\n**Pinene** 🌲 — Pine, fresh. Alertness; counteracts THC memory impairment.\n**Terpinolene** 🍎 — Fruity, floral. Uplifting, creative, slightly rare.\n**Ocimene** 🌸 — Sweet, herbal. Energizing, antiviral.\n**Bisabolol** 🌼 — Chamomile-like. Anti-inflammatory, skin-soothing.\n**Humulene** 🍺 — Earthy, hoppy (also in beer hops). Appetite suppressant, anti-inflammatory.\n**Valencene** 🍊 — Sweet orange. Uplifting, anti-inflammatory.`,
      },
      {
        heading: "The Entourage Effect",
        body: `Two strains with identical THC percentages can feel completely different — the terpene fingerprint is why. A 20% THC strain with high myrcene and linalool will produce a sedating, heavy body experience. A 20% THC strain with high limonene and pinene produces uplift and focus.\n\n**Always look at the terpene panel on a COA**, not just THC%. A complex terpene profile at 18% THC will often outperform a flat-terpene 26% THC in both quality and customer satisfaction.`,
      },
      {
        heading: "Matching Terpenes to Client Goals",
        body: `**Relaxation / sleep** → Myrcene + linalool + caryophyllene\n**Uplift / creativity** → Limonene + terpinolene + pinene\n**Focus / alert** → Pinene + limonene, minimize myrcene\n**Pain relief** → Caryophyllene (CB2) + myrcene + linalool\n**Anxiety relief** → Linalool + limonene + caryophyllene; low THC\n\nThis terpene-first recommendation style is what separates Mycana-trained budtenders from order-takers.`,
      },
    ],
    quiz: [
      { q: "Which terpene is most associated with sedation and is most abundant in cannabis?", a: 2,
        opts: ["Limonene", "Pinene", "Myrcene", "Terpinolene"] },
      { q: "What makes caryophyllene unique among terpenes?", a: 1,
        opts: ["Most abundant terpene in all cannabis", "Directly binds CB2 receptors", "Neutralizes THC psychoactivity", "Only found in Sativa strains"] },
      { q: "A customer wants focus and energy. Prioritize:", a: 1,
        opts: ["High myrcene, high linalool", "High limonene, high pinene", "High humulene, high bisabolol", "High myrcene, high caryophyllene"] },
      { q: "The entourage effect means:", a: 2,
        opts: ["THC is stronger in social settings", "Terpenes cancel each other out", "Cannabinoids and terpenes work synergistically", "Multiple strains blended together"] },
    ],
  },
  {
    id: "effect-spectrum", factor: 3,
    title: "Effect Spectrum", subtitle: "Beyond Indica & Sativa — chemovar thinking",
    icon: "🎯", color: "#0ea5e9", xp: 100,
    sections: [
      {
        heading: "Why Indica/Sativa Is No Longer Enough",
        body: `"Indica = relaxing, Sativa = energizing" is a starting point — not a reliable framework. These categories describe plant morphology (leaf width, height, growth pattern), not chemical effects. Many strains labeled "Sativa" contain terpene profiles that sedate; many "Indicas" feel uplifting.\n\nRelying on Indica/Sativa creates mismatched recommendations, disappointed customers, and eroded trust. Use it as a rough starting point, then go deeper.`,
      },
      {
        heading: "Chemovars: The Better Framework",
        body: `A **chemovar** classifies cannabis by its chemical fingerprint — cannabinoids + terpenes — not plant shape.\n\n**Type I** — THC-dominant (most recreational products)\n**Type II** — Balanced THC:CBD (1:1 ratios; best for anxiety-prone or medical users)\n**Type III** — CBD-dominant (<0.3% THC; wellness, non-psychoactive)\n\nWithin each type, the terpene profile determines the qualitative experience. Two Type I strains can feel like completely different drugs.`,
      },
      {
        heading: "The 2-Axis Effect Map",
        body: `Think of cannabis effects on two axes:\n\n**Mental: Sedating ↔ Stimulating**\nMyrcene-dominant → sedating. Limonene/pinene/terpinolene → stimulating.\n\n**Physical: Relaxing ↔ Activating**\nLinalool + myrcene → relaxing. Pinene + caryophyllene → functional/activating.\n\nExamples:\n• Granddaddy Purple (Type I, high myrcene) → Sedating + Relaxing\n• Jack Herer (Type I, high terpinolene + pinene) → Stimulating + Activating\n• Harlequin (Type II) → Mild stimulation + Anti-anxiety\n• ACDC (Type III) → Clear-headed, minimal psychoactive`,
      },
      {
        heading: "Factor 3 in Practice",
        body: `When a customer sets their Mycana Effect Spectrum slider:\n\n**Low (sedating/relaxing):** Myrcene-heavy, linalool-forward, Type I or II. Evening use, sleep, pain relief.\n**High (energizing/stimulating):** Limonene, pinene, terpinolene. Morning or afternoon. Creative work, social activities.\n**Middle:** Balanced. Type II is often ideal. Cannabis-curious customers or those managing specific symptoms.\n\nStop recommending strains by name alone. Lead with chemovar + terpene profile.`,
      },
    ],
    quiz: [
      { q: "Why is Indica/Sativa classification limited?", a: 1,
        opts: ["No scientific basis at all", "Describes plant morphology, not chemical effects", "All modern cannabis is hybrid", "Only applies to recreational cannabis"] },
      { q: "A Type II chemovar has:", a: 2,
        opts: ["THC-dominant, low CBD", "CBD-dominant, trace THC", "Balanced THC:CBD ratio", "No psychoactive compounds"] },
      { q: "Two strains with the same 22% THC will produce identical effects.", a: 1,
        opts: ["True — THC% determines the experience", "False — terpene profiles create different experiences", "True — if same strain type", "False — only method changes the effect"] },
    ],
  },
  {
    id: "consumption-methods", factor: 4,
    title: "Consumption Methods", subtitle: "Onset, duration, and choosing the right form",
    icon: "💨", color: "#f59e0b", xp: 100,
    sections: [
      {
        heading: "The Six Methods: At a Glance",
        body: `**Smoking (Flower)** — Onset: 2–5 min | Peak: 20–40 min | Duration: 1–3 hrs\n**Vaping** — Onset: 5–10 min | Peak: 30–60 min | Duration: 2–4 hrs\n**Edibles** — Onset: 30–120 min | Peak: 2–3 hrs | Duration: 4–8 hrs\n**Tinctures (sublingual)** — Onset: 15–45 min | Peak: 1–2 hrs | Duration: 2–4 hrs\n**Topicals** — Onset: 15–30 min | Localized, non-psychoactive | Duration: 2–4 hrs\n**Concentrates** — Onset: immediate | Very high potency | Duration: 1–3 hrs`,
      },
      {
        heading: "The Edibles Exception: 11-OH-THC",
        body: `When THC is digested, the liver converts it to **11-hydroxy-THC (11-OH-THC)** — a metabolite that:\n• Is more potent than inhaled THC\n• Crosses the blood-brain barrier more effectively\n• Produces stronger, longer-lasting body effects\n\nThis is why 10mg THC edible can overpower the equivalent smoked dose. New customers eat more because the onset is slow — then all doses hit simultaneously.\n\n**Golden rule:** Start with 2.5mg. Wait 2 full hours before considering more.`,
      },
      {
        heading: "Matching Method to Need",
        body: `**Immediate relief (pain, nausea, panic attack):** → Inhalation\n**Sleep support:** → Edible taken 90 min before bed; or tincture 30 min prior\n**Discreet daytime use:** → Vape pen or tincture\n**Localized pain, skin conditions:** → Topical (zero psychoactive effect)\n**Medical patients avoiding lung exposure:** → Edibles, tinctures, capsules\n**First-time user:** → 2.5mg edible or mild flower (avoid concentrates)\n**Experienced user seeking potency:** → Concentrates (start low: single small dab)`,
      },
      {
        heading: "Harm Reduction by Method",
        body: `**Smoking:** Combustion produces carcinogens. Not appropriate for respiratory conditions.\n**Vaping:** Safer for lungs but only with lab-tested products. Warn against unregulated cartridges.\n**Edibles:** Biggest overconsumption risk. Stress the 2.5mg start + 2-hour wait rule. Keep away from children.\n**Concentrates:** 60–90% THC. Not for beginners. Accelerates tolerance rapidly.\n**Tinctures:** Generally very safe. Alcohol-based may interact with some medications.`,
      },
    ],
    quiz: [
      { q: "Which method has the fastest onset?", a: 2,
        opts: ["Edibles (30–120 min)", "Tinctures (15–45 min)", "Smoking/vaping (2–10 min)", "Topicals (15–30 min)"] },
      { q: "Why do edibles produce stronger effects than equivalent smoked THC?", a: 2,
        opts: ["Edibles contain more THC", "Stomach acid amplifies THC", "Liver converts THC to potent 11-OH-THC", "Digestion slows body defenses"] },
      { q: "A first-time edible customer should start at:", a: 2,
        opts: ["10mg — standard dose", "5mg — beginner dose", "2.5mg — wait 2 full hours", "1mg — micro-dose only"] },
      { q: "Topical cannabis is appropriate when a customer wants:", a: 1,
        opts: ["Maximum psychoactive effect", "Localized relief without intoxication", "Fastest onset for acute relief", "Sleep support"] },
    ],
  },
  {
    id: "dose-potency", factor: 5,
    title: "Dose & Potency", subtitle: "Less is more — the minimum effective dose",
    icon: "⚖️", color: "#e05a3d", xp: 100,
    sections: [
      {
        heading: "The Minimum Effective Dose (MED)",
        body: `The **Minimum Effective Dose** is the lowest amount of cannabis that achieves the desired therapeutic or experiential result. Client advocacy starts here — the goal is never "as high as possible." It's achieving the intended outcome with the least risk.\n\n**Microdosing** (1–2.5mg THC) is increasingly popular for daytime function, anxiety management, and exploring sensitivity without impairment. Always lead with MED. Customers can always take more — they cannot take less once consumed.`,
      },
      {
        heading: "Reading Labels Like a Pro",
        body: `**Flower:** THCA% + THC%. Multiply THCA by ~0.877 + THC for total. A 22% THCA / 0.8% THC product → ~20% effective THC when smoked.\n**Edibles:** Total mg per package AND per serving. "100mg / 10 servings" = 10mg/serving.\n**Vape:** Total THC% in oil. A 0.5g cartridge at 80% THC = 400mg total. Each 3-second draw ≈ 3–5mg THC.\n**Concentrates:** % by weight. 1g of 85% wax = 850mg THC. Single dab = 20–100mg — extreme for new users.`,
      },
      {
        heading: "Potency Myths to Debunk",
        body: `**Myth: Higher THC = better quality.** False. A 16% THC strain with a rich terpene profile often produces a more satisfying, nuanced experience than 30% THC isolate.\n\n**Myth: THC% predicts how high you'll get.** Partially false. It correlates with potential intensity, but method, sensitivity, tolerance, and terpenes all shape the actual experience.\n\n**Your job:** Educate, don't oversell. A customer who leaves with the RIGHT product at the right dose returns. A customer who "greens out" on your recommendation does not.`,
      },
      {
        heading: "Dosing by Experience Level",
        body: `**Naive (never used):** 1–5mg THC. Flower 10–14%. Method: low-dose edible.\n**Beginner (some experience):** 5–10mg THC. Flower 15–18%. Mild vape.\n**Intermediate (regular):** 10–25mg THC. Flower 18–24%. Full-spectrum products.\n**Experienced (daily, high tolerance):** 25mg+ THC. May need concentrates. Recommend periodic T-breaks.\n\n**Medical focus:** CBD 10–40mg/day for anxiety and inflammation. 1:1 THC:CBD ratios are often most therapeutically effective.`,
      },
    ],
    quiz: [
      { q: "The Minimum Effective Dose principle means:", a: 1,
        opts: ["Using the highest dose that doesn't cause harm", "Starting at the lowest dose that achieves the goal", "Giving the minimum THC% product", "Using cannabis as infrequently as possible"] },
      { q: "A 0.5g vape at 80% THC contains approximately:", a: 1,
        opts: ["80mg THC", "400mg THC", "800mg THC", "40mg THC"] },
      { q: "Higher THC percentage always means higher quality.", a: 1,
        opts: ["True — THC% is the primary quality indicator", "False — terpene profile, freshness, and cultivation quality matter equally", "True — for experienced users only", "False — only for medical products"] },
    ],
  },
  {
    id: "purpose-intention", factor: 6,
    title: "Purpose & Intention", subtitle: "Set, setting, and the why behind every session",
    icon: "🎯", color: "#8b5cf6", xp: 100,
    sections: [
      {
        heading: "Set and Setting",
        body: `"Set and setting" — mindset and environment — are the most underrated variables in any cannabis experience. Stress, anxiety, or negative expectations amplify adverse effects. A calm, intentional mindset paired with a safe, familiar environment leads to consistently better outcomes.\n\n**For budtenders:** Always ask "What's the occasion?" and "What are you hoping to feel?" before recommending anything. The intention behind consumption determines the ideal product more than any other factor.`,
      },
      {
        heading: "Recreational vs. Therapeutic Intent",
        body: `**Recreational:** Customer wants to enhance an experience — social, creative, or physical. Euphoria acceptable; some impairment OK. Lead with experience and craft.\n\n**Therapeutic:** Customer has a specific symptom or condition to manage. Priority: targeted effect, minimal impairment, consistent dosing. Lead with CBD inclusion, specific terpene targets, and predictable formats.\n\n**Hybrid (most common):** Mild recreational effect + wellness benefit. Type II (balanced THC:CBD) is often ideal. These customers respond extremely well to Mycana profile-based recommendations.`,
      },
      {
        heading: "Intention-Setting as a Practice",
        body: `High-function cannabis consumers set intentions before each session. Encourage this:\n\n1. **State the purpose:** "I'm using this to relax before sleep"\n2. **Choose accordingly:** High myrcene + linalool, moderate THC\n3. **Set up the environment:** Comfortable, low stimulation, no responsibilities\n4. **Dose intentionally:** Start low, track in Mycana\n5. **Reflect and log:** Each logged session refines the profile\n\nThis is exactly the behavior the Mycana app is designed to reinforce. Customers who log consistently become your most knowledgeable, loyal, and referral-generating clients.`,
      },
    ],
    quiz: [
      { q: "A customer is anxious before a party and wants cannabis to 'calm down.' Best recommendation:", a: 2,
        opts: ["High-THC Sativa for social energy", "Potent edible to fully relax", "CBD-dominant or 1:1 at low dose; discuss set/setting", "Any product — setting will handle it"] },
      { q: "Best candidate for a Type II (balanced THC:CBD) product:", a: 1,
        opts: ["Experienced user seeking maximum potency", "Customer wanting mild euphoria with wellness support", "First-timer wanting the strongest effect", "Customer who wants zero psychoactive effect"] },
      { q: "\"Set\" in 'set and setting' refers to:", a: 2,
        opts: ["The cannabis product selection", "Physical environment", "Consumer's mindset, expectations, and emotional state", "The dosing schedule"] },
    ],
  },
  {
    id: "anxiety-risk", factor: 7,
    title: "Anxiety & Risk Awareness", subtitle: "Protecting customers — responsible advocacy",
    icon: "🛡️", color: "#ef4444", xp: 100,
    sections: [
      {
        heading: "Who Is at Elevated Risk?",
        body: `As a Mycana Certified Budtender, you must recognize high-risk customers and respond with appropriate care:\n\n**Elevated risk:**\n• **Under 25:** Developing brain. Regular use linked to cognitive and psychosis risk in adolescents.\n• **Family/personal history of psychosis or schizophrenia:** High-THC can trigger or worsen episodes.\n• **Active anxiety/panic disorder:** THC amplifies anxiety in sensitive individuals.\n• **Pregnancy/breastfeeding:** No safe dose. THC crosses placenta and enters breast milk.\n• **Cardiovascular conditions:** THC temporarily elevates heart rate.\n• **Current opioid or sedative use:** Combining depressants requires medical oversight.\n\n**You are not a doctor.** Always refer serious medical questions to their physician.`,
      },
      {
        heading: "The Green Out — What To Do",
        body: `Overconsumption (green out) presents with intense anxiety, nausea, racing heart, pale skin, and disorientation. Protocol:\n\n1. **Stay calm** — Remind them no one has died from cannabis overconsumption\n2. **Move to a quiet space** — Away from noise and stimulation\n3. **Hydrate** — Water, not alcohol\n4. **CBD:** If available, high-dose CBD can moderate THC anxiety\n5. **Black pepper:** Sniffing or chewing peppercorns (caryophyllene) may reduce THC anxiety\n6. **Wait it out:** Inhalation peaks pass in 1–2 hrs. Edibles: 4–8 hrs. The experience WILL end.\n7. **Call for help** if: chest pain, loss of consciousness, severe vomiting.`,
      },
      {
        heading: "Key Drug Interactions",
        body: `Cannabis interacts with medications via the liver's CYP450 enzyme pathway:\n\n**Warfarin (blood thinner):** THC + CBD significantly increase warfarin levels → bleeding risk\n**Anticonvulsants:** CBD can raise levels of some epilepsy drugs\n**Benzodiazepines / sedatives:** Additive CNS depression — use caution\n**Antihypertensives:** THC temporarily raises blood pressure\n\n**Your line:** "I'd strongly recommend speaking with your prescribing doctor or pharmacist before starting a cannabis regimen." Responsible practice — not overcaution.`,
      },
      {
        heading: "Recognizing Problematic Use",
        body: `~9% of cannabis users develop Cannabis Use Disorder (CUD). Risk rises to ~17% for adolescent users and ~25–50% for daily heavy users.\n\n**Signals to note (don't diagnose — just be aware):**\n• Needing cannabis to "feel normal"\n• Escalating doses every visit\n• Using cannabis as the sole coping mechanism for all stress\n• Visible distress when access is limited\n\n**Your role:** Normalize mindful, intentional consumption. The Mycana logging system is a powerful tool for self-awareness. Encourage it.`,
      },
    ],
    quiz: [
      { q: "A customer mentions a family history of schizophrenia. You should:", a: 1,
        opts: ["Recommend the highest-THC product for relief", "Advise them to consult their physician before using cannabis", "Immediately recommend CBD-only without discussion", "Proceed normally — regulated cannabis is safe for all"] },
      { q: "First step when a customer experiences a green out:", a: 2,
        opts: ["Call 911 immediately", "Offer a higher-THC product to balance", "Stay calm, move to quiet space, reassure effects will pass", "Give them coffee to counteract THC"] },
      { q: "Which medication has a documented interaction with THC and CBD?", a: 2,
        opts: ["Aspirin", "Vitamin C", "Warfarin (blood thinner)", "Antihistamines"] },
    ],
  },
  {
    id: "experience-cadence", factor: 8,
    title: "Experience Cadence", subtitle: "Tolerance, breaks, and sustainable habits",
    icon: "🔄", color: "#0d9488", xp: 100,
    sections: [
      {
        heading: "Tolerance — The Treadmill Effect",
        body: `Cannabis tolerance develops through CB1 receptor down-regulation. Regular use causes measurable changes within the first week of daily consumption. After 30 days of daily use, most users require significantly more to achieve the same effect.\n\nThe Mycana Experience Cadence factor tracks exactly this — how frequently and intensively someone consumes. This data is gold for making recommendations that stay appropriate over time.\n\n**Always ask:** "How often do you typically use?" This isn't judgment — it's calibration data for better service.`,
      },
      {
        heading: "Tolerance Breaks (T-Breaks)",
        body: `A **tolerance break** is a deliberate abstinence period to reset CB1 receptor sensitivity.\n\n**Evidence-based timelines:**\n• 2–3 days: Minor, measurable recovery\n• 7 days: Significant sensitivity restoration\n• 21–30 days: Near-complete reset for most users\n\n**Benefits:** Restore natural ECS balance, dramatically reduce product costs, re-sensitize to terpene complexity, reduce dependency risk.\n\n**Mild withdrawal (peaks 24–72 hrs):** Irritability, sleep disruption, vivid dreams, reduced appetite. Normal and temporary.`,
      },
      {
        heading: "Building a Sustainable Practice",
        body: `The goal for every Mycana customer is a **sustainable cannabis practice** — one that enhances life without dominating it.\n\n**Principles:**\n1. Purpose-driven consumption — use for specific reasons, not habitually\n2. Minimum effective dose — don't escalate without reason\n3. Method diversity — rotate to avoid over-reliance on one form\n4. Planned T-breaks — seasonal resets\n5. Log and reflect — Mycana makes this automatic\n\nMycana's data layer makes it possible to track these patterns at scale — identifying what's actually working, across real people, in real sessions. No other cannabis app does this.`,
      },
      {
        heading: "You're Part of the Future",
        body: `This brings everything full circle. Mycana exists because cannabis consumption has always been a black box. Users guess based on strain names and vibes. The 8 Mycana Factors give that guesswork a scientific framework.\n\nWhen you complete all 8 modules, you become a **Mycana Certified Budtender** — eligible to be featured as a **Mycana Consultant** on the upcoming TeleMedicine platform. Customers will be able to schedule 1:1 video consultations with certified consultants like you, interpreting their Mycana profile and making personalized recommendations.\n\nThat's the future of cannabis retail. You're training for it right now.`,
      },
    ],
    quiz: [
      { q: "Cannabis tolerance develops primarily through:", a: 1,
        opts: ["Increasing THC in the bloodstream", "CB1 receptor down-regulation", "Decreasing liver enzyme activity", "Psychological expectation alone"] },
      { q: "How long for near-complete CB1 receptor reset on a T-break?", a: 2,
        opts: ["24–48 hours", "3–5 days", "21–30 days", "6 months"] },
      { q: "Which customer behavior warrants gently raising awareness (not diagnosing)?", a: 1,
        opts: ["Using cannabis 2x/week for sleep", "Needing escalating doses and saying they feel \"not normal\" without cannabis", "Asking about T-breaks", "Switching between consumption methods"] },
    ],
  },
];

/* ── Sidequests ──────────────────────────────────────────────────────────── */
const SIDEQUESTS = [
  {
    id: "terpene-nose", icon: "👃", xp: 75,
    title: "Terpene Nose Test",
    desc: "Match the aroma description to the correct terpene. 4/5 correct to pass.",
    questions: [
      { q: "Smells like fresh lemon peel and orange zest — bright and uplifting", a: 1,
        opts: ["Myrcene", "Limonene", "Linalool", "Humulene"] },
      { q: "Earthy, musky, like overripe mango — associated with relaxation and couch lock", a: 0,
        opts: ["Myrcene", "Ocimene", "Bisabolol", "Valencene"] },
      { q: "Crisp pine forest after rain — known to counteract THC memory effects", a: 2,
        opts: ["Terpinolene", "Limonene", "Pinene", "Caryophyllene"] },
      { q: "Spicy, cracked black pepper — the only terpene that directly binds CB2 receptors", a: 3,
        opts: ["Myrcene", "Ocimene", "Terpinolene", "Caryophyllene"] },
      { q: "Lavender fields, soft and floral — calming and sleep-promoting", a: 2,
        opts: ["Bisabolol", "Valencene", "Linalool", "Humulene"] },
    ],
    passThreshold: 4,
  },
  {
    id: "profile-match", icon: "🧩", xp: 75,
    title: "Profile Match Challenge",
    desc: "Choose the best recommendation for each customer profile. 2/3 to pass.",
    questions: [
      { q: "Sarah (34) uses cannabis 2–3x/week for sleep and lower back pain. She dislikes being 'in her head' and has mild anxiety.", a: 1,
        opts: [
          "High-THC Sativa vape, high limonene — energizing and mood-lifting",
          "2:1 CBD:THC edible (5mg THC / 10mg CBD) high in myrcene and linalool, 90 min before bed",
          "30mg THC edible for maximum sleep depth",
          "High-THC concentrate — full pain coverage",
        ] },
      { q: "Marcus (28) creates music in the afternoon and wants uplifting focus — but has had anxiety attacks with high-THC before.", a: 2,
        opts: [
          "Any Sativa-labeled product in stock",
          "25mg THC edible for sustained effect",
          "Type I, 15–17% THC, high limonene/pinene + 25mg CBD capsule as a buffer",
          "CBD-only tincture — no THC at all",
        ] },
      { q: "James (62), first-time user, retired. Wants to try cannabis for arthritis pain. Nervous. Medication: metformin for diabetes.", a: 1,
        opts: [
          "10mg THC edible — standard beginner dose",
          "2.5mg THC + 10mg CBD gummy, assess after 2 full hours. Suggest his doctor review interactions.",
          "High-potency vape pen for fast-acting relief",
          "1g of 20% THC flower",
        ] },
    ],
    passThreshold: 2,
  },
  {
    id: "coa-decoder", icon: "📋", xp: 75,
    title: "COA Decoder",
    desc: "Read a real Certificate of Analysis and answer 3 questions. All 3 to pass.",
    coa: {
      strain: "Blue Dream #3 — Batch 2024-11A",
      thca: "21.4%", thc: "0.8%", cbd: "0.06%",
      terpenes: [
        { name: "Myrcene", pct: "0.62%" },
        { name: "Caryophyllene", pct: "0.41%" },
        { name: "Limonene", pct: "0.28%" },
      ],
      lab: "Empire State Analytics, NY · Passed ✓",
    },
    questions: [
      { q: "When smoked, what is the approximate active THC%?", a: 2,
        opts: ["0.8% (the labeled THC)", "21.4% (the labeled THCA)", "~19–20% (THCA converts to THC when heated)", "22.2% (THCA + THC combined)"] },
      { q: "Based on the terpene profile, this strain will likely produce:", a: 1,
        opts: ["Highly energizing and alert — great for morning focus", "Relaxing, body-heavy, with mild mood lift (myrcene-dominant)", "Pure CBD-driven wellness, no psychoactive effect", "No discernible effect beyond raw THC"] },
      { q: "A customer needs pain relief without heavy sedation. Which terpene should you highlight?", a: 1,
        opts: ["Myrcene — best for pain but heavy sedation", "Caryophyllene — binds CB2, anti-inflammatory without heavy sedation", "Limonene — primarily mood elevation, less pain-specific", "None — this strain isn't appropriate for pain"] },
    ],
    passThreshold: 3,
  },
  {
    id: "entourage-mixer", icon: "🧪", xp: 75,
    title: "Entourage Effect Mixer",
    desc: "Match terpene combos to their likely combined effect. 3/4 to pass.",
    questions: [
      { q: "Myrcene (dominant) + Linalool + moderate THC — what effect profile?", a: 1,
        opts: ["Energizing and creative, great for morning", "Sedating, relaxing, body-heavy — ideal for sleep", "Uplifting and social, mild impairment", "Localized pain relief only"] },
      { q: "Limonene + Pinene + Terpinolene + moderate THC — what effect?", a: 2,
        opts: ["Couch-lock and heavy sedation", "Localized pain relief, no psychoactive", "Uplifting, focus-enhancing, clear-headed high", "Intense psychedelic body effect"] },
      { q: "Caryophyllene + Myrcene + CBD-dominant (Type III) — what does this produce?", a: 1,
        opts: ["Maximum psychoactive effect", "Anti-inflammatory, mild relaxation, no significant high", "Severe anxiety trigger", "Energizing without any CBD involvement"] },
      { q: "Linalool + CBD (high) + trace THC — best use case?", a: 3,
        opts: ["Pre-workout energy", "Euphoric social experience", "Maximum pain relief for heavy users", "Anxiety relief and sleep support with minimal psychoactivity"] },
    ],
    passThreshold: 3,
  },
];

const CERT_REQUIRED = { modules: 8, sidequests: 2 };

/* ════════════════════════════════════════════════════════════════════════════
   STAFF EDU TAB — Main component
   Props:
     vendor    — vendor object { id, storeName, ... }
     userId    — Firebase UID of the current user
     userName  — Display name from Google account
     isOwner   — true when rendered inside VendorDashboard (grants manage access)
   ════════════════════════════════════════════════════════════════════════════ */
export default function StaffEduTab({ vendor, userId, userName, isOwner = false }) {
  const [progress, setProgressLocal] = useState(null); // null = loading
  const [view, setView]           = useState("hub");
  const [activeId, setActiveId]   = useState(null);
  const [quizState, setQuizState] = useState(null);
  const [sqState, setSqState]     = useState(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [staffList, setStaffList] = useState(null);
  const [loadingStaff, setLoadingStaff] = useState(false);

  /* ── Load / register progress from Firestore on mount ── */
  useEffect(() => {
    if (!userId || !vendor?.id) return;
    registerStaffMember(vendor.id, { id: userId, name: userName || "Staff Member" })
      .then(data => {
        setProgressLocal({
          xp: data.xp ?? 0,
          completedModules: data.completedModules ?? [],
          quizScores: data.quizScores ?? {},
          completedSidequests: data.completedSidequests ?? [],
          certEarned: data.certEarned ?? false,
        });
      })
      .catch(() => {
        setProgressLocal({ xp: 0, completedModules: [], quizScores: {}, completedSidequests: [], certEarned: false });
      });
  }, [userId, vendor?.id]);

  /* ── Optimistic-update + async Firestore write ── */
  const saveProgress = useCallback(async (updates) => {
    setProgressLocal(p => ({ ...p, ...updates }));
    try {
      await updateStaffProgress(vendor.id, userId, updates);
    } catch (err) {
      console.error("Progress save failed:", err);
    }
  }, [vendor.id, userId]);

  /* ── Loading state ── */
  if (progress === null) {
    return (
      <div className="edu-loading">
        <div className="edu-loading__spinner">🌿</div>
        <p>Loading your training progress…</p>
      </div>
    );
  }

  const level   = getEduLevel(progress.xp);
  const nextLvl = nextLevel(progress.xp);
  const certified = progress.completedModules.length >= CERT_REQUIRED.modules
    && progress.completedSidequests.length >= CERT_REQUIRED.sidequests;
  const pctToNext = nextLvl
    ? Math.round(((progress.xp - level.min) / (nextLvl.min - level.min)) * 100)
    : 100;
  const firstName = (userName || "there").split(" ")[0];

  /* ── Helpers ── */
  const openModule = (id) => {
    setActiveId(id);
    const m = MODULES.find(x => x.id === id);
    setQuizState({ picks: Array(m.quiz.length).fill(null), submitted: false, score: 0 });
    setView("module");
  };

  const openSidequest = (id) => {
    setActiveId(id);
    const sq = SIDEQUESTS.find(x => x.id === id);
    setSqState({ picks: Array(sq.questions.length).fill(null), submitted: false, score: 0 });
    setView("sidequest");
  };

  const openManage = async () => {
    setView("manage");
    if (staffList === null && !loadingStaff) {
      setLoadingStaff(true);
      try {
        const members = await getStaffMembers(vendor.id);
        setStaffList(members.sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)));
      } catch {
        setStaffList([]);
      } finally {
        setLoadingStaff(false);
      }
    }
  };

  const submitQuiz = () => {
    const m = MODULES.find(x => x.id === activeId);
    const score = quizState.picks.filter((p, i) => p === m.quiz[i].a).length;
    const pct = Math.round((score / m.quiz.length) * 100);
    const passed = pct >= 75;
    const alreadyDone = progress.completedModules.includes(activeId);
    let gained = 0;
    if (passed && !alreadyDone) {
      gained += m.xp;
      if (score === m.quiz.length) gained += 50;
    }
    setQuizState(q => ({ ...q, submitted: true, score: pct, passed, gained }));
    if (passed && !alreadyDone) {
      const newModules = [...progress.completedModules, activeId];
      const justCertified = !progress.certEarned
        && newModules.length >= CERT_REQUIRED.modules
        && progress.completedSidequests.length >= CERT_REQUIRED.sidequests;
      saveProgress({
        xp: progress.xp + gained,
        completedModules: newModules,
        quizScores: { ...progress.quizScores, [activeId]: pct },
        ...(justCertified ? { certEarned: true } : {}),
      });
      logActivity("module_completed", { storeName: vendor.storeName, moduleName: m.title });
      if (justCertified) logActivity("staff_certified", { storeName: vendor.storeName });
    }
  };

  const submitSidequest = () => {
    const sq = SIDEQUESTS.find(x => x.id === activeId);
    const correct = sqState.picks.filter((p, i) => p === sq.questions[i].a).length;
    const passed = correct >= sq.passThreshold;
    const alreadyDone = progress.completedSidequests.includes(activeId);
    const gained = (passed && !alreadyDone) ? sq.xp : 0;
    setSqState(s => ({ ...s, submitted: true, score: correct, passed, gained }));
    if (passed && !alreadyDone) {
      const newSidequests = [...progress.completedSidequests, activeId];
      const justCertified = !progress.certEarned
        && progress.completedModules.length >= CERT_REQUIRED.modules
        && newSidequests.length >= CERT_REQUIRED.sidequests;
      saveProgress({
        xp: progress.xp + gained,
        completedSidequests: newSidequests,
        ...(justCertified ? { certEarned: true } : {}),
      });
      logActivity("sidequest_completed", { storeName: vendor.storeName, sidequestTitle: sq.title });
      if (justCertified) logActivity("staff_certified", { storeName: vendor.storeName });
    }
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/staff-edu/${vendor.catalogSlug}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2500);
  };

  /* ─────────────────────────── RENDER ──────────────────────────────────── */

  /* Module view */
  if (view === "module") {
    const m = MODULES.find(x => x.id === activeId);
    const done = progress.completedModules.includes(activeId);
    return (
      <div className="edu-module-view">
        <button className="edu-back" onClick={() => setView("hub")}>← Back to Training Hub</button>
        <div className="edu-module-header" style={{ borderColor: m.color }}>
          <span className="edu-module-header__icon">{m.icon}</span>
          <div>
            <div className="edu-module-header__factor">Factor {m.factor} of 8</div>
            <h2 className="edu-module-header__title">{m.title}</h2>
            <p className="edu-module-header__sub">{m.subtitle}</p>
          </div>
          <div className="edu-module-header__xp" style={{ color: m.color }}>+{m.xp} XP</div>
        </div>

        {m.sections.map((s, i) => (
          <div key={i} className="edu-section">
            <h3 className="edu-section__heading">{s.heading}</h3>
            <div className="edu-section__body">
              {s.body.split("\n").map((line, li) => (
                <p key={li} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
              ))}
            </div>
          </div>
        ))}

        <div className="edu-quiz">
          <h3 className="edu-quiz__title">📝 Module Quiz</h3>
          <p className="edu-quiz__sub">Score 75% or higher to complete this module and earn {m.xp} XP.</p>

          {m.quiz.map((q, qi) => (
            <div key={qi} className={`edu-quiz__q ${quizState.submitted ? "edu-quiz__q--submitted" : ""}`}>
              <p className="edu-quiz__q-text"><strong>Q{qi + 1}:</strong> {q.q}</p>
              <div className="edu-quiz__opts">
                {q.opts.map((opt, oi) => {
                  const picked = quizState.picks[qi] === oi;
                  const isCorrect = oi === q.a;
                  let cls = "edu-quiz__opt";
                  if (quizState.submitted) {
                    if (isCorrect) cls += " edu-quiz__opt--correct";
                    else if (picked && !isCorrect) cls += " edu-quiz__opt--wrong";
                  } else if (picked) cls += " edu-quiz__opt--picked";
                  return (
                    <button key={oi} className={cls} disabled={quizState.submitted}
                      onClick={() => setQuizState(s => {
                        const picks = [...s.picks]; picks[qi] = oi; return { ...s, picks };
                      })}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!quizState.submitted ? (
            <button
              className="btn btn--primary"
              disabled={quizState.picks.some(p => p === null)}
              onClick={submitQuiz}
            >
              Submit Quiz
            </button>
          ) : (
            <div className={`edu-quiz__result ${quizState.passed ? "edu-quiz__result--pass" : "edu-quiz__result--fail"}`}>
              <div className="edu-quiz__result-score">{quizState.score}%</div>
              <div className="edu-quiz__result-msg">
                {quizState.passed
                  ? `✅ Passed! ${!done && quizState.gained ? `+${quizState.gained} XP earned!` : done ? "Already completed." : ""}`
                  : "❌ Score below 75% — review the material and try again."}
              </div>
              {quizState.passed && !done && quizState.score === 100 && (
                <div className="edu-quiz__bonus">🌟 Perfect score! +50 bonus XP</div>
              )}
              {!quizState.passed && (
                <button className="btn btn--outline btn--sm" style={{ marginTop: 12 }}
                  onClick={() => setQuizState({ picks: Array(m.quiz.length).fill(null), submitted: false, score: 0 })}>
                  Retry Quiz
                </button>
              )}
              {quizState.passed && (
                <button className="btn btn--primary btn--sm" style={{ marginTop: 12 }} onClick={() => setView("hub")}>
                  Back to Hub
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Sidequest view */
  if (view === "sidequest") {
    const sq = SIDEQUESTS.find(x => x.id === activeId);
    const done = progress.completedSidequests.includes(activeId);
    return (
      <div className="edu-module-view">
        <button className="edu-back" onClick={() => setView("hub")}>← Back to Training Hub</button>
        <div className="edu-module-header" style={{ borderColor: "#d4a843" }}>
          <span className="edu-module-header__icon">{sq.icon}</span>
          <div>
            <div className="edu-module-header__factor">Sidequest Challenge</div>
            <h2 className="edu-module-header__title">{sq.title}</h2>
            <p className="edu-module-header__sub">{sq.desc}</p>
          </div>
          <div className="edu-module-header__xp" style={{ color: "#d4a843" }}>+{sq.xp} XP</div>
        </div>

        {sq.coa && (
          <div className="edu-coa">
            <div className="edu-coa__header">Certificate of Analysis</div>
            <div className="edu-coa__grid">
              <div><strong>Strain:</strong> {sq.coa.strain}</div>
              <div><strong>THCA:</strong> {sq.coa.thca}</div>
              <div><strong>THC:</strong> {sq.coa.thc}</div>
              <div><strong>CBD:</strong> {sq.coa.cbd}</div>
              <div><strong>Lab:</strong> {sq.coa.lab}</div>
            </div>
            <div className="edu-coa__terps">
              <strong>Top Terpenes:</strong>
              {sq.coa.terpenes.map(t => (
                <span key={t.name} className="edu-coa__terp">{t.name} {t.pct}</span>
              ))}
            </div>
          </div>
        )}

        {sq.questions.map((q, qi) => (
          <div key={qi} className={`edu-quiz__q ${sqState.submitted ? "edu-quiz__q--submitted" : ""}`}>
            <p className="edu-quiz__q-text"><strong>Q{qi + 1}:</strong> {q.q}</p>
            <div className="edu-quiz__opts">
              {q.opts.map((opt, oi) => {
                const picked = sqState.picks[qi] === oi;
                const isCorrect = oi === q.a;
                let cls = "edu-quiz__opt";
                if (sqState.submitted) {
                  if (isCorrect) cls += " edu-quiz__opt--correct";
                  else if (picked && !isCorrect) cls += " edu-quiz__opt--wrong";
                } else if (picked) cls += " edu-quiz__opt--picked";
                return (
                  <button key={oi} className={cls} disabled={sqState.submitted}
                    onClick={() => setSqState(s => {
                      const picks = [...s.picks]; picks[qi] = oi; return { ...s, picks };
                    })}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!sqState.submitted ? (
          <button className="btn btn--primary" disabled={sqState.picks.some(p => p === null)} onClick={submitSidequest}>
            Submit Challenge
          </button>
        ) : (
          <div className={`edu-quiz__result ${sqState.passed ? "edu-quiz__result--pass" : "edu-quiz__result--fail"}`}>
            <div className="edu-quiz__result-score">{sqState.score}/{sq.questions.length} correct</div>
            <div className="edu-quiz__result-msg">
              {sqState.passed
                ? `✅ Challenge cleared! ${!done && sqState.gained ? `+${sqState.gained} XP` : done ? "Already completed." : ""}`
                : `❌ Need ${sq.passThreshold}/${sq.questions.length} to pass. Try again!`}
            </div>
            {!sqState.passed && (
              <button className="btn btn--outline btn--sm" style={{ marginTop: 12 }}
                onClick={() => setSqState({ picks: Array(sq.questions.length).fill(null), submitted: false, score: 0 })}>
                Retry
              </button>
            )}
            {sqState.passed && (
              <button className="btn btn--primary btn--sm" style={{ marginTop: 12 }} onClick={() => setView("hub")}>
                Back to Hub
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  /* Certification view */
  if (view === "cert") {
    return (
      <div className="edu-cert-view">
        <button className="edu-back" onClick={() => setView("hub")}>← Back to Hub</button>
        <div className="edu-cert-card">
          <div className="edu-cert-card__badge">⭐</div>
          <div className="edu-cert-card__eyebrow">Certificate of Completion</div>
          <h2 className="edu-cert-card__name">{userName || "Staff Member"}</h2>
          <div className="edu-cert-card__title">Mycana Certified Budtender</div>
          <div className="edu-cert-card__store">Certified at {vendor.storeName}</div>
          <div className="edu-cert-card__details">
            <span>8 Modules Completed</span>
            <span>·</span>
            <span>{progress.xp} XP Earned</span>
            <span>·</span>
            <span>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          </div>
          <div className="edu-cert-card__divider" />
          <div className="edu-cert-card__tm">
            <div className="edu-cert-card__tm-badge">🎥 TeleMedicine Eligible</div>
            <p>As a certified Mycana Budtender, you're eligible to be listed as a <strong>Mycana Consultant</strong> on our upcoming TeleMedicine platform — offering 1:1 virtual consultations to Mycana users nationwide.</p>
            <button className="btn btn--primary" style={{ marginTop: 16 }}
              onClick={() => alert("TeleMedicine consultant enrollment is coming soon! You'll be notified when applications open.")}>
              Apply as Mycana Consultant →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Manage Staff view — owners only */
  if (view === "manage" && isOwner) {
    const roster = staffList ?? [];
    return (
      <div className="edu-manage-view">
        <button className="edu-back" onClick={() => setView("hub")}>← Back to Hub</button>
        <h2 className="edu-section-title">Staff Management</h2>
        <p style={{ color: "var(--c-text-muted)", marginBottom: 24 }}>
          Invite your budtender team to the Staff EDU portal. Each staff member logs in with their Google account and is added to your roster automatically.
        </p>

        {/* Invite link */}
        <div className="edu-invite-card">
          <div className="edu-invite-card__label">📨 Staff Invite Link</div>
          <p className="edu-invite-card__desc">
            Share this link with your staff. They sign in with Google, are automatically added to your roster, and begin training immediately.
          </p>
          <div className="edu-invite-card__row">
            <code className="edu-invite-card__url">
              {`${window.location.origin}/staff-edu/${vendor.catalogSlug}`}
            </code>
            <button className={`btn btn--sm ${inviteCopied ? "btn--outline" : "btn--primary"}`} onClick={copyInviteLink}>
              {inviteCopied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Staff roster */}
        <h3 className="edu-subsection-title">Staff Leaderboard</h3>
        {loadingStaff ? (
          <div className="edu-roster-loading">Loading staff roster…</div>
        ) : roster.length === 0 ? (
          <div className="edu-roster-empty">
            <p>No staff enrolled yet. Share the invite link above to get started.</p>
          </div>
        ) : (
          <div className="edu-roster">
            {roster.map((s, i) => {
              const lvl = getEduLevel(s.xp ?? 0);
              const modules = (s.completedModules ?? []).length;
              const cert = s.certEarned || (modules >= 8 && (s.completedSidequests ?? []).length >= 2);
              return (
                <div key={s.id} className="edu-roster__row">
                  <div className="edu-roster__rank">#{i + 1}</div>
                  <div className="edu-roster__info">
                    <div className="edu-roster__name">
                      {s.name || s.email || "Staff Member"}
                      {cert && <span className="edu-roster__cert">⭐ Certified</span>}
                    </div>
                    <div className="edu-roster__meta">
                      {modules}/8 modules · Joined {formatJoined(s.joinedAt)}
                    </div>
                  </div>
                  <div className="edu-roster__right">
                    <span className="edu-roster__level" style={{ color: lvl.color }}>{lvl.emoji} {lvl.label}</span>
                    <span className="edu-roster__xp">{(s.xp ?? 0).toLocaleString()} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="edu-manage-note">
          ℹ️ Certified staff are automatically highlighted. Progress updates live as staff complete modules.
        </p>
      </div>
    );
  }

  /* ── HUB (default) ──────────────────────────────────────────────────────── */
  return (
    <div className="edu-hub">
      {/* Progress header */}
      <div className="edu-progress-bar">
        <div className="edu-progress-bar__left">
          <span className="edu-progress-bar__greeting">Welcome back, {firstName} 👋</span>
          <div className="edu-progress-bar__level" style={{ color: level.color }}>
            {level.emoji} {level.label}
          </div>
        </div>
        <div className="edu-progress-bar__right">
          <div className="edu-progress-bar__xp">{progress.xp.toLocaleString()} XP</div>
          {nextLvl && (
            <div className="edu-progress-bar__track">
              <div className="edu-progress-bar__fill" style={{ width: `${pctToNext}%`, background: level.color }} />
            </div>
          )}
          {nextLvl && <div className="edu-progress-bar__next">Next: {nextLvl.emoji} {nextLvl.label} ({nextLvl.min} XP)</div>}
        </div>
        {certified && (
          <button className="edu-cert-btn" onClick={() => setView("cert")}>⭐ View Certificate</button>
        )}
      </div>

      {/* Nav tabs */}
      <div className="edu-nav">
        <button className="edu-nav__btn edu-nav__btn--active">📚 Training Hub</button>
        {isOwner && (
          <button className="edu-nav__btn" onClick={openManage}>👥 Manage Staff</button>
        )}
        {certified && (
          <button className="edu-nav__btn edu-nav__btn--gold" onClick={() => setView("cert")}>⭐ My Certificate</button>
        )}
      </div>

      {/* Certification progress banner */}
      {!certified && (
        <div className="edu-cert-progress">
          <div className="edu-cert-progress__inner">
            <span className="edu-cert-progress__icon">🎓</span>
            <div>
              <strong>Mycana Certification Progress</strong>
              <div className="edu-cert-progress__meta">
                {progress.completedModules.length}/8 modules · {progress.completedSidequests.length}/2 sidequests required
                {progress.completedModules.length === 8 && progress.completedSidequests.length < 2 && " — Complete 2 sidequests to certify!"}
                {progress.completedModules.length < 8 && " — Complete all 8 modules to unlock certification"}
              </div>
            </div>
          </div>
          <div className="edu-cert-progress__bar">
            <div className="edu-cert-progress__fill"
              style={{ width: `${Math.round((progress.completedModules.length / 8) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Module grid */}
      <h3 className="edu-section-label">🌱 The 8 Mycana Cannabis Factors</h3>
      <div className="edu-module-grid">
        {MODULES.map((m) => {
          const done = progress.completedModules.includes(m.id);
          const score = progress.quizScores[m.id];
          return (
            <button key={m.id} className={`edu-card ${done ? "edu-card--done" : ""}`} onClick={() => openModule(m.id)}>
              <div className="edu-card__top">
                <span className="edu-card__factor" style={{ background: m.color }}>Factor {m.factor}</span>
                {done && <span className="edu-card__check">✓</span>}
              </div>
              <div className="edu-card__icon">{m.icon}</div>
              <div className="edu-card__title">{m.title}</div>
              <div className="edu-card__sub">{m.subtitle}</div>
              <div className="edu-card__footer">
                <span className="edu-card__xp">+{m.xp} XP</span>
                {done && score && <span className="edu-card__score">{score}%</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sidequests */}
      <h3 className="edu-section-label" style={{ marginTop: 40 }}>⚡ Sidequest Challenges</h3>
      <p className="edu-section-note">Complete 2 sidequests + all 8 modules to earn Mycana Certification and TeleMedicine Consultant eligibility.</p>
      <div className="edu-sq-grid">
        {SIDEQUESTS.map(sq => {
          const done = progress.completedSidequests.includes(sq.id);
          return (
            <button key={sq.id} className={`edu-sq-card ${done ? "edu-sq-card--done" : ""}`} onClick={() => openSidequest(sq.id)}>
              <div className="edu-sq-card__icon">{sq.icon}</div>
              <div className="edu-sq-card__title">{sq.title}</div>
              <div className="edu-sq-card__desc">{sq.desc}</div>
              <div className="edu-sq-card__footer">
                <span className="edu-sq-card__xp">+{sq.xp} XP</span>
                {done && <span className="edu-sq-card__done">✓ Completed</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* TeleMedicine CTA */}
      <div className="edu-telemedicine">
        <div className="edu-telemedicine__badge">🎥 Coming Soon</div>
        <h3 className="edu-telemedicine__title">Mycana TeleMedicine</h3>
        <p className="edu-telemedicine__body">
          Certified Mycana Budtenders will be listed as <strong>Mycana Consultants</strong> — available for 1:1 video consultations with Mycana users seeking personalized cannabis guidance. Complete your certification to be first in line when applications open.
        </p>
        <div className="edu-telemedicine__features">
          {["Virtual 1:1 video sessions", "Personalized profile interpretation", "Scheduled appointments", "Earn income as a consultant"].map(f => (
            <div key={f} className="edu-telemedicine__feature">✓ {f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
