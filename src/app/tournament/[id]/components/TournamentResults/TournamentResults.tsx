"use client";

import { FC, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Modal, useModal } from "@/components/Modal/Modal";
import { toast } from "@/components/Toast/Toast";
import { Typography } from "@/components/Typography/Typography";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { bountyRemove } from "@/core/states/tournaments/requests/bountyRemove";
import {
  BountyKillEntry,
  TournamentPlayerResult,
} from "@/core/states/tournaments/requests/getTournamentFinalResults";
import { useTournamentFinalResults } from "@/core/states/tournaments/hooks/useTournamentFinalResults";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { Copy, X } from "lucide-react";

export interface TournamentResultsProps {
  readonly tournament: TournamentInfoResponse;
}

const GRID_TEMPLATE =
  "64px 56px minmax(180px, 1fr) minmax(180px, 1fr) 140px 140px";

interface BountyListModalProps {
  close: () => void;
  initialData?: TournamentPlayerResult | null;
  tournamentId: string;
  allPlayers: TournamentPlayerResult[];
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
  const killerPlayerId = row ? String(row.playerId) : "";
  const killerPlayerName = row?.playerName ?? "";

  const getVictimDisplay = (kill: BountyKillEntry) => {
    const id = kill.playerId ?? "";
    const victim = allPlayers.find(
      (p) => String(p.playerId) === String(id),
    );
    return {
      name: victim?.playerName ?? kill.playerName ?? "-",
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
                const { name } = getVictimDisplay(kill);
                return (
                  <Box
                    key={`${kill.playerId}-${index}`}
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
                    onClick={() => handleRemove(kill.playerId)}
                    disabled={removingId !== null}
                    loading={removingId === kill.playerId}
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
  initialData?: TournamentPlayerResult | null;
  tournamentId: string;
  allPlayers: TournamentPlayerResult[];
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
  const eliminatedByIds = row?.eliminatedBy ?? [];
  const victimPlayerId = row ? String(row.playerId) : "";

  const getKillerInfo = (id: string) => {
    const killer = allPlayers.find(
      (p) => String(p.playerId) === String(id),
    );
    return {
      name: killer?.playerName ?? id,
      killerPlayerId: killer ? String(killer.playerId) : String(id),
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

export const TournamentResults: FC<TournamentResultsProps> = ({
  tournament,
}) => {
  const { data, loading, refetch } = useTournamentFinalResults(
    String(tournament.id),
  );
  const [BountyModal, openBountyModal] = useModal(BountyListModal);
  const [EliminatedByModalConnect, openEliminatedByModal] =
    useModal(EliminatedByModal);

  const rows = useMemo(
    () => [...(data?.results ?? [])].sort((a, b) => a.placement - b.placement),
    [data?.results]
  );

  const copyResults = async () => {
    const text = rows
      .map(
        (row) =>
          `${row.placement}. ${row.playerName} — Баунти: ${row.bountyCount}`
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
        tournamentId={String(tournament.id)}
        allPlayers={rows}
        onRemoved={() => refetch(String(tournament.id))}
      />
      <EliminatedByModalConnect
        tournamentId={String(tournament.id)}
        allPlayers={rows}
        onRemoved={() => refetch(String(tournament.id))}
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
            }}
          >
            <Typography.Text>{row.placement}</Typography.Text>
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
            <Typography.Text>{row.bountyCount} Баунти</Typography.Text>
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
