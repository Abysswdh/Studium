import CardChrome from "./grid-parts/card-chrome";

export default function QuestGrid() {
  return (
    <div className="gridContainer" aria-label="Quest grid">
      <div className="gridContainerLeft">
        <div className="gridContainerLeftTop gridCard" id="grid-leftTop" tabIndex={0} role="button" aria-label="Quest board">
          <CardChrome kicker="Quest board" title="Pick your run" meta="Difficulty • XP • streak impact" />
        </div>
        <div className="gridContainerLeftBottom">
          <div className="gridContainerLeftBottomLeft gridCard" id="grid-streak" tabIndex={0} role="button" aria-label="Daily objectives">
            <CardChrome kicker="Objectives" title="Daily goals" meta="2 focus • 1 review • 1 capture" />
          </div>
          <div className="gridContainerLeftBottomRight gridCard" id="grid-quick" tabIndex={0} role="button" aria-label="Create quest">
            <CardChrome kicker="Create" title="New quest" meta="Task • material • timer" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div className="gridContainerRightLeftOne gridCard" id="grid-quest1" tabIndex={0} role="button" aria-label="Quest slot 1">
            <CardChrome kicker="Quest" title="Starter" meta="15m • +90 XP" />
          </div>
          <div className="gridContainerRightLeftTwo gridCard" id="grid-quest2" tabIndex={0} role="button" aria-label="Quest slot 2">
            <CardChrome kicker="Quest" title="Grind" meta="2×25m • +220 XP" />
          </div>
          <div className="gridContainerRightLeftThree gridCard" id="grid-quest3" tabIndex={0} role="button" aria-label="Quest slot 3">
            <CardChrome kicker="Quest" title="Boss" meta="50m • +360 XP" />
          </div>
          <div className="gridContainerRightLeftFour gridCard" id="grid-quest4" tabIndex={0} role="button" aria-label="Quest slot 4">
            <CardChrome kicker="Quest" title="Party" meta="Guild co-op • +XP bonus" />
          </div>
        </div>

        <div className="gridContainerRightRight gridCard" id="grid-widget" tabIndex={0} role="button" aria-label="Quest details">
          <CardChrome kicker="Details" title="Selected quest" meta="Steps • rewards • penalties" />
        </div>
      </div>
    </div>
  );
}

