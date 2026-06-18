import { FC, ReactNode } from "react";
import { mobileContentCls } from "../mobile.css";

/** Скроллируемая область контента с отступами и safe-area снизу. */
export const MobileContent: FC<{ readonly children: ReactNode }> = ({
  children,
}) => <div className={mobileContentCls}>{children}</div>;
