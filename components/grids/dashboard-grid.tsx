import CardChrome from "./grid-parts/card-chrome";
import DashboardCalendarWidget from "./dashboard-calendar-widget";
import DashboardQuestStack from "./dashboard-quest-stack";

export default function DashboardGrid() {
  return (
    <div className="gridContainer" aria-label="Dashboard grid">
      <div className="gridContainerLeft">
        <div
          className="gridContainerLeftTop gridCard"
          id="grid-leftTop"
          data-focus="dashboard.leftTop"
          tabIndex={0}
          role="button"
          aria-label="Greetings and stats"
        >
          <CardChrome kicker="Good evening" title="Your day at a glance" meta="Routine ready | 3 due today | +240 XP potential" />
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
            <CardChrome kicker="Streak" title="12 days" meta="Best 24 | Freeze 1 | Strikes 0" />
          </div>
          <div
            className="gridContainerLeftBottomRight gridCard"
            id="grid-quick"
            data-focus="dashboard.quick"
            tabIndex={0}
            role="button"
            aria-label="Quick actions"
          >
            <CardChrome kicker="Quick start" title="Focus Sprint" meta="25m | +120 XP | Calculus" />
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
