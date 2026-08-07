// ── Product lookup from NYS licensed dispensary QR codes ────────────────────
//
// NYS uses Metrc (via 1A4 Systems) for track-and-trace.
// QR codes on licensed products link to:
//   https://app.1a4.com/landingpage/{metrc_tag}/{pin}
//
// The API endpoint is: /api/package?tag={tag}&pin={pin}
// This returns 401 without the SPA's auth token, but we attempt the fetch and
// fall back gracefully — the tag itself is the scientific provenance anchor.

const ONE_A4_BASE = "https://app.1a4.com";

// Known URL patterns for NYS dispensary QR systems
const PATTERNS = [
  // 1A4 / Metrc (primary NYS system)
  /app\.1a4\.com\/landingpage\/([A-Za-z0-9]+)\/(\d+)/i,
  // Generic Metrc label lookup (used by some dispensaries directly)
  /1a4\.com\/.*\/([A-Za-z0-9]{20,})/i,
];

/**
 * Parse a QR URL and return { tag, pin, system, valid }
 */
export function parseQRUrl(url) {
  for (const pattern of PATTERNS) {
    const m = url.match(pattern);
    if (m) {
      return { tag: m[1], pin: m[2] ?? null, system: "1a4", valid: true, raw: url };
    }
  }
  // Not a recognized NYS dispensary QR
  return { tag: null, pin: null, system: null, valid: false, raw: url };
}

/**
 * Category normalization from Metrc product types
 */
function normalizeCategory(type = "") {
  const t = type.toLowerCase();
  if (t.includes("flower") || t.includes("bud"))             return "flower";
  if (t.includes("pre-roll") || t.includes("preroll"))        return "preroll";
  if (t.includes("vape") || t.includes("cartridge") || t.includes("pod")) return "vape";
  if (t.includes("edible") || t.includes("gummy") || t.includes("chocolate") || t.includes("beverage")) return "edible";
  if (t.includes("concentrate") || t.includes("wax") || t.includes("shatter") || t.includes("rosin") || t.includes("oil")) return "concentrate";
  if (t.includes("tincture"))                                 return "tincture";
  if (t.includes("topical") || t.includes("cream") || t.includes("lotion")) return "topical";
  if (t.includes("capsule") || t.includes("softgel"))         return "capsule";
  return "flower"; // default
}

/**
 * Parse THC/CBD percentages from strings like "22.50%" or "0.18 %"
 */
function parsePct(v) {
  if (!v) return null;
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}

/**
 * Attempt to fetch via our server-side Cloud Function proxy (avoids CORS).
 */
async function fetch1A4ViaFunction(tag, pin) {
  const base = import.meta.env.VITE_LOOKUP_FUNCTION_URL;
  if (!base) return null;
  try {
    const url = `${base}?tag=${encodeURIComponent(tag)}&pin=${encodeURIComponent(pin ?? "")}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) return mapApiResponse(json.data, tag, pin);
  } catch { /* fall through */ }
  return null;
}

/**
 * Attempt to fetch product data from the 1A4 API.
 * Returns a structured product object on success, partial object on failure.
 */
async function fetch1A4Product(tag, pin) {
  const endpoints = [
    `${ONE_A4_BASE}/api/package?tag=${encodeURIComponent(tag)}&pin=${encodeURIComponent(pin ?? "")}`,
    `${ONE_A4_BASE}/api/v1/package/${encodeURIComponent(tag)}`,
    `${ONE_A4_BASE}/api/landingpage/${encodeURIComponent(tag)}/${encodeURIComponent(pin ?? "")}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        return mapApiResponse(data, tag, pin);
      }
    } catch {
      // CORS, network, or timeout — try next
    }
  }

  return null;
}

/**
 * Map a raw 1A4 API response to our product schema.
 * Field names are guesses based on Metrc API conventions — handle all variants.
 */
function mapApiResponse(data, tag, pin) {
  // 1A4 may return a single object or { data: {...} } wrapper
  const d = data?.data ?? data ?? {};

  const thcRaw = d.THCTotal ?? d.thcTotal ?? d.THC ?? d.thc ?? d["Total THC"] ?? null;
  const cbdRaw = d.CBDTotal ?? d.cbdTotal ?? d.CBD ?? d.cbd ?? d["Total CBD"] ?? null;

  const terpeneRaw = d.TerpeneProfile ?? d.terpenes ?? d.Terpenes ?? [];
  const terpenes = Array.isArray(terpeneRaw)
    ? terpeneRaw.map(t => typeof t === "string" ? t : (t.name ?? t.Name ?? ""))
    : [];

  return {
    name:        d.ProductName ?? d.productName ?? d.Name ?? d.name ?? "",
    strain:      d.StrainName  ?? d.strainName  ?? d.Strain ?? d.strain ?? "",
    vendor:      d.LicensedFacility ?? d.dispensary ?? d.Dispensary ?? d.FacilityName ?? "",
    cultivator:  d.Cultivator ?? d.cultivator ?? d.Grower ?? d.grower ?? "",
    category:    normalizeCategory(d.ProductType ?? d.productType ?? d.Category ?? ""),
    thcPct:      parsePct(thcRaw),
    cbdPct:      parsePct(cbdRaw),
    terpenes,
    batchNumber: d.BatchNumber ?? d.batchNumber ?? d.Batch ?? d.batch ?? "",
    testDate:    d.TestDate ?? d.testDate ?? d.LabTestDate ?? "",
    packageTag:  d.Tag ?? d.tag ?? d.PackageTag ?? tag,
    sourceUrl:   `${ONE_A4_BASE}/landingpage/${tag}/${pin ?? ""}`,
    qrVerified:  true,
    fetchedData: true,
  };
}

/**
 * Main entry point.
 * Given a scanned QR URL, return product data (complete or partial).
 */
export async function lookupProduct(qrUrl) {
  const parsed = parseQRUrl(qrUrl);

  // Not a recognized NYS dispensary QR code
  if (!parsed.valid) {
    return {
      valid: false,
      error: "This QR code is not from a recognized NYS licensed dispensary. Only Metrc-tracked products are accepted.",
      sourceUrl: qrUrl,
      qrVerified: false,
    };
  }

  const { tag, pin } = parsed;

  // Try server-side proxy first (no CORS), then direct client-side fetch
  const proxyData = await fetch1A4ViaFunction(tag, pin);
  if (proxyData) return { valid: true, ...proxyData };

  const clientData = await fetch1A4Product(tag, pin);
  if (clientData) return { valid: true, ...clientData };

  // API fetch failed — return provenance-only; user completes with AI screen-scrape or manual
  return {
    valid: true,
    partial: true,
    packageTag: tag,
    sourceUrl:  qrUrl,
    qrVerified: true,
    fetchedData: false,
    name: "",
    strain: "",
    vendor: "",
    cultivator: "",
    category: "flower",
    thcPct: null,
    cbdPct: null,
    terpenes: [],
    batchNumber: "",
    testDate: "",
  };
}
