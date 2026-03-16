import CardChrome from "./grid-parts/card-chrome";
import DashboardCalendarWidget from "./dashboard-calendar-widget";
import DashboardQuestStack from "./dashboard-quest-stack";
import Link from "next/link";
import DashboardStreakCard from "./dashboard-streak-card";

export default function DashboardGrid() {
  return (
    <div className="gridContainer" aria-label="Dashboard grid">
      <div className="gridContainerLeft">
        <div
          className="gridContainerLeftTop gridCard dashHero"
          id="grid-leftTop"
          data-focus="dashboard.leftTop"
          tabIndex={0}
          role="button"
          aria-label="Greetings and stats"
        >
          <CardChrome kicker="Good evening" title="Your day at a glance" meta="Routine ready | 3 due today | +240 XP potential" />
          <img className="dashHeroMascot" src="/blockyPng/greetings.png" alt="" aria-hidden="true" />
        </div>
        <div className="gridContainerLeftBottom">
          <div
            className="gridContainerLeftBottomLeft gridCard"
            id="grid-streak"
            data-focus="dashboard.streak"
            tabIndex={0}
            role="button"
            aria-label="Streak info"
          >
            <DashboardStreakCard />
          </div>
          <div className="dashQuickGrid" aria-label="Quick actions">
            <Link
              href="/notes"
              className="dashQuickTile gridCard"
              id="grid-quickNote"
              data-focus="dashboard.quick.note"
              aria-label="Quick Note"
            >
              <div className="dashQuickInner" aria-hidden="true">
                <i className="fa-solid fa-note-sticky" aria-hidden="true"></i>
                <div className="dashQuickTitle">Quick Note</div>
              </div>
            </Link>
            <Link
              href="/battle"
              className="dashQuickTile gridCard"
              id="grid-quickBattle"
              data-focus="dashboard.quick.battle"
              aria-label="Quick Battle"
            >
              <div className="dashQuickInner" aria-hidden="true">
                <i className="fa-solid fa-fire" aria-hidden="true"></i>
                <div className="dashQuickTitle">Quick Battle</div>
              </div>
            </Link>
            <Link
              href="/schedules"
              className="dashQuickTile gridCard"
              id="grid-todayEvent"
              data-focus="dashboard.quick.today"
              aria-label="Today's Event"
            >
              <div className="dashQuickInner" aria-hidden="true">
                <i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
                <div className="dashQuickTitle">Today's Event</div>
              </div>
            </Link>
            <Link
              href="/pomodoro"
              className="dashQuickTile gridCard"
              id="grid-pomodoro"
              data-focus="dashboard.quick.pomodoro"
              aria-label="Pomodoro"
            >
              <div className="dashQuickInner" aria-hidden="true">
                <i className="fa-solid fa-stopwatch" aria-hidden="true"></i>
                <div className="dashQuickTitle">Pomodoro</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <DashboardQuestStack />

        <div
          className="gridContainerRightRight gridCard"
          id="grid-widget"
          data-focus="dashboard.widget"
          tabIndex={0}
          role="region"
          aria-label="Calendar widget"
        >
          <DashboardCalendarWidget />
        </div>
      </div>
    </div>
  );
}
