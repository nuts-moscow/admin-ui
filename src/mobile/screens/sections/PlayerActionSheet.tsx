"use client";

import { FC, useMemo, useState } from "react";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Box } from "@/components/Box/Box";
import { toast } from "@/components/Toast/Toast";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  InGamePlayerState,
  PaymentMethod,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import {
  inGamePayment,
  rollbackGameStart,
  returnPlayerToGame,
  setPlayerTableId,
  removePlayerFromTable,
} from "@/core/states/tournaments/requests/updatePlayerState";
import {
  bountyEliminate,
  BountyEliminateBody,
  BountyEliminationType,
} from "@/core/states/tournaments/requests/bountyEliminate";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { refetchTournamentRebuyCount } from "@/core/states/tournaments/hooks/useTournamentRebuyCount";
import { formatApiErrorForUser } from "@/core/utils/misc/formatApiErrorForUser";
import { Sheet } from "../../components/Sheet";
import { mobileCardCls, mobileInputCls } from "../../mobile.css";

const PAYMENT_METHODS: PaymentMethod[] = ["Cache", "CreditCard", "Free"];

type View = "menu" | "out" | "rebuy";

export interface PlayerActionSheetProps {
  readonly tournamentId: string;
  readonly player: InGamePlayerState | null;
  readonly players: InGamePlayerState[];
  readonly onClose: () => void;
}

const isOutStatus = (p: InGamePlayerState) =>
  p.status === "Out" || p.status === "OutNotPaid";

