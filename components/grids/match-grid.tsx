import CardChrome from "./grid-parts/card-chrome";

export default function MatchGrid() {
  return (
    <div className="gridContainer" aria-label="Match grid">
      <div className="gridContainerLeft">
        <div className="gridContainerLeftTop gridCard" id="grid-leftTop" tabIndex={0} role="button" aria-label="Events overview">
          <CardChrome kicker="Events" title="Tournaments" meta="Weekly • seasonal • guild wars" />
        </div>
        <div className="gridContainerLeftBottom">
          <div className="gridContainerLeftBottomLeft gridCard" id="grid-streak" tabIndex={0} role="button" aria-label="Ranked">
            <CardChrome kicker="Ranked" title="Queue" meta="Solo ladder • duo ladder" />
          </div>
          <div className="gridContainerLeftBottomRight gridCard" id="grid-quick" tabIndex={0} role="button" aria-label="Create room">
            <CardChrome kicker="Custom" title="Create room" meta="Private • invite-only" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div className="gridContainerRightLeftOne gridCard" id="grid-quest1" tabIndex={0} role="button" aria-label="Event 1">
            <CardChrome kicker="Event" title="Guild vs Guild" meta="Tonight • rewards x2" />
          </div>
          <div className="gridContainerRightLeftTwo gridCard" id="grid-quest2" tabIndex={0} role="button" aria-label="Event 2">
            <CardChrome kicker="Event" title="Speedrun" meta="15m • accuracy bonus" />
          </div>
          <div className="gridContainerRightLeftThree gridCard" id="grid-quest3" tabIndex={0} role="button" aria-label="Event 3">
            <CardChrome kicker="Event" title="Boss Raid" meta="Co-op • timed" />
          </div>
          <div className="gridContainerRightLeftFour gridCard" id="grid-quest4" tabIndex={0} role="button" aria-label="Rewards">
            <CardChrome kicker="Rewards" title="Loot" meta="Badges • titles • XP" />
          </div>
        </div>

        <div className="gridContainerRightRight gridCard" id="grid-widget" tabIndex={0} role="button" aria-label="Leaderboard">
          <CardChrome kicker="Leaderboard" title="This week" meta="Top XP • top streak • top wins" />
        </div>
      </div>
    </div>
  );
}

