"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button/Button";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";
import { DEFAULT_TOURNAMENT_VENUE_ID, EMPTY_CUSTOM_VENUE, customVenueError, normalizeCustomVenue, patchTournamentVenue, type CustomTournamentVenue } from "@/core/states/tournaments/requests/tournamentVenues";
import { TournamentVenueSelect } from "./TournamentVenueSelect";
import { CustomVenueFields } from "./CustomVenueFields";

export function TournamentVenueEditor({ tournamentId, venueId, customVenue }: {
  tournamentId: number;
  venueId?: string;
  customVenue?: CustomTournamentVenue | null;
}) {
  const environment = useEnvironment();
  const [value, setValue] = useState(venueId ?? DEFAULT_TOURNAMENT_VENUE_ID);
  const [draft, setDraft] = useState(customVenue ?? EMPTY_CUSTOM_VENUE);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error?: boolean } | null>(null);
  const name = customVenue?.name ?? "";
  const address = customVenue?.address ?? "";
  const mapsUrl = customVenue?.mapsUrl ?? "";

  useEffect(() => {
    setValue(venueId ?? DEFAULT_TOURNAMENT_VENUE_ID);
    setDraft({ name, address, mapsUrl });
  }, [tournamentId, venueId, name, address, mapsUrl]);

  async function save(next: string) {
    if (saving || (next === "custom" && customVenueError(draft))) return;
    const previous = value;
    setValue(next);
    setSaving(true);
    setFeedback(null);
    try {
      await patchTournamentVenue(environment, tournamentId, next, next === "custom" ? draft : undefined);
      if (next === "custom") setDraft(normalizeCustomVenue(draft));
      refetchTournament();
      setFeedback({ message: "Место проведения сохранено" });
    } catch (error) {
      setValue(previous);
      setFeedback({ error: true, message: error instanceof Error ? error.message : "Не удалось сохранить место проведения" });
    } finally {
      setSaving(false);
    }
  }

  function change(next: string) {
    setFeedback(null);
    if (next === "custom") setValue(next);
    else if (next !== value) void save(next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0, width: "100%" }}>
      <TournamentVenueSelect value={value} onChange={change} disabled={saving} />
      {value === "custom" && <>
        <CustomVenueFields value={draft} disabled={saving} onChange={(next) => { setDraft(next); setFeedback(null); }} />
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Место изменится у игроков после нажатия «Сохранить место».</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button htmlType="button" onClick={() => void save("custom")} disabled={saving || !!customVenueError(draft)}>Сохранить место</Button>
          <Button htmlType="button" type="outline" disabled={saving} onClick={() => {
            setValue(venueId ?? DEFAULT_TOURNAMENT_VENUE_ID);
            setDraft({ name, address, mapsUrl });
            setFeedback(null);
          }}>Отмена</Button>
        </div>
      </>}
      {saving && <span role="status" style={{ fontSize: 13 }}>Сохраняем...</span>}
      {feedback && <span role={feedback.error ? "alert" : "status"} style={{ fontSize: 13 }}>{feedback.message}</span>}
    </div>
  );
}
