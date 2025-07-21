
import { BookOpen, Sparkles } from 'lucide-react';

export const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative">
          <BookOpen className="w-24 h-24 text-primary mx-auto animate-pulse" />
          <Sparkles className="w-8 h-8 text-accent absolute -top-2 -right-2 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">LearnFlow</h1>
          <p className="text-xl text-muted-foreground">Digital Learning Made Simple</p>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};
