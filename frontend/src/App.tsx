import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ChartPage from './pages/ChartPage';
import MarketWatch from './pages/MarketWatch';
import Portfolio from './pages/Portfolio';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import GoogleCallback from './pages/auth/GoogleCallback';
import About from './pages/About';
import HowToUse from './pages/HowToUse';
import Terms from './pages/Terms';
import Disclaimer from './pages/Disclaimer';
import { AuthProvider, useAuth } from './context/AuthContext';

const Guard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isGuest = localStorage.getItem('guest') === 'true';
  const isAuth = !!localStorage.getItem('token');
  if (isAuth) return <>{children}</>;
  if (isGuest && (location.pathname === '/dashboard' || location.pathname === '/')) return <>{children}</>;
  return <Navigate to={isGuest ? '/signup' : '/login'} replace />;
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
    <header style={{ height: 48, background: 'var(--color-panel)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '.75rem' }}>
      <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', textDecoration: 'none' }}>
        <img src="/nepseprologo.png" alt="NEPSE Pro" style={{ width: 28, height: 28, borderRadius: '.4rem' }} />
        <span style={{ fontWeight: 700, fontSize: '.85rem', color: '#fff' }}>NEPSE Pro</span>
      </Link>
      <div style={{ flex: 1 }} />
      <Link to="/about" style={{ fontSize: '.72rem', color: 'var(--color-muted)', textDecoration: 'none', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>About</Link>
      <span style={{ color: 'var(--color-dimmed)', fontSize: '.6rem' }}>·</span>
      <Link to="/how-to-use" style={{ fontSize: '.72rem', color: 'var(--color-muted)', textDecoration: 'none', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>Guide</Link>
      <span style={{ color: 'var(--color-dimmed)', fontSize: '.6rem' }}>·</span>
      <Link to="/terms" style={{ fontSize: '.72rem', color: 'var(--color-muted)', textDecoration: 'none', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>Terms</Link>
      <span style={{ color: 'var(--color-dimmed)', fontSize: '.6rem' }}>·</span>
      <Link to="/disclaimer" style={{ fontSize: '.72rem', color: 'var(--color-muted)', textDecoration: 'none', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>Disclaimer</Link>
    </header>
    {children}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/how-to-use" element={<PublicLayout><HowToUse /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
          <Route path="/disclaimer" element={<PublicLayout><Disclaimer /></PublicLayout>} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chart"     element={<ChartPage />} />
            <Route path="market"    element={<MarketWatch />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="profile"   element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
