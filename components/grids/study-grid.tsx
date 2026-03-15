import CardChrome from "./grid-parts/card-chrome";

export default function StudyGrid() {
  return (
    <div className="gridContainer" aria-label="Study grid">
      <div className="gridContainerLeft">
        <div className="gridContainerLeftTop gridCard" id="grid-leftTop" data-focus="study.launcher" tabIndex={0} role="button" aria-label="Study launcher">
          <CardChrome kicker="Study" title="Start a session" meta="Focus | notes | review | group" />
        </div>
        <div className="gridContainerLeftBottom">
          <div className="gridContainerLeftBottomLeft gridCard" id="grid-streak" data-focus="study.stats" tabIndex={0} role="button" aria-label="Session stats">
            <CardChrome kicker="Stats" title="Last 7 days" meta="6h 15m | 14 sessions | +1,350 XP" />
          </div>
          <div className="gridContainerLeftBottomRight gridCard" id="grid-quick" data-focus="study.quick" tabIndex={0} role="button" aria-label="Quick start focus">
            <CardChrome kicker="Quick" title="Focus 25" meta="Auto-link to current quest" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div className="gridContainerRightLeftOne gridCard" id="grid-quest1" data-focus="study.pomodoro" tabIndex={0} role="button" aria-label="Focus">
            <CardChrome kicker="Mode" title="Pomodoro" meta="25/5 | co-op optional" />
          </div>
          <div className="gridContainerRightLeftTwo gridCard" id="grid-quest2" data-focus="study.review" tabIndex={0} role="button" aria-label="Review">
            <CardChrome kicker="Mode" title="Review" meta="Recall | errors | fix notes" />
          </div>
          <div className="gridContainerRightLeftThree gridCard" id="grid-quest3" data-focus="study.capture" tabIndex={0} role="button" aria-label="Capture">
            <CardChrome kicker="Mode" title="Capture" meta="Write summary | tag | link task" />
          </div>
          <div className="gridContainerRightLeftFour gridCard" id="grid-quest4" data-focus="study.group" tabIndex={0} role="button" aria-label="Group">
            <CardChrome kicker="Mode" title="Group session" meta="Guild room | accountability" />
          </div>
        </div>

        <div className="gridContainerRightRight gridCard" id="grid-widget" data-focus="study.details" tabIndex={0} role="button" aria-label="Selected mode details">
          <CardChrome kicker="Details" title="Session setup" meta="Material | timer | reward" />
        </div>
      </div>
    </div>
  );
}
