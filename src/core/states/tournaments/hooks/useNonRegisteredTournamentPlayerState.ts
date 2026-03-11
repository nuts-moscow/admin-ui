import { useMemo } from "react";
import { useTournamentPlayerState } from "./useTournamentPlayerState";

export const useNonRegisteredTournamentPlayerState = (tournamentId: string) => {
  const state = useTournamentPlayerState(tournamentId);
  const data = useMemo(
    () => state.data?.filter((player) => player.status !== "Registered"),
    [state.data]
  );

  return {
    ...state,
    data,
  };
};
