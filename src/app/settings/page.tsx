import { SettingsPageView } from "@/app/settings/SettingsPageView/SettingsPageView";
import { getEnvironmentWithReqCookies } from "@/core/states/environment/environmentSsr";
import { getPlayers } from "@/core/states/players/requests/getPlayers";
import { getTournamentStructures } from "@/core/states/tournamentStructures/requests/getTournamentStructures";
import { cookies } from "next/headers";

const getSettingsPageData = async () => {
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);
  return Promise.all([
    getTournamentStructures(environment),
    getPlayers(environment),
  ]);
};

export default async function SettingsPage() {
  const [tournamentStructures, players] = await getSettingsPageData();

  return (
    <SettingsPageView
      initialTournamentStructures={tournamentStructures}
      initialPlayers={players}
    />
  );
}
