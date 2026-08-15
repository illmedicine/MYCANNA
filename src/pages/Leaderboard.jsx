import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { getLeaderboard, getUserRank } from "../services/prestigeService.js";
import { getRecentPublicExperiences } from "../services/experienceService.js";
import { getCategoryImages } from "../services/catalogService.js";

const RANK_MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
const CATEGORY_ICONS = {
  flower: "🌿", vape: "💨", edible: "🍫", concentrate: "💎",
  tincture: "🧪", topical: "🧴", capsule: "💊", preroll: "🚬",
};

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [board,          setBoard]          = useState([]);
  const [userRank,       setUserRank]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [recentReviews,  setRecentReviews]  = useState([]);
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    Promise.all([
      getLeaderboard(50),
      user ? getUserRank(user.id) : Promise.resolve(null),
    ]).then(([entries, rank]) => {
      setBoard(entries);
      setUserRank(rank);
    }).catch(console.error)
      .finally(() => setLoading(false));

    getRecentPublicExperiences(20).then(setRecentReviews).catch(() => {});
    getCategoryImages().then(setCategoryImages).catch(() => {});
  }, [user]);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-hero">
        <div className="leaderboard-hero__bg" />
        <div className="container">
          <span className="eyebrow eyebrow--gold">Community</span>
          <h1 className="leaderboard-hero__title">Global Leaderboard</h1>
          <p className="leaderboard-hero__sub">
            Top Mycana contributors ranked by prestige points.
            Log experiences, write reviews, and refer friends to climb the ranks.
          </p>
          {user && userRank && (
            <div className="leaderboard-your-rank">
              Your current rank: <strong>#{userRank}</strong>
            </div>
          )}
          {user && !userRank && (
            <button className="btn btn--primary" onClick={() => navigate("/log")}>
              Log Your First Experience to Get Ranked →
            </button>
          )}
        </div>
      </div>

      <div className="container leaderboard-body">
        {loading && <div className="app-loading" style={{ minHeight: 200 }}>🌿</div>}

        {!loading && board.length === 0 && (
          <div className="discover__empty">
            <div className="discover__empty-icon">🏆</div>
            <h3>No rankings yet</h3>
            <p>Be the first to log an experience and claim the top spot.</p>
            <button className="btn btn--primary" onClick={() => navigate("/log")}>Log an Experience</button>
          </div>
        )}

        {!loading && board.length > 0 && (
          <div className="lb-table">
            {board.map((entry) => {
              const isMe = entry.uid === user?.id;
              return (
                <div key={entry.uid} className={`lb-row ${isMe ? "lb-row--me" : ""}`}>
                  <div className="lb-row__rank">
                    {RANK_MEDAL[entry.rank] || `#${entry.rank}`}
                  </div>
                  <div className="lb-row__avatar-wrap">
                    {entry.avatar
                      ? <img src={entry.avatar} alt="" className="lb-row__avatar" />
                      : <div className="lb-row__avatar-placeholder">{entry.displayName?.[0]}</div>
                    }
                  </div>
                  <div className="lb-row__info">
                    <span className="lb-row__name">{isMe ? "You" : entry.displayName}</span>
                    <span className="lb-row__level">{entry.levelEmoji} {entry.levelTitle}</span>
                  </div>
                  <div className="lb-row__points">
                    <span className="lb-row__pts-num">{(entry.points || 0).toLocaleString()}</span>
                    <span className="lb-row__pts-label">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="lb-earn-more">
          <h3>How to Earn More Points</h3>
          <div className="lb-earn-grid">
            {[
              { action: "Log an experience", pts: "+25", icon: "📝" },
              { action: "Write detailed review", pts: "+40", icon: "✍️" },
              { action: "Dispensary check-in", pts: "+15", icon: "📍" },
              { action: "Refer a friend", pts: "+20", icon: "👥" },
              { action: "7-day streak", pts: "2× bonus", icon: "🔥" },
              { action: "Helpful vote received", pts: "+5", icon: "👍" },
            ].map((e) => (
              <div key={e.action} className="lb-earn-item">
                <span className="lb-earn-item__icon">{e.icon}</span>
                <span className="lb-earn-item__action">{e.action}</span>
                <span className="lb-earn-item__pts">{e.pts}</span>
              </div>
            ))}
          </div>
          <button className="btn btn--primary" onClick={() => navigate("/log")}>
            Log an Experience Now →
          </button>
        </div>

        {/* ── Latest Reviews ── */}
        {recentReviews.length > 0 && (
          <div className="lb-reviews">
            <h2 className="lb-reviews__title">Latest Community Reviews</h2>
            <p className="lb-reviews__sub">Real experiences from the Mycana community — anonymized and scientifically logged.</p>
            <div className="lb-reviews__grid">
              {recentReviews.map(exp => {
                const strain    = exp.strainName || exp.strain || "";
                const storeName = exp.storefront || exp.vendor || "";
                const thumbUrl  = exp.labelImageUrl || categoryImages[exp.category] || null;
                const icon      = CATEGORY_ICONS[exp.category] ?? "🌿";
                const date      = exp.createdAt?.toDate
                  ? exp.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "";
                const note      = exp.overallNotes || exp.notes || "";
                return (
                  <div key={exp.id} className="lb-rev-card">
                    <div className="lb-rev-card__thumb">
                      {thumbUrl
                        ? <img src={thumbUrl} alt="" className="lb-rev-card__img" />
                        : <span className="lb-rev-card__icon">{icon}</span>
                      }
                    </div>
                    <div className="lb-rev-card__body">
                      <div className="lb-rev-card__name">{exp.productName || "Cannabis Product"}</div>
                      {strain && <div className="lb-rev-card__strain">{strain}</div>}
                      <div className="lb-rev-card__rating">{"★".repeat(exp.rating || 0)}{"☆".repeat(5 - (exp.rating || 0))}</div>
                      {note && <p className="lb-rev-card__note">{note.slice(0, 100)}{note.length > 100 ? "…" : ""}</p>}
                      <div className="lb-rev-card__meta">
                        {storeName && <span className="lb-rev-card__store">🏪 {storeName}</span>}
                        {exp.thcPct && <span className="lb-rev-card__pct">THC {exp.thcPct}%</span>}
                        <span className="lb-rev-card__user">{exp.userDisplayName || "Mycana Member"}</span>
                        {date && <span className="lb-rev-card__date">{date}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
