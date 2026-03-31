"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button/Button";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { useModal, Modal, WithModalProps } from "@/components/Modal/Modal";
import { PlayerListCard } from "../PlayerListCard/PlayerListCard";
import { useNonRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useNonRegisteredTournamentPlayerState";
import {
  Bonus,
  InGameBonus,
  InGamePlayerState,
  PaymentMethod,
  playerHasFreeEntryOption,
  tournamentBonusLabels,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { TableSelectModal } from "../TableSelectModal/TableSelectModal";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  inGamePayment,
  returnPlayerToGame,
  rollbackGameStart,
  setPlayerTableId,
} from "@/core/states/tournaments/requests/updatePlayerState";
import {
  refetchTournamentPlayerState,
  useTournamentPlayerState,
} from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { refetchTournamentRebuyCount } from "@/core/states/tournaments/hooks/useTournamentRebuyCount";
import {
  addPlayerCustomBonusChips,
  addPlayerTournamentBonus,
  removePlayerCustomBonusChipsOne,
  removePlayerTournamentBonus,
} from "@/core/states/tournaments/requests/playerTournamentBonuses";
import { toast } from "@/components/Toast/Toast";
import { Formatter } from "@/components/Formatter/Formatter";
import { X } from "lucide-react";

export interface InGamePlayersProps {
  readonly tournamentId: string;
  readonly searchQuery?: string;
}

interface PayPlayerModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

const BONUS_OPTIONS: Bonus[] = Object.values(InGameBonus);

interface PlayerBonusesModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly playerId?: string;
}

