import CardChrome from "./grid-parts/card-chrome";

export default function NotesGrid() {
  return (
    <div className="gridContainer gridContainer--notes" aria-label="Notes grid">
      <div className="gridContainerLeft">
        <div
          className="gridContainerLeftTop gridCard"
          id="grid-leftTop"
          data-focus="notes.inbox"
          tabIndex={0}
          role="button"
          aria-label="Notes inbox"
        >
          <CardChrome kicker="Notes" title="Inbox" meta="Capture first, organize later" />
        </div>
        <div className="gridContainerLeftBottom">
          <div
            className="gridContainerLeftBottomLeft gridCard"
            id="grid-streak"
            data-focus="notes.tags"
            tabIndex={0}
            role="button"
            aria-label="Tags and folders"
          >
            <CardChrome kicker="Organize" title="Tags & folders" meta="Pinned | Subjects | Exams" />
          </div>
          <div
            className="gridContainerLeftBottomRight gridCard"
            id="grid-quick"
            data-focus="notes.new"
            tabIndex={0}
            role="button"
            aria-label="Quick capture"
          >
            <CardChrome kicker="Quick capture" title="New note" meta="Enter | Type | Save" />
          </div>
        </div>
      </div>

      <div className="gridContainerRight">
        <div className="gridContainerRightLeft">
          <div
            className="gridContainerRightLeftOne gridCard"
            id="grid-quest1"
            data-focus="notes.recent1"
            tabIndex={0}
            role="button"
            aria-label="Recent note 1"
          >
            <CardChrome kicker="Recent" title="Limits - cheat sheet" meta="2m ago | Calculus" />
          </div>
          <div
            className="gridContainerRightLeftTwo gridCard"
            id="grid-quest2"
            data-focus="notes.recent2"
            tabIndex={0}
            role="button"
            aria-label="Recent note 2"
          >
            <CardChrome kicker="Pinned" title="Midterm roadmap" meta="Checklist | 6 items" />
          </div>
          <div
            className="gridContainerRightLeftThree gridCard"
            id="grid-quest3"
            data-focus="notes.link"
            tabIndex={0}
            role="button"
            aria-label="Recent note 3"
          >
            <CardChrome kicker="Link" title="Attach to task" meta="1 due today | 3 open" />
          </div>
          <div
            className="gridContainerRightLeftFour gridCard"
            id="grid-quest4"
            data-focus="notes.flashcards"
            tabIndex={0}
            role="button"
            aria-label="Recent note 4"
          >
            <CardChrome kicker="Review" title="Convert to flashcards" meta="12 cards | 1 deck" />
          </div>
        </div>

        <div
          className="gridContainerRightRight gridCard"
          id="grid-widget"
          data-focus="notes.preview"
          tabIndex={0}
          role="button"
          aria-label="Editor and preview"
        >
          <CardChrome kicker="Editor" title="Preview" meta="Select a note to open" />
        </div>
      </div>
    </div>
  );
}
