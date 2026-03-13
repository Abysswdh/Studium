import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./auth/password";

let db: DatabaseSync | null = null;

function ensureUsersColumns(db: DatabaseSync) {
  const cols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  const has = (name: string) => cols.some((c) => c.name === name);

  if (!has("email")) db.exec("ALTER TABLE users ADD COLUMN email TEXT;");
  if (!has("password_hash")) db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT;");
  if (!has("created_at")) db.exec("ALTER TABLE users ADD COLUMN created_at TEXT;");

  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users(email);");
  db.exec("UPDATE users SET created_at = datetime('now') WHERE created_at IS NULL;");
}

function init(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT,
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      avatar_url TEXT NOT NULL DEFAULT '/pfp.png',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Keep older local DBs working after schema changes.
  ensureUsersColumns(db);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Seed a demo account for quick testing.
  const hasDemo = db.prepare("SELECT 1 FROM users WHERE email = ?").get("demo@studium.local");
  if (!hasDemo) {
    db.prepare(
      "INSERT INTO users (email, display_name, password_hash, xp, level, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
    ).run("demo@studium.local", "Demo User", hashPassword("demo1234"), 1350, 12, "/pfp.png");
  }
}

export function getDb(): DatabaseSync {
  if (db) return db;

  const desiredDir = path.join(process.cwd(), "data");
  let dataDir = desiredDir;

  try {
    fs.mkdirSync(desiredDir, { recursive: true });
    fs.accessSync(desiredDir, fs.constants.W_OK);
  } catch {
    // Serverless/readonly filesystems (e.g. Vercel) typically only allow writes in /tmp.
    dataDir = path.join(os.tmpdir(), "studium");
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "studium.db");

  db = new DatabaseSync(dbPath);
  init(db);
  return db;
}
