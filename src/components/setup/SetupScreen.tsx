
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, Database, Sparkles, CheckCircle } from 'lucide-react';

interface SetupScreenProps {
  onComplete: () => void;
}

export const SetupScreen = ({ onComplete }: SetupScreenProps) => {
  const [step, setStep] = useState(1);
  const [githubConfig, setGithubConfig] = useState({
    owner: '',
    repo: '',
    token: ''
  });
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const { sdk, initializeGemini } = useApp();

  const handleGithubSetup = () => {
    // Update environment variables would need to be handled differently in production
    // For now, we'll use localStorage as a fallback
    localStorage.setItem('github_config', JSON.stringify(githubConfig));
    setStep(2);
  };

  const handleGeminiSetup = () => {
    if (geminiApiKey) {
      initializeGemini(geminiApiKey);
    }
    setStep(3);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-8 h-8 text-primary" />
            Welcome to LearnFlow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Step 1: GitHub Database Setup</h3>
              </div>
              <p className="text-muted-foreground">
                Configure your GitHub repository to store your books and learning data.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="github-owner">GitHub Username/Organization</Label>
                  <Input
                    id="github-owner"
                    placeholder="your-username"
                    value={githubConfig.owner}
                    onChange={(e) => setGithubConfig(prev => ({ ...prev, owner: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="github-repo">Repository Name</Label>
                  <Input
                    id="github-repo"
                    placeholder="learnflow-db"
                    value={githubConfig.repo}
                    onChange={(e) => setGithubConfig(prev => ({ ...prev, repo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={githubConfig.token}
                    onChange={(e) => setGithubConfig(prev => ({ ...prev, token: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a token with 'repo' permissions at GitHub Settings → Developer settings → Personal access tokens
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleGithubSetup}
                disabled={!githubConfig.owner || !githubConfig.repo || !githubConfig.token}
                className="w-full"
              >
                Continue to AI Setup
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Step 2: Gemini AI Setup</h3>
              </div>
              <p className="text-muted-foreground">
                Configure Gemini AI for intelligent learning features (optional but recommended).
              </p>
              <div>
                <Label htmlFor="gemini-key">Gemini API Key</Label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get your API key from Google AI Studio. This enables quiz generation, summaries, and more.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Skip for Now
                </Button>
                <Button onClick={handleGeminiSetup} className="flex-1">
                  Setup Gemini AI
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold">Setup Complete!</h3>
              </div>
              <p className="text-muted-foreground">
                LearnFlow is now configured and ready to use. You can start by creating your first book or importing existing content.
              </p>
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What's Next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create your account or sign in</li>
                  <li>• Import your first book or document</li>
                  <li>• Start learning with AI-powered tools</li>
                  <li>• Explore offline features and accessibility options</li>
                </ul>
              </div>
              <Button onClick={handleComplete} className="w-full">
                Get Started
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
