import { Environment } from "@/core/states/environment/Environment";
import { TournamentStructure } from "../common/TournamentStructure";
import { Blinds, normalizeBlindsForApi } from "../common/BlindType";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { MakeTournamentStructureRequest } from "../../tournaments/common/UpdateTournamentRequest";

export interface UpdateTournamentStructureRequest
  extends MakeTournamentStructureRequest {
  readonly id: number;
  readonly blinds?: Blinds;
}

/** Body for PATCH v2/api/tournament-structures/{id} (MakeTournamentStructureBody). */
interface MakeTournamentStructureBody {
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  readonly entryFreeOnly: boolean;
  readonly blinds: ReturnType<typeof normalizeBlindsForApi>;
  readonly maxReentries?: number;
}

function toUpdateBody(
  request: UpdateTournamentStructureRequest
): MakeTournamentStructureBody {
  const blinds = request.blinds ?? request.blindsStructure;
  if (!blinds?.length) {
    throw new Error("Blinds are required");
  }
  const mr = request.maxReentries;
  return {
    name: request.name,
    playersLimit: request.playersLimit,
    stackSize: request.stackSize,
    freezeOutEnabled: request.freezeOutEnabled === true,
    entryFreeOnly: request.entryFreeOnly === true,
    blinds: normalizeBlindsForApi(blinds),
    ...(mr != null && Number.isFinite(mr) && mr >= 0
      ? { maxReentries: Math.floor(mr) }
      : {}),
  };
}

export const updateTournamentStructure = async (
  environment: Environment,
  request: UpdateTournamentStructureRequest
): Promise<TournamentStructure> => {
  const { id } = request;
  return securedFetch<MakeTournamentStructureBody, TournamentStructure>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournament-structures/${id}`,
    withCredentials: false,
    body: toUpdateBody(request),
    mapping: {
      success: async (res) => (await res.toJson()) as TournamentStructure,
      400: () => new Error("Invalid request body"),
      404: () => new Error("Structure not found"),
      500: () => new Error("Failed to update structure"),
    },
  });
};
