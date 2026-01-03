"use client";
import { FC, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PageLayout } from "@/components/PageLayout/PageLayout";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { TournamentCard } from "@/app/TournamentsPageView/TournamentCard/TournamentCard";
import { ToggleGroup } from "@/components/ToggleGroup/ToggleGroup";
import { useModal } from "@/components/Modal/Modal";
import { CreateTournamentModalContent } from "@/app/TournamentsPageView/CreateTournamentModal/CreateTournamentModal";
import { Info } from "lucide-react";
import { TournamentStatus } from "@/core/states/tournaments/types";

interface TournamentMock {
  readonly id: string;
  readonly name: string;
  readonly date: number;
  readonly time: string;
  readonly structureName: string;
  readonly status: TournamentStatus;
}

const MOCK_TOURNAMENTS: TournamentMock[] = [
  {
    id: "1",
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "RegistrationOpen",
  },
  {
    id: "2",
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "RegistrationOpen",
  },
  {
    id: "3",
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "RegistrationOpen",
  },
  {
    id: "4",
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "RegistrationOpen",
  },
  {
    id: "5",
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "InProgress",
  },
  {
    id: "6",
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "InProgress",
  },
  {
    id: "7",
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "InProgress",
  },
  {
    id: "8",
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "InProgress",
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `archive-${i}`,
    name: "Название турнира",
    date: new Date("2025-10-01").getTime(),
    time: "18.00",
    structureName: "Тип турнира",
    status: "Completed" as const,
  })),
];

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("ru-RU");
};

const getStatusCounts = (tournaments: TournamentMock[]) => {
  return {
    RegistrationOpen: tournaments.filter((t) => t.status === "RegistrationOpen")
      .length,
    InProgress: tournaments.filter((t) => t.status === "InProgress").length,
    Completed: tournaments.filter((t) => t.status === "Completed").length,
  };
};

export const TournamentsPageView: FC = () => {
  const [activeTab, setActiveTab] =
    useState<TournamentStatus>("RegistrationOpen");

  const [searchQuery, setSearchQuery] = useState("");

  const [CreateTournamentModal, openCreateModal] = useModal(
    CreateTournamentModalContent
  );

  const filteredTournaments = useMemo(() => {
    return MOCK_TOURNAMENTS.filter(
      (t) =>
        t.status === activeTab &&
        (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.structureName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeTab, searchQuery]);

  const counts = getStatusCounts(MOCK_TOURNAMENTS);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey as TournamentStatus);
  };

  return (
    <>
      <CreateTournamentModal />
      <Box
        flex={{ col: true }}
        style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}
      >
        <PageHeader
          title="Турниры"
          extra={
            <Box flex={{ gap: 2, align: "center" }}>
              <SearchInput
                value={searchQuery}
                onChange={(term) => setSearchQuery(term)}
              />
              <Button
                type="ghost"
                size="small"
                iconRight={<Info size={16} />}
              />
            </Box>
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
                onTabChange={handleTabChange}
              >
                <ToggleGroup.Item value="RegistrationOpen">
                  Открыты ({counts.RegistrationOpen})
                </ToggleGroup.Item>
                <ToggleGroup.Item value="InProgress">
                  Идет игра ({counts.InProgress})
                </ToggleGroup.Item>
                <ToggleGroup.Item value="Completed">
                  Архив ({counts.Completed})
                </ToggleGroup.Item>
              </ToggleGroup>

              <Button
                type="primary"
                size="medium"
                onClick={() => openCreateModal()}
              >
                Создать турнир
              </Button>
            </Box>

            <Box flex={{ col: true, gap: 2, width: "100%" }}>
              {filteredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </Box>
          </Box>
        </PageLayout>
      </Box>
    </>
  );
};
