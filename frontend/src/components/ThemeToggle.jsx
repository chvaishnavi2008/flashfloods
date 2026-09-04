import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { theme, isDarkMode, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className={`flex items-center bg-[#0B2233] dark:bg-[#071322] p-1 rounded-xl border border-[#294657] dark:border-[#1E2E4A] font-mono text-xs ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-bold transition-all ${
            theme === 'light'
              ? 'bg-[#1769AA] text-white shadow-sm'
              : 'text-[#D7E0E7] hover:text-white hover:bg-[#123047]'
          }`}
          aria-label="Set Light Theme"
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-bold transition-all ${
            theme === 'dark'
              ? 'bg-[#1769AA] text-white shadow-sm'
              : 'text-[#D7E0E7] hover:text-white hover:bg-[#123047]'
          }`}
          aria-label="Set Dark Theme"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-300" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center ${
        isDarkMode
          ? 'bg-[#0B2233] border-[#294657] text-amber-300 hover:text-amber-200 hover:bg-[#183D55] shadow-sm'
          : 'bg-[#0B2233] border-[#294657] text-[#D7E0E7] hover:text-white hover:bg-[#183D55] shadow-sm'
      } ${className}`}
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0 text-sky-200" />
      )}
    </button>
  );
}
