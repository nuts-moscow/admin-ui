import { queryState } from "@/core/stateManager/factories/queryState";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { getRatingTables } from "../requests/getRatingTables";
import type { RatingTableSummary } from "../requests/getRatingTables";

const useRefetchRatingTables = inMemoryState({ defaultValue: 1 });

export const refetchRatingTables = () => {
  useRefetchRatingTables.setData(useRefetchRatingTables.data + 1);
};

export const useRatingTables = queryState({
  request: async ({
    environment,
  }): Promise<RatingTableSummary[]> => {
    return getRatingTables(environment);
  },
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: useRefetchRatingTables,
  },
});
