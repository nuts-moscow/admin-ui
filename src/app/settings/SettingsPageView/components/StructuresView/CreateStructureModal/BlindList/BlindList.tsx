import { Box } from "@/components/Box/Box";
import { controlLabelCls } from "@/components/ControlUtils/ControlLabel.css";
import { Control } from "@/components/Form/FormControlView";
import { BlindType } from "@/core/states/tournamentStructures/common/BlindType";
import { FC, useEffect, useState } from "react";
import { blindListCls, blindListInputCls } from "./BlindList.css";
import { SimpleList } from "@/components/SimpleList/SimpleList";
import { Typography } from "@/components/Typography/Typography";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";

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
  readonly ante?: boolean;
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

export const BlindList: FC<Control<BlindType[]>> = ({ value, onChange }) => {
  const [innerValue, setInnerValue] = useState<PartialBlindType[]>(value || []);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const addItem = (item: ItemToAdd) => {
    setInnerValue((prev) => {
      if (!prev?.length) {
        setSelectedItemId(item.id);
        return item.type === "lvl"
          ? [{ id: item.id, level: item.id }]
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
              }
            : { id: item.id },
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
              ? { id: item.id, level: currentMaxLvl }
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
        flex={{ col: true, align: "center", width: "100%", gap: 3 }}
      >
        {innerValue.map((item, index) => (
          <Box
            key={item.id}
            flex={{ col: true, gap: 4, align: "center", width: "100%" }}
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
                <Button size="xxSmall" width={60} type="primary">
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
                    <Box flex={{ gap: 2 }}>
                      <Typography.Text size="xSmall">Lvl</Typography.Text>
                      <input
                        readOnly={true}
                        className={blindListInputCls}
                        type="number"
                        value={item.level}
                      />
                    </Box>
                  </SimpleList.Column>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2 }}>
                      <Typography.Text size="xSmall">Время</Typography.Text>
                      <input
                        readOnly={true}
                        className={blindListInputCls}
                        type="number"
                        value={item.duration || 0}
                      />
                    </Box>
                  </SimpleList.Column>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2 }}>
                      <Typography.Text size="xSmall">SB</Typography.Text>
                      <input
                        readOnly={true}
                        className={blindListInputCls}
                        type="number"
                        value={item.smallBlind || 0}
                      />
                    </Box>
                  </SimpleList.Column>
                  <SimpleList.Column minWidth={40}>
                    <Box flex={{ gap: 2 }}>
                      <Typography.Text size="xSmall">BB</Typography.Text>
                      <input
                        readOnly={true}
                        className={blindListInputCls}
                        type="number"
                        value={item.bigBlind || 0}
                      />
                    </Box>
                  </SimpleList.Column>
                  <SimpleList.Column minWidth={40}>
                    <Typography.Text size="xSmall">Ante</Typography.Text>
                  </SimpleList.Column>
                </>
              ) : (
                <>
                  <SimpleList.Column minWidth={40}>
                    <Typography.Text size="xSmall">Break</Typography.Text>
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
