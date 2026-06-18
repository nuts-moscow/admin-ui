"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { toast } from "@/components/Toast/Toast";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import {
  useTournamentClock,
} from "@/core/states/tournaments/hooks/useTournamentClock";
import {
  refetchTournament,
} from "@/core/states/tournaments/hooks/useTournament";
import {
  refetchTournamentPlayerState,
  useTournamentPlayerState,
} from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { patchTournamentClock } from "@/core/states/tournaments/requests/patchTournamentClock";
import {
  completeTournament,
  launchTournament,
} from "@/core/states/tournaments/requests/updateTournament";
import { formatClockSeconds } from "@/core/states/tournaments/common/TournamentClockTick";
import { formatApiErrorForUser } from "@/core/utils/misc/formatApiErrorForUser";
import { mobileCardCls } from "../../mobile.css";

const IN_GAME = ["InGamePaid", "InGameNotPaid"];

export const MobileStateSection: FC<{
  tournament: TournamentInfoResponse;
}> = ({ tournament }) => {
  const environment = useEnvironment();
  const { tick } = useTournamentClock(tournament.id);
  const { data: players = [] } = useTournamentPlayerState(String(tournament.id));
  const [busy, setBusy] = useState<string | null>(null);

  const inGameCount = players.filter((p) => IN_GAME.includes(p.status)).length;
  const completedOrFinished =
    tick?.tournamentStatus === "completed" || tick?.structureFinished === true;
  const pauseDisabled =
    !tick || completedOrFinished || !tick.clockActive || busy !== null;

  const run = async (key: string, fn: () => Promise<unknown>) => {
    if (busy) {
      return;
    }
    setBusy(key);
    try {
      await fn();
      refetchTournament();
      refetchTournamentPlayerState();
    } catch (error) {
      toast({ type: "error", message: formatApiErrorForUser(error) });
    } finally {
      setBusy(null);
    }
  };

  const buildPayload = () => {
    const structure = tournament.structure;
    if (!structure) {
      return null;
    }
    return {
      id: tournament.id,
      name: tournament.name,
      date: tournament.date,
      structure,
      status: tournament.status,
    };
  };

  return (
    <>
      <div className={mobileCardCls}>
        <Typography.Text type="secondary" size="small">
          Часы
        </Typography.Text>
        <Typography.Text bold style={{ fontSize: 40, lineHeight: 1.1 }}>
          {tick?.secondsRemaining != null
            ? formatClockSeconds(tick.secondsRemaining)
            : "—"}
        </Typography.Text>
        <Typography.Text type="secondary" size="small">
          {tick == null
            ? "Подключение…"
            : completedOrFinished
              ? "Турнир завершён"
              : [
                  tick.currentStepIndex !== null
                    ? `Шаг ${tick.currentStepIndex + 1}`
                    : null,
                  tick.stepType === "Break"
                    ? "Перерыв"
                    : tick.stepType === "Blind"
                      ? "Блайнды"
                      : null,
                  tick.paused ? "на паузе" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
        </Typography.Text>
      </div>

      {tournament.status === "InProgress" ? (
        <Button
          type={tick?.paused ? "success" : "secondary"}
          size="medium"
          width="100%"
          loading={busy === "pause"}
          disabled={pauseDisabled}
          onClick={() =>
            run("pause", () =>
              patchTournamentClock(environment, tournament.id, {
                paused: !tick?.paused,
              }),
            )
          }
        >
          {tick?.paused ? "Снять паузу" : "Пауза"}
        </Button>
      ) : null}

      {tournament.status === "RegistrationOpen" ? (
        <Button
          type="success"
          size="medium"
          width="100%"
          loading={busy === "launch"}
          disabled={busy !== null || !tournament.structure}
          onClick={() => {
            const payload = buildPayload();
            if (!payload) {
              return;
            }
            if (
              typeof window !== "undefined" &&
              !window.confirm(`Запустить турнир «${tournament.name}»?`)
            ) {
              return;
            }
            void run("launch", () => launchTournament(environment, payload));
          }}
        >
          Запустить турнир
        </Button>
      ) : null}

      {tournament.status === "InProgress" ? (
        <Box flex={{ col: true, gap: 1 }}>
          <Button
            type="error"
            size="medium"
            width="100%"
            loading={busy === "complete"}
            disabled={busy !== null || inGameCount !== 1}
            onClick={() => {
              const payload = buildPayload();
              if (!payload) {
                return;
              }
              if (
                typeof window !== "undefined" &&
                !window.confirm("Завершить турнир?")
              ) {
                return;
              }
              void run("complete", () =>
                completeTournament(environment, payload),
              );
            }}
          >
            Завершить турнир
          </Button>
          {inGameCount !== 1 ? (
            <Typography.Text type="secondary" size="xSmall">
              Завершение доступно, когда в игре остался один игрок (сейчас{" "}
              {inGameCount}).
            </Typography.Text>
          ) : null}
        </Box>
      ) : null}
    </>
  );
};
