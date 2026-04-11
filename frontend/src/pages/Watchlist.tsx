import React, { useState, useEffect } from 'react';
import { Star, Bell, BellOff, Trash2, TrendingUp, TrendingDown, LayoutGrid, List, Search, Plus } from 'lucide-react';
import StockSearch from '../components/StockSearch';
import { NEPSE_BASE } from '../apiConfig';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<any[]>(() => JSON.parse(localStorage.getItem('watchlist_data') || '[]'));
  const [livePrices, setLivePrices] = useState<Record<string, any>>({});

  useEffect(() => {
    localStorage.setItem('watchlist_data', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    fetch(`${NEPSE_BASE}/live`)
      .then(res => res.json())
      .then(data => {
        const prices: Record<string, any> = {};
        data.forEach((s: any) => { prices[s.symbol] = s; });
        setLivePrices(prices);
      });
  }, []);

  const addToWatchlist = (stock: any) => {
    if (!watchlist.find(s => s.symbol === stock.symbol)) {
      setWatchlist([...watchlist, { ...stock, alert: false }]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s.symbol !== symbol));
  };

  const toggleAlert = (symbol: string) => {
    setWatchlist(watchlist.map(s => s.symbol === symbol ? { ...s, alert: !s.alert } : s));
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '.2rem' }}>My Watchlist</h1>
          <p style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>Track your favorite NEPSE scrips</p>
        </div>
        
        <StockSearch 
          onSelect={addToWatchlist} 
          placeholder="Add stock to watchlist..." 
          className="shadow-2xl shadow-black/50"
        />
      </div>

      {watchlist.length === 0 ? (
        <div className="card p-20 flex flex-col items-center justify-center text-center opacity-60">
           <Star size={48} className="text-gray-600 mb-4" />
           <h3 className="text-lg font-bold text-white mb-2">Watchlist is empty</h3>
           <p className="text-sm text-gray-400 max-w-xs">Use the search bar above to add any of the 300+ available NEPSE stocks to your tracking list.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {watchlist.map(stock => {
            const live = livePrices[stock.symbol];
            const price = live?.lastTradedPrice || '---';
            const change = live?.percentageChange || 0;
            const up = change >= 0;

            return (
              <div key={stock.symbol} className="card p-5 animate-fadeUp relative group overflow-hidden">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{stock.symbol}</h3>
                    <p style={{ fontSize: '.75rem', color: 'var(--color-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.securityName}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button onClick={() => toggleAlert(stock.symbol)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: stock.alert ? 'var(--color-blue)' : 'var(--color-muted)' }}>
                      {stock.alert ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => removeFromWatchlist(stock.symbol)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }} className="hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ fontSize: '.7rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '.2rem' }}>Last Price</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{price !== '---' ? `Rs. ${price}` : price}</p>
                  </div>
                  <div className="text-right">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', color: up ? 'var(--color-green)' : 'var(--color-red)', fontWeight: 800 }}>
                      {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {up ? '+' : ''}{change}%
                    </div>
                  </div>
                </div>

                {/* Subtle background decoration */}
                <div style={{ position: 'absolute', right: '-10%', bottom: '-10%', fontSize: '5rem', fontWeight: 900, color: '#fff', opacity: .03, pointerEvents: 'none' }}>{stock.symbol}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
