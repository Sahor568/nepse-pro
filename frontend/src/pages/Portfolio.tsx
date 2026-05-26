import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, TrendingDown, Plus, Trash2, Edit2, DollarSign, PieChart, Activity, Loader2, Calendar } from 'lucide-react';
import StockSearch from '../components/StockSearch';
import { NEPSE_BASE, API_BASE, authFetch } from '../apiConfig';

const Portfolio = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [stockStats, setStockStats] = useState<Record<string, { ltp: number, prevClose: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      const res = await authFetch(`${API_BASE}/user/portfolio`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setHoldings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load portfolio');
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Fetch live prices from /live endpoint (one call), fall back to /history for off-hours
  const fetchLivePrices = async (symbols: string[]) => {
    try {
      // Fetch live market data in one shot
      const liveRes = await authFetch(`${NEPSE_BASE}/live`);
      if (!liveRes.ok) throw new Error(`Market data server returned ${liveRes.status}`);
      const liveData: any[] = await liveRes.json();
      const liveMap: Record<string, any> = {};
      liveData.forEach((s: any) => { liveMap[s.symbol] = s; });

      // For each holding, use live price or fall back to last history
      const results = await Promise.all(symbols.map(async (symbol) => {
        const liveEntry = liveMap[symbol];
        if (liveEntry && liveEntry.lastTradedPrice) {
          return {
            symbol,
            ltp: liveEntry.lastTradedPrice,
            prevClose: liveEntry.lastTradedPrice / (1 + (liveEntry.percentageChange || 0) / 100),
          };
        }
        // Fallback: use most recent history
        try {
          const res = await authFetch(`${NEPSE_BASE}/history/${symbol}`);
          const data = await res.json();
          if (data && data.length > 0) {
            const latest = data[data.length - 1];
            return { symbol, ltp: latest.ltp || latest.close, prevClose: latest.prevClose };
          }
        } catch { /* ignore */ }
        return null;
      }));

      const stats: Record<string, { ltp: number, prevClose: number }> = {};
      results.forEach(r => { if (r) stats[r.symbol] = { ltp: r.ltp, prevClose: r.prevClose }; });
      setStockStats(stats);
    } catch (e) {
      console.error('Failed to fetch prices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (holdings.length === 0) { setLoading(false); return; }
    setLoading(true);
    const uniqueSymbols = [...new Set(holdings.map(h => h.symbol))] as string[];
    fetchLivePrices(uniqueSymbols);

    // Auto-refresh prices every 30 seconds
    const interval = setInterval(() => fetchLivePrices(uniqueSymbols), 30_000);
    return () => clearInterval(interval);
  }, [holdings]);

  const addHolding = async (stock: any) => {
    const qty = prompt(`Enter quantity for ${stock.symbol}:`, "10");
    if (qty === null) return;
    const price = prompt(`Enter avg. buy price for ${stock.symbol}:`, "500");
    if (price === null) return;
    const reference = prompt(`Enter reference/notes for ${stock.symbol} (optional):`, "");
    
    if (qty && price) {
      try {
        const res = await authFetch(`${API_BASE}/user/portfolio`, {
          method: 'POST',
          body: JSON.stringify({
            symbol: stock.symbol,
            quantity: parseFloat(qty),
            buy_price: parseFloat(price),
            buy_date: new Date().toISOString().split('T')[0],
            reference: reference || ''
          })
        });
        if (res.ok) fetchPortfolio();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const removeHolding = async (id: string, symbol: string) => {
    if(!confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) return;
    try {
      await authFetch(`${API_BASE}/user/portfolio/${id}`, { method: 'DELETE' });
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const editHolding = async (holding: any) => {
    const qty = prompt(`Edit quantity for ${holding.symbol}:`, holding.quantity.toString());
    if (qty === null) return;
    const price = prompt(`Edit avg. buy price for ${holding.symbol}:`, holding.buy_price.toString());
    if (price === null) return;
    const reference = prompt(`Edit reference/notes for ${holding.symbol}:`, holding.reference || "");
    
    if (qty && price) {
      try {
        const res = await authFetch(`${API_BASE}/user/portfolio/${holding.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            quantity: parseFloat(qty),
            buy_price: parseFloat(price),
            buy_date: holding.buy_date,
            reference: reference || ''
          })
        });
        if (res.ok) fetchPortfolio();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalInvestment = holdings.reduce((sum, h) => sum + (h.quantity * h.buy_price), 0);
  
  let currentValue = 0;
  let todayGain = 0;
  
  holdings.forEach(h => {
     const stats = stockStats[h.symbol];
     const ltp = stats ? stats.ltp : h.buy_price;
     const prevClose = stats ? stats.prevClose : ltp;
     
     currentValue += (h.quantity * ltp);
     todayGain += (h.quantity * (ltp - prevClose));
  });

  const totalPL = currentValue - totalInvestment;
  const plPercentage = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;
  const todayPercentage = currentValue - todayGain > 0 ? (todayGain / (currentValue - todayGain)) * 100 : 0;

  const PortfolioCard = ({ title, value, sub, positive, icon: Icon }: any) => (
    <div className="card p-5 animate-fadeUp">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-lg ${positive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl font-bold text-white mb-1">{value}</p>
      <p className={`text-[11px] font-bold ${positive ? 'text-green-500' : 'text-red-500'}`}>{sub}</p>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '.2rem' }}>Portfolio Tracker</h1>
          <p style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>Analyze your NEPSE investment performance</p>
        </div>
        
        <StockSearch onSelect={addHolding} placeholder="Add to portfolio..." />
      </div>

      {error && !loading && holdings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <div className="text-red-500 text-5xl">⚠</div>
          <h2 className="text-white font-bold text-lg">Data Fetch Error</h2>
          <p className="text-gray-400 text-sm max-w-md text-center">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); fetchPortfolio(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Retry</button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <PortfolioCard title="Total Investment" value={`Rs. ${totalInvestment.toLocaleString(undefined, {maximumFractionDigits: 2})}`} sub="Cost basis" positive={true} icon={DollarSign} />
            <PortfolioCard title="Current Value" value={`Rs. ${currentValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`} sub="Market value" positive={currentValue >= totalInvestment} icon={PieChart} />
            <PortfolioCard title="Total P&L" value={`Rs. ${totalPL > 0 ? '+' : ''}${totalPL.toLocaleString(undefined, {maximumFractionDigits: 2})}`} sub={`${totalPL > 0 ? '+' : ''}${plPercentage.toFixed(2)}% overall`} positive={totalPL >= 0} icon={Activity} />
            <PortfolioCard title="Today's P&L" value={`Rs. ${todayGain > 0 ? '+' : ''}${todayGain.toLocaleString(undefined, {maximumFractionDigits: 2})}`} sub={`${todayGain > 0 ? '+' : ''}${todayPercentage.toFixed(2)}% today`} positive={todayGain >= 0} icon={Calendar} />
          </div>

          <div className="card overflow-hidden">
            <div className="card-header"><h3 className="card-title">Holdings Breakdown</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">Symbol</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Avg Price</th>
                    <th className="text-right">LTP / Prev</th>
                    <th className="text-right">Invested</th>
                    <th className="text-right">Current</th>
                    <th className="text-right">Today's P&L</th>
                    <th className="text-right">Total P&L</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h, i) => {
                    const stats = stockStats[h.symbol];
                    const ltp = stats ? stats.ltp : h.buy_price;
                    const prevClose = stats ? stats.prevClose : ltp;
                    
                    const invested = h.quantity * h.buy_price;
                    const current = h.quantity * ltp;
                    
                    const totalPl = current - invested;
                    const totalPlPct = invested > 0 ? (totalPl / invested) * 100 : 0;
                    
                    const todayPl = (ltp - prevClose) * h.quantity;
                    const todayPlPct = prevClose > 0 ? ((ltp - prevClose) / prevClose) * 100 : 0;

                    return (
                      <tr key={h.id}>
                        <td>
                            <button 
                              onClick={() => navigate(`/chart?symbol=${h.symbol}`)}
                              className="font-bold text-white hover:text-blue-400 text-left transition-colors cursor-pointer bg-transparent border-none p-0"
                            >
                              {h.symbol}
                            </button>
                            <div className="text-[10px] text-gray-500 max-w-[120px]">{h.buy_date}</div>
                            {h.reference && <div className="text-[10px] text-blue-400/80 italic mt-0.5 truncate max-w-[120px]" title={h.reference}>Ref: {h.reference}</div>}
                        </td>
                        <td className="text-right font-bold text-gray-200">{h.quantity}</td>
                        <td className="text-right text-gray-400">Rs. {h.buy_price}</td>
                        <td className="text-right">
                          <div className="font-bold text-white">Rs. {ltp}</div>
                          <div className="text-[10px] text-gray-500">Pr: Rs. {prevClose}</div>
                        </td>
                        <td className="text-right text-gray-400">Rs. {invested.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                        <td className="text-right font-bold text-white">Rs. {current.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                        <td className={`text-right font-bold ${todayPl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <div>{todayPl >= 0 ? '+' : ''}{todayPl.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                            <div className="text-[10px]">{todayPl >= 0 ? '+' : ''}{todayPlPct.toFixed(2)}%</div>
                        </td>
                        <td className={`text-right font-bold ${totalPl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <div>{totalPl >= 0 ? '+' : ''}{totalPl.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                            <div className="text-[10px]">{totalPl >= 0 ? '+' : ''}{totalPlPct.toFixed(2)}%</div>
                        </td>
                        <td className="text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => editHolding(h)} className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => removeHolding(h.id, h.symbol)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {holdings.length === 0 && !loading && (
                <div className="p-20 text-center opacity-40">
                    <Briefcase size={40} className="mx-auto mb-3" />
                    <p className="text-sm font-medium">No holdings yet. Add stocks using the search bar.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
