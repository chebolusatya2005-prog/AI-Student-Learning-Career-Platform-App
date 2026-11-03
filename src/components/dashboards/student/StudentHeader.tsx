/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, RefreshCw, Bell, LogOut, PanelLeft } from 'lucide-react';
import { ThemeToggle } from '../../../context/ThemeContext';
import type { StudentNavTab } from './StudentSidebar';

interface StudentHeaderProps {
  activeNav: StudentNavTab;
  onOpenMobileNav: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  studentName: string;
  studentRole?: string;
  onNavigateHome: () => void;
  onSignOut: () => Promise<void>;
}

export function StudentHeader({
  activeNav,
  onOpenMobileNav,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onRefresh,
  isRefreshing,
  studentName,
  studentRole,
  onNavigateHome,
  onSignOut,
}: StudentHeaderProps) {
  const titles: Record<StudentNavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Student Learning Dashboard',
      subtitle: 'Personalized analytics, diagnostic overview, and placement readiness',
    },
    learning: {
      title: 'My Learning & Course Focus',
      subtitle: 'Syllabus roadmap, target topics, and curriculum allocation',
    },
    progress: {
      title: 'My Progress & Submissions',
      subtitle: 'Practice submission logs and benchmark competency milestones',
    },
    practice: {
      title: 'Practice & Skill Drills',
      subtitle: 'Targeted exercise problem sets and recommended practice pacing',
    },
    assistant: {
      title: 'AI Learning Assistant',
      subtitle: 'EduCareer AI assistant grounded in verified platform dataset records',
    },
    profile: {
      title: 'Academic Profile & Identity',
      subtitle: 'Verified student record mapping and learning goal declarations',
    },
    settings: {
      title: 'Platform Preferences & Security',
      subtitle: 'Theme customization, notification preferences, and session controls',
    },
  };

  const currentView = titles[activeNav] || titles.dashboard;

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#273449] px-4 sm:px-8 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileNav}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[#E2E8F0] dark:border-[#273449] md:hidden cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {onToggleSidebarCollapse && (
            <button
              onClick={onToggleSidebarCollapse}
              className="hidden md:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[#E2E8F0] dark:border-[#273449] cursor-pointer shrink-0"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#172033] dark:text-[#F8FAFC] tracking-tight truncate">
              {currentView.title}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] hidden sm:block truncate">
              {currentView.subtitle}
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
              {studentName[0] || 'S'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#172033] dark:text-[#F8FAFC] leading-tight max-w-[120px] truncate">
                {studentName}
              </span>
              <span className="text-[10px] text-[#3578D4] dark:text-[#4C8CE4] font-bold uppercase tracking-wider">
                {studentRole || 'Student'}
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
