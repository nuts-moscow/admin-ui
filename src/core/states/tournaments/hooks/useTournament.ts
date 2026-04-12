import { queryState } from "@/core/stateManager/factories/queryState";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";

import {
  getTournament,
  TournamentInfoResponse,
} from "../requests/getTournament";

const useRefetchTournament = inMemoryState({
  defaultValue: 1,
});

/** Общая зависимость для query (см. `usePublicTournament`) — инкремент при `refetchTournament()`. */
export const tournamentRefetchDependency = useRefetchTournament;

export const refetchTournament = () => {
  useRefetchTournament.setData(useRefetchTournament.data + 1);
};

export const useTournament = queryState({
  request: async (
    { environment },
    _1,
    _2,
    id: string
  ): Promise<TournamentInfoResponse | null> => {
    return getTournament(environment, id);
  },
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: tournamentRefetchDependency,
  },
});
