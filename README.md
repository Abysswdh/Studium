# Studium (Next.js + Tailwind + SQLite mock)

This is a frontend-first prototype of **Studium** (Study like a game, finish like a pro) migrated from vanilla HTML/CSS/JS to **Next.js (App Router)** + **Tailwind CSS**, with a small **SQLite** file used as a mock user database.

## Run locally

Prereqs:
- Node.js **22+** (uses the built-in `node:sqlite` module)

Install & start:
- `npm.cmd install`
- `npm.cmd run dev`
- Open `http://localhost:3000`

Notes:
- If PowerShell blocks `npm` (because `npm.ps1` is disabled), use `npm.cmd` as above.
- The SQLite DB is created/seeded at `data/studium.db` (ignored by git).

## Project structure

- `C:\\Users\\putra\\Desktop\\test\\app\\page.tsx` — main UI markup (server-rendered)
- `C:\\Users\\putra\\Desktop\\test\\app\\globals.css` — Tailwind directives + legacy glassmorphism styles
- `C:\\Users\\putra\\Desktop\\test\\public\\studium-client.js` — legacy client behavior (keyboard nav, SFX, boot, wallpaper switching)
- `C:\\Users\\putra\\Desktop\\test\\lib\\sqlite.ts` — SQLite init + seed
- `C:\\Users\\putra\\Desktop\\test\\lib\\mock-user.ts` — mock user query
- `C:\\Users\\putra\\Desktop\\test\\public\\bg\\` / `C:\\Users\\putra\\Desktop\\test\\public\\sound\\` — wallpapers & audio

## Vanilla backup

The original vanilla prototype snapshot is saved under:
- `C:\\Users\\putra\\Desktop\\test\\backup\\vanilla-20260313-000102`

