import { FC } from "react";
import { clsx } from "clsx";
import { Box } from "../Box/Box";
import { simpleListCardCls } from "./SimpleList.css";
import { WithChildren } from "@/core/utils/style/WithChildren";
import { Typography } from "../Typography/Typography";
import { Upload } from "lucide-react";

export interface SimpleListCardProps extends WithChildren {
  readonly selected?: boolean;
  /** Подсветка фона, если у игрока нет подписанного договора. */
  readonly noAgreement?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
  /** Ряд с несколькими колонками переносится на следующую строку, если не влезает по ширине. */
  readonly rowWrap?: boolean;
}

const SimpleListCard: FC<SimpleListCardProps> = ({
  children,
  onClick,
  selected,
  noAgreement,
  className,
  rowWrap,
}) => {
  return (
    <Box
      onClick={onClick}
      flex={{
        gap: 16,
        align: rowWrap ? "flex-start" : "center",
        width: "100%",
        ...(rowWrap ? { flexWrap: "wrap" } : {}),
      }}
      padding={4}
      borderRadius="m"
      border
      disableHover
      className={clsx(
        simpleListCardCls({ selected, noAgreement }),
        className,
      )}
    >
      {children}
    </Box>
  );
};

const SimpleListColumn: FC<WithChildren & { minWidth?: number }> = ({
  children,
  minWidth,
}) => {
  return (
    <Box
      flex={{ col: true, gap: 1 }}
      flexItem={{
        flex: 1,
        minWidth: minWidth || 100,
      }}
    >
      {children}
    </Box>
  );
};

const SimpleListEmptyState: FC<WithChildren> = ({ children }) => {
  return (
    <Box
      flex={{ col: true, gap: 1, align: "center", width: "100%" }}
      padding={[16, 0]}
    >
      <Upload size={60} />
      <Typography.Text type="grey">{children}</Typography.Text>
    </Box>
  );
};

export const SimpleList = {
  Card: SimpleListCard,
  Column: SimpleListColumn,
  EmptyState: SimpleListEmptyState,
};
