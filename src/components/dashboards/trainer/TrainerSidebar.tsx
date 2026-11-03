/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';

export type TrainerNavTab =
  | 'dashboard'
  | 'students'
  | 'progress'
  | 'risk'
  | 'recommendations'
  | 'profile'
  | 'settings';

interface TrainerSidebarProps {
  activeNav: TrainerNavTab;
  onSelectNav: (tab: TrainerNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileNavOpen: boolean;
  onCloseMobileNav: () => void;
  trainerName: string;
  trainerEmail?: string;
  trainerSpecialization?: string;
  assignedCount: number;
  highRiskCount: number;
  onSignOut: () => Promise<void>;
}

export function TrainerSidebar({
  activeNav,
  onSelectNav,
  isCollapsed,
  onToggleCollapse,
  isMobileNavOpen,
  onCloseMobileNav,
  trainerName,
  trainerEmail,
  trainerSpecialization,
  assignedCount,
  highRiskCount,
  onSignOut,
}: TrainerSidebarProps) {
  const navItems: Array<{
    id: TrainerNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'students',
      label: 'My Students',
      icon: <Users className="w-4 h-4" />,
      badge: assignedCount,
      badgeColor: 'bg-[#1A294A] text-blue-200 border border-blue-700/60',
    },
    {
      id: 'progress',
      label: 'Student Progress',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'risk',
      label: 'Risk Monitoring',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: highRiskCount > 0 ? highRiskCount : undefined,
      badgeColor: 'bg-rose-900/80 text-rose-200 border border-rose-700',
    },
    {
      id: 'recommendations',
      label: 'Learning Recommendations',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (id: TrainerNavTab) => {
    onSelectNav(id);
    onCloseMobileNav();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 text-slate-300">
      {/* Top Header / Branding */}
      <div className="space-y-6">
        {/* Brand Lockup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3578D4] flex items-center justify-center text-white shadow-md shadow-blue-900/30 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="font-bold text-white leading-tight text-sm truncate flex items-center gap-1.5">
                  <span>AI Learning Platform</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/80">
                    Trainer Role
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A294A] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobileNav}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A294A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trainer Brief Summary */}
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Mentorship Portal</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{assignedCount} Mentees</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">{trainerName}</p>
            {trainerSpecialization && (
              <p className="text-[11px] text-slate-400 truncate">{trainerSpecialization}</p>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#3578D4] text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#1A294A]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
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
      </div>

      {/* Footer User Info & Logout */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        {!isCollapsed && (
          <div className="px-1 space-y-0.5">
            <p className="text-xs font-bold text-white truncate">{trainerName}</p>
            {trainerEmail && <p className="text-[11px] text-slate-400 truncate font-mono">{trainerEmail}</p>}
          </div>
        )}

        <button
          onClick={onSignOut}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'
          } text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/40 rounded-xl transition-colors cursor-pointer`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen bg-[#111C35] text-slate-300 border-r border-slate-800/80 transition-all duration-300 shrink-0 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileNav}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] h-full bg-[#111C35] text-slate-300 border-r border-slate-800/80 shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
