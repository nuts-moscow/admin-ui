"use client";

import { FC, useMemo } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { toast } from "@/components/Toast/Toast";
import { Typography } from "@/components/Typography/Typography";
import { useTournamentFinalResults } from "@/core/states/tournaments/hooks/useTournamentFinalResults";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { Copy } from "lucide-react";

export interface TournamentResultsProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentResults: FC<TournamentResultsProps> = ({
  tournament,
}) => {
  const GRID_TEMPLATE = "64px 56px minmax(180px, 1fr) minmax(180px, 1fr) 140px";
  const { data, loading } = useTournamentFinalResults(String(tournament.id));
  const rows = useMemo(
    () => [...(data?.results ?? [])].sort((a, b) => a.placement - b.placement),
    [data?.results]
  );

  const copyResults = async () => {
    const text = rows
      .map(
        (row) =>
          `${row.placement}. ${row.playerName} — Баунти: ${row.bountyCount}`
      )
      .join("\n");
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast({
        type: "success",
        message: "Результаты скопированы",
      });
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message: "Не удалось скопировать результаты",
      });
    }
  };

  return (
    <Box
      flex={{ col: true, gap: 6, width: "100%" }}
      style={{
        backgroundColor: "#e9e9e9",
        borderRadius: 16,
        padding: 16,
        minHeight: 420,
      }}
    >
      <Box flex={{ justify: "center", width: "100%" }}>
        <Button
          type="secondary"
          size="medium"
          iconLeft={<Copy />}
          onClick={copyResults}
          disabled={rows.length === 0}
          style={{ minWidth: 240 }}
        >
          Скопировать
        </Button>
      </Box>

      <Box
        flex={{ col: true, width: "100%" }}
        style={{
          backgroundColor: "var(--background-primary)",
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: GRID_TEMPLATE,
            alignItems: "center",
            columnGap: 12,
            padding: "14px 12px",
          }}
        >
          <Typography.Text size="small" type="secondary">
            #
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            {" "}
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            Никнейм
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            Имя
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            Баунти
          </Typography.Text>
        </Box>

        {rows.map((row) => (
          <Box
            key={row.playerId}
            style={{
              display: "grid",
              gridTemplateColumns: GRID_TEMPLATE,
              alignItems: "center",
              columnGap: 12,
              padding: "10px 12px",
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            <Typography.Text>{row.placement}</Typography.Text>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#e4e4e4",
              }}
            />
            <Typography.Text>{row.playerName}</Typography.Text>
            <Typography.Text type="secondary">-</Typography.Text>
            <Typography.Text>{row.bountyCount} Баунти</Typography.Text>
          </Box>
        ))}

        {!loading && rows.length === 0 && (
          <Box
            style={{
              width: "100%",
              minHeight: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography.Text type="secondary">Нет результатов</Typography.Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
