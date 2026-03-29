/** Шаг структуры в тике часов (как в GET турнира). */
export type TournamentClockStepType = "Blind" | "Break";

/** Статус турнира в тике (опционально, строки API / OpenAPI). */
export type TournamentClockTournamentStatus =
  | "registration_open"
  | "in_progress"
  | "completed";

/** Один тик часов турнира (WebSocket, ~1 раз/сек). Поля согласовать с OpenAPI бэка. */
export interface TournamentClockTick {
  readonly tournamentId: number;
  readonly serverTimeMs: number;
  readonly paused: boolean;
  readonly currentStepIndex: number;
  readonly stepType: TournamentClockStepType;
  readonly levelId: number;
  readonly secondsRemaining: number;
  readonly tournamentStatus?: TournamentClockTournamentStatus;
  /** Дискриминатор сообщения, если бэк его добавит. */
  readonly messageType?: string;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function readFiniteNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickNumber(
  o: Record<string, unknown>,
  camel: string,
  snake: string
): number | undefined {
  return readFiniteNumber(o[camel]) ?? readFiniteNumber(o[snake]);
}

function pickBool(
  o: Record<string, unknown>,
  camel: string,
  snake: string
): boolean | undefined {
  const v = o[camel] ?? o[snake];
  if (typeof v === "boolean") return v;
  return undefined;
}

function pickStepType(
  o: Record<string, unknown>
): TournamentClockStepType | undefined {
  const v = o.stepType ?? o.step_type;
  if (v === "Blind" || v === "Break") return v;
  if (typeof v === "string") {
    const l = v.toLowerCase();
    if (l === "blind") return "Blind";
    if (l === "break") return "Break";
  }
  return undefined;
}

function pickTournamentStatus(
  o: Record<string, unknown>
): TournamentClockTournamentStatus | undefined {
  const v = o.tournamentStatus ?? o.tournament_status;
  if (typeof v !== "string") return undefined;
  const l = v.toLowerCase().replace(/-/g, "_");
  if (l === "registration_open") return "registration_open";
  if (l === "in_progress" || l === "inprogress") return "in_progress";
  if (l === "completed") return "completed";
  return undefined;
}

/**
 * Разбор JSON тика с доп. полями snake_case / без дискриминатора.
 * Возвращает null, если обязательные поля отсутствуют или некорректны.
 */
export function tryParseTournamentClockTick(
  raw: unknown
): TournamentClockTick | null {
  const o = asRecord(raw);
  if (!o) return null;

  const messageType =
    typeof o.type === "string"
      ? o.type
      : typeof o.messageType === "string"
        ? o.messageType
        : undefined;

  const tournamentId = pickNumber(o, "tournamentId", "tournament_id");
  const serverTimeMs = pickNumber(o, "serverTimeMs", "server_time_ms");
  const paused = pickBool(o, "paused", "paused");
  const currentStepIndex = pickNumber(
    o,
    "currentStepIndex",
    "current_step_index"
  );
  const stepType = pickStepType(o);
  const levelId = pickNumber(o, "levelId", "level_id");
  const secondsRemaining = pickNumber(
    o,
    "secondsRemaining",
    "seconds_remaining"
  );

  if (
    tournamentId === undefined ||
    serverTimeMs === undefined ||
    paused === undefined ||
    currentStepIndex === undefined ||
    stepType === undefined ||
    levelId === undefined ||
    secondsRemaining === undefined
  ) {
    return null;
  }

  return {
    tournamentId,
    serverTimeMs,
    paused,
    currentStepIndex,
    stepType,
    levelId,
    secondsRemaining,
    tournamentStatus: pickTournamentStatus(o),
    messageType,
  };
}

export function formatClockSeconds(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
