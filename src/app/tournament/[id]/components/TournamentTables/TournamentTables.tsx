"use client";

import { FC, useState } from "react";
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
import { TableSelectModal } from "../TournamentPlayers/TableSelectModal/TableSelectModal";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  setPlayerInGamePaidStatus,
  setPlayerTableId,
} from "@/core/states/tournaments/requests/updatePlayerState";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";

export interface TournamentTablesProps {
  readonly tournament: TournamentInfoResponse;
}

interface PayPlayerModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = ["Cache", "CreditCard", "Free"];

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cache");
  const [isLoading, setIsLoading] = useState(false);

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
        paymentMethod,
        player.tableId
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
            {PAYMENT_METHOD_OPTIONS.map((method) => (
              <option key={method} value={method}>
                {method}
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
  const [SetTableModal, openSetTableModal] = useModal(TableSelectModal);
  const [PayPlayerModalConnect, openPayPlayerModal] = useModal(PayPlayerModal);
  const { data: nonRegisteredPlayers } = useNonRegisteredTournamentPlayerState(
    String(tournament.id)
  );
  const tablePlayers = (nonRegisteredPlayers ?? []).filter(
    (player) => !!selectedTableId && player.tableId === selectedTableId
  );

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <PayPlayerModalConnect
        tournamentId={String(tournament.id)}
        player={playerToPay}
      />
      <SetTableModal
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
