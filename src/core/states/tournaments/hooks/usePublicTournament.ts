import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { getPublicTournamentDetail } from "../requests/getPublicTournamentDetail";
import { TournamentInfoResponse } from "../requests/getTournament";
import { tournamentRefetchDependency } from "./useTournament";

export const usePublicTournament = queryState({
  request: async (
    { environment },
    _1,
    _2,
    id: string,
  ): Promise<TournamentInfoResponse | null> => {
    return getPublicTournamentDetail(environment, id);
  },
  cache: true,
  deps: {
    environment: useEnvironment,
    /** Как у `useTournament`: после старта турнира админка вызывает `refetchTournament()`. */
    refetch: tournamentRefetchDependency,
  },
});
