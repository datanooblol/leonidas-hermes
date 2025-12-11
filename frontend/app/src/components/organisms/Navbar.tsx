"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  Sun,
  Moon,
  UserCircle,
  ChevronDown,
  LogOut,
} from "lucide-react";
// ✅ Import จาก next-themes โดยตรง
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import Image from "next/image";

interface NavbarProps {
  isRecording: boolean;
  onLogout: () => void;
}

export const Navbar = ({ isRecording, onLogout }: NavbarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ✅ ใช้ Hook มาตรฐาน
  const { theme, setTheme } = useTheme();

  const mounted = useMounted();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1E1F20] border-b border-gray-200 dark:border-[#444746] flex items-center justify-between px-6 z-50 transition-colors duration-300 shadow-sm dark:shadow-none">
      {/* 1. Logo Section */}
      <div className="flex items-center gap-1">
        <div className="rounded-lg overflow-hidden shrink-0">
          <Image
            src="/leonidasHermesLogo.png"
            alt="HermesLogo"
            width={100}
            height={100}
            className="w-14 h-14 object-contain"
            priority
          />
        </div>
        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
          HERMES
        </span>

        <div className="ml-6 px-3 py-1 bg-gray-900/90 dark:bg-black/40 text-white dark:text-gray-300 text-[10px] rounded border border-transparent dark:border-gray-700 flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
            Connected
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRecording
                  ? "bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                  : "bg-gray-500"
              }`}
            ></span>
            Recording: {isRecording ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* 2. Menu Links */}
      <div className="hidden md:flex items-center gap-6">
        {[
          { icon: LayoutDashboard, label: "DASHBOARD", active: false },
          { icon: FileText, label: "TRANSCRIPTION", active: true },
          { icon: BarChart3, label: "ANALYTICS", active: false },
          { icon: Settings, label: "SETTINGS", active: false },
        ].map((item) => (
          <button
            key={item.label}
            className={`
              text-xs font-bold tracking-wide flex items-center gap-2 transition-colors py-2
              ${
                item.active
                  ? "text-[#0B57D0] dark:text-[#A8C7FA]"
                  : "text-gray-500 hover:text-[#0B57D0] dark:text-gray-400 dark:hover:text-[#A8C7FA]"
              }
            `}
          >
            <item.icon size={16} /> {item.label}
          </button>
        ))}
      </div>

      {/* 3. Controls */}
      <div className="flex items-center gap-3">
        {/* ✅ Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2D2E30] text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
          aria-label="Toggle Theme"
        >
          {mounted &&
            (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2D2E30] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[#0B57D0] dark:text-[#A8C7FA] border border-blue-200 dark:border-blue-800/50">
              <UserCircle size={20} />
            </div>
            <div className="hidden lg:block text-left mr-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-none mb-0.5">
                Demo User
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
                Agent ID: 4402
              </p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1E1F20] rounded-xl shadow-xl border border-gray-200 dark:border-[#444746] py-1 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2D2E30] bg-gray-50/50 dark:bg-[#2D2E30]/30">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Demo User
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    user@telesale.demo
                  </p>
                </div>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors cursor-pointer"
                  onClick={onLogout}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
