"use client";

import { FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { mobileHeaderCls, mobileHeaderTitleCls } from "../mobile.css";

export interface MobileHeaderProps {
  readonly title: ReactNode;
  /** Кнопка «назад»: путь для навигации или обработчик. Если не задано — кнопки нет. */
  readonly back?: string | (() => void);
  readonly right?: ReactNode;
}

export const MobileHeader: FC<MobileHeaderProps> = ({ title, back, right }) => {
  const router = useRouter();
  const handleBack = () => {
    if (typeof back === "function") {
      back();
    } else if (typeof back === "string") {
      router.push(back);
    }
  };

  return (
    <div className={mobileHeaderCls}>
      {back != null ? (
        <Button
          type="ghost"
          size="small"
          iconRight={<ArrowLeft size={22} />}
          onClick={handleBack}
          aria-label="Назад"
        />
      ) : null}
      <Typography.Text bold className={mobileHeaderTitleCls}>
        {title}
      </Typography.Text>
      {right}
    </div>
  );
};
