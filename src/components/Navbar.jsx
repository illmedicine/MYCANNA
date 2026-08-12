import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import MycanaLogo from "./Logo.jsx";

const ADMIN_EMAILS = ['dwilson@illyrobotic-ai.com', 'jcgstone@yahoo.com', 'jcgstone@gmail.com', 'demarkuswilsone@gmail.com'];

const NAV_LINKS = [
  { to: "/discover",    label: "Discover",    icon: "🗺️" },
  { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { to: "/log",         label: "Log",         icon: "📝", protected: true },
  { to: "/merch",       label: "Shop",        icon: "👕" },
];

export default function Navbar() {
  const { user, signIn, signOut } = useAuth();
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
          <MycanaLogo size={36} className="navbar__logo-badge" />
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
              {ADMIN_EMAILS.includes(user.email) && (
                <Link to="/admin" className="navbar__admin-btn">⚙ Admin</Link>
              )}
              <button className="navbar__avatar-btn" onClick={() => setMenuOpen((o) => !o)} title="Account">
                <img src={user.picture} alt={user.name} className="navbar__avatar" />
              </button>
            </>
          ) : (
            <button className="btn btn--sm btn--primary" onClick={signIn}>Sign In</button>
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
              {/* Mobile-only: main nav links not visible in the top bar on small screens */}
              <div className="nav-menu__mobile-nav">
                {NAV_LINKS.filter((l) => !l.protected || user).map((l) => (
                  <Link key={l.to} to={l.to} className="nav-menu__link" onClick={() => setMenuOpen(false)}>
                    <span>{l.icon}</span> {l.label}
                  </Link>
                ))}
              </div>

              {user ? (
                <>
                  {ADMIN_EMAILS.includes(user.email) && (
                    <Link to="/admin" className="nav-menu__link nav-menu__link--admin" onClick={() => setMenuOpen(false)}>
                      <span>⚙</span> Admin Portal
                    </Link>
                  )}
                  <Link to="/dashboard" className="nav-menu__link" onClick={() => setMenuOpen(false)}>
                    <span>🧬</span> My Dashboard
                  </Link>
                  <Link to="/vendor/dashboard" className="nav-menu__link" onClick={() => setMenuOpen(false)}>
                    <span>🏪</span> My Store Dashboard
                  </Link>
                  <button className="nav-menu__link nav-menu__signout" onClick={handleSignOut}>
                    <span>↩️</span> Sign Out
                  </button>
                </>
              ) : (
                <button className="nav-menu__link" onClick={() => { signIn(); setMenuOpen(false); }}>
                  <span>🔑</span> Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
