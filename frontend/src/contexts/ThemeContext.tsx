import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'classic' | 'cyber';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('classic');

  useEffect(() => {
    const stored = localStorage.getItem('campus-theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-classic', 'theme-cyber');
    
    if (theme === 'cyber') {
      root.classList.add('theme-cyber');
    }
    
    localStorage.setItem('campus-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'classic' ? 'cyber' : 'classic');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
