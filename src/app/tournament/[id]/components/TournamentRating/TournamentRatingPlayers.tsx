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
import {
  sortTournamentResultsRows,
  displayPlaceNumber,
} from "../TournamentResults/tournamentResultsCopyText";
import { buildTournamentRatingTableCopyText } from "./tournamentRatingCopyText";
import { Copy } from "lucide-react";

const GRID =
  "52px minmax(140px, 1fr) 80px 80px 120px 100px";
const GRID_LIVE =
  "52px minmax(140px, 1fr) 80px 80px 100px";

function formatRatingNumber(n: number | undefined | null): string {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return v.toLocaleString("ru-RU");
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

export interface TournamentRatingPlayersProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentRatingPlayers: FC<TournamentRatingPlayersProps> = ({
  tournament,
}) => {
  const tournamentId = String(tournament.id);
  const isCompleted = tournament.status === "Completed";
  const { data: players = [], loading } =
    useTournamentPlayerState(tournamentId);

  const rows = useMemo(() => {
    const sorted = sortTournamentResultsRows(players, tournament.status);
    if (isCompleted) {
      return sorted.filter((p) => p.rating != null);
    }
    return sorted.filter(
      (p) => p.status === "Out" || p.status === "OutNotPaid",
    ).filter((p) => p.rating != null);
  }, [players, tournament.status, isCompleted]);

  const totalPlayers = players.length;
  const grid = isCompleted ? GRID : GRID_LIVE;

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
          {isCompleted
            ? "Итоговые баллы игроков"
            : "Баллы вылетевших игроков"}
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
            minWidth: isCompleted ? 640 : 560,
          }}
        >
          {headerCell("Место")}
          {headerCell("Игрок")}
          {headerCell("За место")}
          {headerCell("Баунти")}
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
              {isCompleted
                ? "Нет данных рейтинга"
                : "Нет вылетевших игроков с рейтинговым снимком"}
            </Typography.Text>
          </Box>
        )}

        {rows.map((row) => {
          const rating = row.rating!;
          const place = displayPlaceNumber(
            row.placement,
            totalPlayers,
            tournament.status,
          );
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
                minWidth: isCompleted ? 640 : 560,
              }}
            >
              <Typography.Text>{place ?? "—"}</Typography.Text>
              <Typography.Text>{row.playerName}</Typography.Text>
              <Typography.Text>
                {formatRatingNumber(rating.fromTable)}
              </Typography.Text>
              <Typography.Text>
                {formatRatingNumber(rating.bounty)}
              </Typography.Text>
              {isCompleted && (
                <AdjustRow
                  player={row}
                  tournamentId={tournament.id}
                  onSaved={refetchTournamentPlayerState}
                />
              )}
              <Typography.Text bold>
                {formatRatingNumber(rating.totalPoints)}
              </Typography.Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
