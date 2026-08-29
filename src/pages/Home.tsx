import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/hooks/useUserProfile';
import {
  BookOpen,
  UtensilsCrossed,
  GraduationCap,
  Building2,
  Sparkles,
  ArrowRight,
  Users,
  TrendingUp,
} from 'lucide-react';

const ROLE_HOME: Record<UserRole, string> = {
  Student: '/dashboard',
  Admin: '/dashboard',
  Professor: '/faculty',
  Librarian: '/librarian',
  'Canteen Staff': '/canteen-incharge',
};

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Smart Library',
    description: 'Reserve books, track loans and clear fines without queuing at the desk.',
    tint: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: UtensilsCrossed,
    title: 'Digital Canteen',
    description: 'Pre-order meals, pay from your wallet and pick up with a token number.',
    tint: 'bg-orange-500/10 text-orange-500',
  },
  {
    icon: GraduationCap,
    title: 'Academic Hub',
    description: 'Get study materials, submit assignments and join study groups by code.',
    tint: 'bg-violet-500/10 text-violet-500',
  },
  {
    icon: Building2,
    title: 'Campus Services',
    description: 'Book facilities, register for events and stay on top of announcements.',
    tint: 'bg-emerald-500/10 text-emerald-500',
  },
];

const STATS = [
  { icon: Users, value: '10K+', label: 'Active students' },
  { icon: BookOpen, value: '50K+', label: 'Books issued' },
  { icon: UtensilsCrossed, value: '5K+', label: 'Meals served' },
  { icon: TrendingUp, value: '24/7', label: 'Availability' },
];

export default function Home() {
  const { theme } = useTheme();
  const { isSignedIn, user } = useAuth();
  const dashboardLink = user ? ROLE_HOME[user.role] : '/sign-in';

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Your complete campus companion
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Campus life,{' '}
              <span className={theme === 'cyber' ? 'text-gradient' : 'text-primary'}>simplified</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              One platform for the library, canteen, academics and campus services — built for
              students, faculty and staff.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {isSignedIn ? (
                <Button asChild size="lg" className="gap-2">
                  <Link to={dashboardLink}>
                    Go to dashboard <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/sign-in">Sign in</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/sign-up">Create account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2>Everything in one place</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Four connected modules, one login.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="card-hover p-6">
              <span className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${f.tint}`}>
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/40 py-16">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto mb-3 h-9 w-9 text-primary" />
              <p className="text-3xl font-display font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="overflow-hidden bg-primary p-10 text-center text-primary-foreground sm:p-14">
          <h2 className="text-primary-foreground">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
            Sign in with one of the demo roles to explore every module end to end.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 gap-2">
            <Link to={dashboardLink}>
              {isSignedIn ? 'Open dashboard' : 'Sign in'} <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
