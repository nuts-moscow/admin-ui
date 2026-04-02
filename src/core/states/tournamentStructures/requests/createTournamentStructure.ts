import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Blinds, normalizeBlindsForApi } from "../common/BlindType";
import { TournamentStructure } from "../common/TournamentStructure";

export interface CreateTournamentStructureRequest {
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  readonly maxReentries?: number;
  readonly blinds?: Blinds;
}

/** Body for POST v2/api/tournament-structures (MakeTournamentStructureBody). */
interface MakeTournamentStructureBody {
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  readonly blinds: ReturnType<typeof normalizeBlindsForApi>;
  readonly maxReentries?: number;
}

function toCreateBody(
  request: CreateTournamentStructureRequest
): MakeTournamentStructureBody {
  if (!request.blinds?.length) {
    throw new Error("Blinds are required");
  }
  const mr = request.maxReentries;
  return {
    name: request.name,
    playersLimit: request.playersLimit,
    stackSize: request.stackSize,
    freezeOutEnabled: request.freezeOutEnabled === true,
    blinds: normalizeBlindsForApi(request.blinds),
    ...(mr != null && Number.isFinite(mr) && mr >= 0
      ? { maxReentries: Math.floor(mr) }
      : {}),
  };
}

export const createTournamentStructure = async (
  environment: Environment,
  request: CreateTournamentStructureRequest
): Promise<TournamentStructure> => {
  return securedFetch<MakeTournamentStructureBody, TournamentStructure>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v2/api/tournament-structures",
    withCredentials: false,
    body: toCreateBody(request),
    mapping: {
      success: async (res) => (await res.toJson()) as TournamentStructure,
      400: () => new Error("Invalid request body"),
      500: () => new Error("Failed to create structure"),
    },
  });
};
