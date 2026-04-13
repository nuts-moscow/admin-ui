import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Blinds, normalizeBlindsForApi } from "../../tournamentStructures/common/BlindType";
import { normalizeTournamentStatus } from "../common/TournamentStatus";
import { ShortTournament } from "./getTournaments";

export interface MakeTournamentRequest {
  readonly name: string;
  readonly date: number;
  /** Опционально; без значения бэкенд подставит 10. */
  readonly ratingGuaranteeBonusPoints?: number;
  readonly structure: {
    readonly name: string;
    readonly playersLimit: number;
    readonly stackSize: number;
    readonly freezeOutEnabled: boolean;
    readonly entryFreeOnly?: boolean;
    readonly maxReentries?: number;
    readonly blinds: Blinds;
  };
}

/** Body for POST v2/api/tournaments (MakeTournamentBody). */
interface MakeTournamentBody {
  readonly name: string;
  readonly date: number;
  readonly ratingGuaranteeBonusPoints?: number;
  readonly structure: {
    readonly name: string;
    readonly playersLimit: number;
    readonly stackSize: number;
    readonly freezeOutEnabled: boolean;
    readonly entryFreeOnly: boolean;
    readonly blinds: ReturnType<typeof normalizeBlindsForApi>;
    readonly maxReentries?: number;
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
  const mr = request.structure.maxReentries;
  const bonus = request.ratingGuaranteeBonusPoints;
  return {
    name: request.name,
    date: request.date,
    ...(bonus != null &&
    Number.isFinite(bonus) &&
    bonus >= 0 &&
    Number.isInteger(bonus)
      ? { ratingGuaranteeBonusPoints: Math.floor(bonus) }
      : {}),
    structure: {
      name: request.structure.name,
      playersLimit: request.structure.playersLimit,
      stackSize: request.structure.stackSize,
      freezeOutEnabled: request.structure.freezeOutEnabled,
      entryFreeOnly: request.structure.entryFreeOnly === true,
      blinds: normalizeBlindsForApi(request.structure.blinds),
      ...(mr != null && Number.isFinite(mr) && mr >= 0
        ? { maxReentries: Math.floor(mr) }
        : {}),
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
    withCredentials: true,
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
