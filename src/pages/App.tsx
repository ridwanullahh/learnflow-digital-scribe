
import { useApp } from '../contexts/AppContext';
import { AuthScreen } from '../components/auth/AuthScreen';
import { MainApp } from '../components/app/MainApp';
import { SplashScreen } from '../components/common/SplashScreen';

export const App = () => {
  const { isAuthenticated, isLoading } = useApp();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <MainApp />;
};
