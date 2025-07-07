import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';
type UserAgentMode = 'mobile' | 'desktop';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  userAgentMode: UserAgentMode;
  isMobileMode: boolean;
  toggleUserAgentMode: () => void;
  setUserAgentMode: (mode: UserAgentMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';
const USER_AGENT_STORAGE_KEY = '@app_user_agent_mode';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = Appearance.getColorScheme() || 'light';
  const [themeMode, setThemeState] = useState<ThemeMode>(systemTheme);
  const [userAgentMode, setUserAgentState] = useState<UserAgentMode>('mobile'); // Default to mobile mode

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        if (storedTheme) {
          setThemeState(storedTheme);
        } else {
          setThemeState(systemTheme); // Default to system theme if nothing stored
        }
      } catch (error) {
        console.error("Failed to load theme from storage", error);
        setThemeState(systemTheme); // Fallback to system theme
      }
    };
    loadTheme();
  }, [systemTheme]);

  useEffect(() => {
    const loadUserAgentMode = async () => {
      try {
        const storedUserAgentMode = await AsyncStorage.getItem(USER_AGENT_STORAGE_KEY) as UserAgentMode | null;
        if (storedUserAgentMode) {
          setUserAgentState(storedUserAgentMode);
        } else {
          setUserAgentState('mobile'); // Default to mobile mode
        }
      } catch (error) {
        console.error("Failed to load user agent mode from storage", error);
        setUserAgentState('mobile'); // Fallback to mobile mode
      }
    };
    loadUserAgentMode();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeState(mode);
    } catch (error) {
      console.error("Failed to save theme to storage", error);
    }
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const setUserAgentMode = async (mode: UserAgentMode) => {
    try {
      await AsyncStorage.setItem(USER_AGENT_STORAGE_KEY, mode);
      setUserAgentState(mode);
    } catch (error) {
      console.error("Failed to save user agent mode to storage", error);
    }
  };

  const toggleUserAgentMode = () => {
    setUserAgentMode(userAgentMode === 'mobile' ? 'desktop' : 'mobile');
  };

  const isDarkMode = themeMode === 'dark';
  const isMobileMode = userAgentMode === 'mobile';

  return (
    <ThemeContext.Provider value={{
      themeMode,
      isDarkMode,
      toggleTheme,
      setThemeMode,
      userAgentMode,
      isMobileMode,
      toggleUserAgentMode,
      setUserAgentMode
    }}>
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
