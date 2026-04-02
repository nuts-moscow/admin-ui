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
import { TournamentsStructureResponse } from "@/core/states/tournaments/common/TournamentsStructureResponse";
import {
  getAllowedReentryCount,
  getReentryRemaining,
} from "@/core/states/tournaments/common/reentryLimits";
import { formatBountyCount } from "@/core/states/tournaments/common/formatBountyCount";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  refetchTournamentPlayerState,
  useTournamentPlayerState,
} from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { addReentryPayment } from "@/core/states/tournaments/requests/addReentryPayment";
import { formatApiErrorForUser } from "@/core/utils/misc/formatApiErrorForUser";
import { buildReentryPaidAmountsForApi } from "@/core/states/tournaments/common/tournamentPaymentAmounts";
import {
  bountyEliminate,
  bountyEliminateUndo,
  BountyEliminateBody,
} from "@/core/states/tournaments/requests/bountyEliminate";
import { undoRebuyBurnedStack } from "@/core/states/tournaments/requests/undoRebuyBurnedStack";
import { X } from "lucide-react";
import {
  refetchTournamentRebuyCount,
  useTournamentRebuyCount,
} from "@/core/states/tournaments/hooks/useTournamentRebuyCount";
import { Formatter } from "@/components/Formatter/Formatter";

export interface TournamentReentriesProps {
  readonly tournament: TournamentInfoResponse;
}

const EMPTY_PLAYERS_LIST: InGamePlayerState[] = [];

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
  readonly reentryStructure?: TournamentsStructureResponse | null;
}

