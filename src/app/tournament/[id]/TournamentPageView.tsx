"use client";

import { FC, useEffect, useMemo, useState } from "react";
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
import { Formatter } from "@/components/Formatter/Formatter";
import { tournamentStatusLabels } from "@/core/states/tournaments/common/TournamentStatus";
import { useTournament } from "@/core/states/tournaments/hooks/useTournament";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";

export interface TournamentPageViewProps {
  readonly tournamentId: string;
}

export const TournamentPageView: FC<TournamentPageViewProps> = ({
  tournamentId,
}) => {
  const [activeTab, setActiveTab] = useState<string>("players");
  const { data: currentTournament } = useTournament(tournamentId);
  const [tournamentViewPatch, setTournamentViewPatch] = useState<
    Partial<TournamentInfoResponse>
  >({});

  const displayTournament = useMemo((): TournamentInfoResponse | null => {
    if (!currentTournament) {
      return null;
    }
    return { ...currentTournament, ...tournamentViewPatch };
  }, [currentTournament, tournamentViewPatch]);

  /** Когда GET догоняет оптимистичный патч — сбрасываем слой, чтобы не расходиться с сервером. */
  useEffect(() => {
    if (!currentTournament || Object.keys(tournamentViewPatch).length === 0) {
      return;
    }
    const keys = Object.keys(tournamentViewPatch) as (keyof TournamentInfoResponse)[];
    const serverMatchesPatch = keys.every((k) => {
      const pv = tournamentViewPatch[k];
      const cv = currentTournament[k];
      return pv === cv;
    });
    if (serverMatchesPatch) {
      setTournamentViewPatch({});
    }
  }, [currentTournament, tournamentViewPatch]);

  const tabs = useMemo(() => {
    if (!displayTournament) return [];
    if (displayTournament.status === "Completed") {
      return [
        {
          title: "Касса",
          key: "cash",
          content: <TournamentCash tournament={displayTournament} />,
        },
        {
          title: "Турнирное окно",
          key: "chip-pool",
          content: (
            <TournamentChipPoolWindow
              tournament={displayTournament}
              enablePublicRatingPointsPreview
            />
          ),
        },
        {
          title: "Социальные сети",
          key: "social",
          content: <TournamentSocial tournament={displayTournament} />,
        },
        {
          title: "Результаты",
          key: "results",
          content: <TournamentResults tournament={displayTournament} />,
        },
        {
          title: "Рейтинг",
          key: "rating",
          content: <TournamentRating tournament={displayTournament} />,
        },
      ];
    }

    return [
      {
        title: "Игроки",
        key: "players",
        content: <TournamentPlayers tournament={displayTournament} />,
      },
      {
        title: "Столы",
        key: "tables",
        content: <TournamentTables tournament={displayTournament} />,
      },
      {
        title: "Турнир",
        key: "state",
        content: (
          <TournamentState
            tournament={displayTournament}
            onTournamentViewPatch={setTournamentViewPatch}
          />
        ),
      },
      ...(displayTournament.status !== "RegistrationOpen"
        ? [
            {
              title: "Ребай",
              key: "reentries",
              content: <TournamentReentries tournament={displayTournament} />,
            },
          ]
        : []),
      {
        title: "Касса",
        key: "cash",
        content: <TournamentCash tournament={displayTournament} />,
      },
      {
        title: "Турнирное окно",
        key: "chip-pool",
        content: (
          <TournamentChipPoolWindow
            tournament={displayTournament}
            enablePublicRatingPointsPreview
          />
        ),
      },
      {
        title: "Социальные сети",
        key: "social",
        content: <TournamentSocial tournament={displayTournament} />,
      },
      {
        title: "Результаты",
        key: "results",
        content: <TournamentResults tournament={displayTournament} />,
      },
      {
        title: "Рейтинг",
        key: "rating",
        content: <TournamentRating tournament={displayTournament} />,
      },
    ];
  }, [displayTournament]);

  if (!displayTournament) {
    return null;
  }

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
              {displayTournament.name}{" "}
              <Formatter.dateTime value={displayTournament.date} type="date" />
            </>
          }
          subtitle={`Статус: ${tournamentStatusLabels[displayTournament.status]}`}
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
