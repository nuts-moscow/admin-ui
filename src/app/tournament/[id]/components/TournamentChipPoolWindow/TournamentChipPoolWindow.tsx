"use client";

import { FC, ReactNode, useCallback } from "react";
import Image from "next/image";
import { Formatter } from "@/components/Formatter/Formatter";
import { Typography } from "@/components/Typography/Typography";
import { Button } from "@/components/Button/Button";
import { toast } from "@/components/Toast/Toast";
import { Link2 } from "lucide-react";
import { useTournamentChipPoolSummary } from "@/core/states/tournaments/hooks/useTournamentChipPoolSummary";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { TournamentClockPanel } from "../TournamentState/TournamentClockPanel";
import { useTournamentClock } from "@/core/states/tournaments/hooks/useTournamentClock";
import { formatClockDuration } from "@/core/states/tournaments/common/TournamentClockTick";
import {
  ChipPoolWindowLayout,
  chipPoolCenterColumnCls,
  chipPoolHeaderGridCls,
  chipPoolHeaderLogoImgCls,
  chipPoolHeaderLogoWrapCls,
  chipPoolHeaderSideCls,
  chipPoolLeftColumnCls,
  chipPoolMainGridCls,
  chipPoolRightSpacerCls,
  chipPoolShellCls,
  chipPoolStatLabelCls,
  chipPoolStatStackCls,
  chipPoolStatValueCls,
  chipPoolSubHeaderCls,
  chipPoolTitleNameCls,
  chipPoolTitleRowCls,
} from "./TournamentChipPoolWindow.css";
import { CHIP_POOL_INK_MUTED } from "./chipPoolTokens";

export interface TournamentChipPoolWindowProps {
  readonly tournament: TournamentInfoResponse;
  /** Ссылка на страницу только для эфира (/tournament/…/display). На самой этой странице — false. */
  readonly showTvBroadcastLink?: boolean;
}

function buildRulesSubtitle(tournament: TournamentInfoResponse): string {
  const s = tournament.structure;
  if (!s) {
    return "Параметры турнира уточняются";
  }
  const parts: string[] = [];
  if (s.entryPrice != null) {
    parts.push(`Бай-ин ${s.entryPrice}`);
  }
  if (s.freezeOutEnabled) {
    parts.push("Re-entry: выкл. (freeze-out)");
  } else if (s.maxReentries == null) {
    parts.push("Re-entry: по правилам турнира");
  }
  return parts.join("  |  ");
}

function LeftStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className={chipPoolStatLabelCls}>{label}</div>
      <div className={chipPoolStatValueCls}>{children}</div>
    </div>
  );
}

