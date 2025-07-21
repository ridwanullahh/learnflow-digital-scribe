
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, BookOpen, Settings, Volume2, Brain, Eye } from 'lucide-react';

interface BookReaderProps {
  bookId: string;
  onBack: () => void;
}

export const BookReader = ({ bookId, onBack }: BookReaderProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [blurMode, setBlurMode] = useState(false);
  const [blurLevel, setBlurLevel] = useState(50);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Reader Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-medium">Sample Book {bookId}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button 
            variant={blurMode ? "default" : "ghost"} 
            size="icon"
            onClick={() => setBlurMode(!blurMode)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Brain className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Reader Content */}
      <div className="flex-1 flex">
        {/* Main Reading Area */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="p-8 h-full">
              <div 
                className="text-base leading-relaxed h-full overflow-y-auto"
                style={{
                  filter: blurMode ? `blur(${blurLevel / 10}px)` : 'none',
                  transition: 'filter 0.3s ease'
                }}
              >
                <h2 className="text-2xl font-bold mb-6">Chapter 1: Introduction to Learning</h2>
                <p className="mb-4">
                  Welcome to the world of enhanced digital reading. This is where your learning journey begins 
                  with AI-powered tools and innovative features designed to help you retain information better.
                </p>
                <p className="mb-4">
                  The human brain is capable of incredible feats of memory and understanding when given the 
                  right tools and techniques. Through spaced repetition, active recall, and contextual learning, 
                  we can dramatically improve our ability to acquire and retain knowledge.
                </p>
                <p className="mb-4">
                  This book will guide you through proven methodologies for effective learning, enhanced by 
                  modern technology and artificial intelligence. You'll discover how to transform passive 
                  reading into active, engaging learning experiences.
                </p>
                <p className="mb-4">
                  Traditional learning methods often rely on rote memorization and passive consumption of 
                  information. However, research shows that active engagement with material leads to better 
                  comprehension and long-term retention.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Tools Sidebar */}
        <div className="w-80 border-l border-border p-4 bg-muted/20">
          <h3 className="font-semibold mb-4">Learning Tools</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Brain className="w-4 h-4 mr-2" />
              Generate Quiz
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Create Flashcards
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Key Points
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Volume2 className="w-4 h-4 mr-2" />
              Summary
            </Button>
          </div>

          {blurMode && (
            <div className="mt-6">
              <label className="text-sm font-medium mb-2 block">Blur Level</label>
              <input
                type="range"
                min="0"
                max="100"
                value={blurLevel}
                onChange={(e) => setBlurLevel(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Clear</span>
                <span>Hidden</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reader Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of 50
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === 50}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
