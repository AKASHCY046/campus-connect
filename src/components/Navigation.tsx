import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { UserButton, useUser } from '@clerk/clerk-react';
import { 
  BookOpen, 
  UtensilsCrossed, 
  GraduationCap, 
  Building2, 
  Settings,
  Sparkles,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isSignedIn } = useUser();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: GraduationCap },
    { path: '/library', label: 'Library', icon: BookOpen },
    { path: '/canteen', label: 'Canteen', icon: UtensilsCrossed },
    { path: '/academic', label: 'Academic', icon: GraduationCap },
    { path: '/campus', label: 'Campus', icon: Building2 },
  ];
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}>
              CampusHub
            </span>
          </Link>
          
          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
          
          {/* Theme Toggle & User Menu */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className="transition-smooth"
            >
              {theme === 'classic' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            {isSignedIn && (
              <>
                <Link to="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10"
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
