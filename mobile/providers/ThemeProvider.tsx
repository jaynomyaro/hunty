import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMountedRef } from '../hooks/useMountedRef';
import { registerDiagnostic, unregisterDiagnostic } from '../lib/memoryDiagnostics';

export type Theme = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ColorScheme;
}

interface ColorScheme {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

const lightColors: ColorScheme = {
  background: '#ffffff',
  text: '#111827',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#0ea5e9',
};

const darkColors: ColorScheme = {
  background: '#1f2937',
  text: '#f3f4f6',
  primary: '#60a5fa',
  secondary: '#a78bfa',
  border: '#374151',
  error: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
  info: '#38bdf8',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [mounted, setMounted] = useState(false);

  const mountedRef = useMountedRef();

  useEffect(() => {
    registerDiagnostic('ThemeProviderAsyncLoad');
    let active = true;

    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (!mountedRef.current) {
          return;
        }
    let isMounted = true;

    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (!isMounted) return;

        if (savedTheme) {
          setTheme(savedTheme as Theme);
        } else if (systemColorScheme) {
          setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to load theme preference:', error);
        }
      } finally {
        if (active && mountedRef.current) {
        if (isMounted) {
          console.warn('Failed to load theme preference:', error);
        }
      } finally {
        if (isMounted) {
          setMounted(true);
        }
      }
    };

    void loadTheme();

    return () => {
      active = false;
      unregisterDiagnostic('ThemeProviderAsyncLoad');
    };
  }, [systemColorScheme, mountedRef]);
    loadTheme();

    return () => {
      isMounted = false;
    };
  }, [systemColorScheme]);

  const setThemePreference = async (newPreference: ThemePreference) => {
    setPreference(newPreference);
    try {
      await AsyncStorage.setItem('themePreference', newPreference);
    } catch {
      console.warn('Failed to save theme preference');
    }
  };

  const resolvedTheme: Theme =
    preference === 'system'
      ? systemColorScheme === 'dark' ? 'dark' : 'light'
      : preference;

  const toggleTheme = () => {
    setThemePreference(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{ theme: resolvedTheme, themePreference: preference, setThemePreference, toggleTheme, isDark, colors }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
