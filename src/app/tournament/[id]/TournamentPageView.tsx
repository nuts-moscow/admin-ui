"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PageLayout } from "@/components/PageLayout/PageLayout";
import { Home } from "lucide-react";
import { Button } from "@/components/Button/Button";
import Link from "next/link";
import { TournamentPlayers } from "./components/TournamentPlayers/TournamentPlayers";
import { TournamentTables } from "./components/TournamentTables/TournamentTables";
import { TournamentState } from "./components/TournamentState/TournamentState";
import { TournamentReentries } from "./components/TournamentReentries/TournamentReentries";
import { TournamentCash } from "./components/TournamentCash/TournamentCash";
import { TournamentResults } from "./components/TournamentResults/TournamentResults";

export interface TournamentPageViewProps {
  readonly tournamentId: string;
}

export const TournamentPageView: FC<TournamentPageViewProps> = ({
  tournamentId,
}) => {
  const [activeTab, setActiveTab] = useState<string>("players");

  return (
    <>
      <Box
        flex={{ col: true }}
        style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}
      >
        <PageHeader
          title="Название турнира 01.01.2025"
          subtitle="Статус: Завершен"
          extra={
            <Box flex={{ gap: 2, align: "center" }}>
              <Link href="/">
                <Button
                  type="accent"
                  size="small"
                  iconRight={<Home size={32} />}
                />
              </Link>
            </Box>
          }
        />

        <PageLayout>
          <Box
            width="100%"
            onTabChange={(tabKey) => setActiveTab(tabKey)}
            tabsType="tab"
            tabsJustify
            tabs={[
              {
                title: "Список",
                key: "players",
                content: <TournamentPlayers tournamentId={tournamentId} />,
              },
              {
                title: "Столы",
                key: "tables",
                content: <TournamentTables tournamentId={tournamentId} />,
              },
              {
                title: "Турнир",
                key: "state",
                content: <TournamentState tournamentId={tournamentId} />,
              },
              {
                title: "Рибаи",
                key: "reentries",
                content: <TournamentReentries tournamentId={tournamentId} />,
              },
              {
                title: "Касса",
                key: "cash",
                content: <TournamentCash tournamentId={tournamentId} />,
              },
              {
                title: "Результаты",
                key: "results",
                content: <TournamentResults tournamentId={tournamentId} />,
              },
            ]}
          ></Box>
        </PageLayout>
      </Box>
    </>
  );
};
