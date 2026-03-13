import { getDb } from "./sqlite";

export type MockUser = {
  id: number;
  displayName: string;
  xp: number;
  level: number;
  avatarUrl: string;
};

export async function getMockUser(): Promise<MockUser> {
  try {
    const db = getDb();
    const row = db.prepare("SELECT id, display_name, xp, level, avatar_url FROM users WHERE id = 1").get() as
      | {
          id: number;
          display_name: string;
          xp: number;
          level: number;
          avatar_url: string;
        }
      | undefined;

    if (!row) {
      return { id: 1, displayName: "Guest", xp: 0, level: 1, avatarUrl: "/pfp.png" };
    }

    return {
      id: row.id,
      displayName: row.display_name,
      xp: row.xp,
      level: row.level,
      avatarUrl: row.avatar_url || "/pfp.png",
    };
  } catch {
    // Never break rendering if SQLite can't initialize in a given environment.
    return { id: 1, displayName: "Guest", xp: 0, level: 1, avatarUrl: "/pfp.png" };
  }
}
