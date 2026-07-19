"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Player } from "@/core/states/players/common/Player";
import { SimpleList } from "@/components/SimpleList/SimpleList";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { updatePlayerFreeEntries } from "@/core/states/players/requests/updatePlayerFreeEntries";
import { updatePlayerFreeReentries } from "@/core/states/players/requests/updatePlayerFreeReentries";
export interface PlayerCardProps {
  readonly player: Player;
  readonly onClick?: () => void;
  readonly onUpdated?: () => void;
}

const parseDelta = (value: string): number | null => {
  const s = value.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export const PlayerCard: FC<PlayerCardProps> = ({
  player,
  onClick,
  onUpdated,
}) => {
  const environment = useEnvironment();
  const [freeEntriesInput, setFreeEntriesInput] = useState("");
  const [freeReentriesInput, setFreeReentriesInput] = useState("");
  const [freeEntriesLoading, setFreeEntriesLoading] = useState(false);
  const [freeReentriesLoading, setFreeReentriesLoading] = useState(false);

  const handleFreeEntries = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const delta = parseDelta(freeEntriesInput);
    if (delta === null || delta === 0) return;
    setFreeEntriesLoading(true);
    try {
      await updatePlayerFreeEntries(environment, player.id, delta);
      setFreeEntriesInput("");
      onUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setFreeEntriesLoading(false);
    }
  };

  const handleFreeReentries = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const delta = parseDelta(freeReentriesInput);
    if (delta === null || delta === 0) return;
    setFreeReentriesLoading(true);
    try {
      await updatePlayerFreeReentries(environment, player.id, delta);
      setFreeReentriesInput("");
      onUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setFreeReentriesLoading(false);
    }
  };

  return (
    <SimpleList.Card
      onClick={onClick}
      noAgreement={player.signAgreement !== true}
      rowWrap
    >
      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Никнейм
        </Typography.Text>
        <Typography.Text>{player.nickname}</Typography.Text>
      </SimpleList.Column>

      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Имя
        </Typography.Text>
        <Typography.Text size="small">{player.name || "–"}</Typography.Text>
      </SimpleList.Column>

      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Telegram
        </Typography.Text>
        <Typography.Text size="small">{player.tg || "–"}</Typography.Text>
      </SimpleList.Column>

      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Phone
        </Typography.Text>
        <Typography.Text size="small">{player.phone || "–"}</Typography.Text>
      </SimpleList.Column>

      <Box
        flex={{ col: true, gap: 1 }}
        flexItem={{ minWidth: 140 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography.Text size="small" type="secondary">
          Бесплатные входы
        </Typography.Text>
        <Typography.Text size="small">
          {player.freeEntryCount != null ? player.freeEntryCount : "–"}
        </Typography.Text>
        <Box flex={{ align: "center", gap: 2 }}>
          <input
            type="text"
            value={freeEntriesInput}
            onChange={(e) => setFreeEntriesInput(e.target.value)}
            placeholder="+n или -n"
            style={{
              width: 80,
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              padding: "6px 8px",
              backgroundColor: "var(--background-primary)",
              color: "var(--text-primary)",
            }}
          />
          <Button
            type="secondary"
            size="xxSmall"
            onClick={handleFreeEntries}
            loading={freeEntriesLoading}
            disabled={!freeEntriesInput.trim()}
          >
            Изменить
          </Button>
        </Box>
      </Box>

      <Box
        flex={{ col: true, gap: 1 }}
        flexItem={{ minWidth: 140 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography.Text size="small" type="secondary">
          Бесплатные ребаи
        </Typography.Text>
        <Typography.Text size="small">
          {player.freeReentryCount != null ? player.freeReentryCount : "–"}
        </Typography.Text>
        <Box flex={{ align: "center", gap: 2 }}>
          <input
            type="text"
            value={freeReentriesInput}
            onChange={(e) => setFreeReentriesInput(e.target.value)}
            placeholder="+n или -n"
            style={{
              width: 80,
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              padding: "6px 8px",
              backgroundColor: "var(--background-primary)",
              color: "var(--text-primary)",
            }}
          />
          <Button
            type="secondary"
            size="xxSmall"
            onClick={handleFreeReentries}
            loading={freeReentriesLoading}
            disabled={!freeReentriesInput.trim()}
          >
            Изменить
          </Button>
        </Box>
      </Box>
    </SimpleList.Card>
  );
};
