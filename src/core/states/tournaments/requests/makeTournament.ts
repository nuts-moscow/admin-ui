import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Blinds, normalizeBlindsForApi } from "../../tournamentStructures/common/BlindType";
import { normalizeTournamentStatus } from "../common/TournamentStatus";
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

interface MakeTournamentResponse {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly date: number;
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
  const res = await securedFetch<MakeTournamentBody, MakeTournamentResponse>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v2/api/tournaments",
    withCredentials: false,
    body,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid request body"),
      500: () => new Error("Failed to create tournament"),
    },
  });
  return {
    id: String(res.id),
    name: res.name,
    status: normalizeTournamentStatus(res.status),
    date: res.date,
  };
};
