
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, BookOpen, Settings, Volume2, Brain, Eye, ChevronLeft, ChevronRight, Menu, Palette } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { ReadingCanvas } from './ReadingCanvas';
import { AIToolsPanel } from './AIToolsPanel';
import { ReaderSettings } from './ReaderSettings';

interface BookReaderProps {
  bookId: string;
  onBack: () => void;
}

export const BookReader = ({ bookId, onBack }: BookReaderProps) => {
  const { sdk, user, preferences, ttsService, geminiService, isOffline } = useApp();
  const [book, setBook] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [blurMode, setBlurMode] = useState(false);
  const [blurLevel, setBlurLevel] = useState(50);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');

  useEffect(() => {
    loadBook();
  }, [bookId, sdk]);

  const loadBook = async () => {
    if (!sdk || !bookId) return;
    
    try {
      const bookData = await sdk.getItem('books', bookId);
      if (bookData) {
        setBook(bookData);
        // Load reading progress
        const progress = await sdk.queryBuilder('learningProgress')
          .where((item: any) => item.bookId === bookId && item.userId === user?.id)
          .exec();
        
        if (progress.length > 0) {
          setCurrentPage(progress[0].pageNumber);
        }
      }
    } catch (error) {
      console.error('Failed to load book:', error);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > (book?.totalPages || 1)) return;
    
    setCurrentPage(newPage);
    
    // Update reading progress
    if (sdk && user) {
      try {
        const existingProgress = await sdk.queryBuilder('learningProgress')
          .where((item: any) => item.bookId === bookId && item.userId === user.id)
          .exec();
        
        if (existingProgress.length > 0) {
          await sdk.update('learningProgress', existingProgress[0].id, {
            pageNumber: newPage,
            lastAccessed: new Date().toISOString()
          });
        } else {
          await sdk.insert('learningProgress', {
            bookId,
            userId: user.id,
            pageNumber: newPage,
            lastAccessed: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  const handleTTSToggle = async () => {
    if (isReading) {
      ttsService.stop();
      setIsReading(false);
    } else {
      const text = getCurrentPageText();
      if (text) {
        await ttsService.speak(text, {
          rate: readingSpeed,
          voice: preferences.ttsSettings.voice
        });
        setIsReading(true);
      }
    }
  };

  const getCurrentPageText = () => {
    if (!book?.content) return '';
    
    // Simple pagination logic - split content into pages
    const wordsPerPage = 300;
    const words = book.content.split(' ');
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    
    return words.slice(startIndex, endIndex).join(' ');
  };

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <div className="hidden sm:block">
              <h1 className="font-semibold text-foreground">{book.title}</h1>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleTTSToggle}
            className={isReading ? 'bg-primary/20' : ''}
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button 
            variant={blurMode ? "default" : "ghost"} 
            size="icon"
            onClick={() => setBlurMode(!blurMode)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant={showAIPanel ? "default" : "ghost"} 
            size="icon"
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            <Brain className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Reading Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            <ReadingCanvas
              content={getCurrentPageText()}
              blurMode={blurMode}
              blurLevel={blurLevel}
              fontSize={fontSize}
              backgroundColor={backgroundColor}
              textColor={textColor}
              bookId={bookId}
              pageNumber={currentPage}
            />
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-0">
                Page {currentPage} of {book.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === (book.totalPages || 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {isOffline && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Offline
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {Math.round((currentPage / (book.totalPages || 1)) * 100)}% complete
              </span>
            </div>
          </div>

          {/* Blur Level Control */}
          {blurMode && (
            <div className="p-4 border-t border-border bg-background/95 backdrop-blur">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Blur Level:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={blurLevel}
                  onChange={(e) => setBlurLevel(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground min-w-0">
                  {blurLevel}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* AI Tools Panel */}
        {showAIPanel && (
          <AIToolsPanel
            bookId={bookId}
            currentPage={currentPage}
            content={getCurrentPageText()}
            geminiService={geminiService}
            onClose={() => setShowAIPanel(false)}
          />
        )}

        {/* Settings Panel */}
        {showSettings && (
          <ReaderSettings
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            textColor={textColor}
            onTextColorChange={setTextColor}
            readingSpeed={readingSpeed}
            onReadingSpeedChange={setReadingSpeed}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
};
