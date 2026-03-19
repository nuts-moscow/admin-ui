export type TournamentStatus = "RegistrationOpen" | "InProgress" | "Completed";

export const TOURNAMENT_STATUS_VALUES: TournamentStatus[] = [
  "RegistrationOpen",
  "InProgress",
  "Completed",
];

export const tournamentStatusLabels: Record<TournamentStatus, string> = {
  RegistrationOpen: "Регистрация открыта",
  InProgress: "Идет игра",
  Completed: "Завершен",
};

/** Нормализует строку статуса из API к TournamentStatus (RegistrationOpen | InProgress | Completed). */
export function normalizeTournamentStatus(value: string | undefined): TournamentStatus {
  const s = (value ?? "").trim();
  if (s === "RegistrationOpen") return "RegistrationOpen";
  if (s === "InProgress") return "InProgress";
  if (s === "Completed") return "Completed";
  const lower = s.toLowerCase();
  if (lower === "registrationopen") return "RegistrationOpen";
  if (lower === "inprogress") return "InProgress";
  if (lower === "completed") return "Completed";
  if (lower === "registration_open") return "RegistrationOpen";
  if (lower === "in_progress") return "InProgress";
  return "RegistrationOpen";
}
