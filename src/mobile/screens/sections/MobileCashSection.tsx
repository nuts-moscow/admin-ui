"use client";

import { FC } from "react";
import { Typography } from "@/components/Typography/Typography";
import { Formatter } from "@/components/Formatter/Formatter";
import { useTournamentCashRegister } from "@/core/states/tournaments/hooks/useTournamentCashRegister";
import { PaymentMethodSummary } from "@/core/states/tournaments/requests/getTournamentCashRegister";
import { mobileCardCls } from "../../mobile.css";

const num = (v?: number) =>
  typeof v === "number" ? (
    <Formatter.number value={v} type="withoutDecimals" />
  ) : (
    "—"
  );

const money = (v?: number) =>
  typeof v === "number" ? (
    <>
      <Formatter.number value={v} type="withoutDecimals" /> {"₽"}
    </>
  ) : (
    "—"
  );

const ROW_GRID = "1fr auto auto";

const CashCard: FC<{ title: string; s?: PaymentMethodSummary }> = ({
  title,
  s,
}) => {
  const total =
    typeof s?.entryCount === "number" && typeof s?.reentryCount === "number"
      ? s.entryCount + s.reentryCount
      : undefined;
  const rows = [
    { title: "Всего", count: total, sum: s?.sum, bold: true },
    { title: "Входы", count: s?.entryCount, sum: s?.entrySum },
    { title: "Ребаи", count: s?.reentryCount, sum: s?.reentrySum },
  ];
  return (
    <div className={mobileCardCls}>
      <Typography.Text bold>{title}</Typography.Text>
      {rows.map((r) => (
        <div
          key={r.title}
          style={{
            display: "grid",
            gridTemplateColumns: ROW_GRID,
            columnGap: 12,
            alignItems: "center",
          }}
        >
          <Typography.Text size="small" type="secondary">
            {r.title}
          </Typography.Text>
          <Typography.Text size="small" bold={r.bold}>
            {num(r.count)}
          </Typography.Text>
          <Typography.Text size="small" bold={r.bold}>
            {money(r.sum)}
          </Typography.Text>
        </div>
      ))}
    </div>
  );
};

export const MobileCashSection: FC<{ tournamentId: string }> = ({
  tournamentId,
}) => {
  const { data } = useTournamentCashRegister(tournamentId);
  return (
    <>
      <CashCard title="Наличными" s={data?.cash} />
      <CashCard title="По карте" s={data?.card} />
      <CashCard title="Бесплатно" s={data?.free} />
      <CashCard title="Итого" s={data?.total} />
    </>
  );
};
