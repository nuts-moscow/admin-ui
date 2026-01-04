import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";

import { getTournamentStructures } from "../requests/getTournamentStructures";

export const useTournamentStructures = queryState({
  request: ({ environment }) => getTournamentStructures(environment),
  pollInterval: 60_000,
  cache: true,
  deps: {
    environment: useEnvironment,
  },
});
