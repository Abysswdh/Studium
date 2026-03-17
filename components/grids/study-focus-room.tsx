"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "ready" | "focus" | "break";

const LS_KEY = "studium:study_focus_room:v1";
const CONFIG_KEY = "studium:study_focus_config:v1";
const LOCAL_XP_KEY = "studium:local_xp:v1";
const CHAT_KEY = "studium:study_room_chat:v1";

function getScopedKey(base: string) {
  if (typeof document === "undefined") return base;
  const fromBody = document.body?.dataset?.userId || "";
  const fromRoot = document.querySelector<HTMLElement>(".shellRoot")?.dataset?.userId || "";
  const userId = String(fromBody || fromRoot || "").trim();
  return userId ? `${base}:u${userId}` : base;
}

function safeLocalGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
}

function localDayKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type ChatMessage = {
  id: string;
  at: number;
  from: "you" | "system" | "buddy";
  text?: string;
  stickerSrc?: string;
};

function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

type StoredState = {
  v: 1;
  day: string; // local YYYY-MM-DD
  sessionsToday: number;
  studySecondsToday: number;
  phase: Phase;
  isRunning: boolean;
  remainingSec: number;
  endAtMs: number | null;
  runSeconds: number; // seconds spent in the current focus run (does not count breaks)
  focusDurationSec: number;
  breakDurationSec: number;
  strictMode: boolean;
  goals: string[];
  goalsDone: boolean[];
  rewardClaimed: boolean;
  rewardClaimedXp: number;
  lastRecap: {
    endedAt: number;
    focusSeconds: number;
    goals: string[];
    goalsDone: boolean[];
    strictMode: boolean;
    claimedXp: number;
    claimedAt: number | null;
  } | null;
};

function defaultState(): StoredState {
  return {
    v: 1,
    day: localDayKey(),
    sessionsToday: 0,
    studySecondsToday: 0,
    phase: "ready",
    isRunning: false,
    remainingSec: 25 * 60,
    endAtMs: null,
    runSeconds: 0,
    focusDurationSec: 25 * 60,
    breakDurationSec: 5 * 60,
    strictMode: false,
    goals: [],
    goalsDone: [],
    rewardClaimed: false,
    rewardClaimedXp: 0,
    lastRecap: null,
  };
}

function safeParse(json: string | null): StoredState | null {
  if (!json) return null;
  try {
    const raw = JSON.parse(json) as Partial<StoredState>;
    if (raw?.v !== 1) return null;
    const s = { ...defaultState(), ...raw } as StoredState;
    if (!s.day) s.day = localDayKey();
    if (!s.focusDurationSec || s.focusDurationSec < 60) s.focusDurationSec = 25 * 60;
    if (!s.breakDurationSec || s.breakDurationSec < 30) s.breakDurationSec = 5 * 60;
    if (typeof s.remainingSec !== "number" || s.remainingSec < 0) s.remainingSec = s.focusDurationSec;
    if (s.phase !== "ready" && s.phase !== "focus" && s.phase !== "break") s.phase = "ready";
    if (typeof s.isRunning !== "boolean") s.isRunning = false;
    if (typeof s.sessionsToday !== "number") s.sessionsToday = 0;
    if (typeof s.studySecondsToday !== "number") s.studySecondsToday = 0;
    if (typeof s.runSeconds !== "number") s.runSeconds = 0;
    if (s.endAtMs !== null && typeof s.endAtMs !== "number") s.endAtMs = null;
    if (typeof (s as any).strictMode !== "boolean") (s as any).strictMode = false;
    const goals: string[] = Array.isArray((s as any).goals)
      ? (s as any).goals.map((x: unknown) => String(x ?? "").trim()).filter(Boolean).slice(0, 3)
      : [];
    (s as any).goals = goals;
    const done: boolean[] = Array.isArray((s as any).goalsDone) ? (s as any).goalsDone.map((x: unknown) => Boolean(x)) : [];
    (s as any).goalsDone = goals.map((_goal: string, idx: number) => Boolean(done[idx]));
    if (typeof (s as any).rewardClaimed !== "boolean") (s as any).rewardClaimed = false;
    if (typeof (s as any).rewardClaimedXp !== "number") (s as any).rewardClaimedXp = 0;
    const recap = (s as any).lastRecap;
    if (!recap || typeof recap !== "object") (s as any).lastRecap = null;
    else {
      const endedAt = Number(recap.endedAt ?? 0) || 0;
      const focusSeconds = Number(recap.focusSeconds ?? 0) || 0;
      const goalsR = Array.isArray(recap.goals) ? recap.goals.map((x: unknown) => String(x ?? "").trim()).filter(Boolean).slice(0, 3) : [];
      const goalsDoneR = Array.isArray(recap.goalsDone) ? recap.goalsDone.map((x: unknown) => Boolean(x)) : [];
      (s as any).lastRecap = {
        endedAt,
        focusSeconds,
        goals: goalsR,
        goalsDone: goalsR.map((_g: string, i: number) => Boolean(goalsDoneR[i])),
        strictMode: Boolean(recap.strictMode),
        claimedXp: Number(recap.claimedXp ?? 0) || 0,
        claimedAt: recap.claimedAt === null || typeof recap.claimedAt === "number" ? recap.claimedAt : null,
      };
    }
    return s;
  } catch {
    return null;
  }
}

