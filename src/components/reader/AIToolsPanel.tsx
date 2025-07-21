
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Brain, FileText, MessageSquare, Zap, Globe, BookOpen, Target } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface AIToolsPanelProps {
  bookId: string;
  currentPage: number;
  content: string;
  geminiService: any;
  onClose: () => void;
}

export const AIToolsPanel = ({ 
  bookId, 
  currentPage, 
  content, 
  geminiService, 
  onClose 
}: AIToolsPanelProps) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const aiTools = [
    {
      id: 'quiz',
      name: 'Generate Quiz',
      icon: Target,
      description: 'Create questions based on current content',
      color: 'text-blue-500'
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      icon: FileText,
      description: 'Generate flashcards for key concepts',
      color: 'text-green-500'
    },
    {
      id: 'summary',
      name: 'Summary',
      icon: BookOpen,
      description: 'Get a concise summary of the content',
      color: 'text-purple-500'
    },
    {
      id: 'keypoints',
      name: 'Key Points',
      icon: Zap,
      description: 'Extract important points',
      color: 'text-orange-500'
    },
    {
      id: 'explain',
      name: 'Explain Better',
      icon: MessageSquare,
      description: 'Get detailed explanations',
      color: 'text-red-500'
    },
    {
      id: 'translate',
      name: 'Translate',
      icon: Globe,
      description: 'Translate to different languages',
      color: 'text-indigo-500'
    }
  ];

  const handleToolClick = async (toolId: string) => {
    if (!geminiService || !content) return;
    
    setIsGenerating(true);
    try {
      let prompt = '';
      
      switch (toolId) {
        case 'quiz':
          prompt = `Create 5 multiple choice questions based on this content:\n\n${content}`;
          break;
        case 'flashcards':
          prompt = `Create flashcards (question and answer pairs) for key concepts in this content:\n\n${content}`;
          break;
        case 'summary':
          prompt = `Provide a concise summary of this content:\n\n${content}`;
          break;
        case 'keypoints':
          prompt = `Extract the key points from this content:\n\n${content}`;
          break;
        case 'explain':
          prompt = `Explain this content in simpler terms with examples:\n\n${content}`;
          break;
        case 'translate':
          prompt = `Translate this content to Spanish:\n\n${content}`;
          break;
      }
      
      const response = await geminiService.generateContent(prompt, {
        bookId,
        pageNumber: currentPage,
        toolType: toolId
      });
      
      setGeneratedContent({
        type: toolId,
        content: response,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-80 border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">AI Learning Tools</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'generate'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          History
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {activeTab === 'generate' ? (
          <div className="space-y-3">
            {aiTools.map((tool) => (
              <Card 
                key={tool.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleToolClick(tool.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <tool.icon className={`w-5 h-5 ${tool.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {generatedContent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {generatedContent.type.charAt(0).toUpperCase() + generatedContent.type.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    {generatedContent.content}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No AI content generated yet</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Loading State */}
      {isGenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Generating...</p>
          </div>
        </div>
      )}
    </div>
  );
};
