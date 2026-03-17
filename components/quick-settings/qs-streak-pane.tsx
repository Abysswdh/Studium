"use client";

import StreakCalendar from "../streak/streak-calendar";
import { useStreakData } from "../streak/use-streak-data";

export default function QSStreakPane() {
  const data = useStreakData(365);

  return (
    <div className="qsStreakPane" aria-label="Streak summary">
      <div className="qsStreakHead">
        <div className="qsStreakTitle">{data.totalDone.toLocaleString()} contributions in the last year</div>
        <div className="qsStreakSub">
          Current {Math.max(0, data.streakCurrent)} days · Best {Math.max(0, data.streakBest)}
        </div>
      </div>

      <StreakCalendar data={data} className="streakCal--qs" />
    </div>
  );
}

