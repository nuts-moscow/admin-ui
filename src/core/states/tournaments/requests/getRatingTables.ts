import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface RatingTableSummary {
  readonly id: number;
  readonly name: string;
}

function normalizeRow(r: unknown): RatingTableSummary | null {
  if (r == null || typeof r !== "object") {
    return null;
  }
  const o = r as Record<string, unknown>;
  const id = Number(o.id);
  const name = o.name != null ? String(o.name) : "";
  if (!Number.isFinite(id)) {
    return null;
  }
  return { id, name };
}

function parseListJson(json: unknown): RatingTableSummary[] {
  if (Array.isArray(json)) {
    return json.map(normalizeRow).filter((x): x is RatingTableSummary => x != null);
  }
  if (json != null && typeof json === "object") {
    const o = json as Record<string, unknown>;
    const arr = o.tables ?? o.data ?? o.rating_tables ?? o.ratingTables;
    if (Array.isArray(arr)) {
      return arr.map(normalizeRow).filter((x): x is RatingTableSummary => x != null);
    }
  }
  return [];
}

/** GET списка таблиц: v2, затем без версии и v1. */
const RATING_TABLES_LIST_PATHS = [
  "/v2/api/rating-tables",
  "/api/rating-tables",
  "/v1/api/rating-tables",
] as const;

async function fetchListOnce(
  environment: Environment,
  path: string,
): Promise<RatingTableSummary[]> {
  return securedFetch<undefined, RatingTableSummary[]>({
    method: "GET",
    host: environment.apiUrl,
    path,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => parseListJson(await res.toJson()),
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
}

export const getRatingTables = async (
  environment: Environment,
): Promise<RatingTableSummary[]> => {
  for (const path of RATING_TABLES_LIST_PATHS) {
    const list = await fetchListOnce(environment, path);
    if (list.length > 0) {
      return list;
    }
  }
  return [];
};
