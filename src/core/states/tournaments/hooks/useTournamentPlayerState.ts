import { queryState } from "@/core/stateManager/factories/queryState";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { InGamePlayerState } from "../common/InGamePlayerState";
import { getTournamentPlayerState } from "../requests/getTournamentPlayerState";

const useRefetchTournamentPlayerState = inMemoryState({
  defaultValue: 1,
});

export const refetchTournamentPlayerState = () => {
  useRefetchTournamentPlayerState.setData(
    useRefetchTournamentPlayerState.data + 1
  );
};

export const useTournamentPlayerState = queryState({
  request: async (
    { environment },
    _1,
    _2,
    tournamentId: string,
  ): Promise<InGamePlayerState[]> => {
    return getTournamentPlayerState(environment, tournamentId);
  },
  pollInterval: 1_000,
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: useRefetchTournamentPlayerState,
  },
});
