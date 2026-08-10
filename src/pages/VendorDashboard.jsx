import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import QRCode from "qrcode";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  getVendorsByUser, getVendorProducts, addProduct,
  updateProduct, deleteProduct, uploadProductImage, updateVendorProfile,
  ensureVendorSlug, toVendorSlug,
} from "../services/vendorService.js";
import {
  updateCatalogSettings, uploadCatalogBanner,
  getVendorOrders, updateOrderStatus,
} from "../services/catalogService.js";
import { logActivity } from "../services/activityService.js";
import { STRAIN_IMAGE_MAP } from "../data/strainImageMap.js";
import StaffEduTab from "./StaffEduTab.jsx";
import "./VendorDashboard.css";

function productImage(product) {
  if (product.imageUrl) return product.imageUrl;
  const file = STRAIN_IMAGE_MAP[product.name];
  return file ? `/product-images/${file}` : null;
}

const PRODUCT_LIMIT = { free: 10, standard: Infinity, premium: Infinity };

const CATEGORIES = [
  "Flower", "Pre-Roll", "Edible", "Concentrate", "Vape", "Tincture",
  "Topical", "Capsule", "Beverage", "Accessory", "Other",
];

const TERPENES = [
  "Myrcene", "Limonene", "Caryophyllene", "Linalool", "Pinene",
  "Terpinolene", "Ocimene", "Bisabolol", "Humulene", "Valencene",
];

const TIER_COLORS = { free: "#64748b", standard: "#d4a843", premium: "#6d28d9" };
const TIER_LABELS = { free: "Free Listing", standard: "Standard", premium: "Premium" };

/* ── Image Upload Button ────────────────────────────────────────── */
function ImageUpload({ vendorId, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const { url, path } = await uploadProductImage(vendorId, file);
      onUploaded(url, path);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="vd-img-upload" onClick={() => !uploading && inputRef.current?.click()}>
      {currentUrl
        ? <img src={currentUrl} alt="product" className="vd-img-upload__preview" />
        : <div className="vd-img-upload__placeholder">{uploading ? "Uploading…" : "📷 Add Photo"}</div>
      }
      {currentUrl && !uploading && (
        <div className="vd-img-upload__overlay">Change</div>
      )}
      {uploading && <div className="vd-img-upload__overlay">Uploading…</div>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handle}
      />
    </div>
  );
}

