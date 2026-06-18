"use client";

import { FC, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import {
  sheetOverlayCls,
  sheetPanelCls,
  sheetHeaderCls,
  sheetBodyCls,
} from "../mobile.css";

export interface SheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: ReactNode;
  readonly children: ReactNode;
}

/**
 * Полноширинный bottom-sheet — мобильная замена модалок (которые с minWidth
 * переполняют 393px). Закрытие по оверлею/Escape/крестику, скролл контента,
 * safe-area снизу.
 */
export const Sheet: FC<SheetProps> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={sheetOverlayCls} onClick={onClose}>
      <div
        className={sheetPanelCls}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={sheetHeaderCls}>
          <Typography.Text bold>{title}</Typography.Text>
          <Button
            type="ghost"
            size="small"
            iconRight={<X size={20} />}
            onClick={onClose}
            aria-label="Закрыть"
          />
        </div>
        <div className={sheetBodyCls}>{children}</div>
      </div>
    </div>,
    document.body,
  );
};
