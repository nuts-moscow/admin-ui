import { queryState } from "@/core/stateManager/factories/queryState";
import { inMemoryState } from "@/core/stateManager/factories/inMemoryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  TournamentRatingMatrix,
  getTournamentRatingMatrix,
} from "../requests/getTournamentRatingMatrix";

const useRefetchTournamentRatingMatrix = inMemoryState({ defaultValue: 1 });

export const refetchTournamentRatingMatrix = () => {
  useRefetchTournamentRatingMatrix.setData(
    useRefetchTournamentRatingMatrix.data + 1,
  );
};

/** Матрица не меняется динамически — polling не нужен. */
export const useTournamentRatingMatrix = queryState({
  request: async ({
    environment,
  }): Promise<TournamentRatingMatrix | null> => {
    return getTournamentRatingMatrix(environment);
  },
  cache: true,
  deps: {
    environment: useEnvironment,
    refetch: useRefetchTournamentRatingMatrix,
  },
});
