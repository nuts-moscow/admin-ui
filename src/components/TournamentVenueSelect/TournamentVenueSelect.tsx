"use client";

import { useId } from "react";
import { useTournamentVenues } from "@/core/states/tournaments/hooks/useTournamentVenues";

export function TournamentVenueSelect({ value, onChange, disabled = false }: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const { data: venues = [], loading } = useTournamentVenues();
  const selected = venues.find((venue) => venue.id === value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", minWidth: 0 }}>
      <label htmlFor={id} style={{ fontSize: 14, color: "var(--text-secondary)" }}>Место проведения</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || loading || venues.length === 0}
        style={{ width: "100%", minWidth: 0, padding: "10px 12px", borderRadius: 10,
          border: "1px solid var(--border-color-grey)", background: "var(--background-primary)",
          color: "var(--text-primary)", fontSize: 14 }}
      >
        {!selected && <option value={value}>{loading ? "Загрузка..." : "Место недоступно"}</option>}
        {venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
      </select>
      {selected ? (
        <a href={selected.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--text-secondary)", overflowWrap: "anywhere" }}>
          {selected.address}
        </a>
      ) : !loading ? (
        <span role="status" style={{ fontSize: 13 }}>Не удалось загрузить места проведения. Обновите страницу.</span>
      ) : null}
    </div>
  );
}
