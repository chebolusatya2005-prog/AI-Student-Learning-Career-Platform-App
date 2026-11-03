/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unified Cross-Dashboard Design System Tokens
 * Enforces visual consistency across Admin, Trainer, and Student dashboards.
 */

export const DESIGN_TOKENS = {
  // Brand Colors
  sidebarBg: '#111C35',
  mainBgLight: '#F4F7FB',
  mainBgDark: '#0B1120',
  cardBgLight: '#FFFFFF',
  cardBgDark: '#172033',
  primaryAccent: '#3578D4',
  primaryAccentHover: '#2B64B8',
  textPrimaryLight: '#172033',
  textPrimaryDark: '#F8FAFC',
  textSecondaryLight: '#64748B',
  textSecondaryDark: '#94A3B8',
  borderColorLight: '#E2E8F0',
  borderColorDark: '#273449',

  // Semantic Status Colors
  success: {
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    hex: '#16A34A',
  },
  warning: {
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    hex: '#D97706',
  },
  danger: {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    hex: '#DC2626',
  },
  info: {
    text: 'text-[#3578D4] dark:text-[#4C8CE4]',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-[#3578D4]',
    hex: '#3578D4',
  },

  // Common Class Collections
  layoutContainer: 'min-h-screen flex bg-[#F4F7FB] dark:bg-[#0B1120] text-[#172033] dark:text-[#F8FAFC] font-sans antialiased transition-colors duration-200',
  mainViewport: 'flex-1 flex flex-col min-w-0 min-h-screen',
  pageContent: 'flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto',
  
  // Sidebar
  sidebarCanvas: 'bg-[#111C35] text-slate-300 border-r border-slate-800/80',
  sidebarActiveItem: 'bg-[#3578D4] text-white shadow-sm font-bold',
  sidebarInactiveItem: 'text-slate-300 hover:text-white hover:bg-[#1A294A]',
  sidebarBadgeActive: 'bg-[#2B64B8] text-white',
  sidebarBadgeInactive: 'bg-[#1A294A] text-slate-300',

  // Header
  headerBar: 'sticky top-0 z-20 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#273449] px-4 sm:px-8 py-4 transition-colors duration-200',
  headerTitle: 'text-lg sm:text-xl font-extrabold text-[#172033] dark:text-[#F8FAFC] tracking-tight truncate',
  headerSubtitle: 'text-xs text-[#64748B] dark:text-[#94A3B8] hidden sm:block truncate',
  
  // Cards & Panels
  cardPanel: 'bg-white dark:bg-[#172033] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#273449] shadow-2xs transition-colors',
  kpiNumber: 'text-3xl sm:text-4xl font-extrabold text-[#172033] dark:text-[#F8FAFC] font-mono tabular-nums',
  kpiLabel: 'text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]',

  // Chart Containers
  chartPanel: 'bg-white dark:bg-[#172033] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#273449] shadow-2xs space-y-5 flex flex-col justify-between transition-colors',
  chartTitle: 'text-sm font-bold text-[#172033] dark:text-[#F8FAFC]',
  chartSubtitle: 'text-xs text-[#64748B] dark:text-[#94A3B8]',

  // Buttons & Controls
  primaryBtn: 'px-4 py-2 text-xs font-semibold text-white bg-[#3578D4] hover:bg-[#2B64B8] rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2',
  secondaryBtn: 'px-4 py-2 text-xs font-semibold text-[#172033] dark:text-[#F8FAFC] bg-[#F4F7FB] dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#273449] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2',
} as const;
