import { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { 
  Pen, 
  Eraser, 
  Highlighter, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface ReadingCanvasProps {
  pageContent: string;
  onAnnotationAdd: (annotation: any) => void;
  annotations: any[];
  difficultyLevel: number;
  onDifficultyChange: (level: number) => void;
  className?: string;
}

export const ReadingCanvas = ({
  pageContent,
  onAnnotationAdd,
  annotations,
  difficultyLevel,
  onDifficultyChange,
  className = ""
}: ReadingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'highlighter'>('pen');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [color, setColor] = useState('#000000');
  const [showBlurLayer, setShowBlurLayer] = useState(false);

  const tools = [
    { id: 'pen' as const, icon: Pen, label: 'Pen' },
    { id: 'highlighter' as const, icon: Highlighter, label: 'Highlighter' },
    { id: 'eraser' as const, icon: Eraser, label: 'Eraser' },
  ];

  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw page content as background
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    const lines = pageContent.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, 20, 30 + index * 20);
    });

    // Draw existing annotations
    annotations.forEach((annotation) => {
      if (annotation.type === 'drawing' && annotation.data) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = annotation.data;
      }
    });
  }, [pageContent, annotations]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Set tool properties
    switch (currentTool) {
      case 'pen':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        break;
      case 'highlighter':
        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = color + '80'; // Add transparency
        ctx.lineWidth = strokeWidth * 3;
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = strokeWidth * 2;
        break;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save drawing as annotation
    const dataUrl = canvas.toDataURL();
    onAnnotationAdd({
      type: 'drawing',
      data: dataUrl,
      tool: currentTool,
      color: color,
      strokeWidth: strokeWidth,
      timestamp: new Date().toISOString()
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw page content
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    const lines = pageContent.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, 20, 30 + index * 20);
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Drawing Tools */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-background">
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool(tool.id)}
              className="h-8 w-8 p-0"
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Size:</span>
          <Slider
            value={[strokeWidth]}
            onValueChange={(value) => setStrokeWidth(value[0])}
            max={10}
            min={1}
            step={1}
            className="w-16"
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded border-2 ${
                color === c ? 'border-foreground' : 'border-border'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Difficulty:</span>
          <Slider
            value={[difficultyLevel]}
            onValueChange={(value) => onDifficultyChange(value[0])}
            max={5}
            min={1}
            step={1}
            className="w-20"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBlurLayer(!showBlurLayer)}
          className="h-8 w-8 p-0"
        >
          {showBlurLayer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {/* Drawing Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair bg-white"
          style={{
            filter: showBlurLayer ? `blur(${difficultyLevel}px)` : 'none'
          }}
        />
        
        {showBlurLayer && (
          <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none" />
        )}
      </div>
    </div>
  );
};
