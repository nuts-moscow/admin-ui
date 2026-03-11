"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { TableList } from "./TableList/TableList";
import { WaitingListPlayers } from "./WaitingListPlayers/WaitingListPlayers";
import { InGamePlayers } from "./InGamePlayers/InGamePlayers";
import { playerListCardContainerCls } from "./PlayerListCard/PlayerListCard.css";

export interface TournamentPlayersProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentPlayers: FC<TournamentPlayersProps> = ({
  tournament,
}) => {
  return (
    <Box flex={{ col: true, gap: 6, width: "100%" }}>
      <TableList tournamentId={String(tournament.id)} />
      <div className={playerListCardContainerCls}>
        <WaitingListPlayers tournamentId={String(tournament.id)} />
        <InGamePlayers tournamentId={String(tournament.id)} />
      </div>
    </Box>
  );
};
