import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { getApprovedVendors, getAllProducts } from "../services/vendorService.js";
import { STRAIN_IMAGE_MAP } from "../data/strainImageMap.js";

function productImage(product) {
  if (product.imageUrl) return product.imageUrl;
  const file = STRAIN_IMAGE_MAP[product.name];
  return file ? `/product-images/${file}` : null;
}

/* ── Terpene data ──────────────────────────────────────────────────── */
const EARTHY_TERPENES = ["Myrcene", "Caryophyllene", "Humulene", "Bisabolol"];
const CITRUS_TERPENES = ["Limonene", "Valencene", "Ocimene", "Terpinolene"];
const CALM_TERPENES   = ["Linalool", "Myrcene", "Bisabolol"];

const TERPENE_INFO = {
  Myrcene:       "Earthy, musky · Relaxing and sedating",
  Limonene:      "Citrusy, bright · Mood-lifting and stress relief",
  Caryophyllene: "Peppery, spicy · May reduce inflammation",
  Linalool:      "Floral, lavender · Calming and anti-anxiety",
  Pinene:        "Fresh pine · Alertness, may offset THC memory effects",
  Terpinolene:   "Floral, herbal · Uplifting, common in sativas",
  Ocimene:       "Sweet, herbaceous · Uplifting and energetic",
  Bisabolol:     "Delicate floral · Calming and skin-soothing",
  Humulene:      "Earthy, hoppy · May curb appetite, reduce inflammation",
  Valencene:     "Sweet citrus · Mood-enhancing and uplifting",
};

/* ── Match scoring ─────────────────────────────────────────────────── */
function scoreProductMatch(userProfile, product) {
  if (!userProfile) return null;
  let earned = 0, possible = 0;

  if (product.effectDirection) {
    possible += 25;
    const e = userProfile.effect ?? 50;
    if      (e < 35 && product.effectDirection === "Indica")  earned += 25;
    else if (e > 65 && product.effectDirection === "Sativa")  earned += 25;
    else if (e >= 35 && e <= 65 && product.effectDirection === "Hybrid") earned += 25;
    else if (product.effectDirection === "Hybrid")            earned += 12;
  }
  if (product.experienceSuitability) {
    possible += 20;
    const ex = userProfile.experience ?? 50;
    if      (ex < 35 && product.experienceSuitability === "Beginner")    earned += 20;
    else if (ex > 65 && product.experienceSuitability === "Experienced") earned += 20;
    else if (product.experienceSuitability === "All")                    earned += 15;
    else if (ex >= 35 && ex <= 65 && product.experienceSuitability !== "Experienced") earned += 10;
  }
  if (product.purposeTags) {
    possible += 15;
    const p = userProfile.purpose ?? 50;
    if      (p > 65 && product.purposeTags === "Therapeutic")  earned += 15;
    else if (p < 35 && product.purposeTags === "Recreational") earned += 15;
    else if (product.purposeTags === "Both")                   earned += 10;
  }
  if (product.socialContext) {
    possible += 10;
    const c = userProfile.context ?? 50;
    if      (c < 35 && product.socialContext === "Solo")   earned += 10;
    else if (c > 65 && product.socialContext === "Social") earned += 10;
    else if (product.socialContext === "Both")             earned += 7;
  }
  if (product.anxietySafe !== undefined && product.anxietySafe !== null) {
    possible += 10;
    const a = userProfile.anxiety ?? 50;
    if (a < 40 && product.anxietySafe) earned += 10;
    else if (a >= 40) earned += 6;
  }
  if (product.primaryTerpenes?.length > 0) {
    possible += 20;
    const t = userProfile.terpene ?? 50;
    const a = userProfile.anxiety ?? 50;
    let pts = 0;
    for (const terp of product.primaryTerpenes) {
      if (t < 40 && EARTHY_TERPENES.includes(terp)) pts += 5;
      if (t > 60 && CITRUS_TERPENES.includes(terp)) pts += 5;
      if (a < 40 && CALM_TERPENES.includes(terp))   pts += 4;
    }
    earned += Math.min(pts, 20);
  }
  if (possible === 0) return null;
  return Math.round((earned / possible) * 100);
}

