import MatchGrid from "../../../components/grids/match-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="match" label="Match" desc="Modes like guild vs guild, tournaments, and events." />
      <MatchGrid />
    </>
  );
}
