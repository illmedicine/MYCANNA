import { useState } from "react";
import MycanaLogo from "../components/Logo.jsx";
import "./Merch.css";

/* ── Product catalogue ──────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: "tee-classic",
    name: "Mycana Classic Tee",
    price: 28,
    category: "apparel",
    colors: [
      { hex: "#2a4d34", name: "Forest",     visual: "green" },
      { hex: "#1a2b1e", name: "Midnight",   visual: "dark"  },
      { hex: "#f0ece0", name: "Sage Cream", visual: "cream", light: true },
    ],
    sizes: ["S","M","L","XL","2XL"],
    tag: "Bestseller",
    desc: "100% organic cotton, preshrunk. Embroidered felt-patch logo centered on chest.",
  },
  {
    id: "hoodie-pullover",
    name: "Mycana Pullover Hoodie",
    price: 65,
    category: "apparel",
    colors: [
      { hex: "#0d4f2e", name: "Primary Green", visual: "green" },
      { hex: "#1a2b1e", name: "Midnight",      visual: "dark"  },
    ],
    sizes: ["S","M","L","XL","2XL"],
    tag: "New",
    desc: "Heavyweight fleece, kangaroo pocket, embroidered logo left chest. Brushed interior.",
  },
  {
    id: "mug-ceramic",
    name: "Mycana Ceramic Mug",
    price: 22,
    category: "drinkware",
    colors: [
      { hex: "#f0ece0", name: "Sage Cream",    visual: "cream", light: true },
      { hex: "#0d4f2e", name: "Forest Green",  visual: "green" },
    ],
    sizes: ["11 oz","15 oz"],
    tag: null,
    desc: "Dishwasher-safe ceramic. Brand logo with stitch-frame detail on both faces.",
  },
  {
    id: "grinder-herb",
    name: "Mycana Herb Grinder",
    price: 45,
    category: "accessories",
    colors: [
      { hex: "#1a2b1e", name: "Matte Forest",  visual: "dark"  },
      { hex: "#c8903a", name: "Gold Edition",  visual: "gold"  },
    ],
    sizes: ["Standard"],
    tag: "Limited",
    desc: "4-piece zinc alloy, CNC-milled. Mycana leaf embossed on lid, kief catcher included.",
  },
];

const CATEGORIES = [
  { id: "all",         label: "All" },
  { id: "apparel",     label: "Apparel" },
  { id: "drinkware",   label: "Drinkware" },
  { id: "accessories", label: "Accessories" },
];

/* ── SVG product illustrations ──────────────────────────────────────────── */
function TeeIllustration({ color = "#2a4d34", light = false }) {
  const stroke = light ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.22)";
  const fill   = light ? "rgba(0,0,0,.08)"  : "rgba(255,255,255,.12)";
  return (
    <svg viewBox="0 0 140 130" className="merch-product-svg" style={{ width: 140, height: 130 }}>
      {/* Shirt body */}
      <path d="M30 30 L15 55 L32 62 L32 112 L108 112 L108 62 L125 55 L110 30 L95 20 C92 28 80 34 70 34 C60 34 48 28 45 20 Z"
        fill={color} stroke={stroke} strokeWidth="1.5"/>
      {/* Collar */}
      <path d="M45 20 C48 28 60 34 70 34 C80 34 92 28 95 20"
        fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
      {/* Shoulder seams */}
      <line x1="30" y1="30" x2="45" y2="22" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2"/>
      <line x1="110" y1="30" x2="95" y2="22" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2"/>
      {/* Side seams */}
      <line x1="32" y1="62" x2="32" y2="112" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2"/>
      <line x1="108" y1="62" x2="108" y2="112" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2"/>
      {/* Hem stitch */}
      <line x1="32" y1="109" x2="108" y2="109" stroke={stroke} strokeWidth="1" strokeDasharray="4 3"/>
      {/* Logo badge on chest */}
      <rect x="54" y="56" width="32" height="32" rx="6" fill={fill} stroke={stroke} strokeWidth="1" strokeDasharray="2.5 2"/>
      {/* Mini leaf in badge */}
      <line x1="70" y1="80" x2="70" y2="75" stroke={light ? "rgba(0,0,0,.4)" : "rgba(255,255,255,.7)"} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M70 75 C68 71 67 66 70 62 C73 66 72 71 70 75Z" fill={light ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.75)"}/>
      <path d="M70 74 C67 72 63 70 64 66 C66 66 68 69 70 72Z" fill={light ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.55)"}/>
      <path d="M70 74 C73 72 77 70 76 66 C74 66 72 69 70 72Z" fill={light ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.55)"}/>
    </svg>
  );
}

