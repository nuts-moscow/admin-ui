import { FC, ReactNode } from "react";
import { mobileShellCls } from "../mobile.css";

/** Внешняя оболочка мобильного экрана: шапка (sticky) + произвольный контент. */
export const MobileShell: FC<{
  readonly header?: ReactNode;
  readonly children: ReactNode;
}> = ({ header, children }) => (
  <div className={mobileShellCls}>
    {header}
    {children}
  </div>
);
