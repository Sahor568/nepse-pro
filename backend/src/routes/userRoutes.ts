import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// Middleware to mock auth, always using user_id 1
const mockAuth = (req: any, res: any, next: any) => {
  req.userId = 1; 
  next();
};

router.use(mockAuth);

// --- Watchlist ---
router.get('/watchlist', async (req: any, res) => {
  try {
    const db = await getDb();
    const watchlist = await db.all('SELECT * FROM watchlist WHERE user_id = ?', [req.userId]);
    res.json(watchlist);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/watchlist', async (req: any, res) => {
  try {
    const { symbol } = req.body;
    const db = await getDb();
    
    // Check if exists
    const existing = await db.get('SELECT * FROM watchlist WHERE user_id = ? AND symbol = ?', [req.userId, symbol]);
    if (existing) {
      return res.status(400).json({ error: 'Symbol already in watchlist' });
    }

    const result = await db.run('INSERT INTO watchlist (user_id, symbol) VALUES (?, ?)', [req.userId, symbol]);
    res.json({ id: result.lastID, symbol });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/watchlist/:symbol', async (req: any, res) => {
  try {
    const { symbol } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM watchlist WHERE user_id = ? AND symbol = ?', [req.userId, symbol]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Portfolio ---
router.get('/portfolio', async (req: any, res) => {
  try {
    const db = await getDb();
    const portfolio = await db.all('SELECT * FROM portfolio WHERE user_id = ?', [req.userId]);
    res.json(portfolio);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/portfolio', async (req: any, res) => {
  try {
    const { symbol, quantity, buy_price, buy_date, reference } = req.body;
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO portfolio (user_id, symbol, quantity, buy_price, buy_date, reference) VALUES (?, ?, ?, ?, ?, ?)', 
      [req.userId, symbol, quantity, buy_price, buy_date, reference || '']
    );
    res.json({ id: result.lastID, symbol, quantity, buy_price, buy_date, reference });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/portfolio/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { quantity, buy_price, buy_date, reference } = req.body;
    const db = await getDb();
    await db.run(
      'UPDATE portfolio SET quantity = ?, buy_price = ?, buy_date = ?, reference = ? WHERE id = ? AND user_id = ?', 
      [quantity, buy_price, buy_date, reference || '', id, req.userId]
    );
    res.json({ success: true, id, quantity, buy_price, buy_date, reference });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/portfolio/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM portfolio WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
