"use client";

import { FC, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Input } from "@/components/Input/Input";
import { toast } from "@/components/Toast/Toast";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import {
  useTournamentPlayerState,
  refetchTournamentPlayerState,
} from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { patchPlayerRatingManualAdjustment } from "@/core/states/tournaments/requests/patchPlayerRatingManualAdjustment";
import { patchTournamentPlayerRatingNonPlacement } from "@/core/states/tournaments/requests/patchTournamentPlayerRatingNonPlacement";
import {
  sortTournamentResultsRows,
  displayPlaceNumber,
} from "../TournamentResults/tournamentResultsCopyText";
import { buildTournamentRatingTableCopyText } from "./tournamentRatingCopyText";
import { Copy } from "lucide-react";

/** Место | Игрок | За место | Баунти | Доп. баллы | Корректировка | Итого */
const GRID_COMPLETED =
  "52px minmax(140px, 1fr) 72px 72px 88px 120px 92px";
/** Место | Игрок | За место | Баунти | Доп. баллы | Изменение | Итого */
const GRID_LIVE =
  "52px minmax(140px, 1fr) 72px 72px 88px minmax(200px, 1.2fr) 88px";

const NEGATIVE_DELTA_CONFIRM_THRESHOLD = 10;

function formatRatingNumber(n: number | undefined | null): string {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return v.toLocaleString("ru-RU");
}

function nonPlacementDisplay(row: InGamePlayerState): number {
  return (
    row.ratingNonPlacementAccrued ?? row.rating?.nonPlacementAccrued ?? 0
  );
}

function displayTotalPoints(row: InGamePlayerState): number {
  const r = row.rating;
  if (r != null) {
    return r.totalPoints;
  }
  return nonPlacementDisplay(row);
}

function displayFromTable(row: InGamePlayerState): number {
  return row.rating?.fromTable ?? 0;
}

function displayBounty(row: InGamePlayerState): number {
  return row.rating?.bounty ?? 0;
}

interface AdjustRowProps {
  player: InGamePlayerState;
  tournamentId: number;
  onSaved: () => void;
}

const AdjustRow: FC<AdjustRowProps> = ({ player, tournamentId, onSaved }) => {
  const environment = useEnvironment();
  const [value, setValue] = useState(
    String(player.rating?.manualAdjustment ?? 0),
  );
  const [saving, setSaving] = useState(false);
  const isDirty = value !== String(player.rating?.manualAdjustment ?? 0);

  const handleSave = async () => {
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed)) {
      toast({ type: "error", message: "Введите корректное число" });
      return;
    }
    setSaving(true);
    try {
      await patchPlayerRatingManualAdjustment(
        environment,
        tournamentId,
        player.tournamentPlayerId,
        parsed,
      );
      onSaved();
      toast({ type: "success", message: "Корректировка сохранена" });
    } catch (error) {
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Ошибка сохранения",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box flex={{ align: "center", gap: 2 }}>
      <Box style={{ width: 88 }}>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="small"
          type="primary"
        />
      </Box>
      <Button
        type={isDirty ? "accent" : "ghost"}
        size="xxSmall"
        onClick={handleSave}
        loading={saving}
        disabled={!isDirty}
      >
        ОК
      </Button>
    </Box>
  );
};

interface NonPlacementAdjustRowProps {
  player: InGamePlayerState;
  tournamentId: number;
  onSaved: () => void;
}

