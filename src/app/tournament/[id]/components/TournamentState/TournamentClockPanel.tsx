"use client";

import { FC, useMemo } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import {
  Blind,
  BlindType,
  Break,
  Blinds,
} from "@/core/states/tournamentStructures/common/BlindType";
import {
  formatClockSeconds,
  type TournamentClockTick,
} from "@/core/states/tournaments/common/TournamentClockTick";
import {
  useTournamentClock,
  type TournamentClockBinding,
  type TournamentClockConnectionStatus,
} from "@/core/states/tournaments/hooks/useTournamentClock";
import {
  CHIP_POOL_INK,
  CHIP_POOL_INK_SOFT,
} from "../TournamentChipPoolWindow/chipPoolTokens";

function isBlind(item: BlindType): item is Blind {
  return item != null && "smallBlind" in item;
}

function isBreak(item: BlindType): item is Break {
  return item != null && !("smallBlind" in item);
}

function formatBlindStake(bl: Blind): string {
  const antePart = bl.ante ? " · с анте" : " · без анте";
  return `Уровень ${bl.level}: ${bl.smallBlind}/${bl.bigBlind}${antePart}`;
}

function formatSbBb(sb: number, bb: number): string {
  return `${sb} / ${bb}`;
}

function findNextBlindInStructure(
  blinds: Blinds | undefined,
  currentStepIndex: number | null
): Blind | null {
  if (!blinds?.length || currentStepIndex === null) return null;
  let i = currentStepIndex + 1;
  while (i < blinds.length) {
    const item = blinds[i];
    if (isBlind(item)) return item;
    i += 1;
  }
  return null;
}

function stepAtIndex(
  blinds: Blinds | undefined,
  tick: TournamentClockTick
): BlindType | null {
  if (!blinds?.length) return null;
  if (tick.currentStepIndex !== null) {
    const byIndex = blinds[tick.currentStepIndex];
    if (byIndex !== undefined && byIndex !== null) return byIndex;
  }
  if (tick.levelId == null) return null;
  const matchId = blinds.find((b) => {
    if (tick.stepType === "Break" && isBreak(b)) return b.id === tick.levelId;
    if (tick.stepType === "Blind" && isBlind(b)) return b.id === tick.levelId;
    return b.id === tick.levelId;
  });
  return matchId ?? null;
}

function levelLabel(
  blinds: Blinds | undefined,
  tick: TournamentClockTick
): string {
  if (!blinds?.length) {
    const idx = tick.currentStepIndex;
    const lid = tick.levelId;
    if (idx !== null && lid != null) {
      return `#${idx + 1} (id ${lid})`;
    }
    return "Нет данных шага";
  }
  if (tick.stepType === "Break") {
    const br = blinds.find((b) => isBreak(b) && b.id === tick.levelId);
    if (br) {
      return `Перерыв · ${br.duration} мин`;
    }
    return "Перерыв";
  }
  const blItem = blinds.find((b) => isBlind(b) && b.id === tick.levelId);
  if (blItem && isBlind(blItem)) {
    return formatBlindStake(blItem);
  }
  return tick.levelId != null ? `Блайнд (id ${tick.levelId})` : "Уровень";
}

export type TournamentClockPanelLayout = "compact" | "broadcast";

export interface TournamentClockPanelProps {
  readonly tournamentId: number;
  readonly blindsStructure: Blinds | undefined;
  /** Пока false — WebSocket не открывается (турнир не в игре). */
  readonly enabled?: boolean;
  /**
   * Если задан — использовать переданный тик/статус сокета (один хук на экран).
   */
  readonly clockBinding?: TournamentClockBinding;
  readonly layout?: TournamentClockPanelLayout;
  /** Светлый текст на тёмном фоне (турнирное окно / эфир). */
  readonly onDarkBackground?: boolean;
}

