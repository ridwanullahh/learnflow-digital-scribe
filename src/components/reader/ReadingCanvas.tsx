
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';

interface ReadingCanvasProps {
  content: string;
  blurMode: boolean;
  blurLevel: number;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  bookId: string;
  pageNumber: number;
}

export const ReadingCanvas = ({
  content,
  blurMode,
  blurLevel,
  fontSize,
  backgroundColor,
  textColor,
  bookId,
  pageNumber
}: ReadingCanvasProps) => {
  const [userText, setUserText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [userText]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full relative">
        <div className="relative h-full">
          {/* Original Content */}
          <div
            className="prose prose-sm max-w-none h-full overflow-y-auto leading-relaxed"
            style={{
              fontSize: `${fontSize}px`,
              color: textColor,
              backgroundColor: backgroundColor,
              filter: blurMode ? `blur(${blurLevel / 10}px)` : 'none',
              transition: 'filter 0.3s ease',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}
          >
            {content || (
              <div className="text-center text-muted-foreground py-12">
                <p>No content available for this page.</p>
              </div>
            )}
          </div>

          {/* Drawing Canvas Overlay */}
          {blurMode && (
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                pointerEvents: blurMode ? 'auto' : 'none',
                zIndex: 10
              }}
            />
          )}

          {/* Text Input Overlay */}
          {blurMode && (
            <div className="absolute inset-0 z-20 p-4">
              <textarea
                ref={textareaRef}
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Start rewriting the content here..."
                className="w-full h-full bg-transparent text-foreground resize-none outline-none"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.6',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}
        </div>

        {/* Drawing Controls */}
        {blurMode && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={clearCanvas}
              className="px-3 py-1 bg-background border border-border rounded text-sm hover:bg-muted transition-colors"
            >
              Clear Drawing
            </button>
            <button
              onClick={() => setUserText('')}
              className="px-3 py-1 bg-background border border-border rounded text-sm hover:bg-muted transition-colors"
            >
              Clear Text
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