function generateInsights(userProfile, product) {
  if (!userProfile) return null;
  const insights = [], cautions = [];
  const { effect = 50, thc_sensitivity = 50, anxiety = 50, experience = 50, purpose = 50, terpene = 50 } = userProfile;

  if (product.effectDirection) {
    if      (effect < 35 && product.effectDirection === "Indica")  insights.push("Indica aligns with your relaxation preference");
    else if (effect > 65 && product.effectDirection === "Sativa")  insights.push("Sativa matches your preference for energizing effects");
    else if (product.effectDirection === "Hybrid")                 insights.push("Balanced hybrid suits your middle-ground preference");
    else if (effect < 35 && product.effectDirection === "Sativa")  cautions.push("This Sativa may feel more stimulating than you typically prefer");
    else if (effect > 65 && product.effectDirection === "Indica")  cautions.push("This Indica leans more sedating than your usual preference");
  }
  if (product.thcPct) {
    const thc = parseFloat(product.thcPct);
    if (!isNaN(thc)) {
      if      (thc_sensitivity < 35 && thc > 20)  cautions.push(`${thc}% THC is on the higher side for your sensitivity — start with a micro-dose`);
      else if (thc_sensitivity < 35 && thc <= 15) insights.push(`Low THC (${thc}%) is well-suited to your sensitivity level`);
      else if (thc_sensitivity > 65 && thc >= 22) insights.push(`High THC (${thc}%) aligns with your tolerance`);
    }
  }
  if (product.anxietySafe !== undefined) {
    if      (anxiety < 35 && product.anxietySafe)  insights.push("Anxiety-safe profile — well matched to your comfort level");
    else if (anxiety < 35 && !product.anxietySafe) cautions.push("Not optimized for anxiety-prone users — consider a gentler option");
  }
  if (product.experienceSuitability) {
    if      (experience < 35 && product.experienceSuitability === "Beginner")    insights.push("Beginner-friendly — matches your experience level");
    else if (experience < 35 && product.experienceSuitability === "Experienced") cautions.push("Labeled for experienced users — consider a more beginner-friendly option");
  }
  if (product.primaryTerpenes?.length > 0) {
    const calming = product.primaryTerpenes.filter(t => CALM_TERPENES.includes(t));
    if (anxiety < 40 && calming.length > 0) insights.push(`${calming.join(", ")} terpenes may help ease anxiety`);
    const citrus = product.primaryTerpenes.filter(t => CITRUS_TERPENES.includes(t));
    const earthy = product.primaryTerpenes.filter(t => EARTHY_TERPENES.includes(t));
    if (terpene > 60 && citrus.length > 0)  insights.push(`${citrus[0]} adds the citrusy brightness you tend to prefer`);
    else if (terpene < 40 && earthy.length > 0) insights.push(`${earthy[0]} provides the earthy, grounding quality you prefer`);
  }
  if (product.purposeTags) {
    if      (purpose > 65 && product.purposeTags === "Therapeutic")  insights.push("Therapeutic focus aligns with your wellness goals");
    else if (purpose < 35 && product.purposeTags === "Recreational") insights.push("Recreational profile matches how you use cannabis");
  }
  return { insights, cautions };
}

/* ── Constants ─────────────────────────────────────────────────────── */
const CAT_ICON = {
  Flower: "🌿", flower: "🌿",
  "Pre-Roll": "🚬", preroll: "🚬",
  Edible: "🍫", edible: "🍫",
  Concentrate: "💎", concentrate: "💎",
  Vape: "💨", vape: "💨",
  Tincture: "🧪", tincture: "🧪",
  Topical: "🧴", topical: "🧴",
  Capsule: "💊", capsule: "💊",
  Beverage: "🥤", beverage: "🥤",
};

const CATEGORIES = ["All", "Flower", "Pre-Roll", "Edible", "Vape", "Concentrate", "Tincture", "Topical"];

function matchColor(score) {
  return score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#94a3b8";
}

