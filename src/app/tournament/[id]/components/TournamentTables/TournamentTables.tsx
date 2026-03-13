"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Modal, WithModalProps, useModal } from "@/components/Modal/Modal";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { TableList } from "../TournamentPlayers/TableList/TableList";
import { useNonRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useNonRegisteredTournamentPlayerState";
import {
  InGamePlayerState,
  PaymentMethod,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { TableSelectModal } from "../TournamentPlayers/TableSelectModal/TableSelectModal";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  removePlayerFromTable,
  setPlayerInGamePaidStatus,
  setPlayerTableId,
  setTournamentPlayerKnockedOut,
  setTournamentPlayerOutStatus,
} from "@/core/states/tournaments/requests/updatePlayerState";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";

export interface TournamentTablesProps {
  readonly tournament: TournamentInfoResponse;
}

interface PayPlayerModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

interface SetOutPlayerModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly bustedPlayer?: InGamePlayerState;
  readonly players: InGamePlayerState[];
}

const statusLabels: Record<string, string> = {
  InGamePaid: "В игре",
  InGameNotPaid: "В игре",
  Out: "Выбыл",
};

const PayPlayerModal: FC<PayPlayerModalProps> = ({
  close,
  tournamentId,
  player,
}) => {
  const environment = useEnvironment();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CreditCard");
  const [isLoading, setIsLoading] = useState(false);
  const paymentMethodOptions = useMemo<PaymentMethod[]>(() => {
    const baseOptions: PaymentMethod[] = ["CreditCard", "Cache"];
    if ((player?.freeEntryCount ?? 0) > 0) {
      return [...baseOptions, "Free"];
    }
    return baseOptions;
  }, [player?.freeEntryCount]);

  useEffect(() => {
    if (paymentMethod === "Free" && (player?.freeEntryCount ?? 0) <= 0) {
      setPaymentMethod("CreditCard");
    }
  }, [paymentMethod, player?.freeEntryCount]);

  const handleSave = async () => {
    if (!player || isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await setPlayerInGamePaidStatus(
        environment,
        Number(tournamentId),
        player.playerId,
        paymentMethod
      );
      if (player.tableId) {
        await setPlayerTableId(
          environment,
          Number(tournamentId),
          player.playerId,
          player.tableId
        );
      }
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
      <Modal.Title showCloseButton>Оплатить игрока</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
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

const SetOutPlayerModal: FC<SetOutPlayerModalProps> = ({
  close,
  tournamentId,
  bustedPlayer,
  players,
}) => {
  const environment = useEnvironment();
  const [isLoading, setIsLoading] = useState(false);
  const candidates = useMemo(
    () =>
      players.filter(
        (player) =>
          player.status !== "Out" && player.playerId !== bustedPlayer?.playerId
      ),
    [players, bustedPlayer?.playerId]
  );
  const [selectedKillerId, setSelectedKillerId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setSelectedKillerId(candidates[0]?.playerId);
  }, [bustedPlayer?.playerId, candidates]);

  const handleSave = async () => {
    if (!bustedPlayer || !selectedKillerId || isLoading) {
      return;
    }
    const killer = candidates.find((player) => player.playerId === selectedKillerId);
    if (!killer) {
      return;
    }
    setIsLoading(true);
    try {
      await setTournamentPlayerOutStatus(
        environment,
        Number(tournamentId),
        bustedPlayer.playerId
      );
      await setTournamentPlayerKnockedOut(
        environment,
        Number(tournamentId),
        killer.playerId,
        killer.bountyCount
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
      <Modal.Title showCloseButton>Игрок вылетел</Modal.Title>
      <Modal.Content minWidth={440}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {bustedPlayer
              ? `Кто выбил игрока "${bustedPlayer.playerName}"?`
              : "Выбери игрока"}
          </Typography.Text>
          {candidates.length > 0 ? (
            <select
              value={selectedKillerId}
              onChange={(event) => setSelectedKillerId(event.target.value || undefined)}
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
              {candidates.map((player) => (
                <option key={player.playerId} value={player.playerId}>
                  {player.playerName} (ID: {player.playerId})
                </option>
              ))}
            </select>
          ) : (
            <Typography.Text type="secondary" size="small">
              Нет доступных игроков для выбора
            </Typography.Text>
          )}
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
              onClick={handleSave}
              flexItem={{ flex: 1 }}
              loading={isLoading}
              disabled={!bustedPlayer || !selectedKillerId || candidates.length === 0}
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

export const TournamentTables: FC<TournamentTablesProps> = ({ tournament }) => {
  const environment = useEnvironment();
  const [selectedTableId, setSelectedTableId] = useState<number | undefined>(
    undefined
  );
  const [playerToMove, setPlayerToMove] = useState<InGamePlayerState | undefined>(
    undefined
  );
  const [playerToPay, setPlayerToPay] = useState<InGamePlayerState | undefined>(
    undefined
  );
  const [playerToSetOut, setPlayerToSetOut] = useState<InGamePlayerState | undefined>(
    undefined
  );
  const [SetTableModal, openSetTableModal] = useModal(TableSelectModal);
  const [PayPlayerModalConnect, openPayPlayerModal] = useModal(PayPlayerModal);
  const [SetOutPlayerModalConnect, openSetOutPlayerModal] =
    useModal(SetOutPlayerModal);
  const { data: nonRegisteredPlayers } = useNonRegisteredTournamentPlayerState(
    String(tournament.id)
  );
  const tablePlayers = (nonRegisteredPlayers ?? []).filter(
    (player) =>
      !!selectedTableId &&
      Number(player.tableId) === selectedTableId &&
      player.status !== "Out"
  );

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <PayPlayerModalConnect
        tournamentId={String(tournament.id)}
        player={playerToPay}
      />
      <SetTableModal
        tournamentId={String(tournament.id)}
        player={playerToMove}
        title="Пересадить игрока"
        description={
          playerToMove
            ? `Выбери новый стол для "${playerToMove.playerName}"`
            : "Выбери новый стол"
        }
        onSave={async (player, tableId) => {
          await setPlayerTableId(
            environment,
            Number(tournament.id),
            player.playerId,
            tableId
          );
          refetchTournamentPlayerState();
        }}
      />
      <SetOutPlayerModalConnect
        tournamentId={String(tournament.id)}
        bustedPlayer={playerToSetOut}
        players={nonRegisteredPlayers ?? []}
      />
      <TableList
        tournamentId={String(tournament.id)}
        selectable
        selectedTableId={selectedTableId}
        onSelectTable={setSelectedTableId}
      />
      <Box flex={{ col: true, gap: 2, width: "100%" }}>
        <Box
          flex={{ width: "100%", align: "center", gap: 2 }}
          style={{ padding: "0 12px" }}
        >
          <Typography.Text type="secondary" size="small" flexItem={{ minWidth: 56 }}>
            ID
          </Typography.Text>
          <Typography.Text type="secondary" size="small" flexItem={{ flex: 1 }}>
            Имя
          </Typography.Text>
          <Typography.Text type="secondary" size="small" flexItem={{ minWidth: 120 }}>
            Статус
          </Typography.Text>
          <Typography.Text type="secondary" size="small">
            Действия
          </Typography.Text>
        </Box>

        {tablePlayers.map((player) => (
          <Box
            key={player.playerId}
            flex={{ width: "100%", align: "center", gap: 2 }}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              backgroundColor:
                player.entyPaymentMethod == null
                  ? "rgba(220, 38, 38, 0.12)"
                  : "#fff",
            }}
          >
            <Typography.Text size="small" type="secondary" flexItem={{ minWidth: 56 }}>
              {player.playerId}
            </Typography.Text>
            <Typography.Text size="small" flexItem={{ flex: 1 }}>
              {player.playerName}
            </Typography.Text>
            <Typography.Text size="small" type="secondary" flexItem={{ minWidth: 120 }}>
              {statusLabels[player.status] ?? player.status}
            </Typography.Text>
            <Box flex={{ gap: 2 }}>
              {player.entyPaymentMethod == null && (
                <Button
                  type="warning"
                  size="xxSmall"
                  onClick={() => {
                    setPlayerToPay(player);
                    openPayPlayerModal();
                  }}
                >
                  Оплатить
                </Button>
              )}
              <Button
                type="secondary"
                size="xxSmall"
                onClick={() => {
                  setPlayerToMove(player);
                  openSetTableModal();
                }}
              >
                Пересадить
              </Button>
              {player.tableId && (
                <Button
                  type="secondary"
                  size="xxSmall"
                  onClick={async () => {
                    await removePlayerFromTable(
                      environment,
                      Number(tournament.id),
                      player.playerId
                    );
                    refetchTournamentPlayerState();
                  }}
                >
                  Убрать со стола
                </Button>
              )}
              {tournament.status !== "RegistrationOpen" && player.status !== "Out" && (
                <Button
                  type="error"
                  size="xxSmall"
                  onClick={() => {
                    setPlayerToSetOut(player);
                    openSetOutPlayerModal();
                  }}
                >
                  Вылетел
                </Button>
              )}
            </Box>
          </Box>
        ))}

        {!selectedTableId && (
          <Typography.Text type="secondary" size="small">
            Выбери стол сверху, чтобы увидеть игроков
          </Typography.Text>
        )}
        {selectedTableId && tablePlayers.length === 0 && (
          <Typography.Text type="secondary" size="small">
            На этом столе нет игроков
          </Typography.Text>
        )}
      </Box>
    </Box>
  );
};
