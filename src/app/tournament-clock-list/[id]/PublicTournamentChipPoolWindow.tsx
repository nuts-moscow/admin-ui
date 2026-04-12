'use client';

import { CSSProperties, FC } from 'react';
import { TournamentChipPoolWindow } from '@/app/tournament/[id]/components/TournamentChipPoolWindow/TournamentChipPoolWindow';
import { TournamentInfoResponse } from '@/core/states/tournaments/requests/getTournament';
import { usePublicTournamentChipPoolSummary } from '@/core/states/tournaments/hooks/usePublicTournamentChipPoolSummary';
import { getPublicTournamentClock } from '@/core/states/tournaments/requests/getPublicTournamentClock';
import { getPublicTournamentClockWebSocketUrl } from '@/core/states/tournaments/common/tournamentClockWebSocketUrl';

export interface PublicTournamentChipPoolWindowProps {
  readonly tournament: TournamentInfoResponse;
  readonly style?: CSSProperties;
}

export const PublicTournamentChipPoolWindow: FC<PublicTournamentChipPoolWindowProps> = ({
  tournament,
  style,
}) => {
  return (
    <TournamentChipPoolWindow
      tournament={tournament}
      showTvBroadcastLink={false}
      style={style}
      chipPoolSummaryHook={usePublicTournamentChipPoolSummary}
      enablePublicRatingPointsPreview
      clockOptions={{
        getClockFn: getPublicTournamentClock,
        wsUrlFn: getPublicTournamentClockWebSocketUrl,
      }}
    />
  );
};
