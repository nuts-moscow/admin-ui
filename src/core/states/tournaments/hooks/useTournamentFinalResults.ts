import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  getTournamentFinalResults,
  TournamentFinalResultsResponse,
} from "../requests/getTournamentFinalResults";

export const useTournamentFinalResults = queryState({
  request: async (
    { environment },
    _1,
    _2,
    tournamentId: string
  ): Promise<TournamentFinalResultsResponse | null> => {
    return getTournamentFinalResults(environment, tournamentId);
  },
  pollInterval: 10_000,
  cache: true,
  deps: {
    environment: useEnvironment,
  },
});
