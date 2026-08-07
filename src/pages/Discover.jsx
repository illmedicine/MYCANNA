import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { getApprovedVendors } from "../services/vendorService.js";

function profileMatchScore(userProfile, vendor) {
  if (!userProfile || !vendor.profileTags) return null;
  const tags = vendor.profileTags || [];
  let score = 60; // baseline
  if (userProfile.effect > 60 && tags.includes("energizing")) score += 15;
  if (userProfile.effect < 40 && tags.includes("relaxing"))   score += 15;
  if (userProfile.anxiety < 40 && tags.includes("high_cbd"))  score += 10;
  if (userProfile.purpose > 60 && tags.includes("medical"))   score += 10;
  if (vendor.tier === "premium")  score += 5;
  if (vendor.tier === "standard") score += 2;
  return Math.min(score, 99);
}

function MatchBadge({ score }) {
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#94a3b8";
  return (
    <span className="match-badge" style={{ background: color }}>
      {score}% match
    </span>
  );
}

function VendorCard({ vendor, userProfile }) {
  const score = profileMatchScore(userProfile, vendor);
  const tierLabel = { free: "", standard: "⭐ Standard", premium: "⭐⭐ Premium" }[vendor.tier] || "";

  return (
    <div className={`vendor-card vendor-card--${vendor.tier}`}>
      {tierLabel && <div className="vendor-card__tier">{tierLabel}</div>}
      {score && <MatchBadge score={score} />}
      <div className="vendor-card__body">
        <h3 className="vendor-card__name">{vendor.storeName}</h3>
        <p className="vendor-card__address">📍 {vendor.address}, {vendor.city}, NY {vendor.zip}</p>
        {vendor.phone && <p className="vendor-card__phone">📞 {vendor.phone}</p>}
        {vendor.description && <p className="vendor-card__desc">{vendor.description}</p>}
        <div className="vendor-card__tags">
          {(vendor.profileTags || []).map((t) => (
            <span key={t} className="vendor-tag">{t.replace("_", " ")}</span>
          ))}
        </div>
      </div>
      <div className="vendor-card__footer">
        {vendor.website && (
          <a href={vendor.website} target="_blank" rel="noreferrer" className="btn btn--sm btn--outline">
            Visit Site ↗
          </a>
        )}
        <span className="vendor-card__type">
          {{ adult_use: "🏪 Adult Use", medical: "🏥 Medical", delivery: "🚚 Delivery", cultivator: "🌿 Cultivator" }[vendor.licenseType] || "🏪 Dispensary"}
        </span>
      </div>
    </div>
  );
}

export default function Discover() {
  const { user, savedProfile } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getApprovedVendors()
      .then(setVendors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = vendors
    .filter((v) => filter === "all" || v.licenseType === filter)
    .filter((v) =>
      !search ||
      v.storeName?.toLowerCase().includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const sa = profileMatchScore(savedProfile, a) || 0;
      const sb = profileMatchScore(savedProfile, b) || 0;
      return sb - sa;
    });

  return (
    <div className="discover">
      <div className="discover__hero">
        <div className="discover__hero-bg" />
        <div className="container">
          <span className="eyebrow eyebrow--gold">Western New York</span>
          <h1 className="discover__title">Find Your Match</h1>
          <p className="discover__sub">
            {savedProfile
              ? "Dispensaries ranked by how well their products match your personal cannabis profile."
              : "Sign in and complete your profile to see personalized match scores."}
          </p>
          <div className="discover__search-bar">
            <span className="discover__search-icon">🔍</span>
            <input
              className="discover__search-input"
              placeholder="Search by store name or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container discover__body">
        <div className="discover__filters">
          {[
            { id: "all", label: "All" },
            { id: "adult_use", label: "🏪 Adult Use" },
            { id: "medical", label: "🏥 Medical" },
            { id: "delivery", label: "🚚 Delivery" },
          ].map((f) => (
            <button
              key={f.id}
              className={`discover__filter-btn ${filter === f.id ? "discover__filter-btn--active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <div className="discover__filter-spacer" />
          <button className="btn btn--sm btn--outline" onClick={() => navigate("/vendor/register")}>
            + List Your Store
          </button>
        </div>

        {loading && <div className="app-loading" style={{ minHeight: 200 }}>🌿</div>}

        {!loading && filtered.length === 0 && (
          <div className="discover__empty">
            <div className="discover__empty-icon">🗺️</div>
            <h3>No vendors listed yet in WNY</h3>
            <p>Be the first dispensary on Mycana in Western New York.</p>
            <button className="btn btn--primary" onClick={() => navigate("/vendor/register")}>
              List Your Dispensary
            </button>
          </div>
        )}

        <div className="vendor-grid">
          {filtered.map((v) => (
            <VendorCard key={v.id} vendor={v} userProfile={savedProfile} />
          ))}
        </div>

        {!savedProfile && user && (
          <div className="discover__profile-cta">
            <span>🎯</span>
            <div>
              <strong>Complete your profile</strong> to see personalized match scores for every dispensary.
            </div>
            <button className="btn btn--sm btn--primary" onClick={() => navigate("/assessment")}>
              Start Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
