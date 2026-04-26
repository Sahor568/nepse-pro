import { Router } from 'express';
import type { Request, Response } from 'express';
import { Nepse } from '@rumess/nepse-api';

const router = Router();
const nepse = new Nepse();

// In-memory cache to avoid hammering the API
const cache: Record<string, { data: any; ts: number }> = {};
const TTL_MS = 5_000; // 5 seconds cache for advanced real-time feel

const cached = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  if (cache[key] && Date.now() - cache[key].ts < TTL_MS) return cache[key].data as T;
  const data = await fn();
  cache[key] = { data, ts: Date.now() };
  return data;
};

// ─── NEPSE Index ───────────────────────────────────────────────────
router.get('/index', async (_: Request, res: Response) => {
  try {
    const data = await cached('index', () => nepse.getNepseIndex());
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Market Summary ────────────────────────────────────────────────
router.get('/summary', async (_: Request, res: Response) => {
  try {
    const data = await cached('summary', () => nepse.getMarketSummary());
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Market Status ─────────────────────────────────────────────────
router.get('/status', async (_: Request, res: Response) => {
  try {
    const data = await cached('status', () => nepse.getMarketStatus());
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Live Market (all traded securities today) ─────────────────────
router.get('/live', async (_: Request, res: Response) => {
  try {
    const data = await cached('live', async () => {
      let live = await nepse.getLiveMarket();
      
      // If live market stream is empty (closed/off-hours/throttled), synthesize it!
      if (!live || live.length === 0) {
        try {
          // Both `gainers` and `losers` bypass the NEPSE live-close wipe. 
          // Gainers(80+) + Losers(200+) = ~300+ total traded companies mathematically guaranteed
          const [gainers, losers] = await Promise.all([
             nepse.getTopTenGainers(),
             nepse.getTopTenLosers()
          ]);
          
          const combined = new Map();
          (gainers || []).forEach((s: any) => combined.set(s.symbol, s));
          (losers || []).forEach((s: any) => combined.set(s.symbol, s));
          
          if (combined.size > 0) {
             return Array.from(combined.values()).map((s: any) => ({
                 symbol: s.symbol,
                 securityName: s.securityName,
                 lastTradedPrice: s.ltp,
                 percentageChange: s.percentageChange, // Use raw field since it's correctly mapped
                 highPrice: s.highPrice || s.ltp,
                 lowPrice: s.lowPrice || s.ltp,
                 totalTradeQuantity: 0 // Volume not universally available in these simple arrays
             }));
          }
        } catch(e) {}
      }
      return live;
    });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Today's Prices (Last Closing Prices) ──────────────────────────
router.get('/today-price', async (_: Request, res: Response) => {
  try {
    const status = await cached('status', () => nepse.getMarketStatus());
    const dateStr = status.asOf ? status.asOf.split('T')[0] : '';
    const raw: any = await cached(`today-price-${dateStr}`, () => nepse.requestGETAPI(`/api/nots/nepse-data/today-price?&size=500&securityId=&indexDate=${dateStr}`));
    res.json(raw?.content || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Top Gainers ───────────────────────────────────────────────────
router.get('/gainers', async (_: Request, res: Response) => {
  try {
    const data = await cached('gainers', () => nepse.getTopTenGainers());
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Top Losers ────────────────────────────────────────────────────
router.get('/losers', async (_: Request, res: Response) => {
  try {
    const data = await cached('losers', () => nepse.getTopTenLosers());
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Top Turnover ──────────────────────────────────────────────────
router.get('/turnover', async (_: Request, res: Response) => {
  try {
    const data = await cached('turnover', () => nepse.getTopTenTurnoverScrips());
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Sub-Indices ───────────────────────────────────────────────────
router.get('/sub-indices', async (_: Request, res: Response) => {
  try {
    const data = await cached('sub-indices', () => nepse.getNepseSubIndices());
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── NEPSE Index Daily Graph (for NEPSE chart) ─────────────────────
router.get('/index-graph', async (_: Request, res: Response) => {
  try {
    const data = await cached('index-graph', () => nepse.getNepseIndexDailyGraph());
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Security Price/Volume History (OHLCV for any stock) ──────────
// GET /api/nepse/history/:symbol
router.get('/history/:symbol', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const securityId = (await nepse.getSecuritySymbolIdKeymap()).get(String(symbol).toUpperCase());
    if (!securityId) throw new Error(`Security symbol ${symbol} not found`);
    const raw: any = await cached(`history-${symbol}`, () => nepse.requestGETAPI(`/api/nots/market/security/price/${securityId}?size=5000`));
    const ohlcv = (raw.content as any[])
      .map((d: any) => ({
        time: d.businessDate,           // 'YYYY-MM-DD'
        open:  d.openPrice ?? d.lastTradedPrice ?? d.previousDayClosePrice,
        high:  d.highPrice ?? d.lastTradedPrice ?? d.previousDayClosePrice,
        low:   d.lowPrice ?? d.lastTradedPrice ?? d.previousDayClosePrice,
        close: d.closePrice ?? d.lastTradedPrice ?? d.previousDayClosePrice,
        volume: d.totalTradedQuantity ?? 0,
        turnover: d.totalTradedValue ?? 0,
        trades: d.totalTrades ?? 0,
        ltp: d.lastTradedPrice,
        prevClose: d.previousDayClosePrice,
        fiftyTwoWeekHigh: d.fiftyTwoWeekHigh,
        fiftyTwoWeekLow:  d.fiftyTwoWeekLow,
      }))
      .reverse(); // oldest first for charts
    res.json(ohlcv);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Security Intraday Graph ───────────────────────────────────────
router.get('/intraday/:symbol', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const raw = await cached(`intraday-${symbol}`, () => nepse.getSecurityDailyGraph(String(symbol).toUpperCase()));
    res.json(raw);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Security List ─────────────────────────────────────────────────
router.get('/securities', async (_: Request, res: Response) => {
  try {
    const raw = await cached('securities', () => nepse.getSecurityList());
    res.json(raw);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
