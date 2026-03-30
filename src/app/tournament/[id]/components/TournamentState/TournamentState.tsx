"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Modal, WithModalProps, useModal } from "@/components/Modal/Modal";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  completeTournament,
  launchTournament,
} from "@/core/states/tournaments/requests/updateTournament";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";
import { useTournamentClock } from "@/core/states/tournaments/hooks/useTournamentClock";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { patchTournamentClock } from "@/core/states/tournaments/requests/patchTournamentClock";
import { TournamentInfoForm } from "./TournamentInfoForm";

const IN_GAME_STATUSES = ["InGamePaid", "InGameNotPaid"] as const;

const getInGameCount = (players: { status: string }[]): number =>
  players.filter((p) =>
    IN_GAME_STATUSES.includes(p.status as (typeof IN_GAME_STATUSES)[number]),
  ).length;

export interface TournamentStateProps {
  readonly tournament: TournamentInfoResponse;
}

interface LaunchTournamentConfirmModalProps extends WithModalProps {
  readonly tournament: TournamentInfoResponse;
}

interface CompleteTournamentConfirmModalProps extends WithModalProps {
  readonly tournament: TournamentInfoResponse;
}

const LaunchTournamentConfirmModal: FC<LaunchTournamentConfirmModalProps> = ({
  close,
  tournament,
}) => {
  const environment = useEnvironment();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchTournament = async () => {
    if (!tournament.structure || isLaunching) {
      return;
    }
    setIsLaunching(true);
    try {
      await launchTournament(environment, {
        id: tournament.id,
        name: tournament.name,
        date: tournament.date,
        structure: tournament.structure,
        status: tournament.status,
      });
      refetchTournament();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Подтверждение</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            Запустить турнир "{tournament.name}"?
          </Typography.Text>
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={isLaunching}
            >
              Отмена
            </Button>
            <Button
              type="success"
              htmlType="button"
              onClick={handleLaunchTournament}
              flexItem={{ flex: 1 }}
              loading={isLaunching}
              style={{
                backgroundColor: "var(--text-success)",
                color: "var(--text-tertiary)",
                border: "1px solid var(--text-success)",
              }}
            >
              Начать турнир
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

const CompleteTournamentConfirmModal: FC<CompleteTournamentConfirmModalProps> = ({
  close,
  tournament,
}) => {
  const environment = useEnvironment();
  const [isCompleting, setIsCompleting] = useState(false);
  const { data: players } = useTournamentPlayerState(String(tournament.id));
  const inGameCount = getInGameCount(players ?? []);
  const canComplete = inGameCount === 1;

  const handleCompleteTournament = async () => {
    if (!tournament.structure || isCompleting || !canComplete) {
      return;
    }
    setIsCompleting(true);
    try {
      await completeTournament(environment, {
        id: tournament.id,
        name: tournament.name,
        date: tournament.date,
        structure: tournament.structure,
        status: tournament.status,
      });
      refetchTournament();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Подтверждение</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            Завершить турнир "{tournament.name}"?
          </Typography.Text>
          {!canComplete && (
            <Typography.Text type="secondary" size="small">
              Нельзя завершить: в игре {inGameCount} игроков (должен остаться 1 — победитель).
            </Typography.Text>
          )}
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={isCompleting}
            >
              Отмена
            </Button>
            <Button
              type="error"
              htmlType="button"
              onClick={handleCompleteTournament}
              flexItem={{ flex: 1 }}
              loading={isCompleting}
              disabled={!canComplete}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "1px solid #dc2626",
              }}
            >
              Завершить турнир
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

export const TournamentState: FC<TournamentStateProps> = ({
  tournament,
}) => {
  const environment = useEnvironment();
  const [LaunchConfirmModal, openLaunchConfirmModal] = useModal(
    LaunchTournamentConfirmModal
  );
  const [CompleteConfirmModal, openCompleteConfirmModal] = useModal(
    CompleteTournamentConfirmModal
  );
  const { data: players } = useTournamentPlayerState(String(tournament.id));
  const inGameCount = getInGameCount(players ?? []);
  const canCompleteTournament = inGameCount === 1;
  const { tick: clockTick } = useTournamentClock(tournament.id, {
    enabled: tournament.status === "InProgress",
  });
  const [pauseLoading, setPauseLoading] = useState(false);
  const clockCompletedByTick =
    clockTick?.tournamentStatus === "completed" ||
    clockTick?.structureFinished === true;
  const clockPauseDisabled =
    !clockTick || clockCompletedByTick || !clockTick.clockActive;

  const handlePauseToggle = async () => {
    if (clockPauseDisabled || pauseLoading) return;
    setPauseLoading(true);
    try {
      await patchTournamentClock(environment, tournament.id, {
        paused: !clockTick.paused,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPauseLoading(false);
    }
  };

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <LaunchConfirmModal tournament={tournament} />
      <CompleteConfirmModal tournament={tournament} />
      {tournament.status === "RegistrationOpen" && (
        <Box flex={{ justify: "center", width: "100%" }}>
          <Button
            type="success"
            size="medium"
            onClick={() => openLaunchConfirmModal()}
            style={{
              backgroundColor: "var(--text-success)",
              color: "var(--text-tertiary)",
              border: "1px solid var(--text-success)",
            }}
          >
            Начать турнир
          </Button>
        </Box>
      )}
      {tournament.status === "InProgress" && (
        <Box flex={{ col: true, align: "center", width: "100%", gap: 2 }}>
          <Box flex={{ justify: "center", width: "100%", gap: 3 }}>
            <Button
              type="secondary"
              size="medium"
              loading={pauseLoading}
              disabled={clockPauseDisabled}
              onClick={handlePauseToggle}
            >
              {clockTick?.paused ? "Снять паузу" : "Пауза"}
            </Button>
            <Button
              type="error"
              size="medium"
              onClick={() => openCompleteConfirmModal()}
              disabled={!canCompleteTournament}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "1px solid #dc2626",
              }}
            >
              Завершить турнир
            </Button>
          </Box>
          {!canCompleteTournament && (
            <Typography.Text type="secondary" size="small">
              Нельзя завершить: в игре {inGameCount} игроков (должен остаться 1 — победитель)
            </Typography.Text>
          )}
        </Box>
      )}
      <TournamentInfoForm tournament={tournament} />
    </Box>
  );
};
