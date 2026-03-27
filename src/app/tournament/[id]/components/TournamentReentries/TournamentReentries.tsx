"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Modal, WithModalProps, useModal } from "@/components/Modal/Modal";
import { Typography } from "@/components/Typography/Typography";
import { toast } from "@/components/Toast/Toast";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useNonRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useNonRegisteredTournamentPlayerState";
import {
  BountyKillEntry,
  InGamePlayerState,
  PaymentMethod,
  playerHasFreeReentryOption,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  refetchTournamentPlayerState,
  useTournamentPlayerState,
} from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { addReentryPayment } from "@/core/states/tournaments/requests/addReentryPayment";
import {
  bountyEliminate,
  BountyEliminateBody,
} from "@/core/states/tournaments/requests/bountyEliminate";
import { bountyRemove } from "@/core/states/tournaments/requests/bountyRemove";
import { undoRebuyBurnedStack } from "@/core/states/tournaments/requests/undoRebuyBurnedStack";
import { X } from "lucide-react";
import {
  refetchTournamentRebuyCount,
  useTournamentRebuyCount,
} from "@/core/states/tournaments/hooks/useTournamentRebuyCount";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/SearchableSelect/SearchableSelect";
import { Formatter } from "@/components/Formatter/Formatter";

export interface TournamentReentriesProps {
  readonly tournament: TournamentInfoResponse;
}

const toSafeNumber = (value: unknown): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const getPlayerLabel = (player?: InGamePlayerState): string => {
  if (!player) {
    return "-";
  }
  return player.playerName || player.playerId || "-";
};

interface AddReentryModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
  readonly players: InGamePlayerState[];
}

interface PayReentriesModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

interface BountyListModalProps {
  close: () => void;
  initialData?: InGamePlayerState | null;
  tournamentId: string;
  players: InGamePlayerState[];
  onRemoved: () => void;
}

