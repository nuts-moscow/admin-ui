import { securedFetch } from "@/core/utils/misc/securedFetch";
import { TournamentStructure } from "../common/TournamentStructure";
import { Environment } from "../../environment/Environment";

export interface GetTournamentStructuresOptions {
  readonly offset?: number;
  readonly limit?: number;
}

function toStructureList(value: unknown): TournamentStructure[] {
  if (value && typeof value === "object" && "structures" in value) {
    const arr = (value as { structures: unknown }).structures;
    return Array.isArray(arr) ? arr : [];
  }
  return [];
}

export const getTournamentStructures = (
  environment: Environment,
  options?: GetTournamentStructuresOptions
) => {
  const params = new URLSearchParams();
  if (options?.offset != null) params.set("offset", String(options.offset));
  if (options?.limit != null) params.set("limit", String(options.limit));
  const query = params.toString();
  const path = `/v2/api/tournament-structures${query ? `?${query}` : ""}`;

  return securedFetch<undefined, TournamentStructure[]>({
    method: "GET",
    host: environment.apiUrl,
    path,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => toStructureList(await res.toJson()),
      400: () => new Error("Invalid query params"),
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
};
