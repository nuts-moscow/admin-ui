"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Copy } from "lucide-react";
import { toast } from "@/components/Toast/Toast";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useTournament } from "@/core/states/tournaments/hooks/useTournament";
import { useTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { buildTelegramParticipantsListText } from "../TournamentPlayers/buildTelegramParticipantsList";
import { buildTournamentResultsCopyText } from "../TournamentResults/tournamentResultsCopyText";

export interface TournamentSocialProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentSocial: FC<TournamentSocialProps> = ({
  tournament,
}) => {
  const tournamentId = String(tournament.id);
  const { data: liveTournament } = useTournament(tournamentId);
  const tournamentStatus = liveTournament?.status ?? tournament.status;
  const { data: allPlayers = [] } = useTournamentPlayerState(tournamentId);

  const copyTgParticipantsList = async () => {
    if (allPlayers.length === 0) {
      return;
    }
    const text = buildTelegramParticipantsListText({
      players: allPlayers,
      playersLimit: tournament.structure?.playersLimit,
    });
    try {
      await navigator.clipboard.writeText(text);
      toast({
        type: "success",
        message: "Список для анонса скопирован",
      });
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        message: "Не удалось скопировать список",
      });
    }
  };

  const copyResults = async () => {
    const text = buildTournamentResultsCopyText(allPlayers, tournamentStatus);
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
    <Box flex={{ col: true, gap: 6, width: "100%" }}>
      <Typography.Text type="secondary" size="small">
        Тексты для публикации в соцсетях и мессенджерах.
      </Typography.Text>
      <Box flex={{ col: true, gap: 3, width: "100%" }}>
        <Button
          type="secondary"
          size="medium"
          iconLeft={<Copy />}
          onClick={copyTgParticipantsList}
          disabled={allPlayers.length === 0}
          style={{ width: "100%" }}
        >
          Скопировать список участников для анонса (Telegram)
        </Button>
        <Button
          type="secondary"
          size="medium"
          iconLeft={<Copy />}
          onClick={copyResults}
          disabled={allPlayers.length === 0}
          style={{ width: "100%" }}
        >
          Скопировать результаты игры с местами
        </Button>
      </Box>
    </Box>
  );
};
