import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

let db: DatabaseSync | null = null;

function init(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      display_name TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      avatar_url TEXT NOT NULL DEFAULT '/pfp.png'
    );
  `);

  const hasUser = db.prepare("SELECT 1 FROM users WHERE id = 1").get();
  if (!hasUser) {
    db.prepare("INSERT INTO users (id, display_name, xp, level, avatar_url) VALUES (1, ?, ?, ?, ?)").run(
      "Abyasa Wedha",
      1350,
      12,
      "/pfp.png"
    );
  }
}

export function getDb(): DatabaseSync {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "studium.db");

  db = new DatabaseSync(dbPath);
  init(db);
  return db;
}