export const PlayerActionSheet: FC<PlayerActionSheetProps> = ({
  tournamentId,
  player,
  players,
  onClose,
}) => {
  const environment = useEnvironment();
  const [busy, setBusy] = useState<string | null>(null);
  const [view, setView] = useState<View>("menu");
  const [tableInput, setTableInput] = useState("");
  const [killerIds, setKillerIds] = useState<string[]>([]);
  const [burnedStack, setBurnedStack] = useState(false);
  const [burnedChips, setBurnedChips] = useState("");
  const [rebuyCount, setRebuyCount] = useState("1");

  const candidates = useMemo(
    () =>
      player
        ? players.filter(
            (p) => p.playerId !== player.playerId && !isOutStatus(p),
          )
        : [],
    [players, player],
  );

  if (!player) {
    return null;
  }

  const isOut = isOutStatus(player);
  const currentMethod = player.entryPaymentMethod ?? player.entyPaymentMethod;
  const tid = Number(tournamentId);

  const closeAll = () => {
    setView("menu");
    setKillerIds([]);
    setBurnedStack(false);
    setBurnedChips("");
    setRebuyCount("1");
    setTableInput("");
    onClose();
  };

  const run = async (key: string, fn: () => Promise<unknown>) => {
    if (busy) {
      return;
    }
    setBusy(key);
    try {
      await fn();
      refetchTournamentPlayerState();
      refetchTournamentRebuyCount();
    } catch (error) {
      toast({ type: "error", message: formatApiErrorForUser(error) });
    } finally {
      setBusy(null);
    }
  };

  const pay = (method: PaymentMethod) =>
    run(`pay-${method}`, () =>
      inGamePayment(environment, tid, player.playerId, {
        entryPaymentMethod: method,
      }),
    );

  const seat = () => {
    const t = tableInput.trim();
    if (!t) {
      return;
    }
    return run("seat", async () => {
      await setPlayerTableId(environment, tid, player.playerId, t);
      setTableInput("");
    });
  };

  const buildPayload = (type: BountyEliminationType): BountyEliminateBody | null => {
    if (burnedStack) {
      const chips = Number.parseInt(burnedChips.trim(), 10);
      if (!Number.isFinite(chips) || chips < 0) {
        return null;
      }
      return {
        eliminatedPlayerId: player.playerId,
        type,
        burnedStack: true,
        burnedChips: chips,
        killerPlayerIds: [],
      };
    }
    const ids = [...new Set(killerIds.filter(Boolean))];
    if (ids.length < 1) {
      return null;
    }
    return { eliminatedPlayerId: player.playerId, killerPlayerIds: ids, type };
  };

  const submitElimination = (type: BountyEliminationType) => {
    const payload = buildPayload(type);
    if (!payload) {
      return;
    }
    const iterations =
      type === "Rebuy"
        ? Math.max(1, Number.parseInt(rebuyCount || "1", 10) || 1)
        : 1;
    void run(`elim-${type}`, async () => {
      // Каждое действие — свой Idempotency-Key (генерируется внутри bountyEliminate).
      for (let i = 0; i < iterations; i += 1) {
        const result = await bountyEliminate(environment, tid, payload);
        if (result.outcome === "late_registration_closed") {
          toast({ type: "warning", message: "Поздняя регистрация закрыта" });
          break;
        }
        if (result.outcome === "already_out") {
          toast({
            type: "info",
            message: "Игрок уже выбыл — повторное выбивание не требуется",
          });
          break;
        }
      }
      closeAll();
    });
  };

  const toggleKiller = (id: string) =>
    setKillerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const title =
    view === "out"
      ? `Аут — ${player.playerName}`
      : view === "rebuy"
        ? `Ребай — ${player.playerName}`
        : player.playerName || player.playerId;

  return (
    <Sheet open onClose={closeAll} title={title}>
      {view === "menu" ? (
        <>
          <Typography.Text type="secondary" size="small">
            № в турнире {player.tournamentPlayerId}
            {player.tableId != null ? ` · Стол ${player.tableId}` : ""}
            {currentMethod ? ` · ${getPaymentMethodLabel(currentMethod)}` : ""}
          </Typography.Text>

          {!isOut ? (
            <Button
              type="error"
              size="medium"
              width="100%"
              disabled={busy !== null}
              onClick={() => setView("out")}
            >
              Аут
            </Button>
          ) : null}
          <Button
            type="primary"
            size="medium"
            width="100%"
            disabled={busy !== null}
            onClick={() => setView("rebuy")}
          >
            Ребай
          </Button>

          <Box flex={{ col: true, gap: 2 }}>
            <Typography.Text size="small" type="secondary">
              Оплата входа
            </Typography.Text>
            <Box flex={{ gap: 2, width: "100%" }}>
              {PAYMENT_METHODS.map((method) => (
                <Button
                  key={method}
                  type={currentMethod === method ? "primary" : "secondary"}
                  size="small"
                  flexItem={{ flex: 1 }}
                  loading={busy === `pay-${method}`}
                  disabled={busy !== null}
                  onClick={() => pay(method)}
                >
                  {getPaymentMethodLabel(method)}
                </Button>
              ))}
            </Box>
          </Box>

          {!isOut ? (
            <Box flex={{ col: true, gap: 2 }}>
              <Typography.Text size="small" type="secondary">
                Стол
              </Typography.Text>
              <input
                className={mobileInputCls}
                type="number"
                inputMode="numeric"
                placeholder="Номер стола"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
              />
              <Box flex={{ gap: 2, width: "100%" }}>
                <Button
                  type="secondary"
                  size="small"
                  flexItem={{ flex: 1 }}
                  loading={busy === "seat"}
                  disabled={busy !== null || tableInput.trim() === ""}
                  onClick={seat}
                >
                  Посадить
                </Button>
                {player.tableId != null ? (
                  <Button
                    type="secondary"
                    size="small"
                    flexItem={{ flex: 1 }}
                    loading={busy === "unseat"}
                    disabled={busy !== null}
                    onClick={() =>
                      run("unseat", () =>
                        removePlayerFromTable(environment, tid, player.playerId),
                      )
                    }
                  >
                    Со стола
                  </Button>
                ) : null}
              </Box>
            </Box>
          ) : null}

          {isOut ? (
            <Button
              type="success"
              size="medium"
              width="100%"
              loading={busy === "return"}
              disabled={busy !== null}
              onClick={() =>
                run("return", () =>
                  returnPlayerToGame(environment, tid, player.playerId),
                )
              }
            >
              Вернуть в игру
            </Button>
          ) : (
            <Button
              type="secondary"
              size="medium"
              width="100%"
              loading={busy === "rollback"}
              disabled={busy !== null}
              onClick={() =>
                run("rollback", () =>
                  rollbackGameStart(environment, tid, player.playerId),
                )
              }
            >
              Вернуть в запись
            </Button>
          )}
        </>
      ) : (
        <EliminationForm
          view={view}
          candidates={candidates}
          killerIds={killerIds}
          toggleKiller={toggleKiller}
          burnedStack={burnedStack}
          setBurnedStack={setBurnedStack}
          burnedChips={burnedChips}
          setBurnedChips={setBurnedChips}
          rebuyCount={rebuyCount}
          setRebuyCount={setRebuyCount}
          busy={busy}
          onBack={() => setView("menu")}
          onSubmit={() => submitElimination(view === "out" ? "Out" : "Rebuy")}
        />
      )}
    </Sheet>
  );
};

