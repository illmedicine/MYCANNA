const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const GEMINI_KEY = defineSecret("GEMINI_API_KEY");

// ── Allowed origins ──────────────────────────────────────────────────────────
const ALLOWED = [
  "https://mycanna-b2284.web.app",
  "https://mycanna-b2284.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:4173",
];

function setCORS(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Max-Age", "3600");
}

// ── 1: Server-side 1A4 product lookup proxy ──────────────────────────────────
exports.lookup1A4Product = onRequest({ region: "us-east1" }, async (req, res) => {
  setCORS(req, res);
  if (req.method === "OPTIONS") return res.status(204).send("");

  const { tag, pin } = req.query;
  if (!tag) return res.status(400).json({ error: "tag required" });

  const results = {};

  const attempts = [
    {
      key: "primary",
      url: `https://app.1a4.com/api/package?tag=${encodeURIComponent(tag)}&pin=${encodeURIComponent(pin || "")}`,
      headers: {
        "Accept": "application/json",
        "Referer": "https://app.1a4.com/",
        "Origin": "https://app.1a4.com",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
    },
    {
      key: "v2",
      url: `https://app.1a4.com/api/v2/package?tag=${encodeURIComponent(tag)}&pin=${encodeURIComponent(pin || "")}`,
      headers: { "Accept": "application/json", "Referer": "https://app.1a4.com/" },
    },
    {
      key: "consumer",
      url: `https://app.1a4.com/api/consumer/package/${encodeURIComponent(tag)}?pin=${encodeURIComponent(pin || "")}`,
      headers: { "Accept": "application/json", "Referer": "https://app.1a4.com/" },
    },
    {
      key: "public",
      url: `https://app.1a4.com/api/public/packages/${encodeURIComponent(tag)}`,
      headers: { "Accept": "application/json", "Referer": "https://app.1a4.com/" },
    },
  ];

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, { headers: attempt.headers });
      const bodyText = await response.text();

      results[attempt.key] = {
        status: response.status,
        ok: response.ok,
        body: bodyText.slice(0, 2000),
      };

      if (response.ok) {
        try {
          const data = JSON.parse(bodyText);
          return res.json({ success: true, source: attempt.key, data });
        } catch {
          return res.json({ success: true, source: attempt.key, raw: bodyText });
        }
      }
    } catch (err) {
      results[attempt.key] = { error: err.message };
    }
  }

  return res.json({ success: false, results });
});

// ── 2: AI label/screenshot parsing via Gemini Vision ─────────────────────────
// POST { images: [{ base64, mimeType }], prompt: "label" | "screenshot" }
exports.parseProductScreenshot = onRequest(
  { region: "us-east1", secrets: [GEMINI_KEY] },
  async (req, res) => {
    setCORS(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("POST only");

    const { images = [], imageBase64, mimeType = "image/jpeg" } = req.body ?? {};

    // Support both multi-image (new) and single-image (legacy) format
    const imageParts = images.length > 0
      ? images.map(img => ({
          inlineData: { mimeType: img.mimeType || "image/jpeg", data: img.base64 }
        }))
      : imageBase64
        ? [{ inlineData: { mimeType, data: imageBase64 } }]
        : null;

    if (!imageParts) return res.status(400).json({ error: "images required" });

    const isLabel = req.body?.prompt === "label";

    const promptText = isLabel
      ? `This is a photograph of a physical NYS cannabis product label. Extract ALL visible text and return ONLY a JSON object (null for fields not visible):

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
  "netWeight": "3.5g",
  "batchNumber": "TY0124",
  "expirationDate": "03/16/2027",
  "ocmLicense": "OCM-PROC-24-000119",
  "processorAddress": "18-33 41st Street, Astoria, NY 11105",
  "qrUrl": "https://1a4.com/13U2YPUQ3SBK384FM8SPOQ",
  "terpenes": [],
  "otherCannabinoids": {}
}

Rules: thcPct = the % value (28.50), NOT the mg value. qrUrl = the text URL printed below/beside the QR code. Return ONLY valid JSON — no markdown, no explanation.`
      : `This is a screenshot of a NYS cannabis product lab-test / COA page (app.1a4.com / Metrc). Extract every piece of product data visible and return a single JSON object:

{
  "name": "full product name string",
  "strain": "strain name if separately listed",
  "vendor": "dispensary / retailer name if visible",
  "cultivator": "Manufactured By / grower name",
  "category": "flower | preroll | vape | edible | concentrate | tincture | topical | capsule",
  "thcPct": 28.297,
  "cbdPct": null,
  "otherCannabinoids": { "THCa": 30.552, "CBC": 0.194 },
  "terpenes": ["β-Caryophyllene", "Limonene", "Linalool"],
  "terpeneProfiles": { "β-Caryophyllene": 0.37, "Limonene": 0.32 },
  "batchNumber": "batch or lot ID string",
  "packageTag": "full UID / package tag",
  "netWeight": "weight string",
  "testDate": "date string",
  "labName": "laboratory name",
  "labLicense": "lab license number",
  "labTestStatus": "TestPassed or similar"
}

Return ONLY valid JSON — no markdown fences, no explanation, no extra text.`;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            ...imageParts,
            { text: promptText }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
      })
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(502).json({ success: false, error: geminiData });
    }

    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown fences if Gemini added them
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

    try {
      const data = JSON.parse(cleaned);
      return res.json({ success: true, data });
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const data = JSON.parse(match[0]);
          return res.json({ success: true, data });
        } catch { /* fall through */ }
      }
      return res.json({ success: false, raw });
    }
  }
);
