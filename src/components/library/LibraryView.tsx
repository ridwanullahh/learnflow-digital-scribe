
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { BookOpen, Search, Plus, Filter, Grid3X3, List, Star, Clock, Download, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { CreateBookDialog } from './CreateBookDialog';
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['all', 'fiction', 'non-fiction', 'academic', 'technical', 'language'];

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
      const newBook = await sdk.insert('books', {
        ...bookData,
        userId: user.id,
        readingProgress: 0,
        totalPages: 1,
        lastRead: new Date().toISOString()
      });
      
      setBooks(prev => [newBook, ...prev]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create book:', error);
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
    <div className="flex flex-col h-full bg-background safe-area-top">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Library</h1>
              {isOffline && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <WifiOff className="w-3 h-3" />
                  Offline Mode
                </div>
              )}
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="mobile-button rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="px-4 pb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-input pl-11 h-12 text-base"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="mobile-button whitespace-nowrap min-w-fit px-4"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Filter className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {filteredBooks.length} books
              </span>
            </div>
            <div className="flex bg-muted/50 rounded-xl p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-lg h-8 px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-lg h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Content */}
      <div className="flex-1 overflow-y-auto p-4 safe-area-bottom">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 text-center">
              {searchTerm ? 'No books found' : 'Your library is empty'}
            </h3>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              {searchTerm ? 'Try adjusting your search terms or explore different categories' : 'Start your learning journey by adding your first book'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="mobile-button h-12 px-8">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Book
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
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

      <CreateBookDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateBook}
      />
    </div>
  );
};
