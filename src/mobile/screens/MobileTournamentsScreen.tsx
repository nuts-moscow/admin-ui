"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Formatter } from "@/components/Formatter/Formatter";
import { useAuth } from "@/core/states/auth/useAuth";
import { useTournaments } from "@/core/states/tournaments/hooks/useTournaments";
import { TournamentStatus } from "@/core/states/tournaments/common/TournamentStatus";
import { MobileShell } from "../components/MobileShell";
import { MobileHeader } from "../components/MobileHeader";
import { MobileContent } from "../components/MobileContent";
import { SectionTabs } from "../components/SectionTabs";
import { mobileCardCls, mobileCardLinkCls, mobileInputCls } from "../mobile.css";

const STATUS_TABS = [
  { key: "RegistrationOpen", title: "Открыты" },
  { key: "InProgress", title: "Идёт игра" },
  { key: "Completed", title: "Архив" },
] as const;

export function MobileTournamentsScreen() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] =
    useState<TournamentStatus>("RegistrationOpen");
  const { data: tournaments = [], refetch } = useTournaments(activeTab);
  const [search, setSearch] = useState("");

  useEffect(() => {
    refetch(activeTab);
  }, [activeTab]);

  const list = useMemo(() => {
    const filtered = search
      ? tournaments.filter((t) =>
          t.name.toLowerCase().includes(search.toLowerCase()),
        )
      : [...tournaments];
    if (activeTab === "Completed") {
      filtered.sort((a, b) => b.date - a.date);
    }
    return filtered;
  }, [tournaments, search, activeTab]);

  return (
    <MobileShell
      header={
        <MobileHeader
          title="Турниры"
          right={
            <Box flex={{ gap: 1, align: "center" }}>
              <Link href="/m/settings" aria-label="Настройки">
                <Button
                  type="ghost"
                  size="small"
                  iconRight={<Settings size={20} />}
                />
              </Link>
              <Button
                type="ghost"
                size="small"
                iconRight={<LogOut size={20} />}
                onClick={logout}
                aria-label="Выйти"
              />
            </Box>
          }
        />
      }
    >
      <SectionTabs
        tabs={STATUS_TABS}
        active={activeTab}
        onChange={(key) => setActiveTab(key as TournamentStatus)}
      />
      <MobileContent>
        <input
          type="text"
          className={mobileInputCls}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию турнира"
        />
        {list.length === 0 ? (
          <Typography.Text type="secondary" size="small">
            Нет турниров
          </Typography.Text>
        ) : (
          list.map((t) => (
            <Link
              key={t.id}
              href={`/m/tournament/${t.id}`}
              className={mobileCardLinkCls}
            >
              <div className={mobileCardCls}>
                <Typography.Text bold>{t.name}</Typography.Text>
                <Typography.Text type="secondary" size="small">
                  <Formatter.dateTime value={t.date} type="date" />
                  {" · "}
                  <Formatter.dateTime value={t.date} type="time" />
                </Typography.Text>
                {t.lateRegistrationClosed === true ||
                t.ratingEnabled === false ? (
                  <Typography.Text type="secondary" size="xSmall">
                    {[
                      t.lateRegistrationClosed === true
                        ? "Лейт-рега закрыта"
                        : null,
                      t.ratingEnabled === false ? "Рейтинг выкл." : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Typography.Text>
                ) : null}
              </div>
            </Link>
          ))
        )}
      </MobileContent>
    </MobileShell>
  );
}