const NonPlacementAdjustRow: FC<NonPlacementAdjustRowProps> = ({
  player,
  tournamentId,
  onSaved,
}) => {
  const environment = useEnvironment();
  const [deltaInput, setDeltaInput] = useState("");
  const [saving, setSaving] = useState(false);

  const applyDelta = async (delta: number) => {
    if (!Number.isFinite(delta) || delta === 0) {
      toast({ type: "error", message: "Укажите ненулевую дельту" });
      return;
    }
    if (
      delta <= -NEGATIVE_DELTA_CONFIRM_THRESHOLD &&
      typeof window !== "undefined" &&
      !window.confirm(
        `Списать ${Math.abs(delta)} баллов с доп. накопителя у «${player.playerName}»?`,
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      await patchTournamentPlayerRatingNonPlacement(
        environment,
        tournamentId,
        player.tournamentPlayerId,
        delta,
      );
      setDeltaInput("");
      onSaved();
      toast({ type: "success", message: "Доп. баллы обновлены" });
    } catch (error) {
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Ошибка сохранения",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box flex={{ align: "center", gap: 1, flexWrap: "wrap" }}>
      <Button
        type="secondary"
        size="xxSmall"
        htmlType="button"
        disabled={saving}
        onClick={() => applyDelta(1)}
      >
        +1
      </Button>
      <Button
        type="secondary"
        size="xxSmall"
        htmlType="button"
        disabled={saving}
        onClick={() => applyDelta(-1)}
      >
        −1
      </Button>
      <Box style={{ width: 64 }}>
        <Input
          value={deltaInput}
          onChange={(e) => setDeltaInput(e.target.value)}
          size="small"
          type="primary"
          placeholder="Δ"
        />
      </Box>
      <Button
        type="accent"
        size="xxSmall"
        htmlType="button"
        loading={saving}
        onClick={() => {
          const parsed = parseFloat(deltaInput.replace(",", "."));
          void applyDelta(parsed);
        }}
      >
        ОК
      </Button>
    </Box>
  );
};

export interface TournamentRatingPlayersProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentRatingPlayers: FC<TournamentRatingPlayersProps> = ({
  tournament,
}) => {
  const tournamentId = String(tournament.id);
  const isCompleted = tournament.status === "Completed";
  const isLive = tournament.status === "InProgress";
  const { data: players = [], loading } =
    useTournamentPlayerState(tournamentId);

  const rows = useMemo(() => {
    const sorted = sortTournamentResultsRows(players, tournament.status);
    return sorted.filter((p) => p.status !== "Registered");
  }, [players, tournament.status]);

  const totalPlayers = players.length;
  const grid = isCompleted ? GRID_COMPLETED : GRID_LIVE;

  const headerCell = (text: string) => (
    <Typography.Text size="small" type="secondary">
      {text}
    </Typography.Text>
  );

  const copyRatingTable = async () => {
    if (rows.length === 0) {
      return;
    }
    const text = buildTournamentRatingTableCopyText(
      rows,
      tournament,
      totalPlayers,
    );
    try {
      await navigator.clipboard.writeText(text);
      toast({
        type: "success",
        message: "Таблица скопирована",
      });
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message: "Не удалось скопировать",
      });
    }
  };

  return (
    <Box
      flex={{ col: true, gap: 0 }}
      style={{
        backgroundColor: "var(--background-primary)",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Typography.Text bold>
          {isCompleted ? "Итоговые баллы игроков" : "Баллы игроков"}
        </Typography.Text>
      </Box>

      <Box
        flex={{ justify: "center" }}
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Button
          type="secondary"
          size="medium"
          iconLeft={<Copy size={18} />}
          onClick={copyRatingTable}
          disabled={rows.length === 0 || loading}
          style={{ minWidth: 220 }}
        >
          Скопировать таблицу
        </Button>
      </Box>

      <Box style={{ overflowX: "auto" }}>
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: grid,
            columnGap: 12,
            padding: "10px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            minWidth: isCompleted ? 780 : 720,
          }}
        >
          {headerCell("Место")}
          {headerCell("Игрок")}
          {headerCell("За место")}
          {headerCell("Баунти")}
          {headerCell("Доп. баллы")}
          {isLive && headerCell("Изменение")}
          {isCompleted && headerCell("Корректировка")}
          {headerCell("Итого")}
        </Box>

        {loading && rows.length === 0 && (
          <Box style={{ padding: "24px 16px" }}>
            <Typography.Text type="secondary" size="small">
              Загрузка…
            </Typography.Text>
          </Box>
        )}

        {!loading && rows.length === 0 && (
          <Box style={{ padding: "24px 16px" }}>
            <Typography.Text type="secondary" size="small">
              Нет участников
            </Typography.Text>
          </Box>
        )}

        {rows.map((row) => {
          const place = displayPlaceNumber(
            row.placement,
            totalPlayers,
            tournament.status,
          );
          const np = nonPlacementDisplay(row);
          return (
            <Box
              key={row.tournamentPlayerId}
              style={{
                display: "grid",
                gridTemplateColumns: grid,
                columnGap: 12,
                padding: "10px 16px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                alignItems: "center",
                minWidth: isCompleted ? 780 : 720,
              }}
            >
              <Typography.Text>{place ?? "—"}</Typography.Text>
              <Typography.Text>{row.playerName}</Typography.Text>
              <Typography.Text>
                {formatRatingNumber(displayFromTable(row))}
              </Typography.Text>
              <Typography.Text>
                {formatRatingNumber(displayBounty(row))}
              </Typography.Text>
              <Typography.Text>{formatRatingNumber(np)}</Typography.Text>
              {isLive && (
                <NonPlacementAdjustRow
                  player={row}
                  tournamentId={tournament.id}
                  onSaved={refetchTournamentPlayerState}
                />
              )}
              {isCompleted && (
                <AdjustRow
                  player={row}
                  tournamentId={tournament.id}
                  onSaved={refetchTournamentPlayerState}
                />
              )}
              <Typography.Text bold>
                {formatRatingNumber(displayTotalPoints(row))}
              </Typography.Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
