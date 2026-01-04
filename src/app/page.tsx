import { TournamentsPageView } from "@/app/TournamentsPageView/TournamentsPageView";
import {
  getEnvironment,
  getEnvironmentWithReqCookies,
} from "@/core/states/environment/environmentSsr";
import { getTournaments } from "@/core/states/tournaments/requests/getTournaments";
import { cookies } from "next/headers";

const getTournamentsRequest = async () => {
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);
  return getTournaments(environment, "RegistrationOpen");
};

export default async function Home() {
  const tournaments = await getTournamentsRequest();
  return <TournamentsPageView initialTournaments={tournaments} />;
}
