import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROVIDERS = ['openai', 'anthropic', 'google'];
const ACTIVE_PROVIDER_KEY = 'active_ai_provider';

interface AIContextType {
  apiKeys: { [key: string]: string };
  activeProvider: string;
  providers: string[];
  isLoading: boolean;
  saveApiKey: (provider: string, key: string) => Promise<void>;
  setActiveProvider: (provider: string) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({});
  const [activeProvider, _setActiveProvider] = useState('openai');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load active provider
        const savedProvider = await AsyncStorage.getItem(ACTIVE_PROVIDER_KEY);
        if (savedProvider && PROVIDERS.includes(savedProvider)) {
          _setActiveProvider(savedProvider);
        }

        // Load all keys
        const loadedKeys: { [key: string]: string } = {};
        for (const provider of PROVIDERS) {
          const key = await SecureStore.getItemAsync(provider);
          if (key) {
            loadedKeys[provider] = key;
          }
        }
        setApiKeys(loadedKeys);
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveApiKey = async (provider: string, key: string) => {
    try {
      await SecureStore.setItemAsync(provider, key);
      setApiKeys((prev) => ({ ...prev, [provider]: key }));
    } catch (error) {
      console.error(`Failed to save API key for ${provider}:`, error);
    }
  };

  const setActiveProvider = async (provider: string) => {
    try {
      await AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, provider);
      _setActiveProvider(provider);
    } catch (error) {
      console.error('Failed to save active provider:', error);
    }
  };

  const value = {
    apiKeys,
    activeProvider,
    providers: PROVIDERS,
    isLoading,
    saveApiKey,
    setActiveProvider,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};
