import { Environment } from "../../environment/Environment";

/**
 * URL WebSocket часов турнира. Хост совпадает с Admin API (`environment.apiUrl`).
 * Путь: `/v2/ws/tournaments/:tournamentId/clock` — уточнить в OpenAPI / деплое при смене прокси.
 */
export function getTournamentClockWebSocketUrl(
  environment: Environment,
  tournamentId: number | string
): string {
  let base: URL;
  try {
    base = new URL(environment.apiUrl);
  } catch {
    return "";
  }
  const protocol = base.protocol === "https:" ? "wss:" : "ws:";
  const host = base.host;
  const id = encodeURIComponent(String(tournamentId).trim());
  if (!id) return "";
  return `${protocol}//${host}/v2/ws/tournaments/${id}/clock`;
}

/**
 * Публичный WebSocket часов — не требует авторизации.
 */
export function getPublicTournamentClockWebSocketUrl(
  environment: Environment,
  tournamentId: number | string,
): string {
  let base: URL;
  try {
    base = new URL(environment.apiUrl);
  } catch {
    return "";
  }
  const protocol = base.protocol === "https:" ? "wss:" : "ws:";
  const host = base.host;
  const id = encodeURIComponent(String(tournamentId).trim());
  if (!id) return "";
  return `${protocol}//${host}/v2/ws/public/tournaments/${id}/clock`;
}
