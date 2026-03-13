import PomodoroGrid from "../../../components/grids/pomodoro-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="pomodoro" label="Pomodoro" desc="Timer + co-op focus sessions linked to tasks." />
      <PomodoroGrid />
    </>
  );
}
