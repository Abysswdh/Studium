import CardChrome from "./grid-parts/card-chrome";

export default function NotesGrid() {
  return (
    <div className="gridContainer gridContainer--notes" aria-label="Notes grid">
      <div className="gridContainerLeft">
        <div className="gridContainerLeftTop gridCard" id="grid-leftTop" tabIndex={0} role="button" aria-label="Notes inbox">
          <CardChrome kicker="Notes" title="Inbox" meta="Capture first, organize later" />
        </div>
        <div className="gridContainerLeftBottom">
          <div className="gridContainerLeftBottomLeft gridCard" id="grid-streak" tabIndex={0} role="button" aria-label="Tags and folders">
            <CardChrome kicker="Organize" title="Tags & folders" meta="Pinned • Subjects • Exams" />
          </div>
          <div className="gridContainerLeftBottomRight gridCard" id="grid-quick" tabIndex={0} role="button" aria-label="Quick capture">
            <CardChrome kicker="Quick capture" title="New note" meta="Enter • Type • Save" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div className="gridContainerRightLeftOne gridCard" id="grid-quest1" tabIndex={0} role="button" aria-label="Recent note 1">
            <CardChrome kicker="Recent" title="Limits — cheat sheet" meta="2m ago • Calculus" />
          </div>
          <div className="gridContainerRightLeftTwo gridCard" id="grid-quest2" tabIndex={0} role="button" aria-label="Recent note 2">
            <CardChrome kicker="Pinned" title="Midterm roadmap" meta="Checklist • 6 items" />
          </div>
          <div className="gridContainerRightLeftThree gridCard" id="grid-quest3" tabIndex={0} role="button" aria-label="Recent note 3">
            <CardChrome kicker="Link" title="Attach to task" meta="1 due today • 3 open" />
          </div>
          <div className="gridContainerRightLeftFour gridCard" id="grid-quest4" tabIndex={0} role="button" aria-label="Recent note 4">
            <CardChrome kicker="Review" title="Convert to flashcards" meta="12 cards • 1 deck" />
          </div>
        </div>

        <div className="gridContainerRightRight gridCard" id="grid-widget" tabIndex={0} role="button" aria-label="Editor and preview">
          <CardChrome kicker="Editor" title="Preview" meta="Select a note to open" />
        </div>
      </div>
    </div>
  );
}

