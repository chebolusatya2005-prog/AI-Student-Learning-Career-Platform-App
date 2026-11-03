/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Target,
  Sparkles,
  User,
  Settings,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type StudentNavTab =
  | 'dashboard'
  | 'learning'
  | 'progress'
  | 'practice'
  | 'assistant'
  | 'profile'
  | 'settings';

interface StudentSidebarProps {
  activeNav: StudentNavTab;
  onSelectNav: (tab: StudentNavTab) => void;
  isMobileNavOpen: boolean;
  onCloseMobileNav: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  studentName: string;
  studentEmail?: string;
  studentId?: string | number | null;
  courseName?: string | null;
  submissionCount?: number;
  readinessScore?: number | null;
}

export function StudentSidebar({
  activeNav,
  onSelectNav,
  isMobileNavOpen,
  onCloseMobileNav,
  isCollapsed = false,
  onToggleCollapse,
  studentName,
  studentEmail,
  studentId,
  courseName,
  submissionCount = 0,
  readinessScore,
}: StudentSidebarProps) {
  const navItems: Array<{
    id: StudentNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'learning',
      label: 'My Learning',
      icon: BookOpen,
      badge: courseName ? courseName.split('-')[1]?.trim() || courseName.split(' ')[0] : undefined,
    },
    {
      id: 'progress',
      label: 'My Progress',
      icon: TrendingUp,
      badge: readinessScore !== null && readinessScore !== undefined ? `${readinessScore.toFixed(0)} pts` : submissionCount > 0 ? submissionCount : undefined,
      badgeColor: 'bg-[#1A294A] text-emerald-300',
    },
    {
      id: 'practice',
      label: 'Practice & Skills',
      icon: Target,
      badge: '5h/wk',
      badgeColor: 'bg-[#1A294A] text-blue-300',
    },
    {
      id: 'assistant',
      label: 'AI Learning Assistant',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      badge: studentId ? `ID: ${studentId}` : undefined,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          onClick={onCloseMobileNav}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Persistent Unified Dark Navy Sidebar (#111C35) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen shrink-0 bg-[#111C35] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
          isMobileNavOpen ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top Branding Section */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#3578D4] flex items-center justify-center text-white shadow-md shadow-blue-900/30 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                  AI Learning Platform
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/80">
                    Student Role
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobileNav}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 text-slate-400 hover:text-white hover:bg-[#1A294A] rounded-lg cursor-pointer transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1.5" aria-label="Student Navigation">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectNav(item.id);
                  onCloseMobileNav();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3578D4] text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#1A294A]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1 ${
                      item.badgeColor || (isActive ? 'bg-[#2B64B8] text-white' : 'bg-[#1A294A] text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Authenticated Student Profile Card */}
        <div className="p-4 border-t border-slate-800/80 space-y-2.5">
          {!isCollapsed && (
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Session Isolation</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
          <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {!isCollapsed && <span className="truncate">{studentName}</span>}
            </div>
            {!isCollapsed && (
              <>
                <p className="text-[11px] text-blue-400 font-semibold">Student &bull; Active Session</p>
                {studentId && (
                  <p className="text-[10px] text-slate-300 font-mono font-bold">ID: {studentId}</p>
                )}
                {studentEmail && (
                  <p className="text-[10px] text-slate-400 truncate font-mono">{studentEmail}</p>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
