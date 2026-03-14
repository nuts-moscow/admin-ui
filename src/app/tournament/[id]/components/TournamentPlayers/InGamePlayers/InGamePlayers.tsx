"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button/Button";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { useModal, Modal, WithModalProps } from "@/components/Modal/Modal";
import { PlayerListCard } from "../PlayerListCard/PlayerListCard";
import { useNonRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useNonRegisteredTournamentPlayerState";
import {
  InGamePlayerState,
  PaymentMethod,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { TableSelectModal } from "../TableSelectModal/TableSelectModal";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  inGamePayment,
  rollbackGameStart,
  setPlayerTableId,
} from "@/core/states/tournaments/requests/updatePlayerState";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";

export interface InGamePlayersProps {
  readonly tournamentId: string;
  readonly searchQuery?: string;
}

interface PayPlayerModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

const getPlayerPaymentMethod = (
  player?: InGamePlayerState,
): PaymentMethod | undefined => {
  return player?.entryPaymentMethod ?? player?.entyPaymentMethod;
};

const PayPlayerModal: FC<PayPlayerModalProps> = ({ close, tournamentId, player }) => {
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
    setPaymentMethod(getPlayerPaymentMethod(player) ?? "CreditCard");
  }, [player?.playerId, player?.entryPaymentMethod, player?.entyPaymentMethod]);

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
      await inGamePayment(
        environment,
        Number(tournamentId),
        player.playerId,
        { entryPaymentMethod: paymentMethod },
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
      <Modal.Title showCloseButton>Оплатить вход</Modal.Title>
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

export const InGamePlayers: FC<InGamePlayersProps> = ({
  tournamentId,
  searchQuery = "",
}) => {
  const environment = useEnvironment();
  const [playerToSetTable, setPlayerToSetTable] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [playerToPay, setPlayerToPay] = useState<InGamePlayerState | undefined>(
    undefined
  );
  const [SetTableModal, openSetTableModal] = useModal(TableSelectModal);
  const [PayPlayerModalConnect, openPayPlayerModal] = useModal(PayPlayerModal);
  const { data: nonRegisteredPlayers } =
    useNonRegisteredTournamentPlayerState(tournamentId);
  const filteredPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return nonRegisteredPlayers ?? [];
    }
    return (nonRegisteredPlayers ?? []).filter((player) => {
      return (
        (player.playerName ?? "").toLowerCase().includes(normalizedQuery) ||
        player.playerId.toLowerCase().includes(normalizedQuery) ||
        String(player.tournamentPlayerId).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [nonRegisteredPlayers, searchQuery]);

  const rows = useMemo(
    () =>
      [...filteredPlayers].sort((a, b) => {
        if (a.status === b.status) {
          return 0;
        }
        if (a.status === "InGameNotPaid") {
          return -1;
        }
        if (b.status === "InGameNotPaid") {
          return 1;
        }
        return 0;
      }),
    [filteredPlayers]
  );

  return (
    <>
      <PayPlayerModalConnect tournamentId={tournamentId} player={playerToPay} />
      <SetTableModal
        tournamentId={tournamentId}
        player={playerToSetTable}
        onSave={async (player, tableId) => {
          await setPlayerTableId(
            environment,
            Number(tournamentId),
            player.playerId,
            tableId
          );
          refetchTournamentPlayerState();
        }}
      />
      <PlayerListCard
        title="На игре"
        count={rows.length}
        rows={rows}
        renderActions={(row) => {
          const hasEntryPayment =
            (row.entryPaymentMethod ?? row.entyPaymentMethod) != null;
          const isOutOrOutNotPaid =
            row.status === "Out" || row.status === "OutNotPaid";
          return (
            <>
              {isOutOrOutNotPaid && (
                <Typography.Text size="small" type="secondary">
                  Вылетел
                </Typography.Text>
              )}
              {!hasEntryPayment && (
                <Button
                  type="warning"
                  size="xxSmall"
                  onClick={() => {
                    setPlayerToPay(row);
                    openPayPlayerModal();
                  }}
                >
                  Оплатить
                </Button>
              )}
              {hasEntryPayment && (
                <Button
                  type="secondary"
                  size="xxSmall"
                  onClick={() => {
                    setPlayerToPay(row);
                    openPayPlayerModal();
                  }}
                >
                  {getPlayerPaymentMethod(row)
                    ? getPaymentMethodLabel(getPlayerPaymentMethod(row))
                    : "Оплата"}
                </Button>
              )}
              {!isOutOrOutNotPaid && (
                <Button
                  type="success"
                  size="xxSmall"
                  onClick={async () => {
                    await rollbackGameStart(
                      environment,
                      Number(tournamentId),
                      row.playerId,
                    );
                    refetchTournamentPlayerState();
                  }}
                >
                  В запись
                </Button>
              )}
              {!isOutOrOutNotPaid &&
                (row.tableId ? (
                  <Button
                    type="secondary"
                    size="xxSmall"
                    style={{
                      backgroundColor: "var(--background-primary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                    }}
                    onClick={() => {
                      setPlayerToSetTable(row);
                      openSetTableModal();
                    }}
                  >
                    Стол {row.tableId}
                  </Button>
                ) : (
                  <Button
                    type="error"
                    size="xxSmall"
                    onClick={() => {
                      setPlayerToSetTable(row);
                      openSetTableModal();
                    }}
                  >
                    Стол
                  </Button>
                ))}
            </>
          );
        }}
      />
    </>
  );
};
