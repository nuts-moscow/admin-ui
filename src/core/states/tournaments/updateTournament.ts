import { Environment } from "@/core/states/environment/Environment";
import { UpdateTournamentRequest } from "./common/UpdateTournamentRequest";
import { ShortTournament } from "./requests/getTournaments";
import { updateTournament as updateTournamentRequest } from "./requests/updateTournament";

export const updateTournament = async (
  environment: Environment,
  request: UpdateTournamentRequest
): Promise<ShortTournament[]> => {
  return updateTournamentRequest(environment, request);
};
