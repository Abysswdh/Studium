import BattleGrid from "../../../components/grids/battle-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="battle" label="Battle" desc="1v1 quizzes from a question bank. Win, rank up, repeat." />
      <BattleGrid />
    </>
  );
}
