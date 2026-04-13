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
        };
      },
      401: () => null,
      404: () => null,
      unknownError: () => null,
    },
  });
};
