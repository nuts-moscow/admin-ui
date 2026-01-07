import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { PlayerCard } from "@/app/settings/SettingsPageView/components/PlayersView/PlayerCard/PlayerCard";
import { CreatePlayerModal } from "./CreatePlayerModal/CreatePlayerModal";
import { useMemo, useState } from "react";
import { useModal } from "@/components/Modal/Modal";
import { Player } from "@/core/states/players/common/Player";
import { usePlayers } from "@/core/states/players/hooks/usePlayers";

export interface PlayersViewProps {
  readonly searchQuery: string;
  readonly initialPlayers: Player[];
}

export const PlayersView = ({
  searchQuery,
  initialPlayers,
}: PlayersViewProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(
    undefined
  );
  const [CreatePlayerModalConnect, openCreatePlayerModal] =
    useModal(CreatePlayerModal);
  const { data: clientPlayers } = usePlayers();

  const players = useMemo(() => {
    return clientPlayers || initialPlayers;
  }, [clientPlayers, initialPlayers]);

  const filteredPlayers = useMemo(() => {
    if (players.length === 0) {
      return [];
    }
    if (searchQuery === "") {
      return players;
    }
    return players.filter(
      (p) =>
        p.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, players]);

  const openPlayerModal = (player: Player) => {
    setSelectedPlayer(player);
    openCreatePlayerModal();
  };

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <CreatePlayerModalConnect player={selectedPlayer} />
      <Button
        type="primary"
        size="medium"
        onClick={() => openCreatePlayerModal()}
      >
        Создать игрока
      </Button>
      <Box flex={{ col: true, gap: 2, width: "100%" }}>
        {filteredPlayers.map((player) => (
          <PlayerCard
            onClick={() => openPlayerModal(player)}
            key={player.id}
            player={player}
          />
        ))}
      </Box>
    </Box>
  );
};
