import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Eraser, PenTool, Type, Palette, Save, Undo, Redo, Eye, EyeOff } from 'lucide-react';

interface PhysicalBookCanvasProps {
  content: string;
  onContentChange: (content: string) => void;
  blurMode: boolean;
  blurLevel: number;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  bookId: string;
  pageNumber: number;
}

interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}

interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export const PhysicalBookCanvas = ({
  content,
  onContentChange,
  blurMode,
  blurLevel,
  fontSize,
  backgroundColor,
  textColor,
  bookId,
  pageNumber
}: PhysicalBookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [history, setHistory] = useState<{ paths: DrawingPath[]; textElements: TextElement[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showOriginal, setShowOriginal] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isTextMode, setIsTextMode] = useState(false);

  const saveState = useCallback(() => {
    const newState = { paths: [...paths], textElements: [...textElements] };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [paths, textElements, history, historyIndex]);

  useEffect(() => {
    redrawCanvas();
  }, [paths, textElements, showOriginal, blurMode, blurLevel, backgroundColor]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw original content (blurred if in blur mode)
    if (content && !isTextMode) {
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = textColor;
      ctx.filter = blurMode && !showOriginal ? `blur(${blurLevel / 10}px)` : 'none';
      
      const lines = content.split('\n');
      const lineHeight = fontSize * 1.5;
      const padding = 20;
      
      lines.forEach((line, index) => {
        const y = padding + (index + 1) * lineHeight;
        if (y < canvas.height - padding) {
          ctx.fillText(line, padding, y);
        }
      });
      
      ctx.filter = 'none';
    }

    // Draw user's paths
    paths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Draw text elements
    ctx.globalCompositeOperation = 'source-over';
    textElements.forEach(textEl => {
      ctx.font = `${textEl.fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = textEl.color;
      ctx.fillText(textEl.text, textEl.x, textEl.y);
    });
  };

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (currentTool === 'text') return;
    
    const point = getCanvasPoint(e);
    const newPath: DrawingPath = {
      points: [point],
      color: currentColor,
      width: brushWidth,
      tool: currentTool
    };
    
    setCurrentPath(newPath);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentPath) return;
    
    const point = getCanvasPoint(e);
    setCurrentPath(prev => prev ? {
      ...prev,
      points: [...prev.points, point]
    } : null);
  };

  const stopDrawing = () => {
    if (currentPath && currentPath.points.length > 1) {
      setPaths(prev => [...prev, currentPath]);
      saveState();
    }
    setCurrentPath(null);
    setIsDrawing(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (currentTool === 'text') {
      const point = getCanvasPoint(e);
      const newTextElement: TextElement = {
        id: Math.random().toString(36).substr(2, 9),
        x: point.x,
        y: point.y,
        text: userInput || 'New text',
        fontSize: fontSize,
        color: currentColor
      };
      setTextElements(prev => [...prev, newTextElement]);
      setUserInput('');
      saveState();
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPaths(prevState.paths);
      setTextElements(prevState.textElements);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPaths(nextState.paths);
      setTextElements(nextState.textElements);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    setTextElements([]);
    setUserInput('');
    saveState();
  };

  const colors = ['#000000', '#1e40af', '#dc2626', '#16a34a', '#ea580c', '#7c3aed', '#db2777'];

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Tools */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
          <div className="flex gap-1">
            <Button
              variant={currentTool === 'pen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('pen')}
            >
              <PenTool className="w-4 h-4" />
            </Button>
            <Button
              variant={currentTool === 'eraser' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('eraser')}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant={currentTool === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('text')}
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  currentColor === color ? 'border-primary' : 'border-muted'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={brushWidth}
            onChange={(e) => setBrushWidth(Number(e.target.value))}
            className="w-16"
          />

          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCanvas}>
              Clear
            </Button>
          </div>

          {blurMode && (
            <Button
              variant={showOriginal ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Text Input */}
        {currentTool === 'text' && (
          <div className="mb-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type text to add to canvas..."
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* Text Mode Toggle */}
        <div className="mb-4">
          <Button
            variant={isTextMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsTextMode(!isTextMode)}
          >
            {isTextMode ? 'Drawing Mode' : 'Writing Mode'}
          </Button>
        </div>

        {/* Canvas or Text Area */}
        <div className="flex-1 relative">
          {isTextMode ? (
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Start writing your notes here..."
              className="w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                fontSize: `${fontSize}px`,
                backgroundColor,
                color: textColor,
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            />
          ) : (
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full border rounded-lg cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onClick={handleCanvasClick}
              style={{
                filter: blurMode && !showOriginal ? `blur(${blurLevel / 20}px)` : 'none',
                transition: 'filter 0.3s ease'
              }}
            />
          )}
        </div>

        {/* Save Button */}
        <div className="mt-4 flex justify-end">
          <Button onClick={() => onContentChange(userInput)}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};