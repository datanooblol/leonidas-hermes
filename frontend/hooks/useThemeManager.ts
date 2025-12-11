import { useEffect, useCallback, useSyncExternalStore } from 'react';

// --- Helpers ---
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener('local-storage-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('local-storage-change', callback);
  };
};

const getSnapshot = () => localStorage.getItem('theme');
const getServerSnapshot = () => 'dark';

// ✅ Helper ใหม่: สำหรับเช็ค mounted โดยไม่ต้องใช้ useState/Effect
const emptySubscribe = () => () => {};

export function useThemeManager() {
  // 1. จัดการ Theme
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDarkMode = theme !== 'light';

  // 2. จัดการ Mounted (แก้ Error ตรงนี้หายขาด 100%)
  // React จะรู้เองว่า Client = true, Server = false โดยไม่ต้องสั่ง setState
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client
    () => false  // Server
  );

  // 3. Side Effect: ยิง Class ลง DOM เท่านั้น (ไม่มี setState ในนี้แล้ว)
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = isDarkMode ? 'dark' : 'light';

    root.setAttribute('data-theme', currentTheme);
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    window.dispatchEvent(new Event('local-storage-change'));
  }, [isDarkMode]);

  return { isDarkMode, toggleTheme, mounted };
}