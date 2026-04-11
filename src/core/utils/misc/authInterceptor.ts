/**
 * Module-level callback invoked when any API call returns 401 without a custom handler.
 * Set by AuthProvider on mount; cleared on unmount.
 */
let _onUnauthorized: (() => void) | null = null;

export const registerUnauthorizedHandler = (cb: () => void): (() => void) => {
  _onUnauthorized = cb;
  return () => {
    _onUnauthorized = null;
  };
};

export const handleUnauthorized = (): void => {
  _onUnauthorized?.();
};
