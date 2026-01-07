import { ComponentPropsWithRef, ReactNode, useId } from "react";
import { Box } from "@/components/Box/Box";
import { Check } from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { TextProps, Typography } from "../Typography/Typography";
import { clsx } from "clsx";
import {
  checkboxCls,
  checkboxIconCls,
} from "@/components/Checkbox/Checkbox.css";
import { large, medium, small, xLarge } from "@/core/utils/style/UiKitSizes";

type CheckboxSize = small | medium | large | xLarge;

type CheckboxPrimitiveRootProps = ComponentPropsWithRef<
  typeof CheckboxPrimitive.Root
> & {
  size: CheckboxSize;
};

export const Checkbox = ({
  size = "medium",
  className,
  disabled,
  style,
  ref,
  ...props
}: CheckboxPrimitiveRootProps) => {
  const id = useId();
  return (
    <Box flex={{ align: "center", gap: 2 }} style={style}>
      <CheckboxPrimitive.Root
        className={clsx(className, checkboxCls({ size }))}
        ref={ref}
        id={id}
        disabled={disabled}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={clsx(checkboxIconCls({ size }))}
        >
          <Check className={clsx(checkboxIconCls({ size }))} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </Box>
  );
};
