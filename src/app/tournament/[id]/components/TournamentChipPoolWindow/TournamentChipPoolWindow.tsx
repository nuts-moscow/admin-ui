"use client";

import { CSSProperties, FC, ReactNode, useCallback, useEffect } from "react";
import Image from "next/image";
import { Formatter } from "@/components/Formatter/Formatter";
import { Typography } from "@/components/Typography/Typography";
import { Button } from "@/components/Button/Button";
import { toast } from "@/components/Toast/Toast";
import { Link2 } from "lucide-react";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";
import { useTournamentChipPoolSummary } from "@/core/states/tournaments/hooks/useTournamentChipPoolSummary";
import { TournamentChipPoolSummary } from "@/core/states/tournaments/requests/getTournamentChipPoolSummary";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { TournamentClockPanel } from "../TournamentState/TournamentClockPanel";
import { useTournamentClock, UseTournamentClockOptions } from "@/core/states/tournaments/hooks/useTournamentClock";
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
import { PublicRatingPointsColumn } from "./PublicRatingPointsColumn";
import { useRatingTables } from "@/core/states/tournaments/hooks/useRatingTables";
import {
  getRatingTableDisplayName,
  getRatingTableDisplayNameForBroadcast,
} from "@/core/states/tournaments/common/ratingTableDisplayName";

export interface TournamentChipPoolWindowProps {
  readonly tournament: TournamentInfoResponse;
  /** Ссылка на страницу только для эфира (/tournament/…/display). На самой этой странице — false. */
  readonly showTvBroadcastLink?: boolean;
  /** Для страницы display: flex-цепочка на весь вьюпорт. */
  readonly style?: CSSProperties;
  /** Переопределить хук chip pool summary (напр. публичный эндпоинт). */
  readonly chipPoolSummaryHook?: (tournamentId: string) => { data: TournamentChipPoolSummary | null; loading: boolean; error?: Error };
  /** Опции для useTournamentClock (напр. публичные функции запроса). */
  readonly clockOptions?: Pick<UseTournamentClockOptions, 'getClockFn' | 'wsUrlFn'>;
  /**
   * Колонка рейтинговых баллов справа (публичный GET). Не показывается, если в структуре
   * включён «Финал игры (freeze-out)» — в т.ч. формат «финал месяца».
   * Также скрыта, пока лейт-рега не закрыта (`lateRegistrationClosed !== true`).
   */
  readonly enablePublicRatingPointsPreview?: boolean;
}

type TournamentChipPoolWindowInnerProps = TournamentChipPoolWindowProps & {
  readonly ratingTableName: string | undefined;
};

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

function LeftStat({
  label,
  children,
  layout,
}: {
  label: string;
  children: ReactNode;
  layout: ChipPoolWindowLayout;
}) {
  return (
    <div>
      <div className={chipPoolStatLabelCls({ layout })}>{label}</div>
      <div className={chipPoolStatValueCls({ layout })}>{children}</div>
    </div>
  );
}

