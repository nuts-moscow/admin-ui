"use client";

import { FC, useEffect, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { tableListCls, tableListItemBadgeCls } from "../TableList/TableList.css";

export interface TableSelectModalProps extends WithModalProps {
  readonly player?: InGamePlayerState;
  readonly title?: string;
  readonly description?: string;
  readonly onSave: (
    player: InGamePlayerState,
    tableId?: number,
  ) => Promise<void> | void;
}

const TABLE_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export const TableSelectModal: FC<TableSelectModalProps> = ({
  close,
  player,
  title = "Выбор стола",
  description,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    setSelectedTableId(player?.tableId);
  }, [player?.playerId, player?.tableId]);

  const handleSave = async () => {
    if (!player || isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await onSave(player, selectedTableId);
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>{title}</Modal.Title>
      <Modal.Content minWidth={480}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {description ??
              (player
                ? `Выбери стол для игрока "${player.playerName}" или пропусти`
                : "Выбери стол или пропусти")}
          </Typography.Text>
          <Box className={tableListCls}>
            {TABLE_OPTIONS.map((tableNumber) => (
              <Button
                key={tableNumber}
                htmlType="button"
                type={selectedTableId === tableNumber ? "accent" : "secondary"}
                size="xxSmall"
                iconRight={<span className={tableListItemBadgeCls}>{tableNumber}</span>}
                onClick={() => setSelectedTableId(tableNumber)}
              />
            ))}
          </Box>
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleSave}
              flexItem={{ flex: 1 }}
              loading={isLoading}
              disabled={!player}
            >
              {selectedTableId ? "Сохранить" : "Пропустить"}
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};
