"use client";
import { FC, useEffect, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PageLayout } from "@/components/PageLayout/PageLayout";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { TournamentCard } from "@/app/TournamentsPageView/TournamentCard/TournamentCard";
import { ToggleGroup } from "@/components/ToggleGroup/ToggleGroup";
import { useModal } from "@/components/Modal/Modal";
import { CreateTournamentModalContent } from "@/app/TournamentsPageView/CreateTournamentModal/CreateTournamentModal";
import { Settings } from "lucide-react";
import { TournamentStatus } from "@/core/states/tournaments/common/TournamentStatus";
import { useTournaments } from "@/core/states/tournaments/hooks/useTournaments";
import { SimpleList } from "@/components/SimpleList/SimpleList";
import { ShortTournament } from "@/core/states/tournaments/requests/getTournaments";
import Link from "next/link";

export interface TournamentsPageViewProps {
  readonly initialTournaments: ShortTournament[];
}

export const TournamentsPageView: FC<TournamentsPageViewProps> = ({
  initialTournaments,
}) => {
  const [activeTab, setActiveTab] =
    useState<TournamentStatus>("RegistrationOpen");

  const { data: clientTournaments, refetch: refetchTournaments } =
    useTournaments(activeTab);
  const tournaments = useMemo(() => {
    return clientTournaments || initialTournaments;
  }, [initialTournaments, clientTournaments]);

  const [searchQuery, setSearchQuery] = useState("");

  const [CreateTournamentModal, openCreateModal] = useModal(
    CreateTournamentModalContent
  );

  useEffect(() => {
    refetchTournaments(activeTab);
  }, [activeTab]);

  const tournamentsToShow = useMemo(() => {
    if (!tournaments) return [];
    if (!searchQuery) return tournaments;
    return tournaments.filter((tournament) =>
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tournaments, searchQuery, activeTab]);

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
              <Link href="/settings">
                <Button
                  type="accent"
                  size="small"
                  iconRight={<Settings size={32} />}
                />
              </Link>
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
                  Открыты
                </ToggleGroup.Item>
                <ToggleGroup.Item value="InProgress">
                  Идет игра
                </ToggleGroup.Item>
                <ToggleGroup.Item value="Completed">Архив</ToggleGroup.Item>
              </ToggleGroup>

              <Button
                type="primary"
                size="medium"
                onClick={() => openCreateModal()}
              >
                Создать турнир
              </Button>
            </Box>

            {tournamentsToShow.length === 0 ? (
              <SimpleList.EmptyState>Нет турниров</SimpleList.EmptyState>
            ) : (
              <Box flex={{ col: true, gap: 2, width: "100%" }}>
                {tournamentsToShow.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </Box>
            )}
          </Box>
        </PageLayout>
      </Box>
    </>
  );
};
