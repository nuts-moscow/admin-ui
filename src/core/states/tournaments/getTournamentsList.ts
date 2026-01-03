import { queryState } from "@/core/stateManager/factories/queryState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { Environment } from "@/core/states/environment/Environment";
import { Tournament, TournamentStatus } from "./types";
import { securedFetch } from "@/core/utils/misc/securedFetch";

export const getTournamentsList = async (
  environment: Environment,
  status?: TournamentStatus
): Promise<Tournament[]> => {
  const path = status
    ? `/v1/tournaments/list?tournament-status=${status}`
    : "/v1/tournaments/list";

  return securedFetch<undefined, Tournament[]>({
    method: "GET",
    host: environment.apiUrl,
    path,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => [],
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
};

export const useTournamentsList = (status?: TournamentStatus) =>
  queryState({
    request: async ({ environment }): Promise<Tournament[]> => {
      return getTournamentsList(environment, status);
    },
    pollInterval: 30_000,
    cache: true,
    deps: {
      environment: useEnvironment,
    },
  });
