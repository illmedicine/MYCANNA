// ── AI Label & Screenshot Scrape Service ─────────────────────────────────────
// Two paths:
//   1. Cloud Function (parseProductScreenshot) — uses Claude Haiku, no browser key needed
//      Activate: set VITE_FUNCTIONS_URL in .env.local once project is on Blaze plan
//   2. Gemini Vision — browser-side, requires VITE_GEMINI_API_KEY
//      Free key at: https://aistudio.google.com/app/apikey

const GEMINI_BASE  = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-2.0-flash";

// Prompt for PHYSICAL PRODUCT LABELS (photos of the actual package)
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

// Prompt for WEBSITE SCREENSHOTS (1A4.com COA pages)
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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function isConfigured() {
  return !!(
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_PARSE_FUNCTION_URL
  );
}

// ── Decode QR code from a still image file ─────────────────────────────────
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

// ── Internal: call Cloud Function (Blaze plan) ─────────────────────────────
async function viaCloudFunction(imageFiles, isLabel = true) {
  const fnUrl = import.meta.env.VITE_PARSE_FUNCTION_URL;
  if (!fnUrl) return null;

  // Send all images in one request (Gemini handles multi-image)
  const images = await Promise.all(
    imageFiles.map(async (file) => ({
      base64: await fileToBase64(file),
      mimeType: file.type || "image/jpeg",
    }))
  );

  const res = await fetch(fnUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images, prompt: isLabel ? "label" : "screenshot" }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json.success ? json.data : null;
}

// ── Internal: call Gemini Vision ───────────────────────────────────────────
async function viaGemini(imageFiles, prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  // Build multi-image parts (all photos in one request)
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
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return null;
  }
}

// ── Public: scrape PHYSICAL LABEL PHOTOS (new primary path) ───────────────
export async function scrapeLabPhotos(imageFiles) {
  if (!imageFiles?.length) throw new Error("No images provided");

  // Try Cloud Function first, then Gemini
  const result =
    (await viaCloudFunction(imageFiles, true)) ??
    (await viaGemini(imageFiles, LABEL_PROMPT));

  if (!result) throw new Error("AI_NOT_CONFIGURED");
  return result;
}

// ── Public: scrape WEBSITE SCREENSHOT (legacy path, kept for compatibility) ─
export async function scrapeProductFromScreenshot(imageFile) {
  const result =
    (await viaCloudFunction([imageFile], false)) ??
    (await viaGemini([imageFile], SCREENSHOT_PROMPT));

  if (!result) throw new Error("AI_NOT_CONFIGURED");
  return result;
}

// ── Map AI/label data to the product state shape used by LogExperience ─────
export function mapAIDataToProduct(ai) {
  if (!ai) return {};

  let category = ai.category ?? "flower";
  if (ai.name && category === "flower") {
    const n = (ai.name ?? "").toLowerCase();
    if (n.includes("pre-roll") || n.includes("preroll")) category = "preroll";
    else if (n.includes("vape") || n.includes("cart"))   category = "vape";
    else if (n.includes("edible") || n.includes("gummy")) category = "edible";
    else if (n.includes("concentrate") || n.includes("wax")) category = "concentrate";
    else if (n.includes("tincture"))  category = "tincture";
    else if (n.includes("topical"))   category = "topical";
    else if (n.includes("capsule"))   category = "capsule";
  }

  // Derive THC% from mg if percentage not present but mg is
  let thcPct = ai.thcPct != null ? ai.thcPct : null;

  return {
    name:              ai.name        ?? "",
    strain:            ai.strain      ?? "",
    vendor:            ai.vendor      ?? ai.dispensary ?? "",
    cultivator:        ai.cultivator  ?? "",
    category,
    thcPct:            thcPct != null ? String(thcPct) : "",
    cbdPct:            ai.cbdPct != null ? String(ai.cbdPct) : "",
    terpenes:          Array.isArray(ai.terpenes) ? ai.terpenes : [],
    terpeneProfiles:   ai.terpeneProfiles ?? {},
    otherCannabinoids: ai.otherCannabinoids ?? {},
    batchNumber:       ai.batchNumber ?? ai.lotNumber ?? "",
    testDate:          ai.testDate ?? ai.expirationDate ?? ai.packagedOn ?? "",
    netWeight:         ai.netWeight   ?? "",
    packageTag:        ai.packageTag  ?? "",
    labName:           ai.labName     ?? "",
    labLicense:        ai.labLicense  ?? ai.ocmLicense ?? "",
    labTestStatus:     ai.labTestStatus ?? "",
    // Label-specific extras stored for display
    ocmLicense:        ai.ocmLicense  ?? "",
    processorAddress:  ai.processorAddress ?? "",
    expirationDate:    ai.expirationDate ?? "",
    // QR URL found in the image (text printed below QR)
    qrUrlFromLabel:    ai.qrUrl ?? "",
  };
}
