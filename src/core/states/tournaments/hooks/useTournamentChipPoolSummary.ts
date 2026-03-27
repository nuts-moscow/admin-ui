import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  getTournamentChipPoolSummary,
  TournamentChipPoolSummary,
} from "../requests/getTournamentChipPoolSummary";

export const useTournamentChipPoolSummary = queryState({
  request: async (
    { environment },
    _1,
    _2,
    tournamentId: string
  ): Promise<TournamentChipPoolSummary | null> => {
    return getTournamentChipPoolSummary(environment, tournamentId);
  },
  pollInterval: 5_000,
  cache: true,
  deps: {
    environment: useEnvironment,
  },
});
