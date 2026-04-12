"use client";

import { FC, useMemo } from "react";
import { Button } from "@/components/Button/Button";
import { Box } from "@/components/Box/Box";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import { Typography } from "@/components/Typography/Typography";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { TournamentPlayerFreeCounters } from "./TournamentPlayerFreeCounters";

export interface TournamentPlayerFreeCountersModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly playerId?: string;
}

export const TournamentPlayerFreeCountersModal: FC<
  TournamentPlayerFreeCountersModalProps
> = ({ close, tournamentId, playerId }) => {
  const { data: players } = useTournamentPlayerState(tournamentId);
  const player = useMemo(
    () =>
      playerId ? players?.find((p) => p.playerId === playerId) : undefined,
    [players, playerId],
  );

  return (
    <>
      <Modal.Title showCloseButton>
        Бесплатные (ре)ентри — {player?.playerName ?? "игрок"}
      </Modal.Title>
      <Modal.Content minWidth={400}>
        <Box flex={{ col: true, gap: 4 }}>
          {player ? (
            <TournamentPlayerFreeCounters
              key={playerId}
              tournamentId={tournamentId}
              row={player}
            />
          ) : (
            <Typography.Text type="secondary" size="small">
              Игрок не найден
            </Typography.Text>
          )}
          <Button type="secondary" htmlType="button" onClick={() => close()}>
            Закрыть
          </Button>
        </Box>
      </Modal.Content>
    </>
  );
};
