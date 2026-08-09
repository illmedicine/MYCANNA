import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllVendorsAdmin, approveVendor, rejectVendor,
  updateVendorTier, bulkAddProducts, addVendorCoOwner, ensureVendorSlug,
} from "../services/vendorService.js";
import { NY_FARM_CO_PRODUCTS } from "../data/nyFarmCoProducts.js";
import { STRAIN_IMAGE_MAP } from "../data/strainImageMap.js";
import { logActivity } from "../services/activityService.js";
import { auth } from "../firebase.js";
import { getVendorProducts, updateProduct, uploadProductImage } from "../services/vendorService.js";
import "./AdminPortal.css";

// Change this PIN in .env.local → VITE_ADMIN_PIN=xxxx
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "0420";

const STATUS_COLORS = {
  pending_verification: "#f59e0b",
  approved:  "#10b981",
  rejected:  "#ef4444",
};

const STATUS_LABELS = {
  pending_verification: "Pending",
  approved:  "Approved",
  rejected:  "Rejected",
};

const TIER_LABELS  = { free: "Free", standard: "Standard $49", premium: "Premium $149" };
const TIER_COLORS  = { free: "#64748b", standard: "#d4a843", premium: "#6d28d9" };

/* ── PIN Gate ──────────────────────────────────────────────────────── */
function PinGate({ onUnlock }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [shake, setShake]   = useState(false);
  const [hint, setHint]     = useState("");
  const inputs = [useRef(), useRef(), useRef(), useRef()];

  const handleKey = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 3) inputs[i + 1].current?.focus();
    if (next.every(Boolean)) {
      const pin = next.join("");
      if (pin === ADMIN_PIN) {
        onUnlock();
      } else {
        setShake(true);
        setHint("Incorrect PIN");
        setTimeout(() => {
          setShake(false);
          setDigits(["", "", "", ""]);
          setHint("");
          inputs[0].current?.focus();
        }, 800);
      }
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs[i - 1].current?.focus();
    }
  };

  return (
    <div className="adm-pin-wrap">
      <div className={`adm-pin-card ${shake ? "adm-pin-card--shake" : ""}`}>
        <div className="adm-pin-icon">🔐</div>
        <h2 className="adm-pin-title">Admin Portal</h2>
        <p className="adm-pin-sub">Enter your 4-digit PIN to continue</p>
        <div className="adm-pin-inputs">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputs[i]}
              className="adm-pin-input"
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              onChange={(e) => handleKey(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>
        {hint && <p className="adm-pin-hint">{hint}</p>}
      </div>
    </div>
  );
}

/* ── Pitch Deck Panel ──────────────────────────────────────────────── */
const PITCH_CARDS = [
  {
    id: "consumer",
    icon: "🧬",
    name: "Cannabis Consumer",
    desc: "Assessment, AI insights, experience logging, prestige system. Shareable with end consumers.",
  },
  {
    id: "storefront",
    icon: "🏪",
    name: "Licensed Dispensary",
    desc: "Vendor dashboard, public catalog, and built-in wholesale ordering. For retail store operators.",
  },
  {
    id: "supplier",
    icon: "📦",
    name: "Wholesale Supplier",
    desc: "Live catalog, real-time order intake, Leaflink replacement pitch. For cultivators like NY Farm Co.",
  },
  {
    id: "platform",
    icon: "⚙️",
    name: "Platform / Admin",
    desc: "Vendor lifecycle, subscription tiers, scientific data layer. For investors and internal use.",
  },
];

