"use client";

import { useEffect, useMemo, useState } from "react";

import CardChrome from "./grid-parts/card-chrome";
import { loadQuests, onPlannerUpdated } from "./planner-storage";

type DayStat = { dayKey: string; due: number; done: number };

function dayKeyLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseDateOnlyLocal(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildLastDays(days: number) {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const out: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(d);
  }
  return out;
}

function heatLevel(due: number, done: number) {
  if (due <= 0) return 0;
  if (done >= due) return 2;
  if (done > 0) return 1;
  return 0;
}

export default function DashboardStreakCard() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    return onPlannerUpdated(() => setTick((v) => v + 1));
  }, []);

  const data = useMemo(() => {
    void tick;
    const quests = loadQuests();
    const byDay = new Map<string, { due: number; done: number }>();

    for (const q of quests) {
      for (const s of q.stages || []) {
        const dueDate = parseDateOnlyLocal(s.dueAt);
        if (!dueDate) continue;
        const key = dayKeyLocal(dueDate);
        const cur = byDay.get(key) || { due: 0, done: 0 };
        cur.due += 1;
        if (s.done) cur.done += 1;
        byDay.set(key, cur);
      }
    }

    const days = buildLastDays(28);
    const stats: DayStat[] = days.map((d) => {
      const key = dayKeyLocal(d);
      const v = byDay.get(key) || { due: 0, done: 0 };
      return { dayKey: key, due: v.due, done: v.done };
    });

    const success = stats.map((s) => s.due > 0 && s.done >= s.due);
    let streakCurrent = 0;
    for (let i = success.length - 1; i >= 0; i--) {
      if (!success[i]) break;
      streakCurrent++;
    }

    let streakBest = 0;
    let run = 0;
    for (const ok of success) {
      run = ok ? run + 1 : 0;
      if (run > streakBest) streakBest = run;
    }

    return { stats, streakCurrent, streakBest };
  }, [tick]);

  return (
    <div className="dashStreakCard" aria-label="Streak info">
      <div className="dashHeatmap" aria-hidden="true">
        {data.stats.map((s) => {
          const lvl = heatLevel(s.due, s.done);
          const title = `${s.dayKey}: ${s.done}/${s.due}`;
          return <span key={s.dayKey} className={`dashHeatCell dashHeat--${lvl}`} title={title} />;
        })}
      </div>
      <CardChrome kicker="Streak" title={`${Math.max(0, data.streakCurrent)} days`} meta={`Best ${Math.max(0, data.streakBest)} | Freeze 1 | Strikes 0`} />
    </div>
  );
}
