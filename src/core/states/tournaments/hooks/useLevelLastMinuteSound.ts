"use client";

import { useEffect, useRef } from "react";
import type { TournamentClockTick } from "@/core/states/tournaments/common/TournamentClockTick";
import { playLevelEndingSoonSound } from "@/core/states/tournaments/common/playLevelEndingSoonSound";

const LAST_MINUTE_SEC = 60;

/**
 * Один раз за шаг часов: при переходе оставшегося времени с >60 с до ≤60 с
 * на активном уровне блайндов (не перерыв, не пауза таймера).
 *
 * @param enabled — например только страница `/tournament-clock-list/*`.
 */
export function useLevelLastMinuteSound(
  tick: TournamentClockTick | null | undefined,
  enabled = true,
): void {
  const prevSecondsRef = useRef<number | null>(null);
  const prevStepKeyRef = useRef<string | null>(null);
  const playedForStepKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      prevSecondsRef.current = null;
      prevStepKeyRef.current = null;
      playedForStepKeyRef.current = null;
      return;
    }

    if (!tick) {
      prevSecondsRef.current = null;
      return;
    }

    if (tick.paused || !tick.clockActive || tick.structureFinished) {
      prevSecondsRef.current =
        tick.secondsRemaining != null ? tick.secondsRemaining : null;
      return;
    }

    if (tick.stepType === "Break") {
      prevSecondsRef.current =
        tick.secondsRemaining != null ? tick.secondsRemaining : null;
      return;
    }

    const secs = tick.secondsRemaining;
    if (secs == null) {
      prevSecondsRef.current = null;
      return;
    }

    const stepKey = `${tick.tournamentId}|${tick.levelId ?? "x"}|${tick.currentStepIndex ?? "x"}|${tick.stepType ?? "Blind"}`;

    if (prevStepKeyRef.current !== stepKey) {
      prevStepKeyRef.current = stepKey;
      playedForStepKeyRef.current = null;
      prevSecondsRef.current = null;
    }

    const prev = prevSecondsRef.current;
    prevSecondsRef.current = secs;

    if (prev === null) {
      return;
    }

    if (
      prev > LAST_MINUTE_SEC &&
      secs <= LAST_MINUTE_SEC &&
      secs > 0 &&
      playedForStepKeyRef.current !== stepKey
    ) {
      playLevelEndingSoonSound();
      playedForStepKeyRef.current = stepKey;
    }
  }, [tick, enabled]);
}
