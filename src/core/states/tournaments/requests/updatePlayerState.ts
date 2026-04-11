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
    withCredentials: true,
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

export interface UpdateTournamentPlayerEntryPaymentRequest {
  readonly entryPaymentMethod: PaymentMethod;
  /** Опционально: фактически взято с игрока; без поля — цена входа из настроек турнира. */
  readonly entryPaidAmount?: number;
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
    withCredentials: true,
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
    withCredentials: true,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: async (err) => {
        try {
          const j = (await err.toJson()) as { error?: string; code?: string };
          return new Error(
            JSON.stringify({
              error: typeof j?.error === "string" ? j.error : "Bad request",
              ...(typeof j?.code === "string" ? { code: j.code } : {}),
            }),
          );
        } catch {
          const t = (await err.toText()).trim();
          return new Error(t || "Invalid player entry payment data");
        }
      },
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
  const body: Record<string, unknown> = {
    entryPaymentMethod: request.entryPaymentMethod,
  };
  if (
    request.entryPaidAmount != null &&
    Number.isFinite(request.entryPaidAmount)
  ) {
    body.entryPaidAmount = Math.round(request.entryPaidAmount);
  }
  return securedFetch<Record<string, unknown>, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/in-game-payment`,
    withCredentials: true,
    body,
    mapping: {
      success: (res) => res.toJson(),
      400: async (err) => {
        try {
          const j = (await err.toJson()) as { error?: string; code?: string };
          return new Error(
            JSON.stringify({
              error: typeof j?.error === "string" ? j.error : "Bad request",
              ...(typeof j?.code === "string" ? { code: j.code } : {}),
            }),
          );
        } catch {
          const t = (await err.toText()).trim();
          return new Error(t || "Bad request");
        }
      },
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
    withCredentials: true,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

/** Вернуть вылетевшего в игру без стола: статус по оплате входа + unpaid rebuy на бэкенде. */
export const returnPlayerToGame = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
): Promise<InGamePlayerState> => {
  return securedFetch<undefined, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/return-to-game`,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () =>
        new Error(
          "Нельзя вернуть в игру: неверный статус игрока или нарушены правила турнира",
        ),
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
    withCredentials: true,
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
    withCredentials: true,
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
    withCredentials: true,
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
  /** Фактически оплаченный вход; без поля — entry_price турнира. */
  readonly entryPaidAmount?: number;
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
  if (
    body.entryPaidAmount != null &&
    Number.isFinite(body.entryPaidAmount)
  ) {
    requestBody.entryPaidAmount = Math.round(body.entryPaidAmount);
  }
  return securedFetch<Record<string, unknown>, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/game-start`,
    withCredentials: true,
    body: requestBody,
    mapping: {
      success: (res) => res.toJson(),
      400: async (err) => {
        try {
          const j = (await err.toJson()) as { error?: string; code?: string };
          return new Error(
            JSON.stringify({
              error: typeof j?.error === "string" ? j.error : "Bad request",
              ...(typeof j?.code === "string" ? { code: j.code } : {}),
            }),
          );
        } catch {
          const t = (await err.toText()).trim();
          return new Error(t || "Bad request");
        }
      },
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
