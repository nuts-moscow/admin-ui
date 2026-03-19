import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Blinds, normalizeBlindsForApi } from "../../tournamentStructures/common/BlindType";
import { ShortTournament } from "./getTournaments";

export interface MakeTournamentRequest {
  readonly name: string;
  readonly date: number;
  readonly structure: {
    readonly name: string;
    readonly playersLimit: number;
    readonly stackSize: number;
    readonly freezeOutEnabled: boolean;
    readonly blinds: Blinds;
  };
}

/** Body for POST v2/api/tournaments (MakeTournamentBody). */
interface MakeTournamentBody {
  readonly name: string;
  readonly date: number;
  readonly structure: {
    readonly name: string;
    readonly playersLimit: number;
    readonly stackSize: number;
    readonly freezeOutEnabled: boolean;
    readonly blinds: ReturnType<typeof normalizeBlindsForApi>;
  };
}

function toMakeTournamentBody(request: MakeTournamentRequest): MakeTournamentBody {
  if (!request.structure.blinds?.length) {
    throw new Error("Structure blinds are required");
  }
  return {
    name: request.name,
    date: request.date,
    structure: {
      name: request.structure.name,
      playersLimit: request.structure.playersLimit,
      stackSize: request.structure.stackSize,
      freezeOutEnabled: request.structure.freezeOutEnabled,
      blinds: normalizeBlindsForApi(request.structure.blinds),
    },
  };
}

export const makeTournament = async (
  environment: Environment,
  request: MakeTournamentRequest
): Promise<ShortTournament> => {
  const body = toMakeTournamentBody(request);
  const res = await securedFetch<MakeTournamentBody, { id: number; name: string; status: string; date: number }>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v2/api/tournaments",
    withCredentials: false,
    body,
    mapping: {
      success: async (res) => (await res.toJson()) as { id: number; name: string; status: string; date: number },
      400: () => new Error("Invalid request body"),
      500: () => new Error("Failed to create tournament"),
    },
  });
  return {
    id: String(res.id),
    name: res.name,
    status: res.status,
    date: res.date,
  };
};
