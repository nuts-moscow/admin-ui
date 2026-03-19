/** Модель игрока v2 (GET /v2/api/players). */
export interface Player {
  readonly id: number;
  readonly nickname: string;
  readonly name: string | null;
  readonly phone: string | null;
  readonly tg: string | null;
  readonly notes: string | null;
  readonly signAgreement: boolean;
  readonly createdAt: string;
  /** Кол-во бесплатных входов (если приходит с бэкенда). */
  readonly freeEntryCount?: number;
  /** Кол-во бесплатных ребаев (если приходит с бэкенда). */
  readonly freeReentryCount?: number;
}
