"use client";

import { FC, ReactNode } from "react";
import { Box } from "@/components/Box/Box";
import { Formatter } from "@/components/Formatter/Formatter";
import { Typography } from "@/components/Typography/Typography";
import { useTournamentChipPoolSummary } from "@/core/states/tournaments/hooks/useTournamentChipPoolSummary";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { TournamentClockPanel } from "../TournamentState/TournamentClockPanel";

export interface TournamentChipPoolWindowProps {
  readonly tournament: TournamentInfoResponse;
}

/** Подпись над значением, по центру колонки. */
const SideStat: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <Box
    flex={{ col: true, align: "center" }}
    width="100%"
    style={{ marginBottom: 20, textAlign: "center" }}
  >
    <Typography.Text type="secondary" size="small">
      {label}
    </Typography.Text>
    <Typography.Text bold>{children}</Typography.Text>
  </Box>
);

function SingleColumnWindow({
  tournament,
  children,
}: {
  readonly tournament: TournamentInfoResponse;
  readonly children: ReactNode;
}) {
  return (
    <Box
      width="100%"
      flex={{ col: true, align: "center", justify: "center" }}
      flexItem={{ flex: 1 }}
      style={{
        minWidth: 0,
        minHeight: "calc(100vh - 200px)",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <Box
        flex={{ col: true, align: "center" }}
        width="100%"
        style={{ maxWidth: 480 }}
      >
        <Typography.Text
          size="medium"
          bold
          style={{
            textAlign: "center",
            display: "block",
            marginBottom: 24,
            width: "100%",
          }}
        >
          {tournament.name}
        </Typography.Text>
        <Box flex={{ col: true, align: "center" }} width="100%">
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export const TournamentChipPoolWindow: FC<TournamentChipPoolWindowProps> = ({
  tournament,
}) => {
  const tid = String(tournament.id);
  const { data, loading, error } = useTournamentChipPoolSummary(tid);

  const clockCenter =
    tournament.status === "InProgress" ? (
      <TournamentClockPanel
        tournamentId={tournament.id}
        blindsStructure={tournament.structure?.blindsStructure}
        enabled
        layout="broadcast"
      />
    ) : (
      <Typography.Text type="secondary" size="small" style={{ textAlign: "center" }}>
        Часы доступны, когда турнир идёт.
      </Typography.Text>
    );

  if (loading && !data) {
    return (
      <SingleColumnWindow tournament={tournament}>
        {clockCenter}
        <Typography.Text type="secondary" size="small" style={{ marginTop: 12, textAlign: "center" }}>
          Загрузка…
        </Typography.Text>
      </SingleColumnWindow>
    );
  }

  if (error) {
    return (
      <SingleColumnWindow tournament={tournament}>
        {clockCenter}
        <Typography.Text type="error" size="small" style={{ marginTop: 12, textAlign: "center" }}>
          {error.message}
        </Typography.Text>
      </SingleColumnWindow>
    );
  }

  if (!data) {
    return (
      <SingleColumnWindow tournament={tournament}>
        {clockCenter}
        <Typography.Text type="secondary" size="small" style={{ marginTop: 12, textAlign: "center" }}>
          Сводка по фишкам недоступна (турнир не найден или нет кэша структуры
          для live).
        </Typography.Text>
      </SingleColumnWindow>
    );
  }

  const { playersActive, playersArrived, totalChips, averageStack, rebuyCount } =
    data;

  const statsBlock = (
    <>
      <SideStat label="Игроки">
        <>
          <Formatter.number value={playersActive} type="withoutDecimals" />
          {" / "}
          <Formatter.number value={playersArrived} type="withoutDecimals" />
        </>
      </SideStat>
      <SideStat label="Ребаи">
        <Formatter.number value={rebuyCount} type="withoutDecimals" />
      </SideStat>
      <SideStat label="Фишки в игре">
        <Formatter.number value={totalChips} type="withoutDecimals" />
      </SideStat>
      <SideStat label="Средний стек">
        {averageStack == null ? (
          "—"
        ) : (
          <Formatter.number value={averageStack} type="withoutDecimals" />
        )}
      </SideStat>
      <SideStat label="До перерыва">—</SideStat>
    </>
  );

  return (
    <SingleColumnWindow tournament={tournament}>
      {clockCenter}
      <Box width="100%" style={{ marginTop: 8 }}>
        {statsBlock}
      </Box>
    </SingleColumnWindow>
  );
};
