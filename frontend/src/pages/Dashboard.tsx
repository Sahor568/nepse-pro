import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { NEPSE_BASE, authFetch } from '../apiConfig';

const Dashboard = () => {
  const navigate = useNavigate();
  const [indices, setIndices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [gainers, setGainers] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  const [liveMarket, setLiveMarket] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user: any = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [idxRes, sumRes, gainRes, lossRes, liveRes] = await Promise.all([
          authFetch(`${NEPSE_BASE}/index`).catch(() => null),
          authFetch(`${NEPSE_BASE}/summary`).catch(() => null),
          authFetch(`${NEPSE_BASE}/gainers`).catch(() => null),
          authFetch(`${NEPSE_BASE}/losers`).catch(() => null),
          authFetch(`${NEPSE_BASE}/live`).catch(() => null)
        ]);

        const failed = [idxRes, sumRes, gainRes, lossRes, liveRes].some(r => !r);
        if (failed) {
          setError('Could not connect to NEPSE API. Please ensure the backend server is running.');
        }

        if (idxRes) { try { const d = await idxRes.json(); setIndices(Array.isArray(d) ? d : []); } catch { /* skip */ } }
        if (sumRes) { try { const d = await sumRes.json(); setSummary(d); } catch { /* skip */ } }
        if (gainRes) { try { const d = await gainRes.json(); setGainers(Array.isArray(d) ? d : []); } catch { /* skip */ } }
        if (lossRes) { try { const d = await lossRes.json(); setLosers(Array.isArray(d) ? d : []); } catch { /* skip */ } }
        if (liveRes) { try { const d = await liveRes.json(); setLiveMarket(Array.isArray(d) ? d : []); } catch { /* skip */ } }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Could not connect to NEPSE API. Please ensure the backend server is running.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nepseIndex = indices.find(i => i.index === 'NEPSE Index');

  const StatCard = ({ title, value, sub, positive, icon: Icon, delay = '0s' }: any) => (
    <div className="card p-5 relative overflow-hidden animate-fadeUp group cursor-default" style={{ animationDelay: delay }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, opacity: .06, transform: 'translate(15%, -15%)' }}>
        <Icon className="w-full h-full" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
        <p style={{ fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--color-muted)' }}>{title}</p>
        <div style={{ padding: '.35rem', borderRadius: '.4rem', background: positive ? 'rgba(8,153,129,.12)' : 'rgba(242,54,69,.12)', color: positive ? 'var(--color-green)' : 'var(--color-red)' }}>
          {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </div>
      </div>
      <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-.02em', marginBottom: '.3rem' }}>{value}</p>
      <p style={{ fontSize: '.72rem', color: positive ? 'var(--color-green)' : 'var(--color-red)', fontWeight: 600 }}>{sub}</p>
    </div>
  );

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-blue-500">
              <Loader2 className="animate-spin" size={48} />
              <p className="text-gray-400 font-medium tracking-wide">Fetching Live NEPSE Data...</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <div className="text-red-500 text-5xl">⚠</div>
              <h2 className="text-white font-bold text-lg">Data Fetch Error</h2>
              <p className="text-gray-400 text-sm max-w-md text-center">{error}</p>
              <button onClick={() => { setError(null); setLoading(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Retry</button>
          </div>
      );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div className="animate-fadeUp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '.2rem' }}>
            {greeting}, {(user?.name || 'Trader').split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '.8rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <Clock className="w-3.5 h-3.5" />
            {nepseIndex?.generatedTime ? new Date(nepseIndex.generatedTime).toLocaleString() : new Date().toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)', display: 'inline-block' }} />
          <span style={{ fontSize: '.75rem', color: 'var(--color-green)', fontWeight: 600 }}>Real-time Feed</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard 
            title="NEPSE Index"   
            value={nepseIndex?.close?.toLocaleString() || '0'}  
            sub={`${nepseIndex?.change >= 0 ? '+' : ''}${nepseIndex?.change} (${nepseIndex?.perChange}%)`}   
            positive={nepseIndex?.change >= 0} 
            icon={BarChart2}  
            delay=".05s" 
        />
        <StatCard 
            title="Market Turnover"       
            value={`Rs. ${(summary?.['Total Turnover Rs:'] / 10000000).toFixed(2)} Cr`}    
            sub={`${summary?.['Total Scrips Traded']} Scrips Traded`}  
            positive={true} 
            icon={Activity}  
            delay=".10s" 
        />
        <StatCard 
            title="Mkt Capitalization"       
            value={`Rs. ${(summary?.['Total Market Capitalization Rs:'] / 100000000000).toFixed(2)} Tr`}       
            sub="Current valuation" 
            positive={true} 
            icon={DollarSign}   
            delay=".15s" 
        />
        <StatCard 
            title="Traded Volume"    
            value={summary?.['Total Traded Shares']?.toLocaleString() || '0'}   
            sub={`Market transactions: ${summary?.['Total Transactions']?.toLocaleString()}`}   
            positive={true} 
            icon={TrendingUp} 
            delay=".20s" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title"><TrendingUp className="w-4 h-4 text-green-500" /> Top Gainers</h3></div>
          <div>
            {gainers.slice(0, 6).map((g, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.25rem', borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none' }}>
                <div
                  className="cursor-pointer group"
                  onClick={() => navigate(`/chart?symbol=${g.symbol}`)}
                >
                  <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }} className="group-hover:text-blue-400 transition-colors">{g.symbol}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.securityName}</p>
                </div>
                <div className="text-right">
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{g.ltp}</p>
                    <span className="badge-up">+{g.percentageChange}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title"><TrendingDown className="w-4 h-4 text-red-500" /> Top Losers</h3></div>
          <div>
            {losers.slice(0, 6).map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.25rem', borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none' }}>
                <div
                  className="cursor-pointer group"
                  onClick={() => navigate(`/chart?symbol=${l.symbol}`)}
                >
                  <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }} className="group-hover:text-blue-400 transition-colors">{l.symbol}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.securityName}</p>
                </div>
                <div className="text-right">
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{l.ltp}</p>
                    <span className="badge-down">{l.percentageChange}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><Activity className="w-4 h-4" style={{ color: 'var(--color-blue)' }} />Live Market Watch</h2>
          <a href="/market" style={{ fontSize: '.75rem', color: 'var(--color-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.2rem' }}>
            View Full Market <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left">Symbol</th>
                <th className="text-right">LTP</th>
                <th className="text-right">Change</th>
                <th className="text-right">%Chg</th>
                <th className="text-right">High</th>
                <th className="text-right">Low</th>
                <th className="text-right">Vol</th>
              </tr>
            </thead>
            <tbody>
              {liveMarket.slice(0, 10).map((row) => {
                const up = row.percentageChange >= 0;
                const prevClose = row.previousClose || row.closePrice || (row.lastTradedPrice - (row.percentageChange * row.lastTradedPrice / 100)) || 0;
                const chg = +(row.lastTradedPrice - prevClose).toFixed(2);
                return (
                  <tr key={row.symbol}>
                    <td>
                        <button 
                          onClick={() => navigate(`/chart?symbol=${row.symbol}`)}
                          className="font-bold text-white mb-0.5 hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                        >
                          {row.symbol}
                        </button>
                        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{row.securityName}</div>
                    </td>
                    <td className="text-right font-bold text-white">Rs. {row.lastTradedPrice}</td>
                    <td className={`text-right font-bold ${up ? 'text-green-500' : 'text-red-500'}`}>
                        {up ? '+' : ''}{chg}
                    </td>
                    <td className="text-right">
                      <span className={up ? 'badge-up' : 'badge-down'}>{up ? '▲' : '▼'} {Math.abs(row.percentageChange)}%</span>
                    </td>
                    <td className="text-right text-green-500/80">{row.highPrice}</td>
                    <td className="text-right text-red-500/80">{row.lowPrice}</td>
                    <td className="text-right text-gray-400">{(row.totalTradeQuantity / 1000).toFixed(1)}K</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
