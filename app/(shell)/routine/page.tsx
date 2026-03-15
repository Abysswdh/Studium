import RoutineGrid from "../../../components/grids/routine-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
      <>
      <ViewMarker view="routine" label="Routine" desc="Now / Next / Later - turn deadlines into concrete steps." />
      <RoutineGrid />
    </>
  );
}
