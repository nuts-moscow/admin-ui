import { SettingsPageView } from "@/app/settings/SettingsPageView/SettingsPageView";
import { getEnvironmentWithReqCookies } from "@/core/states/environment/environmentSsr";
import { getTournamentStructures } from "@/core/states/tournamentStructures/requests/getTournamentStructures";
import { cookies } from "next/headers";

const getTournamentStructuresRequest = async () => {
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);
  return getTournamentStructures(environment);
};

export default async function SettingsPage() {
  const tournamentStructures = await getTournamentStructuresRequest();

  return (
    <SettingsPageView initialTournamentStructures={tournamentStructures} />
  );
}
