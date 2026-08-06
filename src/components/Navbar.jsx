import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/discover",   label: "Discover",    icon: "🗺️" },
  { to: "/dashboard",  label: "Dashboard",   icon: "🧬", protected: true },
  { to: "/leaderboard",label: "Leaderboard", icon: "🏆" },
  { to: "/log",        label: "Log",         icon: "📝", protected: true },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useNavigate();
  const loc = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    location("/");
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__brand">
          <span className="navbar__leaf">🌿</span>
          <span className="navbar__name">Mycana</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar__links">
          {NAV_LINKS.filter((l) => !l.protected || user).map((l) => (
            <Link key={l.to} to={l.to} className={`navbar__link ${loc.pathname === l.to ? "navbar__link--active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="navbar__actions">
          {user ? (
            <>
              <Link to="/profile" className="btn btn--sm btn--outline navbar__profile-btn">
                My Profile
              </Link>
              <button className="navbar__avatar-btn" onClick={() => setMenuOpen((o) => !o)} title="Account">
                <img src={user.picture} alt={user.name} className="navbar__avatar" />
              </button>
            </>
          ) : (
            <Link to="/" className="btn btn--sm btn--primary">Sign In</Link>
          )}

          {/* Mobile hamburger */}
          <button className="navbar__hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Dropdown / mobile menu */}
      {menuOpen && (
        <div className="nav-menu" onClick={() => setMenuOpen(false)}>
          <div className="nav-menu__panel" onClick={(e) => e.stopPropagation()}>
            {user && (
              <div className="nav-menu__user">
                <img src={user.picture} alt="" className="nav-menu__avatar" />
                <div>
                  <div className="nav-menu__name">{user.name}</div>
                  <div className="nav-menu__email">{user.email}</div>
                </div>
              </div>
            )}
            <div className="nav-menu__links">
              {NAV_LINKS.filter((l) => !l.protected || user).map((l) => (
                <Link key={l.to} to={l.to} className="nav-menu__link" onClick={() => setMenuOpen(false)}>
                  <span>{l.icon}</span> {l.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link to="/dashboard" className="nav-menu__link" onClick={() => setMenuOpen(false)}>
                    <span>🧬</span> My Dashboard
                  </Link>
                  <Link to="/profile" className="nav-menu__link" onClick={() => setMenuOpen(false)}>
                    <span>👤</span> My Profile
                  </Link>
                  <Link to="/vendor/register" className="nav-menu__link" onClick={() => setMenuOpen(false)}>
                    <span>🏪</span> List My Store
                  </Link>
                  <button className="nav-menu__link nav-menu__signout" onClick={handleSignOut}>
                    <span>↩️</span> Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
