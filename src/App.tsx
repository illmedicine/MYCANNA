import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { UserProfile } from './pages/UserProfile';
import { AssessmentResults } from './pages/AssessmentResults';
import type { AssessmentResult } from './types/user';
import './App.css';

// Demo assessment result — replace with real data fetched from Firestore
const DEMO_RESULT: AssessmentResult = {
  id: 'demo-001',
  completedAt: new Date(),
  scores: { relaxation: 9, pain: 7, sleep: 8 },
  recommendedCategories: ['edibles', 'tinctures', 'vapes', 'concentrates'],
};

function Nav() {
  return (
    <nav className="nav">
      <span className="nav-brand">🌿 MyCanna</span>
      <div className="nav-links">
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
          Profile
        </NavLink>
        <NavLink to="/results" className={({ isActive }) => (isActive ? 'active' : '')}>
          My Results
        </NavLink>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main>
        <Routes>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/results" element={<AssessmentResults result={DEMO_RESULT} />} />
          <Route path="*" element={<UserProfile />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
