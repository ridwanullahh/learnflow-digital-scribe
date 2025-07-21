
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Type, Palette, Volume2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Slider } from '../ui/slider';

interface ReaderSettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  readingSpeed: number;
  onReadingSpeedChange: (speed: number) => void;
  onClose: () => void;
}

export const ReaderSettings = ({
  fontSize,
  onFontSizeChange,
  backgroundColor,
  onBackgroundColorChange,
  textColor,
  onTextColorChange,
  readingSpeed,
  onReadingSpeedChange,
  onClose
}: ReaderSettingsProps) => {
  const backgroundColors = [
    { name: 'Light', value: '#ffffff' },
    { name: 'Sepia', value: '#fef7e0' },
    { name: 'Dark', value: '#1a1a1a' },
    { name: 'Blue', value: '#0f172a' }
  ];

  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#374151' },
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#d1d5db' }
  ];

  return (
    <div className="w-80 border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Reader Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Settings Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Font Size */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="w-4 h-4" />
                Font Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => onFontSizeChange(value[0])}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>12px</span>
                  <span>{fontSize}px</span>
                  <span>24px</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onBackgroundColorChange(color.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      backgroundColor === color.value
                        ? 'border-primary'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="text-xs font-medium" style={{ 
                      color: color.value === '#ffffff' || color.value === '#fef7e0' ? '#000000' : '#ffffff' 
                    }}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Text Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text Color
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onTextColorChange(color.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      textColor === color.value
                        ? 'border-primary'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    style={{ 
                      backgroundColor: color.value === '#000000' || color.value === '#374151' ? '#f3f4f6' : '#1f2937',
                      color: color.value
                    }}
                  >
                    <span className="text-xs font-medium">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reading Speed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Reading Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Slider
                  value={[readingSpeed]}
                  onValueChange={(value) => onReadingSpeedChange(value[0])}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span>{readingSpeed}x</span>
                  <span>2x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
