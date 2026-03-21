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

interface AddTournamentPlayerBountyRequest {
  readonly bountyCountToAdd: number;
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

export const inGamePayment = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  request: UpdateTournamentPlayerEntryPaymentRequest,
): Promise<InGamePlayerState> => {
  return securedFetch<UpdateTournamentPlayerEntryPaymentRequest, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/in-game-payment`,
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid body or player must be in InGameNotPaid status"),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

export const rollbackGameStart = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
): Promise<InGamePlayerState> => {
  return securedFetch<undefined, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/rollback-game-start`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
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

export const addTournamentPlayerBounty = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  count = 1,
): Promise<InGamePlayerState> => {
  return securedFetch<AddTournamentPlayerBountyRequest, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/bounty/update`,
    withCredentials: false,
    body: { bountyCountToAdd: count },
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid player bounty data"),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

const removeTournamentPlayerTable = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
): Promise<InGamePlayerState> => {
  return securedFetch<undefined, InGamePlayerState>({
    method: "DELETE",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/table`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

export interface PlayerGameStartBody {
  readonly entryPaymentMethod?: PaymentMethod;
  readonly tableId?: string;
  /** EarlyBird при посадке за стол (POST game-start, поле EarlyBirdFlag). */
  readonly earlyBirdFlag?: boolean;
}

export const playerGameStart = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  body: PlayerGameStartBody = {},
): Promise<InGamePlayerState> => {
  const requestBody: Record<string, unknown> = {};
  if (body.entryPaymentMethod != null) {
    requestBody.entryPaymentMethod = body.entryPaymentMethod;
  }
  if (body.tableId != null && body.tableId !== "") {
    requestBody.tableId = body.tableId;
  }
  if (body.earlyBirdFlag !== undefined) {
    requestBody.EarlyBirdFlag = body.earlyBirdFlag;
  }
  return securedFetch<Record<string, unknown>, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/game-start`,
    withCredentials: false,
    body: requestBody,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Player must be in Registered status, or table has too many players (max 10)"),
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
  return playerGameStart(environment, tournamentId, playerId, {
    ...(tableId ? { tableId } : {}),
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

export const removePlayerFromTable = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
): Promise<InGamePlayerState> => {
  return removeTournamentPlayerTable(environment, tournamentId, playerId);
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
