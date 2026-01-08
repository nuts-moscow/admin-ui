export type TournamentStatus = "RegistrationOpen" | "InProgress" | "Completed";

export const tournamentStatusLabels: Record<TournamentStatus, string> = {
  RegistrationOpen: "Регистрация открыта",
  InProgress: "идет игра",
  Completed: "Завершен",
};
