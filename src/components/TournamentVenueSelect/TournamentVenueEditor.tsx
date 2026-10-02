"use client";

import { useEffect, useState } from "react";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";
import { DEFAULT_TOURNAMENT_VENUE_ID, patchTournamentVenue } from "@/core/states/tournaments/requests/tournamentVenues";
import { TournamentVenueSelect } from "./TournamentVenueSelect";

export function TournamentVenueEditor({ tournamentId, venueId }: { tournamentId: number; venueId?: string }) {
  const environment = useEnvironment();
  const [value, setValue] = useState(venueId ?? DEFAULT_TOURNAMENT_VENUE_ID);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error?: boolean } | null>(null);

  useEffect(() => { setValue(venueId ?? DEFAULT_TOURNAMENT_VENUE_ID); }, [tournamentId, venueId]);

  async function change(next: string) {
    if (saving || next === value) return;
    const previous = value;
    setValue(next);
    setSaving(true);
    setFeedback(null);
    try {
      await patchTournamentVenue(environment, tournamentId, next);
      refetchTournament();
      setFeedback({ message: "Место проведения сохранено" });
    } catch (error) {
      setValue(previous);
      setFeedback({ error: true, message: error instanceof Error ? error.message : "Не удалось сохранить место проведения" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <TournamentVenueSelect value={value} onChange={(next) => void change(next)} disabled={saving} />
      {saving && <span role="status" style={{ fontSize: 13 }}>Сохраняем...</span>}
      {feedback && <span role={feedback.error ? "alert" : "status"} style={{ fontSize: 13 }}>{feedback.message}</span>}
    </div>
  );
}
