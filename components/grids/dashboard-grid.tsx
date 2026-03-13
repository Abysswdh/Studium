import CardChrome from "./grid-parts/card-chrome";

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
          <CardChrome kicker="Good evening" title="Your day at a glance" meta="Routine ready • 3 due today • +240 XP potential" />
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
            <CardChrome kicker="Streak" title="12 days" meta="Best 24 • Freeze 1 • Strikes 0" />
          </div>
          <div
            className="gridContainerLeftBottomRight gridCard"
            id="grid-quick"
            data-focus="dashboard.quick"
            tabIndex={0}
            role="button"
            aria-label="Quick actions"
          >
            <CardChrome kicker="Quick start" title="Focus Sprint" meta="25m • +120 XP • Calculus" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div
            className="gridContainerRightLeftOne gridCard"
            id="grid-quest1"
            data-focus="dashboard.quest1"
            tabIndex={0}
            role="button"
            aria-label="Quest 1"
          >
            <CardChrome kicker="Quest 1" title="Warmup" meta="5m • Review last notes" />
          </div>
          <div
            className="gridContainerRightLeftTwo gridCard"
            id="grid-quest2"
            data-focus="dashboard.quest2"
            tabIndex={0}
            role="button"
            aria-label="Quest 2"
          >
            <CardChrome kicker="Quest 2" title="Battle Prep" meta="10m • Flashcards set A" />
          </div>
          <div
            className="gridContainerRightLeftThree gridCard"
            id="grid-quest3"
            data-focus="dashboard.quest3"
            tabIndex={0}
            role="button"
            aria-label="Quest 3"
          >
            <CardChrome kicker="Quest 3" title="Deep Focus" meta="2×25m • Problem set" />
          </div>
          <div
            className="gridContainerRightLeftFour gridCard"
            id="grid-quest4"
            data-focus="dashboard.quest4"
            tabIndex={0}
            role="button"
            aria-label="Quest 4"
          >
            <CardChrome kicker="Quest 4" title="Review" meta="8m • Summarize & tag" />
          </div>
        </div>

        <div
          className="gridContainerRightRight gridCard"
          id="grid-widget"
          data-focus="dashboard.widget"
          tabIndex={0}
          role="button"
          aria-label="Selected widget panel"
        >
          <CardChrome kicker="Widget" title="Calendar" meta="Today • 2 events • 1 group session" />
        </div>
      </div>
    </div>
  );
}
