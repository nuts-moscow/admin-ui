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
import { useTournamentClock } from "@/core/states/tournaments/hooks/useTournamentClock";

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

/**
 * Первый блайнд после текущего шага; перерывы пропускаются (в т.ч. подряд).
 */
function findNextBlindInStructure(
  blinds: Blinds | undefined,
  currentStepIndex: number
): Blind | null {
  if (!blinds?.length) return null;
  let i = currentStepIndex + 1;
  while (i < blinds.length) {
    const item = blinds[i];
    if (isBlind(item)) return item;
    i += 1;
  }
  return null;
}

function levelLabel(
  blinds: Blinds | undefined,
  tick: TournamentClockTick
): string {
  if (!blinds?.length) {
    return `#${tick.currentStepIndex + 1} (id ${tick.levelId})`;
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
  return `Блайнд (id ${tick.levelId})`;
}

export interface TournamentClockPanelProps {
  readonly tournamentId: number;
  readonly blindsStructure: Blinds | undefined;
  /** Пока false — WebSocket не открывается (турнир не в игре). */
  readonly enabled?: boolean;
}

export const TournamentClockPanel: FC<TournamentClockPanelProps> = ({
  tournamentId,
  blindsStructure,
  enabled = true,
}) => {
  const { tick, connectionStatus } = useTournamentClock(tournamentId, {
    enabled,
  });

  const label = useMemo(
    () => (tick ? levelLabel(blindsStructure, tick) : ""),
    [blindsStructure, tick]
  );

  const nextBlindLabel = useMemo(() => {
    if (!tick || !blindsStructure?.length) return null;
    const next = findNextBlindInStructure(blindsStructure, tick.currentStepIndex);
    if (!next) return null;
    return formatBlindStake(next);
  }, [blindsStructure, tick]);

  const completedByTick = tick?.tournamentStatus === "completed";

  const muted = { color: "#6b7280" };
  const ink = { color: "#111827" };

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

      {completedByTick && (
        <Typography.Text size="medium" style={ink}>
          Турнир завершён — активный отсчёт недоступен.
        </Typography.Text>
      )}

      {tick && !completedByTick && (
        <>
          <Typography.Text
            size="large"
            style={{ fontVariantNumeric: "tabular-nums", ...ink }}
          >
            {formatClockSeconds(tick.secondsRemaining)}
          </Typography.Text>
          <Typography.Text size="small" style={ink}>
            {label}
          </Typography.Text>
          <Typography.Text type="secondary" size="small" style={muted}>
            Шаг {tick.currentStepIndex + 1}
            {tick.stepType === "Break" ? " · перерыв" : " · блайнд"}
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
