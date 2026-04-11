import { Router } from 'express';
import { Nepse } from '@rumess/nepse-api';
const router = Router();
const nepse = new Nepse();
// In-memory cache to avoid hammering the API
const cache = {};
const TTL_MS = 60_000; // 1 minute cache
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
        const data = await cached('live', () => nepse.getLiveMarket());
        res.json(data);
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