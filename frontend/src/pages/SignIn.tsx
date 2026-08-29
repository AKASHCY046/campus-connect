import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, Loader2 } from 'lucide-react';
import type { UserRole } from '@/hooks/useUserProfile';

const ROLE_HOME: Record<UserRole, string> = {
  Student: '/dashboard',
  Admin: '/dashboard',
  Professor: '/faculty',
  Librarian: '/librarian',
  'Canteen Staff': '/canteen-incharge',
};

const DEMO_ACCOUNTS: { label: string; email: string; password: string; role: UserRole }[] = [
  { label: 'Student', email: 'student@campus.edu', password: 'student123', role: 'Student' },
  { label: 'Professor', email: 'faculty@campus.edu', password: 'faculty123', role: 'Professor' },
  { label: 'Librarian', email: 'librarian@campus.edu', password: 'librarian123', role: 'Librarian' },
  { label: 'Canteen', email: 'canteen@campus.edu', password: 'canteen123', role: 'Canteen Staff' },
  { label: 'Admin', email: 'admin@campus.edu', password: 'admin123', role: 'Admin' },
];

export default function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDemo, setPendingDemo] = useState<string | null>(null);

  const doLogin = async (mail: string, pass: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      await login(mail, pass);
      toast.success('Signed in successfully');
      navigate(role ? ROLE_HOME[role] : '/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
      setPendingDemo(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    doLogin(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <Card className="w-full max-w-md border-primary/15 shadow-elegant animate-fade-in-up">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue to Campus Connect</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@campus.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && !pendingDemo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link to="/sign-up" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>
            <div className="w-full border-t pt-4">
              <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Explore a demo role
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <Button
                    key={acc.role}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => {
                      setPendingDemo(acc.role);
                      doLogin(acc.email, acc.password, acc.role);
                    }}
                  >
                    {isLoading && pendingDemo === acc.role ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      acc.label
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
