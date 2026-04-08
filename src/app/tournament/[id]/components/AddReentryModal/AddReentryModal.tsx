"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import { Typography } from "@/components/Typography/Typography";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { TournamentsStructureResponse } from "@/core/states/tournaments/common/TournamentsStructureResponse";
import { getReentryRemaining } from "@/core/states/tournaments/common/reentryLimits";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import {
  bountyEliminate,
  BountyEliminateBody,
} from "@/core/states/tournaments/requests/bountyEliminate";
import { refetchTournamentRebuyCount } from "@/core/states/tournaments/hooks/useTournamentRebuyCount";

export interface AddReentryModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
  readonly players: InGamePlayerState[];
  readonly reentryStructure?: TournamentsStructureResponse | null;
  /** false, если турнир завершён — без записи выбиваний через ребай. */
  readonly allowBountyEdits?: boolean;
}

const getPlayerLabel = (player?: InGamePlayerState): string => {
  if (!player) {
    return "-";
  }
  return player.playerName || player.playerId || "-";
};

export const AddReentryModal: FC<AddReentryModalProps> = ({
  close,
  tournamentId,
  player,
  players,
  reentryStructure,
  allowBountyEdits = true,
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
    () => (player ? getReentryRemaining(player, reentryStructure) : 0),
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
    setCount((prev) => Math.min(Math.max(1, prev), remainingReentries));
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
    if (!allowBountyEdits) {
      return;
    }
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
          {!allowBountyEdits ? (
            <Typography.Text type="secondary" size="small">
              Турнир завершён — добавление ребаев и выбиваний недоступно.
            </Typography.Text>
          ) : null}
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
              disabled={isSaving || !allowBountyEdits}
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
              disabled={isSaving || !allowBountyEdits}
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
                        disabled={isSaving || !allowBountyEdits}
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
            max={remainingReentries > 0 ? remainingReentries : undefined}
            value={count}
            onChange={(event) => {
              const raw = Number(event.target.value || 1);
              const cap =
                remainingReentries > 0
                  ? remainingReentries
                  : Number.POSITIVE_INFINITY;
              setCount(Math.min(Math.max(1, raw), cap));
            }}
            disabled={isSaving || !allowBountyEdits}
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
                !allowBountyEdits ||
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
