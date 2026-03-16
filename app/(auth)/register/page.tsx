import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "../actions";
import FocusModeForm from "../../../components/auth/focus-mode-form";
import { getCurrentUser } from "../../../lib/auth/current-user";

const ERROR_TEXT: Record<string, string> = {
  invalid_email: "Please enter a valid email address.",
  invalid_name: "Display name must be at least 2 characters.",
  weak_password: "Password must be at least 6 characters.",
  exists: "An account with that email already exists.",
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const existing = await getCurrentUser();
  if (existing) redirect("/dashboard");

  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";
  const errorText = ERROR_TEXT[error] || "";

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-[900] tracking-[0.22em] text-white/60">STUDIUM</div>
          <h1 className="mt-3 text-3xl font-[900] tracking-[-0.02em]">Create account</h1>
          <p className="mt-2 text-sm font-[700] text-white/65">Start your streak with a real profile.</p>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-white/12 bg-white/10 px-4 py-2 text-xs font-[900] text-white/80 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/45"
        >
          Back
        </Link>
      </div>

      {errorText ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-[800] text-red-100/90">{errorText}</div>
      ) : null}

      <FocusModeForm action={registerAction} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-[900] tracking-wide text-white/70">Display name</span>
          <input
            name="displayName"
            type="text"
            required
            autoComplete="nickname"
            className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-[800] text-white/90 outline-none focus:ring-2 focus:ring-white/35"
            placeholder="Abyasa"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-[900] tracking-wide text-white/70">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-[800] text-white/90 outline-none focus:ring-2 focus:ring-white/35"
            placeholder="you@school.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-[900] tracking-wide text-white/70">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-[800] text-white/90 outline-none focus:ring-2 focus:ring-white/35"
            placeholder="min 6 characters"
          />
        </label>

        <button
          type="submit"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-2xl bg-white text-sm font-[900] text-black transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Create account & enter Studium Focus Mode
        </button>

        <div className="mt-2 text-sm font-[800] text-white/65">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-white/90 underline underline-offset-4 hover:text-white">
            Sign in
          </Link>
          .
        </div>
      </FocusModeForm>
    </div>
  );
}

