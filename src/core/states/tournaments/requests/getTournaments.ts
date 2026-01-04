import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { TournamentStatus } from "../common/TournamentStatus";

export interface ShortTournament {
  readonly id: string;
  readonly name: string;
  readonly date: number;
}

export const getTournaments = async (
  environment: Environment,
  status: TournamentStatus
): Promise<ShortTournament[]> => {
  return securedFetch<undefined, ShortTournament[]>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v1/tournaments/list?tournament-status=${status}`,
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
