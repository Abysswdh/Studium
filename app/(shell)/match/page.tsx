import MatchGrid from "../../../components/grids/match-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="match" label="Options" desc="Settings, preferences, and app options." />
      <MatchGrid />
    </>
  );
}
