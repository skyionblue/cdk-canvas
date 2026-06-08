import React, {createContext, useContext, useState, useEffect} from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load theme from localStorage or default to light
    const saved = localStorage.getItem('cdk-canvas-theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('cdk-canvas-theme', theme);

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{theme, toggleTheme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
