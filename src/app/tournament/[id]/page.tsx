import { TournamentPageView } from "@/app/tournament/[id]/TournamentPageView";
import { getEnvironmentWithReqCookies } from "@/core/states/environment/environmentSsr";
import { getTournament } from "@/core/states/tournaments/requests/getTournament";
import { cookies } from "next/dist/server/request/cookies";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { formatTournamentPageTitle } from "@/core/states/tournaments/common/formatTournamentPageTitle";

interface TournamentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TournamentPageProps): Promise<Metadata> {
  const { id } = await params;
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);
  const tournament = await getTournament(environment, id);
  if (!tournament) {
    return { title: "Турнир" };
  }
  return { title: formatTournamentPageTitle(tournament) };
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
