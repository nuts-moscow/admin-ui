export interface RatingPlaceRow {
  readonly place: number;
  readonly basePoints: number;
  readonly guaranteeBonus: number;
  readonly pointsCoefficient: number;
  readonly fromTableAfterCoefficient: number;
}

export interface RatingPointsDistributionResponse {
  /** false — турнир не идёт в рейтинг (ratingEnabled выключен): блок очков скрывать. По умолчанию true для старого бэка. */
  readonly rated: boolean;
  readonly tournamentId: number;
  readonly playersInTournament: number;
  readonly prizePlacesDepth: number;
  readonly places: RatingPlaceRow[];
}

function asFiniteNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function normalizePlaceRow(raw: Record<string, unknown>): RatingPlaceRow | null {
  const place = asFiniteNumber(raw.place);
  const basePoints = asFiniteNumber(raw.basePoints ?? raw.base_points);
  const guaranteeBonus = asFiniteNumber(
    raw.guaranteeBonus ?? raw.guarantee_bonus,
  );
  const pointsCoefficient = asFiniteNumber(
    raw.pointsCoefficient ?? raw.points_coefficient,
  );
  const fromTableAfterCoefficient = asFiniteNumber(
    raw.fromTableAfterCoefficient ?? raw.from_table_after_coefficient,
  );
  if (
    place === undefined ||
    basePoints === undefined ||
    guaranteeBonus === undefined ||
    pointsCoefficient === undefined ||
    fromTableAfterCoefficient === undefined
  ) {
    return null;
  }
  return {
    place,
    basePoints,
    guaranteeBonus,
    pointsCoefficient,
    fromTableAfterCoefficient,
  };
}

function normalizeResponse(raw: unknown): RatingPointsDistributionResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  // rated отсутствует у старого бэка — считаем true.
  const rated = typeof o.rated === "boolean" ? o.rated : true;
  const tournamentId = asFiniteNumber(o.tournamentId ?? o.tournament_id);
  // Турнир не идёт в рейтинг: тело может быть { rated: false, places: [] } без прочих полей.
  if (rated === false) {
    return {
      rated: false,
      tournamentId: tournamentId ?? 0,
      playersInTournament: 0,
      prizePlacesDepth: 0,
      places: [],
    };
  }
  const playersInTournament = asFiniteNumber(
    o.playersInTournament ?? o.players_in_tournament,
  );
  const prizePlacesDepth = asFiniteNumber(
    o.prizePlacesDepth ?? o.prize_places_depth,
  );
  const placesRaw = o.places;
  if (
    tournamentId === undefined ||
    playersInTournament === undefined ||
    prizePlacesDepth === undefined ||
    !Array.isArray(placesRaw)
  ) {
    return null;
  }
  const places: RatingPlaceRow[] = [];
  for (const p of placesRaw) {
    if (p && typeof p === "object") {
      const row = normalizePlaceRow(p as Record<string, unknown>);
      if (row) places.push(row);
    }
  }
  return {
    rated: true,
    tournamentId,
    playersInTournament,
    prizePlacesDepth,
    places,
  };
}

/**
 * GET /v2/public/tournaments/{id}/rating-points-distribution — без авторизации.
 */
export async function getPublicTournamentRatingPointsDistribution(
  apiUrl: string,
  tournamentId: string,
): Promise<RatingPointsDistributionResponse | null> {
  const id = tournamentId.trim();
  if (!id) return null;
  try {
    const response = await fetch(
      `${apiUrl}/v2/public/tournaments/${encodeURIComponent(id)}/rating-points-distribution`,
      { credentials: "omit" },
    );
    if (response.status === 400 || response.status === 404) {
      return null;
    }
    if (!response.ok) {
      return null;
    }
    const json: unknown = await response.json();
    return normalizeResponse(json);
  } catch {
    return null;
  }
}
