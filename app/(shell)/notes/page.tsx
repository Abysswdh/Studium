import NotesHub from "../../../components/notes/notes-hub";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="notes" label="Notes" desc="Capture quick notes tied to your quests and sessions." />
      <NotesHub />
    </>
  );
}
