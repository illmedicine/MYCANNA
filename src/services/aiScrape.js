// ── AI Label Scrape Service ───────────────────────────────────────────────────
// Primary path: Firebase Cloud Function "analyzeLabel" (Anthropic Claude Haiku)
//   - API key lives in Firebase Secret Manager — never exposed to the browser
//   - Requires authenticated user (Firebase enforces this automatically)
//
// Fallback: Gemini Vision (VITE_GEMINI_API_KEY in .env.local)
//   - Browser-side, key is visible in bundle — dev/testing only

import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

// ── Gemini fallback (dev only) ────────────────────────────────────────────────
const GEMINI_BASE  = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-2.0-flash";

const LABEL_PROMPT = `This is a photograph of a physical NYS cannabis product label. Extract ALL visible text and return ONLY a JSON object (null for fields not visible):

{
  "name": "full product name",
  "strain": "strain name if listed separately",
  "cultivator": "manufacturer/processor name (e.g. HM OPS LLC)",
  "category": "flower | preroll | vape | edible | concentrate | tincture | topical | capsule",
  "thcPct": 28.50,
  "cbdPct": null,
  "tacPct": 32.92,
  "thcMg": 997.74,
  "cbdMg": null,
  "thcvPct": null,
  "servings": null,
  "netWeight": "3.5g",
  "batchNumber": "TY0124",
  "expirationDate": "03/16/2027",
  "ocmLicense": "OCM-PROC-24-000119",
  "processorAddress": "18-33 41st Street, Astoria, NY 11105",
  "contactEmail": "sales@nyfarm.co",
  "qrUrl": "https://1a4.com/13U2YPUQ3SBK384FM8SPOQ",
  "terpenes": [],
  "otherCannabinoids": {}
}

Rules:
- thcPct: use the % value (28.50), NOT the mg value
- qrUrl: read the text URL printed below or beside the QR code if visible
- For mg values on vapes (e.g. "279.41mg (5.5mg)"): thcMg = total mg in package
- Return ONLY valid JSON — no markdown fences, no explanation`;

const SCREENSHOT_PROMPT = `This is a screenshot of a NYS cannabis product COA / track-and-trace page (from app.1a4.com). Extract every piece of product data visible and return ONLY a JSON object (null for fields not visible):

{
  "name": "full product name",
  "strain": "strain name if separately listed",
  "vendor": "dispensary or retailer name if visible",
  "cultivator": "Manufactured By / grower name",
  "category": "flower | preroll | vape | edible | concentrate | tincture | topical | capsule",
  "thcPct": 28.297,
  "cbdPct": null,
  "otherCannabinoids": { "THCa": 30.552, "CBC": 0.194 },
  "terpenes": ["Beta-Caryophyllene", "Limonene"],
  "terpeneProfiles": { "Beta-Caryophyllene": 0.37, "Limonene": 0.32 },
  "batchNumber": "batch or lot ID",
  "packageTag": "full UID / package tag",
  "netWeight": "3.5 Grams",
  "testDate": "05/11/2026",
  "labName": "Green Analytics NY, LLC",
  "labTestStatus": "TestPassed"
}

Return ONLY valid JSON — no markdown, no explanation.`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Merge multiple AI results: first non-null value wins for each field
function mergeResults(results) {
  const merged = {};
  for (const result of results) {
    if (!result) continue;
    for (const [key, val] of Object.entries(result)) {
      if (merged[key] == null && val != null && val !== "" && !(Array.isArray(val) && val.length === 0)) {
        merged[key] = val;
      }
    }
  }
  return Object.keys(merged).length ? merged : null;
}

// ── isConfigured: always true — Cloud Function is always available ─────────────
export function isConfigured() {
  return true;
}

