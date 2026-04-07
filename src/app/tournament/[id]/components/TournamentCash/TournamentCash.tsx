"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Formatter } from "@/components/Formatter/Formatter";
import { Typography } from "@/components/Typography/Typography";
import { useTournamentCashRegister } from "@/core/states/tournaments/hooks/useTournamentCashRegister";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { PaymentMethodSummary } from "@/core/states/tournaments/requests/getTournamentCashRegister";

export interface TournamentCashProps {
  readonly tournament: TournamentInfoResponse;
}

const GRID_TEMPLATE = "1fr 72px 96px";

const renderMoney = (value?: number) => {
  if (typeof value !== "number") {
    return "-";
  }
  return (
    <>
      <Formatter.number value={value} type="withoutDecimals" /> {"\u20BD"}
    </>
  );
};

interface CashCardProps {
  readonly title: string;
  readonly summary?: PaymentMethodSummary;
}

const CashCard: FC<CashCardProps> = ({ title, summary }) => {
  const rows = [
    {
      title: "Всего",
      count:
        typeof summary?.entryCount === "number" &&
        typeof summary?.reentryCount === "number"
          ? summary.entryCount + summary.reentryCount
          : undefined,
      sum: summary?.sum,
    },
    {
      title: "Входы",
      count: summary?.entryCount,
      sum: summary?.entrySum,
    },
    {
      title: "Ребаи",
      count: summary?.reentryCount,
      sum: summary?.reentrySum,
    },
  ];

  return (
    <Box
      flex={{ col: true, gap: 3 }}
      style={{
        backgroundColor: "var(--background-primary)",
        borderRadius: 16,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
        padding: "14px 16px",
        minWidth: 220,
        flex: 1,
      }}
    >
      <Typography.Text bold style={{ textAlign: "center" }}>
        {title}
      </Typography.Text>
      <Box style={{ borderTop: "1px solid rgba(0, 0, 0, 0.12)" }} />
      <Box
        style={{
          width: "100%",
          opacity: 0.6,
          padding: "0 2px",
          display: "grid",
          gridTemplateColumns: GRID_TEMPLATE,
          alignItems: "center",
          columnGap: 8,
        }}
      >
        <Typography.Text size="small"> </Typography.Text>
        <Typography.Text size="small" style={{ textAlign: "right" }}>
          Кол-во
        </Typography.Text>
        <Typography.Text size="small" style={{ textAlign: "right" }}>
          Сумма
        </Typography.Text>
      </Box>
      {rows.map((row) => (
        <Box
          key={row.title}
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: GRID_TEMPLATE,
            alignItems: "center",
            columnGap: 8,
          }}
        >
          <Typography.Text bold={row.title === "Всего"}>{row.title}</Typography.Text>
          <Typography.Text
            bold={row.title === "Всего"}
            style={{ textAlign: "right" }}
          >
            {typeof row.count === "number" ? (
              <Formatter.number value={row.count} type="withoutDecimals" />
            ) : (
              "-"
            )}
          </Typography.Text>
          <Typography.Text
            bold={row.title === "Всего"}
            style={{ textAlign: "right" }}
          >
            {renderMoney(row.sum)}
          </Typography.Text>
        </Box>
      ))}
    </Box>
  );
};

export const TournamentCash: FC<TournamentCashProps> = ({ tournament }) => {
  const { data } = useTournamentCashRegister(String(tournament.id));

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
      <Box flex={{ width: "100%", gap: 4 }} style={{ flexWrap: "wrap" }}>
        <CashCard title="Наличными" summary={data?.cash} />
        <CashCard title="По карте" summary={data?.card} />
        <CashCard title="Бесплатно" summary={data?.free} />
        <CashCard title="Итого" summary={data?.total} />
      </Box>
    </Box>
  );
};
