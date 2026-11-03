/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'educareer_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    // Default theme: Dark as required by prompt
    return 'dark';
  });

  const applyThemeToDOM = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const isDark = theme === 'dark';

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme,
      setTheme,
    }),
    [theme, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Reusable Theme Toggle Button with Sun and Moon icons,
 * tooltips, and accessible color contrast in both modes.
 */
export function ThemeToggle({
  className = '',
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
        isDark
          ? 'bg-[#172033] hover:bg-[#1E293B] text-teal-300 border border-[#273449] hover:border-teal-500/40 shadow-sm'
          : 'bg-white hover:bg-slate-100 text-teal-700 border border-slate-200 hover:border-teal-500/40 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-teal-300 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 text-teal-700 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium whitespace-nowrap">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
