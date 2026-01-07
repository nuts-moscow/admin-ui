import { Box } from "@/components/Box/Box";
import { controlLabelCls } from "@/components/ControlUtils/ControlLabel.css";
import { Control } from "@/components/Form/FormControlView";
import { BlindType } from "@/core/states/tournamentStructures/common/BlindType";
import { FC, useEffect, useState } from "react";
import { blindListCls, blindListInputCls } from "./BlindList.css";
import { SimpleList } from "@/components/SimpleList/SimpleList";
import { Typography } from "@/components/Typography/Typography";
import { Button } from "@/components/Button/Button";
import { Checkbox } from "@/components/Checkbox/Checkbox";

type ItemToAdd =
  | {
      type: "lvl";
      id: number;
    }
  | {
      type: "break";
      id: number;
    };

interface PartialBlind {
  readonly level: number;
  readonly id: number;
  readonly smallBlind?: number;
  readonly bigBlind?: number;
  readonly ante: boolean;
  readonly duration?: number;
}

interface PartialBreak {
  readonly id: number;
  readonly duration?: number;
}

type PartialBlindType = PartialBlind | PartialBreak;

const isPartialBlind = (item: PartialBlindType): item is PartialBlind => {
  return "level" in item;
};

const isBlindTypeReady = (
  blindType: PartialBlindType
): blindType is BlindType => {
  if (isPartialBlind(blindType)) {
    return (
      !!blindType.smallBlind &&
      !!blindType.bigBlind &&
      !!blindType.duration &&
      blindType.ante !== undefined
    );
  }
  return !!blindType.duration;
};

const incItem = (item: PartialBlindType, shouldIncrementLevel: boolean) => {
  if (isPartialBlind(item)) {
    return {
      ...item,
      id: item.id + 1,
      level: shouldIncrementLevel ? item.level + 1 : item.level,
    };
  }
  return { ...item, id: item.id + 1 };
};

const decItem = (item: PartialBlindType, shouldDecrementLevel: boolean) => {
  if (isPartialBlind(item)) {
    return {
      ...item,
      id: item.id - 1,
      level: shouldDecrementLevel ? item.level - 1 : item.level,
    };
  }
  return { ...item, id: item.id - 1 };
};

