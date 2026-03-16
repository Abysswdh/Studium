import MatchGrid from "../../../components/grids/match-grid";
import ViewMarker from "../../../components/view-marker";
import { getCurrentUser } from "../../../lib/auth/current-user";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return (
    <>
      <ViewMarker view="match" label="Options" desc="Settings, preferences, and app options." />
      <MatchGrid user={{ id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl }} />
    </>
  );
}
