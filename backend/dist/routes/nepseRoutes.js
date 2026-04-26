import { Router } from 'express';
import { Nepse } from '@rumess/nepse-api';
const router = Router();
const nepse = new Nepse();
// In-memory cache to avoid hammering the API
const cache = {};
const TTL_MS = 5_000; // 5 seconds cache for advanced real-time feel
const cached = async (key, fn) => {
    if (cache[key] && Date.now() - cache[key].ts < TTL_MS)
        return cache[key].data;
    const data = await fn();
    cache[key] = { data, ts: Date.now() };
    return data;
};
// ─── NEPSE Index ───────────────────────────────────────────────────
router.get('/index', async (_, res) => {
    try {
        const data = await cached('index', () => nepse.getNepseIndex());
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Market Summary ────────────────────────────────────────────────
router.get('/summary', async (_, res) => {
    try {
        const data = await cached('summary', () => nepse.getMarketSummary());
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Market Status ─────────────────────────────────────────────────
router.get('/status', async (_, res) => {
    try {
        const data = await cached('status', () => nepse.getMarketStatus());
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Live Market (all traded securities today) ─────────────────────
router.get('/live', async (_, res) => {
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
                    (gainers || []).forEach((s) => combined.set(s.symbol, s));
                    (losers || []).forEach((s) => combined.set(s.symbol, s));
                    if (combined.size > 0) {
                        return Array.from(combined.values()).map((s) => ({
                            symbol: s.symbol,
                            securityName: s.securityName,
                            lastTradedPrice: s.ltp,
                            percentageChange: s.percentageChange, // Use raw field since it's correctly mapped
                            highPrice: s.highPrice || s.ltp,
                            lowPrice: s.lowPrice || s.ltp,
                            totalTradeQuantity: 0 // Volume not universally available in these simple arrays
                        }));
                    }
                }
                catch (e) { }
            }
            return live;
        });
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Today's Prices (Last Closing Prices) ──────────────────────────
router.get('/today-price', async (_, res) => {
    try {
        const raw = await cached('today-price', () => nepse.requestGETAPI('/api/nots/nepse-data/today-price?&size=500&securityId=&indexDate='));
        res.json(raw?.content || []);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Top Gainers ───────────────────────────────────────────────────
router.get('/gainers', async (_, res) => {
    try {
        const data = await cached('gainers', () => nepse.getTopTenGainers());
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Top Losers ────────────────────────────────────────────────────
router.get('/losers', async (_, res) => {
    try {
        const data = await cached('losers', () => nepse.getTopTenLosers());
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Top Turnover ──────────────────────────────────────────────────
router.get('/turnover', async (_, res) => {
    try {
        const data = await cached('turnover', () => nepse.getTopTenTurnoverScrips());
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Sub-Indices ───────────────────────────────────────────────────
router.get('/sub-indices', async (_, res) => {
    try {
        const data = await cached('sub-indices', () => nepse.getNepseSubIndices());
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── NEPSE Index Daily Graph (for NEPSE chart) ─────────────────────
router.get('/index-graph', async (_, res) => {
    try {
        const data = await cached('index-graph', () => nepse.getNepseIndexDailyGraph());
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Security Price/Volume History (OHLCV for any stock) ──────────
// GET /api/nepse/history/:symbol
router.get('/history/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const securityId = (await nepse.getSecuritySymbolIdKeymap()).get(String(symbol).toUpperCase());
        if (!securityId)
            throw new Error(`Security symbol ${symbol} not found`);
        const raw = await cached(`history-${symbol}`, () => nepse.requestGETAPI(`/api/nots/market/security/price/${securityId}?size=5000`));
        // Transform to OHLCV for lightweight-charts
        const ohlcv = raw.content
            .map((d) => ({
            time: d.businessDate, // 'YYYY-MM-DD'
            open: d.openPrice,
            high: d.highPrice,
            low: d.lowPrice,
            close: d.closePrice,
            volume: d.totalTradedQuantity,
            turnover: d.totalTradedValue,
            trades: d.totalTrades,
            ltp: d.lastTradedPrice,
            prevClose: d.previousDayClosePrice,
            fiftyTwoWeekHigh: d.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: d.fiftyTwoWeekLow,
        }))
            .reverse(); // oldest first for charts
        res.json(ohlcv);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Security Intraday Graph ───────────────────────────────────────
router.get('/intraday/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const raw = await cached(`intraday-${symbol}`, () => nepse.getSecurityDailyGraph(String(symbol).toUpperCase()));
        res.json(raw);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ─── Security List ─────────────────────────────────────────────────
router.get('/securities', async (_, res) => {
    try {
        const raw = await cached('securities', () => nepse.getSecurityList());
        res.json(raw);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
export default router;
//# sourceMappingURL=nepseRoutes.js.map