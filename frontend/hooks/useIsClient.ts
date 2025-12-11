import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client side: return true
    () => false  // Server side: return false
  );
}