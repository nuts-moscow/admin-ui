export interface Blind {
  readonly type?: "Blind";
  readonly level: number;
  readonly id: number;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly ante: boolean;
  readonly duration: number;
}

export interface Break {
  readonly type?: "Break";
  readonly id: number;
  readonly duration: number;
}

export type BlindType = Blind | Break;

export type Blinds = [Blind, ...BlindType[]];

/** Формат Blind для тела запроса v2 (type обязателен). */
export interface BlindApiItem {
  readonly type: "Blind";
  readonly level: number;
  readonly id: number;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly ante: boolean;
  readonly duration: number;
}

/** Формат Break для тела запроса v2 (type обязателен). */
export interface BreakApiItem {
  readonly type: "Break";
  readonly id: number;
  readonly duration: number;
}

export type BlindTypeApiItem = BlindApiItem | BreakApiItem;

/** Приводит массив blinds к формату API: у каждого элемента задаётся type "Blind" или "Break". */
export function normalizeBlindsForApi(blinds: Blinds): BlindTypeApiItem[] {
  return blinds.map((item) => {
    if (item != null && "smallBlind" in item && "bigBlind" in item) {
      const b = item as Blind;
      return {
        type: "Blind" as const,
        level: b.level,
        id: b.id,
        smallBlind: b.smallBlind,
        bigBlind: b.bigBlind,
        ante: b.ante,
        duration: b.duration,
      };
    }
    const br = item as Break;
    return {
      type: "Break" as const,
      id: br.id,
      duration: br.duration,
    };
  });
}
