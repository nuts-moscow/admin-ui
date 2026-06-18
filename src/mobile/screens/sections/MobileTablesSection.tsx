"use client";

import { FC, useMemo, useState } from "react";
import { Typography } from "@/components/Typography/Typography";
import { Box } from "@/components/Box/Box";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { mobileCardCls } from "../../mobile.css";
import { PlayerActionSheet } from "./PlayerActionSheet";

const isActive = (p: InGamePlayerState) =>
  p.status === "InGamePaid" || p.status === "InGameNotPaid";

interface TableGroup {
  readonly key: string;
  readonly label: string;
  readonly players: InGamePlayerState[];
}

export const MobileTablesSection: FC<{ tournamentId: string }> = ({
  tournamentId,
}) => {
  const { data: players = [] } = useTournamentPlayerState(tournamentId);
  const [selected, setSelected] = useState<InGamePlayerState | null>(null);

  const groups = useMemo<TableGroup[]>(() => {
    const active = players.filter(isActive);
    const byTable = new Map<string, InGamePlayerState[]>();
    for (const p of active) {
      const key = p.tableId != null ? String(p.tableId) : "__none__";
      const list = byTable.get(key) ?? [];
      list.push(p);
      byTable.set(key, list);
    }
    const seated = [...byTable.entries()]
      .filter(([key]) => key !== "__none__")
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([key, list]) => ({
        key,
        label: `Стол ${key}`,
        players: list,
      }));
    const none = byTable.get("__none__");
    return none && none.length > 0
      ? [...seated, { key: "__none__", label: "Без стола", players: none }]
      : seated;
  }, [players]);

  const selectedLive = selected
    ? players.find((p) => p.playerId === selected.playerId) ?? selected
    : null;

  return (
    <>
      {groups.length === 0 ? (
        <Typography.Text type="secondary" size="small">
          Нет рассаженных игроков
        </Typography.Text>
      ) : (
        groups.map((g) => (
          <Box key={g.key} flex={{ col: true, gap: 2 }}>
            <Typography.Text bold>
              {g.label}{" "}
              <Typography.Text type="secondary" size="small">
                ({g.players.length})
              </Typography.Text>
            </Typography.Text>
            {g.players.map((p) => (
              <button
                key={p.playerId}
                type="button"
                className={mobileCardCls}
                style={{
                  textAlign: "left",
                  width: "100%",
                  cursor: "pointer",
                  font: "inherit",
                  color: "inherit",
                }}
                onClick={() => setSelected(p)}
              >
                <Typography.Text>
                  {p.tournamentPlayerId} · {p.playerName}
                </Typography.Text>
              </button>
            ))}
          </Box>
        ))
      )}
      <PlayerActionSheet
        tournamentId={tournamentId}
        player={selectedLive}
        players={players}
        onClose={() => setSelected(null)}
      />
    </>
  );
};
