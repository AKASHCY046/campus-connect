import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  UtensilsCrossed,
  GraduationCap,
  Building2,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  MessageCircle,
  ShieldCheck,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

const STUDENT_NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/library', label: 'Library', icon: BookOpen },
  { path: '/canteen', label: 'Canteen', icon: UtensilsCrossed },
  { path: '/academic', label: 'Academic', icon: GraduationCap },
  { path: '/campus', label: 'Campus', icon: Building2 },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { openChatbot } = useChatbot();
  const { user, logout, isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  const showStudentNav =
    (user?.role === 'Student' || user?.role === 'Admin') &&
    ['/dashboard', '/library', '/canteen', '/academic', '/campus', '/settings', '/verify', '/admin'].some(
      (p) => location.pathname === p || location.pathname.startsWith(p),
    );

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-border/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className={theme === 'cyber' ? 'text-gradient' : ''}>Campus Connect</span>
          </Link>

          {showStudentNav && (
            <div className="hidden flex-1 justify-center lg:flex">
              <div className="flex items-center gap-1">
                {STUDENT_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive(item.path) ? 'default' : 'ghost'}
                        className="h-10 gap-2 px-3"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {isSignedIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={openChatbot}
                className="h-10 w-10"
                title="Open AI assistant"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10" title="Toggle theme">
              {theme === 'classic' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {isSignedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 gap-2 px-3">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Workspaces</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {(user?.role === 'Student' || user?.role === 'Admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Student portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(user?.role === 'Librarian' || user?.role === 'Admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/librarian" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Librarian workspace
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(user?.role === 'Canteen Staff' || user?.role === 'Admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/canteen-incharge" className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4" /> Canteen manager
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(user?.role === 'Professor' || user?.role === 'Admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/faculty" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Faculty portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'Admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Admin console
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/verify" className="flex items-center gap-2 text-primary">
                      <ShieldCheck className="h-4 w-4" /> System health
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isSignedIn && (
              <>
                <Link to="/settings" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="h-10 w-10" title="Settings">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="h-9 w-9 rounded-full border border-primary/20 object-cover"
                        />
                      ) : (
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase text-primary">{user?.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex cursor-pointer items-center gap-2">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex cursor-pointer items-center gap-2">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex cursor-pointer items-center gap-2 text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {showStudentNav && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 lg:hidden"
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {showStudentNav && mobileOpen && (
          <div className="border-t border-border/60 py-3 lg:hidden">
            <div className="space-y-1">
              {STUDENT_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className="h-11 w-full justify-start gap-3"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
