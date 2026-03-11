"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useNonRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useNonRegisteredTournamentPlayerState";

export interface TournamentReentriesProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentReentries: FC<TournamentReentriesProps> = ({
  tournament,
}) => {
  const { data: players } = useNonRegisteredTournamentPlayerState(
    String(tournament.id)
  );
  const rows = players ?? [];

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <Box
        flex={{ width: "100%", align: "center", justify: "space-between" }}
        style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.16)", paddingBottom: 8 }}
      >
        <Typography.Text bold>Статистика ребаев</Typography.Text>
        <Typography.Text bold>{rows.length}</Typography.Text>
      </Box>

      <Box flex={{ col: true, gap: 2, width: "100%" }}>
        <Box
          flex={{ width: "100%", align: "center", gap: 3 }}
          style={{ padding: "0 12px", opacity: 0.65 }}
        >
          <Typography.Text size="small" flexItem={{ minWidth: 48 }}>
            id
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ flex: 1 }}>
            Никнейм
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 96 }}>
            Всего входов
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 96 }}>
            Бесплатно
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 96 }}>
            К оплате
          </Typography.Text>
        </Box>

        {rows.map((player) => (
          <Box
            key={player.playerId}
            flex={{ width: "100%", align: "center", gap: 3 }}
            style={{
              backgroundColor: "#e9e9e9",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <Typography.Text bold flexItem={{ minWidth: 48 }}>
              {player.playerId}
            </Typography.Text>
            <Typography.Text bold flexItem={{ flex: 1 }}>
              {player.playerName}
            </Typography.Text>
            <Typography.Text bold flexItem={{ minWidth: 96 }}>
              4/5
            </Typography.Text>
            <Typography.Text bold flexItem={{ minWidth: 96 }}>
              3/5
            </Typography.Text>
            <Typography.Text bold flexItem={{ minWidth: 96 }}>
              1/5
            </Typography.Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
