import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during prerender/SSR, true after hydration. Gate anything that reads the
 * clock or browser-only state (persisted store) behind it — with cacheComponents,
 * `new Date()` during prerender is an error.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
