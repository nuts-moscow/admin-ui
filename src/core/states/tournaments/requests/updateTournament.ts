import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { UpdateTournamentRequest } from "../common/UpdateTournamentRequest";
import { ShortTournament } from "./getTournaments";
import {
  Blinds,
  normalizeBlindsForApi,
} from "@/core/states/tournamentStructures/common/BlindType";

export const updateTournament = async (
  environment: Environment,
  request: UpdateTournamentRequest,
): Promise<ShortTournament[]> => {
  return securedFetch<UpdateTournamentRequest, ShortTournament[]>({
    method: "PUT",
    host: environment.apiUrl,
    path: "/v1/tournaments/update",
    withCredentials: false,
    body: {
      ...request,

      structure: {
        ...request.structure,
        // @ts-ignore
        blinds: request.structure.blindsStructure,
      },
    },
    mapping: {
      success: (res) => res.toJson(),
      400: () => [],
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  }) as any;
};

/** PATCH /v2/api/tournaments/{id}/status — обновляет только статус (UpdateTournamentStatusBody). */
export const updateTournamentStatus = async (
  environment: Environment,
  tournamentId: number,
  status: "in_progress" | "completed",
): Promise<void> => {
  await securedFetch<{ status: string }, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/status`,
    withCredentials: false,
    body: { status },
    mapping: {
      success: () => undefined,
      400: () => {
        throw new Error("Invalid request");
      },
      404: () => {
        throw new Error("Tournament not found");
      },
      500: () => {
        throw new Error("Failed to update status");
      },
      unknownError: () => {
        throw new Error("Failed to update status");
      },
    },
  });
};

export const launchTournament = async (
  environment: Environment,
  request: UpdateTournamentRequest,
): Promise<void> => {
  await updateTournamentStatus(environment, request.id, "in_progress");
};

export const completeTournament = async (
  environment: Environment,
  request: UpdateTournamentRequest,
): Promise<void> => {
  await updateTournamentStatus(environment, request.id, "completed");
};

/** Body for PATCH v2/api/tournaments/{id}/structure (MakeTournamentStructureBody). */
interface MakeTournamentStructureBody {
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  readonly blinds: ReturnType<typeof normalizeBlindsForApi>;
}

async function updateTournamentStructureCache(
  environment: Environment,
  tournamentId: number,
  body: MakeTournamentStructureBody
): Promise<void> {
  await securedFetch<MakeTournamentStructureBody, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/structure`,
    withCredentials: false,
    body,
    mapping: {
      success: () => undefined,
      400: () => new Error("Invalid request body"),
      404: () => new Error("Tournament not found"),
      500: () => new Error("Failed to update structure"),
    },
  });
}

export const updateStructure = async (
  environment: Environment,
  request: UpdateTournamentRequest,
  blinds?: Blinds
): Promise<void> => {
  const structure = request.structure;
  const blindsList = blinds ?? structure.blindsStructure;
  if (!blindsList?.length) {
    throw new Error("Blinds are required");
  }
  await updateTournamentStructureCache(environment, request.id, {
    name: structure.name,
    playersLimit: structure.playersLimit,
    stackSize: structure.stackSize,
    freezeOutEnabled: structure.freezeOutEnabled,
    blinds: normalizeBlindsForApi(blindsList),
  });
};
