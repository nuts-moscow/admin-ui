import { TournamentDisplayShell } from "@/app/tournament/[id]/display/TournamentDisplayShell";
import { getEnvironmentWithReqCookies } from "@/core/states/environment/environmentSsr";
import { getTournament } from "@/core/states/tournaments/requests/getTournament";
import { cookies } from "next/dist/server/request/cookies";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

interface TournamentDisplayPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TournamentDisplayPageProps): Promise<Metadata> {
  const { id } = await params;
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);
  const tournament = await getTournament(environment, id);
  if (!tournament) {
    return { title: "Турнирное окно" };
  }
  return {
    title: `${tournament.name} — эфир`,
    description: "Турнирное окно для вывода на экран",
  };
}

export default async function TournamentDisplayPage({
  params,
}: TournamentDisplayPageProps) {
  const { id } = await params;
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);
  const tournament = await getTournament(environment, id);

  if (!tournament) {
    return redirect("/");
  }

  return <TournamentDisplayShell tournament={tournament} />;
}
