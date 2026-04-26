import { Router } from 'express';
import { Nepse } from '@rumess/nepse-api';
import { GoogleGenerativeAI } from '@google/generative-ai';
const router = Router();
const nepse = new Nepse();
// Caching to prevent spamming the AI
let cachedSuggestion = '';
let cacheExpiry = 0;
router.get('/insight', async (_, res) => {
    try {
        if (cacheExpiry > Date.now() && cachedSuggestion) {
            res.json({ suggestion: cachedSuggestion });
            return;
        }
        const [gainers, losers, summary] = await Promise.all([
            nepse.getTopTenGainers(),
            nepse.getTopTenLosers(),
            nepse.getMarketSummary()
        ]);
        const topG = gainers && gainers.length > 0 ? gainers.slice(0, 3).map((g) => g.symbol).join(', ') : 'None';
        const topL = losers && losers.length > 0 ? losers.slice(0, 3).map((l) => l.symbol).join(', ') : 'None';
        // Algorithmic Fallback Logic
        let ruleBasedSuggestion = '';
        const topGainerVal = gainers && gainers.length > 0 ? gainers[0] : null;
        if (topGainerVal && (topGainerVal.percentageChange > 8 || topGainerVal.percentChange > 8)) {
            ruleBasedSuggestion = `The market shows strong momentum in top stocks like ${topG}. These are heavily bought up—consider riding the trend but establish tight trailing stop-losses. Conversely, consider value-investing in oversold dips like ${topL}. Withdraw your capital when momentum breaks or RSI drops below 70 across the leading sectors.`;
        }
        else {
            ruleBasedSuggestion = `The market is relatively stable today with moderate movements. Favorable entry points might be found in ${topL} if they represent fundamentally strong companies experiencing temporary pullbacks. Look for breakouts in ${topG}. Always protect capital by withdrawing once your pre-defined 10-15% profit targets are hit.`;
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            cachedSuggestion = ruleBasedSuggestion;
            cacheExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
            res.json({ suggestion: cachedSuggestion, source: 'algorithmic' });
            return;
        }
        // Use Actual Google Generative AI!
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
You are an expert Wall Street algorithmic trading AI focused on the Nepal Stock Exchange (NEPSE).
Today's Top Gainers: ${topG}
Today's Top Losers: ${topL}
Market Volume: ${summary ? summary['Total Traded Shares'] : 'Average'}

Provide a 2-3 sentence, highly professional actionable market insight directly addressing:
1. Which specific stocks or areas to consider investing in for profit today based on momentum or oversold dips.
2. A strict guideline on when to withdraw or take profits.

Do not use formatting like markdown. Keep it concise, intelligent, and authoritative.
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        cachedSuggestion = text;
        cacheExpiry = Date.now() + 1000 * 60 * 60; // 1 hour cache to prevent burning AI tokens
        res.json({ suggestion: cachedSuggestion, source: 'ai' });
    }
    catch (e) {
        console.error("AI Error:", e);
        // If AI fails or rate limits, fallback gracefully
        res.json({ suggestion: `Market algorithms detect volatile momentum in the leading sectors. Invest carefully on dips and withdraw profits when resistance levels are hit.`, source: 'fallback' });
    }
});
export default router;
//# sourceMappingURL=aiRoutes.js.map