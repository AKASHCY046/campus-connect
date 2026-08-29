import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <p className="mb-1 text-5xl font-display font-bold tracking-tight">404</p>
        <h1 className="mb-2 text-xl">Page not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          We couldn&apos;t find <code className="font-mono">{location.pathname}</code>. It may have
          moved, or never existed.
        </p>
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
