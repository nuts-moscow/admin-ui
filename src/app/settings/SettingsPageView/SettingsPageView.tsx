"use client";

import { FC, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PageLayout } from "@/components/PageLayout/PageLayout";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { StructureCard } from "@/components/StructureCard/StructureCard";
import { PlayerCard } from "@/components/PlayerCard/PlayerCard";
import { ToggleGroup } from "@/components/ToggleGroup/ToggleGroup";
import { useModal } from "@/components/Modal/Modal";
import { Home } from "lucide-react";
import Link from "next/link";
import { CreateStructureModalContent } from "@/app/settings/SettingsPageView/CreateStructureModal/CreateStructureModal";

interface StructureMock {
  readonly id: number;
  readonly name: string;
  readonly duration: string;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly playersLimit: number;
}

interface PlayerMock {
  readonly id: number;
  readonly name: string;
  readonly phone?: string;
  readonly gamesPlayed: number;
}

const MOCK_STRUCTURES: StructureMock[] = [
  {
    id: 1,
    name: "Стандартный",
    duration: "20 мин",
    smallBlind: 25,
    bigBlind: 50,
    playersLimit: 6,
  },
  {
    id: 2,
    name: "Супер-турбо",
    duration: "20 мин",
    smallBlind: 25,
    bigBlind: 50,
    playersLimit: 10,
  },
  {
    id: 3,
    name: "6-Max",
    duration: "20 мин",
    smallBlind: 25,
    bigBlind: 50,
    playersLimit: 6,
  },
  {
    id: 4,
    name: "Турбо",
    duration: "20 мин",
    smallBlind: 25,
    bigBlind: 50,
    playersLimit: 8,
  },
  {
    id: 5,
    name: "Deep Stack",
    duration: "20 мин",
    smallBlind: 25,
    bigBlind: 50,
    playersLimit: 9,
  },
];

const MOCK_PLAYERS: PlayerMock[] = [
  { id: 1, name: "Игрок 1", phone: "+7 (999) 123-45-67", gamesPlayed: 45 },
  { id: 2, name: "Игрок 2", phone: "+7 (999) 234-56-78", gamesPlayed: 32 },
  { id: 3, name: "Игрок 3", gamesPlayed: 18 },
  { id: 4, name: "Игрок 4", phone: "+7 (999) 456-78-90", gamesPlayed: 67 },
  { id: 5, name: "Игрок 5", gamesPlayed: 12 },
  { id: 6, name: "Игрок 6", phone: "+7 (999) 567-89-01", gamesPlayed: 89 },
];

export const SettingsPageView: FC = () => {
  const [activeTab, setActiveTab] = useState<"structures" | "players">(
    "structures"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [CreateStructureModal, openCreateStructureModal] = useModal(
    CreateStructureModalContent
  );

  const filteredStructures = useMemo(() => {
    return MOCK_STRUCTURES.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredPlayers = useMemo(() => {
    return MOCK_PLAYERS.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <>
      <CreateStructureModal />
      <Box
        flex={{ col: true }}
        style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}
      >
        <PageHeader
          title="Турниры"
          extra={
            <Link href="/">
              <Button
                type="ghost"
                size="small"
                iconRight={<Home size={16} />}
              />
            </Link>
          }
        />

        <PageLayout>
          <Box flex={{ col: true, gap: 12, width: "100%" }}>
            <Box
              flex={{
                justify: "space-between",
                align: "center",
                width: "100%",
              }}
            >
              <ToggleGroup
                type="primary"
                itemsType="tab"
                value={activeTab}
                onTabChange={(value) =>
                  setActiveTab(value as "structures" | "players")
                }
              >
                <ToggleGroup.Item value="structures">
                  Структура турниров
                </ToggleGroup.Item>
                <ToggleGroup.Item value="players">
                  База игроков
                </ToggleGroup.Item>
              </ToggleGroup>
            </Box>

            {activeTab === "structures" && (
              <Box flex={{ col: true, gap: 24 }}>
                <Box flex={{ gap: 12, align: "center" }}>
                  <SearchInput value={searchQuery} onChange={setSearchQuery} />
                  <Button
                    type="primary"
                    size="medium"
                    onClick={() => openCreateStructureModal()}
                  >
                    Создать формат
                  </Button>
                </Box>

                <Box flex={{ col: true, gap: 2 }}>
                  {filteredStructures.map((structure) => (
                    <StructureCard
                      key={structure.id}
                      name={structure.name}
                      duration={structure.duration}
                      smallBlind={structure.smallBlind}
                      bigBlind={structure.bigBlind}
                      playersLimit={structure.playersLimit}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {activeTab === "players" && (
              <Box flex={{ col: true, gap: 24 }}>
                <Box flex={{ gap: 12, align: "center" }}>
                  <SearchInput value={searchQuery} onChange={setSearchQuery} />
                  <Button type="primary" size="medium">
                    Добавить игрока
                  </Button>
                </Box>

                <Box flex={{ col: true, gap: 2 }}>
                  {filteredPlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      name={player.name}
                      phone={player.phone}
                      gamesPlayed={player.gamesPlayed}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </PageLayout>
      </Box>
    </>
  );
};
