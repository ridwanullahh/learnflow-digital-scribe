
import { Card, CardContent } from '../ui/card';
import { BookOpen, Star, Clock, Download, Wifi } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  readingProgress: number;
  totalPages: number;
  lastRead: string;
  coverImage?: string;
  isOfflineAvailable?: boolean;
  language: string;
}

interface BookCardProps {
  book: Book;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

export const BookCard = ({ book, viewMode, onClick }: BookCardProps) => {
  const formatLastRead = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              {book.coverImage ? (
                <img 
                  src={book.coverImage} 
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{book.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{book.author}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {book.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {book.language.toUpperCase()}
                </Badge>
                {book.isOfflineAvailable && (
                  <Download className="w-3 h-3 text-green-500" />
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">
                {book.readingProgress}%
              </div>
              <div className="w-16 bg-muted rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all" 
                  style={{ width: `${book.readingProgress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatLastRead(book.lastRead)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="aspect-[3/4] bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
          
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {book.category}
            </Badge>
            {book.isOfflineAvailable && (
              <Download className="w-3 h-3 text-green-500" />
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{book.readingProgress}%</span>
              <span>{formatLastRead(book.lastRead)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all" 
                style={{ width: `${book.readingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
