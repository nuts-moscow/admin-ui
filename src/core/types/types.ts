/**
 * Type aliases originally from @snekfun/sdk
 * These are extracted to avoid direct dependency on the SDK
 */

// Primitive type aliases
export type uint = number;
export type ts = number; // timestamp
export type lts = number; // long timestamp
export type percent = number;

// Utility types
export type Dictionary<T> = Record<string, T>;

// Domain types - these are placeholders, update with actual types if needed
export interface Profile {
  id: string;
  name?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface AssetInfo {
  policyId: string;
  name: string;
  ticker?: string;
  decimals?: number;
  [key: string]: unknown;
}

export interface Currency {
  asset: AssetInfo;
  amount: bigint | string;
  [key: string]: unknown;
}

export interface Price {
  x: Currency;
  y: Currency;
  [key: string]: unknown;
}

export interface Pair {
  x: AssetInfo;
  y: AssetInfo;
  [key: string]: unknown;
}

export interface PasskeyStorageData {
  credentialId: string;
  [key: string]: unknown;
}

export interface CardanoCIP30WalletBridge {
  enable: () => Promise<unknown>;
  isEnabled: () => Promise<boolean>;
  apiVersion: string;
  name: string;
  icon: string;
  [key: string]: unknown;
}

export interface AppConfig {
  [key: string]: unknown;
}

// Utility functions
export const normalizeAmount = (
  amount: bigint | string | number,
  decimals: number = 6
): number => {
  const value = typeof amount === "bigint" ? Number(amount) : Number(amount);
  return value / Math.pow(10, decimals);
};
