import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllVendorsAdmin, approveVendor, rejectVendor,
  updateVendorTier, addVendorCoOwner, ensureVendorSlug,
  seedExampleStorefronts,
} from "../services/vendorService.js";
import { NY_FARM_CO_PRODUCTS } from "../data/nyFarmCoProducts.js";
import { logActivity } from "../services/activityService.js";
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
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

/* ── Storefront Seed Panel ─────────────────────────────────────────── */
function StorefrontSeedPanel() {
  const [status, setStatus] = useState("idle"); // idle | seeding | done | error
  const [result, setResult] = useState(null);
  const [fbUser, setFbUser]   = useState(() => auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setFbUser(u));
    return unsub;
  }, []);

  const handleSeed = async () => {
    setStatus("seeding");
    try {
      const res = await seedExampleStorefronts(auth.currentUser?.uid, NY_FARM_CO_PRODUCTS);
      setResult(res);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const STORES = [
    {
      slug: "LEAFPLUG",
      name: "Leaf Plug",
      addr: "3341 Sheridan Dr, Amherst NY 14226",
      phone: "(716) 259-9004",
      hours: "Mon–Sun 10 AM–10 PM",
      color: "#38761d",
      url: "https://leafplug.com",
      license: "OCM-RETL-24-000010",
    },
    {
      slug: "MARYJANES",
      name: "Mary Jane's",
      addr: "440 Normal Ave, Buffalo NY 14213",
      phone: "N/A",
      hours: "See Dutchie menu",
      color: "#6d28d9",
      url: "https://dutchie.com/dispensary/mary-janes-a-legacy-to-legal-dispensary",
      license: "NY-166868694",
    },
  ];

  return (
    <div style={{ padding: "0 0 24px" }}>
      <p style={{ fontSize: 13, color: "#7A9A7A", margin: "12px 0 16px" }}>
        Seeds Leaf Plug and Mary Jane's as example retail storefronts carrying all {NY_FARM_CO_PRODUCTS.length} NY Farm Co products.
        Safe to run multiple times — skips stores that already exist.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
        {STORES.map(s => (
          <div key={s.slug} style={{ background: "#0d1f0f", border: `2px solid ${s.color}40`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
              <strong style={{ color: "#e8f5e2", fontSize: 15 }}>{s.name}</strong>
              {result?.[s.slug]?.alreadyExists && <span style={{ fontSize: 11, color: "#10b981", marginLeft: "auto" }}>✓ Exists</span>}
              {result?.[s.slug]?.vendorId && !result[s.slug].alreadyExists && <span style={{ fontSize: 11, color: "#10b981", marginLeft: "auto" }}>✓ Seeded</span>}
            </div>
            <div style={{ fontSize: 12, color: "#7A9A7A", display: "flex", flexDirection: "column", gap: 4 }}>
              <span>📍 {s.addr}</span>
              <span>📞 {s.phone}</span>
              <span>🕐 {s.hours}</span>
              <span>🪪 {s.license}</span>
              <a href={s.url} target="_blank" rel="noreferrer" style={{ color: s.color, fontSize: 11, marginTop: 4 }}>{s.url.replace("https://", "")} ↗</a>
            </div>
            {result?.[s.slug]?.productCount && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#10b981" }}>
                {result[s.slug].productCount} NY Farm Co products added
              </div>
            )}
          </div>
        ))}
      </div>

      {!fbUser && (
        <div style={{ padding: "12px 16px", background: "#1a0d00", border: "1px solid #f59e0b40", borderRadius: 10, marginBottom: 12, fontSize: 13, color: "#f59e0b" }}>
          ⚠️ Firestore writes require a Firebase Auth session. Click <strong>"Sign In"</strong> in the top nav bar (use your admin Google account), then return to this tab and seed.
        </div>
      )}

      {status === "idle" && (
        <button className="btn btn--primary" onClick={handleSeed} disabled={!fbUser} style={!fbUser ? { opacity: .4, cursor: "not-allowed" } : {}}>
          🏪 Seed Example Storefronts
        </button>
      )}
      {status === "seeding" && (
        <button className="btn btn--primary" disabled>
          🌀 Seeding {NY_FARM_CO_PRODUCTS.length} products per store…
        </button>
      )}
      {status === "done" && (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ color: "#10b981", fontWeight: 600 }}>✅ Done</div>
          <a href="/catalog/LEAFPLUG" target="_blank" rel="noreferrer" style={{ color: "#38761d", fontSize: 13 }}>View Leaf Plug catalog ↗</a>
          <a href="/catalog/MARYJANES" target="_blank" rel="noreferrer" style={{ color: "#6d28d9", fontSize: 13 }}>View Mary Jane's catalog ↗</a>
        </div>
      )}
      {status === "error" && (
        <div style={{ color: "#ef4444" }}>❌ Seeding failed — check console for details.</div>
      )}
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
    if (tier !== "free") {
      const v = vendors.find((v) => v.id === id);
      logActivity("vendor_subscribed", {
        storeName: v?.storeName,
        tier,
        city: v?.city,
      });
    }
    await load();
  };

  const byStatus = (s) => vendors.filter((v) => v.status === s);
  const tabs = [
    { id: "pending",  label: `Pending (${byStatus("pending_verification").length})` },
    { id: "approved", label: `Approved (${byStatus("approved").length})` },
    { id: "rejected", label: `Rejected (${byStatus("rejected").length})` },
    { id: "all",      label: `All (${vendors.length})` },
    { id: "pitches",     label: `🎯 Pitch Decks` },
    { id: "storefronts", label: `🏪 Storefronts` },
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
        ) : tab === "storefronts" ? (
          <StorefrontSeedPanel />
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
