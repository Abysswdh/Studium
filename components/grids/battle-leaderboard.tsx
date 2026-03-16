"use client";

import { useMemo, useState } from "react";

import styles from "./battle-leaderboard.module.css";

type Campus = {
  university: string;
  major: string;
  cohort: string;
};

type Entry = {
  id: string;
  name: string;
  xp: number;
  elo: number;
  campus: Campus;
};

const BINUS_B29: Campus = {
  university: "Bina Nusantara University Malang",
  major: "Computer Science",
  cohort: "B29",
};

const DUMMY: Entry[] = [
  { id: "u1", name: "Abyss", xp: 6240, elo: 1420, campus: BINUS_B29 },
  { id: "u2", name: "Putra", xp: 5180, elo: 1350, campus: BINUS_B29 },
  { id: "u3", name: "Nara", xp: 4820, elo: 1288, campus: BINUS_B29 },
  { id: "u4", name: "Raka", xp: 4550, elo: 1210, campus: BINUS_B29 },
  { id: "u5", name: "Salsa", xp: 4390, elo: 1194, campus: BINUS_B29 },
  { id: "u6", name: "Evan", xp: 4010, elo: 1162, campus: BINUS_B29 },
  { id: "u7", name: "Tara", xp: 3860, elo: 1120, campus: BINUS_B29 },
  { id: "u8", name: "Dio", xp: 3690, elo: 1096, campus: BINUS_B29 },
  { id: "u9", name: "Mika", xp: 3520, elo: 1065, campus: BINUS_B29 },
  { id: "u10", name: "Lyn", xp: 3375, elo: 1040, campus: BINUS_B29 },
];

function fmt(n: number) {
  return n.toLocaleString();
}

function campusKey(c: Campus) {
  return `${c.university}__${c.major}__${c.cohort}`;
}

function scrollIntoViewNearest(el: HTMLElement | null) {
  if (!el) return;
  try {
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  } catch {
    // ignore
  }
}

export default function BattleLeaderboard() {
  const [scope, setScope] = useState<"global" | "campus">("global");
  const [sortBy, setSortBy] = useState<"xp" | "elo">("xp");

  const selectedCampus = BINUS_B29;

  const rows = useMemo(() => {
    const filtered = scope === "campus" ? DUMMY.filter((e) => campusKey(e.campus) === campusKey(selectedCampus)) : DUMMY.slice();
    filtered.sort((a, b) => (sortBy === "xp" ? b.xp - a.xp : b.elo - a.elo));
    return filtered;
  }, [scope, sortBy]);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3, 12);

  const campusLabel = `${selectedCampus.university} • ${selectedCampus.major} • ${selectedCampus.cohort}`;

  return (
    <div className={styles.root}>
      <div className={styles.topRow}>
        <div className="cardKicker">Leaderboard</div>

        <div className={styles.actions}>
          <div className={styles.segment} aria-label="Leaderboard scope">
            <button
              type="button"
              className={`gridCard ${styles.toggle}`}
              data-focus="battle.lb.scope.global"
              onClick={() => setScope("global")}
              aria-pressed={scope === "global"}
              aria-label="Global leaderboard"
            >
              Global
            </button>
            <button
              type="button"
              className={`gridCard ${styles.toggle}`}
              data-focus="battle.lb.scope.campus"
              onClick={() => setScope("campus")}
              aria-pressed={scope === "campus"}
              aria-label="Campus leaderboard"
            >
              Campus
            </button>
          </div>

          <div className={styles.segment} aria-label="Leaderboard sort">
            <button
              type="button"
              className={`gridCard ${styles.toggle} ${styles.sortToggle}`}
              data-focus="battle.lb.sort.xp"
              onClick={() => setSortBy("xp")}
              aria-pressed={sortBy === "xp"}
              aria-label="Sort by XP"
            >
              XP
            </button>
            <button
              type="button"
              className={`gridCard ${styles.toggle} ${styles.sortToggle}`}
              data-focus="battle.lb.sort.elo"
              onClick={() => setSortBy("elo")}
              aria-pressed={sortBy === "elo"}
              aria-label="Sort by ELO"
            >
              ELO
            </button>
          </div>
        </div>
      </div>

      {scope === "campus" ? <div className={["cardMeta", styles.campusLabel].join(" ")}>{campusLabel}</div> : null}

      <div className={styles.podiumGrid} aria-label="Top 3 players">
        {[1, 0, 2].map((pos) => {
          const p = podium[pos];
          const rank = pos === 0 ? 1 : pos === 1 ? 2 : 3;
          return (
            <div
              key={rank}
              className={`gridCard ${styles.podiumCard}`}
              data-rank={rank}
              data-focus={`battle.lb.podium.${rank}`}
              tabIndex={-1}
              role="group"
              aria-label={`Rank ${rank}`}
            >
              <div className={styles.podiumTop}>
                <div className={styles.podiumRank}>#{rank}</div>
                <div className={styles.podiumMetric}>{sortBy.toUpperCase()}</div>
              </div>
              <div className={styles.podiumName}>{p?.name ?? "—"}</div>
              <div className={styles.podiumValue}>{p ? (sortBy === "xp" ? `${fmt(p.xp)} XP` : `${fmt(p.elo)} ELO`) : " "}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.list} role="list" aria-label="Leaderboard list">
        {rest.map((e, i) => {
          const rank = i + 4;
          return (
            <div
              key={e.id}
              className={`gridCard ${styles.row}`}
              data-focus={`battle.lb.row.${e.id}`}
              tabIndex={-1}
              role="listitem"
              aria-label={`Rank ${rank} ${e.name}`}
              onFocus={(ev) => scrollIntoViewNearest(ev.currentTarget)}
            >
              <div className={styles.rowRank}>#{rank}</div>
              <div className={styles.rowMain}>
                <div className={styles.rowName}>{e.name}</div>
                <div className={styles.rowMeta}>
                  {fmt(e.xp)} XP • {fmt(e.elo)} ELO
                </div>
              </div>
              <div className={styles.rowTag}>{scope === "campus" ? e.campus.cohort : e.campus.major}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