const BountyListModal: FC<BountyListModalProps> = ({
  close,
  initialData: row,
  tournamentId,
  players,
  onRemoved,
}) => {
  const environment = useEnvironment();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const bountyKills = row?.bountyKills ?? [];
  const killerPlayerId = row?.playerId ?? "";
  const killerPlayerName = row?.playerName ?? "";

  const getVictimDisplay = (kill: BountyKillEntry | string) => {
    const rawId =
      typeof kill === "string"
        ? kill
        : String((kill as BountyKillEntry).playerId ?? "");
    const victim = players.find(
      (p) => String(p.playerId) === String(rawId),
    );
    const nameFromKill =
      typeof kill === "object" && kill && "playerName" in kill
        ? (kill as BountyKillEntry).playerName
        : undefined;
    return {
      name: (victim?.playerName ?? nameFromKill) ?? "-",
      victimPlayerId: victim?.playerId ?? rawId,
    };
  };

  const handleRemove = async (victimPlayerId: string) => {
    setRemovingId(victimPlayerId);
    try {
      await bountyRemove(environment, tournamentId, {
        killerPlayerId,
        victimPlayerId,
      });
      onRemoved();
      close();
    } catch (error) {
      console.error(error);
      toast({ type: "error", message: "Не удалось отменить выбивание" });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Box flex={{ col: true }}>
      <Modal.Title showCloseButton>Баунти — {killerPlayerName}</Modal.Title>
      <Modal.Content minWidth={400}>
        <Box flex={{ col: true, gap: 2 }}>
          {bountyKills.length === 0 ? (
            <Typography.Text type="secondary" size="small">
              Нет выбиваний
            </Typography.Text>
          ) : (
            bountyKills.map((kill, index) => {
              const { name, victimPlayerId } = getVictimDisplay(kill);
              const keyId =
                typeof kill === "string"
                  ? kill
                  : String((kill as BountyKillEntry).playerId ?? index);
              return (
                <Box
                  key={`${keyId}-${index}`}
                  flex={{ align: "center", justify: "space-between", gap: 2 }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Typography.Text size="small">
                    {name}
                  </Typography.Text>
                  <Button
                    type="ghost"
                    size="xxSmall"
                    style={{ padding: 4 }}
                    iconRight={<X size={16} color="var(--text-error)" />}
                    onClick={() => handleRemove(victimPlayerId)}
                    disabled={removingId !== null}
                    loading={removingId === victimPlayerId}
                  />
                </Box>
              );
            })
          )}
        </Box>
      </Modal.Content>
    </Box>
  );
};

interface EliminatedByModalProps {
  close: () => void;
  initialData?: InGamePlayerState | null;
  tournamentId: string;
  players: InGamePlayerState[];
  onRemoved: () => void;
}

interface BurnedRebuyUndoModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState | null;
}

const BurnedRebuyUndoModal: FC<BurnedRebuyUndoModalProps> = ({
  close,
  tournamentId,
  player,
}) => {
  const environment = useEnvironment();
  const [undoingKey, setUndoingKey] = useState<string | null>(null);
  const rebuyBurns = useMemo(() => {
    const list = (player?.burnedStackEvents ?? []).filter(
      (e) => e.source === "Rebuy",
    );
    return [...list].reverse();
  }, [player?.burnedStackEvents, player?.playerId]);

  const handleUndo = async (burnedChips: number, rowIndex: number) => {
    if (!player || undoingKey != null) {
      return;
    }
    const key = `undo-${rowIndex}-${burnedChips}`;
    setUndoingKey(key);
    try {
      await undoRebuyBurnedStack(environment, tournamentId, {
        playerId: player.playerId,
        burnedChips,
      });
      refetchTournamentPlayerState();
      refetchTournamentRebuyCount();
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Не удалось откатить сгорание",
      });
    } finally {
      setUndoingKey(null);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>
        Сгорание стека (ребай) —{" "}
        {player ? getPlayerLabel(player) : ""}
      </Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 3 }}>
          <Typography.Text type="tertiary" size="xxSmall">
            Откат снимает последнее событие Rebuy с этой суммой фишек (LIFO
            среди совпадений).
          </Typography.Text>
          {rebuyBurns.length === 0 ? (
            <Typography.Text type="secondary" size="small">
              Нет записей сгорания за ребай
            </Typography.Text>
          ) : (
            <Box flex={{ col: true, gap: 2 }}>
              {rebuyBurns.map((ev, index) => (
                <Box
                  key={`burn-rebuy-${index}-${ev.chips}`}
                  flex={{
                    align: "center",
                    justify: "space-between",
                    gap: 2,
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Typography.Text size="small">
                    <Formatter.number value={ev.chips} type="withoutDecimals" />{" "}
                    фишек
                  </Typography.Text>
                  <Button
                    type="secondary"
                    size="xxSmall"
                    onClick={() => handleUndo(ev.chips, index)}
                    disabled={undoingKey !== null}
                    loading={undoingKey === `undo-${index}-${ev.chips}`}
                  >
                    Откат
                  </Button>
                </Box>
              ))}
            </Box>
          )}
          <Button type="secondary" htmlType="button" onClick={() => close()}>
            Закрыть
          </Button>
        </Box>
      </Modal.Content>
    </>
  );
};

