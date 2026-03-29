"use client";

import { FC, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
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
import { patchTournamentClock } from "@/core/states/tournaments/requests/patchTournamentClock";

function isBlind(item: BlindType): item is Blind {
  return item != null && "smallBlind" in item;
}

function isBreak(item: BlindType): item is Break {
  return item != null && !("smallBlind" in item);
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
    const ante = blItem.ante ? " · анте" : "";
    return `Уровень ${blItem.level}: ${blItem.smallBlind}/${blItem.bigBlind}${ante}`;
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
  const environment = useEnvironment();
  const { tick, connectionStatus } = useTournamentClock(tournamentId, {
    enabled,
  });

  const [pauseLoading, setPauseLoading] = useState(false);

  const label = useMemo(
    () => (tick ? levelLabel(blindsStructure, tick) : ""),
    [blindsStructure, tick]
  );

  const completedByTick = tick?.tournamentStatus === "completed";

  const handlePauseToggle = async () => {
    if (!tick || pauseLoading) return;
    setPauseLoading(true);
    try {
      await patchTournamentClock(environment, tournamentId, {
        paused: !tick.paused,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPauseLoading(false);
    }
  };

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

          <Button
            type="secondary"
            size="small"
            loading={pauseLoading}
            onClick={handlePauseToggle}
          >
            {tick.paused ? "Снять паузу" : "Пауза"}
          </Button>
        </>
      )}
    </Box>
  );
};
