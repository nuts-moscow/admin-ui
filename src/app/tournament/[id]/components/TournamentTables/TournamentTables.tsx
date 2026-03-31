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
  playerHasFreeEntryOption,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { TableSelectModal } from "../TournamentPlayers/TableSelectModal/TableSelectModal";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  inGamePayment,
  removePlayerFromTable,
  setPlayerTableId,
} from "@/core/states/tournaments/requests/updatePlayerState";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { bountyEliminate } from "@/core/states/tournaments/requests/bountyEliminate";

const EMPTY_TABLE_PLAYERS: InGamePlayerState[] = [];

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
    if (playerHasFreeEntryOption(player)) {
      return [...baseOptions, "Free"];
    }
    return baseOptions;
  }, [player]);

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
      <Modal.Title showCloseButton>Оплатить игрока</Modal.Title>
      <Modal.Content minWidth={420}>
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
  const [burnedStack, setBurnedStack] = useState(false);
  const [burnedChipsInput, setBurnedChipsInput] = useState("");
  const candidates = useMemo(
    () =>
      players.filter(
        (player) =>
          player.status !== "Out" && player.playerId !== bustedPlayer?.playerId
      ),
    [players, bustedPlayer?.playerId]
  );
  const candidateIdsKey = useMemo(
    () =>
      candidates
        .map((c) => c.playerId)
        .sort()
        .join(","),
    [candidates],
  );
  const [selectedKillerIds, setSelectedKillerIds] = useState<string[]>([]);

  useEffect(() => {
    setBurnedStack(false);
    setBurnedChipsInput("");
  }, [bustedPlayer?.playerId]);

  useEffect(() => {
    setSelectedKillerIds((prev) => {
      const valid = prev.filter((id) =>
        candidates.some((c) => c.playerId === id),
      );
      const deduped = [...new Set(valid)];
      if (deduped.length > 0) {
        return deduped;
      }
      if (candidates.length > 0) {
        return [candidates[0].playerId];
      }
      return [];
    });
  }, [bustedPlayer?.playerId, candidateIdsKey]);

  const canSave =
    !!bustedPlayer &&
    (burnedStack ? true : selectedKillerIds.length > 0 && candidates.length > 0);

  const handleSave = async () => {
    if (!bustedPlayer || !canSave || isLoading) {
      return;
    }
    if (burnedStack) {
      const chips = Number.parseInt(burnedChipsInput.trim(), 10);
      if (!Number.isFinite(chips) || chips < 0) {
        return;
      }
      setIsLoading(true);
      try {
        await bountyEliminate(environment, Number(tournamentId), {
          eliminatedPlayerId: bustedPlayer.playerId,
          type: "Out",
          burnedStack: true,
          burnedChips: chips,
          killerPlayerIds: [],
        });
        refetchTournamentPlayerState();
        close();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    const killerIds = [...new Set(selectedKillerIds.filter(Boolean))];
    if (killerIds.length < 1) {
      return;
    }
    setIsLoading(true);
    try {
      await bountyEliminate(environment, Number(tournamentId), {
        eliminatedPlayerId: bustedPlayer.playerId,
        killerPlayerIds: killerIds,
        type: "Out",
      });
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
              ? burnedStack
                ? `Сжёг стек — игрок «${bustedPlayer.playerName}»`
                : `Кто выбил игрока «${bustedPlayer.playerName}»?`
              : "Выбери игрока"}
          </Typography.Text>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={burnedStack}
              onChange={(e) => setBurnedStack(e.target.checked)}
              disabled={isLoading}
            />
            <Typography.Text size="small">Сжёг стек</Typography.Text>
          </label>
          {burnedStack ? (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Сожжённых фишек"
              value={burnedChipsInput}
              onChange={(e) => setBurnedChipsInput(e.target.value)}
              disabled={isLoading}
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid var(--border-color)",
                minHeight: 44,
                padding: "0 12px",
                backgroundColor: "var(--background-primary)",
                color: "var(--text-primary)",
              }}
            />
          ) : candidates.length > 0 ? (
            <Box flex={{ col: true, gap: 2 }}>
              <Typography.Text type="secondary" size="small">
                Кто выбил (можно несколько):
              </Typography.Text>
              <Box
                flex={{ col: true, gap: 2 }}
                style={{ maxHeight: 220, overflow: "auto", padding: "4px 0" }}
              >
                {candidates.map((player) => (
                  <label
                    key={player.playerId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: isLoading ? "default" : "pointer",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedKillerIds.includes(player.playerId)}
                      onChange={() => {
                        setSelectedKillerIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(player.playerId)) {
                            next.delete(player.playerId);
                          } else {
                            next.add(player.playerId);
                          }
                          return [...next];
                        });
                      }}
                      disabled={isLoading}
                    />
                    <Typography.Text size="small">
                      {player.playerName} (ID: {player.playerId})
                    </Typography.Text>
                  </label>
                ))}
              </Box>
              {selectedKillerIds.length > 1 ? (
                <Typography.Text type="secondary" size="small">
                  Каждый получит 1/{selectedKillerIds.length} полного баунти
                </Typography.Text>
              ) : null}
            </Box>
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
              disabled={
                !bustedPlayer ||
                isLoading ||
                (burnedStack
                  ? !Number.isFinite(Number.parseInt(burnedChipsInput.trim(), 10)) ||
                    Number.parseInt(burnedChipsInput.trim(), 10) < 0
                  : selectedKillerIds.length < 1 || candidates.length === 0)
              }
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
  const { data: nonRegisteredPlayers } = useNonRegisteredTournamentPlayerState(
    String(tournament.id)
  );
  const setOutModalPlayers = useMemo(() => {
    if (!playerToSetOut?.tableId) {
      return EMPTY_TABLE_PLAYERS;
    }
    return (nonRegisteredPlayers ?? []).filter(
      (p) => String(p.tableId) === String(playerToSetOut.tableId),
    );
  }, [nonRegisteredPlayers, playerToSetOut?.tableId]);
  const [SetTableModal, openSetTableModal] = useModal(TableSelectModal);
  const [PayPlayerModalConnect, openPayPlayerModal] = useModal(PayPlayerModal);
  const [SetOutPlayerModalConnect, openSetOutPlayerModal] =
    useModal(SetOutPlayerModal);
  const excludedFromTableStatuses = ["Out", "OutNotPaid"] as const;
  const tablePlayers = (nonRegisteredPlayers ?? []).filter(
    (player) =>
      !!selectedTableId &&
      Number(player.tableId) === selectedTableId &&
      !excludedFromTableStatuses.includes(player.status as (typeof excludedFromTableStatuses)[number])
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
        players={setOutModalPlayers}
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
                player.signAgreement === false
                  ? "rgba(255, 196, 2, 0.22)"
                  : (player.entryPaymentMethod ?? player.entyPaymentMethod) == null
                    ? "rgba(220, 38, 38, 0.12)"
                    : "#fff",
            }}
          >
            <Typography.Text size="small" type="secondary" flexItem={{ minWidth: 56 }}>
              {player.tournamentPlayerId}
            </Typography.Text>
            <Typography.Text size="small" flexItem={{ flex: 1 }}>
              {player.playerName}
            </Typography.Text>
            <Typography.Text size="small" type="secondary" flexItem={{ minWidth: 120 }}>
              {statusLabels[player.status] ?? player.status}
            </Typography.Text>
            <Box flex={{ gap: 2 }}>
              {(player.entryPaymentMethod ?? player.entyPaymentMethod) == null && (
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
