"use client";

import { FC, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Modal, WithModalProps, useModal } from "@/components/Modal/Modal";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/SearchableSelect/SearchableSelect";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { usePlayers } from "@/core/states/players/hooks/usePlayers";
import {
  refetchTournamentPlayerState,
  useTournamentPlayerState,
} from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { addPlayerToTournament } from "@/core/states/tournaments/requests/addPlayerToTournament";

export interface AddPlayerButtonProps {
  readonly tournamentId: string;
}

interface AddPlayerModalContentProps extends WithModalProps {
  readonly tournamentId: string;
}

const AddPlayerModalContent: FC<AddPlayerModalContentProps> = ({
  close,
  tournamentId,
}) => {
  const environment = useEnvironment();
  const { data: players } = usePlayers();
  const { data: tournamentPlayers } = useTournamentPlayerState(tournamentId);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | undefined>(
    undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const availablePlayers = useMemo(() => {
    const tournamentPlayerIds = new Set(
      (tournamentPlayers ?? []).map((player) => player.playerId)
    );
    return (players ?? []).filter(
      (player) => !tournamentPlayerIds.has(String(player.id))
    );
  }, [players, tournamentPlayers]);
  const availablePlayerOptions = useMemo<SearchableSelectOption[]>(
    () =>
      availablePlayers.map((player) => ({
        value: String(player.id),
        label: `${player.nickname}${player.name ? ` (${player.name})` : ""}`,
      })),
    [availablePlayers]
  );

  const handleSave = async () => {
    if (!selectedPlayerId || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await addPlayerToTournament(environment, tournamentId, selectedPlayerId, {
        EarlyBirdFlag: false,
      });
      refetchTournamentPlayerState();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Добавить игрока</Modal.Title>
      <Modal.Content minWidth={480}>
        <Box flex={{ col: true, gap: 4 }}>
          <SearchableSelect
            options={availablePlayerOptions}
            value={selectedPlayerId ? String(selectedPlayerId) : undefined}
            placeholder="Выберите игрока"
            onChange={(newValue) =>
              setSelectedPlayerId(newValue ? Number(newValue) : undefined)
            }
            disabled={isSaving}
          />

          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleSave}
              flexItem={{ flex: 1 }}
              disabled={!selectedPlayerId}
              loading={isSaving}
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

export const AddPlayerButton: FC<AddPlayerButtonProps> = ({ tournamentId }) => {
  const [AddPlayerModal, openAddPlayerModal] = useModal(AddPlayerModalContent);

  return (
    <>
      <AddPlayerModal tournamentId={tournamentId} />
      <Button type="secondary" size="xxSmall" onClick={() => openAddPlayerModal()}>
        Добавить игрока
      </Button>
    </>
  );
};