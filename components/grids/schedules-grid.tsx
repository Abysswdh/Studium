import CardChrome from "./grid-parts/card-chrome";

export default function SchedulesGrid() {
  return (
    <div className="gridContainer" aria-label="Schedules grid">
      <div className="gridContainerLeft">
        <div className="gridContainerLeftTop gridCard" id="grid-leftTop" data-focus="schedules.agenda" tabIndex={0} role="button" aria-label="Agenda">
          <CardChrome kicker="Agenda" title="This week" meta="Classes • deadlines • events" />
        </div>
        <div className="gridContainerLeftBottom">
          <div className="gridContainerLeftBottomLeft gridCard" id="grid-streak" data-focus="schedules.deadlines" tabIndex={0} role="button" aria-label="Upcoming deadlines">
            <CardChrome kicker="Deadlines" title="Next 48h" meta="2 due • 1 exam • 1 group" />
          </div>
          <div className="gridContainerLeftBottomRight gridCard" id="grid-quick" data-focus="schedules.add" tabIndex={0} role="button" aria-label="Add item">
            <CardChrome kicker="Add" title="Task / event" meta="Quick add to feed routine" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div className="gridContainerRightLeftOne gridCard" id="grid-quest1" data-focus="schedules.today" tabIndex={0} role="button" aria-label="Today">
            <CardChrome kicker="Today" title="2 classes" meta="1 lab • 1 lecture" />
          </div>
          <div className="gridContainerRightLeftTwo gridCard" id="grid-quest2" data-focus="schedules.tomorrow" tabIndex={0} role="button" aria-label="Tomorrow">
            <CardChrome kicker="Tomorrow" title="1 deadline" meta="Submit report • 23:59" />
          </div>
          <div className="gridContainerRightLeftThree gridCard" id="grid-quest3" data-focus="schedules.soon" tabIndex={0} role="button" aria-label="Soon">
            <CardChrome kicker="Soon" title="Midterm" meta="7 days • prep plan" />
          </div>
          <div className="gridContainerRightLeftFour gridCard" id="grid-quest4" data-focus="schedules.sync" tabIndex={0} role="button" aria-label="Sync">
            <CardChrome kicker="Sync" title="Import calendar" meta="Google • iCal • CSV" />
          </div>
        </div>

        <div className="gridContainerRightRight gridCard" id="grid-widget" data-focus="schedules.calendar" tabIndex={0} role="button" aria-label="Calendar widget">
          <CardChrome kicker="Calendar" title="Month view" meta="Select a day to see tasks" />
        </div>
      </div>
    </div>
  );
}
