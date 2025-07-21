
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeSDK } from '../lib/sdk';
import GeminiService from '../lib/gemini';
import TTSService from '../lib/tts';
import { UserPreferences } from '../types';
import type { User } from '../lib/sdk';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  sdk: any;
  geminiService: GeminiService | null;
  ttsService: TTSService;
  isOffline: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sdk, setSdk] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    ttsSettings: {
      voice: '',
      speed: 1,
      pitch: 1
    },
    difficultyLevel: 1,
    autoSave: true,
    offlineMode: false
  });
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const [ttsService] = useState(() => new TTSService());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize SDK
        const sdkInstance = await initializeSDK();
        setSdk(sdkInstance);
        
        // Check for existing session
        const token = localStorage.getItem('auth_token');
        if (token) {
          const currentUser = sdkInstance.getCurrentUser(token);
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          }
        }

        // Load preferences
        const savedPreferences = localStorage.getItem('user_preferences');
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences);
          setPreferences(parsed);
          ttsService.updateSettings(parsed.ttsSettings);
        }

        // Initialize Gemini if API key is available
        const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (geminiApiKey) {
          setGeminiService(new GeminiService(geminiApiKey));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeApp();

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await sdk.login(email, password);
      if (typeof result === 'string') {
        const token = result;
        localStorage.setItem('auth_token', token);
        const currentUser = sdk.getCurrentUser(token);
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      sdk.destroySession(token);
      localStorage.removeItem('auth_token');
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const newUser = await sdk.register(email, password, { name });
      await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...prefs };
    setPreferences(newPreferences);
    localStorage.setItem('user_preferences', JSON.stringify(newPreferences));
    
    if (prefs.ttsSettings) {
      ttsService.updateSettings(prefs.ttsSettings);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        preferences,
        sdk,
        geminiService,
        ttsService,
        isOffline,
        isLoading,
        login,
        logout,
        register,
        updatePreferences
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
