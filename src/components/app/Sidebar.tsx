
import { Button } from '../ui/button';
import { useApp } from '../../contexts/AppContext';
import { 
  BookOpen, 
  Library, 
  Settings, 
  User, 
  LogOut, 
  Menu,
  Wifi,
  WifiOff
} from 'lucide-react';
import { AppView } from './MainApp';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Sidebar = ({ isOpen, onToggle, currentView, onViewChange }: SidebarProps) => {
  const { user, logout, isOffline } = useApp();

  const menuItems = [
    { id: 'library' as AppView, icon: Library, label: 'Library', shortcut: 'L' },
    { id: 'settings' as AppView, icon: Settings, label: 'Settings', shortcut: 'S' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-bold">LearnFlow</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onViewChange(item.id)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                </Button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <WifiOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Wifi className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {isOffline ? 'Offline' : 'Online'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">
                {user?.email || 'Guest'}
              </span>
            </div>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
