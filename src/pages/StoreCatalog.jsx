import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import QRCode from "qrcode";
import { getCatalogDataBySlug, placeWholesaleOrder } from "../services/catalogService.js";
import { STRAIN_IMAGE_MAP } from "../data/strainImageMap.js";
import "./StoreCatalog.css";

function productImg(product) {
  if (product.imageUrl) return product.imageUrl;
  const file = STRAIN_IMAGE_MAP[product.name];
  return file ? `/product-images/${file}` : null;
}

const CATEGORY_EMOJI = {
  Flower: "🌿", "Pre-Roll": "🚬", Edible: "🍫", Concentrate: "💎",
  Vape: "💨", Tincture: "🧪", Topical: "🧴", Capsule: "💊",
  Beverage: "🥤", Accessory: "🔧", Other: "📦",
};

function darken(hex, amt = 30) {
  if (!hex || !hex.startsWith("#")) return "#065f46";
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amt);
  const g = Math.max(0, ((num >> 8) & 0xff) - amt);
  const b = Math.max(0, (num & 0xff) - amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

/* ── QR Modal ─────────────────────────────────────────────────── */
function QRModal({ url, storeName, themeColor, onClose }) {
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 280, margin: 2,
      color: { dark: darken(themeColor, 60) || "#111", light: "#ffffff" },
    }).then(setQrSrc);
  }, [url, themeColor]);

  return (
    <div className="sc-modal-wrap" onClick={onClose}>
      <div className="sc-modal" onClick={e => e.stopPropagation()}>
        <button className="sc-modal__close" onClick={onClose}>✕</button>
        <div className="sc-modal__title">📲 Scan to View Catalog</div>
        <div className="sc-modal__sub">{storeName}</div>
        {qrSrc && <img src={qrSrc} alt="QR Code" className="sc-qr-img" />}
        <p className="sc-qr-url">{url}</p>
        <a href={qrSrc} download={`${storeName}-catalog-qr.png`} className="sc-btn sc-btn--outline">
          ⬇ Download QR
        </a>
      </div>
    </div>
  );
}

