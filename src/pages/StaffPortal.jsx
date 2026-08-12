import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { getVendorBySlug } from "../services/vendorService.js";
import { registerStaffMember } from "../services/staffService.js";
import { logActivity } from "../services/activityService.js";
import StaffEduTab from "./StaffEduTab.jsx";
import "./StaffPortal.css";

export default function StaffPortal() {
  const { slug } = useParams();
  const { user, loading: authLoading, signIn } = useAuth();

  const [vendor, setVendor] = useState(null);
  const [vendorError, setVendorError] = useState(false);
  const [staffReady, setStaffReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  /* Load vendor by slug — runs before login so we can show store name in gate */
  useEffect(() => {
    getVendorBySlug(slug)
      .then(v => { if (!v) setVendorError(true); else setVendor(v); })
      .catch(() => setVendorError(true));
  }, [slug]);

  /* Once authenticated AND vendor is loaded, register as staff member */
  useEffect(() => {
    if (!user || !vendor?.id) return;
    setStaffReady(false);
    registerStaffMember(vendor.id, user)
      .then(result => {
        if (result._isNew) {
          logActivity("staff_joined", { storeName: vendor.storeName });
        }
        setStaffReady(true);
      })
      .catch(() => setStaffReady(true));
  }, [user?.id, vendor?.id]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try { await signIn(); } finally { setSigningIn(false); }
  };

  /* ── Loading auth ── */
  if (authLoading) {
    return (
      <div className="sp-loading">
        <span className="sp-loading__spinner">🌿</span>
      </div>
    );
  }

  /* ── Bad invite link ── */
  if (vendorError) {
    return (
      <div className="sp-error">
        <div className="sp-error__card">
          <div className="sp-error__icon">⚠️</div>
          <h2>Invite Link Not Found</h2>
          <p>This staff invite link may be expired or invalid. Ask your store manager for a new one.</p>
        </div>
      </div>
    );
  }

  /* ── Not logged in — show invite gate ── */
  if (!user) {
    return (
      <div className="sp-gate">
        <div className="sp-gate__card">
          <div className="sp-gate__logo">🌿</div>
          <h1 className="sp-gate__brand">Mycana Staff EDU</h1>
          {vendor ? (
            <p className="sp-gate__store">
              You've been invited to join <strong>{vendor.storeName}</strong>'s training program.
            </p>
          ) : (
            <p className="sp-gate__store">Loading store details…</p>
          )}
          <p className="sp-gate__desc">
            Sign in with your Google account to access training modules, earn XP, and work
            toward Mycana Certification.
          </p>
          <button className="sp-gate__btn" onClick={handleSignIn} disabled={signingIn}>
            {signingIn ? "Signing in…" : "🔑 Sign in with Google to Begin"}
          </button>
          <p className="sp-gate__note">
            Your progress is saved to your account. You can return any time from this link.
          </p>
        </div>
      </div>
    );
  }

  /* ── Registering staff / loading vendor ── */
  if (!vendor || !staffReady) {
    return (
      <div className="sp-loading">
        <span className="sp-loading__spinner">🌿</span>
        <p>Setting up your training portal…</p>
      </div>
    );
  }

  /* ── Authenticated staff training portal ── */
  return (
    <div className="sp-wrap">
      <div className="sp-banner">
        <span className="sp-banner__store">{vendor.storeName}</span>
        <span className="sp-banner__badge">Staff Training Portal</span>
      </div>
      <div className="sp-content">
        <StaffEduTab
          vendor={vendor}
          userId={user.id}
          userName={user.name}
          isOwner={false}
        />
      </div>
    </div>
  );
}
