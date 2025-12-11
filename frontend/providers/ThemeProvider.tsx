"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme" // ใช้ data-theme เพื่อให้เข้ากับ Tailwind v4
      defaultTheme="dark"    // บังคับเริ่มที่ Dark Mode
      enableSystem={false}   // ปิดการดึงค่าจาก System (เพื่อให้ defaultTheme ทำงานแน่นอน)
      disableTransitionOnChange // ปิด Animation ตอนสลับธีม (ป้องกันภาพกระพริบ)
    >
      {children}
    </NextThemesProvider>
  );
}