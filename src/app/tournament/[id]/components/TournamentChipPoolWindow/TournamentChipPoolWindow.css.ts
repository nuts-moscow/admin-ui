import { style } from "@vanilla-extract/css";
import { getGutter } from "@/core/utils/style/gutter";
import {
  CHIP_POOL_INK,
  CHIP_POOL_INK_MUTED,
  CHIP_POOL_INK_SOFT,
} from "./chipPoolTokens";

/** Общий левый сдвиг для лого и колонки статов. */
const chipPoolLeftContentInset = "clamp(16px, 4.5vw, 56px)";

/** SVG grain (feTurbulence) — лёгкая «бумажная» фактура поверх градиента. */
const grainSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'><filter id='g' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#g)' opacity='0.33'/></svg>`,
);

/**
 * Ромбическая сетка 2×2 (120×120) — poker felt pattern.
 * Четыре ромба с мастями ♠ ♥ ♣ ♦ внутри каждого.
 */
const diamondSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>` +
  `<path d='M30 1 L59 30 L30 59 L1 30 Z' fill='none' stroke='rgba(92,72,52,0.22)' stroke-width='1.2'/>` +
  `<text x='30' y='30' font-size='13' text-anchor='middle' dominant-baseline='middle' fill='rgba(92,72,52,0.18)' font-family='serif'>&#9824;</text>` +
  `<path d='M90 1 L119 30 L90 59 L61 30 Z' fill='none' stroke='rgba(92,72,52,0.22)' stroke-width='1.2'/>` +
  `<text x='90' y='30' font-size='13' text-anchor='middle' dominant-baseline='middle' fill='rgba(92,72,52,0.18)' font-family='serif'>&#9829;</text>` +
  `<path d='M30 61 L59 90 L30 119 L1 90 Z' fill='none' stroke='rgba(92,72,52,0.22)' stroke-width='1.2'/>` +
  `<text x='30' y='90' font-size='13' text-anchor='middle' dominant-baseline='middle' fill='rgba(92,72,52,0.18)' font-family='serif'>&#9827;</text>` +
  `<path d='M90 61 L119 90 L90 119 L61 90 Z' fill='none' stroke='rgba(92,72,52,0.22)' stroke-width='1.2'/>` +
  `<text x='90' y='90' font-size='13' text-anchor='middle' dominant-baseline='middle' fill='rgba(92,72,52,0.18)' font-family='serif'>&#9830;</text>` +
  `</svg>`,
);

/**
 * Светлый песочно-персиковый mesh + зерно + ромбическая сетка.
 */
export const chipPoolShellCls = style({
  width: "100%",
  flex: 1,
  minHeight: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  fontFamily: "var(--primary-font-family)",
  padding: getGutter([4, 5, 5, 5]),
  position: "relative",
  isolation: "isolate",
  backgroundColor: "#e8dfd4",
  backgroundImage: `
    url("data:image/svg+xml,${grainSvg}"),
    url("data:image/svg+xml,${diamondSvg}"),
    radial-gradient(ellipse 95% 85% at 88% 12%, rgba(245, 205, 175, 0.58) 0%, transparent 55%),
    radial-gradient(ellipse 80% 70% at 10% 48%, rgba(237, 210, 185, 0.5) 0%, transparent 52%),
    radial-gradient(ellipse 110% 60% at 50% 102%, rgba(198, 172, 145, 0.35) 0%, transparent 48%),
    radial-gradient(circle at 72% 58%, rgba(220, 195, 168, 0.28) 0%, transparent 42%),
    radial-gradient(ellipse 70% 45% at 22% 18%, rgba(232, 218, 200, 0.6) 0%, transparent 45%),
    linear-gradient(168deg, #f0e8df 0%, #e8dfd4 38%, #ddd2c6 72%, #d4c4b4 100%)
  `,
  backgroundSize: "180px 180px, 120px 120px, auto, auto, auto, auto, auto, auto",
  backgroundRepeat: "repeat, repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat",
  backgroundBlendMode: "soft-light, multiply, normal, normal, normal, normal, normal, normal",
  color: CHIP_POOL_INK,
});

/** Оверлей PNG-паттерна (резервный слой поверх SVG-сетки). */
export const chipPoolPatternOverlayCls = style({
  position: "absolute",
  inset: 0,
  backgroundImage: 'url("/pattern-poker.png")',
  backgroundSize: "320px 320px",
  backgroundRepeat: "repeat",
  filter: "invert(1) contrast(20)",
  mixBlendMode: "multiply",
  opacity: 0.08,
  pointerEvents: "none",
  zIndex: 0,
});

export const chipPoolHeaderGridCls = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  alignItems: "center",
  gap: getGutter(2),
  width: "100%",
  minHeight: 56,
  marginBottom: getGutter(2),
  position: "relative",
  zIndex: 1,
});

export const chipPoolHeaderSideCls = style({
  minHeight: 40,
  minWidth: 0,
});

export const chipPoolHeaderLogoWrapCls = style({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  minHeight: 40,
  minWidth: 0,
  paddingLeft: chipPoolLeftContentInset,
});

export const chipPoolHeaderLogoImgCls = style({
  height: "clamp(48px, 9vw, 88px)",
  width: "auto",
  objectFit: "contain",
  /** Белый фон растра «вычитается»: тёмные элементы лого остаются на песочном градиенте. */
  mixBlendMode: "multiply",
});

export const chipPoolTitleCls = style({
  margin: 0,
  textAlign: "center",
  fontFamily: "var(--display-font-family)",
  fontSize: "clamp(1.25rem, 3.2vw, 2.35rem)",
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  lineHeight: 1.15,
  color: CHIP_POOL_INK,
  textShadow: "0 1px 0 rgba(255, 255, 255, 0.45)",
});

/** Полоса правил по ширине бежевого блока (как заголовок и сетка), без выхода за края. */
export const chipPoolSubHeaderCls = style({
  position: "relative",
  zIndex: 1,
  width: "100%",
  boxSizing: "border-box",
  textAlign: "center",
  fontFamily: "var(--primary-font-family)",
  fontSize: "clamp(0.75rem, 1.35vw, 0.95rem)",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: CHIP_POOL_INK_MUTED,
  padding: `${getGutter(2)} ${getGutter(3)}`,
  marginBottom: getGutter(4),
  borderTop: "1px solid rgba(120, 100, 85, 0.14)",
  borderBottom: "1px solid rgba(120, 100, 85, 0.12)",
  backgroundColor: "rgba(255, 252, 248, 0.42)",
});

export const chipPoolMainGridCls = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
  gap: getGutter(4),
  alignItems: "stretch",
  flex: 1,
  width: "100%",
  minHeight: 0,
  position: "relative",
  zIndex: 1,
});

export const chipPoolLeftColumnCls = style({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  /** Сдвиг контента от левого края к центру экрана (симметрия с пустой правой колонкой). */
  paddingLeft: chipPoolLeftContentInset,
});

export const chipPoolStatStackCls = style({
  display: "flex",
  flexDirection: "column",
  gap: getGutter(4),
});

export const chipPoolStatLabelCls = style({
  fontSize: "clamp(0.7rem, 1.1vw, 0.82rem)",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: CHIP_POOL_INK_SOFT,
  marginBottom: 4,
});

export const chipPoolStatValueCls = style({
  fontSize: "clamp(1.35rem, 2.4vw, 2rem)",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  color: CHIP_POOL_INK,
  lineHeight: 1.2,
});

export const chipPoolCenterColumnCls = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
});

export const chipPoolRightSpacerCls = style({
  minWidth: 0,
  minHeight: 1,
});
