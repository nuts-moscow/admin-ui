import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";

import { TournamentStatus } from "../common/TournamentStatus";
import { getTournaments, ShortTournament } from "../requests/getTournaments";

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
  },
});

