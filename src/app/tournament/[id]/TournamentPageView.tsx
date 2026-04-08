"use client";

import { FC, useMemo, useState } from "react";
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
import { TournamentChipPoolWindow } from "./components/TournamentChipPoolWindow/TournamentChipPoolWindow";
import { TournamentResults } from "./components/TournamentResults/TournamentResults";
import { TournamentSocial } from "./components/TournamentSocial/TournamentSocial";
import { TournamentRating } from "./components/TournamentRating/TournamentRating";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { Formatter } from "@/components/Formatter/Formatter";
import { tournamentStatusLabels } from "@/core/states/tournaments/common/TournamentStatus";
import { useTournament } from "@/core/states/tournaments/hooks/useTournament";

export interface TournamentPageViewProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentPageView: FC<TournamentPageViewProps> = ({
  tournament,
}) => {
  const [activeTab, setActiveTab] = useState<string>("players");
  const { data: clientTournament } = useTournament(String(tournament.id));
  const currentTournament = useMemo(
    () => clientTournament || tournament,
    [clientTournament, tournament]
  );
  const tabs = useMemo(() => {
    if (currentTournament.status === "Completed") {
      return [
        {
          title: "Касса",
          key: "cash",
          content: <TournamentCash tournament={currentTournament} />,
        },
        {
          title: "Турнирное окно",
          key: "chip-pool",
          content: <TournamentChipPoolWindow tournament={currentTournament} />,
        },
        {
          title: "Социальные сети",
          key: "social",
          content: <TournamentSocial tournament={currentTournament} />,
        },
        {
          title: "Результаты",
          key: "results",
          content: <TournamentResults tournament={currentTournament} />,
        },
        {
          title: "Рейтинг",
          key: "rating",
          content: <TournamentRating tournament={currentTournament} />,
        },
      ];
    }

    return [
      {
        title: "Игроки",
        key: "players",
        content: <TournamentPlayers tournament={currentTournament} />,
      },
      {
        title: "Столы",
        key: "tables",
        content: <TournamentTables tournament={currentTournament} />,
      },
      {
        title: "Турнир",
        key: "state",
        content: <TournamentState tournament={currentTournament} />,
      },
      ...(currentTournament.status !== "RegistrationOpen"
        ? [
            {
              title: "Ребай",
              key: "reentries",
              content: <TournamentReentries tournament={currentTournament} />,
            },
          ]
        : []),
      {
        title: "Касса",
        key: "cash",
        content: <TournamentCash tournament={currentTournament} />,
      },
      {
        title: "Турнирное окно",
        key: "chip-pool",
        content: <TournamentChipPoolWindow tournament={currentTournament} />,
      },
      {
        title: "Социальные сети",
        key: "social",
        content: <TournamentSocial tournament={currentTournament} />,
      },
      {
        title: "Результаты",
        key: "results",
        content: <TournamentResults tournament={currentTournament} />,
      },
      {
        title: "Рейтинг",
        key: "rating",
        content: <TournamentRating tournament={currentTournament} />,
      },
    ];
  }, [currentTournament]);

  return (
    <>
      <Box
        flex={{ col: true }}
        style={{
          minHeight: "var(--app-min-page-height)",
          backgroundColor: "var(--background-primary)",
        }}
      >
        <PageHeader
          title={
            <>
              {currentTournament.name}{" "}
              <Formatter.dateTime value={currentTournament.date} type="date" />
            </>
          }
          subtitle={`Статус: ${tournamentStatusLabels[currentTournament.status]}`}
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

        <PageLayout fillRemainingViewport>
          <Box
            flex={{ col: true, width: "100%" }}
            flexItem={{ flex: 1, minHeight: 0 }}
            onTabChange={(tabKey) => setActiveTab(tabKey)}
            tabsType="tab"
            tabsPadding={[4, 0]}
            tabsJustify
            tabs={tabs}
          ></Box>
        </PageLayout>
      </Box>
    </>
  );
};