/* ── Product Card ──────────────────────────────────────────────────── */
function ProductCard({ product, score, vendorName, onClick }) {
  const imgSrc = productImage(product);
  return (
    <button className="disc-product-card" onClick={onClick}>
      <div className="disc-product-card__media">
        {imgSrc
          ? <img src={imgSrc} alt={product.name} className="disc-product-card__img" />
          : <div className="disc-product-card__icon">{CAT_ICON[product.category] || "🌿"}</div>
        }
        {score !== null && (
          <span className="disc-product-card__match" style={{ background: matchColor(score) }}>
            {score}% match
          </span>
        )}
        {product.thcPct != null && (
          <span className="disc-product-card__thc-badge">THC {product.thcPct}{product.thcUnit || "%"}</span>
        )}
        {!product.inStock && <span className="disc-product-card__oos">Out of Stock</span>}
      </div>

      <div className="disc-product-card__body">
        <div className="disc-product-card__cat">{product.category}</div>
        <div className="disc-product-card__name">{product.name}</div>
        {product.brand && (
          <div className="disc-product-card__brand">{product.brand}</div>
        )}

        <div className="disc-product-card__stats">
          {product.thcPct != null ? <span className="disc-stat disc-stat--thc">THC {product.thcPct}{product.thcUnit || "%"}</span> : null}
          {product.cbdPct && parseFloat(product.cbdPct) > 0
            ? <span className="disc-stat disc-stat--cbd">CBD {product.cbdPct}%</span> : null}
          {product.price  ? <span className="disc-stat">${parseFloat(product.price).toFixed(0)}</span> : null}
        </div>

        {product.effectDirection && (
          <span className="disc-product-card__effect">
            {{ Indica: "🌙 Indica", Hybrid: "⚖️ Hybrid", Sativa: "☀️ Sativa" }[product.effectDirection]}
          </span>
        )}

        {product.primaryTerpenes?.length > 0 && (
          <div className="disc-product-card__terpenes">
            {product.primaryTerpenes.slice(0, 3).map(t => (
              <span key={t} className="disc-terpene">{t}</span>
            ))}
          </div>
        )}

        {vendorName && (
          <div className="disc-product-card__vendor">
            📍 {vendorName}
            {product._vendor?.tier === "premium" && (
              <span className="disc-premium-badge">★ Premium</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

/* ── Product Detail Modal ──────────────────────────────────────────── */
function ProductDetailModal({ product, vendor, userProfile, score, onClose, onLog }) {
  const insights = generateInsights(userProfile, product);
  const insightList = insights?.insights || [];
  const cautionList = insights?.cautions || [];

  return (
    <div className="pdm-wrap" onClick={onClose}>
      <div className="pdm" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pdm__hero">
          {(() => { const s = productImage(product); return s
            ? <img src={s} alt={product.name} className="pdm__img" />
            : <div className="pdm__icon">{CAT_ICON[product.category] || "🌿"}</div>;
          })()}
          <button className="pdm__close" onClick={onClose}>✕</button>
        </div>

        <div className="pdm__body">

          {/* Title row */}
          <div className="pdm__title-row">
            <div>
              <div className="pdm__cat">{product.category}</div>
              <h2 className="pdm__name">{product.name}</h2>
              <div className="pdm__badges">
                {product.effectDirection && (
                  <span className="pdm__badge pdm__badge--effect">
                    {{ Indica: "🌙 Indica", Hybrid: "⚖️ Hybrid", Sativa: "☀️ Sativa" }[product.effectDirection]}
                  </span>
                )}
                {product.anxietySafe && (
                  <span className="pdm__badge pdm__badge--safe">✓ Anxiety-Safe</span>
                )}
                {product.experienceSuitability && (
                  <span className="pdm__badge">{product.experienceSuitability}</span>
                )}
              </div>
            </div>
            {score !== null && (
              <div className="pdm__match-circle" style={{ borderColor: matchColor(score), color: matchColor(score) }}>
                <span className="pdm__match-n">{score}%</span>
                <span className="pdm__match-l">match</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="pdm__stats">
            {product.thcPct != null ? <div className="pdm__stat"><span className="pdm__stat-n">{product.thcPct}{product.thcUnit || "%"}</span><span className="pdm__stat-l">THC</span></div> : null}
            {product.cbdPct && parseFloat(product.cbdPct) > 0
              ? <div className="pdm__stat"><span className="pdm__stat-n">{product.cbdPct}%</span><span className="pdm__stat-l">CBD</span></div> : null}
            {product.price ? <div className="pdm__stat"><span className="pdm__stat-n">${parseFloat(product.price).toFixed(2)}</span><span className="pdm__stat-l">Price</span></div> : null}
            {product.purposeTags ? <div className="pdm__stat"><span className="pdm__stat-n" style={{ fontSize: ".8rem" }}>{product.purposeTags}</span><span className="pdm__stat-l">Purpose</span></div> : null}
          </div>

          {/* Description */}
          {product.description && (
            <p className="pdm__desc">{product.description}</p>
          )}

          {/* Personal AI Insights */}
          {userProfile && score !== null && (insightList.length > 0 || cautionList.length > 0) && (
            <div className="pdm__section">
              <div className="pdm__section-title">🧠 How This May Affect You</div>
              <p className="pdm__section-hint">Based on your cannabis profile and assessment history.</p>
              {insightList.length > 0 && (
                <ul className="pdm__insight-list">
                  {insightList.map((s, i) => (
                    <li key={i} className="pdm__insight pdm__insight--positive">
                      <span className="pdm__insight-dot">✓</span>{s}
                    </li>
                  ))}
                </ul>
              )}
              {cautionList.length > 0 && (
                <ul className="pdm__insight-list" style={{ marginTop: insightList.length ? 8 : 0 }}>
                  {cautionList.map((s, i) => (
                    <li key={i} className="pdm__insight pdm__insight--caution">
                      <span className="pdm__insight-dot">⚠</span>{s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {userProfile && score === null && (
            <div className="pdm__section pdm__no-profile-note">
              Add terpenes, effect direction, and purpose to this product for personalized AI insights.
            </div>
          )}

          {!userProfile && (
            <div className="pdm__section pdm__no-profile-note">
              Complete your cannabis assessment to see how this product may affect you personally.
            </div>
          )}

          {/* Terpene breakdown */}
          {product.primaryTerpenes?.length > 0 && (
            <div className="pdm__section">
              <div className="pdm__section-title">🌿 Terpene Profile</div>
              <div className="pdm__terpene-list">
                {product.primaryTerpenes.map(t => (
                  <div key={t} className="pdm__terpene-row">
                    <span className="pdm__terpene-name">{t}</span>
                    <span className="pdm__terpene-info">{TERPENE_INFO[t] || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Store info */}
          {vendor && (
            <div className="pdm__section">
              <div className="pdm__section-title">🏪 Available At</div>
              <div className="pdm__store-card">
                <div className="pdm__store-name">{vendor.storeName}</div>
                <div className="pdm__store-addr">📍 {vendor.address}, {vendor.city}, NY {vendor.zip}</div>
                {vendor.phone && <div className="pdm__store-detail">📞 {vendor.phone}</div>}
                {vendor.hours && <div className="pdm__store-detail">🕐 {vendor.hours}</div>}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="pdm__store-web">
                    {vendor.website.replace(/^https?:\/\//, "")} ↗
                  </a>
                )}
                {vendor.deliveryEnabled && (
                  <div className="pdm__delivery-badge">
                    🚚 Delivers
                    {vendor.deliveryRadius ? ` within ${vendor.deliveryRadius} miles` : ""}
                    {vendor.deliveryFee ? ` · $${parseFloat(vendor.deliveryFee).toFixed(2)} fee` : ""}
                    {vendor.deliveryMinOrder ? ` · $${parseFloat(vendor.deliveryMinOrder).toFixed(0)} min` : ""}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pdm__actions">
            {onLog && (
              <button className="btn btn--primary" onClick={onLog}>
                📝 Log an Experience
              </button>
            )}
            <button className="btn btn--outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Discover ─────────────────────────────────────────────────── */
export default function Discover() {
  const { user, savedProfile } = useAuth();
  const navigate = useNavigate();

  const [vendors,  setVendors]  = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState("All");
  const [delivery, setDelivery] = useState(false);
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("match"); // match | price | thc
  const [selected, setSelected] = useState(null); // product being viewed

  useEffect(() => {
    Promise.all([
      getApprovedVendors(),
      getAllProducts("WNY").catch(() => []),
    ]).then(([v, p]) => {
      setVendors(v);
      setProducts(p);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const vendorById = Object.fromEntries(vendors.map(v => [v.id, v]));

  // Enrich each product with score + vendor ref
  const enriched = products.map(p => ({
    ...p,
    _vendor: vendorById[p.vendorId] || null,
    _score:  scoreProductMatch(savedProfile, p),
  }));

  // Recommended strip — scored products ≥ 60, sorted best first
  const recommended = savedProfile
    ? enriched
        .filter(p => p._score !== null && p._score >= 60)
        .sort((a, b) => b._score - a._score)
        .slice(0, 10)
    : [];

  // Filtered + sorted main grid
  const filtered = enriched
    .filter(p => category === "All" || p.category === category)
    .filter(p => {
      if (!delivery) return true;
      const v = p._vendor;
      return v && (v.deliveryEnabled === true || v.licenseType === "delivery");
    })
    .filter(p =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p._vendor?.storeName?.toLowerCase().includes(search.toLowerCase()) ||
      p._vendor?.city?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Premium vendors always surface first within the same tier
      const aPremium = a._vendor?.tier === "premium" ? 1 : 0;
      const bPremium = b._vendor?.tier === "premium" ? 1 : 0;
      if (bPremium !== aPremium) return bPremium - aPremium;

      if (sort === "match") {
        const sa = a._score ?? -1, sb = b._score ?? -1;
        return sb - sa;
      }
      if (sort === "price") {
        return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      }
      if (sort === "thc") {
        return (parseFloat(b.thcPct) || 0) - (parseFloat(a.thcPct) || 0);
      }
      return 0;
    });

  const selectedVendor = selected?._vendor || null;
  const selectedScore  = selected?._score  ?? null;

  return (
    <div className="discover">

      {/* Hero */}
      <div className="discover__hero">
        <div className="discover__hero-bg" />
        <div className="container">
          <span className="eyebrow eyebrow--gold">Western New York</span>
          <h1 className="discover__title">Find Your Match</h1>
          <p className="discover__sub">
            {savedProfile
              ? "Products ranked by how well they match your personal cannabis profile."
              : "Sign in and complete your profile to see personalized match scores."}
          </p>
          <div className="discover__search-bar">
            <span className="discover__search-icon">🔍</span>
            <input
              className="discover__search-input"
              placeholder="Search by product name or store…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container discover__body">

        {/* Filter toolbar */}
        <div className="disc-toolbar">
          <div className="disc-cat-tabs">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`disc-cat-tab ${category === c ? "disc-cat-tab--active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c !== "All" && (CAT_ICON[c] + " ")}{c}
              </button>
            ))}
          </div>
          <div className="disc-toolbar__right">
            <button
              className={`disc-delivery-btn ${delivery ? "disc-delivery-btn--on" : ""}`}
              onClick={() => setDelivery(d => !d)}
            >
              🚚 {delivery ? "Delivery On" : "Delivery"}
            </button>
            <select
              className="disc-sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="match">Best Match</option>
              <option value="price">Lowest Price</option>
              <option value="thc">Highest THC</option>
            </select>
          </div>
        </div>

        {/* List My Store CTA */}
        <div className="disc-store-cta">
          <button className="btn btn--sm btn--outline" onClick={() => navigate("/vendor/register")}>
            + List Your Store
          </button>
        </div>

        {loading && <div className="app-loading" style={{ minHeight: 200 }}>🌿</div>}

        {/* Recommended strip */}
        {!loading && recommended.length > 0 && (
          <div className="rec-section">
            <div className="rec-section__hd">
              <span className="rec-section__title">🎯 Recommended for You</span>
              <span className="rec-section__sub">Matched to your cannabis profile</span>
            </div>
            <div className="rec-scroll">
              {recommended.map(p => {
                const recImg = productImage(p);
                return (
                  <button key={p.id} className="rec-card" onClick={() => setSelected(p)}>
                    {recImg
                      ? <img src={recImg} alt={p.name} className="rec-card__img" />
                      : <div className="rec-card__icon">{CAT_ICON[p.category] || "🌿"}</div>
                    }
                    <div className="rec-card__match" style={{ background: matchColor(p._score) }}>
                      {p._score}% match
                    </div>
                    <div className="rec-card__body">
                      <div className="rec-card__cat">{p.category}</div>
                      <div className="rec-card__name">{p.name}</div>
                      <div className="rec-card__meta">
                        {p.thcPct != null ? <span className="vcard-thc">THC {p.thcPct}{p.thcUnit || "%"}</span> : null}
                      </div>
                      {p._vendor && <div className="rec-card__vendor">📍 {p._vendor.storeName}</div>}
                      {p.primaryTerpenes?.length > 0 && (
                        <div className="rec-card__terpenes">
                          {p.primaryTerpenes.slice(0, 2).map(t => (
                            <span key={t} className="rec-terpene">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="discover__empty">
            <div className="discover__empty-icon">🌿</div>
            <h3>{products.length === 0 ? "No products listed yet in WNY" : "No products match your filters"}</h3>
            <p>
              {products.length === 0
                ? "Be the first dispensary on Mycana in Western New York."
                : "Try a different category or clear your filters."}
            </p>
            {products.length === 0 && (
              <button className="btn btn--primary" onClick={() => navigate("/vendor/register")}>
                List Your Dispensary
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="disc-grid-header">
              <span className="disc-grid-count">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="disc-product-grid">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  score={p._score}
                  vendorName={p._vendor?.storeName}
                  onClick={() => setSelected(p)}
                />
              ))}
            </div>
          </>
        )}

        {/* Profile CTA */}
        {!savedProfile && user && (
          <div className="discover__profile-cta">
            <span>🎯</span>
            <div>
              <strong>Complete your profile</strong> to see personalized match scores and AI insights for every product.
            </div>
            <button className="btn btn--sm btn--primary" onClick={() => navigate("/assessment")}>
              Start Assessment
            </button>
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selected && (
        <ProductDetailModal
          product={selected}
          vendor={selectedVendor}
          userProfile={savedProfile}
          score={selectedScore}
          onClose={() => setSelected(null)}
          onLog={user ? () => { setSelected(null); navigate("/log"); } : null}
        />
      )}
    </div>
  );
}
