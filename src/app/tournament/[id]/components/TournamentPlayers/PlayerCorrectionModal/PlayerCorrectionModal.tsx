"use client";

import { FC, useEffect, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import { Typography } from "@/components/Typography/Typography";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { formatBountyCount } from "@/core/states/tournaments/common/formatBountyCount";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { refetchTournamentRebuyCount } from "@/core/states/tournaments/hooks/useTournamentRebuyCount";
import { tournamentPlayerBountyRemove } from "@/core/states/tournaments/requests/tournamentPlayerBountyRemove";
import { toast } from "@/components/Toast/Toast";

export interface PlayerCorrectionModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

const reentryConflictHint =
  "Совет: сначала уменьшите число учтённых реентри в оплатах.";

function shouldSuggestReentryHint(message: string): boolean {
  return /reentr|reentry|ребай|реентр/i.test(message);
}

export const PlayerCorrectionModal: FC<PlayerCorrectionModalProps> = ({
  close,
  tournamentId,
  player,
}) => {
  const environment = useEnvironment();
  const [bountyRemoveInput, setBountyRemoveInput] = useState("");
  const [reentryRemoveInput, setReentryRemoveInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBountyRemoveInput("");
    setReentryRemoveInput("");
  }, [player?.playerId]);

  const handleSubmit = async () => {
    if (!player || loading) {
      return;
    }
    const bountyTrim = bountyRemoveInput.trim().replace(",", ".");
    const reentryTrim = reentryRemoveInput.trim();

    let bountyCountToRemove: number | undefined;
    if (bountyTrim !== "") {
      const b = Number.parseFloat(bountyTrim);
      if (!Number.isFinite(b) || b <= 0) {
        toast({
          type: "error",
          message: "Укажите положительное число для снятия баунти или оставьте пустым",
        });
        return;
      }
      bountyCountToRemove = b;
    }

    let reentryCountToRemove: number | undefined;
    if (reentryTrim !== "") {
      const r = Number.parseInt(reentryTrim, 10);
      if (!Number.isFinite(r) || r < 1) {
        toast({
          type: "error",
          message: "Укажите целое число реентри ≥ 1 или оставьте поле пустым",
        });
        return;
      }
      reentryCountToRemove = r;
    }

    if (bountyCountToRemove == null && reentryCountToRemove == null) {
      toast({
        type: "error",
        message: "Укажите снятие баунти и/или число реентри к снятию",
      });
      return;
    }

    setLoading(true);
    try {
      await tournamentPlayerBountyRemove(
        environment,
        Number(tournamentId),
        player.playerId,
        {
          ...(bountyCountToRemove != null ? { bountyCountToRemove } : {}),
          ...(reentryCountToRemove != null ? { reentryCountToRemove } : {}),
        },
      );
      refetchTournamentPlayerState();
      refetchTournamentRebuyCount();
      toast({ type: "success", message: "Коррекция применена" });
      close();
    } catch (error) {
      console.error(error);
      const raw =
        error instanceof Error ? error.message : "Не удалось применить коррекцию";
      const message = shouldSuggestReentryHint(raw)
        ? `${raw} ${reentryConflictHint}`
        : raw;
      toast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Коррекция</Modal.Title>
      <Modal.Content minWidth={440}>
        <Box flex={{ col: true, gap: 4 }}>
          {player ? (
            <Box flex={{ col: true, gap: 1 }}>
              <Typography.Text bold>{player.playerName || "—"}</Typography.Text>
              <Typography.Text type="secondary" size="small">
                Сейчас: баунти {formatBountyCount(player.bountyCount)}, реентри{" "}
                {player.totalReentryCount}
              </Typography.Text>
            </Box>
          ) : null}

          <Input
            rounded
            label="Снять баунти (доля, можно дробь)"
            value={bountyRemoveInput}
            onChange={(e) => setBountyRemoveInput(e.target.value)}
            disabled={!player || loading}
          />
          <Input
            rounded
            label="Снять реентри (целое число учтённых ребаев)"
            value={reentryRemoveInput}
            onChange={(e) => setReentryRemoveInput(e.target.value)}
            disabled={!player || loading}
          />

          <Typography.Text type="secondary" size="xSmall">
            Ручная коррекция счётчиков: не синхронизируется с выбиваниями и
            историей eliminate. Снятие реентри не меняет записи в баунти,
            eliminate и kill-листах.
          </Typography.Text>

          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleSubmit}
              flexItem={{ flex: 1 }}
              loading={loading}
              disabled={!player}
            >
              Применить
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};
