import { getDb } from "../sqlite";
import { verifyPassword } from "./password";

export type User = {
  id: number;
  email: string | null;
  displayName: string;
  xp: number;
  level: number;
  avatarUrl: string;
};

const DEFAULT_AVATAR_URL = "/blockyPng/profilePicture.png";

function mapUser(row: any): User {
  return {
    id: Number(row.id),
    email: row.email ?? null,
    displayName: row.display_name,
    xp: Number(row.xp ?? 0),
    level: Number(row.level ?? 1),
    avatarUrl: row.avatar_url || DEFAULT_AVATAR_URL,
  };
}

export function getUserById(id: number): User | null {
  const db = getDb();
  const row = db
    .prepare("SELECT id, email, display_name, xp, level, avatar_url FROM users WHERE id = ?")
    .get(id) as any;
  if (!row) return null;
  return mapUser(row);
}

export function getUserByEmail(email: string): (User & { passwordHash: string | null }) | null {
  const db = getDb();
  const row = db
    .prepare("SELECT id, email, display_name, password_hash, xp, level, avatar_url FROM users WHERE email = ?")
    .get(email) as any;
  if (!row) return null;
  return { ...mapUser(row), passwordHash: row.password_hash ?? null };
}

export function createUser(input: { email: string; displayName: string; passwordHash: string }): User {
  const db = getDb();
  const res = db
    .prepare("INSERT INTO users (email, display_name, password_hash, xp, level, avatar_url) VALUES (?, ?, ?, 0, 1, ?)")
    .run(input.email, input.displayName, input.passwordHash, DEFAULT_AVATAR_URL);

  const id = Number(res.lastInsertRowid);
  return (
    getUserById(id) ?? {
      id,
      email: input.email,
      displayName: input.displayName,
      xp: 0,
      level: 1,
      avatarUrl: DEFAULT_AVATAR_URL,
    }
  );
}

export function authenticate(email: string, password: string): User | null {
  const u = getUserByEmail(email);
  if (!u?.passwordHash) return null;
  if (!verifyPassword(password, u.passwordHash)) return null;
  const { passwordHash: _ph, ...user } = u;
  return user;
}