interface EliminationFormProps {
  readonly view: "out" | "rebuy";
  readonly candidates: InGamePlayerState[];
  readonly killerIds: string[];
  readonly toggleKiller: (id: string) => void;
  readonly burnedStack: boolean;
  readonly setBurnedStack: (v: boolean) => void;
  readonly burnedChips: string;
  readonly setBurnedChips: (v: string) => void;
  readonly rebuyCount: string;
  readonly setRebuyCount: (v: string) => void;
  readonly busy: string | null;
  readonly onBack: () => void;
  readonly onSubmit: () => void;
}

const EliminationForm: FC<EliminationFormProps> = ({
  view,
  candidates,
  killerIds,
  toggleKiller,
  burnedStack,
  setBurnedStack,
  burnedChips,
  setBurnedChips,
  rebuyCount,
  setRebuyCount,
  busy,
  onBack,
  onSubmit,
}) => {
  const chipsValid =
    Number.isFinite(Number.parseInt(burnedChips.trim(), 10)) &&
    Number.parseInt(burnedChips.trim(), 10) >= 0;
  const canSubmit = burnedStack ? chipsValid : killerIds.length > 0;

  return (
    <>
      {view === "rebuy" ? (
        <Box flex={{ col: true, gap: 2 }}>
          <Typography.Text size="small" type="secondary">
            Количество ребаев
          </Typography.Text>
          <input
            className={mobileInputCls}
            type="number"
            inputMode="numeric"
            min={1}
            value={rebuyCount}
            onChange={(e) => setRebuyCount(e.target.value)}
          />
        </Box>
      ) : null}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        <input
          type="checkbox"
          checked={burnedStack}
          onChange={(e) => setBurnedStack(e.target.checked)}
        />
        <Typography.Text size="small">Сжёг стек</Typography.Text>
      </label>

      {burnedStack ? (
        <input
          className={mobileInputCls}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Сожжённых фишек"
          value={burnedChips}
          onChange={(e) => setBurnedChips(e.target.value)}
        />
      ) : (
        <Box flex={{ col: true, gap: 2 }}>
          <Typography.Text size="small" type="secondary">
            Кто выбил (можно несколько)
          </Typography.Text>
          {candidates.length === 0 ? (
            <Typography.Text size="small" type="secondary">
              Нет доступных игроков
            </Typography.Text>
          ) : (
            candidates.map((c) => (
              <label
                key={c.playerId}
                className={mobileCardCls}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={killerIds.includes(c.playerId)}
                  onChange={() => toggleKiller(c.playerId)}
                />
                <Typography.Text size="small">
                  {c.tournamentPlayerId} · {c.playerName}
                </Typography.Text>
              </label>
            ))
          )}
        </Box>
      )}

      <Box flex={{ gap: 2, width: "100%" }}>
        <Button
          type="secondary"
          size="medium"
          flexItem={{ flex: 1 }}
          disabled={busy !== null}
          onClick={onBack}
        >
          Назад
        </Button>
        <Button
          type={view === "out" ? "error" : "primary"}
          size="medium"
          flexItem={{ flex: 1 }}
          loading={busy === "elim-Out" || busy === "elim-Rebuy"}
          disabled={busy !== null || !canSubmit}
          onClick={onSubmit}
        >
          {view === "out" ? "Записать аут" : "Записать ребай"}
        </Button>
      </Box>
    </>
  );
};
