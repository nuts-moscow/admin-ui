"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import {
  sortTournamentResultsRows,
  displayPlaceNumber,
} from "@/app/tournament/[id]/components/TournamentResults/tournamentResultsCopyText";
import { mobileCardCls } from "../../mobile.css";

const nonPlacement = (row: InGamePlayerState): number =>
  row.ratingNonPlacementAccrued ?? row.rating?.nonPlacementAccrued ?? 0;

const totalPoints = (row: InGamePlayerState): number =>
  row.rating?.totalPoints ?? nonPlacement(row);

export const MobileRatingSection: FC<{
  tournament: TournamentInfoResponse;
}> = ({ tournament }) => {
  const { data: players = [] } = useTournamentPlayerState(String(tournament.id));
  const rows = sortTournamentResultsRows(players, tournament.status).filter(
    (p) => p.status !== "Registered",
  );
  const total = players.length;

  if (tournament.ratingEnabled === false) {
    return (
      <Typography.Text type="secondary" size="small">
        Рейтинг для этого турнира выключен.
      </Typography.Text>
    );
  }

  return (
    <>
      {rows.length === 0 ? (
        <Typography.Text type="secondary" size="small">
          Нет участников
        </Typography.Text>
      ) : (
        rows.map((row) => {
          const place = displayPlaceNumber(
            row.placement,
            total,
            tournament.status,
          );
          return (
            <Box
              key={row.playerId}
              className={mobileCardCls}
              flex={{ align: "center", justify: "space-between", gap: 2 }}
              style={{ flexDirection: "row" }}
            >
              <Box flex={{ align: "center", gap: 3 }}>
                <Typography.Text bold style={{ minWidth: 28 }}>
                  {place ?? "—"}
                </Typography.Text>
                <Box flex={{ col: true, gap: 0 }}>
                  <Typography.Text>{row.playerName}</Typography.Text>
                  <Typography.Text type="secondary" size="xSmall">
                    За место {row.rating?.fromTable ?? 0} · Баунти{" "}
                    {row.rating?.bounty ?? 0} · Доп {nonPlacement(row)}
                  </Typography.Text>
                </Box>
              </Box>
              <Typography.Text bold>{totalPoints(row)}</Typography.Text>
            </Box>
          );
        })
      )}
    </>
  );
};
