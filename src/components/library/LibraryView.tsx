
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { BookOpen, Search, Plus, Grid, List, Filter } from 'lucide-react';

interface LibraryViewProps {
  onBookSelect: (bookId: string) => void;
}

export const LibraryView = ({ onBookSelect }: LibraryViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock books data
  const books = [
    {
      id: '1',
      title: 'The Art of Learning',
      author: 'Josh Waitzkin',
      cover: '/placeholder.svg',
      progress: 45,
      lastRead: '2 days ago',
      category: 'Self-Improvement'
    },
    {
      id: '2',
      title: 'Deep Work',
      author: 'Cal Newport',
      cover: '/placeholder.svg',
      progress: 78,
      lastRead: '1 week ago',
      category: 'Productivity'
    },
    {
      id: '3',
      title: 'Atomic Habits',
      author: 'James Clear',
      cover: '/placeholder.svg',
      progress: 100,
      lastRead: '3 days ago',
      category: 'Self-Improvement'
    },
    {
      id: '4',
      title: 'The Feynman Technique',
      author: 'Richard Feynman',
      cover: '/placeholder.svg',
      progress: 23,
      lastRead: '1 day ago',
      category: 'Science'
    }
  ];

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full p-6">
      {/* Library Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Library</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Books Grid/List */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card 
                key={book.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onBookSelect(book.id)}
              >
                <CardHeader className="pb-4">
                  <div className="aspect-[3/4] bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{book.progress}% complete</span>
                      <span>{book.lastRead}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all" 
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                    <span className="inline-block text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {book.category}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book) => (
              <Card 
                key={book.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onBookSelect(book.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{book.progress}% complete</span>
                            <span>{book.lastRead}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all" 
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {book.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No books found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start building your library'}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Book
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
