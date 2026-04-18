"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import { Player } from "@/core/states/players/common/Player";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { deletePlayer } from "@/core/states/players/requests/deletePlayer";
import { refetchPlayers } from "@/core/states/players/hooks/usePlayers";
import { toast } from "@/components/Toast/Toast";

export interface DeletePlayerConfirmModalProps extends WithModalProps {
  readonly player: Player;
  /** Вызвать после успешного удаления (например закрыть карточку редактирования). */
  readonly onDeleted?: () => void;
}

export const DeletePlayerConfirmModal: FC<DeletePlayerConfirmModalProps> = ({
  close,
  player,
  onDeleted,
}) => {
  const environment = useEnvironment();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePlayer(environment, player.id);
      refetchPlayers();
      toast({ type: "success", message: "Игрок удалён из базы" });
      onDeleted?.();
      close();
    } catch (error) {
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Не удалось удалить игрока",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Title close={close}>Удалить игрока из базы?</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
          <Box flex={{ col: true, gap: 0 }}>
            <Typography.Text bold>{player.nickname}</Typography.Text>
            <Typography.Text type="secondary" size="small">
              id {player.id}
            </Typography.Text>
          </Box>
          <Typography.Text size="small" type="secondary">
            Запись в справочнике игроков будет удалена безвозвратно.
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            Связанные с турнирами данные в других таблицах этим действием не
            изменяются.
          </Typography.Text>
          <Box flex={{ gap: 3, justify: "flex-end", flexWrap: "wrap" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={close}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="destructive"
              htmlType="button"
              loading={loading}
              onClick={() => void handleDelete()}
            >
              Удалить из базы
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};
