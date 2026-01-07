export interface Player {
  readonly id: number;
  readonly nickname: string;
  readonly name?: string;
  readonly tg?: string;
  readonly phone?: string;
  readonly notes?: string;
  readonly createdAt: number;
  readonly freeReentryCount: number;
}