const PlayerBonusesModal: FC<PlayerBonusesModalProps> = ({
  close,
  tournamentId,
  playerId,
}) => {
  const environment = useEnvironment();
  const { data: players } = useTournamentPlayerState(tournamentId);
  const player = useMemo(
    () =>
      playerId ? players?.find((p) => p.playerId === playerId) : undefined,
    [players, playerId],
  );
  const [bonusToAdd, setBonusToAdd] = useState<Bonus>(InGameBonus.EarlyBird);
  const [customChipsInput, setCustomChipsInput] = useState("");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const bonuses = player?.bonuses ?? [];
  const customBonusChips = player?.customBonusChips ?? [];

  const handleRemove = async (bonus: Bonus, index: number) => {
    if (!playerId || loadingKey != null) return;
    const key = `r-${index}`;
    setLoadingKey(key);
    try {
      await removePlayerTournamentBonus(
        environment,
        tournamentId,
        playerId,
        bonus,
      );
      refetchTournamentPlayerState();
    } catch (error) {
      console.error(error);
      toast({ type: "error", message: "Не удалось убрать бонус" });
    } finally {
      setLoadingKey(null);
    }
  };

  const handleAdd = async () => {
    if (!playerId || loadingKey != null) return;
    setLoadingKey("add");
    try {
      await addPlayerTournamentBonus(
        environment,
        tournamentId,
        playerId,
        bonusToAdd,
      );
      refetchTournamentPlayerState();
    } catch (error) {
      console.error(error);
      toast({ type: "error", message: "Не удалось добавить бонус" });
    } finally {
      setLoadingKey(null);
    }
  };

  const handleAddCustom = async () => {
    if (!playerId || loadingKey != null) return;
    const parsed = Number.parseInt(customChipsInput.trim(), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({
        type: "error",
        message: "Укажите целое число фишек больше 0",
      });
      return;
    }
    setLoadingKey("add-custom");
    try {
      await addPlayerCustomBonusChips(environment, tournamentId, playerId, parsed);
      setCustomChipsInput("");
      refetchTournamentPlayerState();
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось добавить кастомный бонус",
      });
    } finally {
      setLoadingKey(null);
    }
  };

  const handleRemoveCustom = async (chips: number, index: number) => {
    if (!playerId || loadingKey != null) return;
    const key = `rc-${index}`;
    setLoadingKey(key);
    try {
      await removePlayerCustomBonusChipsOne(
        environment,
        tournamentId,
        playerId,
        chips,
      );
      refetchTournamentPlayerState();
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось снять кастомный бонус",
      });
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>
        Бонусы — {player?.playerName ?? "игрок"}
      </Modal.Title>
      <Modal.Content minWidth={400}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            Фиксированные бонусы
          </Typography.Text>
          {bonuses.length === 0 ? (
            <Typography.Text type="secondary" size="small">
              Нет
            </Typography.Text>
          ) : (
            <Box flex={{ col: true, gap: 2 }}>
              {bonuses.map((bonus, index) => {
                const label =
                  tournamentBonusLabels[bonus as Bonus] ?? String(bonus);
                const key = `r-${index}`;
                return (
                  <Box
                    key={`${bonus}-${index}`}
                    flex={{ align: "center", justify: "space-between", gap: 2 }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <Typography.Text size="small">{label}</Typography.Text>
                    <Button
                      type="ghost"
                      size="xxSmall"
                      style={{ padding: 4 }}
                      iconRight={<X size={16} color="var(--text-error)" />}
                      onClick={() => handleRemove(bonus as Bonus, index)}
                      disabled={loadingKey !== null}
                      loading={loadingKey === key}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          <Typography.Text type="secondary" size="small">
            Кастомные фишки
          </Typography.Text>
          {customBonusChips.length === 0 ? (
            <Typography.Text type="secondary" size="small">
              Нет
            </Typography.Text>
          ) : (
            <Box flex={{ col: true, gap: 2 }}>
              {customBonusChips.map((chips, index) => {
                const key = `rc-${index}`;
                return (
                  <Box
                    key={`custom-bonus-${index}`}
                    flex={{ align: "center", justify: "space-between", gap: 2 }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <Typography.Text size="small">
                      <Formatter.number value={chips} type="withoutDecimals" />{" "}
                      фишек
                    </Typography.Text>
                    <Button
                      type="ghost"
                      size="xxSmall"
                      style={{ padding: 4 }}
                      iconRight={<X size={16} color="var(--text-error)" />}
                      onClick={() => handleRemoveCustom(chips, index)}
                      disabled={loadingKey !== null}
                      loading={loadingKey === key}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
          <Typography.Text type="tertiary" size="xxSmall">
            Снятие убирает последний грант с этой суммой (с конца списка).
          </Typography.Text>

          <Typography.Text type="secondary" size="small">
            Добавить
          </Typography.Text>
          <Box
            flex={{
              align: "flex-start",
              gap: 2,
              flexWrap: "wrap",
            }}
            width="100%"
            style={{ alignItems: "stretch" }}
          >
            <Box
              flex={{ align: "center", gap: 2 }}
              flexItem={{ flex: 1 }}
              style={{ minWidth: 200 }}
            >
              <select
                value={bonusToAdd}
                onChange={(e) => setBonusToAdd(e.target.value as Bonus)}
                disabled={!playerId || loadingKey !== null}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: "1px solid var(--border-color)",
                  minHeight: 40,
                  padding: "0 12px",
                  backgroundColor: "var(--background-primary)",
                  color: "var(--text-primary)",
                }}
              >
                {BONUS_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {tournamentBonusLabels[b]}
                  </option>
                ))}
              </select>
              <Button
                type="primary"
                size="xxSmall"
                onClick={handleAdd}
                disabled={!playerId || loadingKey !== null}
                loading={loadingKey === "add"}
              >
                Добавить
              </Button>
            </Box>
            <Box
              flex={{ align: "center", gap: 2 }}
              flexItem={{ flex: 1 }}
              style={{ minWidth: 200 }}
            >
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="Фишки"
                value={customChipsInput}
                onChange={(e) => setCustomChipsInput(e.target.value)}
                disabled={!playerId || loadingKey !== null}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: "1px solid var(--border-color)",
                  minHeight: 40,
                  padding: "0 12px",
                  backgroundColor: "var(--background-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <Button
                type="primary"
                size="xxSmall"
                onClick={handleAddCustom}
                disabled={!playerId || loadingKey !== null}
                loading={loadingKey === "add-custom"}
              >
                Кастом
              </Button>
            </Box>
          </Box>

          <Button type="secondary" htmlType="button" onClick={() => close()}>
            Закрыть
          </Button>
        </Box>
      </Modal.Content>
    </>
  );
};

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
    if (playerHasFreeEntryOption(player)) {
      return [...baseOptions, "Free"];
    }
    return baseOptions;
  }, [player]);

  useEffect(() => {
    setPaymentMethod(getPlayerPaymentMethod(player) ?? "CreditCard");
  }, [player?.playerId, player?.entryPaymentMethod, player?.entyPaymentMethod]);

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
      <Modal.Title showCloseButton>Оплатить вход</Modal.Title>
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
  const [playerBonusesPlayerId, setPlayerBonusesPlayerId] = useState<
    string | undefined
  >(undefined);
  const [returningPlayerId, setReturningPlayerId] = useState<
    string | undefined
  >(undefined);
  const [BonusesModal, openBonusesModal] = useModal(PlayerBonusesModal);
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

  const rows = useMemo(() => {
    const needsEntryAttention = (p: InGamePlayerState) => {
      const hasPayment = (p.entryPaymentMethod ?? p.entyPaymentMethod) != null;
      return (
        p.status === "InGameNotPaid" ||
        ((p.status === "Out" || p.status === "OutNotPaid") && !hasPayment)
      );
    };
    return [...filteredPlayers].sort((a, b) => {
      const aNeeds = needsEntryAttention(a);
      const bNeeds = needsEntryAttention(b);
      if (aNeeds && !bNeeds) return -1;
      if (!aNeeds && bNeeds) return 1;
      return 0;
    });
  }, [filteredPlayers]);

  return (
    <>
      <PayPlayerModalConnect tournamentId={tournamentId} player={playerToPay} />
      <BonusesModal
        tournamentId={tournamentId}
        playerId={playerBonusesPlayerId}
      />
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
              <Button
                type="secondary"
                size="xxSmall"
                onClick={() => {
                  setPlayerBonusesPlayerId(row.playerId);
                  openBonusesModal();
                }}
              >
                Бонусы
              </Button>
              {isOutOrOutNotPaid && (
                <Typography.Text size="small" type="secondary">
                  Вылетел
                </Typography.Text>
              )}
              {isOutOrOutNotPaid && (
                <Button
                  type="success"
                  size="xxSmall"
                  loading={returningPlayerId === row.playerId}
                  disabled={
                    returningPlayerId !== undefined &&
                    returningPlayerId !== row.playerId
                  }
                  onClick={async () => {
                    setReturningPlayerId(row.playerId);
                    try {
                      await returnPlayerToGame(
                        environment,
                        Number(tournamentId),
                        row.playerId,
                      );
                      refetchTournamentPlayerState();
                      refetchTournamentRebuyCount();
                    } catch (error) {
                      toast({
                        type: "error",
                        message:
                          error instanceof Error
                            ? error.message
                            : "Не удалось вернуть в игру",
                      });
                    } finally {
                      setReturningPlayerId(undefined);
                    }
                  }}
                >
                  В игру
                </Button>
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
