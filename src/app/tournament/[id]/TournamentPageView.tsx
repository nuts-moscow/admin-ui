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
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { Typography } from "@/components/Typography/Typography";
import { Formatter } from "@/components/Formatter/Formatter";
import { tournamentStatusLabels } from "@/core/states/tournaments/common/TournamentStatus";

export interface TournamentPageViewProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentPageView: FC<TournamentPageViewProps> = ({
  tournament,
}) => {
  const [activeTab, setActiveTab] = useState<string>("players");

  return (
    <>
      <Box
        flex={{ col: true }}
        style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}
      >
        <PageHeader
          title={
            <>
              {tournament.name}{" "}
              <Formatter.dateTime value={tournament.date} type="date" />
            </>
          }
          subtitle={`Статус: ${tournamentStatusLabels[tournament.status]}`}
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
                content: <TournamentPlayers tournament={tournament} />,
              },
              {
                title: "Столы",
                key: "tables",
                content: <TournamentTables tournament={tournament} />,
              },
              {
                title: "Турнир",
                key: "state",
                content: <TournamentState tournament={tournament} />,
              },
              {
                title: "Рибаи",
                key: "reentries",
                content: <TournamentReentries tournament={tournament} />,
              },
              {
                title: "Касса",
                key: "cash",
                content: <TournamentCash tournament={tournament} />,
              },
              {
                title: "Результаты",
                key: "results",
                content: <TournamentResults tournament={tournament} />,
              },
            ]}
          ></Box>
        </PageLayout>
      </Box>
    </>
  );
};
