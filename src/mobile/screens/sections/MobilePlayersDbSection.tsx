"use client";

import { useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { toast } from "@/components/Toast/Toast";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { usePlayers, refetchPlayers } from "@/core/states/players/hooks/usePlayers";
import { createPlayer } from "@/core/states/players/requests/createPlayer";
import { formatApiErrorForUser } from "@/core/utils/misc/formatApiErrorForUser";
import { Sheet } from "../../components/Sheet";
import { mobileCardCls, mobileInputCls } from "../../mobile.css";

export function MobilePlayersDbSection() {
  const environment = useEnvironment();
  const { data: players = [] } = usePlayers();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nickname: "",
    name: "",
    tg: "",
    phone: "",
    notes: "",
  });

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return players;
    }
    return players.filter((p) =>
      [p.nickname, p.name, p.tg, p.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [players, search]);

  const setField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    const nickname = form.nickname.trim();
    if (!nickname || saving) {
      return;
    }
    setSaving(true);
    try {
      await createPlayer(environment, {
        nickname,
        name: form.name.trim() || null,
        tg: form.tg.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      });
      refetchPlayers();
      setForm({ nickname: "", name: "", tg: "", phone: "", notes: "" });
      setCreating(false);
      toast({ type: "success", message: "Игрок создан" });
    } catch (error) {
      toast({ type: "error", message: formatApiErrorForUser(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <input
        className={mobileInputCls}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск: ник, имя, телеграм, телефон"
      />
      <Button
        type="primary"
        size="medium"
        width="100%"
        onClick={() => setCreating(true)}
      >
        Создать игрока
      </Button>

      {list.length === 0 ? (
        <Typography.Text type="secondary" size="small">
          Нет игроков
        </Typography.Text>
      ) : (
        list.map((p) => (
          <Box key={p.id} className={mobileCardCls} flex={{ col: true, gap: 0 }}>
            <Typography.Text bold>{p.nickname}</Typography.Text>
            <Typography.Text type="secondary" size="small">
              {[p.name, p.tg, p.phone].filter(Boolean).join(" · ") || "—"}
            </Typography.Text>
          </Box>
        ))
      )}

      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        title="Новый игрок"
      >
        <input
          className={mobileInputCls}
          placeholder="Никнейм *"
          value={form.nickname}
          onChange={(e) => setField("nickname", e.target.value)}
        />
        <input
          className={mobileInputCls}
          placeholder="Имя"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
        />
        <input
          className={mobileInputCls}
          placeholder="Telegram"
          value={form.tg}
          onChange={(e) => setField("tg", e.target.value)}
        />
        <input
          className={mobileInputCls}
          placeholder="Телефон"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
        />
        <input
          className={mobileInputCls}
          placeholder="Заметки"
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
        />
        <Button
          type="primary"
          size="medium"
          width="100%"
          loading={saving}
          disabled={saving || form.nickname.trim() === ""}
          onClick={save}
        >
          Создать
        </Button>
      </Sheet>
    </>
  );
}
