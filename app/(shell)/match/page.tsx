import MatchGrid from "../../../components/grids/match-grid";
import ViewMarker from "../../../components/view-marker";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { guestUser } from "../../../lib/mock-user";

export default async function Page() {
  const user = (await getCurrentUser()) ?? guestUser();
  return (
    <>
      <ViewMarker view="match" label="Options" desc="Settings, preferences, and app options." />
      <MatchGrid user={{ id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl }} />
    </>
  );
}
