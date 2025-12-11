import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client: ค่าเป็น true เสมอ
    () => false  // Server: ค่าเป็น false เสมอ
  );
}