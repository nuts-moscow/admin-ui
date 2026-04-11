import { PublicTournamentDisplayShell } from './PublicTournamentDisplayShell';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicTournamentDisplayPage({ params }: Props) {
  const { id } = await params;
  return <PublicTournamentDisplayShell tournamentId={id} />;
}