function HoodieIllustration({ color = "#0d4f2e", light = false }) {
  const stroke = light ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.22)";
  const fill   = light ? "rgba(0,0,0,.08)"  : "rgba(255,255,255,.12)";
  return (
    <svg viewBox="0 0 140 140" className="merch-product-svg" style={{ width: 140, height: 140 }}>
      {/* Hoodie body */}
      <path d="M28 38 L12 65 L30 72 L30 118 L110 118 L110 72 L128 65 L112 38 L96 24 C90 36 80 42 70 42 C60 42 50 36 44 24 Z"
        fill={color} stroke={stroke} strokeWidth="1.5"/>
      {/* Hood */}
      <path d="M44 24 C46 14 56 8 70 8 C84 8 94 14 96 24 C92 28 86 34 80 38 C76 40 74 42 70 42 C66 42 64 40 60 38 C54 34 48 28 44 24Z"
        fill={color} stroke={stroke} strokeWidth="1.5"/>
      {/* Hood inner shadow */}
      <path d="M50 26 C52 18 60 13 70 13 C80 13 88 18 90 26" fill="none" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2"/>
      {/* Drawstrings */}
      <line x1="66" y1="42" x2="62" y2="56" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="74" y1="42" x2="78" y2="56" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Kangaroo pocket */}
      <path d="M42 84 L42 110 L98 110 L98 84 C98 82 96 80 94 80 L46 80 C44 80 42 82 42 84Z"
        fill={fill} stroke={stroke} strokeWidth="1.2"/>
      <line x1="70" y1="80" x2="70" y2="110" stroke={stroke} strokeWidth="1" strokeDasharray="3 2"/>
      {/* Logo on left chest */}
      <rect x="52" y="55" width="22" height="22" rx="5" fill={fill} stroke={stroke} strokeWidth="1" strokeDasharray="2 2"/>
      <line x1="63" y1="72" x2="63" y2="68" stroke={light ? "rgba(0,0,0,.4)" : "rgba(255,255,255,.75)"} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M63 68 C61.5 65 61 61 63 58 C65 61 64.5 65 63 68Z" fill={light ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.75)"}/>
      <path d="M63 67 C61 66 58 64 58.5 61 C60 61 62 64 63 66Z" fill={light ? "rgba(0,0,0,.2)" : "rgba(255,255,255,.5)"}/>
      <path d="M63 67 C65 66 68 64 67.5 61 C66 61 64 64 63 66Z" fill={light ? "rgba(0,0,0,.2)" : "rgba(255,255,255,.5)"}/>
    </svg>
  );
}

function MugIllustration({ color = "#f0ece0", light = true }) {
  const logoFg = light ? "rgba(13,79,46,.85)" : "rgba(255,255,255,.85)";
  const logoSt = light ? "rgba(13,79,46,.25)" : "rgba(255,255,255,.25)";
  const rim    = light ? "rgba(0,0,0,.1)"      : "rgba(255,255,255,.15)";
  return (
    <svg viewBox="0 0 140 130" className="merch-product-svg" style={{ width: 140, height: 130 }}>
      {/* Steam wisps */}
      <path d="M56 18 C54 14 58 10 56 6" fill="none" stroke={light ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.2)"} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M70 16 C68 11 72 7 70 3"  fill="none" stroke={light ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.2)"} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M84 18 C82 14 86 10 84 6" fill="none" stroke={light ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.2)"} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Mug body */}
      <path d="M30 24 L34 114 L106 114 L110 24 Z" rx="4" fill={color} stroke={rim} strokeWidth="1.5"/>
      {/* Rim ellipse */}
      <ellipse cx="70" cy="24" rx="40" ry="8" fill={color} stroke={rim} strokeWidth="1.5"/>
      {/* Bottom ellipse */}
      <ellipse cx="70" cy="114" rx="36" ry="7" fill={light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.08)"}/>
      {/* Handle */}
      <path d="M110 42 C130 42 132 72 110 72" fill="none" stroke={rim} strokeWidth="8" strokeLinecap="round"/>
      <path d="M110 42 C126 42 128 72 110 72" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>
      {/* Logo badge on body */}
      <rect x="48" y="50" width="44" height="44" rx="8" fill={light ? "rgba(13,79,46,.08)" : "rgba(255,255,255,.1)"} stroke={logoSt} strokeWidth="1.2" strokeDasharray="3 2.5"/>
      {/* Leaf in badge */}
      <line x1="70" y1="88" x2="70" y2="82" stroke={logoFg} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M70 82 C67 76 66 69 70 63 C74 69 73 76 70 82Z" fill={logoFg}/>
      <path d="M70 81 C66 79 60 76 61 70 C64 70 68 74 70 78Z" fill={logoFg} opacity=".7"/>
      <path d="M70 81 C74 79 80 76 79 70 C76 70 72 74 70 78Z" fill={logoFg} opacity=".7"/>
    </svg>
  );
}

