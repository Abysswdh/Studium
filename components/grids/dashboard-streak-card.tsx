"use client";

import CardChrome from "./grid-parts/card-chrome";
import StreakCalendar from "../streak/streak-calendar";
import { useStreakData } from "../streak/use-streak-data";

export default function DashboardStreakCard() {
  const data = useStreakData(365);

  return (
    <div className="dashStreakCard" aria-label="Streak info">
      <StreakCalendar data={data} className="streakCal--dash" ariaLabel={`${data.totalDone} contributions in the last year`} />
      <CardChrome
        kicker={`${data.totalDone.toLocaleString()} contributions (1y)`}
        title={`${Math.max(0, data.streakCurrent)} days`}
        meta={`Best ${Math.max(0, data.streakBest)} | Freeze 1`}
      />
    </div>
  );
}
