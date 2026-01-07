import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { getPlayer } from "../requests/getPlayer";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";

const useRefetchPlayer = inMemoryState({
  defaultValue: 1,
});

export const refetchPlayer = () => {
  useRefetchPlayer.setData(useRefetchPlayer.data + 1);
};

export const usePlayer = (playerId: number) =>
  queryState({
    request: ({ environment }) => getPlayer(environment, playerId),
    pollInterval: 60_000,
    cache: true,
    deps: {
      environment: useEnvironment,
      refetch: useRefetchPlayer,
    },
  });
