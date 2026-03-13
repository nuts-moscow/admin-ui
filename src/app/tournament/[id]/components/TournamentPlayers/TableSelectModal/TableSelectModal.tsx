"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { tableListCls } from "../TableList/TableList.css";

export interface TableSelectModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
  readonly title?: string;
  readonly description?: string;
  readonly onSave: (
    player: InGamePlayerState,
    tableId?: string,
  ) => Promise<void> | void;
}

const TABLE_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);
const TABLE_CAPACITY = 10;

const parseTableNumber = (tableId?: string): number | undefined => {
  if (!tableId) {
    return undefined;
  }
  const direct = Number(tableId);
  if (Number.isFinite(direct) && direct > 0) {
    return direct;
  }
  const match = tableId.match(/\d+/);
  if (!match) {
    return undefined;
  }
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const TableSelectModal: FC<TableSelectModalProps> = ({
  close,
  tournamentId,
  player,
  title = "Выбор стола",
  description,
  onSave,
}) => {
  const { data: players } = useTournamentPlayerState(tournamentId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | undefined>(
    undefined,
  );
  const occupiedByTable = useMemo(() => {
    const tableMap = new Map<number, number>();
    (players ?? []).forEach((item) => {
      if (item.status === "Out" || item.playerId === player?.playerId) {
        return;
      }
      const tableNumber = parseTableNumber(item.tableId);
      if (!tableNumber) {
        return;
      }
      tableMap.set(tableNumber, (tableMap.get(tableNumber) ?? 0) + 1);
    });
    return tableMap;
  }, [players, player?.playerId]);

  useEffect(() => {
    setSelectedTableId(parseTableNumber(player?.tableId));
  }, [player?.playerId, player?.tableId]);

  const handleSave = async () => {
    if (!player || isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await onSave(player, selectedTableId ? String(selectedTableId) : undefined);
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
            {TABLE_OPTIONS.map((tableNumber) => {
              const occupied = occupiedByTable.get(tableNumber) ?? 0;
              const currentPlayers = Math.min(TABLE_CAPACITY, occupied);
              const isFull = currentPlayers >= TABLE_CAPACITY;
              const isSelected = selectedTableId === tableNumber;

              return (
                <Button
                  key={tableNumber}
                  htmlType="button"
                  type="secondary"
                  size="small"
                  onClick={() => setSelectedTableId(tableNumber)}
                  disabled={isFull}
                  style={{
                    minWidth: 84,
                    backgroundColor: isSelected
                      ? "rgba(255, 196, 2, 0.14)"
                      : undefined,
                    border: isSelected
                      ? "1px solid var(--text-accent)"
                      : "1px solid var(--border-color)",
                    boxShadow: isSelected
                      ? "0 0 0 2px rgba(255, 196, 2, 0.2)"
                      : undefined,
                  }}
                >
                  <Box
                    flex={{ col: true, align: "center", gap: 0.5 }}
                    style={{
                      borderRadius: 10,
                      padding: "2px 6px",
                    }}
                  >
                    <Typography.Text bold>{tableNumber}</Typography.Text>
                    <Typography.Text size="small" type="secondary">
                      {currentPlayers}/{TABLE_CAPACITY}
                    </Typography.Text>
                  </Box>
                </Button>
              );
            })}
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