export const TournamentClockPanel: FC<TournamentClockPanelProps> = ({
  tournamentId,
  blindsStructure,
  enabled = true,
  clockBinding,
  layout = "compact",
  onDarkBackground = false,
}) => {
  const hookResult = useTournamentClock(tournamentId, {
    enabled: clockBinding ? false : enabled,
  });
  const tick = clockBinding?.tick ?? hookResult.tick;
  const connectionStatus: TournamentClockConnectionStatus =
    clockBinding?.connectionStatus ?? hookResult.connectionStatus;

  const label = useMemo(
    () => (tick ? levelLabel(blindsStructure, tick) : ""),
    [blindsStructure, tick]
  );

  const nextBlindLabel = useMemo(() => {
    if (!tick || !blindsStructure?.length) return null;
    const next = findNextBlindInStructure(
      blindsStructure,
      tick.currentStepIndex
    );
    if (!next) return null;
    return formatBlindStake(next);
  }, [blindsStructure, tick]);

  const nextSbBb = useMemo(() => {
    if (!tick || !blindsStructure?.length) return null;
    const next = findNextBlindInStructure(
      blindsStructure,
      tick.currentStepIndex
    );
    if (!next) return null;
    return formatSbBb(next.smallBlind, next.bigBlind);
  }, [blindsStructure, tick]);

  const currentStepItem = useMemo(
    () => (tick ? stepAtIndex(blindsStructure, tick) : null),
    [blindsStructure, tick]
  );

  const completedOrFinished =
    tick?.tournamentStatus === "completed" ||
    tick?.structureFinished === true;
  const clockInactive = tick != null && !tick.clockActive;

  const muted = { color: "#6b7280" };
  const ink = { color: "#111827" };
  const dark = {
    /** Светло-серый крем, не чистый белый. */
    ink: "rgba(235, 230, 223, 0.96)",
    muted: "rgba(198, 190, 180, 0.78)",
    /** Тёплое «стекло» под песочный тёмный фон турнирного окна. */
    timerBg: "rgba(26, 22, 18, 0.48)",
    timerBorder: "rgba(255, 255, 255, 0.1)",
  };

  const timerText =
    tick?.secondsRemaining != null
      ? formatClockSeconds(tick.secondsRemaining)
      : "—";

  if (layout === "broadcast") {
    const cInkStr = onDarkBackground ? dark.ink : CHIP_POOL_INK;
    const cMutedStr = onDarkBackground ? dark.muted : CHIP_POOL_INK_SOFT;
    const dimStyle = { color: cMutedStr };
    const primaryStyle = { color: cInkStr };

    return (
      <Box
        flex={{ col: true, align: "center", gap: 2 }}
        width="100%"
        style={{ textAlign: "center" }}
      >
        {connectionStatus === "connecting" && tick == null && (
          <Typography.Text type="secondary" size="small" style={dimStyle}>
            Подключение…
          </Typography.Text>
        )}

        {connectionStatus === "error" && tick == null && (
          <Typography.Text type="secondary" size="small" style={dimStyle}>
            Не удалось подключиться. Повтор…
          </Typography.Text>
        )}

        {connectionStatus === "closed" && tick == null && (
          <Typography.Text type="secondary" size="small" style={dimStyle}>
            Соединение закрыто, переподключение…
          </Typography.Text>
        )}

        {completedOrFinished && (
          <Typography.Text size="medium" style={primaryStyle}>
            Турнир завершён — активный отсчёт недоступен.
          </Typography.Text>
        )}

        {tick && clockInactive && !completedOrFinished && (
          <Typography.Text type="secondary" size="small" style={dimStyle}>
            Часы неактивны.
          </Typography.Text>
        )}

        {tick && !completedOrFinished && tick.clockActive && (
          <>
            {currentStepItem && isBlind(currentStepItem) ? (
              <>
                <Typography.Text
                  size="medium"
                  bold
                  style={{
                    ...primaryStyle,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "92%",
                  }}
                >
                  Уровень {currentStepItem.level}
                </Typography.Text>
                <Typography.Text
                  bold
                  style={{
                    ...primaryStyle,
                    fontFamily: "var(--primary-font-family)",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: "clamp(2.25rem, 7vw, 4rem)",
                    lineHeight: 1.05,
                  }}
                >
                  {formatSbBb(
                    currentStepItem.smallBlind,
                    currentStepItem.bigBlind,
                  )}
                </Typography.Text>
                <Typography.Text
                  size="large"
                  style={{
                    ...dimStyle,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    ...(currentStepItem.ante
                      ? { textTransform: "uppercase" }
                      : {}),
                  }}
                >
                  {currentStepItem.ante
                    ? `BB Ante ${currentStepItem.bigBlind}`
                    : "Без анте"}
                </Typography.Text>
              </>
            ) : currentStepItem && isBreak(currentStepItem) ? (
              <>
                <Typography.Text size="medium" style={primaryStyle}>
                  Перерыв
                </Typography.Text>
                <Typography.Text type="secondary" size="small" style={dimStyle}>
                  {currentStepItem.duration} мин
                </Typography.Text>
              </>
            ) : (
              <>
                <Typography.Text size="medium" style={primaryStyle}>
                  {tick.currentStepIndex !== null
                    ? `Шаг ${tick.currentStepIndex + 1}`
                    : "Шаг"}
                </Typography.Text>
                <Typography.Text type="secondary" size="small" style={dimStyle}>
                  {label}
                </Typography.Text>
              </>
            )}

            <Box
              flex={{ justify: "center", align: "center" }}
              width="100%"
              style={{
                marginTop: 12,
                marginBottom: 12,
                padding: "clamp(22px, 5.5vw, 52px) clamp(40px, 20vw, 280px)",
                minWidth: "min(100%, 760px)",
                border: onDarkBackground
                  ? `1px solid ${dark.timerBorder}`
                  : "1px solid rgba(74, 63, 53, 0.14)",
                borderRadius: onDarkBackground ? 4 : 6,
                backgroundColor: onDarkBackground
                  ? dark.timerBg
                  : "rgba(255, 250, 242, 0.62)",
                boxSizing: "border-box",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            >
              <Typography.Text
                bold
                style={{
                  ...primaryStyle,
                  fontFamily: "var(--primary-font-family)",
                  fontVariantNumeric: "tabular-nums",
                  fontSize: "clamp(2.75rem, 11vw, 6rem)",
                  lineHeight: 1,
                  letterSpacing: "0.04em",
                }}
              >
                {timerText}
              </Typography.Text>
            </Box>

            {nextSbBb ? (
              <Typography.Text
                size="large"
                style={{
                  ...dimStyle,
                  marginTop: 8,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Следующие блайнды: {nextSbBb}
              </Typography.Text>
            ) : (
              blindsStructure &&
              blindsStructure.length > 0 && (
                <Typography.Text type="secondary" size="small" style={dimStyle}>
                  Следующих блайндов в структуре нет
                </Typography.Text>
              )
            )}
          </>
        )}
      </Box>
    );
  }

  return (
    <Box
      flex={{ col: true, gap: 3, width: "100%" }}
      style={{
        padding: "16px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <Typography.Text size="small" type="secondary" style={muted}>
        Часы турнира
      </Typography.Text>

      {connectionStatus === "connecting" && tick == null && (
        <Typography.Text type="secondary" size="small" style={muted}>
          Подключение…
        </Typography.Text>
      )}

      {connectionStatus === "error" && tick == null && (
        <Typography.Text type="secondary" size="small" style={muted}>
          Не удалось подключиться. Повтор…
        </Typography.Text>
      )}

      {connectionStatus === "closed" && tick == null && (
        <Typography.Text type="secondary" size="small" style={muted}>
          Соединение закрыто, переподключение…
        </Typography.Text>
      )}

      {completedOrFinished && (
        <Typography.Text size="medium" style={ink}>
          Турнир завершён — активный отсчёт недоступен.
        </Typography.Text>
      )}

      {tick && clockInactive && !completedOrFinished && (
        <Typography.Text type="secondary" size="small" style={muted}>
          Часы неактивны.
        </Typography.Text>
      )}

      {tick && !completedOrFinished && tick.clockActive && (
        <>
          <Typography.Text
            size="large"
            style={{ fontVariantNumeric: "tabular-nums", ...ink }}
          >
            {timerText}
          </Typography.Text>
          <Typography.Text size="small" style={ink}>
            {label}
          </Typography.Text>
          <Typography.Text type="secondary" size="small" style={muted}>
            {tick.currentStepIndex !== null
              ? `Шаг ${tick.currentStepIndex + 1}`
              : "Шаг"}
            {tick.stepType === "Break"
              ? " · перерыв"
              : tick.stepType === "Blind"
                ? " · блайнд"
                : ""}
            {tick.paused ? " · на паузе" : ""}
          </Typography.Text>

          {nextBlindLabel ? (
            <Typography.Text type="secondary" size="small" style={muted}>
              Следующий блайнд: {nextBlindLabel}
            </Typography.Text>
          ) : (
            blindsStructure &&
            blindsStructure.length > 0 && (
              <Typography.Text type="secondary" size="small" style={muted}>
                Следующего блайнда в структуре нет
              </Typography.Text>
            )
          )}
        </>
      )}
    </Box>
  );
};