export const TournamentChipPoolWindow: FC<TournamentChipPoolWindowProps> = ({
  tournament,
  showTvBroadcastLink = true,
}) => {
  const chipPoolLayout: ChipPoolWindowLayout = showTvBroadcastLink
    ? "admin"
    : "broadcast";
  const tid = String(tournament.id);
  const { data, loading, error } = useTournamentChipPoolSummary(tid);
  const inProgress = tournament.status === "InProgress";
  const clockBinding = useTournamentClock(tournament.id, {
    enabled: inProgress,
  });

  const rulesLine = buildRulesSubtitle(tournament);

  const clockCenter = inProgress ? (
    <TournamentClockPanel
      tournamentId={tournament.id}
      blindsStructure={tournament.structure?.blindsStructure}
      enabled={false}
      clockBinding={clockBinding}
      layout="broadcast"
    />
  ) : (
    <Typography.Text
      type="secondary"
      size="small"
      style={{ textAlign: "center", color: CHIP_POOL_INK_MUTED }}
    >
      Часы доступны, когда турнир идёт.
    </Typography.Text>
  );

  const breakText =
    clockBinding.tick?.secondsUntilNextBreak != null
      ? formatClockDuration(clockBinding.tick.secondsUntilNextBreak)
      : "—";

  const displayPath = `/tournament/${tournament.id}/display`;

  const copyDisplayUrl = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${displayPath}`
        : displayPath;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        type: "success",
        message: "Ссылка для ТВ скопирована",
      });
    } catch {
      toast({
        type: "error",
        message: "Не удалось скопировать — скопируйте из адресной строки",
      });
    }
  }, [displayPath]);

  const header = (
    <header className={chipPoolHeaderGridCls}>
      <div className={chipPoolHeaderLogoWrapCls}>
        <Image
          src="/nuts-family-logo.png"
          alt="NUTS FAMILY"
          width={200}
          height={240}
          className={chipPoolHeaderLogoImgCls}
          priority
          sizes="(max-width: 768px) 112px, 156px"
        />
      </div>
      <h1 className={chipPoolTitleRowCls}>
        <span className={chipPoolTitleNameCls}>{tournament.name}</span>
      </h1>
      <div className={chipPoolHeaderSideCls} aria-hidden />
    </header>
  );

  const subHeader = (
    <div
      className={chipPoolSubHeaderCls({ layout: chipPoolLayout })}
      role="doc-subtitle"
    >
      {rulesLine}
    </div>
  );

  const leftStats =
    data != null ? (
      <div className={chipPoolLeftColumnCls({ layout: chipPoolLayout })}>
        <div className={chipPoolStatStackCls}>
          <LeftStat label="Игроки">
            <>
              <Formatter.number value={data.playersActive} type="withoutDecimals" />
              {" / "}
              <Formatter.number value={data.playersArrived} type="withoutDecimals" />
            </>
          </LeftStat>
          <LeftStat label="Re-entry">
            <Formatter.number value={data.rebuyCount} type="withoutDecimals" />
          </LeftStat>
          <LeftStat label="Фишки в игре">
            <Formatter.number value={data.totalChips} type="withoutDecimals" />
          </LeftStat>
          <LeftStat label="Средний стек">
            {data.averageStack == null ? (
              "—"
            ) : (
              <Formatter.number value={data.averageStack} type="withoutDecimals" />
            )}
          </LeftStat>
          <LeftStat label="До перерыва">{breakText}</LeftStat>
        </div>
      </div>
    ) : (
      <div className={chipPoolLeftColumnCls({ layout: chipPoolLayout })} aria-hidden />
    );

  const mainGridContent = () => {
    if (loading && !data) {
      return (
        <>
          {leftStats}
          <div className={chipPoolCenterColumnCls({ layout: chipPoolLayout })}>
            {clockCenter}
            <Typography.Text
              size="small"
              style={{ color: CHIP_POOL_INK_MUTED, marginTop: 16 }}
            >
              Загрузка…
            </Typography.Text>
          </div>
          <div className={chipPoolRightSpacerCls} aria-hidden />
        </>
      );
    }

    if (error) {
      return (
        <>
          {leftStats}
          <div className={chipPoolCenterColumnCls({ layout: chipPoolLayout })}>
            {clockCenter}
            <Typography.Text
              type="error"
              size="small"
              style={{ marginTop: 16, textAlign: "center" }}
            >
              {error.message}
            </Typography.Text>
          </div>
          <div className={chipPoolRightSpacerCls} aria-hidden />
        </>
      );
    }

    if (!data) {
      return (
        <>
          <div
            className={chipPoolLeftColumnCls({ layout: chipPoolLayout })}
            aria-hidden
          />
          <div className={chipPoolCenterColumnCls({ layout: chipPoolLayout })}>
            {clockCenter}
            <Typography.Text
              size="small"
              style={{
                display: "block",
                marginTop: 16,
                textAlign: "center",
                color: CHIP_POOL_INK_MUTED,
              }}
            >
              Сводка по фишкам недоступна (турнир не найден или нет кэша структуры
              для live).
            </Typography.Text>
          </div>
          <div className={chipPoolRightSpacerCls} aria-hidden />
        </>
      );
    }

    return (
      <>
        {leftStats}
        <div className={chipPoolCenterColumnCls({ layout: chipPoolLayout })}>
          {clockCenter}
        </div>
        <div className={chipPoolRightSpacerCls} aria-hidden />
      </>
    );
  };

  return (
    <div className={chipPoolShellCls({ layout: chipPoolLayout })}>
      {header}
      {subHeader}
      <div className={chipPoolMainGridCls({ layout: chipPoolLayout })}>
        {mainGridContent()}
      </div>
      {showTvBroadcastLink ? (
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid rgba(120, 100, 85, 0.12)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <Typography.Text size="small" type="secondary" style={{ textAlign: "center" }}>
            Эфир на ТВ / проектор: отдельная страница без вкладок админки — откройте в отдельном окне
            или в режиме киоска браузера.
          </Typography.Text>
          <Button
            type="secondary"
            size="small"
            iconLeft={<Link2 size={16} />}
            htmlType="button"
            onClick={copyDisplayUrl}
          >
            Скопировать ссылку
          </Button>
          <Button
            type="accent"
            size="small"
            htmlType="button"
            onClick={() => {
              const url =
                typeof window !== "undefined"
                  ? `${window.location.origin}${displayPath}`
                  : displayPath;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            Открыть в новой вкладке
          </Button>
        </div>
      ) : null}
    </div>
  );
};
