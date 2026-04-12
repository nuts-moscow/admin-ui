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
 * WebSocket для публичного эфира (tournament-clock-list, display без JWT).
 *
 * По умолчанию использует **тот же путь**, что и админка: `/v2/ws/tournaments/:id/clock`.
 * Браузер не шлёт `Authorization` на WebSocket — отдельный URL с сегментом `public`
 * имеет смысл только если бэкенд реально поднял второй маршрут.
 *
 * Чтобы включить `wss://…/v2/ws/public/tournaments/:id/clock`, задайте в `.env`:
 * `NEXT_PUBLIC_CLOCK_WS_USE_PUBLIC_SEGMENT=true`
 */
export function getPublicTournamentClockWebSocketUrl(
  environment: Environment,
  tournamentId: number | string,
): string {
  const useDedicatedPublic =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CLOCK_WS_USE_PUBLIC_SEGMENT === "true";
  if (!useDedicatedPublic) {
    return getTournamentClockWebSocketUrl(environment, tournamentId);
  }

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
