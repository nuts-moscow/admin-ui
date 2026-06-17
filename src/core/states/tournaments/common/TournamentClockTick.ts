export type TournamentClockTournamentStatus =
  | "registration_open"
  | "in_progress"
  | "completed";

export type TournamentClockStepType = "Blind" | "Break";

/**
 * Тик часов (WebSocket ~1 Гц и GET /api/tournaments/{id}/clock).
 * Сверять с OpenAPI: TournamentClockTick, тег «Tournament clock».
 */
export interface TournamentClockTick {
  readonly type: "tournament_clock_tick";
  readonly tournamentId: number;
  readonly serverTimeMs: number;
  readonly tournamentStatus: TournamentClockTournamentStatus;
  readonly clockActive: boolean;
  readonly paused: boolean;
  readonly currentStepIndex: number | null;
  readonly stepType: TournamentClockStepType | null;
  readonly levelId: number | null;
  readonly secondsRemaining: number | null;
  /** Секунды до следующего шага Break после currentStepIndex; иначе null. */
  readonly secondsUntilNextBreak: number | null;
  readonly structureFinished: boolean;
  /** Поздняя регистрация закрыта (бэк закрыл по перерыву с endsLateRegistration). undefined — поля нет в тике. */
  readonly lateRegistrationClosed?: boolean;
  /** Турнирный экран должен показывать рейтинговые очки. undefined — поля нет в тике. */
  readonly showRatingPoints?: boolean;
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

/**
 * number | null — в JSON явно null;
 * undefined — ключей нет (старый контракт без nullable-полей).
 */
function pickNumberOrNull(
  o: Record<string, unknown>,
  camel: string,
  snake: string
): number | null | undefined {
  const hasCamel = Object.prototype.hasOwnProperty.call(o, camel);
  const hasSnake = Object.prototype.hasOwnProperty.call(o, snake);
  if (!hasCamel && !hasSnake) return undefined;
  const v = o[camel] ?? o[snake];
  if (v === null) return null;
  const n = readFiniteNumber(v);
  return n !== undefined ? n : null;
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
): TournamentClockStepType | null | undefined {
  const hasCamel = Object.prototype.hasOwnProperty.call(o, "stepType");
  const hasSnake = Object.prototype.hasOwnProperty.call(o, "step_type");
  if (!hasCamel && !hasSnake) return undefined;
  const v = o.stepType ?? o.step_type;
  if (v === null) return null;
  if (v === "Blind" || v === "Break") return v;
  if (typeof v === "string") {
    const l = v.toLowerCase();
    if (l === "blind") return "Blind";
    if (l === "break") return "Break";
  }
  return null;
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

function parseSecondsUntilNextBreak(
  o: Record<string, unknown>
): number | null | undefined {
  const hasCamel = Object.prototype.hasOwnProperty.call(
    o,
    "secondsUntilNextBreak"
  );
  const hasSnake = Object.prototype.hasOwnProperty.call(
    o,
    "seconds_until_next_break"
  );
  if (!hasCamel && !hasSnake) return undefined;
  const v = o.secondsUntilNextBreak ?? o.seconds_until_next_break;
  if (v === null) return null;
  const n = readFiniteNumber(v);
  return n !== undefined ? n : null;
}

function tickMessageType(o: Record<string, unknown>): "tournament_clock_tick" {
  const t = o.type;
  if (t === "tournament_clock_tick" || t === "TournamentClockTick") {
    return "tournament_clock_tick";
  }
  return "tournament_clock_tick";
}

/**
 * Разбор JSON тика (camelCase / snake_case, доп. поля игнорируются).
 * Старый контракт без nullables маппится в новую форму.
 */
export function tryParseTournamentClockTick(
  raw: unknown
): TournamentClockTick | null {
  const o = asRecord(raw);
  if (!o) return null;

  const tournamentId = pickNumber(o, "tournamentId", "tournament_id");
  const serverTimeMs = pickNumber(o, "serverTimeMs", "server_time_ms");
  if (tournamentId === undefined || serverTimeMs === undefined) {
    return null;
  }

  const paused = pickBool(o, "paused", "paused");
  if (paused === undefined) {
    return null;
  }

  const tournamentStatus =
    pickTournamentStatus(o) ??
    ("tournamentStatus" in o || "tournament_status" in o
      ? "registration_open"
      : "in_progress");

  const structureFinished =
    pickBool(o, "structureFinished", "structure_finished") ?? false;

  let currentStepIndex = pickNumberOrNull(
    o,
    "currentStepIndex",
    "current_step_index"
  );
  if (currentStepIndex === undefined) {
    const legacyIdx = pickNumber(o, "currentStepIndex", "current_step_index");
    currentStepIndex = legacyIdx !== undefined ? legacyIdx : null;
  }

  let stepType = pickStepType(o);
  if (stepType === undefined) {
    const raw = o.stepType ?? o.step_type;
    if (raw === "Blind" || raw === "Break") {
      stepType = raw;
    } else if (typeof raw === "string") {
      const l = raw.toLowerCase();
      if (l === "blind") stepType = "Blind";
      else if (l === "break") stepType = "Break";
      else stepType = currentStepIndex !== null ? "Blind" : null;
    } else {
      stepType = currentStepIndex !== null ? "Blind" : null;
    }
  }

  let levelId = pickNumberOrNull(o, "levelId", "level_id");
  if (levelId === undefined) {
    const legacyId = pickNumber(o, "levelId", "level_id");
    levelId = legacyId !== undefined ? legacyId : null;
  }

  let secondsRemaining = pickNumberOrNull(
    o,
    "secondsRemaining",
    "seconds_remaining"
  );
  if (secondsRemaining === undefined) {
    const legacySec = pickNumber(o, "secondsRemaining", "seconds_remaining");
    secondsRemaining = legacySec !== undefined ? legacySec : null;
  }

  let clockActive = pickBool(o, "clockActive", "clock_active");
  if (clockActive === undefined) {
    clockActive =
      tournamentStatus === "in_progress" &&
      !structureFinished &&
      currentStepIndex !== null &&
      secondsRemaining !== null;
  }

  const secondsUntilNextBreak =
    parseSecondsUntilNextBreak(o) ?? null;

  const lateRegistrationClosed = pickBool(
    o,
    "lateRegistrationClosed",
    "late_registration_closed"
  );
  const showRatingPoints = pickBool(
    o,
    "showRatingPoints",
    "show_rating_points"
  );

  return {
    type: tickMessageType(o),
    tournamentId,
    serverTimeMs,
    tournamentStatus,
    clockActive,
    paused,
    currentStepIndex,
    stepType,
    levelId,
    secondsRemaining,
    secondsUntilNextBreak,
    structureFinished,
    lateRegistrationClosed,
    showRatingPoints,
  };
}

/** MM:SS для таймера уровня. */
export function formatClockSeconds(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/** H:MM:SS при ≥1 ч, иначе MM:SS — для «до перерыва». */
export function formatClockDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
