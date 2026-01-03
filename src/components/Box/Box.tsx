import {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getGutter, Gutter } from "@/core/utils/style/gutter";
import { withFlex } from "@/components/Flex/Flex";
import { clsx } from "clsx";
import {
  boxActiveTabCls,
  boxBadgeCls,
  boxCls,
  boxExtraCls,
  boxIconCls,
  boxTabsContainerCls,
  boxTabsWrapperCls,
} from "@/components/Box/Box.css";
import mergeDeepRight from "ramda/es/mergeDeepRight";
import { ToggleGroup } from "@/components/ToggleGroup/ToggleGroup";
import {
  large,
  medium,
  small,
  xLarge,
  xSmall,
  xxLarge,
  xxSmall,
} from "@/core/utils/style/UiKitSizes";
import { uint } from "@/core/types/types";

export interface BoxTab {
  readonly title: ReactNode | ReactNode[] | string;
  readonly key: string;
  readonly tabType?: "primary" | "secondary" | "sell" | "buy" | "ghost";
  readonly titan?: boolean;
  readonly border?: ("bottom" | "left" | "right" | "top")[] | boolean;
  readonly borderRadius?:
    | ("bottomLeft" | "bottomRight" | "topLeft" | "topRight")[]
    | boolean;
  readonly content?: ReactNode | ReactNode[] | string;
  readonly padding?: Gutter;
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
  readonly badge?: uint;
}

export interface BoxProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  borderRadius?: "none" | "s" | "m" | "xs" | "xm" | "xl";
  secondary?: boolean;
  transparent?: boolean;
  controls?: boolean;
  primary?: boolean;
  warning?: boolean;
  inline?: boolean;
  active?: boolean;
  blur?: boolean;
  borderSecondary?: boolean;
  relative?: boolean;
  padding?: Gutter;
  tabsPadding?: Gutter;
  overflow?: boolean;
  border?: ("bottom" | "left" | "right" | "top")[] | boolean;
  width?: CSSProperties["width"];
  minWidth?: CSSProperties["minWidth"];
  maxWidth?: CSSProperties["maxWidth"];
  height?: CSSProperties["height"];
  minHeight?: CSSProperties["minHeight"];
  maxHeight?: CSSProperties["maxHeight"];
  tabs?: BoxTab[];
  tabsType?: "button" | "buttonGroup" | "tab";
  tabsSize?: xxSmall | xSmall | small | medium | large | xLarge | xxLarge;
  tabsBorder?: ("bottom" | "left" | "right" | "top")[] | boolean;
  extra?: ReactNode;
  defaultActiveTabKey?: string;
  outline?: boolean;
  disableHover?: boolean;
  disabled?: boolean;
  tabsHeight?: CSSProperties["height"];
  tabsWidth?: CSSProperties["width"];
  tabsJustify?: boolean;
  tabsOverflow?: boolean;
  tabsGap?: number;
  onTabChange?: (tabKey: string) => void;
}

export const Box = withFlex(
  ({
    tabs,
    tabsType = "buttonGroup",
    tabsSize,
    tabsBorder,
    tabsPadding,
    tabsOverflow,
    tabsGap,
    overflow,
    children,
    defaultActiveTabKey,
    extra,
    tabsHeight,
    tabsWidth,
    onTabChange,
    tabsJustify,
    className,
    style,
    onClick,
    disableHover,
    padding,
    width,
    height,
    minHeight,
    maxHeight,
    maxWidth,
    minWidth,
    primary,
    border,
    borderSecondary,
    borderRadius,
    relative,
    ref,
    ...other
  }: BoxProps) => {
    const [activeTab, setActiveTab] = useState(
      tabs?.find((tab) => tab.key === defaultActiveTabKey) || tabs?.[0]
    );
    const boxMeasuring: CSSProperties = useMemo(() => {
      return {
        padding: !tabs?.length && padding ? getGutter(padding) : undefined,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        minWidth: minWidth,
        minHeight: minHeight,
        width: width,
        height: height,
      };
    }, []);

    useEffect(() => {
      setActiveTab(
        tabs?.find((tab) => tab.key === activeTab?.key) || tabs?.[0]
      );
    }, [tabs]);

    const handleTabChange = (activeToggleValue: string) => {
      if (onTabChange) {
        onTabChange(activeToggleValue);
      }
      setActiveTab(tabs?.find((tab) => tab.key === activeToggleValue));
    };

    return (
      <div
        onClick={onClick}
        className={clsx(
          className,
          boxCls({
            borderAll: border && typeof border === "boolean",
            borderBottom: border instanceof Array && border.includes("bottom"),
            borderTop: border instanceof Array && border.includes("top"),
            borderRight: border instanceof Array && border.includes("right"),
            borderLeft: border instanceof Array && border.includes("left"),
            clickable: !!onClick && !disableHover,
            borderColor: border
              ? borderSecondary
                ? "secondary"
                : "primary"
              : border && borderSecondary
              ? "secondaryNoShadow"
              : border && !borderSecondary
              ? "primaryNoShadow"
              : undefined,
            type: primary ? "primary" : undefined,
            borderRadius: borderRadius as any,
            relative,
          })
        )}
        style={mergeDeepRight(boxMeasuring, style || {})}
        {...other}
        ref={ref}
      >
        {tabs?.length ? (
          <div className={boxTabsContainerCls}>
            <div
              className={boxTabsWrapperCls({ overflow: tabsOverflow })}
              style={{
                padding: tabsPadding ? getGutter(tabsPadding) : undefined,
                gap: tabsGap ? getGutter(tabsGap) : 0,
              }}
            >
              <ToggleGroup
                style={{
                  height: tabsHeight,
                  width: tabsWidth,
                  gap: tabsGap ? getGutter(tabsGap) : 0,
                }}
                width={tabsJustify ? "100%" : tabsWidth ? tabsWidth : undefined}
                type="primary"
                height={tabsHeight ? tabsHeight : undefined}
                itemsType={tabsType}
                value={activeTab!.key}
                defaultValue={defaultActiveTabKey}
                onTabChange={handleTabChange}
                border={tabsBorder}
                size={tabsSize}
              >
                {tabs.map((tab) => (
                  <ToggleGroup.Item
                    size={tabsSize}
                    type={tab.tabType ? tab.tabType : "primary"}
                    key={tab.key}
                    value={tab.key}
                    disabled={tab.disabled}
                    border={tab.border}
                    borderRadius={tab.borderRadius}
                    titan={tab.titan}
                    style={{
                      padding: tab.padding ? getGutter(tab.padding) : undefined,
                    }}
                  >
                    {tab.badge && (
                      <span className={boxBadgeCls}>{tab.badge}</span>
                    )}
                    {tab.icon ? (
                      <div className={boxIconCls}>
                        {tab.icon}
                        {tab.title}
                      </div>
                    ) : (
                      tab.title
                    )}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
              {extra && <div className={boxExtraCls}>{extra}</div>}
            </div>

            <div
              className={boxActiveTabCls}
              style={{
                padding: `${padding ? getGutter(padding) : undefined}`,
                overflow: `${overflow ? "overflow" : undefined}`,
              }}
            >
              {activeTab?.content}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);
