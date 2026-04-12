/**
 * Сигнал «осталась минута уровня»: мотив «тутутуру» — три коротких ноты и финал.
 * Web Audio API, без внешних файлов.
 */
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedCtx) {
      const Ctor =
        window.AudioContext ||
        (
          window as unknown as {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;
      if (!Ctor) return null;
      sharedCtx = new Ctor();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

/** C5 → D5 → E5 → G5: лёгкое восхождение, последняя нота длиннее — «ру». */
const TUTU_TU_RU: readonly { hz: number; delay: number; staccato: boolean }[] = [
  { hz: 523.25, delay: 0, staccato: true },
  { hz: 587.33, delay: 0.09, staccato: true },
  { hz: 659.25, delay: 0.18, staccato: true },
  { hz: 783.99, delay: 0.27, staccato: false },
];

function playNote(
  ctx: AudioContext,
  startAt: number,
  frequencyHz: number,
  peakGain: number,
  staccato: boolean,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequencyHz;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t0 = ctx.currentTime + startAt;

  if (staccato) {
    const dur = 0.058;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } else {
    const dur = 0.22;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peakGain * 1.05, t0 + 0.02);
    gain.gain.linearRampToValueAtTime(peakGain * 0.5, t0 + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
  }
}

export function playLevelEndingSoonSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume().catch(() => {
    /* autoplay policy */
  });

  const gStac = 0.09;
  const gLast = 0.1;
  for (const n of TUTU_TU_RU) {
    playNote(ctx, n.delay, n.hz, n.staccato ? gStac : gLast, n.staccato);
  }
}
