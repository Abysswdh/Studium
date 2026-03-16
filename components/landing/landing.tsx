"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Waves from "../reactbits/Waves";

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Landing() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    document.body.classList.add("nav-mode");
    document.body.classList.remove("grid-mode");
    document.body.dataset.view = "dashboard";
    document.body.classList.remove("drawer-open");
  }, []);

  const enterTo = async (to: string) => {
    if (entering) return;
    setEntering(true);
    try {
      localStorage.setItem("studium:pref_fullscreen", "1");
    } catch {
      // ignore
    }

    try {
      const el = document.documentElement as any;
      const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (!document.fullscreenElement && typeof fn === "function") {
        const p = fn.call(el);
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
    } catch {
      // ignore
    }

    window.setTimeout(() => router.push(to), 380);
  };

  const enter = async () => enterTo("/sign-in");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.repeat) return;

      if (e.key === "Enter" || e.key.toLowerCase() === "e") {
        e.preventDefault();
        void enter();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entering]);

  const featureCards = useMemo(
    () => [
      { icon: "fa-solid fa-list-check", title: "Daily Routine", desc: "Auto steps (Focus -> Notes -> Review) from deadlines + schedules." },
      { icon: "fa-solid fa-stopwatch", title: "Pomodoro Co-op", desc: "Focus together, linked to quests/tasks, with shared streak pressure." },
      { icon: "fa-solid fa-note-sticky", title: "Notes Capture", desc: "Fast capture after sessions, connected to material & tasks." },
      { icon: "fa-solid fa-crosshairs", title: "Battle", desc: "1v1 quizzes from a question bank. Win XP, climb ranks." },
      { icon: "fa-solid fa-people-group", title: "Guild", desc: "Study rooms + nudges. Opt-in accountability when someone leaves early." },
      { icon: "fa-solid fa-calendar-days", title: "Schedules", desc: "Agenda + deadlines that feed your routine every day." },
    ],
    []
  );

  return (
    <div className="relative min-h-screen text-white">
      <Waves
        className="opacity-55"
        backgroundColor="transparent"
        lineColor="rgba(255,255,255,0.08)"
        waveAmpX={28}
        waveAmpY={14}
        xGap={12}
        yGap={34}
        waveSpeedX={0.0105}
        waveSpeedY={0.0045}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b1020]/55 via-black/60 to-black/85" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(1100px_650px_at_18%_18%,rgba(34,211,238,0.22),transparent_60%),radial-gradient(900px_700px_at_80%_24%,rgba(168,85,247,0.22),transparent_60%),radial-gradient(900px_700px_at_50%_85%,rgba(251,191,36,0.10),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background:radial-gradient(1px_1px_at_20%_30%,rgba(255,255,255,0.45),transparent_40%),radial-gradient(1px_1px_at_40%_60%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(1px_1px_at_65%_25%,rgba(255,255,255,0.40),transparent_40%),radial-gradient(1px_1px_at_80%_65%,rgba(255,255,255,0.35),transparent_40%)]" />

      <div
        className={clsx(
          "relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-8 transition-all duration-500",
          entering && "opacity-0 blur-sm translate-y-2"
        )}
      >
        <header className="flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="group inline-flex items-baseline gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Back to top"
          >
            <span className="bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text font-[900] tracking-[0.22em] text-transparent">
              STUDIUM
            </span>
            <span className="text-xs font-[700] text-white/55">v1</span>
          </button>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Landing navigation">
            <a
              href="#about"
              className="rounded-lg px-3 py-2 text-sm font-[700] text-white/70 transition hover:bg-white/5 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/35"
            >
              About
            </a>
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm font-[700] text-white/70 transition hover:bg-white/5 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/35"
            >
              Features
            </a>
            <a
              href="#faq"
              className="rounded-lg px-3 py-2 text-sm font-[700] text-white/70 transition hover:bg-white/5 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/35"
            >
              FAQ
            </a>
            <Link
              href="/sign-in"
              onClick={(e) => {
                e.preventDefault();
                void enterTo("/sign-in");
              }}
              className="rounded-lg px-3 py-2 text-sm font-[800] text-white/70 transition hover:bg-white/5 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/35"
            >
              Sign in
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                void enterTo("/register");
              }}
              className="hidden rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-[900] text-white/85 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/45 md:inline-flex"
            >
              Register
            </Link>
            <button
              type="button"
              onClick={enter}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 px-4 py-2 text-sm font-[900] text-black shadow-[0_20px_80px_rgba(168,85,247,0.25)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <span>Enter Studium Focus Mode</span>
              <span className="rounded-md bg-black/10 px-2 py-1 text-[11px] font-[900] tracking-wide">Enter</span>
            </button>
          </div>
        </header>

        <main id="top" className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
          <section className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-[900] text-white/80 backdrop-blur-xl">
              <i className="fa-solid fa-wand-magic-sparkles text-white/80" aria-hidden="true"></i>
              <span>Study like a game • Finish like a pro</span>
            </div>

              <h1 className="text-balance text-4xl font-[900] leading-[1.05] tracking-[-0.03em] md:text-6xl">
                Turn deadlines into a{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent [text-shadow:0_20px_60px_rgba(0,0,0,0.55)]">
                  daily routine
                </span>
                .
              </h1>

            <p className="max-w-xl text-pretty text-base font-[700] leading-relaxed text-white/70 md:text-lg">
              Studium auto-builds your routine from schedules + deadlines, then keeps you coming back with XP, streaks, battles, and guild
              accountability.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={enter}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 px-6 py-3 text-sm font-[900] text-black shadow-[0_22px_90px_rgba(34,211,238,0.18)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
                <span>Enter Studium Focus Mode</span>
              </button>

              <a
                href="#features"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/14 bg-white/10 px-6 py-3 text-sm font-[900] text-white/85 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/45"
              >
                <i className="fa-solid fa-star" aria-hidden="true"></i>
                <span>See features</span>
              </a>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-xs font-[900] text-white/70">
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-2 text-cyan-50/90">XP + Levels</span>
              <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-2 text-violet-50/90">Streaks + Strikes</span>
              <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-3 py-2 text-fuchsia-50/90">Co-focus</span>
              <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-amber-50/90">Battle / Match</span>
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-2 text-emerald-50/90">Guild</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-[800] text-white/55">
              <i className="fa-solid fa-wand-sparkles text-white/55" aria-hidden="true"></i>
              <span>First time? You'll get a quick onboarding to set preferences and learn Focus Mode.</span>
            </div>
          </section>

          <aside className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/10 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="absolute inset-0 opacity-75 [background:radial-gradient(700px_500px_at_20%_20%,rgba(34,211,238,0.20),transparent_60%),radial-gradient(900px_650px_at_75%_35%,rgba(168,85,247,0.20),transparent_60%),radial-gradient(900px_650px_at_60%_90%,rgba(251,191,36,0.10),transparent_60%)]" />
            <div className="pointer-events-none absolute -right-10 -top-6 opacity-95">
              <div className="floaty relative h-[220px] w-[220px] md:h-[260px] md:w-[260px]">
                <Image src="/blockyPng/greetings.png" alt="" fill className="object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.45)]" priority />
              </div>
            </div>
            <div className="relative flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-[900] tracking-wide text-white/85">Today’s Routine</div>
                <div className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[11px] font-[900] text-white/70 backdrop-blur-xl">
                  Demo
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { t: "Now", d: "Focus 25 | Calculus", xp: "+120 XP" },
                  { t: "Next", d: "Battle warmup", xp: "+60 XP" },
                  { t: "Later", d: "Capture notes", xp: "+40 XP" },
                  { t: "Plan", d: "Guild co-focus", xp: "+80 XP" },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                    <div className="text-xs font-[900] text-white/60">{x.t}</div>
                    <div className="mt-2 text-sm font-[900] text-white/90">{x.d}</div>
                    <div className="mt-3 text-xs font-[900] text-white/55">{x.xp}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-fire-flame-curved text-white/80" aria-hidden="true"></i>
                  <div>
                    <div className="text-xs font-[900] text-white/55">Streak</div>
                    <div className="text-sm font-[900] text-white/90">12 days</div>
                  </div>
                </div>
                <div className="text-xs font-[900] text-white/60">Press Enter to start</div>
              </div>
            </div>
          </aside>
        </main>

        <section id="about" className="grid grid-cols-1 gap-6 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-[900] tracking-[0.22em] text-white/60">ABOUT</div>
            <div className="text-2xl font-[900] tracking-[-0.02em] text-white/92 md:text-3xl">
              A focus-first dashboard for students who need structure.
            </div>
          </div>
          <div className="text-sm font-[700] leading-relaxed text-white/70 md:text-base">
            The core is a Daily Routine that turns tasks, schedules, and deadlines into concrete steps. Then we keep it sticky with
            gamification (XP, levels, streaks) and optional social accountability (co-focus, guild nudges).
          </div>
        </section>

        <section id="focus-mode" className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-[900] tracking-[0.22em] text-white/60">FOCUS MODE</div>
              <div className="mt-3 text-2xl font-[900] tracking-[-0.02em] text-white/92 md:text-3xl">What you get when you press Enter.</div>
              <div className="mt-2 text-sm font-[800] text-white/65">A routine engine + game loop that keeps you consistent.</div>
            </div>
            <a
              href="#features"
              className="mt-4 inline-flex items-center gap-2 self-start rounded-xl border border-white/14 bg-black/25 px-4 py-2 text-xs font-[900] text-white/80 transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/45 md:mt-0"
            >
              <i className="fa-solid fa-sparkles" aria-hidden="true"></i>
              <span>See full feature list</span>
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: "Auto-build your day",
                desc: "Your deadlines + schedule become a concrete checklist: Focus -> Notes -> Review.",
                img: "/blockyPng/tasks.png",
                tone: "from-cyan-200/25 to-cyan-200/5",
              },
              {
                title: "Deep focus sessions",
                desc: "Pomodoro in a clean fullscreen shell. Less tab chaos, more momentum.",
                img: "/blockyPng/study.png",
                tone: "from-violet-200/25 to-violet-200/5",
              },
              {
                title: "Fun accountability",
                desc: "XP, streaks, battles, and guild nudges — optional, but motivating.",
                img: "/blockyPng/battle.png",
                tone: "from-amber-200/25 to-amber-200/5",
              },
            ].map((x) => (
              <div key={x.title} className={clsx("rounded-3xl border border-white/10 bg-gradient-to-b p-6", x.tone)}>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-base font-[900] text-white/90">{x.title}</div>
                  <div className="relative h-12 w-12 shrink-0">
                    <Image src={x.img} alt="" fill className="object-contain" />
                  </div>
                </div>
                <div className="mt-3 text-sm font-[800] leading-relaxed text-white/70">{x.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-[900] tracking-[0.22em] text-white/60">FEATURES</div>
              <div className="mt-3 text-2xl font-[900] tracking-[-0.02em] text-white/92 md:text-3xl">Designed to keep you in motion.</div>
            </div>
            <div className="hidden text-sm font-[900] text-white/60 md:block">Keyboard-first | Glass UI | Studium Focus Mode</div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((f) => (
              <div key={f.title} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-black/25">
                    <i className={f.icon} aria-hidden="true"></i>
                  </span>
                  <div className="text-base font-[900] text-white/90">{f.title}</div>
                </div>
                <div className="mt-3 text-sm font-[700] leading-relaxed text-white/70">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
          <div className="text-xs font-[900] tracking-[0.22em] text-white/60">FAQ</div>
          <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { q: "Do I need an account?", a: "Yes. Sign in (or register) before entering Studium Focus Mode." },
              { q: "Is it only for students?", a: "It's designed for students, but works for anyone who needs a daily routine." },
              { q: "What makes it different?", a: "Routine is the core: concrete steps every day, with game-like stickiness." },
              { q: "How do I start?", a: "Press Enter, sign in (or register), then you'll enter Studium Focus Mode." },
            ].map((x) => (
              <div key={x.q} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-[900] text-white/90">{x.q}</div>
                <div className="mt-2 text-sm font-[700] text-white/70">{x.a}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 pb-10 pt-4 md:flex-row">
          <div className="text-xs font-[900] tracking-wide text-white/55">Studium | Prototype</div>
          <button
            type="button"
            onClick={enter}
            className="inline-flex items-center gap-2 rounded-xl border border-white/14 bg-white/10 px-4 py-2 text-xs font-[900] text-white/85 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/45"
          >
            <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
            <span>Press Enter to enter Studium Focus Mode</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
