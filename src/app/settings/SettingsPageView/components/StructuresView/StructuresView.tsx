import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { StructureCard } from "@/app/settings/SettingsPageView/components/StructuresView/StructureCard/StructureCard";
import { CreateStructureModal } from "./CreateStructureModal/CreateStructureModal";
import { useMemo } from "react";
import { useModal } from "@/components/Modal/Modal";
import { TournamentStructure } from "@/core/states/tournamentStructures/common/TournamentStructure";
import { useTournamentStructures } from "@/core/states/tournamentStructures/hooks/useTournamentStructures";

export interface StructuresViewProps {
  readonly searchQuery: string;
  readonly initialTournamentStructures: TournamentStructure[];
}

export const StructuresView = ({
  searchQuery,
  initialTournamentStructures,
}: StructuresViewProps) => {
  const [CreateStructureModalConnect, openCreateStructureModal] =
    useModal(CreateStructureModal);
  const { data: clientTournamentStructures } = useTournamentStructures();

  const tournamentStructures = useMemo(() => {
    return clientTournamentStructures || initialTournamentStructures;
  }, [clientTournamentStructures, initialTournamentStructures]);

  const filteredStructures = useMemo(() => {
    if (tournamentStructures.length === 0) {
      return [];
    }
    if (searchQuery === "") {
      return tournamentStructures;
    }
    return tournamentStructures.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tournamentStructures]);

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <CreateStructureModalConnect />
      <Button
        type="primary"
        size="medium"
        onClick={() => openCreateStructureModal()}
      >
        Создать формат
      </Button>
      <Box flex={{ col: true, gap: 2, width: "100%" }}>
        {filteredStructures.map((structure) => (
          <StructureCard key={structure.id} structure={structure} />
        ))}
      </Box>
    </Box>
  );
};
