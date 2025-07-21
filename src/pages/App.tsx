
import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AuthScreen } from '../components/auth/AuthScreen';
import { MainApp } from '../components/app/MainApp';
import { SetupScreen } from '../components/setup/SetupScreen';
import { SplashScreen } from '../components/common/SplashScreen';

export const App = () => {
  const { isAuthenticated, geminiService, sdk } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if SDK is configured
        if (!sdk.isReady()) {
          setShowSetup(true);
          setIsLoading(false);
          return;
        }

        // Initialize SDK
        await sdk.init();
        
        // Check if Gemini is configured
        if (!geminiService && !localStorage.getItem('gemini_api_key')) {
          setShowSetup(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        setShowSetup(true);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [sdk, geminiService]);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (showSetup) {
    return <SetupScreen onComplete={() => setShowSetup(false)} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <MainApp />;
};
