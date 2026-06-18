"use client";

import { FC } from "react";
import { Copy } from "lucide-react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { toast } from "@/components/Toast/Toast";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { formatBountyCount } from "@/core/states/tournaments/common/formatBountyCount";
import {
  sortTournamentResultsRows,
  displayPlaceNumber,
  buildTournamentResultsCopyText,
} from "@/app/tournament/[id]/components/TournamentResults/tournamentResultsCopyText";
import { mobileCardCls } from "../../mobile.css";

export const MobileResultsSection: FC<{
  tournament: TournamentInfoResponse;
}> = ({ tournament }) => {
  const { data: players = [] } = useTournamentPlayerState(String(tournament.id));
  const rows = sortTournamentResultsRows(players, tournament.status);
  const total = players.length;

  const copy = async () => {
    if (rows.length === 0 || typeof navigator === "undefined") {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        buildTournamentResultsCopyText(players, tournament.status, tournament.date),
      );
      toast({ type: "success", message: "Результаты скопированы" });
    } catch {
      toast({ type: "error", message: "Не удалось скопировать" });
    }
  };

  return (
    <>
      <Button
        type="secondary"
        size="medium"
        width="100%"
        iconLeft={<Copy size={18} />}
        disabled={rows.length === 0}
        onClick={copy}
      >
        Скопировать результаты
      </Button>
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
          const points = row.rating?.totalPoints;
          const bounty = row.bountyCount ?? 0;
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
                <Typography.Text>{row.playerName}</Typography.Text>
              </Box>
              <Typography.Text type="secondary" size="small">
                {bounty > 0 ? `🥥 ${formatBountyCount(bounty)}` : ""}
                {typeof points === "number" ? `  ·  ${points} оч.` : ""}
              </Typography.Text>
            </Box>
          );
        })
      )}
    </>
  );
};
