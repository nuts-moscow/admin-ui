import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";

import { TournamentStatus } from "../common/TournamentStatus";
import { getTournaments, ShortTournament } from "../requests/getTournaments";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";

const useRefetchTournaments = inMemoryState({
  defaultValue: 1,
});

export const refetchTournaments = () => {
  useRefetchTournaments.setData(useRefetchTournaments.data + 1);
};

export const useTournaments = queryState({
  request: async (
    { environment },
    _1,
    _2,
    status: TournamentStatus
  ): Promise<ShortTournament[]> => {
    return getTournaments(environment, status);
  },
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: useRefetchTournaments,
  },
});