function GrinderIllustration({ color = "#1a2b1e", light = false }) {
  const stroke = light ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.22)";
  const accent = color === "#c8903a" ? "rgba(255,255,255,.7)" : "rgba(74,222,128,.7)";
  return (
    <svg viewBox="0 0 140 140" className="merch-product-svg" style={{ width: 140, height: 140 }}>
      {/* Lid top face ellipse */}
      <ellipse cx="70" cy="38" rx="46" ry="14" fill={color} stroke={stroke} strokeWidth="1.5"/>
      {/* Lid body */}
      <path d="M24 38 L24 64 Q24 68 70 68 Q116 68 116 64 L116 38" fill={color} stroke={stroke} strokeWidth="1.5"/>
      {/* Lid bottom rim highlight */}
      <ellipse cx="70" cy="64" rx="46" ry="10" fill={color} stroke={stroke} strokeWidth="1.2"/>
      {/* Knurling lines on lid */}
      {[...Array(8)].map((_, i) => (
        <line key={i}
          x1={70 + 46 * Math.cos((i * Math.PI * 2) / 8)}
          y1={64 + 10 * Math.sin((i * Math.PI * 2) / 8)}
          x2={70 + 46 * Math.cos((i * Math.PI * 2) / 8)}
          y2={38 + 14 * Math.sin((i * Math.PI * 2) / 8)}
          stroke={stroke} strokeWidth=".8" opacity=".5"
        />
      ))}
      {/* Base body */}
      <path d="M24 72 L28 112 Q28 118 70 118 Q112 118 112 112 L116 72" fill={color} stroke={stroke} strokeWidth="1.5"/>
      <ellipse cx="70" cy="72" rx="46" ry="10" fill={color} stroke={stroke} strokeWidth="1.2"/>
      {/* Thread seam line */}
      <line x1="24" y1="70" x2="116" y2="70" stroke={accent} strokeWidth="1.5" strokeDasharray="4 3"/>
      {/* Bottom ellipse */}
      <ellipse cx="70" cy="112" rx="42" ry="9" fill={light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.06)"}/>
      {/* Embossed leaf on lid top */}
      <line x1="70" y1="46" x2="70" y2="42" stroke={accent} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M70 42 C68 38 67 33 70 29 C73 33 72 38 70 42Z" fill={accent}/>
      <path d="M70 41 C67.5 39.5 64 38 64.5 34 C66.5 34 69 37 70 40Z" fill={accent} opacity=".7"/>
      <path d="M70 41 C72.5 39.5 76 38 75.5 34 C73.5 34 71 37 70 40Z" fill={accent} opacity=".7"/>
    </svg>
  );
}

const ILLUSTRATIONS = {
  "tee-classic":    (c, l) => <TeeIllustration     color={c} light={l} />,
  "hoodie-pullover":(c, l) => <HoodieIllustration  color={c} light={l} />,
  "mug-ceramic":    (c, l) => <MugIllustration      color={c} light={l} />,
  "grinder-herb":   (c, l) => <GrinderIllustration  color={c} light={l} />,
};

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
              <div
                className={`merch-drawer__item-visual merch-card__visual--${item.colorVisual}`}
                style={{ background: item.colorHex }}
              >
                <MycanaLogo size={28} />
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
              Print-on-demand · Ships in 5–7 business days · Free returns
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
      <div className={`merch-card__visual merch-card__visual--${color.visual}`}>
        {product.tag && <span className="merch-card__tag">{product.tag}</span>}
        {ILLUSTRATIONS[product.id]?.(color.hex, !!color.light)}
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

  const addToCart = (item) => {
    setCartItems(prev => [...prev, item]);
  };

  const removeFromCart = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="merch-wrap">
      {/* Hero */}
      <div className="merch-hero">
        <div className="merch-hero__inner">
          <span className="merch-hero__badge">Official Merch</span>
          <h1 className="merch-hero__title">Wear the Ritual</h1>
          <p className="merch-hero__sub">
            Premium cannabis lifestyle goods — felt-patch embroidery, heavyweight fleece,
            and gear built for the community.
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

      {/* Cart drawer */}
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
