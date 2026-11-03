/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, RefreshCw, Bell, LogOut } from 'lucide-react';
import { ThemeToggle } from '../../../context/ThemeContext';

interface AdminHeaderProps {
  onOpenMobileNav: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  adminName: string;
  adminRole?: string;
  onNavigateHome: () => void;
  onSignOut: () => Promise<void>;
}

export function AdminHeader({
  onOpenMobileNav,
  onRefresh,
  isRefreshing,
  adminName,
  adminRole,
  onNavigateHome,
  onSignOut,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#273449] px-4 sm:px-8 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileNav}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-[#E2E8F0] dark:border-[#273449] md:hidden cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#172033] dark:text-[#F8FAFC] tracking-tight truncate">
              Admin Dashboard
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] hidden sm:block truncate">
              Cohort analytics, user directory, and platform governance
            </p>
          </div>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-[#172033] dark:text-slate-200 bg-[#F4F7FB] dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#273449] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3578D4] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#273449] bg-[#F4F7FB] dark:bg-[#172033]">
            <div className="w-6 h-6 rounded-full bg-[#3578D4] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
              {adminName[0] || 'A'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#172033] dark:text-[#F8FAFC] leading-tight max-w-[120px] truncate">
                {adminName}
              </span>
              <span className="text-[10px] text-[#3578D4] dark:text-[#4C8CE4] font-bold uppercase tracking-wider">
                {adminRole || 'Admin'}
              </span>
            </div>
          </div>

          {/* Public Home Button */}
          <button
            onClick={onNavigateHome}
            className="hidden md:inline-flex px-3 py-1.5 text-xs font-semibold text-[#64748B] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white bg-[#F4F7FB] dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#273449] rounded-xl transition-colors cursor-pointer"
          >
            Public Site
          </button>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-[#E2E8F0] dark:border-[#273449] rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
