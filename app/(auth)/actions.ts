"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie, createSession, deleteSession, readSessionTokenAsync, setSessionCookie } from "../../lib/auth/session";
import { authenticate, createUser, getUserByEmail } from "../../lib/auth/user";
import { hashPassword } from "../../lib/auth/password";

function cleanEmail(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

function cleanName(v: unknown) {
  return String(v ?? "").trim();
}

export async function registerAction(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const displayName = cleanName(formData.get("displayName"));
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@")) redirect(`/register?error=invalid_email`);
  if (!displayName || displayName.length < 2) redirect(`/register?error=invalid_name`);
  if (!password || password.length < 6) redirect(`/register?error=weak_password`);

  const existing = getUserByEmail(email);
  if (existing) redirect(`/register?error=exists`);

  const user = createUser({ email, displayName, passwordHash: hashPassword(password) });
  const token = createSession(user.id);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function signInAction(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect(`/sign-in?error=missing`);

  const user = authenticate(email, password);
  if (!user) redirect(`/sign-in?error=invalid`);

  const token = createSession(user.id);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function signOutAction() {
  const token = await readSessionTokenAsync();
  if (token) deleteSession(token);
  await clearSessionCookie();
  redirect("/");
}
