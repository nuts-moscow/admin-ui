"use client";

import type { CSSProperties } from "react";
import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { updateTournamentPlayerFreeEntries } from "@/core/states/tournaments/requests/updateTournamentPlayerFreeEntries";
import { updateTournamentPlayerFreeReentries } from "@/core/states/tournaments/requests/updateTournamentPlayerFreeReentries";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { toast } from "@/components/Toast/Toast";
import { formatApiErrorForUser } from "@/core/utils/misc/formatApiErrorForUser";

const parseDelta = (value: string): number | null => {
  const s = value.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const inputStyle: CSSProperties = {
  width: 72,
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  padding: "4px 6px",
  fontSize: 12,
  backgroundColor: "var(--background-primary)",
  color: "var(--text-primary)",
};

export interface TournamentPlayerFreeCountersProps {
  readonly tournamentId: string;
  readonly row: InGamePlayerState;
}

export const TournamentPlayerFreeCounters: FC<TournamentPlayerFreeCountersProps> = ({
  tournamentId,
  row,
}) => {
  const environment = useEnvironment();
  const [entryInput, setEntryInput] = useState("");
  const [reentryInput, setReentryInput] = useState("");
  const [entryLoading, setEntryLoading] = useState(false);
  const [reentryLoading, setReentryLoading] = useState(false);

  const entryCount = row.tournamentFreeEntryCount ?? 0;
  const reentryCount = row.tournamentFreeReentryCount ?? 0;

  const handleEntry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const delta = parseDelta(entryInput);
    if (delta === null || delta === 0) return;
    setEntryLoading(true);
    try {
      await updateTournamentPlayerFreeEntries(
        environment,
        tournamentId,
        row.playerId,
        delta,
      );
      setEntryInput("");
      refetchTournamentPlayerState();
    } catch (error) {
      toast({
        type: "error",
        message: formatApiErrorForUser(error),
      });
    } finally {
      setEntryLoading(false);
    }
  };

  const handleReentry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const delta = parseDelta(reentryInput);
    if (delta === null || delta === 0) return;
    setReentryLoading(true);
    try {
      await updateTournamentPlayerFreeReentries(
        environment,
        tournamentId,
        row.playerId,
        delta,
      );
      setReentryInput("");
      refetchTournamentPlayerState();
    } catch (error) {
      toast({
        type: "error",
        message: formatApiErrorForUser(error),
      });
    } finally {
      setReentryLoading(false);
    }
  };

  return (
    <Box
      flex={{ col: true, gap: 1 }}
      style={{ minWidth: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Typography.Text size="xxSmall" type="secondary">
        Турнир: беспл. вход
      </Typography.Text>
      <Box flex={{ align: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography.Text size="xSmall">{entryCount}</Typography.Text>
        <input
          type="text"
          value={entryInput}
          onChange={(e) => setEntryInput(e.target.value)}
          placeholder="±n"
          style={inputStyle}
          aria-label="Дельта бесплатного входа в турнире"
        />
        <Button
          type="secondary"
          size="xxSmall"
          onClick={handleEntry}
          loading={entryLoading}
          disabled={!entryInput.trim()}
        >
          OK
        </Button>
      </Box>
      <Typography.Text size="xxSmall" type="secondary">
        Турнир: беспл. ребай
      </Typography.Text>
      <Box flex={{ align: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography.Text size="xSmall">{reentryCount}</Typography.Text>
        <input
          type="text"
          value={reentryInput}
          onChange={(e) => setReentryInput(e.target.value)}
          placeholder="±n"
          style={inputStyle}
          aria-label="Дельта бесплатного ребая в турнире"
        />
        <Button
          type="secondary"
          size="xxSmall"
          onClick={handleReentry}
          loading={reentryLoading}
          disabled={!reentryInput.trim()}
        >
          OK
        </Button>
      </Box>
    </Box>
  );
};
