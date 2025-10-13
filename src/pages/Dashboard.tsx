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
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { EnvironmentStatus } from '@/components/EnvironmentStatus';

export default function Dashboard() {
  const { theme } = useTheme();
  
  const quickActions = [
    { 
      title: 'Library', 
      icon: BookOpen, 
      path: '/library', 
      description: 'Browse & issue books',
      color: 'text-blue-500'
    },
    { 
      title: 'Canteen', 
      icon: UtensilsCrossed, 
      path: '/canteen', 
      description: 'Pre-order your meal',
      color: 'text-orange-500'
    },
    { 
      title: 'Academic', 
      icon: GraduationCap, 
      path: '/academic', 
      description: 'Study materials & resources',
      color: 'text-purple-500'
    },
    { 
      title: 'Campus', 
      icon: Building2, 
      path: '/campus', 
      description: 'Events & services',
      color: 'text-green-500'
    },
  ];
  
  const stats = [
    { label: 'Books Issued', value: '3', icon: BookOpen },
    { label: 'Canteen Balance', value: '₹450', icon: UtensilsCrossed },
    { label: 'Upcoming Events', value: '5', icon: Calendar },
    { label: 'Reward Points', value: '1,250', icon: Award },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : 'text-primary'}>Student</span>
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
      
      {/* Environment Status (Development Only) */}
      {import.meta.env.DEV && (
        <div className="mb-6">
          <EnvironmentStatus />
        </div>
      )}

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
            {[
              { action: 'Returned "Data Structures"', time: '2 hours ago', type: 'library' },
              { action: 'Pre-ordered Lunch Token #45', time: '5 hours ago', type: 'canteen' },
              { action: 'Uploaded Project Report', time: '1 day ago', type: 'academic' },
              { action: 'Registered for Tech Fest', time: '2 days ago', type: 'event' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
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
            {[
              { title: 'Book Due Tomorrow', message: 'Return "Algorithm Design" by 5 PM', priority: 'high' },
              { title: 'New Study Material', message: 'Prof. Sharma uploaded notes for Unit 3', priority: 'medium' },
              { title: 'Event Reminder', message: 'Tech Talk starts in 2 hours', priority: 'medium' },
              { title: 'Canteen Offer', message: '20% off on combo meals today!', priority: 'low' },
            ].map((notif, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border transition-smooth ${
                  notif.priority === 'high' ? 'border-destructive/50 bg-destructive/5' : 
                  'border-border/50 hover:bg-muted/50'
                }`}
              >
                <p className="font-medium mb-1">{notif.title}</p>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
