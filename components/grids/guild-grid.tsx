import CardChrome from "./grid-parts/card-chrome";

export default function GuildGrid() {
  return (
    <div className="gridContainer gridContainer--guild" aria-label="Guild grid">
      <div className="gridContainerLeft">
        <div className="gridContainerLeftTop gridCard" id="grid-leftTop" tabIndex={0} role="button" aria-label="Guild overview">
          <CardChrome kicker="Guild" title="Orbit Squad" meta="5 online • 2 co-focus rooms" />
        </div>
        <div className="gridContainerLeftBottom">
          <div className="gridContainerLeftBottomLeft gridCard" id="grid-streak" tabIndex={0} role="button" aria-label="Accountability">
            <CardChrome kicker="Accountability" title="Nudges: On" meta="Leave-early check • Gentle reminders" />
          </div>
          <div className="gridContainerLeftBottomRight gridCard" id="grid-quick" tabIndex={0} role="button" aria-label="Start co-focus">
            <CardChrome kicker="Co-focus" title="Start a room" meta="25m • 50m • Custom" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div className="gridContainerRightLeftOne gridCard" id="grid-quest1" tabIndex={0} role="button" aria-label="Room 1">
            <CardChrome kicker="Room" title="Calculus grind" meta="3 members • 18m left" />
          </div>
          <div className="gridContainerRightLeftTwo gridCard" id="grid-quest2" tabIndex={0} role="button" aria-label="Room 2">
            <CardChrome kicker="Room" title="Chem review" meta="2 members • starting soon" />
          </div>
          <div className="gridContainerRightLeftThree gridCard" id="grid-quest3" tabIndex={0} role="button" aria-label="Guild event">
            <CardChrome kicker="Event" title="Guild vs Guild" meta="Tonight • 21:00" />
          </div>
          <div className="gridContainerRightLeftFour gridCard" id="grid-quest4" tabIndex={0} role="button" aria-label="Leaderboard">
            <CardChrome kicker="Rank" title="Weekly XP" meta="#3 • +1,240 XP" />
          </div>
        </div>

        <div className="gridContainerRightRight gridCard" id="grid-widget" tabIndex={0} role="button" aria-label="Chat and activity">
          <CardChrome kicker="Chat" title="Squad feed" meta="Mentions • Pings • Join links" />
        </div>
      </div>
    </div>
  );
}

