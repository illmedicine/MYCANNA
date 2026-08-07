import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllVendorsAdmin, approveVendor, rejectVendor,
} from "../services/vendorService.js";
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

const TIER_LABELS = { free: "Free", standard: "Standard $49", premium: "Premium $149" };

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

/* ── Vendor Row ────────────────────────────────────────────────────── */
function VendorRow({ vendor, onApprove, onReject, expanded, onToggle }) {
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject]  = useState(false);
  const [busy, setBusy] = useState(false);

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
            <div><strong>Email / Owner</strong><span>{vendor.ownerId}</span></div>
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
            <div className="adm-vendor__actions">
              <button className="btn adm-btn--reject" onClick={() => { setShowReject(true); }} disabled={busy}>
                Revoke Approval
              </button>
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
    try { setVendors(await getAllVendorsAdmin()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (unlocked) load(); }, [unlocked]);

  const handleApprove = async (id) => {
    await approveVendor(id);
    await load();
  };

  const handleReject = async (id, reason) => {
    await rejectVendor(id, reason);
    await load();
  };

  const byStatus = (s) => vendors.filter((v) => v.status === s);
  const tabs = [
    { id: "pending",  label: `Pending (${byStatus("pending_verification").length})` },
    { id: "approved", label: `Approved (${byStatus("approved").length})` },
    { id: "rejected", label: `Rejected (${byStatus("rejected").length})` },
    { id: "all",      label: `All (${vendors.length})` },
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
              expanded={expanded === v.id}
              onToggle={() => setExpanded(expanded === v.id ? null : v.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
