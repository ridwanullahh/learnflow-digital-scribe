
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Settings, 
  User, 
  Shield, 
  Globe, 
  Volume2, 
  Palette, 
  Database,
  Brain,
  Eye,
  Download
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const SettingsView = () => {
  const { user } = useApp();
  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'en',
    fontSize: 'medium',
    lineHeight: 'normal',
    ttsEnabled: true,
    ttsVoice: 'default',
    ttsSpeed: 1.0,
    offlineMode: true,
    aiCaching: true,
    blurLevel: 50,
    notifications: true,
    autoSave: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 max-w-4xl">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" defaultValue={user?.name || ''} />
                </div>
              </div>
              <Button variant="outline">Update Profile</Button>
            </CardContent>
          </Card>

          {/* Reading Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Reading Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Line Height</Label>
                  <Select value={settings.lineHeight} onValueChange={(value) => updateSetting('lineHeight', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Default Blur Level: {settings.blurLevel}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.blurLevel}
                  onChange={(e) => updateSetting('blurLevel', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Text-to-Speech Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Text-to-Speech
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Enable TTS</Label>
                  <p className="text-xs text-muted-foreground">Listen to your books with AI voice</p>
                </div>
                <Switch
                  checked={settings.ttsEnabled}
                  onCheckedChange={(checked) => updateSetting('ttsEnabled', checked)}
                />
              </div>
              {settings.ttsEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Voice</Label>
                      <Select value={settings.ttsVoice} onValueChange={(value) => updateSetting('ttsVoice', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="neural-male">Neural Male</SelectItem>
                          <SelectItem value="neural-female">Neural Female</SelectItem>
                          <SelectItem value="natural">Natural</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Speed: {settings.ttsSpeed}x</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={settings.ttsSpeed}
                        onChange={(e) => updateSetting('ttsSpeed', Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* AI & Learning Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI & Learning Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">AI Content Caching</Label>
                  <p className="text-xs text-muted-foreground">Cache generated quizzes and flashcards offline</p>
                </div>
                <Switch
                  checked={settings.aiCaching}
                  onCheckedChange={(checked) => updateSetting('aiCaching', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-Save Progress</Label>
                  <p className="text-xs text-muted-foreground">Automatically save reading progress and notes</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Offline Mode</Label>
                  <p className="text-xs text-muted-foreground">Prioritize offline functionality</p>
                </div>
                <Switch
                  checked={settings.offlineMode}
                  onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                <Button variant="destructive" size="sm">
                  Clear All Cache
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="pb-6">
            <Button className="w-full">Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