const EliminatedByModal: FC<EliminatedByModalProps> = ({
  close,
  initialData: row,
  tournamentId,
  players,
  onRemoved,
}) => {
  const environment = useEnvironment();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const eliminatedByIds = row?.eliminatedBy ?? [];
  const victimPlayerId = row?.playerId ?? "";

  const getKillerInfo = (id: string) => {
    const killer = players.find((p) => String(p.playerId) === String(id));
    return {
      name: killer?.playerName ?? id,
      killerPlayerId: killer?.playerId ?? id,
    };
  };

  const handleRemove = async (killerPlayerId: string) => {
    setRemovingId(killerPlayerId);
    try {
      await bountyRemove(environment, tournamentId, {
        killerPlayerId,
        victimPlayerId,
      });
      onRemoved();
      close();
    } catch (error) {
      console.error(error);
      toast({ type: "error", message: "Не удалось отменить запись" });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Box flex={{ col: true }}>
      <Modal.Title showCloseButton>
        Кто меня выбил — {row?.playerName ?? ""}
      </Modal.Title>
      <Modal.Content minWidth={400}>
        <Box flex={{ col: true, gap: 2 }}>
          {eliminatedByIds.length === 0 ? (
            <Typography.Text type="secondary" size="small">
              Нет записей
            </Typography.Text>
          ) : (
            eliminatedByIds.map((id, index) => {
              const { name, killerPlayerId } = getKillerInfo(id);
              return (
                <Box
                  key={`${id}-${index}`}
                  flex={{ align: "center", justify: "space-between", gap: 2 }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Typography.Text size="small">{name}</Typography.Text>
                  <Button
                    type="ghost"
                    size="xxSmall"
                    style={{ padding: 4 }}
                    iconRight={<X size={16} color="var(--text-error)" />}
                    onClick={() => handleRemove(killerPlayerId)}
                    disabled={removingId !== null}
                    loading={removingId === killerPlayerId}
                  />
                </Box>
              );
            })
          )}
        </Box>
      </Modal.Content>
    </Box>
  );
};

const BASE_PAY_REENTRY_METHOD_OPTIONS: Array<{
  readonly label: PaymentMethod;
  readonly value: PaymentMethod;
}> = [
  { label: "CreditCard", value: "CreditCard" },
  { label: "Cache", value: "Cache" },
];

function getPayReentryMethodOptions(player?: InGamePlayerState): Array<{ label: PaymentMethod; value: PaymentMethod }> {
  const options = [...BASE_PAY_REENTRY_METHOD_OPTIONS];
  if (playerHasFreeReentryOption(player)) {
    options.push({ label: "Free", value: "Free" });
  }
  return options;
}

const AddReentryModal: FC<AddReentryModalProps> = ({
  close,
  tournamentId,
  player,
  players,
}) => {
  const environment = useEnvironment();
  const [count, setCount] = useState<number>(1);
  const [burnedStack, setBurnedStack] = useState(false);
  const [burnedChipsInput, setBurnedChipsInput] = useState("");
  const [killerPlayerId, setKillerPlayerId] = useState<string | undefined>(
    undefined,
  );
  const [isSaving, setIsSaving] = useState(false);
  const killerCandidates = useMemo(
    () =>
      (players ?? []).filter(
        (candidate) =>
          candidate.playerId !== player?.playerId &&
          candidate.tableId != null &&
          candidate.tableId === player?.tableId,
      ),
    [player?.playerId, player?.tableId, players],
  );
  const killerOptions = useMemo<SearchableSelectOption[]>(
    () =>
      killerCandidates.map((candidate) => ({
        value: candidate.playerId,
        label: `${candidate.playerName} (ID: ${candidate.playerId})`,
      })),
    [killerCandidates],
  );

  useEffect(() => {
    setCount(1);
    setBurnedStack(false);
    setBurnedChipsInput("");
    setKillerPlayerId(killerCandidates[0]?.playerId);
  }, [player?.playerId, killerCandidates]);

  useEffect(() => {
    if (
      killerPlayerId &&
      !killerCandidates.some((candidate) => candidate.playerId === killerPlayerId)
    ) {
      setKillerPlayerId(killerCandidates[0]?.playerId);
    }
  }, [killerCandidates, killerPlayerId]);

  const handleSave = async () => {
    if (!player || count <= 0 || isSaving) {
      return;
    }
    let payload: BountyEliminateBody;
    if (burnedStack) {
      const parsed = Number.parseInt(burnedChipsInput.trim(), 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return;
      }
      payload = {
        eliminatedPlayerId: player.playerId,
        type: "Rebuy",
        burnedStack: true,
        burnedChips: parsed,
      };
    } else {
      if (!killerPlayerId) {
        return;
      }
      payload = {
        eliminatedPlayerId: player.playerId,
        killerPlayerId,
        type: "Rebuy",
      };
    }
    setIsSaving(true);
    try {
      for (let i = 0; i < count; i += 1) {
        await bountyEliminate(environment, Number(tournamentId), payload);
      }
      refetchTournamentPlayerState();
      refetchTournamentRebuyCount();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Добавить ребай</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {player
              ? `Игрок: ${getPlayerLabel(player)}`
              : "Укажи количество ребаев для игрока"}
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
              disabled={isSaving}
            />
            <Typography.Text size="small">Сжёг стек</Typography.Text>
          </label>
          {burnedStack ? (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Сожжённых фишек (на один ребай)"
              value={burnedChipsInput}
              onChange={(e) => setBurnedChipsInput(e.target.value)}
              disabled={isSaving}
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
          ) : (
            <SearchableSelect
              options={killerOptions}
              value={killerPlayerId}
              placeholder={
                killerCandidates.length > 0
                  ? "Кто выбил игрока?"
                  : "Нет игроков за этим столом"
              }
              disabled={killerCandidates.length === 0 || isSaving}
              onChange={(value) => setKillerPlayerId(value)}
            />
          )}
          <input
            type="number"
            min={1}
            value={count}
            onChange={(event) =>
              setCount(Math.max(1, Number(event.target.value || 1)))
            }
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
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleSave}
              flexItem={{ flex: 1 }}
              loading={isSaving}
              disabled={
                !player ||
                count <= 0 ||
                isSaving ||
                (burnedStack
                  ? !Number.isFinite(
                      Number.parseInt(burnedChipsInput.trim(), 10),
                    ) ||
                    Number.parseInt(burnedChipsInput.trim(), 10) < 0
                  : !killerPlayerId)
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

const PayReentriesModal: FC<PayReentriesModalProps> = ({
  close,
  tournamentId,
  player,
}) => {
  const environment = useEnvironment();
  const [isSaving, setIsSaving] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  const paidReentryCount = useMemo(
    () => (player?.reentryByPaymentMethod ?? []).length,
    [player?.reentryByPaymentMethod],
  );
  const toPayReentryCount = useMemo(
    () => Math.max(0, toSafeNumber(player?.unpaidReentryCount) - paidReentryCount),
    [player?.unpaidReentryCount, paidReentryCount],
  );

  const payReentryMethodOptions = useMemo(
    () => getPayReentryMethodOptions(player),
    [player],
  );

  useEffect(() => {
    const allowed = new Set(
      payReentryMethodOptions.map((option) => option.value),
    );
    setMethods((prev) => {
      if (prev.length !== toPayReentryCount) {
        return Array.from({ length: toPayReentryCount }, (_, index) => {
          const method = prev[index];
          return method && allowed.has(method) ? method : "CreditCard";
        });
      }
      return prev.map((method) =>
        allowed.has(method) ? method : "CreditCard",
      );
    });
  }, [player?.playerId, toPayReentryCount, payReentryMethodOptions]);

  const handleMethodChange = (index: number, value: PaymentMethod) => {
    setMethods((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleSave = async () => {
    if (!player || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await addReentryPayment(
        environment,
        Number(tournamentId),
        player.playerId,
        {
        payments: methods,
        }
      );
      refetchTournamentPlayerState();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Оплатить ребаи</Modal.Title>
      <Modal.Content minWidth={520}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {player
              ? `Игрок: ${getPlayerLabel(player)}. Неоплачено ребаев: ${toPayReentryCount}`
              : "Выбери способы оплаты"}
          </Typography.Text>
          <Box flex={{ col: true, gap: 2 }}>
            {methods.map((method, index) => (
              <Box key={index} flex={{ align: "center", gap: 2 }}>
                <Typography.Text
                  size="small"
                  type="secondary"
                  flexItem={{ minWidth: 70 }}
                >
                  Ребай {index + 1}
                </Typography.Text>
                <select
                  value={method}
                  onChange={(event) =>
                    handleMethodChange(
                      index,
                      event.target.value as PaymentMethod,
                    )
                  }
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid var(--border-color)",
                    minHeight: 40,
                    padding: "0 12px",
                    backgroundColor: "var(--background-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  {payReentryMethodOptions.map((methodOption) => (
                    <option key={methodOption.value} value={methodOption.value}>
                      {getPaymentMethodLabel(methodOption.label)}
                    </option>
                  ))}
                </select>
              </Box>
            ))}
          </Box>
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleSave}
              flexItem={{ flex: 1 }}
              loading={isSaving}
              disabled={!player || toPayReentryCount <= 0}
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

export const TournamentReentries: FC<TournamentReentriesProps> = ({
  tournament,
}) => {
  const REENTRY_LIMIT = 5;
  const ACTIONS_COLUMN_WIDTH = 420;
  const [searchQuery, setSearchQuery] = useState("");
  const [playerToAddReentry, setPlayerToAddReentry] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [playerToPayReentries, setPlayerToPayReentries] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [playerBurnedRebuyUndo, setPlayerBurnedRebuyUndo] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [AddReentryModalConnect, openAddReentryModal] =
    useModal(AddReentryModal);
  const [PayReentriesModalConnect, openPayReentriesModal] =
    useModal(PayReentriesModal);
  const [BountyModal, openBountyModal] = useModal(BountyListModal);
  const [EliminatedByModalConnect, openEliminatedByModal] =
    useModal(EliminatedByModal);
  const [BurnedRebuyUndoModalConnect, openBurnedRebuyUndoModal] = useModal(
    BurnedRebuyUndoModal,
  );
  const { data: players } = useNonRegisteredTournamentPlayerState(
    String(tournament.id),
  );
  const { data: rebuyCountResponse } = useTournamentRebuyCount(
    String(tournament.id)
  );
  const filteredPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return players ?? [];
    }
    return (players ?? []).filter((player) => {
      const label = getPlayerLabel(player).toLowerCase();
      return (
        label.includes(normalizedQuery) ||
        player.playerId.toLowerCase().includes(normalizedQuery) ||
        String(player.tournamentPlayerId)
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [players, searchQuery]);

  const rows = useMemo(
    () =>
      [...filteredPlayers].sort((a, b) => {
        const aUnpaid = toSafeNumber(a.unpaidReentryCount);
        const bUnpaid = toSafeNumber(b.unpaidReentryCount);
        const aHasUnpaid = aUnpaid > 0;
        const bHasUnpaid = bUnpaid > 0;

        if (aHasUnpaid && !bHasUnpaid) return -1;
        if (!aHasUnpaid && bHasUnpaid) return 1;

        const aTournamentPlayerId = Number(a.tournamentPlayerId);
        const bTournamentPlayerId = Number(b.tournamentPlayerId);
        if (
          Number.isFinite(aTournamentPlayerId) &&
          Number.isFinite(bTournamentPlayerId)
        ) {
          return aTournamentPlayerId - bTournamentPlayerId;
        }
        return (a.tournamentPlayerId ?? "").localeCompare(b.tournamentPlayerId ?? "");
      }),
    [filteredPlayers],
  );

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <AddReentryModalConnect
        tournamentId={String(tournament.id)}
        player={playerToAddReentry}
        players={players ?? []}
      />
      <PayReentriesModalConnect
        tournamentId={String(tournament.id)}
        player={playerToPayReentries}
      />
      <BountyModal
        tournamentId={String(tournament.id)}
        players={players ?? []}
        onRemoved={refetchTournamentPlayerState}
      />
      <EliminatedByModalConnect
        tournamentId={String(tournament.id)}
        players={players ?? []}
        onRemoved={refetchTournamentPlayerState}
      />
      <BurnedRebuyUndoModalConnect
        tournamentId={String(tournament.id)}
        player={playerBurnedRebuyUndo}
      />
      <Box
        flex={{ width: "100%", align: "center", justify: "space-between" }}
        style={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.16)",
          paddingBottom: 8,
        }}
      >
        <Typography.Text bold>Статистика ребаев</Typography.Text>
        <Typography.Text bold>
          {rebuyCountResponse?.rebuyCount ?? rows.length}
        </Typography.Text>
      </Box>
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Поиск игрока: id, никнейм"
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

      <Box flex={{ col: true, gap: 2, width: "100%" }}>
        <Box
          flex={{ width: "100%", align: "center", gap: 3 }}
          style={{ padding: "0 12px", opacity: 0.65 }}
        >
          <Typography.Text size="small" flexItem={{ minWidth: 48 }}>
            id
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ flex: 1 }}>
            Никнейм
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 110 }}>
            Всего входов
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 96 }}>
            Бесплатно
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 96 }}>
            К оплате
          </Typography.Text>
          <Typography.Text
            size="small"
            flexItem={{ minWidth: ACTIONS_COLUMN_WIDTH }}
            style={{
              width: ACTIONS_COLUMN_WIDTH,
              minWidth: ACTIONS_COLUMN_WIDTH,
              maxWidth: ACTIONS_COLUMN_WIDTH,
              flexShrink: 0,
            }}
          >
            Действие
          </Typography.Text>
        </Box>

        {rows.map((player) => {
          const freeReentryCount = toSafeNumber(player.freeReentryCount);
          const unpaidReentryCount = toSafeNumber(player.unpaidReentryCount);
          const paidReentryCount = (player.reentryByPaymentMethod ?? []).length;
          const toPayReentryCount = Math.max(
            0,
            unpaidReentryCount - paidReentryCount,
          );
          const totalReentryCount = toSafeNumber(player.totalReentryCount);
          const hasUnpaidReentry = unpaidReentryCount > 0;
          const rowBackgroundColor =
            player.signAgreement === false
              ? "rgba(255, 196, 2, 0.22)"
              : hasUnpaidReentry
                ? "rgba(220, 38, 38, 0.12)"
                : "#e9e9e9";

          return (
            <Box
              key={player.playerId}
              flex={{ width: "100%", align: "center", gap: 3 }}
              style={{
                backgroundColor: rowBackgroundColor,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <Typography.Text bold flexItem={{ minWidth: 48 }}>
                {player.tournamentPlayerId}
              </Typography.Text>
              <Typography.Text bold flexItem={{ flex: 1 }}>
                {getPlayerLabel(player)}
              </Typography.Text>
              <Typography.Text bold flexItem={{ minWidth: 110 }}>
                {totalReentryCount}/{REENTRY_LIMIT}
              </Typography.Text>
              <Typography.Text bold flexItem={{ minWidth: 96 }}>
                {freeReentryCount}/{REENTRY_LIMIT}
              </Typography.Text>
              <Typography.Text bold flexItem={{ minWidth: 96 }}>
                {toPayReentryCount}/{REENTRY_LIMIT}
              </Typography.Text>
              <Box
                flexItem={{ minWidth: ACTIONS_COLUMN_WIDTH }}
                style={{
                  width: ACTIONS_COLUMN_WIDTH,
                  minWidth: ACTIONS_COLUMN_WIDTH,
                  maxWidth: ACTIONS_COLUMN_WIDTH,
                  flexShrink: 0,
                }}
              >
                <Box flex={{ gap: 2 }} style={{ flexWrap: "wrap" }}>
                  {toPayReentryCount > 0 && (
                    <Button
                      type="warning"
                      size="xxSmall"
                      onClick={() => {
                        setPlayerToPayReentries(player);
                        openPayReentriesModal();
                      }}
                    >
                      Оплатить
                    </Button>
                  )}
                  <Button
                    type="secondary"
                    size="xxSmall"
                    onClick={() => {
                      setPlayerToAddReentry(player);
                      openAddReentryModal();
                    }}
                  >
                    Добавить ребай
                  </Button>
                  {(player.burnedStackEvents ?? []).some(
                    (e) => e.source === "Rebuy",
                  ) && (
                    <Button
                      type="secondary"
                      size="xxSmall"
                      onClick={() => {
                        setPlayerBurnedRebuyUndo(player);
                        openBurnedRebuyUndoModal();
                      }}
                    >
                      Откат сгорания
                    </Button>
                  )}
                  <Button
                    type="secondary"
                    size="xxSmall"
                    onClick={() => openBountyModal(player)}
                  >
                    Показать баунти
                  </Button>
                  <Button
                    type="secondary"
                    size="xxSmall"
                    onClick={() => openEliminatedByModal(player)}
                  >
                    Кто меня выбил
                  </Button>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
