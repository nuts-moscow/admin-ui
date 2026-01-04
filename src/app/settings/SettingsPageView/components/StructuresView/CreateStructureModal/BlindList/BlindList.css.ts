import { getGutter } from "@/core/utils/style/gutter";
import { style } from "@vanilla-extract/css";

export const blindListCls = style({
  background: "#EBEBEB !important",
});

export const blindListInputCls = style({
  width: 40,
  border: "none",
  outline: "none",
  background: "#EBEBEB !important",
  borderRadius: "8px",
  font: "var(--font-x-small)",
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
