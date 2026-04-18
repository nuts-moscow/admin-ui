import { queryState } from "@/core/stateManager/factories/queryState";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  type TournamentRatingMatrix,
  getRatingTableMatrix,
} from "../requests/getTournamentRatingMatrix";

const useRefetchRatingTableMatrix = inMemoryState({ defaultValue: 1 });

export const refetchRatingTableMatrix = () => {
  useRefetchRatingTableMatrix.setData(
    useRefetchRatingTableMatrix.data + 1,
  );
};

export const useRatingTableMatrix = queryState({
  request: async (
    { environment },
    _1,
    _2,
    ratingTableId: string,
  ): Promise<TournamentRatingMatrix | null> => {
    const id = ratingTableId.trim();
    if (!id) {
      return null;
    }
    return getRatingTableMatrix(environment, id);
  },
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: useRefetchRatingTableMatrix,
  },
});
