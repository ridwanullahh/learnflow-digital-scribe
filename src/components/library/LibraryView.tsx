
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { BookOpen, Search, Filter, Grid3X3, List, WifiOff } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { QuickBookCreator } from './QuickBookCreator';
import { BookCard } from './BookCard';

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
  userId: string;
  mode?: 'physical-book' | 'ebook';
}

interface LibraryViewProps {
  onBookSelect: (bookId: string) => void;
}

export const LibraryView = ({ onBookSelect }: LibraryViewProps) => {
  const { sdk, isOffline, user } = useApp();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBook, setIsCreatingBook] = useState(false);

  const categories = ['all', 'general', 'fiction', 'non-fiction', 'academic', 'technical', 'language', 'imported'];

  useEffect(() => {
    loadBooks();
  }, [sdk, user]);

  const loadBooks = async () => {
    if (!sdk || !user) return;
    
    try {
      setIsLoading(true);
      const userBooks = await sdk.queryBuilder('books')
        .where((book: Book) => book.userId === user.id)
        .sort('updatedAt', 'desc')
        .exec();
      
      setBooks(userBooks);
    } catch (error) {
      console.error('Failed to load books:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateBook = async (bookData: Partial<Book>) => {
    if (!sdk || !user) return;
    
    try {
      setIsCreatingBook(true);
      const newBook = await sdk.insert('books', {
        ...bookData,
        userId: user.id,
        readingProgress: 0,
        totalPages: bookData.pages?.length || 1,
        lastRead: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setBooks(prev => [newBook, ...prev]);
      setShowCreateBook(false);
    } catch (error) {
      console.error('Failed to create book:', error);
    } finally {
      setIsCreatingBook(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">My Library</h1>
            {isOffline && <WifiOff className="w-4 h-4 text-muted-foreground" />}
          </div>
          <Button onClick={() => setShowCreateBook(true)} size="sm">
            <BookOpen className="w-4 h-4 mr-2" />
            New Book
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredBooks.length} books
              </span>
            </div>
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showCreateBook ? (
          <div className="flex justify-center mb-6">
            <div className="relative">
              <QuickBookCreator 
                onCreateBook={handleCreateBook}
                isLoading={isCreatingBook}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateBook(false)}
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                ×
              </Button>
            </div>
          </div>
        ) : null}

        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'No books found' : 'Your library is empty'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first book to get started'}
            </p>
            <Button onClick={() => setShowCreateBook(true)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Create Your First Book
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-3'
          }>
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                viewMode={viewMode}
                onClick={() => onBookSelect(book.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
