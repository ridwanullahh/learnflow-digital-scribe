
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, Plus, Upload, Link } from 'lucide-react';

interface QuickBookCreatorProps {
  onCreateBook: (bookData: any) => void;
  isLoading?: boolean;
}

export const QuickBookCreator = ({ onCreateBook, isLoading = false }: QuickBookCreatorProps) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleQuickCreate = () => {
    if (!title.trim()) return;
    
    // Create a blank physical book-like experience
    onCreateBook({
      title: title.trim(),
      author: author.trim() || 'Unknown Author',
      content: '', // Start with empty content for physical book-like mode
      category: 'general',
      language: 'en',
      mode: 'physical-book', // Default to physical book mode
      pages: [
        {
          id: '1',
          pageNumber: 1,
          content: '',
          annotations: [],
          drawings: [],
          blurLayers: []
        }
      ]
    });
    
    setTitle('');
    setAuthor('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onCreateBook({
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: 'Imported',
        content,
        category: 'imported',
        language: 'en',
        mode: 'ebook'
      });
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Create New Book
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Book Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title..."
            className="text-base"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="author">Author (Optional)</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name..."
            className="text-base"
          />
        </div>

        <Button 
          onClick={handleQuickCreate} 
          className="w-full"
          disabled={!title.trim() || isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Physical Book
        </Button>

        {!showAdvanced && (
          <Button 
            variant="outline" 
            onClick={() => setShowAdvanced(true)}
            className="w-full"
          >
            More Options
          </Button>
        )}

        {showAdvanced && (
          <div className="space-y-2 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload eBook</Label>
              <div className="relative">
                <input
                  id="file"
                  type="file"
                  accept=".txt,.pdf,.epub"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowAdvanced(false)}
              className="w-full"
            >
              Show Less
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
