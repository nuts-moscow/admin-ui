import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import {
  TournamentStatus,
  normalizeTournamentStatus,
} from "../common/TournamentStatus";

export interface ShortTournament {
  readonly id: string;
  readonly name: string;
  readonly status: TournamentStatus;
  readonly date: number;
}

/** Элемент ответа GET v2/api/tournaments (TournamentResponse). */
interface TournamentResponseItem {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly date: number;
}

function toShortTournament(t: TournamentResponseItem): ShortTournament {
  return {
    id: String(t.id),
    name: t.name,
    status: normalizeTournamentStatus(t.status),
    date: t.date,
  };
}

function toTournamentList(value: unknown): ShortTournament[] {
  const raw: TournamentResponseItem[] = [];
  if (Array.isArray(value)) {
    raw.push(...(value as TournamentResponseItem[]));
  } else if (
    value &&
    typeof value === "object" &&
    "tournaments" in value &&
    Array.isArray((value as { tournaments: unknown }).tournaments)
  ) {
    raw.push(...(value as { tournaments: TournamentResponseItem[] }).tournaments);
  }
  return raw.map(toShortTournament);
}

export interface GetTournamentsOptions {
  readonly offset?: number;
  readonly limit?: number;
}

export const getTournaments = async (
  environment: Environment,
  status?: TournamentStatus
): Promise<ShortTournament[]> => {
  const params = new URLSearchParams();
  params.set("limit", "1000");
  const path = `/v2/api/tournaments?${params.toString()}`;

  const list = await securedFetch<undefined, ShortTournament[]>({
    method: "GET",
    host: environment.apiUrl,
    path,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => toTournamentList(await res.toJson()),
      400: () => {
        throw new Error("Invalid query params");
      },
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });

  if (status != null) {
    return list.filter((t) => t.status === status);
  }
  return list;
};