type FocusConfig = {
  v: 1;
  preset?: string;
  focusDurationSec: number;
  breakDurationSec: number;
  strictMode: boolean;
  goals: string[];
};

function safeParseConfig(json: string | null): FocusConfig | null {
  if (!json) return null;
  try {
    const raw = JSON.parse(json) as Partial<FocusConfig>;
    if (raw?.v !== 1) return null;
    const focusDurationSec = typeof raw.focusDurationSec === "number" ? raw.focusDurationSec : 25 * 60;
    const breakDurationSec = typeof raw.breakDurationSec === "number" ? raw.breakDurationSec : 5 * 60;
    const goals = Array.isArray(raw.goals) ? raw.goals.map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, 3) : [];
    return {
      v: 1,
      preset: typeof raw.preset === "string" ? raw.preset : undefined,
      focusDurationSec: Math.max(60, Math.floor(focusDurationSec)),
      breakDurationSec: Math.max(30, Math.floor(breakDurationSec)),
      strictMode: Boolean(raw.strictMode),
      goals,
    };
  } catch {
    return null;
  }
}

export default function StudyFocusRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setup = (searchParams.get("setup") || "") === "1";
  const autoStart = (searchParams.get("autostart") || "") === "1";

  const [state, setState] = useState<StoredState>(() => defaultState());
  const [modal, setModal] = useState<null | "leave" | "reward">(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<StoredState>(state);
  stateRef.current = state;

  const ringSize = 340;
  const ringStroke = 10;
  const radius = (ringSize - ringStroke) / 2;
  const center = ringSize / 2;
  const circumference = 2 * Math.PI * radius;

  const phaseLabel = useMemo(() => {
    if (state.phase === "break") return "Break";
    if (state.phase === "focus" && state.isRunning) return "Focusing";
    if (state.phase === "focus" && !state.isRunning) return "Paused";
    return "Ready to Focus";
  }, [state.phase, state.isRunning]);

  const progress = useMemo(() => {
    if (state.phase === "focus") {
      const done = state.focusDurationSec - state.remainingSec;
      return clamp(done / Math.max(1, state.focusDurationSec), 0, 1);
    }
    if (state.phase === "break") {
      const done = state.breakDurationSec - state.remainingSec;
      return clamp(done / Math.max(1, state.breakDurationSec), 0, 1);
    }
    return 0;
  }, [state.phase, state.remainingSec, state.focusDurationSec, state.breakDurationSec]);

  const dashOffset = useMemo(() => circumference * (1 - progress), [circumference, progress]);

  const dot = useMemo(() => {
    const angle = Math.PI + progress * Math.PI * 2; // start at left, go clockwise
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  }, [center, radius, progress]);

  const energy = useMemo(() => {
    if (state.phase !== "focus") return 100;
    const pct = 100 - (state.runSeconds / Math.max(1, state.focusDurationSec)) * 100;
    return clamp(Math.round(pct), 0, 100);
  }, [state.phase, state.runSeconds, state.focusDurationSec]);

  const thisRunPoints = useMemo(() => Math.floor(state.runSeconds / 60), [state.runSeconds]);

  const studyMinutesToday = useMemo(() => Math.floor(state.studySecondsToday / 60), [state.studySecondsToday]);

  const allGoalsDone = useMemo(() => {
    if (!state.goals.length) return false;
    return state.goals.every((_g, idx) => Boolean(state.goalsDone[idx]));
  }, [state.goals, state.goalsDone]);

  const rewardXp = useMemo(() => {
    // Reward is primarily goal-based, with a small bonus for time spent focusing.
    const goalBonus = state.goals.length * 40;
    const timeBonus = Math.min(120, Math.floor(state.runSeconds / 60));
    return goalBonus + timeBonus;
  }, [state.goals.length, state.runSeconds]);

  const tips = useMemo(
    () => [
      { icon: "fa-headphones", text: "Put on ambient music or white noise" },
      { icon: "fa-mobile-screen-button", text: "Keep your phone in another room" },
      { icon: "fa-droplet", text: "Have water nearby to stay hydrated" },
      { icon: "fa-person-walking", text: "Stretch during breaks to stay fresh" },
    ],
    [],
  );

  const chatLocked = state.phase === "focus" && state.isRunning && state.strictMode;

  const members = useMemo(() => {
    const youStatus = state.phase === "break" ? "On break" : state.phase === "focus" && state.isRunning ? "Focusing" : "Idle";
    return [
      { id: "you", name: "You", status: youStatus, accent: "blue" as const },
      { id: "buddy-1", name: "Nova", status: "Focusing", accent: "violet" as const },
      { id: "buddy-2", name: "Kira", status: "On break", accent: "emerald" as const },
    ];
  }, [state.phase, state.isRunning]);

  useEffect(() => {
    const key = getScopedKey(CHAT_KEY);
    const saved = safeLocalGet(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setChatMessages(
            parsed
              .map((m) => ({
                id: String((m as any).id || uid()),
                at: typeof (m as any).at === "number" ? (m as any).at : Date.now(),
                from: (m as any).from === "you" || (m as any).from === "buddy" ? (m as any).from : "system",
                text: typeof (m as any).text === "string" ? (m as any).text : undefined,
                stickerSrc: typeof (m as any).stickerSrc === "string" ? (m as any).stickerSrc : undefined,
              }))
              .slice(-80),
          );
          return;
        }
      } catch {
        // ignore
      }
    }

    setChatMessages([
      {
        id: uid(),
        at: Date.now(),
        from: "system",
        text: "Welcome to Study Room. This chat is local (prototype) — perfect for UI testing.",
      },
    ]);
  }, []);

  useEffect(() => {
    const key = getScopedKey(CHAT_KEY);
    try {
      safeLocalSet(key, JSON.stringify(chatMessages.slice(-80)));
    } catch {
      // ignore
    }
  }, [chatMessages]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length]);

  useEffect(() => {
    if (!setup && !autoStart) return;
    setChatMessages((prev) =>
      [
        ...prev,
        {
          id: uid(),
          at: Date.now(),
          from: "system" as const,
          text: setup ? "Room setup opened." : "Auto-start enabled.",
        },
      ].slice(-80),
    );
  }, [setup, autoStart]);

  const sendChat = (msg: Partial<ChatMessage>) => {
    const cleanedText = String(msg.text || "").trim();
    const cleanedSticker = typeof msg.stickerSrc === "string" ? msg.stickerSrc : undefined;
    if (!cleanedText && !cleanedSticker) return;

    setChatMessages((prev) =>
      [
        ...prev,
        {
          id: uid(),
          at: Date.now(),
          from: "you" as const,
          text: cleanedText ? cleanedText.slice(0, 240) : undefined,
          stickerSrc: cleanedSticker,
        },
      ].slice(-80),
    );
  };

  const onChatSubmit = () => {
    if (chatLocked) return;
    const text = chatDraft.trim();
    if (!text) return;
    sendChat({ text });
    setChatDraft("");
  };

  useEffect(() => {
    // Load persisted state once.
    let stored: StoredState | null = null;
    let cfg: FocusConfig | null = null;
    try {
      stored = safeParse(safeLocalGet(getScopedKey(LS_KEY)) ?? safeLocalGet(LS_KEY));
      cfg = safeParseConfig(safeLocalGet(getScopedKey(CONFIG_KEY)) ?? safeLocalGet(CONFIG_KEY));
    } catch {
      stored = null;
      cfg = null;
    }

    setState((cur) => {
      const base = stored ?? cur;
      const today = localDayKey();
      const dayChanged = base.day !== today;
      let next: StoredState = {
        ...base,
        day: today,
        sessionsToday: dayChanged ? 0 : base.sessionsToday,
        studySecondsToday: dayChanged ? 0 : base.studySecondsToday,
      };

      const applyCfg = (n: StoredState, c: FocusConfig) => {
        const goals = c.goals.slice(0, 3);
        return {
          ...n,
          focusDurationSec: c.focusDurationSec,
          breakDurationSec: c.breakDurationSec,
          strictMode: c.strictMode,
          goals,
          goalsDone: goals.map(() => false),
          rewardClaimed: false,
          rewardClaimedXp: 0,
        };
      };

      // If we explicitly came from setup, treat it as a fresh session request.
      if (setup && cfg) {
        next = applyCfg(next, cfg);
        next.phase = "ready";
        next.isRunning = false;
        next.endAtMs = null;
        next.remainingSec = next.focusDurationSec;
        next.runSeconds = 0;
        if (autoStart) {
          next.phase = "focus";
          next.isRunning = true;
          next.remainingSec = next.focusDurationSec;
          next.endAtMs = Date.now() + next.focusDurationSec * 1000;
        }
        return next;
      }

      // Otherwise: if we're idle on the Ready screen, keep the last chosen config.
      if (cfg && next.phase === "ready" && !next.isRunning) {
        next = applyCfg(next, cfg);
        next.remainingSec = next.focusDurationSec;
      }

      // If it was running, recompute remaining based on endAtMs.
      if (next.isRunning && next.endAtMs) {
        const rem = Math.max(0, Math.ceil((next.endAtMs - Date.now()) / 1000));
        next.remainingSec = rem;
        if (rem === 0) {
          next.isRunning = false;
          next.endAtMs = null;
          if (next.phase === "break") {
            next.phase = "ready";
            next.remainingSec = next.focusDurationSec;
            next.runSeconds = 0;
          } else if (next.phase === "focus") {
            next.phase = "break";
            next.remainingSec = next.breakDurationSec;
          }
        }
      }
      if (next.phase === "ready") {
        next.remainingSec = next.focusDurationSec;
        next.isRunning = false;
        next.endAtMs = null;
      }
      return next;
    });
  }, [setup, autoStart]);

  useEffect(() => {
    // Persist (cheap + safe; values are small).
    safeLocalSet(getScopedKey(LS_KEY), JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.isRunning || !state.endAtMs) return;
    const id = window.setInterval(() => {
      const cur = stateRef.current;
      if (!cur.isRunning || !cur.endAtMs) return;

      setState((prev) => {
        // If we drifted, only update from the latest ref snapshot once per tick.
        const snapshot = stateRef.current;
        if (!snapshot.isRunning || !snapshot.endAtMs) return prev;

        const nextRem = Math.max(0, Math.ceil((snapshot.endAtMs - Date.now()) / 1000));
        const nextSpent = Math.max(0, snapshot.remainingSec - nextRem);

        let next: StoredState = { ...snapshot, remainingSec: nextRem };
        if (next.phase === "focus" && nextSpent > 0) {
          next.studySecondsToday = snapshot.studySecondsToday + nextSpent;
          next.runSeconds = snapshot.runSeconds + nextSpent;
        }

        // phase transitions
        if (nextRem === 0) {
          if (next.phase === "focus") {
            next.sessionsToday = snapshot.sessionsToday + 1;
            next.lastRecap = {
              endedAt: Date.now(),
              focusSeconds: next.runSeconds,
              goals: [...next.goals],
              goalsDone: next.goals.map((_g, idx) => Boolean(next.goalsDone[idx])),
              strictMode: Boolean(next.strictMode),
              claimedXp: 0,
              claimedAt: null,
            };
            next.phase = "break";
            next.remainingSec = snapshot.breakDurationSec;
            next.endAtMs = Date.now() + snapshot.breakDurationSec * 1000;
            next.isRunning = true; // auto-run break
          } else if (next.phase === "break") {
            next.phase = "ready";
            next.remainingSec = snapshot.focusDurationSec;
            next.endAtMs = null;
            next.isRunning = false;
            next.runSeconds = 0;
          } else {
            next.phase = "ready";
            next.remainingSec = snapshot.focusDurationSec;
            next.endAtMs = null;
            next.isRunning = false;
            next.runSeconds = 0;
          }
        }

        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [state.isRunning, state.endAtMs]);

  useEffect(() => {
    // Strict mode enabled (regardless of timer running).
    document.body.classList.toggle("study-strict", Boolean(state.strictMode));
    return () => document.body.classList.remove("study-strict");
  }, [state.strictMode]);

  useEffect(() => {
    // Strict mode actively focusing: hide header too.
    const on = state.strictMode && state.phase === "focus" && state.isRunning;
    document.body.classList.toggle("focus-strict", on);
    return () => document.body.classList.remove("focus-strict");
  }, [state.strictMode, state.phase, state.isRunning]);

  function toggleRun() {
    setState((prev) => {
      const now = Date.now();

      // If we're ready, start a fresh focus run.
      if (prev.phase === "ready") {
        const next: StoredState = {
          ...prev,
          phase: "focus",
          isRunning: true,
          remainingSec: prev.focusDurationSec,
          endAtMs: now + prev.focusDurationSec * 1000,
          runSeconds: 0,
        };
        return next;
      }

      if (prev.isRunning) {
        const rem = prev.endAtMs ? Math.max(0, Math.ceil((prev.endAtMs - now) / 1000)) : prev.remainingSec;
        return { ...prev, isRunning: false, endAtMs: null, remainingSec: rem };
      }

      return { ...prev, isRunning: true, endAtMs: now + prev.remainingSec * 1000 };
    });
  }

  function reset() {
    setState((prev) => ({
      ...prev,
      phase: "ready",
      isRunning: false,
      endAtMs: null,
      remainingSec: prev.focusDurationSec,
      runSeconds: 0,
      goalsDone: prev.goals.map(() => false),
      rewardClaimed: false,
      rewardClaimedXp: 0,
    }));
  }

  function requestLeave() {
    setModal("leave");
  }

  function confirmLeave() {
    setState((prev) => ({ ...prev, isRunning: false, endAtMs: null }));
    setModal(null);
    router.push("/study");
  }

  async function claimReward() {
    if (!allGoalsDone) return;
    if (state.rewardClaimed) return;
    if (rewardXp <= 0) return;

    setClaimError(null);
    setClaiming(true);
    try {
      try {
        const cur = Number(safeLocalGet(getScopedKey(LOCAL_XP_KEY)) || "0");
        const next = Math.max(0, Math.floor(cur) + rewardXp);
        safeLocalSet(getScopedKey(LOCAL_XP_KEY), String(next));
      } catch {
        setClaimError("Could not save reward on this device.");
        return;
      }
      setState((prev) => {
        const recap = prev.lastRecap
          ? {
              ...prev.lastRecap,
              claimedXp: rewardXp,
              claimedAt: Date.now(),
            }
          : {
              endedAt: Date.now(),
              focusSeconds: prev.runSeconds,
              goals: [...prev.goals],
              goalsDone: prev.goals.map((_g, idx) => Boolean(prev.goalsDone[idx])),
              strictMode: Boolean(prev.strictMode),
              claimedXp: rewardXp,
              claimedAt: Date.now(),
            };
        return { ...prev, rewardClaimed: true, rewardClaimedXp: rewardXp, lastRecap: recap };
      });
      setModal(null);
    } catch {
      setClaimError("Something went wrong. Try again.");
    } finally {
      setClaiming(false);
    }
  }

  const showTime = state.phase === "break" ? formatClock(state.remainingSec) : formatClock(state.remainingSec);

  return (
    <section className="studyFocusRoom studyFocusRoom--chat" aria-label="Study room focus mode">
      <div className="studyRoomLayout">
        <div className="studyRoomMain">
          <div className="studyFocusRoom__top">
            <button type="button" className="studyFocusRoom__back" onClick={requestLeave} data-focus="study.focus.back" aria-label="Back">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
              <span>Back</span>
            </button>
            <div className="studyFocusRoom__topRight">
              <div className="studyRoomMiniPill" title={chatLocked ? "Chat locked during strict focus" : "Chat available"}>
                <i className={`fa-solid ${chatLocked ? "fa-lock" : "fa-comments"}`} aria-hidden="true" />
                <span>{chatLocked ? "Strict Focus" : "Room Chat"}</span>
              </div>
              <div className="studyFocusRoom__topMeta">
                <div className="studyFocusRoom__topTitle">Study Room</div>
                <div className="studyFocusRoom__topSub">{state.goals.length ? `${state.goals.length} goal(s)` : "No goals set"}</div>
              </div>
            </div>
          </div>

          <div className="studyFocusRoom__timerBlock">
            <div className="studyFocusRoom__ring" aria-hidden="true">
              <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="rgba(30, 41, 59, 0.10)"
                  strokeWidth={ringStroke}
                />
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="rgba(59, 130, 246, 1)"
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(180 ${center} ${center})`}
                />
                <circle cx={dot.x} cy={dot.y} r={5} fill="rgba(59, 130, 246, 1)" />
              </svg>

              <div className="studyFocusRoom__ringCenter">
                <div className="studyFocusRoom__time">{showTime}</div>
                <div className="studyFocusRoom__phase">{phaseLabel}</div>
              </div>
            </div>

            <div className="studyFocusRoom__controls">
              <button
                type="button"
                className="studyFocusRoom__play"
                onClick={toggleRun}
                data-focus="study.focus.toggle"
                aria-label={state.isRunning ? "Pause timer" : "Start timer"}
              >
                <i className={`fa-solid ${state.isRunning ? "fa-pause" : "fa-play"}`} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="studyFocusRoom__reset"
                onClick={reset}
                data-focus="study.focus.reset"
                aria-label="Reset"
              >
                <i className="fa-solid fa-arrow-rotate-left" aria-hidden="true" />
              </button>
              {state.strictMode ? (
                <div className="studyFocusRoom__badge" title="Strict mode enabled">
                  <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Strict
                </div>
              ) : null}
            </div>
          </div>

          <div className="studyFocusRoom__stats" aria-label="Session stats">
            <div className="studyFocusStat">
              <div className="studyFocusStat__icon studyFocusStat__icon--blue" aria-hidden="true">
                <i className="fa-solid fa-stopwatch" />
              </div>
              <div className="studyFocusStat__value">{state.sessionsToday}</div>
              <div className="studyFocusStat__label">Sessions Today</div>
            </div>

            <div className="studyFocusStat">
              <div className="studyFocusStat__icon studyFocusStat__icon--green" aria-hidden="true">
                <i className="fa-solid fa-clock" />
              </div>
              <div className="studyFocusStat__value">{studyMinutesToday}m</div>
              <div className="studyFocusStat__label">Study Time</div>
            </div>

            <div className="studyFocusStat">
              <div className="studyFocusStat__icon studyFocusStat__icon--teal" aria-hidden="true">
                <i className="fa-solid fa-battery-full" />
              </div>
              <div className="studyFocusStat__value">{energy}%</div>
              <div className="studyFocusStat__label">Energy</div>
              <div className="studyFocusStat__bar" aria-hidden="true">
                <div className="studyFocusStat__barFill" style={{ width: `${energy}%` }} />
              </div>
            </div>

            <div className="studyFocusStat">
              <div className="studyFocusStat__icon studyFocusStat__icon--red" aria-hidden="true">
                <i className="fa-solid fa-fire" />
              </div>
              <div className="studyFocusStat__value">{thisRunPoints}</div>
              <div className="studyFocusStat__label">This Run</div>
            </div>
          </div>

          {state.goals.length ? (
            <div className="studyFocusRoom__goals" aria-label="Session goals">
              <div className="studyFocusRoom__goalsTitle">
                <i className="fa-solid fa-list-check" aria-hidden="true" /> Session Goals
              </div>
              <div className="studyFocusRoom__goalsList">
                {state.goals.map((g, idx) => (
                  <label key={`${idx}:${g}`} className="studyFocusGoal">
                    <input
                      type="checkbox"
                      checked={Boolean(state.goalsDone[idx])}
                      onChange={(e) =>
                        setState((prev) => {
                          const next = { ...prev, goalsDone: [...prev.goalsDone] };
                          next.goalsDone[idx] = e.target.checked;
                          return next;
                        })
                      }
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>

              <div className="studyFocusRoom__goalActions">
                <button
                  type="button"
                  className="studyFocusRoom__claim"
                  onClick={() => setModal("reward")}
                  disabled={!allGoalsDone || state.rewardClaimed}
                  aria-disabled={!allGoalsDone || state.rewardClaimed}
                  data-focus="study.focus.claim"
                  aria-label="Claim XP reward"
                  title={!state.goals.length ? "Set goals first" : !allGoalsDone ? "Complete all goals first" : state.rewardClaimed ? "Already claimed" : "Claim reward (local)"}
                >
                  <i className="fa-solid fa-gift" aria-hidden="true" />{" "}
                  {state.rewardClaimed ? `Claimed +${state.rewardClaimedXp} XP (local)` : `Finish goals (+${rewardXp} XP local)`}
                </button>
              </div>
            </div>
          ) : null}

          <div className="studyFocusRoom__tips" aria-label="Focus tips">
            <div className="studyFocusRoom__tipsHeader">
              <div className="studyFocusRoom__tipsTitle">
                <i className="fa-solid fa-lightbulb" aria-hidden="true" /> Focus Tips
              </div>
            </div>
            <div className="studyFocusRoom__tipsGrid">
              {tips.map((t) => (
                <div key={t.text} className="studyFocusTip">
                  <i className={`fa-solid ${t.icon}`} aria-hidden="true" />
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="studyRoomSide" aria-label="Study room sidebar">
          <div className="studyRoomCard" aria-label="Members">
            <div className="studyRoomCard__header">
              <div className="studyRoomCard__title">
                <i className="fa-solid fa-users" aria-hidden="true" /> Members
              </div>
              <div className="studyRoomCard__meta">{members.length} online</div>
            </div>
            <div className="studyRoomMembers">
              {members.map((m) => (
                <div key={m.id} className="studyRoomMember">
                  <span className={`studyRoomMember__dot studyRoomMember__dot--${m.accent}`} aria-hidden="true" />
                  <div className="studyRoomMember__name">{m.name}</div>
                  <div className="studyRoomMember__status">{m.status}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="studyRoomAction"
              onClick={() =>
                setChatMessages((prev) =>
                  [
                    ...prev,
                    { id: uid(), at: Date.now(), from: "system" as const, text: "Sync start (prototype): starting together in 3…2…1…" },
                  ].slice(-80),
                )
              }
            >
              <i className="fa-solid fa-arrows-rotate" aria-hidden="true" /> Sync start (demo)
            </button>
          </div>

          <div className="studyRoomCard" aria-label="Chat">
            <div className="studyRoomCard__header">
              <div className="studyRoomCard__title">
                <i className="fa-solid fa-comments" aria-hidden="true" /> Chat
              </div>
              <div className="studyRoomCard__meta">{chatLocked ? "Locked" : "Open"}</div>
            </div>

            <div ref={chatScrollRef} className="studyRoomChatMessages" role="log" aria-label="Chat messages">
              {chatMessages.map((m) => (
                <div key={m.id} className={["studyRoomChatMsg", m.from === "you" ? "studyRoomChatMsg--you" : ""].filter(Boolean).join(" ")}>
                  <div className="studyRoomChatMsg__avatar" aria-hidden="true">
                    <i className={`fa-solid ${m.from === "system" ? "fa-wand-sparkles" : "fa-robot"}`} />
                  </div>
                  <div className="studyRoomChatMsg__bubble">
                    {m.stickerSrc ? <img className="studyRoomSticker" src={m.stickerSrc} alt="" aria-hidden="true" /> : null}
                    {m.text ? <div className="studyRoomChatMsg__text">{m.text}</div> : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="studyRoomChatQuick" aria-label="Quick stickers">
              <button type="button" className="studyRoomChip" onClick={() => sendChat({ stickerSrc: "/blockyPng/idle.png" })} disabled={chatLocked}>
                <i className="fa-solid fa-face-smile" aria-hidden="true" /> Idle
              </button>
              <button type="button" className="studyRoomChip" onClick={() => sendChat({ stickerSrc: "/blockyPng/study.png" })} disabled={chatLocked}>
                <i className="fa-solid fa-book" aria-hidden="true" /> Study
              </button>
              <button type="button" className="studyRoomChip" onClick={() => sendChat({ stickerSrc: "/blockyPng/battle.png" })} disabled={chatLocked}>
                <i className="fa-solid fa-bolt" aria-hidden="true" /> Battle
              </button>
            </div>

            <div className="studyRoomChatComposer" aria-label="Chat input">
              <textarea
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onChatSubmit();
                  }
                }}
                className="studyRoomChatInput"
                placeholder={chatLocked ? "Chat locked during strict focus" : "Type a message…"}
                disabled={chatLocked}
                aria-disabled={chatLocked}
                rows={2}
              />
              <button type="button" className="studyRoomChatSend" onClick={onChatSubmit} disabled={chatLocked || !chatDraft.trim()}>
                <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Send
              </button>
            </div>
          </div>
        </aside>
      </div>

      {modal ? (
        <div className="studiumModal" role="dialog" aria-modal="true" aria-label={modal === "leave" ? "Leave focus room" : "Claim reward"}>
          <div className="studiumModalOverlay" onPointerDown={() => setModal(null)} aria-hidden="true" />
          <div className={["studiumModalPanel", modal === "leave" ? "studiumModalPanel--danger" : ""].filter(Boolean).join(" ")}>
            <div className="studiumModalTop">
              <div className="studiumModalTitleWrap">
                <div className="studiumModalKicker">{modal === "leave" ? "DANGER ZONE" : "REWARD"}</div>
                <div className={["studiumModalTitle", modal === "leave" ? "studiumModalTitle--danger" : ""].filter(Boolean).join(" ")}>
                  {modal === "leave" ? "Leave this session?" : "Finish & claim XP"}
                </div>
                <div className="studiumModalSubtitle">
                  {modal === "leave"
                    ? "Are you sure you want to leave? The timer will be paused."
                    : state.rewardClaimed
                      ? "You already claimed this reward."
                      : !allGoalsDone
                        ? "Complete all goals first to claim the reward."
                        : `You will receive +${rewardXp} XP (saved locally on this device).`}
                </div>
              </div>
              <button type="button" className="studiumModalClose" onClick={() => setModal(null)} aria-label="Close popup">
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>

            <div className="studiumModalBody">
              {modal === "reward" && claimError ? <div className="studyFocusRoom__error">{claimError}</div> : null}

              <div className="studyFocusRoom__modalActions">
                <button type="button" className="studyFocusRoom__modalBtn" onClick={() => setModal(null)}>
                  Cancel
                </button>
                {modal === "leave" ? (
                  <button type="button" className="studyFocusRoom__modalBtn studyFocusRoom__modalBtn--danger" onClick={confirmLeave}>
                    Leave
                  </button>
                ) : (
                  <button
                    type="button"
                    className="studyFocusRoom__modalBtn studyFocusRoom__modalBtn--primary"
                    onClick={claimReward}
                    disabled={claiming || !allGoalsDone || state.rewardClaimed}
                    aria-disabled={claiming || !allGoalsDone || state.rewardClaimed}
                  >
                    {claiming ? "Claiming..." : "Claim XP"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
