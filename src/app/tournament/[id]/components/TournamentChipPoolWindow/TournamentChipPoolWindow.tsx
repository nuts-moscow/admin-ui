"use client";

import { FC, ReactNode } from "react";
import { Box } from "@/components/Box/Box";
import { Formatter } from "@/components/Formatter/Formatter";
import { Typography } from "@/components/Typography/Typography";
import { useTournamentChipPoolSummary } from "@/core/states/tournaments/hooks/useTournamentChipPoolSummary";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";

export interface TournamentChipPoolWindowProps {
  readonly tournament: TournamentInfoResponse;
}

const StatRow: FC<{
  label: string;
  children: ReactNode;
  last?: boolean;
}> = ({ label, children, last }) => (
  <Box
    flex={{ justify: "space-between", align: "center", gap: 3 }}
    style={{
      padding: "10px 0",
      borderBottom: last ? undefined : "1px solid rgba(0, 0, 0, 0.06)",
    }}
  >
    <Typography.Text type="secondary" size="small">
      {label}
    </Typography.Text>
    <Typography.Text bold>{children}</Typography.Text>
  </Box>
);

export const TournamentChipPoolWindow: FC<TournamentChipPoolWindowProps> = ({
  tournament,
}) => {
  const tid = String(tournament.id);
  const { data, loading, error } = useTournamentChipPoolSummary(tid);

  if (loading && !data) {
    return (
      <Box flex={{ col: true, gap: 3 }} width="100%" style={{ padding: 16 }}>
        <Typography.Text type="secondary">Загрузка…</Typography.Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={{ col: true, gap: 3 }} width="100%" style={{ padding: 16 }}>
        <Typography.Text type="error">{error.message}</Typography.Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box flex={{ col: true, gap: 3 }} width="100%" style={{ padding: 16 }}>
        <Typography.Text type="secondary">
          Сводка по фишкам недоступна (турнир не найден или нет кэша структуры
          для live).
        </Typography.Text>
      </Box>
    );
  }

  const { playersActive, playersArrived, totalChips, averageStack, rebuyCount } =
    data;

  return (
    <Box flex={{ col: true, gap: 2 }} width="100%" style={{ padding: 16 }}>
      <Box
        flex={{ col: true }}
        style={{
          backgroundColor: "var(--background-primary)",
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          padding: "8px 16px 16px",
        }}
      >
        <StatRow label="Игроки в игре / всего в турнире">
          <>
            <Formatter.number value={playersActive} type="withoutDecimals" />
            {" / "}
            <Formatter.number value={playersArrived} type="withoutDecimals" />
          </>
        </StatRow>
        <StatRow label="Всего фишек в игре">
          <Formatter.number value={totalChips} type="withoutDecimals" />
        </StatRow>
        <StatRow label="Средний стек">
          {averageStack == null ? (
            "—"
          ) : (
            <Formatter.number value={averageStack} type="withoutDecimals" />
          )}
        </StatRow>
        <StatRow label="Ребаи" last>
          <Formatter.number value={rebuyCount} type="withoutDecimals" />
        </StatRow>
      </Box>
    </Box>
  );
};