/* ── Product Form Modal ─────────────────────────────────────────── */
function ProductModal({ vendorId, product, onSave, onClose }) {
  const editing = Boolean(product?.id);
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Flower",
    thcPct: product?.thcPct ?? "",
    cbdPct: product?.cbdPct ?? "",
    price: product?.price ?? "",
    description: product?.description || "",
    stockCount: product?.stockCount ?? "",
    inStock: product?.inStock ?? true,
    imageUrl: product?.imageUrl || "",
    imagePath: product?.imagePath || "",
    featured: product?.featured || false,
    // Recommendation matching fields
    effectDirection: product?.effectDirection || "",
    experienceSuitability: product?.experienceSuitability || "",
    purposeTags: product?.purposeTags || "",
    socialContext: product?.socialContext || "",
    anxietySafe: product?.anxietySafe ?? false,
    primaryTerpenes: product?.primaryTerpenes || [],
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Product name is required");
    setSaving(true);
    try {
      await onSave({ ...form, vendorId });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vd-modal-wrap" onClick={onClose}>
      <div className="vd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vd-modal__header">
          <h2>{editing ? "Edit Product" : "Add Product"}</h2>
          <button className="vd-modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="vd-modal__body" onSubmit={handleSubmit}>
          <div className="vd-form-row">
            {/* Image upload */}
            <ImageUpload
              vendorId={vendorId}
              currentUrl={form.imageUrl}
              onUploaded={(url, path) => { set("imageUrl", url); set("imagePath", path); }}
            />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="vd-form-group">
                <label>Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Blue Dream Flower"
                  required
                />
              </div>
              <div className="vd-form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="vd-form-3col">
            <div className="vd-form-group">
              <label>THC %</label>
              <input
                type="number" min="0" max="100" step="0.1"
                value={form.thcPct}
                onChange={(e) => set("thcPct", e.target.value)}
                placeholder="e.g. 22.5"
              />
            </div>
            <div className="vd-form-group">
              <label>CBD %</label>
              <input
                type="number" min="0" max="100" step="0.1"
                value={form.cbdPct}
                onChange={(e) => set("cbdPct", e.target.value)}
                placeholder="e.g. 0.1"
              />
            </div>
            <div className="vd-form-group">
              <label>Price ($)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 45.00"
              />
            </div>
          </div>

          <div className="vd-form-3col">
            <div className="vd-form-group">
              <label>Stock Count</label>
              <input
                type="number" min="0"
                value={form.stockCount}
                onChange={(e) => set("stockCount", e.target.value)}
                placeholder="Units available"
              />
            </div>
            <div className="vd-form-group vd-form-group--check">
              <label>
                <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} />
                In Stock
              </label>
            </div>
            {form.featured !== undefined && (
              <div className="vd-form-group vd-form-group--check">
                <label>
                  <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                  Featured (Premium)
                </label>
              </div>
            )}
          </div>

          <div className="vd-form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Strain lineage, effects, terpene notes…"
              rows={3}
            />
          </div>

          {/* Recommendation matching */}
          <div className="vd-section-divider">🎯 Recommendation Matching</div>
          <p className="vd-section-hint">Help Mycana match this product to the right customers based on their personal cannabis profile.</p>

          <div className="vd-form-3col">
            <div className="vd-form-group">
              <label>Effect Direction</label>
              <select value={form.effectDirection} onChange={(e) => set("effectDirection", e.target.value)}>
                <option value="">Not specified</option>
                <option value="Indica">Indica — Relaxing</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Sativa">Sativa — Energizing</option>
              </select>
            </div>
            <div className="vd-form-group">
              <label>Experience Level</label>
              <select value={form.experienceSuitability} onChange={(e) => set("experienceSuitability", e.target.value)}>
                <option value="">Not specified</option>
                <option value="Beginner">Beginner</option>
                <option value="All">All Levels</option>
                <option value="Experienced">Experienced</option>
              </select>
            </div>
            <div className="vd-form-group">
              <label>Purpose</label>
              <select value={form.purposeTags} onChange={(e) => set("purposeTags", e.target.value)}>
                <option value="">Not specified</option>
                <option value="Recreational">Recreational</option>
                <option value="Therapeutic">Therapeutic</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div className="vd-form-2col">
            <div className="vd-form-group">
              <label>Social Context</label>
              <select value={form.socialContext} onChange={(e) => set("socialContext", e.target.value)}>
                <option value="">Not specified</option>
                <option value="Solo">Solo / Private</option>
                <option value="Social">Social / Active</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="vd-form-group vd-form-group--check" style={{ alignSelf: "flex-end", paddingBottom: 4 }}>
              <label>
                <input type="checkbox" checked={form.anxietySafe} onChange={(e) => set("anxietySafe", e.target.checked)} />
                Anxiety-Safe Profile
              </label>
            </div>
          </div>

          <div className="vd-form-group">
            <label>Primary Terpenes <span style={{ color: "var(--c-text-muted)", fontWeight: 400 }}>(select all that apply)</span></label>
            <div className="vd-terpene-grid">
              {TERPENES.map((t) => (
                <label key={t} className={`vd-terpene-check ${form.primaryTerpenes.includes(t) ? "vd-terpene-check--on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={form.primaryTerpenes.includes(t)}
                    onChange={(e) =>
                      set("primaryTerpenes", e.target.checked
                        ? [...form.primaryTerpenes, t]
                        : form.primaryTerpenes.filter((x) => x !== t)
                      )
                    }
                    style={{ display: "none" }}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="vd-modal__footer">
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Product Card ───────────────────────────────────────────────── */
function ProductCard({ product, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const imgSrc = productImage(product);

  return (
    <div className="vd-product-card">
      <div className="vd-product-card__media">
        {imgSrc
          ? <img src={imgSrc} alt={product.name} className="vd-product-card__img" />
          : <div className="vd-product-card__no-img">🌿</div>
        }
        {product.thcPct != null && product.thcPct !== "" && (
          <span className="vd-product-card__thc-badge">
            THC {product.thcPct}{product.thcUnit || "%"}
          </span>
        )}
        {product.featured && <span className="vd-product-card__featured">⭐ Featured</span>}
        {!product.inStock && <span className="vd-product-card__oos">Out of Stock</span>}
      </div>

      <div className="vd-product-card__body">
        <div className="vd-product-card__cat">{product.category}</div>
        <div className="vd-product-card__name">{product.name}</div>
        {product.brand && <div className="vd-product-card__brand">{product.brand}</div>}

        <div className="vd-product-card__stats">
          {product.thcPct != null && product.thcPct !== "" && (
            <span className="vd-stat vd-stat--thc">THC {product.thcPct}{product.thcUnit || "%"}</span>
          )}
          {product.cbdPct !== "" && product.cbdPct !== undefined && (
            <span className="vd-stat vd-stat--cbd">CBD {product.cbdPct}%</span>
          )}
          {product.price && (
            <span className="vd-stat">${parseFloat(product.price).toFixed(2)}</span>
          )}
        </div>

        {product.stockCount !== "" && product.stockCount !== undefined && (
          <div className="vd-product-card__stock">
            {product.stockCount} units
          </div>
        )}

        {product.description && (
          <p className="vd-product-card__desc">{product.description}</p>
        )}
      </div>

      <div className="vd-product-card__actions">
        <button className="btn btn--sm btn--outline" onClick={() => onEdit(product)}>Edit</button>
        {!confirming
          ? <button className="btn btn--sm vd-btn--danger-outline" onClick={() => setConfirming(true)}>Delete</button>
          : (
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn--sm vd-btn--danger" onClick={() => onDelete(product)}>Confirm</button>
              <button className="btn btn--sm btn--outline" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          )
        }
      </div>
    </div>
  );
}

/* ── Store Profile Tab ──────────────────────────────────────────── */
function StoreProfileTab({ vendor, onSaved }) {
  const [form, setForm] = useState({
    description: vendor.description || "",
    phone: vendor.phone || "",
    website: vendor.website || "",
    hours: vendor.hours || "",
    deliveryEnabled: vendor.deliveryEnabled ?? false,
    deliveryRadius: vendor.deliveryRadius ?? "",
    deliveryFee: vendor.deliveryFee ?? "",
    deliveryMinOrder: vendor.deliveryMinOrder ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateVendorProfile(vendor.id, form);
      setSaved(true);
      onSaved({ ...vendor, ...form });
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="vd-profile-tab">
      <div className="vd-profile-header">
        <div className="vd-profile-info">
          <h2>{vendor.storeName}</h2>
          <p>📍 {vendor.address}, {vendor.city}, NY {vendor.zip}</p>
          <p>🏪 License: {vendor.licenseNumber}</p>
        </div>
        <div
          className="vd-tier-badge"
          style={{ background: TIER_COLORS[vendor.tier] + "20", color: TIER_COLORS[vendor.tier], borderColor: TIER_COLORS[vendor.tier] }}
        >
          {TIER_LABELS[vendor.tier]}
        </div>
      </div>

      <div className="vd-form-group" style={{ marginTop: 24 }}>
        <label>Store Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Tell customers what makes your dispensary special…"
          rows={4}
        />
      </div>

      <div className="vd-form-2col">
        <div className="vd-form-group">
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(716) 555-0100" />
        </div>
        <div className="vd-form-group">
          <label>Website</label>
          <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yourstore.com" type="url" />
        </div>
      </div>

      <div className="vd-form-group">
        <label>Hours of Operation</label>
        <input
          value={form.hours}
          onChange={(e) => set("hours", e.target.value)}
          placeholder="e.g. Mon–Sat 10am–8pm, Sun 12pm–6pm"
        />
      </div>

      <div className="vd-section-divider">🚚 Delivery Configuration</div>
      <div className="vd-form-group vd-form-group--check">
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={form.deliveryEnabled} onChange={(e) => set("deliveryEnabled", e.target.checked)} style={{ width: 18, height: 18 }} />
          <span>
            <strong>Offer Delivery</strong>
            <span style={{ display: "block", fontWeight: 400, fontSize: ".82rem", color: "var(--c-text-muted)" }}>
              Your store will appear when customers filter by Delivery on the Discover page
            </span>
          </span>
        </label>
      </div>

      {form.deliveryEnabled && (
        <div className="vd-form-3col">
          <div className="vd-form-group">
            <label>Delivery Radius (miles)</label>
            <input
              type="number" min="1" max="100"
              value={form.deliveryRadius}
              onChange={(e) => set("deliveryRadius", e.target.value)}
              placeholder="e.g. 15"
            />
          </div>
          <div className="vd-form-group">
            <label>Delivery Fee ($)</label>
            <input
              type="number" min="0" step="0.01"
              value={form.deliveryFee}
              onChange={(e) => set("deliveryFee", e.target.value)}
              placeholder="e.g. 5.00"
            />
          </div>
          <div className="vd-form-group">
            <label>Minimum Order ($)</label>
            <input
              type="number" min="0" step="0.01"
              value={form.deliveryMinOrder}
              onChange={(e) => set("deliveryMinOrder", e.target.value)}
              placeholder="e.g. 50.00"
            />
          </div>
        </div>
      )}

      <button className="btn btn--primary" onClick={handleSave} disabled={saving} style={{ marginTop: 8 }}>
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Profile"}
      </button>
    </div>
  );
}

/* ── Catalog Manager Tab ────────────────────────────────────────── */
function CatalogManagerTab({ vendor, products, onVendorUpdate, onProductsUpdate }) {
  const [slug, setSlug] = useState(vendor.catalogSlug || toVendorSlug(vendor.storeName));
  const catalogUrl = `${window.location.origin}/catalog/${slug}`;
  const [settings, setSettings] = useState({
    catalogThemeColor: vendor.catalogThemeColor || "#3d6b4a",
    catalogWelcomeText: vendor.catalogWelcomeText || "",
    catalogBannerUrl: vendor.catalogBannerUrl || "",
    catalogBannerPath: vendor.catalogBannerPath || "",
  });
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [qrSrc,     setQrSrc]     = useState("");
  const [showQR,    setShowQR]    = useState(false);
  const [orders,    setOrders]    = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [wholePrices, setWholePrices] = useState(() =>
    Object.fromEntries(products.map(p => [p.id, p.wholesalePrice ?? ""]))
  );
  const [pricesSaving, setPricesSaving] = useState(false);
  const [pricesSaved,  setPricesSaved]  = useState(false);
  const [imgUploading, setImgUploading] = useState({});
  const bannerRef = useRef();

  useEffect(() => {
    if (!vendor.catalogSlug) {
      ensureVendorSlug(vendor.id, vendor.storeName).then(s => {
        setSlug(s);
        onVendorUpdate({ ...vendor, catalogSlug: s });
      }).catch(console.error);
    }
  }, [vendor.id]);

  useEffect(() => {
    getVendorOrders(vendor.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [vendor.id]);

  useEffect(() => {
    QRCode.toDataURL(catalogUrl, { width: 200, margin: 2 }).then(setQrSrc);
  }, [catalogUrl]);

  const handleProductImgUpload = (productId) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Image must be under 5 MB");
    setImgUploading(s => ({ ...s, [productId]: true }));
    try {
      const { url, path } = await uploadProductImage(vendor.id, file);
      await updateProduct(productId, { imageUrl: url, imagePath: path });
      onProductsUpdate(products.map(p => p.id === productId ? { ...p, imageUrl: url, imagePath: path } : p));
    } catch (err) { console.error(err); alert("Image upload failed."); }
    finally { setImgUploading(s => ({ ...s, [productId]: false })); e.target.value = ""; }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateCatalogSettings(vendor.id, settings);
      onVendorUpdate({ ...vendor, ...settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    const input = e.target;
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Banner must be under 5 MB");
    setUploading(true);
    try {
      const { url, path } = await uploadCatalogBanner(vendor.id, file);
      const next = { ...settings, catalogBannerUrl: url, catalogBannerPath: path };
      setSettings(next);
      await updateCatalogSettings(vendor.id, next);
      onVendorUpdate({ ...vendor, ...next });
    } catch (err) {
      console.error("Banner upload failed:", err);
      alert("Banner upload failed — please try again. If this keeps happening, contact support.");
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const handleSaveWholesalePrices = async () => {
    setPricesSaving(true);
    try {
      await Promise.all(
        products.map(p =>
          updateProduct(p.id, { wholesalePrice: wholePrices[p.id] ?? "" })
        )
      );
      onProductsUpdate(products.map(p => ({ ...p, wholesalePrice: wholePrices[p.id] ?? "" })));
      setPricesSaved(true);
      setTimeout(() => setPricesSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setPricesSaving(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(catalogUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const ORDER_STATUS_COLORS = {
    pending: "#f59e0b", confirmed: "#3b82f6", fulfilled: "#10b981", cancelled: "#ef4444",
  };

  return (
    <div className="catalog-mgr">
      {/* Share / QR row */}
      <div className="catalog-mgr__share">
        <div className="catalog-mgr__share-url">
          <span className="catalog-mgr__share-label">📖 Your Catalog Link</span>
          <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="catalog-mgr__share-link">{catalogUrl}</a>
        </div>
        <div className="catalog-mgr__share-actions">
          <button className="btn btn--sm btn--outline" onClick={handleCopy}>
            {copied ? "✓ Copied!" : "🔗 Copy Link"}
          </button>
          <button className="btn btn--sm btn--outline" onClick={() => setShowQR(o => !o)}>
            📲 {showQR ? "Hide QR" : "Show QR"}
          </button>
          <Link to={`/catalog/${slug}`} target="_blank" className="btn btn--sm btn--primary">
            View Catalog ↗
          </Link>
        </div>
      </div>

      {showQR && qrSrc && (
        <div className="catalog-mgr__qr-panel">
          <img src={qrSrc} alt="QR Code" className="catalog-mgr__qr-img" />
          <div>
            <p className="catalog-mgr__qr-hint">Sales reps can show this to buyers — scanning opens the catalog instantly.</p>
            <a href={qrSrc} download={`${vendor.storeName}-catalog-qr.png`} className="btn btn--sm btn--outline">
              ⬇ Download QR PNG
            </a>
          </div>
        </div>
      )}

      {/* Appearance settings */}
      <div className="catalog-mgr__section">
        <h3 className="catalog-mgr__section-title">🎨 Catalog Appearance</h3>
        <div className="catalog-mgr__appearance">
          <div className="catalog-mgr__field">
            <label>Theme Color</label>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
              <input
                type="color"
                value={settings.catalogThemeColor}
                onChange={e => setSettings(s => ({ ...s, catalogThemeColor: e.target.value }))}
                className="catalog-mgr__color-picker"
              />
              <span style={{ fontSize: ".8rem", color: "var(--c-text-muted)" }}>{settings.catalogThemeColor}</span>
            </div>
          </div>
          <div className="catalog-mgr__field" style={{ flex: 2 }}>
            <label>Welcome Message</label>
            <input
              value={settings.catalogWelcomeText}
              onChange={e => setSettings(s => ({ ...s, catalogWelcomeText: e.target.value }))}
              placeholder="Premium wholesale catalog — contact us for orders & pricing"
            />
          </div>
        </div>

        {/* Banner upload */}
        <div className="catalog-mgr__field" style={{ marginTop: ".75rem" }}>
          <label>Header Banner Image</label>
          <div
            className="catalog-mgr__banner-zone"
            onClick={() => bannerRef.current?.click()}
            style={settings.catalogBannerUrl ? { backgroundImage: `url(${settings.catalogBannerUrl})` } : {}}
          >
            {settings.catalogBannerUrl
              ? <div className="catalog-mgr__banner-overlay">{uploading ? "Uploading…" : "Click to Replace"}</div>
              : <div className="catalog-mgr__banner-placeholder">
                  {uploading ? "Uploading…" : "📷 Click to Upload Banner (Recommended: 1400 × 400 px)"}
                </div>
            }
          </div>
          <input ref={bannerRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerUpload} />
        </div>

        <button className="btn btn--primary" onClick={handleSaveSettings} disabled={saving} style={{ marginTop: ".75rem" }}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Appearance"}
        </button>
      </div>

      {/* Wholesale pricing */}
      <div className="catalog-mgr__section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem" }}>
          <h3 className="catalog-mgr__section-title" style={{ margin: 0 }}>💰 Wholesale Pricing &amp; Availability</h3>
          <button className="btn btn--sm btn--primary" onClick={handleSaveWholesalePrices} disabled={pricesSaving}>
            {pricesSaving ? "Saving…" : pricesSaved ? "✓ Saved!" : "Save Prices"}
          </button>
        </div>
        <p style={{ fontSize: ".8rem", color: "var(--c-text-muted)", margin: "0 0 .75rem" }}>
          Set wholesale prices shown on your catalog. Retail prices from the main product listing remain separate.
        </p>
        <div className="catalog-mgr__price-table">
          <div className="catalog-mgr__price-header">
            <span>Photo</span>
            <span>Product</span>
            <span>Category</span>
            <span>Retail $</span>
            <span>Wholesale $</span>
            <span>Stock</span>
          </div>
          {products.map(p => {
            const imgSrc = p.imageUrl || (STRAIN_IMAGE_MAP[p.name] ? `/product-images/${STRAIN_IMAGE_MAP[p.name]}` : null);
            return (
            <div key={p.id} className="catalog-mgr__price-row">
              <label className="catalog-mgr__price-img-cell" title="Click to upload photo">
                {imgUploading[p.id]
                  ? <span className="catalog-mgr__price-img-loading">⏳</span>
                  : imgSrc
                    ? <img src={imgSrc} alt={p.name} className="catalog-mgr__price-img-thumb" />
                    : <span className="catalog-mgr__price-img-empty">📷</span>
                }
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleProductImgUpload(p.id)} />
              </label>
              <span className="catalog-mgr__price-name">{p.name}</span>
              <span style={{ fontSize: ".78rem", color: "var(--c-text-muted)" }}>{p.category}</span>
              <span style={{ fontSize: ".85rem" }}>{p.price ? `$${parseFloat(p.price).toFixed(2)}` : "—"}</span>
              <input
                type="number" min="0" step="0.01"
                className="catalog-mgr__price-input"
                placeholder="0.00"
                value={wholePrices[p.id] ?? ""}
                onChange={e => setWholePrices(w => ({ ...w, [p.id]: e.target.value }))}
              />
              <span style={{ fontSize: ".78rem", color: "var(--c-text-muted)" }}>
                {p.stockCount != null && p.stockCount !== "" ? `${p.stockCount} u.` : "—"}
              </span>
            </div>
            );
          })}
          {products.length === 0 && (
            <div style={{ padding: "1rem", color: "var(--c-text-muted)", textAlign: "center", fontSize: ".85rem" }}>
              No products yet — add products in the Products tab first.
            </div>
          )}
        </div>
      </div>

      {/* Orders inbox */}
      <div className="catalog-mgr__section">
        <h3 className="catalog-mgr__section-title">📦 Wholesale Order Inbox</h3>
        {loadingOrders ? (
          <div style={{ color: "var(--c-text-muted)", fontSize: ".85rem" }}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="vd-empty" style={{ padding: "2rem" }}>
            <div className="vd-empty__icon">📦</div>
            <h3>No orders yet</h3>
            <p>Share your catalog link or QR code with buyers to start receiving wholesale inquiries.</p>
          </div>
        ) : (
          <div className="catalog-mgr__orders">
            {orders.map(order => (
              <div key={order.id} className="catalog-mgr__order-card">
                <div className="catalog-mgr__order-head">
                  <div>
                    <div className="catalog-mgr__order-buyer">{order.buyerName}
                      {order.buyerBusiness && <span> · {order.buyerBusiness}</span>}
                    </div>
                    <div className="catalog-mgr__order-contact">
                      {order.buyerEmail} {order.buyerPhone && `· ${order.buyerPhone}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                    <span className="catalog-mgr__order-status" style={{ background: ORDER_STATUS_COLORS[order.status] + "22", color: ORDER_STATUS_COLORS[order.status], border: `1px solid ${ORDER_STATUS_COLORS[order.status]}55` }}>
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      onChange={async e => {
                        await updateOrderStatus(order.id, e.target.value);
                        setOrders(os => os.map(o => o.id === order.id ? { ...o, status: e.target.value } : o));
                      }}
                      className="catalog-mgr__order-select"
                    >
                      {["pending","confirmed","fulfilled","cancelled"].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="catalog-mgr__order-items">
                  {order.items?.map((item, i) => (
                    <span key={i} className="catalog-mgr__order-item">
                      {item.productName} × {item.qty}
                      {item.wholesalePrice ? ` · $${(item.wholesalePrice * item.qty).toFixed(2)}` : ""}
                    </span>
                  ))}
                </div>
                {order.totalWholesale > 0 && (
                  <div className="catalog-mgr__order-total">Est. Total: <strong>${order.totalWholesale.toFixed(2)}</strong></div>
                )}
                {order.notes && <div className="catalog-mgr__order-notes">"{order.notes}"</div>}
                <div className="catalog-mgr__order-date">
                  {order.createdAt?.toDate?.()?.toLocaleString() ?? "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Vendor Dashboard ──────────────────────────────────────── */
export default function VendorDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [allVendors, setAllVendors] = useState([]);
  const [vendor,   setVendor]   = useState(null);
  const [products, setProducts] = useState([]);
  const [tab,      setTab]      = useState("products");
  const [fetching, setFetching] = useState(true);
  const [modal,    setModal]    = useState(null); // null | "add" | product object

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      try {
        const vendors = await getVendorsByUser(user.id, user.email);
        // Back-fill catalogSlug for any vendor that doesn't have one
        for (const v of vendors) {
          if (!v.catalogSlug && v.storeName) {
            v.catalogSlug = await ensureVendorSlug(v.id, v.storeName);
          }
        }
        setAllVendors(vendors);
        if (vendors.length > 0) {
          const v = vendors[0];
          setVendor(v);
          if (v?.status === "approved") {
            setProducts(await getVendorProducts(v.id));
          }
        }
      } catch (e) { console.error(e); }
      finally { setFetching(false); }
    })();
  }, [user, loading]);

  const switchStore = async (v) => {
    setVendor(v);
    setProducts([]);
    setTab("products");
    if (v?.status === "approved") {
      setProducts(await getVendorProducts(v.id));
    }
  };

  if (loading || fetching) return <div className="app-loading">🌿</div>;

  if (!user) {
    return (
      <div className="vd-gate">
        <div className="vd-gate__card">
          <div className="vd-gate__icon">🏪</div>
          <h2>Vendor Dashboard</h2>
          <p>Sign in to access your store dashboard.</p>
          <button className="btn btn--primary" onClick={() => navigate("/")}>Sign In</button>
        </div>
      </div>
    );
  }

  if (allVendors.length === 0) {
    return (
      <div className="vd-gate">
        <div className="vd-gate__card">
          <div className="vd-gate__icon">🏪</div>
          <h2>No Store Found</h2>
          <p>You haven't registered a dispensary yet.</p>
          <button className="btn btn--primary" onClick={() => navigate("/vendor/register")}>
            Register Your Store →
          </button>
        </div>
      </div>
    );
  }

  if (vendor.status === "pending_verification") {
    return (
      <div className="vd-gate">
        <div className="vd-gate__card">
          <div className="vd-gate__icon">⏳</div>
          <h2>Application Under Review</h2>
          <p>
            Your application for <strong>{vendor.storeName}</strong> is pending verification.
            We'll review your NY cannabis license and approve your listing within 1–2 business days.
          </p>
          <p className="vd-gate__email">You'll be notified at <strong>{user.email}</strong></p>
          <button className="btn btn--outline" onClick={() => navigate("/discover")}>
            Browse Mycana →
          </button>
        </div>
      </div>
    );
  }

  if (vendor.status === "rejected") {
    return (
      <div className="vd-gate">
        <div className="vd-gate__card">
          <div className="vd-gate__icon">❌</div>
          <h2>Application Not Approved</h2>
          <p>Your application for <strong>{vendor.storeName}</strong> was not approved.</p>
          {vendor.rejectionReason && (
            <p className="vd-gate__reason"><strong>Reason:</strong> {vendor.rejectionReason}</p>
          )}
          <p>Please contact support or re-apply with updated information.</p>
          <button className="btn btn--outline" onClick={() => navigate("/")}>Return Home</button>
        </div>
      </div>
    );
  }

  /* ── Approved vendor ── */
  const limit = PRODUCT_LIMIT[vendor.tier] ?? 10;
  const atLimit = products.length >= limit;

  const handleSaveProduct = async (data) => {
    if (data.id) {
      await updateProduct(data.id, data);
    } else {
      await addProduct(vendor.id, { ...data, region: vendor.region || "WNY" });
      logActivity("product_added", {
        productName: data.name || null,
        vendorName:  vendor.storeName || null,
      });
    }
    setProducts(await getVendorProducts(vendor.id));
  };

  const handleDeleteProduct = async (product) => {
    await deleteProduct(product.id, product.imagePath);
    setProducts((p) => p.filter((x) => x.id !== product.id));
  };

  const TABS = [
    { id: "products",  label: "🛍️ Products" },
    { id: "profile",   label: "🏪 Store Profile" },
    ...(vendor.tier === "premium" ? [{ id: "catalog", label: "📖 Store Catalog" }] : []),
    ...(vendor.tier === "premium" || vendor.tier === "standard"
      ? [{ id: "analytics", label: "📊 Analytics" }]
      : []
    ),
    ...(vendor.tier === "premium" ? [{ id: "staff-edu", label: "🎓 Staff EDU" }] : []),
  ];

  return (
    <div className="vd-wrap">
      {/* Header */}
      <div className="vd-header">
        <div className="vd-header__inner">
          <div style={{ flex: 1 }}>
            {allVendors.length > 1 && (
              <div className="vd-store-picker">
                {allVendors.map(v => (
                  <button
                    key={v.id}
                    className={`vd-store-pill ${vendor?.id === v.id ? "vd-store-pill--active" : ""}`}
                    onClick={() => switchStore(v)}
                  >
                    {v.storeName}
                    <span className="vd-store-pill__tier" style={{ background: TIER_COLORS[v.tier] ?? "#64748b" }}>
                      {TIER_LABELS[v.tier] ?? v.tier}
                    </span>
                  </button>
                ))}
                <button className="vd-store-pill vd-store-pill--new" onClick={() => navigate("/vendor/register")}>
                  + New Store
                </button>
              </div>
            )}
            <div className="vd-header__store">{vendor.storeName}</div>
            <div className="vd-header__meta">
              📍 {vendor.city}, NY
              <span
                className="vd-header__tier"
                style={{ background: TIER_COLORS[vendor.tier] }}
              >
                {TIER_LABELS[vendor.tier]}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <button className="btn btn--sm btn--outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }} onClick={() => navigate("/discover")}>
              View on Discover
            </button>
            {allVendors.length === 1 && (
              <button className="btn btn--sm btn--outline" style={{ color: "rgba(255,255,255,.6)", borderColor: "rgba(255,255,255,.2)", fontSize: ".72rem" }} onClick={() => navigate("/vendor/register")}>
                + Add Another Store
              </button>
            )}
          </div>
        </div>

        <div className="vd-header__stats">
          <div className="vd-hstat">
            <span className="vd-hstat__n">{products.length}</span>
            <span className="vd-hstat__l">Products Listed</span>
          </div>
          <div className="vd-hstat">
            <span className="vd-hstat__n">{products.filter((p) => p.inStock).length}</span>
            <span className="vd-hstat__l">In Stock</span>
          </div>
          <div className="vd-hstat">
            <span className="vd-hstat__n">{limit === Infinity ? "∞" : limit}</span>
            <span className="vd-hstat__l">Product Limit</span>
          </div>
          <div className="vd-hstat">
            <span className="vd-hstat__n" style={{ color: "#10b981", fontSize: ".9rem" }}>✓ Live</span>
            <span className="vd-hstat__l">Listing Status</span>
          </div>
        </div>

        <div className="vd-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`vd-tab ${tab === t.id ? "vd-tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="vd-body">

        {/* ── Products Tab ── */}
        {tab === "products" && (
          <div>
            <div className="vd-products-toolbar">
              <div>
                <h2 className="vd-section-title">Product Inventory</h2>
                <p className="vd-section-sub">
                  {products.length} of {limit === Infinity ? "unlimited" : limit} products
                  {vendor.tier === "free" && atLimit && (
                    <span className="vd-limit-warn"> · Upgrade to Standard for unlimited products</span>
                  )}
                </p>
              </div>
              <button
                className="btn btn--primary"
                onClick={() => setModal("add")}
                disabled={atLimit}
                title={atLimit ? `Free tier limit: ${limit} products` : ""}
              >
                + Add Product
              </button>
            </div>

            {vendor.tier === "free" && (
              <div className="vd-upgrade-banner">
                <span>🚀</span>
                <div>
                  <strong>Upgrade to Standard ($49/mo)</strong> for unlimited products, profile-match ranking, and deals & menu features.
                </div>
                <button className="btn btn--sm btn--primary" onClick={() => navigate("/vendor/register")}>
                  Upgrade Plan
                </button>
              </div>
            )}

            {products.length === 0 && (
              <div className="vd-empty">
                <div className="vd-empty__icon">🌿</div>
                <h3>No products yet</h3>
                <p>Add your first product to start showing inventory on Mycana.</p>
                <button className="btn btn--primary" onClick={() => setModal("add")}>
                  Add Your First Product
                </button>
              </div>
            )}

            <div className="vd-product-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={(prod) => setModal(prod)}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Store Profile Tab ── */}
        {tab === "profile" && (
          <StoreProfileTab vendor={vendor} onSaved={setVendor} />
        )}

        {/* ── Store Catalog Tab (Premium) ── */}
        {tab === "catalog" && (
          <CatalogManagerTab
            vendor={vendor}
            products={products}
            onVendorUpdate={setVendor}
            onProductsUpdate={setProducts}
          />
        )}

        {/* ── Analytics Tab ── */}
        {tab === "analytics" && (
          <div className="vd-analytics">
            <h2 className="vd-section-title">Platform Analytics</h2>
            <p className="vd-section-sub">
              {vendor.tier === "premium"
                ? "Full analytics — profile match impressions, click-throughs, and product views."
                : "Basic analytics — upgrade to Premium for full product-level analytics."}
            </p>
            <div className="vd-analytics-grid">
              {[
                { label: "Profile Views (30d)",    n: "—", note: "Coming soon" },
                { label: "Click-throughs",          n: "—", note: "Coming soon" },
                { label: "Profile Match Score",     n: "—", note: "Coming soon" },
                { label: "Products Viewed",         n: products.length, note: "Current listings" },
              ].map((s) => (
                <div key={s.label} className="vd-analytics-card">
                  <div className="vd-analytics-card__n">{s.n}</div>
                  <div className="vd-analytics-card__label">{s.label}</div>
                  <div className="vd-analytics-card__note">{s.note}</div>
                </div>
              ))}
            </div>
            {vendor.tier !== "premium" && (
              <div className="vd-upgrade-banner" style={{ marginTop: 24 }}>
                <span>📊</span>
                <div>
                  <strong>Upgrade to Premium ($149/mo)</strong> for full profile analytics, promoted products, and priority support.
                </div>
                <button className="btn btn--sm btn--primary" onClick={() => navigate("/vendor/register")}>
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        )}
        {/* ── Staff EDU Tab (Premium) ── */}
        {tab === "staff-edu" && (
          <StaffEduTab vendor={vendor} />
        )}
      </div>

      {/* ── Product Modal ── */}
      {modal !== null && (
        <ProductModal
          vendorId={vendor.id}
          product={modal === "add" ? null : modal}
          onSave={handleSaveProduct}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
