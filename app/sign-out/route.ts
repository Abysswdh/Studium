import { NextResponse } from "next/server";
import { clearSessionCookie, deleteSession, readSessionTokenAsync } from "../../lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = await readSessionTokenAsync();
  if (token) {
    try {
      deleteSession(token);
    } catch {
      // ignore
    }
  }

  try {
    await clearSessionCookie();
  } catch {
    // ignore
  }

  return NextResponse.redirect(new URL("/", req.url));
}
