import SchedulesGrid from "../../../components/grids/schedules-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="schedules" label="Schedules" desc="Agenda + deadlines that feed your routine." />
      <SchedulesGrid />
    </>
  );
}
