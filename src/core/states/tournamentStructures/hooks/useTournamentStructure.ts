import { useEnvironment } from "../../environment/useEnvironment";

import { queryState } from "@/core/stateManager/factories/queryState";
import { getTournamentStructure } from "../requests/getTournamentStructure";

export const useTournamentStructure = (id: number) =>
  queryState({
    request: ({ environment }) => getTournamentStructure(id, environment),
    cache: true,
    deps: {
      environment: useEnvironment,
    },
  });
