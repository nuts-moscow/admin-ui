import { queryState } from "@/core/stateManager/factories/queryState";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  getTournamentRebuyCount,
  TournamentRebuyCountResponse,
} from "../requests/getTournamentRebuyCount";

const useRefetchTournamentRebuyCount = inMemoryState({
  defaultValue: 1,
});

export const refetchTournamentRebuyCount = () => {
  useRefetchTournamentRebuyCount.setData(
    useRefetchTournamentRebuyCount.data + 1
  );
};

export const useTournamentRebuyCount = queryState({
  request: async (
    { environment },
    _1,
    _2,
    tournamentId: string
  ): Promise<TournamentRebuyCountResponse | null> => {
    return getTournamentRebuyCount(environment, tournamentId);
  },
  pollInterval: 10_000,
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: useRefetchTournamentRebuyCount,
  },
});