// ── Decode QR code from a still image file ────────────────────────────────────
export async function decodeQRFromImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Try native BarcodeDetector first
      if ("BarcodeDetector" in window) {
        try {
          const det = new BarcodeDetector({ formats: ["qr_code"] });
          const codes = await det.detect(canvas);
          if (codes[0]?.rawValue) { resolve(codes[0].rawValue); return; }
        } catch { /* fall through */ }
      }

      // jsQR fallback
      try {
        const { default: jsQR } = await import("jsqr");
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(data.data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" });
        resolve(code?.data ?? null);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// ── Primary: Firebase Cloud Function (Anthropic Claude Haiku) ─────────────────
// Calls the deployed "analyzeLabel" onCall function — one image at a time,
// then merges the results so multi-photo labels all contribute fields.
async function viaFirebaseFunction(imageFiles) {
  const analyzeLabelFn = httpsCallable(functions, "analyzeLabel", { timeout: 30000 });

  const results = await Promise.allSettled(
    imageFiles.map(async (file) => {
      const base64    = await fileToBase64(file);
      const mediaType = file.type || "image/jpeg";
      const res       = await analyzeLabelFn({ base64, mediaType });
      return res.data;
    })
  );

  const successful = results
    .filter(r => r.status === "fulfilled" && r.value)
    .map(r => r.value);

  return successful.length ? mergeResults(successful) : null;
}

// ── Fallback: Gemini Vision (dev/testing only) ────────────────────────────────
async function viaGemini(imageFiles, prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const imageParts = await Promise.all(
    imageFiles.map(async (file) => ({
      inline_data: {
        mime_type: file.type || "image/jpeg",
        data: await fileToBase64(file),
      },
    }))
  );

  const body = {
    contents: [{ parts: [...imageParts, { text: prompt }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 1024 },
  };

  const res = await fetch(
    `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!res.ok) return null;
  const json = await res.json();
  const raw  = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

// ── Public: scrape physical label photos ──────────────────────────────────────
export async function scrapeLabPhotos(imageFiles) {
  if (!imageFiles?.length) throw new Error("No images provided");

  const result =
    (await viaFirebaseFunction(imageFiles).catch(() => null)) ??
    (await viaGemini(imageFiles, LABEL_PROMPT).catch(() => null));

  if (!result) throw new Error("AI_NOT_CONFIGURED");
  return result;
}

// ── Public: scrape website screenshot (COA pages) ─────────────────────────────
export async function scrapeProductFromScreenshot(imageFile) {
  const result =
    (await viaFirebaseFunction([imageFile]).catch(() => null)) ??
    (await viaGemini([imageFile], SCREENSHOT_PROMPT).catch(() => null));

  if (!result) throw new Error("AI_NOT_CONFIGURED");
  return result;
}

// ── Normalise AI category string → web form value ────────────────────────────
const CATEGORY_NORM = {
  flower:      "flower",
  bud:         "flower",
  preroll:     "preroll",
  "pre-roll":  "preroll",
  "pre roll":  "preroll",
  joint:       "preroll",
  cone:        "preroll",
  vape:        "vape",
  cartridge:   "vape",
  cart:        "vape",
  pod:         "vape",
  distillate:  "vape",
  concentrate: "concentrate",
  wax:         "concentrate",
  shatter:     "concentrate",
  rosin:       "concentrate",
  resin:       "concentrate",
  hash:        "concentrate",
  edible:      "edible",
  gummy:       "edible",
  chocolate:   "edible",
  beverage:    "edible",
  tincture:    "tincture",
  topical:     "topical",
  capsule:     "capsule",
};

function normalizeCategory(raw) {
  if (!raw) return "flower";
  const key = String(raw).toLowerCase().trim();
  if (CATEGORY_NORM[key]) return CATEGORY_NORM[key];
  // partial match: check if any known keyword appears in the string
  for (const [kw, val] of Object.entries(CATEGORY_NORM)) {
    if (key.includes(kw)) return val;
  }
  return "flower";
}

// ── Map AI data to the product state shape used by LogExperience ──────────────
export function mapAIDataToProduct(ai) {
  if (!ai) return {};

  const category = normalizeCategory(ai.category);

  return {
    name:              ai.name        ?? "",
    strain:            ai.strain      ?? "",
    vendor:            ai.vendor      ?? ai.dispensary ?? "",
    cultivator:        ai.cultivator  ?? "",
    category,
    thcPct:            ai.thcPct != null ? String(ai.thcPct) : "",
    cbdPct:            ai.cbdPct != null ? String(ai.cbdPct) : "",
    tacPct:            ai.tacPct != null ? String(ai.tacPct) : "",
    thcvPct:           ai.thcvPct != null ? String(ai.thcvPct) : "",
    thcMg:             ai.thcMg != null ? String(ai.thcMg) : "",
    terpenes:          Array.isArray(ai.terpenes) ? ai.terpenes : [],
    terpeneProfiles:   ai.terpeneProfiles ?? {},
    otherCannabinoids: ai.otherCannabinoids ?? {},
    batchNumber:       ai.batchNumber ?? ai.lotNumber ?? "",
    testDate:          ai.testDate ?? ai.packagedOn ?? "",
    netWeight:         ai.netWeight   ?? "",
    servings:          ai.servings != null ? String(ai.servings) : "",
    packageTag:        ai.packageTag  ?? "",
    labName:           ai.labName     ?? "",
    labLicense:        ai.labLicense  ?? ai.ocmLicense ?? "",
    labTestStatus:     ai.labTestStatus ?? "",
    ocmLicense:        ai.ocmLicense  ?? "",
    processorAddress:  ai.processorAddress ?? ai.manufacturerAddress ?? "",
    expirationDate:    ai.expirationDate ?? "",
    contactEmail:      ai.contactEmail ?? "",
    qrUrlFromLabel:    ai.qrUrl ?? "",
  };
}