const TournamentChipPoolWindowInner: FC<TournamentChipPoolWindowInnerProps> = ({
  tournament,
  showTvBroadcastLink = true,
  style: rootStyle,
  chipPoolSummaryHook,
  clockOptions,
  enablePublicRatingPointsPreview = false,
  ratingTableName,
}) => {
  const chipPoolLayout: ChipPoolWindowLayout = showTvBroadcastLink
    ? "admin"
    : "broadcast";
  const tid = String(tournament.id);
  const useSummaryHook = chipPoolSummaryHook ?? useTournamentChipPoolSummary;
  const { data, loading, error } = useSummaryHook(tid);

  /**
   * Фоновое обновление данных турнира без F5:
   * - пока регистрация открыта — раз в секунду (эфир подхватывает старт);
   * - на странице эфира (/display), игра идёт и колонка рейтинга зависит от лейт-реги —
   *   постоянный лёгкий опрос: отдельная вкладка/ТВ не видит PATCH из админки; нужно и закрытие,
   *   и повторное открытие лейт-реги (баллы снова скрыть).
   */
  useEffect(() => {
    if (tournament.status === "RegistrationOpen") {
      const handle = window.setInterval(() => {
        refetchTournament();
      }, 1000);
      return () => window.clearInterval(handle);
    }
    const pollInProgressBroadcastRating =
      showTvBroadcastLink === false &&
      tournament.status === "InProgress" &&
      enablePublicRatingPointsPreview &&
      tournament.structure?.freezeOutEnabled !== true;
    if (!pollInProgressBroadcastRating) {
      return;
    }
    const handle = window.setInterval(() => {
      refetchTournament();
    }, 3000);
    return () => window.clearInterval(handle);
  }, [
    tournament.status,
    tournament.structure?.freezeOutEnabled,
    showTvBroadcastLink,
    enablePublicRatingPointsPreview,
  ]);

  const inProgress = tournament.status === "InProgress";
  const clockBinding = useTournamentClock(tournament.id, {
    enabled: inProgress,
    ...clockOptions,
  });

  const rulesLine = buildRulesSubtitle(tournament);

  /** Рейтинговая зона: freeze-out или пока лейт-рега открыта. */
  const showPublicRatingColumn =
    enablePublicRatingPointsPreview &&
    tournament.structure?.freezeOutEnabled !== true &&
    tournament.lateRegistrationClosed === true;

  const rightColumnOrSpacer = showPublicRatingColumn ? (
    <PublicRatingPointsColumn
      tournamentId={tid}
      layout={chipPoolLayout}
      ratingTableName={ratingTableName}
    />
  ) : (
    <div className={chipPoolRightSpacerCls} aria-hidden />
  );

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
      <div className={chipPoolHeaderLogoWrapCls({ layout: chipPoolLayout })}>
        <Image
          src="/nuts-family-logo.png"
          alt="NUTS FAMILY"
          width={200}
          height={240}
          className={chipPoolHeaderLogoImgCls({ layout: chipPoolLayout })}
          priority
          sizes="(max-width: 768px) 112px, 156px"
        />
      </div>
      <h1 className={chipPoolTitleRowCls}>
        <span className={chipPoolTitleNameCls({ layout: chipPoolLayout })}>
          {tournament.name}
        </span>
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
        <div className={chipPoolStatStackCls({ layout: chipPoolLayout })}>
          <LeftStat label="Игроки" layout={chipPoolLayout}>
            <>
              <Formatter.number value={data.playersActive} type="withoutDecimals" />
              {" / "}
              <Formatter.number value={data.playersArrived} type="withoutDecimals" />
            </>
          </LeftStat>
          <LeftStat label="Re-entry" layout={chipPoolLayout}>
            <Formatter.number value={data.rebuyCount} type="withoutDecimals" />
          </LeftStat>
          <LeftStat label="Фишки в игре" layout={chipPoolLayout}>
            <Formatter.number value={data.totalChips} type="withoutDecimals" />
          </LeftStat>
          <LeftStat label="Средний стек" layout={chipPoolLayout}>
            {data.averageStack == null ? (
              "—"
            ) : (
              <Formatter.number value={data.averageStack} type="withoutDecimals" />
            )}
          </LeftStat>
          <LeftStat label="До перерыва" layout={chipPoolLayout}>
            {breakText}
          </LeftStat>
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
          {rightColumnOrSpacer}
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
          {rightColumnOrSpacer}
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
          {rightColumnOrSpacer}
        </>
      );
    }

    return (
      <>
        {leftStats}
        <div className={chipPoolCenterColumnCls({ layout: chipPoolLayout })}>
          {clockCenter}
        </div>
        {rightColumnOrSpacer}
      </>
    );
  };

  return (
    <div
      className={chipPoolShellCls({ layout: chipPoolLayout })}
      style={rootStyle}
    >
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

const TournamentChipPoolWindowAdmin: FC<TournamentChipPoolWindowProps> = (
  props,
) => {
  const { data: ratingTables = [] } = useRatingTables();
  const ratingTableRow =
    props.tournament.ratingTableId != null
      ? ratingTables.find((t) => t.id === props.tournament.ratingTableId)
      : undefined;
  const ratingTableName =
    ratingTableRow != null
      ? getRatingTableDisplayName(ratingTableRow)
      : undefined;
  return (
    <TournamentChipPoolWindowInner
      {...props}
      ratingTableName={ratingTableName}
    />
  );
};

const TournamentChipPoolWindowBroadcast: FC<TournamentChipPoolWindowProps> = (
  props,
) => {
  const ratingTableName = getRatingTableDisplayNameForBroadcast(
    props.tournament,
  );
  return (
    <TournamentChipPoolWindowInner
      {...props}
      ratingTableName={ratingTableName}
    />
  );
};

/** Турнирное окно: при `showTvBroadcastLink={false}` не запрашивает справочник таблиц рейтинга (без JWT). */
export const TournamentChipPoolWindow: FC<TournamentChipPoolWindowProps> = (
  props,
) => {
  if (props.showTvBroadcastLink === false) {
    return <TournamentChipPoolWindowBroadcast {...props} />;
  }
  return <TournamentChipPoolWindowAdmin {...props} />;
};
