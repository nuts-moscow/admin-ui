"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PageLayout } from "@/components/PageLayout/PageLayout";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { Home } from "lucide-react";
import Link from "next/link";
import { StructuresView } from "./components/StructuresView/StructuresView";
import { TournamentStructure } from "@/core/states/tournamentStructures/common/TournamentStructure";
import { PlayersView } from "./components/PlayersView/PlayersView";
import { Player } from "@/core/states/players/common/Player";

export interface SettingsPageViewProps {
  readonly initialTournamentStructures: TournamentStructure[];
  readonly initialPlayers: Player[];
}

export const SettingsPageView: FC<SettingsPageViewProps> = ({
  initialTournamentStructures,
  initialPlayers,
}) => {
  const [activeTab, setActiveTab] = useState<"structures" | "players">(
    "structures"
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  return (
    <>
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
            onTabChange={(tabKey) =>
              setActiveTab(tabKey as "structures" | "players")
            }
            tabsType="tab"
            tabs={[
              {
                title: "Структура турниров",
                key: "structures",
                content: (
                  <StructuresView
                    initialTournamentStructures={initialTournamentStructures}
                    searchQuery={searchQuery}
                  />
                ),
              },
              {
                title: "База игроков",
                key: "players",
                content: (
                  <PlayersView
                    initialPlayers={initialPlayers}
                    searchQuery={searchQuery}
                  />
                ),
              },
            ]}
          ></Box>
        </PageLayout>
      </Box>
    </>
  );
};
