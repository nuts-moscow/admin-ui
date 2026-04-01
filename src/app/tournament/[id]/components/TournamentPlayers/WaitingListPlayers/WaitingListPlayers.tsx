"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { Typography } from "@/components/Typography/Typography";
import { Modal, WithModalProps, useModal } from "@/components/Modal/Modal";
import { X } from "lucide-react";
import { PlayerListCard } from "../PlayerListCard/PlayerListCard";
import { AddPlayerButton } from "./AddPlayerButton/AddPlayerButton";
import { useRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useRegisteredTournamentPlayerState";
import {
  InGamePlayerState,
  PaymentMethod,
  playerHasFreeEntryOption,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { removePlayerFromTournament } from "@/core/states/tournaments/requests/removePlayerFromTournament";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { playerGameStart } from "@/core/states/tournaments/requests/updatePlayerState";
import { TableSelectModal } from "../TableSelectModal/TableSelectModal";
import { PlayerCorrectionModal } from "../PlayerCorrectionModal/PlayerCorrectionModal";
import { tableListCls } from "../TableList/TableList.css";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";

export interface WaitingListPlayersProps {
  readonly tournamentId: string;
  readonly searchQuery?: string;
}

interface RemovePlayerConfirmModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

interface SetArrivedAndPaidConfirmModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

const TABLE_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);
const TABLE_CAPACITY = 10;

const parseTableNumber = (tableId?: string): number | undefined => {
  if (!tableId) return undefined;
  const direct = Number(tableId);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const match = tableId.match(/\d+/);
  if (!match) return undefined;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const SetArrivedAndPaidConfirmModal: FC<SetArrivedAndPaidConfirmModalProps> = ({
  close,
  tournamentId,
  player,
}) => {
  const environment = useEnvironment();
  const { data: players } = useTournamentPlayerState(tournamentId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | undefined>(
    undefined,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CreditCard");
  const [earlyBird, setEarlyBird] = useState(false);
  const paymentMethodOptions = useMemo<PaymentMethod[]>(() => {
    const baseOptions: PaymentMethod[] = ["CreditCard", "Cache"];
    if (playerHasFreeEntryOption(player)) {
      return [...baseOptions, "Free"];
    }
    return baseOptions;
  }, [player]);

  const occupiedByTable = useMemo(() => {
    const tableMap = new Map<number, number>();
    (players ?? []).forEach((item) => {
      if (item.status === "Out" || item.playerId === player?.playerId) return;
      const tableNumber = parseTableNumber(item.tableId);
      if (!tableNumber) return;
      tableMap.set(tableNumber, (tableMap.get(tableNumber) ?? 0) + 1);
    });
    return tableMap;
  }, [players, player?.playerId]);

  useEffect(() => {
    setSelectedTableId(undefined);
    setPaymentMethod("CreditCard");
    setEarlyBird(false);
  }, [player?.playerId]);

  useEffect(() => {
    setSelectedTableId(parseTableNumber(player?.tableId));
  }, [player?.playerId, player?.tableId]);

  useEffect(() => {
    if (paymentMethod === "Free" && !playerHasFreeEntryOption(player)) {
      setPaymentMethod("CreditCard");
    }
  }, [paymentMethod, player]);

  const handleSave = async () => {
    if (!player || isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await playerGameStart(
        environment,
        Number(tournamentId),
        player.playerId,
        {
          entryPaymentMethod: paymentMethod,
          ...(selectedTableId ? { tableId: String(selectedTableId) } : {}),
          earlyBirdFlag: earlyBird,
        },
      );
      refetchTournamentPlayerState();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Пришел и оплатил</Modal.Title>
      <Modal.Content minWidth={480}>
        <Box flex={{ col: true, gap: 4 }}>
          {player ? (
            <Box flex={{ col: true, gap: 1 }}>
              <Typography.Text bold>
                {player.playerName || "—"}
              </Typography.Text>
              <Typography.Text type="secondary" size="small">
                № в турнире {player.tournamentPlayerId}
              </Typography.Text>
            </Box>
          ) : null}
          <Typography.Text type="secondary" size="small">
            Способ оплаты входа
          </Typography.Text>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid var(--border-color)",
              minHeight: 44,
              padding: "0 12px",
              backgroundColor: "var(--background-primary)",
              color: "var(--text-primary)",
            }}
          >
            {paymentMethodOptions.map((method) => (
              <option key={method} value={method}>
                {getPaymentMethodLabel(method)}
              </option>
            ))}
          </select>
          <Box flex={{ align: "center", gap: 2 }}>
            <Checkbox
              size="medium"
              checked={earlyBird}
              onCheckedChange={(checked) => setEarlyBird(checked === true)}
              disabled={isLoading}
            />
            <Typography.Text size="small">Ранняя пташка</Typography.Text>
          </Box>
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
              Сохранить
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

const RemovePlayerConfirmModal: FC<RemovePlayerConfirmModalProps> = ({
  close,
  tournamentId,
  player,
}) => {
  const environment = useEnvironment();
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    if (!player || isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await removePlayerFromTournament(
        environment,
        tournamentId,
        player.playerId,
      );
      refetchTournamentPlayerState();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Удалить игрока</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {player
              ? `Убрать игрока "${player.playerName}" из списка записи?`
              : "Убрать игрока из списка записи?"}
          </Typography.Text>
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
              type="error"
              htmlType="button"
              onClick={handleRemove}
              flexItem={{ flex: 1 }}
              loading={isLoading}
              disabled={!player}
            >
              Удалить
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

export const WaitingListPlayers: FC<WaitingListPlayersProps> = ({
  tournamentId,
  searchQuery = "",
}) => {
  const environment = useEnvironment();
  const [playerToRemove, setPlayerToRemove] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [playerToArrive, setPlayerToArrive] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [playerToArriveAndPay, setPlayerToArriveAndPay] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [RemovePlayerModal, openRemovePlayerModal] = useModal(
    RemovePlayerConfirmModal,
  );
  const [SetArrivedModal, openSetArrivedModal] = useModal(TableSelectModal);
  const [SetArrivedAndPaidModal, openSetArrivedAndPaidModal] = useModal(
    SetArrivedAndPaidConfirmModal,
  );
  const [playerCorrection, setPlayerCorrection] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [CorrectionModal, openCorrectionModal] = useModal(PlayerCorrectionModal);
  const { data: registeredPlayers } =
    useRegisteredTournamentPlayerState(tournamentId);
  const rows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return registeredPlayers ?? [];
    }
    return (registeredPlayers ?? []).filter((player) => {
      return (
        (player.playerName ?? "").toLowerCase().includes(normalizedQuery) ||
        player.playerId.toLowerCase().includes(normalizedQuery) ||
        String(player.tournamentPlayerId).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [registeredPlayers, searchQuery]);

  return (
    <>
      <RemovePlayerModal tournamentId={tournamentId} player={playerToRemove} />
      <SetArrivedModal
        tournamentId={tournamentId}
        player={playerToArrive}
        includeEarlyBirdSeatOption
        onSave={async (player, tableId, extra) => {
          await playerGameStart(
            environment,
            Number(tournamentId),
            player.playerId,
            {
              ...(tableId ? { tableId } : {}),
              earlyBirdFlag: extra?.earlyBirdFlag === true,
            },
          );
          refetchTournamentPlayerState();
        }}
      />
      <SetArrivedAndPaidModal
        tournamentId={tournamentId}
        player={playerToArriveAndPay}
      />
      <CorrectionModal
        tournamentId={tournamentId}
        player={playerCorrection}
      />
      <PlayerListCard
        title={
          <Box flex={{ align: "center", gap: 2 }}>
            <Typography.Text size="small" bold>
              Запись
            </Typography.Text>
            <AddPlayerButton tournamentId={tournamentId} />
          </Box>
        }
        count={rows.length}
        rows={rows}
        renderActions={(row) => (
          <>
            <Button
              type="success"
              size="xxSmall"
              onClick={() => {
                setPlayerToArriveAndPay(row);
                openSetArrivedAndPaidModal();
              }}
            >
              Пришел и оплатил
            </Button>
            <Button
              type="secondary"
              size="xxSmall"
              onClick={() => {
                setPlayerToArrive(row);
                openSetArrivedModal();
              }}
            >
              Пришел
            </Button>
            <Button
              type="secondary"
              size="xxSmall"
              onClick={() => {
                setPlayerCorrection(row);
                openCorrectionModal();
              }}
            >
              Коррекция
            </Button>
            <Button
              type="ghost"
              size="xxSmall"
              style={{ padding: 0 }}
              iconRight={<X size={16} color="var(--text-error)" />}
              onClick={() => {
                setPlayerToRemove(row);
                openRemovePlayerModal();
              }}
            />
          </>
        )}
      />
    </>
  );
};
