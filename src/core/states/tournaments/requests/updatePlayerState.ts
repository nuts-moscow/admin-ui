import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import {
  InGamePlayerState,
  PaymentMethod,
  PlayerStatus,
} from "../common/InGamePlayerState";
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

interface UpdateTournamentPlayerStatusRequest {
  readonly status: PlayerStatus;
}

interface UpdateTournamentPlayerTableRequest {
  readonly tableId: string;
}

interface UpdateTournamentPlayerEntryPaymentRequest {
  readonly entryPaymentMethod: PaymentMethod;
}

const updateTournamentPlayerStatus = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  request: UpdateTournamentPlayerStatusRequest,
): Promise<InGamePlayerState> => {
  return securedFetch<UpdateTournamentPlayerStatusRequest, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/status`,
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid player status data"),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

const updateTournamentPlayerEntryPayment = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  request: UpdateTournamentPlayerEntryPaymentRequest
): Promise<InGamePlayerState> => {
  return securedFetch<UpdateTournamentPlayerEntryPaymentRequest, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/entry-payment`,
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid player entry payment data"),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

const updateTournamentPlayerTable = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  request: UpdateTournamentPlayerTableRequest,
): Promise<InGamePlayerState> => {
  return securedFetch<UpdateTournamentPlayerTableRequest, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/table`,
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid player table data"),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

export const setPlayerInGameNotPaidStatus = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  tableId?: string,
): Promise<InGamePlayerState> => {
  void tableId;
  return updateTournamentPlayerStatus(environment, tournamentId, playerId, {
    status: "InGameNotPaid",
  });
};

export const setTournamentPlayerRegisteredStatus = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
): Promise<InGamePlayerState> => {
  return updateTournamentPlayerStatus(environment, tournamentId, playerId, {
    status: "Registered",
  });
};

export const setPlayerTableId = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  tableId?: string,
): Promise<InGamePlayerState> => {
  if (tableId) {
    return updateTournamentPlayerTable(environment, tournamentId, playerId, {
      tableId,
    });
  }

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
  playerId: string,
  entyPaymentMethod: PaymentMethod,
): Promise<InGamePlayerState> => {
  await updateTournamentPlayerStatus(environment, tournamentId, playerId, {
    status: "InGamePaid",
  });
  return updateTournamentPlayerEntryPayment(environment, tournamentId, playerId, {
    entryPaymentMethod: entyPaymentMethod,
  });
};

export const setPlayerReentryPayments = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  reentryByPaymentMethod: PaymentMethod[],
): Promise<InGamePlayerState> => {
  return updatePlayerState(environment, {
    tournamentId,
    playerId,
    reentryByPaymentMethod,
    freeReentryUsed: 0,
    freeEntryUsed: 0,
  });
};

export const setTournamentPlayerOutStatus = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
): Promise<InGamePlayerState> => {
  return updateTournamentPlayerStatus(environment, tournamentId, playerId, {
    status: "Out",
  });
};

export const setTournamentPlayerKnockedOut = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  currentBountyCount: number,
): Promise<InGamePlayerState> => {
  return updatePlayerState(environment, {
    tournamentId,
    playerId,
    bountyCount: currentBountyCount + 1,
    freeReentryUsed: 0,
    freeEntryUsed: 0,
  });
};
