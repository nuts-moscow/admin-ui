"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { BlindList } from "@/app/settings/SettingsPageView/components/StructuresView/CreateStructureModal/BlindList/BlindList";
import { Blinds } from "@/core/states/tournamentStructures/common/BlindType";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";
import { updateStructure } from "@/core/states/tournaments/requests/updateTournament";

export interface TournamentInfoFormProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentInfoForm: FC<TournamentInfoFormProps> = ({ tournament }) => {
  const environment = useEnvironment();
  const [blinds, setBlinds] = useState<Blinds | undefined>(
    tournament.structure?.blindsStructure
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!tournament.structure || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await updateStructure(
        environment,
        {
          id: tournament.id,
          name: tournament.name,
          date: tournament.date,
          status: tournament.status,
          structure: {
            name: tournament.structure.name,
            playersLimit: tournament.structure.playersLimit,
            stackSize: tournament.structure.stackSize,
            freezeOutEnabled: tournament.structure.freezeOutEnabled,
            ...(tournament.structure.maxReentries != null &&
            Number.isFinite(tournament.structure.maxReentries)
              ? { maxReentries: tournament.structure.maxReentries }
              : {}),
            blindsStructure: tournament.structure.blindsStructure,
          },
        },
        blinds
      );
      refetchTournament();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box flex={{ col: true, align: "center", gap: 4, width: "100%" }}>
      <Box
        flex={{ col: true, gap: 4, width: "100%" }}
        style={{
          maxWidth: 760,
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          backgroundColor: "#fff",
          padding: "20px 24px",
        }}
      >
        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">Имя турнира:</Typography.Text>
          <Typography.Text>{tournament.name}</Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">
            Максимальное количество игроков:
          </Typography.Text>
          <Typography.Text>{tournament.structure?.playersLimit ?? "-"}</Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">Стартовый стек:</Typography.Text>
          <Typography.Text>{tournament.structure?.stackSize ?? "-"}</Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">Финал игры:</Typography.Text>
          <Typography.Text>
            {tournament.structure?.freezeOutEnabled ? "Да" : "Нет"}
          </Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">
            Макс. реентри (в шаблоне):
          </Typography.Text>
          <Typography.Text>
            {tournament.structure?.freezeOutEnabled
              ? "— (freeze-out)"
              : tournament.structure?.maxReentries != null
                ? tournament.structure.maxReentries
                : "по ум. 5"}
          </Typography.Text>
        </Box>

        <BlindList value={blinds} onChange={setBlinds} />
      </Box>
      <Button
        type="success"
        size="medium"
        onClick={handleSave}
        loading={isSaving}
        disabled={!tournament.structure}
      >
        Сохранить
      </Button>
    </Box>
  );
};
