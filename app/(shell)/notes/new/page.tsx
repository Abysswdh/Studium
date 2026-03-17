import NotesNewWorkspace from "../../../../components/notes/notes-new-workspace";
import ViewMarker from "../../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="notes" />
      <NotesNewWorkspace />
    </>
  );
}

