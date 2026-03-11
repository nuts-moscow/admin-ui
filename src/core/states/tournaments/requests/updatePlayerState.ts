import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState, PaymentMethod } from "../common/InGamePlayerState";
import { UpdatePlayerStateRequest } from "../common/UpdatePlayerStateRequest";

export const updatePlayerState = async (
  environment: Environment,
  request: UpdatePlayerStateRequest,
): Promise<InGamePlayerState> => {
  return securedFetch<UpdatePlayerStateRequest, InGamePlayerState>({
    method: "PUT",
    host: environment.apiUrl,
    path: "/v1/tournaments/update-player-state",
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid player state data"),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

export const setPlayerInGameNotPaidStatus = async (
  environment: Environment,
  tournamentId: number,
  playerId: number,
  tableId?: number,
): Promise<InGamePlayerState> => {
  return updatePlayerState(environment, {
    tournamentId,
    playerId,
    status: "InGameNotPaid",
    tableId,
    freeReentryUsed: 0,
    freeEntryUsed: 0,
  });
};

export const setPlayerTableId = async (
  environment: Environment,
  tournamentId: number,
  playerId: number,
  tableId?: number,
): Promise<InGamePlayerState> => {
  return updatePlayerState(environment, {
    tournamentId,
    playerId,
    tableId,
    freeReentryUsed: 0,
    freeEntryUsed: 0,
  });
};

export const setPlayerInGamePaidStatus = async (
  environment: Environment,
  tournamentId: number,
  playerId: number,
  entyPaymentMethod: PaymentMethod,
  tableId?: number,
): Promise<InGamePlayerState> => {
  return updatePlayerState(environment, {
    tournamentId,
    playerId,
    status: "InGamePaid",
    entyPaymentMethod,
    tableId,
    freeReentryUsed: 0,
    freeEntryUsed: 0,
  });
};

export const setPlayerReentryPayments = async (
  environment: Environment,
  tournamentId: number,
  playerId: number,
  reentryByPaymentMethod: Array<[PaymentMethod, number]>
): Promise<InGamePlayerState> => {
  return updatePlayerState(environment, {
    tournamentId,
    playerId,
    reentryByPaymentMethod,
    freeReentryUsed: 0,
    freeEntryUsed: 0,
  });
};
