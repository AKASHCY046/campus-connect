import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  UtensilsCrossed,
  GraduationCap,
  Building2,
  Calendar,
  Bell,
  TrendingUp,
  Award,
  Loader2,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getIssuedBooks } from '@/lib/services/library';
import { getAssignments } from '@/lib/services/academic';
import { getEvents } from '@/lib/services/events';
import { getOrders } from '@/lib/services/canteen';
import { getNotifications } from '@/lib/services/notifications';

export default function Dashboard() {
  const { theme } = useTheme();
  const { user, isAdmin } = useAuth();
  const { profile } = useUserProfile();

  const username = profile?.full_name || user?.full_name || 'Student';

  // Fetch Stats
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      const [issued, assignments, events] = await Promise.all([
        getIssuedBooks(user!.id),
        getAssignments(),
        getEvents(),
      ]);
      const now = Date.now();
      return {
        books: issued.filter((b: any) => b.status === 'issued' || b.status === 'overdue').length,
        assignments: assignments.length,
        events: events.filter((e: any) => new Date(e.date).getTime() >= now).length,
        points: profile?.reward_points || 0,
      };
    },
    enabled: !!user?.id && !!profile,
  });

  // Fetch Recent Activity (combining multiple local sources)
  const { data: activities = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ['dashboard-activity', user?.id],
    queryFn: async () => {
      const [issued, orders] = await Promise.all([
        getIssuedBooks(user!.id),
        getOrders(user!.id),
      ]);
      return [
        ...issued.map((b: any) => ({
          action: `Issued "${b.book_title || b.title || 'a book'}"`,
          time: b.issue_date || b.created_at,
          type: 'library',
        })),
        ...orders.map((o: any) => ({
          action: `Ordered food (Token #${o.token_number ?? '—'})`,
          time: o.created_at,
          type: 'canteen',
        })),
      ]
        .filter((a) => a.time)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);
    },
    enabled: !!user?.id,
  });

  // Fetch Notifications
  const { data: notifications = [], isLoading: isLoadingNotifs } = useQuery({
    queryKey: ['dashboard-notifications', user?.id],
    queryFn: () => getNotifications(user!.id, 4),
    enabled: !!user?.id,
  });

  const quickActions = [
    { title: 'Library', icon: BookOpen, path: '/library', description: 'Browse & issue books', color: 'text-blue-500' },
    { title: 'Canteen', icon: UtensilsCrossed, path: '/canteen', description: 'Pre-order your meal', color: 'text-orange-500' },
    { title: 'Academic', icon: GraduationCap, path: '/academic', description: 'Study materials & resources', color: 'text-purple-500' },
    { title: 'Campus', icon: Building2, path: '/campus', description: 'Events & services', color: 'text-green-500' },
  ];

  const stats = [
    { label: 'Books Issued', value: statsData?.books || '0', icon: BookOpen },
    { label: 'Assignments', value: statsData?.assignments || '0', icon: GraduationCap },
    { label: 'Upcoming Events', value: statsData?.events || '0', icon: Calendar },
    { label: 'Reward Points', value: statsData?.points?.toLocaleString() || '0', icon: Award },
  ];

  const formatTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back,{' '}
          <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : 'text-primary'}>
            {username}
          </span>
        </h1>
        <p className="text-muted-foreground">Here's your campus activity overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${theme === 'cyber' ? 'text-primary' : 'text-primary/70'}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {isAdmin && (
        <div className="mb-8">
          <Link to="/admin">
            <Card className="p-6 card-hover border-primary/30 bg-primary/5">
              <div className="flex items-center gap-4">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-bold text-lg">User Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Block, delete users, and generate invitation codes
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.path}>
                <Card className="p-6 card-hover h-full">
                  <Icon className={`h-10 w-10 mb-4 ${action.color}`} />
                  <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-4">
            {isLoadingActivity ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : activities.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No recent activity found.</p>
            ) : activities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{formatTime(activity.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {isLoadingNotifs ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground italic">
                <p>No new notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : notifications.map((notif, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition-smooth ${notif.priority === 'high' ? 'border-destructive/30 bg-destructive/5' :
                  'border-border/50 hover:bg-muted/50'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{notif.title}</p>
                  {notif.type === 'success' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(notif.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
