import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  getTournamentCashRegister,
  TournamentCashRegisterResponse,
} from "../requests/getTournamentCashRegister";

export const useTournamentCashRegister = queryState({
  request: async (
    { environment },
    _1,
    _2,
    tournamentId: string
  ): Promise<TournamentCashRegisterResponse | null> => {
    return getTournamentCashRegister(environment, tournamentId);
  },
  pollInterval: 10_000,
  cache: true,
  deps: {
    environment: useEnvironment,
  },
});
