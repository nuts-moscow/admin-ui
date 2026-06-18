import { MobileTournamentScreen } from "@/mobile/screens/MobileTournamentScreen";

interface MobileTournamentPageProps {
  params: Promise<{ id: string }>;
}

export default async function MobileTournamentPage({
  params,
}: MobileTournamentPageProps) {
  const { id } = await params;
  return <MobileTournamentScreen tournamentId={id} />;
}
