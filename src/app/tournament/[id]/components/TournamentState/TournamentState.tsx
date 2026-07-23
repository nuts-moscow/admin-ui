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
import { patchTournamentLateRegistration } from "@/core/states/tournaments/requests/patchTournamentLateRegistration";
import { patchTournamentMonthFinal } from "@/core/states/tournaments/requests/patchTournamentMonthFinal";
import { toast } from "@/components/Toast/Toast";
import { TournamentInfoForm } from "./TournamentInfoForm";

const IN_GAME_STATUSES = ["InGamePaid", "InGameNotPaid"] as const;

const getInGameCount = (players: { status: string }[]): number =>
  players.filter((p) =>
    IN_GAME_STATUSES.includes(p.status as (typeof IN_GAME_STATUSES)[number]),
  ).length;

export interface TournamentStateProps {
  readonly tournament: TournamentInfoResponse;
  /** Слияние в страницу турнира сразу после PATCH (до ответа GET), напр. lateRegistrationClosed. */
  readonly onTournamentViewPatch?: (
    patch: Partial<TournamentInfoResponse>,
  ) => void;
}

interface LaunchTournamentConfirmModalProps extends WithModalProps {
  readonly tournament: TournamentInfoResponse;
}

interface CompleteTournamentConfirmModalProps extends WithModalProps {
  readonly tournament: TournamentInfoResponse;
}

interface LateRegistrationInitial {
  readonly targetClosed: boolean;
}

interface LateRegistrationConfirmModalProps
  extends WithModalProps<LateRegistrationInitial> {
  readonly tournament: TournamentInfoResponse;
  readonly onTournamentViewPatch?: (
    patch: Partial<TournamentInfoResponse>,
  ) => void;
}

interface MonthFinalInitial {
  readonly targetMonthFinal: boolean;
}

interface MonthFinalConfirmModalProps
  extends WithModalProps<MonthFinalInitial> {
  readonly tournament: TournamentInfoResponse;
  readonly onTournamentViewPatch?: (
    patch: Partial<TournamentInfoResponse>,
  ) => void;
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

const LateRegistrationConfirmModal: FC<LateRegistrationConfirmModalProps> = ({
  close,
  tournament,
  initialData,
  onTournamentViewPatch,
}) => {
  const environment = useEnvironment();
  const [loading, setLoading] = useState(false);
  const targetClosed = initialData?.targetClosed ?? false;

  const handleConfirm = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      await patchTournamentLateRegistration(
        environment,
        tournament.id,
        targetClosed,
      );
      onTournamentViewPatch?.({ lateRegistrationClosed: targetClosed });
      refetchTournament();
      toast({
        type: "success",
        message: targetClosed
          ? "Поздняя регистрация закрыта"
          : "Поздняя регистрация снова открыта",
      });
      close();
    } catch (error) {
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Не удалось сохранить",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Подтверждение</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {targetClosed
              ? `Закрыть позднюю регистрацию по турниру «${tournament.name}»?`
              : `Снова открыть позднюю регистрацию по турниру «${tournament.name}»?`}
          </Typography.Text>
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleConfirm}
              flexItem={{ flex: 1 }}
              loading={loading}
            >
              {targetClosed ? "Закрыть лейт-регу" : "Открыть лейт-регу"}
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

const MonthFinalConfirmModal: FC<MonthFinalConfirmModalProps> = ({
  close,
  tournament,
  initialData,
  onTournamentViewPatch,
}) => {
  const environment = useEnvironment();
  const [loading, setLoading] = useState(false);
  const targetMonthFinal = initialData?.targetMonthFinal ?? false;

  const handleConfirm = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      await patchTournamentMonthFinal(
        environment,
        tournament.id,
        targetMonthFinal,
      );
      onTournamentViewPatch?.({ monthFinal: targetMonthFinal });
      refetchTournament();
      toast({
        type: "success",
        message: targetMonthFinal
          ? "Турнир помечен как финал месяца"
          : "Признак финала месяца снят",
      });
      close();
    } catch (error) {
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Не удалось сохранить",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Подтверждение</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {targetMonthFinal
              ? "Сделать турнир финалом месяца? Самостоятельно записавшиеся игроки будут сняты с записи."
              : "Убрать признак финала месяца?"}
          </Typography.Text>
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleConfirm}
              flexItem={{ flex: 1 }}
              loading={loading}
            >
              {targetMonthFinal
                ? "Сделать финалом месяца"
                : "Убрать признак"}
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

export const TournamentState: FC<TournamentStateProps> = ({
  tournament,
  onTournamentViewPatch,
}) => {
  const environment = useEnvironment();
  const [LaunchConfirmModal, openLaunchConfirmModal] = useModal(
    LaunchTournamentConfirmModal
  );
  const [CompleteConfirmModal, openCompleteConfirmModal] = useModal(
    CompleteTournamentConfirmModal
  );
  const [LateRegConfirmModal, openLateRegConfirmModal] = useModal(
    LateRegistrationConfirmModal
  );
  const [MonthFinalModal, openMonthFinalConfirmModal] = useModal(
    MonthFinalConfirmModal
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
      <LateRegConfirmModal
        tournament={tournament}
        onTournamentViewPatch={onTournamentViewPatch}
      />
      <MonthFinalModal
        tournament={tournament}
        onTournamentViewPatch={onTournamentViewPatch}
      />
      {tournament.status === "RegistrationOpen" && (
        <Box
          flex={{
            justify: "center",
            align: "center",
            width: "100%",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
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
          {tournament.monthFinal === true ? (
            <Button
              type="secondary"
              size="medium"
              onClick={() =>
                openMonthFinalConfirmModal({ targetMonthFinal: false })
              }
            >
              Убрать финал месяца
            </Button>
          ) : (
            <Button
              type="secondary"
              size="medium"
              onClick={() =>
                openMonthFinalConfirmModal({ targetMonthFinal: true })
              }
            >
              Сделать финалом месяца
            </Button>
          )}
        </Box>
      )}
      {tournament.status === "InProgress" && (
        <Box flex={{ col: true, align: "center", width: "100%", gap: 2 }}>
          <Box
            flex={{
              justify: "center",
              width: "100%",
              gap: 3,
              align: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              type="secondary"
              size="medium"
              loading={pauseLoading}
              disabled={clockPauseDisabled}
              onClick={handlePauseToggle}
            >
              {clockTick?.paused ? "Снять паузу" : "Пауза"}
            </Button>
            {tournament.lateRegistrationClosed === true ? (
              <Button
                type="secondary"
                size="medium"
                onClick={() =>
                  openLateRegConfirmModal({ targetClosed: false })
                }
              >
                Открыть лейт-регу
              </Button>
            ) : (
              <Button
                type="secondary"
                size="medium"
                onClick={() => openLateRegConfirmModal({ targetClosed: true })}
              >
                Закрыть лейт-регу
              </Button>
            )}
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
