import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { getPlayers } from "../requests/getPlayers";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";

const useRefetchPlayers = inMemoryState({
  defaultValue: 1,
});

export const refetchPlayers = () => {
  useRefetchPlayers.setData(useRefetchPlayers.data + 1);
};

export const usePlayers = queryState({
  request: ({ environment }) => getPlayers(environment),
  pollInterval: 60_000,
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: useRefetchPlayers,
  },
});

