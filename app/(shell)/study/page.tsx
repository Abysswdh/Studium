import StudyGrid from "../../../components/grids/study-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="study" label="Study Room" desc="Start a session: focus, review, and capture." />
      <StudyGrid />
    </>
  );
}
