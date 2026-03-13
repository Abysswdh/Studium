import GuildGrid from "../../../components/grids/guild-grid";
import ViewMarker from "../../../components/view-marker";

export default function Page() {
  return (
    <>
      <ViewMarker view="guild" label="Guild" desc="Group study rooms, co-focus, chat, accountability." />
      <GuildGrid />
    </>
  );
}