function PitchDeckPanel() {
  const [copied, setCopied] = useState(null);
  const base = typeof window !== "undefined" ? window.location.origin : "https://mycana.info";
  const copy = (id) => {
    navigator.clipboard.writeText(`${base}/pitch/${id}`).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  return (
    <div style={{ padding: "0 0 24px" }}>
      <p style={{ fontSize: 13, color: "#7A9A7A", margin: "12px 0 4px" }}>
        Each deck is a standalone shareable page. Send the link to the appropriate audience — no login required.
      </p>
      <div className="adm-pitch-grid">
        {PITCH_CARDS.map((c) => (
          <div key={c.id} className="adm-pitch-card">
            <div className="adm-pitch-card__icon">{c.icon}</div>
            <div className="adm-pitch-card__name">{c.name}</div>
            <div className="adm-pitch-card__desc">{c.desc}</div>
            <div className="adm-pitch-card__url">{base}/pitch/{c.id}</div>
            <div className="adm-pitch-card__actions">
              <button
                className="adm-pitch-card__btn adm-pitch-card__btn--open"
                onClick={() => window.open(`/pitch/${c.id}`, "_blank")}
              >
                Preview ↗
              </button>
              <button
                className={`adm-pitch-card__btn ${copied === c.id ? "adm-pitch-card__btn--copied" : "adm-pitch-card__btn--copy"}`}
                onClick={() => copy(c.id)}
              >
                {copied === c.id ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bulk Import Panel ─────────────────────────────────────────────── */
function BulkImportPanel({ vendors }) {
  const [vendorId, setVendorId] = useState("");
  const [products, setProducts] = useState(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  const approved = vendors.filter(v => v.status === "approved");

  const loadPreset = () => {
    setProducts(NY_FARM_CO_PRODUCTS);
    setDone(null);
    setError("");
  };

  const handleImport = async () => {
    if (!vendorId) { setError("Select a vendor first."); return; }
    if (!products?.length) { setError("No products loaded."); return; }
    setImporting(true);
    setError("");
    try {
      const ids = await bulkAddProducts(vendorId, products);
      setDone(ids.length);
    } catch (e) {
      setError(e.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="adm-import">
      <h3 className="adm-import__title">📦 Bulk Product Import</h3>
      <p className="adm-import__hint">Import a product catalog for an approved vendor. All products are marked featured and tagged for recommendation matching.</p>

      <div className="adm-import__row">
        <div className="adm-import__field">
          <label>Target Vendor</label>
          <select value={vendorId} onChange={e => setVendorId(e.target.value)}>
            <option value="">— select vendor —</option>
            {approved.map(v => (
              <option key={v.id} value={v.id}>{v.storeName}</option>
            ))}
          </select>
        </div>
        <div className="adm-import__field">
          <label>Product Catalog</label>
          <button className="btn btn--outline adm-import__preset-btn" onClick={loadPreset}>
            Load NY Farm Co Menu (144 products)
          </button>
        </div>
      </div>

      {products && (
        <div className="adm-import__preview">
          <div className="adm-import__preview-stats">
            {["Flower","Vape","Pre-Roll","Edible"].map(cat => {
              const n = products.filter(p => p.category === cat).length;
              return <span key={cat}><strong>{n}</strong> {cat}</span>;
            })}
            <span><strong>{products.length}</strong> total</span>
          </div>
          <div className="adm-import__preview-list">
            {products.slice(0, 8).map((p, i) => (
              <div key={i} className="adm-import__preview-item">
                <span className="adm-import__preview-cat">{p.category}</span>
                <span>{p.name}</span>
                {p.thcPct && <span className="adm-import__preview-thc">THC {p.thcPct}%</span>}
              </div>
            ))}
            {products.length > 8 && <div className="adm-import__preview-more">…and {products.length - 8} more</div>}
          </div>
        </div>
      )}

      {error && <p className="adm-import__error">{error}</p>}
      {done !== null && <p className="adm-import__success">✓ {done} products imported successfully!</p>}

      <button
        className="btn btn--primary adm-import__submit"
        onClick={handleImport}
        disabled={importing || !products || !vendorId}
      >
        {importing ? `Importing…` : `Import ${products?.length ?? 0} Products`}
      </button>
    </div>
  );
}

/* ── Vendor Row ────────────────────────────────────────────────────── */
function VendorRow({ vendor, onApprove, onReject, onTierChange, onCoOwnerAdded, expanded, onToggle }) {
  const [rejectNote,  setRejectNote]  = useState("");
  const [showReject,  setShowReject]  = useState(false);
  const [busy,        setBusy]        = useState(false);
  const [tierBusy,    setTierBusy]    = useState(false);
  const [coEmail,     setCoEmail]     = useState("");
  const [coOwners,    setCoOwners]    = useState(vendor.ownerEmails ?? []);
  const [coSaving,    setCoSaving]    = useState(false);
  const [coSaved,     setCoSaved]     = useState(false);

  const handleAddCoOwner = async () => {
    const email = coEmail.trim().toLowerCase();
    if (!email || coOwners.includes(email)) return;
    setCoSaving(true);
    try {
      await addVendorCoOwner(vendor.id, email);
      const updated = [...coOwners, email];
      setCoOwners(updated);
      setCoEmail("");
      setCoSaved(true);
      onCoOwnerAdded?.(vendor.id, updated);
      setTimeout(() => setCoSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setCoSaving(false); }
  };

  const handleApprove = async () => {
    setBusy(true);
    await onApprove(vendor.id);
    setBusy(false);
  };

  const handleReject = async () => {
    setBusy(true);
    await onReject(vendor.id, rejectNote);
    setBusy(false);
    setShowReject(false);
  };

  const handleTier = async (tier) => {
    setTierBusy(true);
    await onTierChange(vendor.id, tier);
    setTierBusy(false);
  };

  const ts = vendor.createdAt?.toDate?.()?.toLocaleDateString() ?? "—";

  return (
    <div className={`adm-vendor ${expanded ? "adm-vendor--open" : ""}`}>
      <div className="adm-vendor__row" onClick={onToggle}>
        <span
          className="adm-vendor__status-dot"
          style={{ background: STATUS_COLORS[vendor.status] }}
          title={STATUS_LABELS[vendor.status]}
        />
        <div className="adm-vendor__main">
          <span className="adm-vendor__name">{vendor.storeName}</span>
          <span className="adm-vendor__meta">{vendor.city}, NY · {vendor.licenseNumber}</span>
        </div>
        <span className="adm-vendor__tier">{TIER_LABELS[vendor.tier] || vendor.tier}</span>
        <span className="adm-vendor__date">{ts}</span>
        <span className="adm-vendor__chevron">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="adm-vendor__detail">
          <div className="adm-detail-grid">
            <div><strong>Address</strong><span>{vendor.address}, {vendor.city}, NY {vendor.zip}</span></div>
            <div><strong>Phone</strong><span>{vendor.phone || "—"}</span></div>
            <div><strong>Owner UID</strong><span>{vendor.ownerId}</span></div>
            <div><strong>License</strong><span>{vendor.licenseNumber} · {vendor.licenseType?.replace("_", " ")}</span></div>
            <div><strong>Website</strong><span>{vendor.website || "—"}</span></div>
            <div><strong>Region</strong><span>{vendor.region}</span></div>
            {vendor.description && (
              <div className="adm-detail-grid__full"><strong>Description</strong><span>{vendor.description}</span></div>
            )}
            {vendor.rejectionReason && (
              <div className="adm-detail-grid__full"><strong>Rejection Reason</strong><span>{vendor.rejectionReason}</span></div>
            )}
          </div>

          {/* Co-owner management */}
          <div className="adm-coowner">
            <div className="adm-coowner__hd">👥 Store Managers / Co-Owners</div>
            <div className="adm-coowner__list">
              {coOwners.length === 0
                ? <span className="adm-coowner__empty">No co-owners set</span>
                : coOwners.map(e => <span key={e} className="adm-coowner__tag">{e}</span>)
              }
            </div>
            <div className="adm-coowner__add">
              <input
                type="email"
                placeholder="Add co-owner email…"
                value={coEmail}
                onChange={e => setCoEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddCoOwner()}
              />
              <button
                className="btn btn--sm adm-btn--approve"
                onClick={handleAddCoOwner}
                disabled={coSaving || !coEmail.trim()}
              >
                {coSaving ? "…" : coSaved ? "✓ Added" : "Add"}
              </button>
            </div>
          </div>

          {vendor.status === "pending_verification" && (
            <div className="adm-vendor__actions">
              {!showReject ? (
                <>
                  <button className="btn adm-btn--approve" onClick={handleApprove} disabled={busy}>
                    {busy ? "…" : "✓ Approve"}
                  </button>
                  <button className="btn adm-btn--reject" onClick={() => setShowReject(true)} disabled={busy}>
                    ✕ Reject
                  </button>
                </>
              ) : (
                <div className="adm-reject-form">
                  <textarea
                    placeholder="Optional: reason for rejection (sent to vendor)"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    rows={2}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn adm-btn--reject" onClick={handleReject} disabled={busy}>
                      {busy ? "…" : "Confirm Reject"}
                    </button>
                    <button className="btn btn--outline" onClick={() => setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {vendor.status === "approved" && (
            <div className="adm-vendor__actions" style={{ flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: ".78rem", color: "var(--c-text-muted)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>Subscription Tier:</span>
                {["free", "standard", "premium"].map(t => (
                  <button
                    key={t}
                    className="btn btn--sm"
                    style={{
                      background: vendor.tier === t ? TIER_COLORS[t] : "transparent",
                      color: vendor.tier === t ? "#fff" : TIER_COLORS[t],
                      border: `1px solid ${TIER_COLORS[t]}`,
                      opacity: tierBusy ? 0.5 : 1,
                    }}
                    disabled={tierBusy || vendor.tier === t}
                    onClick={() => handleTier(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn adm-btn--reject" onClick={() => setShowReject(true)} disabled={busy}>
                  Revoke Approval
                </button>
              </div>
              {showReject && (
                <div className="adm-reject-form">
                  <textarea
                    placeholder="Reason for revocation"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    rows={2}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn adm-btn--reject" onClick={handleReject} disabled={busy}>
                      {busy ? "…" : "Confirm Revoke"}
                    </button>
                    <button className="btn btn--outline" onClick={() => setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Page ───────────────────────────────────────────────── */
export default function AdminPortal() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [vendors,  setVendors]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [tab,      setTab]      = useState("pending");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const all = await getAllVendorsAdmin();
      setVendors(all);
      // Silently backfill catalogSlug for any vendor missing it
      all.forEach(v => {
        if (!v.catalogSlug && v.storeName) {
          ensureVendorSlug(v.id, v.storeName).catch(console.error);
        }
      });
    }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (unlocked) load(); }, [unlocked]);

  const handleApprove = async (id) => {
    await approveVendor(id);
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
      logActivity("vendor_approved", {
        storeName: vendor.storeName || null,
        city: vendor.city || null,
      });
    }
    await load();
  };

  const handleReject = async (id, reason) => {
    await rejectVendor(id, reason);
    await load();
  };

  const handleTierChange = async (id, tier) => {
    await updateVendorTier(id, tier);
    await load();
  };

  const byStatus = (s) => vendors.filter((v) => v.status === s);
  const tabs = [
    { id: "pending",  label: `Pending (${byStatus("pending_verification").length})` },
    { id: "approved", label: `Approved (${byStatus("approved").length})` },
    { id: "rejected", label: `Rejected (${byStatus("rejected").length})` },
    { id: "all",      label: `All (${vendors.length})` },
    { id: "import",   label: `Import Products` },
    { id: "pitches",  label: `🎯 Pitch Decks` },
  ];
  const statusMap = { pending: "pending_verification", approved: "approved", rejected: "rejected", all: null };
  const shown = tab === "all" ? vendors : vendors.filter((v) => v.status === statusMap[tab]);

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="adm-wrap">
      <div className="adm-header">
        <div className="adm-header__inner">
          <div>
            <div className="adm-header__title">🌿 Mycana Admin</div>
            <div className="adm-header__sub">Store Application Management</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn--sm btn--outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }} onClick={load}>
              ↺ Refresh
            </button>
            <button className="btn btn--sm btn--outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }} onClick={() => navigate("/")}>
              ← Home
            </button>
          </div>
        </div>

        <div className="adm-stats">
          {[
            { label: "Pending Review", n: byStatus("pending_verification").length, color: "#f59e0b" },
            { label: "Approved",       n: byStatus("approved").length,             color: "#10b981" },
            { label: "Rejected",       n: byStatus("rejected").length,             color: "#ef4444" },
            { label: "Total",          n: vendors.length,                          color: "#94a3b8" },
          ].map((s) => (
            <div key={s.label} className="adm-stat">
              <span className="adm-stat__n" style={{ color: s.color }}>{s.n}</span>
              <span className="adm-stat__l">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-body">
        <div className="adm-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`adm-tab ${tab === t.id ? "adm-tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "pitches" ? (
          <PitchDeckPanel />
        ) : tab === "import" ? (
          <BulkImportPanel vendors={vendors} />
        ) : (
          <>
            {loading && <div className="app-loading" style={{ minHeight: 200 }}>🌿</div>}

            {!loading && shown.length === 0 && (
              <div className="adm-empty">No applications in this category.</div>
            )}

            <div className="adm-vendor-list">
              {shown.map((v) => (
                <VendorRow
                  key={v.id}
                  vendor={v}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onTierChange={handleTierChange}
                  onCoOwnerAdded={(id, emails) => setVendors(vs => vs.map(x => x.id === id ? { ...x, ownerEmails: emails } : x))}
                  expanded={expanded === v.id}
                  onToggle={() => setExpanded(expanded === v.id ? null : v.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
