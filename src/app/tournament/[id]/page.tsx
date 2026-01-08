import { TournamentPageView } from "@/app/tournament/[id]/TournamentPageView";
import { getEnvironmentWithReqCookies } from "@/core/states/environment/environmentSsr";
import { getTournament } from "@/core/states/tournaments/requests/getTournament";
import { cookies } from "next/dist/server/request/cookies";
import { redirect } from "next/navigation";

interface TournamentPageProps {
  params: Promise<{ id: string }>;
}

const getTournamentPageData = async (id: string) => {
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);
  const tournament = await getTournament(environment, id);
  return { tournament };
};

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params;

  const { tournament } = await getTournamentPageData(id);

  if (!tournament) {
    return redirect("/");
  }

  return <TournamentPageView tournament={tournament} />;
}
