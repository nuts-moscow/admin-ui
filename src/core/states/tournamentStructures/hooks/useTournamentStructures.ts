import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";

import { getTournamentStructures } from "../requests/getTournamentStructures";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";

const useRefetchTournamentStructures = inMemoryState({
  defaultValue: 1,
});

export const refetchTournamentStructures = () => {
  useRefetchTournamentStructures.setData(
    useRefetchTournamentStructures.data + 1
  );
};

export const useTournamentStructures = queryState({
  request: ({ environment }) => getTournamentStructures(environment),
  pollInterval: 60_000,
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: useRefetchTournamentStructures,
  },
});
