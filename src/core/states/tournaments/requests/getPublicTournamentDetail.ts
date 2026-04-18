import { securedFetch } from '@/core/utils/misc/securedFetch';
import { Environment } from '../../environment/Environment';
import {
  TournamentInfoResponse,
  normalizeStructure,
  pickFiniteNumber,
} from "./getTournament";
import { normalizeTournamentStatus } from '../common/TournamentStatus';
import { TournamentsStructureResponse } from '../common/TournamentsStructureResponse';

interface TournamentWithStructureResponse {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly date: number;
  readonly structure: TournamentsStructureResponse | null;
  readonly ratingGuaranteeEnabled?: boolean;
  readonly ratingGuaranteeBonusPoints?: number;
  readonly ratingPointsCoefficient?: number;
  readonly ratingBountyCoefficient?: number;
  readonly ratingTableId?: number;
}

/**
 * GET /v2/public/tournaments/{id} — без JWT; при ошибке не триггерит глобальный 401.
 */
export const getPublicTournamentDetail = async (
  environment: Environment,
  id: string,
): Promise<TournamentInfoResponse | null> => {
  const tournamentId = id.trim();
  if (!tournamentId) return null;

  return securedFetch<undefined, TournamentInfoResponse | null>({
    method: 'GET',
    host: environment.apiUrl,
    path: `/v2/public/tournaments/${encodeURIComponent(tournamentId)}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => {
        const j = (await res.toJson()) as TournamentWithStructureResponse;
        const ratingTableIdRaw =
          (j as { ratingTableId?: unknown }).ratingTableId ??
          (j as { rating_table_id?: unknown }).rating_table_id;
        const ratingTableId =
          typeof ratingTableIdRaw === "number" && Number.isFinite(ratingTableIdRaw)
            ? Math.trunc(ratingTableIdRaw)
            : typeof ratingTableIdRaw === "string" &&
                ratingTableIdRaw.trim() !== "" &&
                Number.isFinite(Number(ratingTableIdRaw))
              ? Math.trunc(Number(ratingTableIdRaw))
              : undefined;
        return {
          id: j.id,
          name: j.name,
          status: normalizeTournamentStatus(j.status),
          date: j.date,
          structure: normalizeStructure(j.structure),
          ratingGuaranteeEnabled: j.ratingGuaranteeEnabled,
          ratingGuaranteeBonusPoints: pickFiniteNumber(
            j.ratingGuaranteeBonusPoints,
            (j as { rating_guarantee_bonus_points?: unknown })
              .rating_guarantee_bonus_points,
          ),
          ratingPointsCoefficient: j.ratingPointsCoefficient,
          ratingBountyCoefficient: j.ratingBountyCoefficient,
          ...(ratingTableId != null ? { ratingTableId } : {}),
        };
      },
      401: () => null,
      404: () => null,
      unknownError: () => null,
    },
  });
};
