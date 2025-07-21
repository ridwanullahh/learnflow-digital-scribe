
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import sdk, { User } from '../lib/sdk';
import GeminiService from '../lib/gemini';
import TTSService from '../lib/tts';
import { UserPreferences } from '../types';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  sdk: typeof sdk;
  geminiService: GeminiService | null;
  ttsService: TTSService;
  isOffline: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  initializeGemini: (apiKey: string) => void;
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
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    if (token) {
      const currentUser = sdk.getCurrentUser(token);
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    }

    // Load preferences
    const savedPreferences = localStorage.getItem('user_preferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }

    // Check for Gemini API key
    const geminiApiKey = localStorage.getItem('gemini_api_key');
    if (geminiApiKey) {
      setGeminiService(new GeminiService(geminiApiKey));
    }

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
      // Auto-login after registration
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
    
    // Update TTS settings if they changed
    if (prefs.ttsSettings) {
      ttsService.updateSettings(prefs.ttsSettings);
    }
  };

  const initializeGemini = (apiKey: string) => {
    localStorage.setItem('gemini_api_key', apiKey);
    setGeminiService(new GeminiService(apiKey));
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
        login,
        logout,
        register,
        updatePreferences,
        initializeGemini
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
