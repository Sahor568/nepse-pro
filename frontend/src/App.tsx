import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ChartPage from './pages/ChartPage';
import MarketWatch from './pages/MarketWatch';
import Portfolio from './pages/Portfolio';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';

const isAuth = () => !!localStorage.getItem('token');

const Guard = ({ children }: { children: React.ReactNode }) =>
  isAuth() ? <>{children}</> : <Navigate to="/login" replace />;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
  );
}

export default App;
