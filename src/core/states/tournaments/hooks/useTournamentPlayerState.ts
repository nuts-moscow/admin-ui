import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { InGamePlayerState } from "../common/InGamePlayerState";
import { getTournamentPlayerState } from "../requests/getTournamentPlayerState";

export const useTournamentPlayerState = queryState({
  request: async (
    { environment },
    _1,
    _2,
    tournamentId: string,
  ): Promise<InGamePlayerState[]> => {
    return getTournamentPlayerState(environment, tournamentId);
  },
  pollInterval: 10_000,
  cache: true,
  deps: {
    environment: useEnvironment,
  },
});
