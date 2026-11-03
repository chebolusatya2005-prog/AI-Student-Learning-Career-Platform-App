/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  UserCheck,
  Link2,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { AdminNavTab } from '../AdminDashboard';

interface AdminSidebarProps {
  activeNav: AdminNavTab;
  onSelectNav: (tab: AdminNavTab) => void;
  isMobileNavOpen: boolean;
  onCloseMobileNav: () => void;
  adminName: string;
  adminEmail?: string;
  totalStudents: number;
  totalTrainers: number;
  totalAssignments: number;
  totalCohortRecords: number;
}

export function AdminSidebar({
  activeNav,
  onSelectNav,
  isMobileNavOpen,
  onCloseMobileNav,
  adminName,
  adminEmail,
  totalStudents,
  totalTrainers,
  totalAssignments,
  totalCohortRecords,
}: AdminSidebarProps) {
  const navItems: Array<{
    id: AdminNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap, badge: totalStudents },
    { id: 'trainers', label: 'Trainers', icon: UserCheck, badge: totalTrainers },
    { id: 'assignments', label: 'Assignments', icon: Link2, badge: totalAssignments },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: totalCohortRecords },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
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
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-[#111C35] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3578D4] flex items-center justify-center text-white shadow-md shadow-blue-900/30 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
                AI Learning Platform
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/80">
                  Admin Role
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobileNav}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1.5" aria-label="Admin Navigation">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3578D4] text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#1A294A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#2B64B8] text-white' : 'bg-[#1A294A] text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Authenticated Governance */}
        <div className="p-4 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Platform Governance</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{adminName}</span>
            </div>
            <p className="text-[11px] text-blue-400 font-semibold">Administrator &bull; Full Access</p>
            {adminEmail && (
              <p className="text-[10px] text-slate-400 truncate font-mono">{adminEmail}</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
