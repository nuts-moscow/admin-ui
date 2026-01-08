import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";

import {
  getTournament,
  TournamentInfoResponse,
} from "../requests/getTournament";

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
  },
});
