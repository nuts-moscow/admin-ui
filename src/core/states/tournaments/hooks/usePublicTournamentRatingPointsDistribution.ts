import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { getPublicTournamentRatingPointsDistribution } from "../requests/getPublicTournamentRatingPointsDistribution";
import type { RatingPointsDistributionResponse } from "../requests/getPublicTournamentRatingPointsDistribution";

export const usePublicTournamentRatingPointsDistribution = queryState({
  request: async (
    { environment },
    _1,
    _2,
    tournamentId: string,
  ): Promise<RatingPointsDistributionResponse | null> => {
    return getPublicTournamentRatingPointsDistribution(
      environment.apiUrl,
      tournamentId,
    );
  },
  pollInterval: 15_000,
  cache: true,
  deps: {
    environment: useEnvironment,
  },
});
