"use client";

import { Input } from "@/components/Input/Input";
import { customVenueError, type CustomTournamentVenue } from "@/core/states/tournaments/requests/tournamentVenues";

export function CustomVenueFields({ value, onChange, disabled = false }: {
  value: CustomTournamentVenue;
  onChange: (value: CustomTournamentVenue) => void;
  disabled?: boolean;
}) {
  const error = customVenueError(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0, width: "100%" }}>
      <Input label="Имя заведения" aria-label="Имя заведения" value={value.name} maxLength={150} required disabled={disabled}
        onChange={(event) => onChange({ ...value, name: event.target.value })} />
      <Input label="Адрес" aria-label="Адрес" value={value.address} maxLength={300} required disabled={disabled}
        onChange={(event) => onChange({ ...value, address: event.target.value })} />
      <Input label="Ссылка на карту" aria-label="Ссылка на карту" value={value.mapsUrl} maxLength={2048} required disabled={disabled}
        placeholder="https://..." inputMode="url" onChange={(event) => onChange({ ...value, mapsUrl: event.target.value })} />
      {error && <span role="status" style={{ fontSize: 13 }}>{error}</span>}
    </div>
  );
}