/* ── Order Modal ──────────────────────────────────────────────── */
function OrderModal({ products, vendor, themeColor, onClose }) {
  const [form, setForm] = useState({ name: "", business: "", email: "", phone: "", notes: "" });
  const [cart, setCart] = useState({});
  const [step, setStep] = useState(1); // 1=products, 2=contact, 3=done
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const catalogProducts = products.filter(p => p.inStock !== false);

  const setQty = (id, qty) => setCart(c => {
    if (qty <= 0) { const n = { ...c }; delete n[id]; return n; }
    return { ...c, [id]: qty };
  });

  const cartItems = catalogProducts
    .filter(p => cart[p.id] > 0)
    .map(p => ({ ...p, qty: cart[p.id] }));

  const total = cartItems.reduce((sum, p) => {
    const price = parseFloat(p.wholesalePrice || p.price || 0);
    return sum + price * p.qty;
  }, 0);

  const handleSubmit = async () => {
    if (!form.name || !form.email || cartItems.length === 0) return;
    setSubmitting(true);
    try {
      await placeWholesaleOrder(vendor.id, {
        buyerName: form.name,
        buyerBusiness: form.business,
        buyerEmail: form.email,
        buyerPhone: form.phone,
        notes: form.notes,
        items: cartItems.map(p => ({
          productId: p.id,
          productName: p.name,
          category: p.category,
          qty: p.qty,
          wholesalePrice: parseFloat(p.wholesalePrice || p.price || 0),
        })),
        totalWholesale: total,
      });
      setStep(3);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="sc-modal-wrap" onClick={onClose}>
      <div className="sc-modal sc-modal--order" onClick={e => e.stopPropagation()}>
        <button className="sc-modal__close" onClick={onClose}>✕</button>

        {step === 3 ? (
          <div className="sc-order-done">
            <div className="sc-order-done__icon">✅</div>
            <h2>Order Submitted!</h2>
            <p>Your wholesale inquiry has been sent to <strong>{vendor.storeName}</strong>.</p>
            <p>They'll reach out at <strong>{form.email}</strong> to confirm details.</p>
            <button className="sc-btn" style={{ background: themeColor }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="sc-order-steps">
              {["Select Products", "Your Info"].map((s, i) => (
                <div key={s} className={`sc-order-step ${step === i + 1 ? "sc-order-step--active" : ""} ${step > i + 1 ? "sc-order-step--done" : ""}`}>
                  <span>{step > i + 1 ? "✓" : i + 1}</span> {s}
                </div>
              ))}
            </div>

            {step === 1 && (
              <>
                <h2 className="sc-modal__title">Select Products</h2>
                <div className="sc-order-products">
                  {catalogProducts.map(p => {
                    const wPrice = p.wholesalePrice ? parseFloat(p.wholesalePrice) : null;
                    const rPrice = p.price ? parseFloat(p.price) : null;
                    return (
                      <div key={p.id} className="sc-order-row">
                        <div className="sc-order-row__info">
                          <span className="sc-order-row__cat">{CATEGORY_EMOJI[p.category] || "📦"}</span>
                          <div>
                            <div className="sc-order-row__name">{p.name}</div>
                            <div className="sc-order-row__price">
                              {wPrice != null && <span className="sc-price--wholesale">${wPrice.toFixed(2)} wholesale</span>}
                              {rPrice != null && <span className="sc-price--retail"> · ${rPrice.toFixed(2)} retail</span>}
                            </div>
                          </div>
                        </div>
                        <div className="sc-order-row__qty">
                          <button onClick={() => setQty(p.id, (cart[p.id] || 0) - 1)}>−</button>
                          <span>{cart[p.id] || 0}</span>
                          <button onClick={() => setQty(p.id, (cart[p.id] || 0) + 1)}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {cartItems.length > 0 && (
                  <div className="sc-order-summary">
                    {cartItems.map(p => (
                      <div key={p.id} className="sc-order-summary__row">
                        <span>{p.name} × {p.qty}</span>
                        <span>${(parseFloat(p.wholesalePrice || p.price || 0) * p.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="sc-order-summary__total">
                      <span>Est. Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <div className="sc-order-footer">
                  <span className="sc-order-footer__note">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} selected</span>
                  <button
                    className="sc-btn"
                    style={{ background: cartItems.length ? themeColor : "#94a3b8" }}
                    disabled={!cartItems.length}
                    onClick={() => setStep(2)}
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="sc-modal__title">Your Information</h2>
                <div className="sc-contact-form">
                  <div className="sc-form-row">
                    <div className="sc-form-group">
                      <label>Your Name *</label>
                      <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Smith" />
                    </div>
                    <div className="sc-form-group">
                      <label>Business / Store Name</label>
                      <input value={form.business} onChange={e => set("business", e.target.value)} placeholder="Green Leaf Dispensary" />
                    </div>
                  </div>
                  <div className="sc-form-row">
                    <div className="sc-form-group">
                      <label>Email *</label>
                      <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jane@store.com" />
                    </div>
                    <div className="sc-form-group">
                      <label>Phone</label>
                      <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(716) 555-0100" />
                    </div>
                  </div>
                  <div className="sc-form-group">
                    <label>Notes / Special Requests</label>
                    <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Minimum order quantities, delivery preferences…" />
                  </div>
                </div>
                <div className="sc-order-footer">
                  <button className="sc-btn sc-btn--outline" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="sc-btn"
                    style={{ background: form.name && form.email ? themeColor : "#94a3b8" }}
                    disabled={!form.name || !form.email || submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? "Sending…" : "Submit Order Inquiry"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Public Catalog Page ─────────────────────────────────────── */
export default function StoreCatalog() {
  const { slug } = useParams();
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showQR,     setShowQR]     = useState(false);
  const [showOrder,  setShowOrder]  = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [filter,     setFilter]     = useState("All");

  const catalogUrl = `${window.location.origin}/catalog/${slug}`;

  useEffect(() => {
    getCatalogDataBySlug(slug)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="sc-loading">🌿 Loading catalog…</div>;
  if (!data) {
    return (
      <div className="sc-gate">
        <div className="sc-gate__card">
          <div className="sc-gate__icon">🌿</div>
          <h2>Catalog Not Found</h2>
          <p>This catalog link may have changed or the store is no longer active.</p>
          <Link to="/discover" className="sc-btn" style={{ background: "#3d6b4a" }}>Browse Discover →</Link>
        </div>
      </div>
    );
  }

  const { vendor, products } = data;
  const themeColor = vendor.catalogThemeColor || "#3d6b4a";
  const darkTheme  = darken(themeColor, 40);
  const visibleProducts = products.filter(p => p.inStock !== false);
  const categories = ["All", ...new Set(visibleProducts.map(p => p.category).filter(Boolean))];
  const filtered = filter === "All" ? visibleProducts : visibleProducts.filter(p => p.category === filter);

  const handleCopy = () => {
    navigator.clipboard.writeText(catalogUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="sc-page">
      {/* Banner */}
      <div
        className="sc-hero"
        style={{
          background: vendor.catalogBannerUrl
            ? `linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,.7)), url(${vendor.catalogBannerUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${themeColor} 0%, ${darkTheme} 100%)`,
        }}
      >
        <div className="sc-hero__inner">
          <div className="sc-hero__badge" style={{ background: themeColor }}>Premium Wholesale Catalog</div>
          <h1 className="sc-hero__name">{vendor.storeName}</h1>
          <p className="sc-hero__loc">📍 {vendor.city}, NY · {vendor.licenseType?.replace("_", " ")}</p>
          {vendor.catalogWelcomeText && (
            <p className="sc-hero__welcome">{vendor.catalogWelcomeText}</p>
          )}

          <div className="sc-hero__actions">
            <button className="sc-btn sc-btn--white" onClick={() => setShowOrder(true)}>
              🛒 Place Wholesale Order
            </button>
            <button className="sc-btn sc-btn--ghost" onClick={handleCopy}>
              {copied ? "✓ Copied!" : "🔗 Share Link"}
            </button>
            <button className="sc-btn sc-btn--ghost" onClick={() => setShowQR(true)}>
              📲 QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="sc-filters" style={{ borderBottom: `3px solid ${themeColor}20` }}>
        <div className="sc-filters__inner">
          {categories.map(cat => (
            <button
              key={cat}
              className={`sc-filter-btn ${filter === cat ? "sc-filter-btn--active" : ""}`}
              style={filter === cat ? { background: themeColor, color: "#fff", borderColor: themeColor } : {}}
              onClick={() => setFilter(cat)}
            >
              {cat !== "All" ? `${CATEGORY_EMOJI[cat] || "📦"} ` : ""}{cat}
            </button>
          ))}
          <span className="sc-filters__count">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Product grid */}
      <div className="sc-grid-wrap">
        <div className="sc-product-grid">
          {filtered.length === 0 && (
            <div className="sc-empty">No products in this category yet.</div>
          )}
          {filtered.map(product => {
            const wPrice = product.wholesalePrice ? parseFloat(product.wholesalePrice) : null;
            const rPrice = product.price ? parseFloat(product.price) : null;
            return (
              <div key={product.id} className="sc-product-card">
                {productImg(product)
                  ? <img src={productImg(product)} alt={product.name} className="sc-product-card__img" />
                  : <div className="sc-product-card__no-img" style={{ background: themeColor + "22" }}>
                      {CATEGORY_EMOJI[product.category] || "🌿"}
                    </div>
                }
                <div className="sc-product-card__body">
                  <div className="sc-product-card__cat" style={{ color: themeColor }}>
                    {CATEGORY_EMOJI[product.category] || "📦"} {product.category}
                  </div>
                  <div className="sc-product-card__name">{product.name}</div>
                  <div className="sc-product-card__canna">
                    {product.thcPct !== "" && product.thcPct != null && (
                      <span className="sc-tag sc-tag--thc">THC {product.thcPct}%</span>
                    )}
                    {product.cbdPct !== "" && product.cbdPct != null && (
                      <span className="sc-tag sc-tag--cbd">CBD {product.cbdPct}%</span>
                    )}
                  </div>
                  {product.description && (
                    <p className="sc-product-card__desc">{product.description}</p>
                  )}
                  <div className="sc-product-card__pricing">
                    {wPrice != null && (
                      <div className="sc-product-card__wholesale">
                        <span className="sc-price-lbl">Wholesale</span>
                        <span className="sc-price-val sc-price-val--w" style={{ color: themeColor }}>${wPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {rPrice != null && (
                      <div className="sc-product-card__retail">
                        <span className="sc-price-lbl">Retail</span>
                        <span className="sc-price-val">${rPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {product.stockCount != null && product.stockCount !== "" && (
                      <div className="sc-product-card__stock">{product.stockCount} units avail.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="sc-footer-cta" style={{ background: `linear-gradient(135deg, ${themeColor}, ${darkTheme})` }}>
        <p>Ready to place a wholesale order?</p>
        <button className="sc-btn sc-btn--white" onClick={() => setShowOrder(true)}>
          🛒 Place Order
        </button>
      </div>

      <div className="sc-footer-attr">
        <span>Powered by</span>
        <Link to="/">Mycana</Link>
      </div>

      {showQR  && <QRModal    url={catalogUrl} storeName={vendor.storeName} themeColor={themeColor} onClose={() => setShowQR(false)} />}
      {showOrder && <OrderModal products={products} vendor={vendor} themeColor={themeColor} onClose={() => setShowOrder(false)} />}
    </div>
  );
}
