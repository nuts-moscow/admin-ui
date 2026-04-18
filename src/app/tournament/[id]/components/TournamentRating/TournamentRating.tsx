"use client";

import { FC, useMemo } from "react";
import { Box } from "@/components/Box/Box";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { TournamentRatingSettings } from "./TournamentRatingSettings";
import { TournamentRatingPlayers } from "./TournamentRatingPlayers";
import { TournamentRatingMatrix } from "./TournamentRatingMatrix";

export interface TournamentRatingProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentRating: FC<TournamentRatingProps> = ({ tournament }) => {
  const { data: players = [] } = useTournamentPlayerState(
    String(tournament.id),
  );

  const participantCount = useMemo(
    () =>
      players.filter(
        (p) =>
          p.status !== "Registered",
      ).length,
    [players],
  );

  const showPlayers =
    tournament.status === "InProgress" || tournament.status === "Completed";

  return (
    <Box
      flex={{ col: true, gap: 5, width: "100%" }}
      style={{ padding: "16px 0" }}
    >
      <TournamentRatingSettings tournament={tournament} />

      {showPlayers && <TournamentRatingPlayers tournament={tournament} />}

      <TournamentRatingMatrix
        participantCount={participantCount}
        defaultRatingTableId={tournament.ratingTableId}
      />
    </Box>
  );
};
