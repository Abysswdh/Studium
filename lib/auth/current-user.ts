import { getDb } from "../sqlite";
import { readSessionTokenAsync } from "./session";
import type { User } from "./user";

export type CurrentUser = User | null;

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const token = await readSessionTokenAsync();
    if (!token) return null;

    const db = getDb();
    const row = db
      .prepare(
        `
        SELECT u.id, u.email, u.display_name, u.xp, u.level, u.avatar_url
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ?
          AND datetime(s.expires_at) > datetime('now')
        `
      )
      .get(token) as any;

    if (!row) return null;
    return {
      id: Number(row.id),
      email: row.email ?? null,
      displayName: row.display_name,
      xp: Number(row.xp ?? 0),
      level: Number(row.level ?? 1),
      avatarUrl: row.avatar_url || "/blockyPng/profilePicture.png",
    };
  } catch {
    return null;
  }
}
