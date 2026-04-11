"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { getTournamentClockWebSocketUrl } from "../common/tournamentClockWebSocketUrl";
import {
  tryParseTournamentClockTick,
  type TournamentClockTick,
} from "../common/TournamentClockTick";
import { getTournamentClock } from "../requests/getTournamentClock";
import { Environment } from "../../environment/Environment";

export type TournamentClockConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

const BACKOFF_MS = [1000, 2000, 5000] as const;
const BACKOFF_MAX_MS = 30_000;

function nextBackoffMs(attempt: number): number {
  if (attempt < BACKOFF_MS.length) return BACKOFF_MS[attempt];
  return BACKOFF_MAX_MS;
}

export interface UseTournamentClockOptions {
  /** Если false — сокет не открываем (например турнир не в игре). */
  readonly enabled?: boolean;
  /** Переопределить функцию получения REST-снимка часов (напр. публичный эндпоинт). */
  readonly getClockFn?: (
    environment: Environment,
    id: string,
  ) => Promise<TournamentClockTick | null>;
  /** Переопределить функцию построения WebSocket URL (напр. публичный эндпоинт). */
  readonly wsUrlFn?: (environment: Environment, id: number | string) => string;
}

export interface TournamentClockBinding {
  readonly tick: TournamentClockTick | null;
  readonly connectionStatus: TournamentClockConnectionStatus;
}

export interface UseTournamentClockResult extends TournamentClockBinding {
  /** Оценка сдвига serverTime − клиент (мс) по последнему тику. */
  readonly serverSkewMs: number | null;
  readonly reconnectAttempt: number;
}

/**
 * Подписка на поток тиков часов турнира. Источник истины — значения с сервера;
 * локально secondsRemaining не уменьшается между тиками.
 */
export function useTournamentClock(
  tournamentId: number | string | undefined,
  options: UseTournamentClockOptions = {}
): UseTournamentClockResult {
  const {
    enabled = true,
    getClockFn = getTournamentClock,
    wsUrlFn = getTournamentClockWebSocketUrl,
  } = options;
  const environment = useEnvironment();
  const [tick, setTick] = useState<TournamentClockTick | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<TournamentClockConnectionStatus>("idle");
  const [serverSkewMs, setServerSkewMs] = useState<number | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const attemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const closedByUnmountRef = useRef(false);

  const clearReconnect = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  /** Начальный снимок с REST до первого сообщения WebSocket. */
  useEffect(() => {
    const id = tournamentId != null ? String(tournamentId).trim() : "";
    if (!id || !enabled) return;
    let cancelled = false;
    void (async () => {
      try {
        const snap = await getClockFn(environment, id);
        if (!cancelled && snap) {
          setTick(snap);
          setServerSkewMs(snap.serverTimeMs - Date.now());
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [environment, tournamentId, enabled, getClockFn]);

  useEffect(() => {
    closedByUnmountRef.current = false;
    const id = tournamentId != null ? String(tournamentId).trim() : "";
    if (!id || !enabled) {
      clearReconnect();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setTick(null);
      setConnectionStatus("idle");
      setServerSkewMs(null);
      setReconnectAttempt(0);
      attemptRef.current = 0;
      return;
    }

    const url = wsUrlFn(environment, id);
    if (!url) {
      setConnectionStatus("error");
      return;
    }

    const connect = () => {
      if (closedByUnmountRef.current) return;

      clearReconnect();
      setConnectionStatus("connecting");

      let socket: WebSocket;
      try {
        socket = new WebSocket(url);
      } catch {
        setConnectionStatus("error");
        scheduleReconnect();
        return;
      }

      wsRef.current = socket;

      socket.onopen = () => {
        if (wsRef.current !== socket) return;
        attemptRef.current = 0;
        setReconnectAttempt(0);
        setConnectionStatus("open");
      };

      socket.onmessage = (ev) => {
        if (wsRef.current !== socket) return;
        if (typeof ev.data !== "string") return;
        let raw: unknown;
        try {
          raw = JSON.parse(ev.data) as unknown;
        } catch {
          return;
        }
        const parsed = tryParseTournamentClockTick(raw);
        if (!parsed) return;
        const receiveMs = Date.now();
        setTick(parsed);
        setServerSkewMs(parsed.serverTimeMs - receiveMs);
      };

      socket.onerror = () => {
        if (wsRef.current !== socket) return;
        setConnectionStatus("error");
      };

      socket.onclose = () => {
        if (wsRef.current !== socket) return;
        wsRef.current = null;
        setConnectionStatus("closed");
        if (!closedByUnmountRef.current) {
          scheduleReconnect();
        }
      };
    };

    const scheduleReconnect = () => {
      if (closedByUnmountRef.current) return;
      const a = attemptRef.current;
      const delay = nextBackoffMs(a);
      attemptRef.current = a + 1;
      setReconnectAttempt(a + 1);
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delay);
    };

    attemptRef.current = 0;
    setReconnectAttempt(0);
    connect();

    return () => {
      closedByUnmountRef.current = true;
      clearReconnect();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnectionStatus("idle");
      setTick(null);
      setServerSkewMs(null);
    };
  }, [environment, tournamentId, enabled, clearReconnect, wsUrlFn]);

  return {
    tick,
    connectionStatus,
    serverSkewMs,
    reconnectAttempt,
  };
}
