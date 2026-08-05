import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__leaf">🌿</span>
        <span className="navbar__name">Mycana</span>
      </Link>

      <div className="navbar__actions">
        {user ? (
          <>
            {location.pathname !== '/assessment' && (
              <Link to="/assessment" className="btn btn--sm btn--outline">
                My Profile
              </Link>
            )}
            <button onClick={handleSignOut} className="navbar__avatar-btn" title="Sign out">
              <img src={user.picture} alt={user.name} className="navbar__avatar" />
            </button>
          </>
        ) : (
          <span className="navbar__guest">Know your profile →</span>
        )}
      </div>
    </nav>
  );
}
