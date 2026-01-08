import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { TournamentStatus } from "../common/TournamentStatus";

export interface TournamentInfoResponse {
  readonly id: number;
  readonly name: string;
  readonly status: TournamentStatus;
  readonly date: number;
}

export const getTournament = async (
  environment: Environment,
  id: string
): Promise<TournamentInfoResponse | null> => {
  return securedFetch<undefined, TournamentInfoResponse | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v1/tournaments/get?id=${id}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => null,
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
};
