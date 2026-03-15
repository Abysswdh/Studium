import CardChrome from "./grid-parts/card-chrome";

export default function BattleGrid() {
  return (
    <div className="gridContainer" aria-label="Battle grid">
      <div className="gridContainerLeft">
        <div className="gridContainerLeftTop gridCard" id="grid-leftTop" data-focus="battle.lobby" tabIndex={0} role="button" aria-label="Battle lobby">
          <CardChrome kicker="Battle" title="1v1 lobby" meta="Match by topic | win streak | rank" />
        </div>
        <div className="gridContainerLeftBottom">
          <div className="gridContainerLeftBottomLeft gridCard" id="grid-streak" data-focus="battle.topic" tabIndex={0} role="button" aria-label="Loadout">
            <CardChrome kicker="Loadout" title="Topic" meta="Calculus | Limits | Derivatives" />
          </div>
          <div className="gridContainerLeftBottomRight gridCard" id="grid-quick" data-focus="battle.queue" tabIndex={0} role="button" aria-label="Queue">
            <CardChrome kicker="Queue" title="Find match" meta="Solo | Guild | Custom" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div className="gridContainerRightLeftOne gridCard" id="grid-quest1" data-focus="battle.quick" tabIndex={0} role="button" aria-label="Mode 1">
            <CardChrome kicker="Mode" title="Quick" meta="10 questions | 5m" />
          </div>
          <div className="gridContainerRightLeftTwo gridCard" id="grid-quest2" data-focus="battle.ranked" tabIndex={0} role="button" aria-label="Mode 2">
            <CardChrome kicker="Mode" title="Ranked" meta="ELO | streak rewards" />
          </div>
          <div className="gridContainerRightLeftThree gridCard" id="grid-quest3" data-focus="battle.guildDuel" tabIndex={0} role="button" aria-label="Mode 3">
            <CardChrome kicker="Mode" title="Guild duel" meta="2v2 | party bonus" />
          </div>
          <div className="gridContainerRightLeftFour gridCard" id="grid-quest4" data-focus="battle.training" tabIndex={0} role="button" aria-label="Practice">
            <CardChrome kicker="Practice" title="Training" meta="Weakness list | drills" />
          </div>
        </div>

        <div className="gridContainerRightRight gridCard" id="grid-widget" data-focus="battle.stats" tabIndex={0} role="button" aria-label="Battle stats">
          <CardChrome kicker="Stats" title="Rank & history" meta="Win rate | streak | topics" />
        </div>
      </div>
    </div>
  );
}
