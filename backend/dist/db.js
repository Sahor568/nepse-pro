import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
export async function getDb() {
    return open({
        filename: './nepse.db',
        driver: sqlite3.Database
    });
}
export async function initDb() {
    const db = await getDb();
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    );
    
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      symbol TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      symbol TEXT,
      quantity REAL,
      buy_price REAL,
      buy_date TEXT,
      reference TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
    // Migrate existing databases to add reference column if it doesn't exist
    try {
        await db.exec(`ALTER TABLE portfolio ADD COLUMN reference TEXT;`);
    }
    catch (e) {
        // Ignore error if column already exists
    }
    // Create a mock user if none exists
    const count = await db.get(`SELECT COUNT(*) as count FROM users`);
    if (count.count === 0) {
        await db.run(`INSERT INTO users (name, email, password) VALUES ('Demo User', 'demo@example.com', 'password')`);
    }
}
//# sourceMappingURL=db.js.map