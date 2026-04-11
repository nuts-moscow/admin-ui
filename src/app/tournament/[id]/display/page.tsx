import { TournamentDisplayShell } from "@/app/tournament/[id]/display/TournamentDisplayShell";

interface TournamentDisplayPageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentDisplayPage({
  params,
}: TournamentDisplayPageProps) {
  const { id } = await params;
  return <TournamentDisplayShell tournamentId={id} />;
}
