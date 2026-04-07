import { style } from "@vanilla-extract/css";
import { getGutter } from "@/core/utils/style/gutter";
import {
  CHIP_POOL_INK,
  CHIP_POOL_INK_MUTED,
  CHIP_POOL_INK_SOFT,
} from "./chipPoolTokens";

/** Общий левый сдвиг для лого и колонки статов (шире под эфир). */
const chipPoolLeftContentInset = "clamp(24px, 6vw, 88px)";

/** SVG grain (feTurbulence) — лёгкая «бумажная» фактура поверх градиента. */
const grainSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'><filter id='g' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#g)' opacity='0.33'/></svg>`,
);

/**
 * Светлый песочно-персиковый mesh + зерно (как референс): без резких линий, тёплые пятна.
 */
export const chipPoolShellCls = style({
  width: "100%",
  flex: 1,
  minHeight: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  fontFamily: "var(--primary-font-family)",
  padding: getGutter([5, 4, 4, 4]),
  position: "relative",
  isolation: "isolate",
  backgroundColor: "#e8dfd4",
  backgroundImage: `
    url("data:image/svg+xml,${grainSvg}"),
    radial-gradient(ellipse 95% 85% at 88% 12%, rgba(245, 205, 175, 0.58) 0%, transparent 55%),
    radial-gradient(ellipse 80% 70% at 10% 48%, rgba(237, 210, 185, 0.5) 0%, transparent 52%),
    radial-gradient(ellipse 110% 60% at 50% 102%, rgba(198, 172, 145, 0.35) 0%, transparent 48%),
    radial-gradient(circle at 72% 58%, rgba(220, 195, 168, 0.28) 0%, transparent 42%),
    radial-gradient(ellipse 70% 45% at 22% 18%, rgba(232, 218, 200, 0.6) 0%, transparent 45%),
    linear-gradient(168deg, #f0e8df 0%, #e8dfd4 38%, #ddd2c6 72%, #d4c4b4 100%)
  `,
  backgroundSize:
    "180px 180px, auto, auto, auto, auto, auto, auto",
  backgroundRepeat: "repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat",
  backgroundBlendMode:
    "soft-light, normal, normal, normal, normal, normal, normal",
  color: CHIP_POOL_INK,
});

export const chipPoolHeaderGridCls = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  alignItems: "center",
  gap: getGutter(2),
  width: "100%",
  minHeight: 56,
  marginBottom: getGutter(2),
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
});

/** Полоса правил по ширине бежевого блока (как заголовок и сетка), без выхода за края. */
export const chipPoolSubHeaderCls = style({
  width: "100%",
  boxSizing: "border-box",
  textAlign: "center",
  fontFamily: "var(--primary-font-family)",
  fontSize: "clamp(0.75rem, 1.35vw, 0.95rem)",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: CHIP_POOL_INK_MUTED,
  padding: `${getGutter(4)} ${getGutter(3)}`,
  marginBottom: getGutter(4),
  borderRadius: "clamp(12px, 1.5vw, 18px)",
  border: "1px solid rgba(120, 100, 85, 0.14)",
  backgroundColor: "rgba(218, 208, 195, 0.5)",
});

export const chipPoolMainGridCls = style({
  display: "grid",
  /**
   * 1fr | auto | 1fr — средняя колонка (часы) по горизонтали по центру экрана,
   * боковые поля одинаковой ширины; статы слева в своей половине.
   */
  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
  gap: getGutter(4),
  alignItems: "stretch",
  flex: 1,
  width: "100%",
  minHeight: 0,
});

export const chipPoolLeftColumnCls = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  minWidth: 0,
  justifySelf: "start",
  maxWidth: "100%",
  /** Сдвиг контента от левого края к центру экрана (симметрия с пустой правой колонкой). */
  paddingLeft: chipPoolLeftContentInset,
});

export const chipPoolStatStackCls = style({
  display: "flex",
  flexDirection: "column",
  gap: getGutter(5),
});

export const chipPoolStatLabelCls = style({
  fontSize: "clamp(0.85rem, 1.45vw, 1.05rem)",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: CHIP_POOL_INK_SOFT,
  marginBottom: 6,
});

export const chipPoolStatValueCls = style({
  fontSize: "clamp(1.85rem, 3.4vw, 3.1rem)",
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
  justifySelf: "center",
  width: "fit-content",
  maxWidth: "min(100%, 92vw)",
  minWidth: 0,
  textAlign: "center",
});

export const chipPoolRightSpacerCls = style({
  minWidth: 0,
  minHeight: 1,
  justifySelf: "stretch",
  // симметрия с левым 1fr — контента нет
});
