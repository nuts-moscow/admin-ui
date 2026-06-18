"use client";

import { useState } from "react";
import { MobileShell } from "../components/MobileShell";
import { MobileHeader } from "../components/MobileHeader";
import { MobileContent } from "../components/MobileContent";
import { SectionTabs } from "../components/SectionTabs";
import { MobilePlayersDbSection } from "./sections/MobilePlayersDbSection";
import { MobileStructuresSection } from "./sections/MobileStructuresSection";

const TABS = [
  { key: "players", title: "Игроки" },
  { key: "structures", title: "Структуры" },
] as const;

export function MobileSettingsScreen() {
  const [active, setActive] = useState<string>("players");

  return (
    <MobileShell header={<MobileHeader title="Настройки" back="/m" />}>
      <SectionTabs tabs={TABS} active={active} onChange={setActive} />
      <MobileContent>
        {active === "structures" ? (
          <MobileStructuresSection />
        ) : (
          <MobilePlayersDbSection />
        )}
      </MobileContent>
    </MobileShell>
  );
}
