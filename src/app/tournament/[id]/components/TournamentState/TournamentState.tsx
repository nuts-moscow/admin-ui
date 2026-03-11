"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Modal, WithModalProps, useModal } from "@/components/Modal/Modal";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { launchTournament } from "@/core/states/tournaments/requests/updateTournament";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";

export interface TournamentStateProps {
  readonly tournament: TournamentInfoResponse;
}

interface LaunchTournamentConfirmModalProps extends WithModalProps {
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

export const TournamentState: FC<TournamentStateProps> = ({
  tournament,
}) => {
  const [LaunchConfirmModal, openLaunchConfirmModal] = useModal(
    LaunchTournamentConfirmModal
  );

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <LaunchConfirmModal tournament={tournament} />
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
      <Typography.Text>Состояние турнира</Typography.Text>
    </Box>
  );
};