interface PayReentriesModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
  readonly reentryPrice?: number;
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
  const killerPlayerName = row?.playerName ?? "";

  const killerId = row?.playerId ?? "";
  const bountyEventsForKiller = useMemo(() => {
    const raw = row?.bountyEliminationEvents ?? [];
    const filtered = raw.filter((ev) =>
      ev.killerPlayerIds.some((k) => String(k) === String(killerId)),
    );
    const seen = new Set<string>();
    return filtered.filter((ev) => {
      if (seen.has(ev.eventId)) {
        return false;
      }
      seen.add(ev.eventId);
      return true;
    });
  }, [row?.bountyEliminationEvents, killerId]);

  const playerNameById = (id: string) =>
    players.find((p) => String(p.playerId) === String(id))?.playerName ?? id;

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
    const eventId =
      typeof kill === "object" && kill && "eventId" in kill
        ? (kill as BountyKillEntry).eventId
        : undefined;
    return {
      name: (victim?.playerName ?? nameFromKill) ?? "-",
      eventId,
    };
  };

  const handleUndo = async (eventId: string, rowKey: string) => {
    setRemovingId(rowKey);
    try {
      await bountyEliminateUndo(environment, tournamentId, { eventId });
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
          {bountyEventsForKiller.length > 0 ? (
            bountyEventsForKiller.map((ev, index) => {
              const victimName = playerNameById(ev.eliminatedPlayerId);
              const co = ev.killerPlayerIds.filter(
                (k) => String(k) !== String(killerId),
              );
              const rowKey = `${ev.eventId}-${index}`;
              return (
                <Box
                  key={rowKey}
                  flex={{ align: "center", justify: "space-between", gap: 2 }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Box flex={{ col: true, gap: 0 }}>
                    <Typography.Text size="small">{victimName}</Typography.Text>
                    {co.length > 0 ? (
                      <Typography.Text type="secondary" size="xxSmall">
                        вместе с{" "}
                        {co.map((id) => playerNameById(id)).join(", ")}
                      </Typography.Text>
                    ) : null}
                  </Box>
                  <Button
                    type="ghost"
                    size="xxSmall"
                    style={{ padding: 4 }}
                    iconRight={<X size={16} color="var(--text-error)" />}
                    onClick={() => handleUndo(ev.eventId, rowKey)}
                    disabled={removingId !== null}
                    loading={removingId === rowKey}
                  />
                </Box>
              );
            })
          ) : bountyKills.length === 0 ? (
            <Typography.Text type="secondary" size="small">
              Нет выбиваний
            </Typography.Text>
          ) : (
            bountyKills.map((kill, index) => {
              const { name, eventId } = getVictimDisplay(kill);
              const keyId =
                typeof kill === "string"
                  ? kill
                  : String((kill as BountyKillEntry).playerId ?? index);
              const rowKey = `${keyId}-${index}`;
              return (
                <Box
                  key={rowKey}
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
                  {eventId ? (
                    <Button
                      type="ghost"
                      size="xxSmall"
                      style={{ padding: 4 }}
                      iconRight={<X size={16} color="var(--text-error)" />}
                      onClick={() => handleUndo(eventId, rowKey)}
                      disabled={removingId !== null}
                      loading={removingId === rowKey}
                    />
                  ) : (
                    <Typography.Text type="secondary" size="small">
                      Нет eventId
                    </Typography.Text>
                  )}
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
  readonly playerId?: string;
}

const BurnedRebuyUndoModal: FC<BurnedRebuyUndoModalProps> = ({
  close,
  tournamentId,
  playerId,
}) => {
  const environment = useEnvironment();
  const {
    data: tournamentPlayers,
    loading: playersLoading,
    firstRequest: playersFirstRequest,
  } = useTournamentPlayerState(tournamentId);
  const player = useMemo(
    () =>
      playerId
        ? tournamentPlayers?.find((p) => p.playerId === playerId)
        : undefined,
    [playerId, tournamentPlayers],
  );
  const [undoingKey, setUndoingKey] = useState<string | null>(null);
  const rebuyBurns = useMemo(() => {
    const list = (player?.burnedStackEvents ?? []).filter(
      (e) => e.source === "Rebuy",
    );
    return [...list].reverse();
  }, [player?.burnedStackEvents, player?.playerId]);

  const handleUndo = async (burnedChips: number, rowIndex: number) => {
    if (!playerId || undoingKey != null) {
      return;
    }
    const key = `undo-${rowIndex}-${burnedChips}`;
    setUndoingKey(key);
    try {
      await undoRebuyBurnedStack(environment, tournamentId, {
        playerId,
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
        {player ? getPlayerLabel(player) : playerId ?? "…"}
      </Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 3 }}>
          <Typography.Text type="tertiary" size="xxSmall">
            Откат снимает последнее событие Rebuy с этой суммой фишек (LIFO
            среди совпадений).
          </Typography.Text>
          {playersFirstRequest && playersLoading ? (
            <Typography.Text type="secondary" size="small">
              Загрузка…
            </Typography.Text>
          ) : playerId && !player ? (
            <Typography.Text type="secondary" size="small">
              Игрок не найден в турнире
            </Typography.Text>
          ) : rebuyBurns.length === 0 ? (
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
  const victimId = String(row?.playerId ?? "");
  const bountyEventsAsVictim = useMemo(() => {
    const raw = row?.bountyEliminationEvents ?? [];
    const filtered = raw.filter(
      (ev) => String(ev.eliminatedPlayerId) === victimId,
    );
    const seen = new Set<string>();
    return filtered.filter((ev) => {
      if (seen.has(ev.eventId)) {
        return false;
      }
      seen.add(ev.eventId);
      return true;
    });
  }, [row?.bountyEliminationEvents, victimId]);
  const eliminatedByEvents = row?.eliminatedByEvents ?? [];
  const eliminatedByIds = row?.eliminatedBy ?? [];

  const killerNames = (ids: readonly string[]) =>
    ids
      .map((id) => players.find((p) => String(p.playerId) === String(id)))
      .map((p, i) => p?.playerName ?? ids[i] ?? "—")
      .join(", ");

  const handleUndoEvent = async (eventId: string) => {
    setRemovingId(eventId);
    try {
      await bountyEliminateUndo(environment, tournamentId, { eventId });
      onRemoved();
      close();
    } catch (error) {
      console.error(error);
      toast({ type: "error", message: "Не удалось отменить запись" });
    } finally {
      setRemovingId(null);
    }
  };

  const hasBountyVictimRows = bountyEventsAsVictim.length > 0;
  const hasLegacyEventRows = eliminatedByEvents.length > 0;

  return (
    <Box flex={{ col: true }}>
      <Modal.Title showCloseButton>
        Кто меня выбил — {row?.playerName ?? ""}
      </Modal.Title>
      <Modal.Content minWidth={400}>
        <Box flex={{ col: true, gap: 2 }}>
          {!hasBountyVictimRows &&
          !hasLegacyEventRows &&
          eliminatedByIds.length === 0 ? (
            <Typography.Text type="secondary" size="small">
              Нет записей
            </Typography.Text>
          ) : hasBountyVictimRows ? (
            bountyEventsAsVictim.map((ev, index) => (
              <Box
                key={`${ev.eventId}-${index}`}
                flex={{ align: "center", justify: "space-between", gap: 2 }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                }}
              >
                <Typography.Text size="small">
                  {killerNames(ev.killerPlayerIds)}
                </Typography.Text>
                <Button
                  type="ghost"
                  size="xxSmall"
                  style={{ padding: 4 }}
                  iconRight={<X size={16} color="var(--text-error)" />}
                  onClick={() => handleUndoEvent(ev.eventId)}
                  disabled={removingId !== null}
                  loading={removingId === ev.eventId}
                />
              </Box>
            ))
          ) : hasLegacyEventRows ? (
            eliminatedByEvents.map((ev, index) => (
              <Box
                key={`${ev.eventId}-${index}`}
                flex={{ align: "center", justify: "space-between", gap: 2 }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                }}
              >
                <Typography.Text size="small">
                  {killerNames(ev.killerPlayerIds)}
                </Typography.Text>
                <Button
                  type="ghost"
                  size="xxSmall"
                  style={{ padding: 4 }}
                  iconRight={<X size={16} color="var(--text-error)" />}
                  onClick={() => handleUndoEvent(ev.eventId)}
                  disabled={removingId !== null}
                  loading={removingId === ev.eventId}
                />
              </Box>
            ))
          ) : (
            eliminatedByIds.map((id, index) => {
              const killer = players.find((p) => String(p.playerId) === String(id));
              const name = killer?.playerName ?? id;
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
                  <Typography.Text type="secondary" size="small">
                    Нет eventId для отката
                  </Typography.Text>
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
  reentryStructure,
}) => {
  const environment = useEnvironment();
  const [count, setCount] = useState<number>(1);
  const [burnedStack, setBurnedStack] = useState(false);
  const [burnedChipsInput, setBurnedChipsInput] = useState("");
  const [killerPlayerIds, setKillerPlayerIds] = useState<string[]>([]);
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
  const killerCandidateIdsKey = useMemo(
    () =>
      killerCandidates
        .map((c) => c.playerId)
        .sort()
        .join(","),
    [killerCandidates],
  );

  const remainingReentries = useMemo(
    () =>
      player ? getReentryRemaining(player, reentryStructure) : 0,
    [player, reentryStructure],
  );

  useEffect(() => {
    setCount(1);
    setBurnedStack(false);
    setBurnedChipsInput("");
  }, [player?.playerId]);

  useEffect(() => {
    if (!player || remainingReentries <= 0) {
      return;
    }
    setCount((prev) =>
      Math.min(Math.max(1, prev), remainingReentries),
    );
  }, [player?.playerId, remainingReentries, player]);

  useEffect(() => {
    setKillerPlayerIds((prev) => {
      const valid = prev.filter((id) =>
        killerCandidates.some((c) => c.playerId === id),
      );
      return [...new Set(valid)];
    });
  }, [player?.playerId, killerCandidateIdsKey]);

  const handleSave = async () => {
    if (
      !player ||
      count <= 0 ||
      isSaving ||
      remainingReentries <= 0 ||
      count > remainingReentries
    ) {
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
        killerPlayerIds: [],
      };
    } else {
      const ids = [...new Set(killerPlayerIds.filter(Boolean))];
      if (ids.length < 1) {
        return;
      }
      payload = {
        eliminatedPlayerId: player.playerId,
        killerPlayerIds: ids,
        type: "Rebuy",
      };
    }
    setIsSaving(true);
    try {
      const iterations = Math.min(count, remainingReentries);
      for (let i = 0; i < iterations; i += 1) {
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
          {player && remainingReentries <= 0 ? (
            <Typography.Text type="error" size="small">
              Реентри недоступны (лимит 0 или исчерпан).
            </Typography.Text>
          ) : player ? (
            <Typography.Text type="secondary" size="xxSmall">
              Можно добавить не больше {remainingReentries} (остаток до потолка).
            </Typography.Text>
          ) : null}
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
          ) : killerCandidates.length === 0 ? (
            <Typography.Text type="secondary" size="small">
              Нет игроков за этим столом
            </Typography.Text>
          ) : (
            <Box flex={{ col: true, gap: 2 }}>
              <Typography.Text type="secondary" size="small">
                Кто выбил (можно несколько):
              </Typography.Text>
              <Box
                flex={{ col: true, gap: 0 }}
                style={{
                  maxHeight: 300,
                  overflow: "auto",
                  padding: "2px 0",
                }}
              >
                {killerCandidates.map((c) => {
                  const isKillerSelected = killerPlayerIds.includes(c.playerId);
                  return (
                  <label
                    key={c.playerId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: isSaving ? "default" : "pointer",
                      userSelect: "none",
                      padding: "2px 6px",
                      borderRadius: 6,
                      backgroundColor: isKillerSelected
                        ? "rgba(99, 102, 241, 0.16)"
                        : "transparent",
                      border: isKillerSelected
                        ? "1px solid var(--border-color)"
                        : "1px solid transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isKillerSelected}
                      onChange={() => {
                        setKillerPlayerIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(c.playerId)) {
                            next.delete(c.playerId);
                          } else {
                            next.add(c.playerId);
                          }
                          return [...next];
                        });
                      }}
                      disabled={isSaving}
                    />
                    <Typography.Text size="small">
                      {c.playerName} ({c.playerId})
                    </Typography.Text>
                  </label>
                  );
                })}
              </Box>
              {killerPlayerIds.length > 0 ? (
                <Typography.Text type="secondary" size="small">
                  Выбрано:{" "}
                  {killerPlayerIds
                    .map(
                      (id) =>
                        killerCandidates.find((c) => c.playerId === id)
                          ?.playerName ?? id,
                    )
                    .join(", ")}
                </Typography.Text>
              ) : null}
              {killerPlayerIds.length > 1 ? (
                <Typography.Text type="secondary" size="small">
                  Каждый получит 1/{killerPlayerIds.length} полного баунти
                </Typography.Text>
              ) : null}
            </Box>
          )}
          <input
            type="number"
            min={1}
            max={
              remainingReentries > 0 ? remainingReentries : undefined
            }
            value={count}
            onChange={(event) => {
              const raw = Number(event.target.value || 1);
              const cap =
                remainingReentries > 0
                  ? remainingReentries
                  : Number.POSITIVE_INFINITY;
              setCount(Math.min(Math.max(1, raw), cap));
            }}
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
                remainingReentries <= 0 ||
                count > remainingReentries ||
                (burnedStack
                  ? !Number.isFinite(
                      Number.parseInt(burnedChipsInput.trim(), 10),
                    ) ||
                    Number.parseInt(burnedChipsInput.trim(), 10) < 0
                  : killerPlayerIds.length < 1)
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
  reentryPrice,
}) => {
  const environment = useEnvironment();
  const [isSaving, setIsSaving] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [paidInputs, setPaidInputs] = useState<string[]>([]);

  const unpaidTotal = toSafeNumber(player?.unpaidReentryCount);
  /** По одному способу оплаты на каждый неоплаченный ребай; считаем по unpaidReentryCount, а не по разнице с длиной reentryByPaymentMethod. */
  const paymentFormCount = unpaidTotal > 0 ? unpaidTotal : 0;

  const payReentryMethodOptions = useMemo(
    () => getPayReentryMethodOptions(player),
    [player],
  );

  useEffect(() => {
    const allowed = new Set(
      payReentryMethodOptions.map((option) => option.value),
    );
    setMethods((prev) => {
      if (prev.length !== paymentFormCount) {
        return Array.from({ length: paymentFormCount }, (_, index) => {
          const method = prev[index];
          return method && allowed.has(method) ? method : "CreditCard";
        });
      }
      return prev.map((method) =>
        allowed.has(method) ? method : "CreditCard",
      );
    });
  }, [player?.playerId, paymentFormCount, payReentryMethodOptions]);

  useEffect(() => {
    setPaidInputs((prev) =>
      Array.from({ length: paymentFormCount }, (_, i) => prev[i] ?? ""),
    );
  }, [paymentFormCount, player?.playerId]);

  const handleMethodChange = (index: number, value: PaymentMethod) => {
    setMethods((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handlePaidInputChange = (index: number, value: string) => {
    setPaidInputs((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const handleSave = async () => {
    if (!player || isSaving) {
      return;
    }
    const built = buildReentryPaidAmountsForApi(methods, paidInputs, reentryPrice);
    if (!built.ok) {
      toast({ type: "error", message: built.message });
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
          ...(built.paidAmounts != null
            ? { paidAmounts: built.paidAmounts }
            : {}),
        },
      );
      refetchTournamentPlayerState();
      refetchTournamentRebuyCount();
      close();
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message: formatApiErrorForUser(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Оплатить ребаи</Modal.Title>
      <Modal.Content minWidth={520}>
        <Box flex={{ col: true, gap: 4 }}>
          {player ? (
            <Box flex={{ col: true, gap: 1 }}>
              <Typography.Text bold>{getPlayerLabel(player)}</Typography.Text>
              <Typography.Text type="secondary" size="small">
                № в турнире {player.tournamentPlayerId}
              </Typography.Text>
              <Typography.Text type="secondary" size="small">
                Неоплачено ребаев: {unpaidTotal}
              </Typography.Text>
              {reentryPrice != null ? (
                <Typography.Text type="secondary" size="xSmall">
                  Полная цена одного ребая: {reentryPrice} (пустое поле ниже =
                  полная цена)
                </Typography.Text>
              ) : null}
              {player.reentryPaidAmounts != null &&
              player.reentryPaidAmounts.length > 0 ? (
                <Typography.Text type="secondary" size="xSmall">
                  Учтённые суммы по ребеям:{" "}
                  {player.reentryPaidAmounts.join(", ")}
                </Typography.Text>
              ) : null}
            </Box>
          ) : (
            <Typography.Text type="secondary" size="small">
              Выбери способы оплаты
            </Typography.Text>
          )}
          <Typography.Text type="secondary" size="small">
            Способ оплаты по каждому ребаю
          </Typography.Text>
          <Box flex={{ col: true, gap: 2 }}>
            {methods.map((method, index) => (
              <Box key={index} flex={{ col: true, gap: 1 }}>
                <Box flex={{ align: "center", gap: 2 }}>
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
                {method !== "Free" ? (
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder={
                      reentryPrice != null ? String(reentryPrice) : "Сумма"
                    }
                    value={paidInputs[index] ?? ""}
                    onChange={(e) =>
                      handlePaidInputChange(index, e.target.value)
                    }
                    disabled={isSaving}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border-color)",
                      minHeight: 40,
                      padding: "0 12px",
                      backgroundColor: "var(--background-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                ) : (
                  <Typography.Text type="secondary" size="xSmall">
                    Free — сумма 0
                  </Typography.Text>
                )}
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
              disabled={!player || paymentFormCount <= 0}
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
  const ACTIONS_COLUMN_WIDTH = 420;
  const [searchQuery, setSearchQuery] = useState("");
  const [playerToAddReentry, setPlayerToAddReentry] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [playerToPayReentries, setPlayerToPayReentries] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [burnedRebuyUndoPlayerId, setBurnedRebuyUndoPlayerId] = useState<
    string | undefined
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
  const playersForModals = players ?? EMPTY_PLAYERS_LIST;
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
        players={playersForModals}
        reentryStructure={tournament.structure}
      />
      <PayReentriesModalConnect
        tournamentId={String(tournament.id)}
        player={playerToPayReentries}
        reentryPrice={tournament.structure?.reentryPrice}
      />
      <BountyModal
        tournamentId={String(tournament.id)}
        players={playersForModals}
        onRemoved={refetchTournamentPlayerState}
      />
      <EliminatedByModalConnect
        tournamentId={String(tournament.id)}
        players={playersForModals}
        onRemoved={refetchTournamentPlayerState}
      />
      <BurnedRebuyUndoModalConnect
        tournamentId={String(tournament.id)}
        playerId={burnedRebuyUndoPlayerId}
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
      {!tournament.structure ? (
        <Typography.Text type="secondary" size="small">
          Структура турнира недоступна — отображаемый лимит реентри может не совпадать
          с настройками; ориентируйтесь на ответ API при сомнениях.
        </Typography.Text>
      ) : null}
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
          const reentryLimit = getAllowedReentryCount(
            player,
            tournament.structure,
          );
          const reentryRemaining = getReentryRemaining(
            player,
            tournament.structure,
          );
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
                {totalReentryCount}/{reentryLimit}
              </Typography.Text>
              <Typography.Text bold flexItem={{ minWidth: 96 }}>
                {freeReentryCount}/{reentryLimit}
              </Typography.Text>
              <Typography.Text bold flexItem={{ minWidth: 96 }}>
                {toPayReentryCount}/{reentryLimit}
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
                  {hasUnpaidReentry && (
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
                    disabled={reentryRemaining <= 0}
                    title={
                      reentryRemaining <= 0
                        ? "Лимит реентри исчерпан или турнир freeze-out"
                        : undefined
                    }
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
                        setBurnedRebuyUndoPlayerId(player.playerId);
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
