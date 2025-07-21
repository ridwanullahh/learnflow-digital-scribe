
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { 
  Pencil, 
  Eraser, 
  Type, 
  Palette, 
  Undo, 
  Redo, 
  Eye, 
  EyeOff,
  Save,
  BookOpen
} from 'lucide-react';

interface PhysicalBookCanvasProps {
  bookId: string;
  pageNumber: number;
  pageContent: string;
  onContentChange: (content: string) => void;
  onSaveAnnotation: (annotation: any) => void;
  blurMode?: boolean;
  blurLevel?: number;
  onBlurToggle?: () => void;
  onBlurLevelChange?: (level: number) => void;
}

export const PhysicalBookCanvas = ({
  bookId,
  pageNumber,
  pageContent,
  onContentChange,
  onSaveAnnotation,
  blurMode = false,
  blurLevel = 50,
  onBlurToggle,
  onBlurLevelChange
}: PhysicalBookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'text'>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [textMode, setTextMode] = useState(false);
  const [userText, setUserText] = useState(pageContent);
  const [showOriginal, setShowOriginal] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [userText]);

  const saveState = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = drawingHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setDrawingHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [drawingHistory, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const prevState = drawingHistory[historyIndex - 1];
        ctx.putImageData(prevState, 0, 0);
        setHistoryIndex(historyIndex - 1);
      }
    }
  };

  const redo = () => {
    if (historyIndex < drawingHistory.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const nextState = drawingHistory[historyIndex + 1];
        ctx.putImageData(nextState, 0, 0);
        setHistoryIndex(historyIndex + 1);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 2;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const drawingData = canvas.toDataURL();
    
    onSaveAnnotation({
      type: 'drawing',
      pageNumber,
      data: drawingData,
      timestamp: new Date().toISOString()
    });
    
    if (userText !== pageContent) {
      onContentChange(userText);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fefefe] border border-gray-200 rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pen')}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <Button
            variant={textMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTextMode(!textMode)}
          >
            <Type className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo}>
            <Redo className="w-4 h-4" />
          </Button>
          {onBlurToggle && (
            <Button
              variant={blurMode ? 'default' : 'outline'}
              size="sm"
              onClick={onBlurToggle}
            >
              {blurMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Drawing Tools */}
      <div className="flex items-center gap-4 p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Stroke:</span>
          <div className="w-20">
            <Slider
              value={[strokeWidth]}
              onValueChange={([value]) => setStrokeWidth(value)}
              max={20}
              min={1}
              step={1}
            />
          </div>
          <span className="text-sm text-gray-600">{strokeWidth}px</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Color:</span>
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  strokeColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setStrokeColor(color)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Blur Controls */}
      {blurMode && onBlurLevelChange && (
        <div className="flex items-center gap-4 p-3 border-b border-gray-200 bg-blue-50">
          <span className="text-sm font-medium">Blur Level:</span>
          <div className="flex-1 max-w-40">
            <Slider
              value={[blurLevel]}
              onValueChange={([value]) => onBlurLevelChange(value)}
              max={100}
              min={0}
              step={5}
            />
          </div>
          <span className="text-sm text-gray-600">{blurLevel}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            {showOriginal ? 'Hide' : 'Show'} Original
          </Button>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Original Content */}
        {showOriginal && (
          <div className="absolute inset-0 z-10 bg-white/95 p-4 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              {pageContent || (
                <div className="text-center text-gray-500 py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-2" />
                  <p>Start writing or drawing on this page</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Layer */}
        <div 
          className="absolute inset-0 p-4 overflow-y-auto"
          style={{
            filter: blurMode ? `blur(${blurLevel * 0.1}px)` : 'none',
            opacity: blurMode ? Math.max(0.1, 1 - blurLevel * 0.01) : 1
          }}
        >
          {textMode ? (
            <textarea
              ref={textareaRef}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Start writing here..."
              className="w-full h-full bg-transparent resize-none outline-none text-gray-800 leading-relaxed font-serif"
              style={{ minHeight: '100%' }}
            />
          ) : (
            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-serif">
              {userText || (
                <div className="text-center text-gray-400 py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-2" />
                  <p>This page is ready for your content</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ 
            zIndex: textMode ? 5 : 15,
            pointerEvents: tool === 'text' ? 'none' : 'auto'
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Page {pageNumber}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {textMode ? 'Text Mode' : 'Drawing Mode'}
          </Badge>
          {blurMode && (
            <Badge variant="secondary" className="text-xs">
              Learning Mode
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="text-xs"
          >
            Clear Drawings
          </Button>
        </div>
      </div>
    </div>
  );
};
