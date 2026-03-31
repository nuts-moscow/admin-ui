"use client";

import { FC, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Modal, useModal } from "@/components/Modal/Modal";
import { toast } from "@/components/Toast/Toast";
import { Typography } from "@/components/Typography/Typography";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  BountyKillEntry,
  InGamePlayerState,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { formatBountyCount } from "@/core/states/tournaments/common/formatBountyCount";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { bountyEliminateUndo } from "@/core/states/tournaments/requests/bountyEliminate";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { Copy, X } from "lucide-react";

export interface TournamentResultsProps {
  readonly tournament: TournamentInfoResponse;
}

const GRID_TEMPLATE =
  "64px 56px minmax(180px, 1fr) minmax(180px, 1fr) 140px 140px";

interface BountyListModalProps {
  close: () => void;
  initialData?: InGamePlayerState | null;
  tournamentId: string;
  allPlayers: InGamePlayerState[];
  onRemoved: () => void;
}

const BountyListModal: FC<BountyListModalProps> = ({
  close,
  initialData: row,
  tournamentId,
  allPlayers,
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
    allPlayers.find((p) => String(p.playerId) === String(id))?.playerName ?? id;

  const getVictimDisplay = (kill: BountyKillEntry | string) => {
    const id =
      typeof kill === "string" ? kill : String(kill.playerId ?? "");
    const victim = allPlayers.find(
      (p) => String(p.playerId) === String(id),
    );
    const nameFromKill =
      typeof kill === "object" && kill && "playerName" in kill
        ? kill.playerName
        : undefined;
    const eventId =
      typeof kill === "object" && kill && "eventId" in kill
        ? kill.eventId
        : undefined;
    return {
      name: victim?.playerName ?? nameFromKill ?? "-",
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
  allPlayers: InGamePlayerState[];
  onRemoved: () => void;
}

const EliminatedByModal: FC<EliminatedByModalProps> = ({
  close,
  initialData: row,
  tournamentId,
  allPlayers,
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
      .map((id) => allPlayers.find((p) => String(p.playerId) === String(id)))
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
              const killer = allPlayers.find(
                (p) => String(p.playerId) === String(id),
              );
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

export const TournamentResults: FC<TournamentResultsProps> = ({
  tournament,
}) => {
  const tournamentId = String(tournament.id);
  const { data: players = [], loading } = useTournamentPlayerState(tournamentId);
  const [BountyModal, openBountyModal] = useModal(BountyListModal);
  const [EliminatedByModalConnect, openEliminatedByModal] =
    useModal(EliminatedByModal);

  const rows = useMemo(() => {
    const list = [...players];
    const noPlacement = list.filter((r) => r.placement == null);
    const withPlacement = list.filter((r) => r.placement != null);
    const byTournamentPlayerId = (a: InGamePlayerState, b: InGamePlayerState) => {
      const idA = a.tournamentPlayerId ?? a.playerId;
      const idB = b.tournamentPlayerId ?? b.playerId;
      const nA = typeof idA === "number" ? idA : parseInt(String(idA), 10) || 0;
      const nB = typeof idB === "number" ? idB : parseInt(String(idB), 10) || 0;
      if (nA !== nB) return nA - nB;
      return String(idA).localeCompare(String(idB));
    };
    const byPlacementDesc = (a: InGamePlayerState, b: InGamePlayerState) =>
      (b.placement ?? 0) - (a.placement ?? 0);
    noPlacement.sort(byTournamentPlayerId);
    withPlacement.sort(byPlacementDesc);
    return [...noPlacement, ...withPlacement];
  }, [players]);

  const totalPlayers = rows.length;
  const placeNumber = (placement: number | null | undefined) =>
    placement != null ? totalPlayers - placement + 1 : null;

  const copyResults = async () => {
    const text = rows
      .map(
        (row) =>
          `${placeNumber(row.placement) ?? "-"}. ${row.playerName} — Баунти: ${formatBountyCount(row.bountyCount)}`
      )
      .join("\n");
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast({
        type: "success",
        message: "Результаты скопированы",
      });
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message: "Не удалось скопировать результаты",
      });
    }
  };

  return (
    <Box
      flex={{ col: true, gap: 6, width: "100%" }}
      style={{
        backgroundColor: "#e9e9e9",
        borderRadius: 16,
        padding: 16,
        minHeight: 420,
      }}
    >
      <BountyModal
        tournamentId={tournamentId}
        allPlayers={rows}
        onRemoved={refetchTournamentPlayerState}
      />
      <EliminatedByModalConnect
        tournamentId={tournamentId}
        allPlayers={rows}
        onRemoved={refetchTournamentPlayerState}
      />
      <Box flex={{ justify: "center", width: "100%" }}>
        <Button
          type="secondary"
          size="medium"
          iconLeft={<Copy />}
          onClick={copyResults}
          disabled={rows.length === 0}
          style={{ minWidth: 240 }}
        >
          Скопировать
        </Button>
      </Box>

      <Box
        flex={{ col: true, width: "100%" }}
        style={{
          backgroundColor: "var(--background-primary)",
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: GRID_TEMPLATE,
            alignItems: "center",
            columnGap: 12,
            padding: "14px 12px",
          }}
        >
          <Typography.Text size="small" type="secondary">
            #
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            {" "}
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            Никнейм
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            Имя
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            Баунти
          </Typography.Text>
          <Typography.Text size="small" type="secondary">
            Действия
          </Typography.Text>
        </Box>

        {rows.map((row) => (
          <Box
            key={String(row.playerId)}
            style={{
              display: "grid",
              gridTemplateColumns: GRID_TEMPLATE,
              alignItems: "center",
              columnGap: 12,
              padding: "10px 12px",
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
              backgroundColor:
                row.signAgreement === false ? "rgba(255, 196, 2, 0.22)" : undefined,
            }}
          >
            <Typography.Text>
              {placeNumber(row.placement) ?? "—"}
            </Typography.Text>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#e4e4e4",
              }}
            />
            <Typography.Text>{row.playerName}</Typography.Text>
            <Typography.Text type="secondary">-</Typography.Text>
            <Typography.Text>
              {formatBountyCount(row.bountyCount)} Баунти
            </Typography.Text>
            <Box flex={{ gap: 2 }}>
              <Button
                type="secondary"
                size="xxSmall"
                onClick={() => openBountyModal(row)}
              >
                Показать баунти
              </Button>
              <Button
                type="secondary"
                size="xxSmall"
                onClick={() => openEliminatedByModal(row)}
              >
                Кто меня выбил
              </Button>
            </Box>
          </Box>
        ))}

        {!loading && rows.length === 0 && (
          <Box
            style={{
              width: "100%",
              minHeight: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography.Text type="secondary">Нет результатов</Typography.Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
