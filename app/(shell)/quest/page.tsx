import QuestGrid from "../../../components/grids/quest-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="quest" label="Quest" desc="Pick quests, set difficulty, earn XP & streaks." />
      <QuestGrid />
    </>
  );
}