export const BlindList: FC<Control<BlindType[]>> = ({ value, onChange }) => {
  const [innerValue, setInnerValue] = useState<PartialBlindType[]>(value || []);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  useEffect(() => {
    onChange?.(
      innerValue.every(isBlindTypeReady) ? (innerValue as BlindType[]) : []
    );
  }, [innerValue]);

  const changeBlindItem = (
    index: number,
    key: keyof PartialBlind,
    value: PartialBlind[keyof PartialBlind]
  ) => {
    setInnerValue((prev) => {
      if (!prev?.length) {
        return [];
      }
      return prev.map((item, i) => {
        if (i === index) {
          return { ...item, [key]: value };
        }
        return item;
      });
    });
  };

  const changeBreakItem = (
    index: number,
    key: keyof PartialBreak,
    value: PartialBreak[keyof PartialBreak]
  ) => {
    setInnerValue((prev) => {
      if (!prev?.length) {
        return [];
      }
      return prev.map((item, i) => {
        if (i === index) {
          return { ...item, [key]: value };
        }
        return item;
      });
    });
  };

  const addItem = (item: ItemToAdd) => {
    setInnerValue((prev) => {
      if (!prev?.length) {
        setSelectedItemId(item.id);
        return item.type === "lvl"
          ? [{ id: item.id, level: item.id, ante: false }]
          : [{ id: item.id }];
      }
      if (item.id > prev.length) {
        const maxLvl =
          prev
            .slice()
            .reverse()
            .find((item) => isPartialBlind(item))?.level || 0;
        return [
          ...(prev || []),
          item.type === "lvl"
            ? {
                id: item.id,
                level: maxLvl + 1,
                ante: false,
              }
            : { id: item.id, duration: undefined },
        ];
      }

      let currentMaxLvl = 0;
      const newValue: PartialBlindType[] = [];
      for (const prevItem of prev) {
        if (prevItem.id < item.id) {
          newValue.push(prevItem);
          if (isPartialBlind(prevItem)) {
            currentMaxLvl = Math.max(currentMaxLvl, prevItem.level);
          }
        } else if (prevItem.id === item.id) {
          newValue.push(
            item.type === "lvl"
              ? { id: item.id, level: currentMaxLvl, ante: false }
              : { id: item.id }
          );
          newValue.push(incItem(prevItem, item.type === "lvl"));
        } else {
          newValue.push(incItem(prevItem, item.type === "lvl"));
        }
      }
      return newValue;
    });
  };

  const deleteItem = (id: number, type: "lvl" | "break") => {
    setInnerValue((prev) => {
      const newVal: PartialBlindType[] = [];
      for (const item of prev) {
        if (item.id < id) {
          newVal.push(item);
        } else if (item.id > id) {
          newVal.push(decItem(item, type === "lvl"));
        }
      }
      return newVal;
    });
  };

  useEffect(() => {
    console.log(innerValue);
  }, [innerValue]);

  return (
    <Box flex={{ col: true, gap: 2, width: "100%" }}>
      <label className={controlLabelCls()}>Структура блайндов</label>
      <Box
        borderRadius="xl"
        className={blindListCls}
        padding={4}
        flex={{
          col: true,
          align: "center",
          width: "100%",
          gap: 3,
        }}
        style={{ maxHeight: 332, overflowY: "auto" }}
      >
        {innerValue.map((item, index) => (
          <Box
            flex={{ col: true, gap: 2, align: "center", width: "100%" }}
            key={index}
          >
            {selectedItemId === item.id && (
              <Box flex={{ gap: 2 }}>
                <Button
                  size="xxSmall"
                  width={60}
                  onClick={() =>
                    addItem({
                      type: "lvl",
                      id: index + 1,
                    })
                  }
                >
                  +LVL
                </Button>
                <Button
                  size="xxSmall"
                  width={60}
                  onClick={() => addItem({ type: "break", id: index + 1 })}
                >
                  +Break
                </Button>
                <Button
                  size="xxSmall"
                  width={60}
                  type="primary"
                  onClick={() =>
                    isPartialBlind(item)
                      ? deleteItem(item.id, "lvl")
                      : deleteItem(item.id, "break")
                  }
                >
                  Удалить
                </Button>
              </Box>
            )}
            <SimpleList.Card
              onClick={() => setSelectedItemId(item.id)}
              selected={selectedItemId === item.id}
            >
              {isPartialBlind(item) ? (
                <>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2, align: "center" }}>
                      <Typography.Text size="xSmall">Lvl</Typography.Text>
                      <input
                        readOnly
                        className={blindListInputCls}
                        type="number"
                        value={item.level}
                      />
                    </Box>
                  </SimpleList.Column>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2, align: "center" }}>
                      <Typography.Text size="xSmall">Время</Typography.Text>
                      <input
                        key={`${item.id}-blind-duration`}
                        className={blindListInputCls}
                        type="number"
                        value={item.duration || undefined}
                        onChange={(e) =>
                          changeBlindItem(
                            index,
                            "duration",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </Box>
                  </SimpleList.Column>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2 }}>
                      <Typography.Text size="xSmall">SB</Typography.Text>
                      <input
                        key={`${item.id}-blind-smallBlind`}
                        className={blindListInputCls}
                        type="number"
                        value={item.smallBlind || undefined}
                        onChange={(e) =>
                          changeBlindItem(
                            index,
                            "smallBlind",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </Box>
                  </SimpleList.Column>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2, align: "center" }}>
                      <Typography.Text size="xSmall">BB</Typography.Text>
                      <input
                        key={`${item.id}-blind-bigBlind`}
                        className={blindListInputCls}
                        type="number"
                        value={item.bigBlind || undefined}
                        onChange={(e) =>
                          changeBlindItem(
                            index,
                            "bigBlind",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </Box>
                  </SimpleList.Column>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2, align: "center" }}>
                      <Typography.Text size="xSmall">Ante</Typography.Text>
                      <Checkbox
                        size="small"
                        checked={item.ante}
                        onCheckedChange={() =>
                          changeBlindItem(index, "ante", !item.ante)
                        }
                      />
                    </Box>
                  </SimpleList.Column>
                </>
              ) : (
                <>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2, align: "center" }}>
                      <Typography.Text size="xSmall">Break</Typography.Text>
                      <input
                        key={`${item.id}-break-duration`}
                        className={blindListInputCls}
                        type="number"
                        value={item.duration || undefined}
                        onChange={(e) =>
                          changeBreakItem(
                            index,
                            "duration",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </Box>
                  </SimpleList.Column>
                </>
              )}
            </SimpleList.Card>
          </Box>
        ))}
        <Box flex={{ gap: 2 }}>
          <Button
            size="xxSmall"
            width={60}
            onClick={() =>
              addItem({
                type: "lvl",
                id: innerValue.length + 1,
              })
            }
          >
            +LVL
          </Button>
          <Button
            size="xxSmall"
            width={60}
            onClick={() =>
              addItem({ type: "break", id: innerValue.length + 1 })
            }
          >
            +Break
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
