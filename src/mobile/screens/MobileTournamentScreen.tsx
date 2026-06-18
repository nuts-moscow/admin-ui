"use client";

import { FC, useMemo, useState } from "react";
import { Typography } from "@/components/Typography/Typography";
import { Formatter } from "@/components/Formatter/Formatter";
import { useTournament } from "@/core/states/tournaments/hooks/useTournament";
import { MobileShell } from "../components/MobileShell";
import { MobileHeader } from "../components/MobileHeader";
import { MobileContent } from "../components/MobileContent";
import { SectionTabs, SectionTab } from "../components/SectionTabs";
import { MobilePlayersSection } from "./sections/MobilePlayersSection";
import { MobileTablesSection } from "./sections/MobileTablesSection";
import { MobileStateSection } from "./sections/MobileStateSection";
import { MobileReentriesSection } from "./sections/MobileReentriesSection";
import { MobileCashSection } from "./sections/MobileCashSection";
import { MobileResultsSection } from "./sections/MobileResultsSection";
import { MobileRatingSection } from "./sections/MobileRatingSection";
import { TournamentSocial } from "@/app/tournament/[id]/components/TournamentSocial/TournamentSocial";

export interface MobileTournamentScreenProps {
  readonly tournamentId: string;
}

/**
 * Оболочка мобильного экрана турнира: шапка + горизонтальная навигация по
 * разделам. Контент разделов наполняется по этапам (см. план). Бродкаст
 * «Турнирное окно» в мобильный модуль не входит.
 */
export const MobileTournamentScreen: FC<MobileTournamentScreenProps> = ({
  tournamentId,
}) => {
  const { data: tournament } = useTournament(tournamentId);
  const [active, setActive] = useState<string>("players");

  const sections = useMemo<SectionTab[]>(() => {
    if (!tournament) {
      return [];
    }
    if (tournament.status === "Completed") {
      return [
        { key: "cash", title: "Касса" },
        { key: "results", title: "Результаты" },
        { key: "rating", title: "Рейтинг" },
        { key: "social", title: "Соцсети" },
      ];
    }
    return [
      { key: "players", title: "Игроки" },
      { key: "tables", title: "Столы" },
      { key: "state", title: "Турнир" },
      ...(tournament.status !== "RegistrationOpen"
        ? [{ key: "reentries", title: "Ребай" }]
        : []),
      { key: "cash", title: "Касса" },
      { key: "results", title: "Результаты" },
      { key: "rating", title: "Рейтинг" },
      { key: "social", title: "Соцсети" },
    ];
  }, [tournament]);

  const activeKey = sections.some((s) => s.key === active)
    ? active
    : sections[0]?.key ?? "";

  if (!tournament) {
    return (
      <MobileShell header={<MobileHeader title="Турнир" back="/m" />}>
        <MobileContent>
          <Typography.Text type="secondary" size="small">
            Загрузка…
          </Typography.Text>
        </MobileContent>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      header={
        <MobileHeader
          back="/m"
          title={
            <>
              {tournament.name}{" "}
              <Formatter.dateTime value={tournament.date} type="date" />
            </>
          }
        />
      }
    >
      <SectionTabs tabs={sections} active={activeKey} onChange={setActive} />
      <MobileContent>
        {activeKey === "players" ? (
          <MobilePlayersSection tournamentId={tournamentId} />
        ) : activeKey === "tables" ? (
          <MobileTablesSection tournamentId={tournamentId} />
        ) : activeKey === "state" ? (
          <MobileStateSection tournament={tournament} />
        ) : activeKey === "reentries" ? (
          <MobileReentriesSection tournamentId={tournamentId} />
        ) : activeKey === "cash" ? (
          <MobileCashSection tournamentId={tournamentId} />
        ) : activeKey === "results" ? (
          <MobileResultsSection tournament={tournament} />
        ) : activeKey === "rating" ? (
          <MobileRatingSection tournament={tournament} />
        ) : activeKey === "social" ? (
          <TournamentSocial tournament={tournament} />
        ) : (
          <Typography.Text type="secondary" size="small">
            Раздел «{sections.find((s) => s.key === activeKey)?.title ?? ""}» —
            в разработке для мобильной версии.
          </Typography.Text>
        )}
      </MobileContent>
    </MobileShell>
  );
};
