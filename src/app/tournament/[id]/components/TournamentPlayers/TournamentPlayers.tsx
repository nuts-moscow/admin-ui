"use client";

import { FC, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const tournamentId = String(tournament.id);

  return (
    <Box flex={{ col: true, gap: 6, width: "100%" }}>
      <TableList tournamentId={tournamentId} />
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Поиск игрока: id, имя"
        style={{
          width: "100%",
          borderRadius: 12,
          border: "1px solid var(--border-color)",
          minHeight: 44,
          padding: "0 12px",
          backgroundColor: "var(--background-primary)",
          color: "var(--text-primary)",
        }}
      />
      <div className={playerListCardContainerCls}>
        <WaitingListPlayers
          tournamentId={tournamentId}
          searchQuery={searchQuery}
          entryPrice={tournament.structure?.entryPrice}
        />
        <InGamePlayers
          tournamentId={tournamentId}
          searchQuery={searchQuery}
          entryPrice={tournament.structure?.entryPrice}
        />
      </div>
    </Box>
  );
};
