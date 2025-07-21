
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BookReader } from '../reader/BookReader';
import { LibraryView } from '../library/LibraryView';
import { SettingsView } from '../settings/SettingsView';
import { useApp } from '../../contexts/AppContext';

export type AppView = 'library' | 'reader' | 'settings';

export const MainApp = () => {
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isOffline } = useApp();

  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
    setCurrentView('reader');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'library':
        return <LibraryView onBookSelect={handleBookSelect} />;
      case 'reader':
        return selectedBookId ? (
          <BookReader bookId={selectedBookId} onBack={() => setCurrentView('library')} />
        ) : (
          <LibraryView onBookSelect={handleBookSelect} />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return <LibraryView onBookSelect={handleBookSelect} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {isOffline && (
          <div className="bg-amber-100 border-b border-amber-200 p-2 text-center text-sm text-amber-800">
            You're currently offline. Some features may be limited.
          </div>
        )}
        {renderCurrentView()}
      </main>
    </div>
  );
};
