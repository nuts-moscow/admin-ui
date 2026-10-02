import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { getTournamentVenues } from "../requests/tournamentVenues";

export const useTournamentVenues = queryState({
  request: async ({ environment }) => getTournamentVenues(environment),
  cache: true,
  deps: { environment: useEnvironment },
});
