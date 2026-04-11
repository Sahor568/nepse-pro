import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, TrendingDown, Plus, Trash2, DollarSign, PieChart, Activity, Loader2 } from 'lucide-react';
import StockSearch from '../components/StockSearch';
import { NEPSE_BASE } from '../apiConfig';

const Portfolio = () => {
  const [holdings, setHoldings] = useState<any[]>(() => JSON.parse(localStorage.getItem('portfolio_data') || '[]'));
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('portfolio_data', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    fetch(`${NEPSE_BASE}/live`)
      .then(res => res.json())
      .then(data => {
        const prices: Record<string, number> = {};
        data.forEach((s: any) => { prices[s.symbol] = s.lastTradedPrice; });
        setLivePrices(prices);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addHolding = (stock: any) => {
    const qty = prompt(`Enter quantity for ${stock.symbol}:`, "10");
    const price = prompt(`Enter avg. buy price for ${stock.symbol}:`, "500");
    
    if (qty && price) {
      setHoldings([...holdings, {
        symbol: stock.symbol,
        name: stock.securityName,
        quantity: parseInt(qty),
        avgPrice: parseFloat(price)
      }]);
    }
  };

  const removeHolding = (symbol: string) => {
    setHoldings(holdings.filter(h => h.symbol !== symbol));
  };

  const totalInvestment = holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
  const currentValue = holdings.reduce((sum, h) => sum + (h.quantity * (livePrices[h.symbol] || h.avgPrice)), 0);
  const totalPL = currentValue - totalInvestment;
  const plPercentage = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <PortfolioCard title="Total Investment" value={`Rs. ${totalInvestment.toLocaleString()}`} sub="Cost basis" positive={true} icon={DollarSign} />
        <PortfolioCard title="Current Value" value={`Rs. ${currentValue.toLocaleString()}`} sub="Market value" positive={true} icon={PieChart} />
        <PortfolioCard title="Total P&L" value={`Rs. ${totalPL.toLocaleString()}`} sub={`${plPercentage.toFixed(2)}% overall`} positive={totalPL >= 0} icon={Activity} />
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
                <th className="text-right">LTP</th>
                <th className="text-right">Invested</th>
                <th className="text-right">Current</th>
                <th className="text-right">P&L</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
                const ltp = livePrices[h.symbol] || h.avgPrice;
                const invested = h.quantity * h.avgPrice;
                const current = h.quantity * ltp;
                const pl = current - invested;
                const plPct = (pl / invested) * 100;
                return (
                  <tr key={h.symbol}>
                    <td>
                        <div className="font-bold text-white">{h.symbol}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{h.name}</div>
                    </td>
                    <td className="text-right font-bold text-gray-200">{h.quantity}</td>
                    <td className="text-right text-gray-400">Rs. {h.avgPrice}</td>
                    <td className="text-right font-bold text-white">Rs. {ltp}</td>
                    <td className="text-right text-gray-400">Rs. {invested.toLocaleString()}</td>
                    <td className="text-right font-bold text-white">Rs. {current.toLocaleString()}</td>
                    <td className={`text-right font-bold ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <div>{pl >= 0 ? '+' : ''}{pl.toLocaleString()}</div>
                        <div className="text-[10px]">{pl >= 0 ? '+' : ''}{plPct.toFixed(2)}%</div>
                    </td>
                    <td className="text-center">
                      <button onClick={() => removeHolding(h.symbol)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {holdings.length === 0 && (
            <div className="p-20 text-center opacity-40">
                <Briefcase size={40} className="mx-auto mb-3" />
                <p className="text-sm font-medium">No holdings yet. Add stocks using the search bar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
