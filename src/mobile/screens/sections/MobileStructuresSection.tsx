"use client";

import { useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { useTournamentStructures } from "@/core/states/tournamentStructures/hooks/useTournamentStructures";
import { mobileCardCls, mobileInputCls } from "../../mobile.css";

export function MobileStructuresSection() {
  const { data: structures = [] } = useTournamentStructures();
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? structures.filter((s) => s.name.toLowerCase().includes(q))
      : structures;
  }, [structures, search]);

  return (
    <>
      <input
        className={mobileInputCls}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск структуры"
      />
      <Typography.Text type="secondary" size="xSmall">
        Редактирование структур — в десктоп-версии. Здесь просмотр.
      </Typography.Text>
      {list.length === 0 ? (
        <Typography.Text type="secondary" size="small">
          Нет структур
        </Typography.Text>
      ) : (
        list.map((s) => (
          <Box key={s.id} className={mobileCardCls} flex={{ col: true, gap: 0 }}>
            <Typography.Text bold>{s.name}</Typography.Text>
            <Typography.Text type="secondary" size="small">
              Лимит {s.playersLimit} · Стек {s.stackSize} ·{" "}
              {s.freezeOutEnabled ? "фриз-аут" : `ребаи${
                s.maxReentries != null ? ` ≤ ${s.maxReentries}` : ""
              }`}{" "}
              · уровней {s.blindsStructure?.length ?? 0}
            </Typography.Text>
          </Box>
        ))
      )}
    </>
  );
}
