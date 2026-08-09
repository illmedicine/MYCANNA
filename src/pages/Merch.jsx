import { useState } from "react";
import MycanaLogo from "../components/Logo.jsx";
import "./Merch.css";

/* ── Product catalogue ──────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: "hoodie-cableknit",
    name: "Mycana Cable-Knit Wool Hoodie",
    price: 89,
    category: "apparel",
    image: "/merch/hoodie.png",
    colors: [
      { hex: "#f0ece0", name: "Natural Cream", visual: "cream", light: true },
      { hex: "#0d4f2e", name: "Forest Green",  visual: "green" },
    ],
    sizes: ["S","M","L","XL","2XL"],
    tag: "New",
    desc: "Premium heavy-gauge wool hoodie in natural cream with intricate cable-knit patterns throughout. Features a plush-stitched felt Mycana logo patch centered on chest, complete with dashed stitching details. Subtle meter-graphic felt details hand-stitched on the sleeve cuff. Set against textured felt and aged wood.",
  },
  {
    id: "sweatshirt-felted",
    name: "Mycana Felted Wool Sweatshirt",
    price: 75,
    category: "apparel",
    image: "/merch/sweatshirt.png",
    colors: [
      { hex: "#3d5c3a", name: "Deep Moss",     visual: "green" },
      { hex: "#f0ece0", name: "Natural Cream", visual: "cream", light: true },
    ],
    sizes: ["S","M","L","XL","2XL"],
    tag: "New",
    desc: "Plush premium felted sweatshirt in deep moss green with rich, dense fabric texture. High-definition plush felt Mycana logo patch on chest with clean, decorative hand-stitching along the edges. High-density plush embroidery of the colorful meter bars on the right cuff as a signature detail.",
  },
  {
    id: "tee-premium",
    name: "Mycana Premium Cotton Tee",
    price: 38,
    category: "apparel",
    image: "/merch/tee.png",
    colors: [
      { hex: "#f5f0e8", name: "Natural",       visual: "cream", light: true },
      { hex: "#0d4f2e", name: "Forest Green",  visual: "green" },
      { hex: "#1a2b1e", name: "Midnight",      visual: "dark"  },
    ],
    sizes: ["S","M","L","XL","2XL"],
    tag: "Bestseller",
    desc: "Heavy natural unbleached cotton tee featuring the Mycana logo as a tactile, raised high-density direct plush embroidery on the chest — threads form the green favicon and wordmark with clear hand-stitched borders. A detailed hand-stitched cannabis leaf felt patch with blanket stitching sits on the hip.",
  },
  {
    id: "mug-felt-sleeve",
    name: "Mycana Ceramic Mug + Felt Sleeve",
    price: 28,
    category: "drinkware",
    image: "/merch/mug.png",
    colors: [
      { hex: "#f0ece0", name: "Cream Mug",     visual: "cream", light: true },
      { hex: "#0d4f2e", name: "Forest Sleeve", visual: "green" },
    ],
    sizes: ["11 oz","15 oz"],
    tag: null,
    desc: "Dishwasher-safe cream ceramic mug paired with a custom-fitted dark forest green felt sleeve. Blanket stitching runs along the sleeve borders. A prominent plush-stitched Mycana logo patch is sewn securely onto the sleeve. Subtle meter detail visible on the inner handle curve.",
  },
  {
    id: "beanie-cableknit",
    name: "Mycana Cable-Knit Beanie",
    price: 42,
    category: "apparel",
    image: "/merch/beanie.png",
    colors: [
      { hex: "#1a3d1e", name: "Forest Green",  visual: "green" },
      { hex: "#f0ece0", name: "Natural Cream", visual: "cream", light: true },
    ],
    sizes: ["One Size"],
    tag: null,
    desc: "Premium deep forest green wool beanie with intricate cable-knit patterns and a broad folded cuff. The full Mycana logo patch is sewn prominently onto the center front of the cuff with clean blanket stitching. Decorative felt meter-bar accents integrated as subtle handcrafted details around the body.",
  },
];

const CATEGORIES = [
  { id: "all",         label: "All" },
  { id: "apparel",     label: "Apparel" },
  { id: "drinkware",   label: "Drinkware" },
];

/* ── Cart drawer ────────────────────────────────────────────────────────── */
function CartDrawer({ items, onRemove, onClose }) {
  const total = items.reduce((s, i) => s + i.price, 0);
  return (
    <>
      <div className="merch-drawer-overlay" onClick={onClose} />
      <div className="merch-drawer">
        <div className="merch-drawer__head">
          <span className="merch-drawer__title">Your Cart ({items.length})</span>
          <button className="merch-drawer__close" onClick={onClose}>×</button>
        </div>
        <div className="merch-drawer__items">
          {items.length === 0 ? (
            <div className="merch-drawer__empty">
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🛒</div>
              <div>Your cart is empty.<br/>Add something you love.</div>
            </div>
          ) : items.map((item, idx) => (
            <div key={idx} className="merch-drawer__item">
              <div className="merch-drawer__item-thumb">
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                  : <div style={{ background: item.colorHex, width: "100%", height: "100%", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MycanaLogo size={24} />
                    </div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="merch-drawer__item-name">{item.name}</div>
                <div className="merch-drawer__item-meta">{item.colorName} · {item.size}</div>
                <div className="merch-drawer__item-price">${item.price}</div>
              </div>
              <button className="merch-drawer__item-remove" onClick={() => onRemove(idx)}>×</button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="merch-drawer__footer">
            <div className="merch-drawer__total">
              <span className="merch-drawer__total-label">Total</span>
              <span className="merch-drawer__total-amount">${total}</span>
            </div>
            <a
              href="https://www.paypal.com/paypalme/mycana"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--lg"
              style={{ textAlign: "center" }}
            >
              Checkout with PayPal
            </a>
            <p className="merch-drawer__note">
              Handcrafted to order · Ships in 7–10 business days · Free returns
            </p>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Product card ───────────────────────────────────────────────────────── */
function ProductCard({ product, onAddToCart }) {
  const [colorIdx, setColorIdx] = useState(0);
  const [sizeIdx,  setSizeIdx]  = useState(0);
  const [added,    setAdded]    = useState(false);

  const color = product.colors[colorIdx];

  const handleAdd = () => {
    onAddToCart({
      id:          product.id,
      name:        product.name,
      price:       product.price,
      image:       product.image || null,
      colorHex:    color.hex,
      colorVisual: color.visual,
      colorName:   color.name,
      size:        product.sizes[sizeIdx],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="merch-card">
      <div className="merch-card__visual merch-card__visual--photo">
        {product.tag && <span className="merch-card__tag">{product.tag}</span>}
        <img
          src={product.image}
          alt={product.name}
          className="merch-product-photo"
        />
      </div>

      <div className="merch-card__body">
        <div>
          <div className="merch-card__name">{product.name}</div>
          <div className="merch-card__desc" style={{ marginTop: 4 }}>{product.desc}</div>
        </div>

        <div className="merch-card__price">${product.price}</div>

        {/* Color swatches */}
        <div className="merch-card__colors">
          {product.colors.map((c, i) => (
            <button
              key={c.hex}
              className={`merch-swatch ${colorIdx === i ? "merch-swatch--on" : ""} ${c.light ? "merch-swatch--light" : ""}`}
              style={{ background: c.hex }}
              title={c.name}
              onClick={() => setColorIdx(i)}
            />
          ))}
          <span style={{ fontSize: ".78rem", color: "var(--c-text-muted)", marginLeft: 4 }}>
            {color.name}
          </span>
        </div>

        {/* Size selector */}
        {product.sizes.length > 1 && (
          <div className="merch-card__sizes">
            {product.sizes.map((s, i) => (
              <button
                key={s}
                className={`merch-size-btn ${sizeIdx === i ? "merch-size-btn--on" : ""}`}
                onClick={() => setSizeIdx(i)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="merch-card__cta">
          <button
            className={`btn ${added ? "btn--outline" : "btn--primary"} btn--sm`}
            onClick={handleAdd}
            style={{ width: "100%", transition: "all .2s" }}
          >
            {added ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function Merch() {
  const [category,   setCategory]   = useState("all");
  const [cartItems,  setCartItems]  = useState([]);
  const [cartOpen,   setCartOpen]   = useState(false);

  const shown = category === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category);

  const addToCart = (item) => setCartItems(prev => [...prev, item]);
  const removeFromCart = (idx) => setCartItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="merch-wrap">
      {/* Hero */}
      <div className="merch-hero">
        <div className="merch-hero__inner">
          <span className="merch-hero__badge">Official Merch</span>
          <h1 className="merch-hero__title">Wear the Ritual</h1>
          <p className="merch-hero__sub">
            Premium handcrafted cannabis lifestyle goods — plush felt-patch embroidery,
            cable-knit wool, and gear built for the community.
          </p>
        </div>
      </div>
      <div className="merch-stitch" />

      {/* Category filters */}
      <div className="merch-filters">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`merch-filter-btn ${category === c.id ? "merch-filter-btn--on" : ""}`}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="merch-grid">
        {shown.map(p => (
          <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
        ))}
      </div>

      {/* Floating cart button */}
      {cartItems.length > 0 && (
        <button className="merch-cart-btn" onClick={() => setCartOpen(true)}>
          🛒 Cart
          <span className="merch-cart-count">{cartItems.length}</span>
        </button>
      )}

      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}
