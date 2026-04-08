"use client"
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({ dark: false, toggle: () => {} });

export function useTheme() { return useContext(ThemeContext); }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  function toggle() {
    setDark(prev => !prev);
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? "dark" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
