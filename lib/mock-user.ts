import type { User } from "./auth/user";

export type MockUser = {
  id: number;
  displayName: string;
  xp: number;
  level: number;
  avatarUrl: string;
};

// Backward-compatible shim (the app now supports real auth).
export function guestUser(): User {
  return { id: 0, email: null, displayName: "Guest", xp: 0, level: 1, avatarUrl: "/blockyPng/profilePicture.png" };
}

