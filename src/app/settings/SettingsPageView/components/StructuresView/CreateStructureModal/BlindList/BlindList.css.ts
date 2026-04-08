import { getGutter } from "@/core/utils/style/gutter";
import { style } from "@vanilla-extract/css";

export const blindListCls = style({
  background: "#EBEBEB !important",
});

/** Lvl/SB · Min/BB · ∅/Ante — Min строго над BB. */
export const blindLevelGridCls = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) auto",
  alignItems: "center",
  justifyItems: "start",
  columnGap: getGutter(16),
  rowGap: getGutter(1),
  width: "100%",
});

/** Подпись фиксированной ширины + поле — левые края текста и серых ячеек совпадают в столбце. */
const blindLevelFieldRowBase = {
  display: "grid" as const,
  alignItems: "center" as const,
  columnGap: getGutter(2),
  justifyItems: "start" as const,
};

/** Lvl / SB: узкая колонка под короткие лат. подписи. */
export const blindLevelFieldRowSideCls = style({
  ...blindLevelFieldRowBase,
  gridTemplateColumns: "44px min-content",
});

/** Мин / BB: шире, под «Мин»; BB выравнивается по той же сетке. */
export const blindLevelFieldRowMiddleCls = style({
  ...blindLevelFieldRowBase,
  gridTemplateColumns: "56px min-content",
});

/** Ante + чекбокс. */
export const blindLevelFieldRowAnteCls = style({
  ...blindLevelFieldRowBase,
  gridTemplateColumns: "48px auto",
});

/** Достаточно для 1000000 / 200000 без обрезки (tabular-nums + паддинги). */
const BLIND_VALUE_INPUT_MIN_PX = 132;

export const blindListInputCls = style({
  boxSizing: "border-box",
  minWidth: BLIND_VALUE_INPUT_MIN_PX,
  width: BLIND_VALUE_INPUT_MIN_PX,
  flexShrink: 0,
  border: "none",
  outline: "none",
  background: "#EBEBEB !important",
  borderRadius: "8px",
  font: "var(--font-x-small)",
  fontVariantNumeric: "tabular-nums",
  appearance: "none",
  padding: getGutter([0, 2]),
  textAlign: "center",
  "::-webkit-inner-spin-button": {
    display: "none",
  },
  "::-webkit-outer-spin-button": {
    display: "none",
  },
});
