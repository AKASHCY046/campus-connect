import { SignIn } from '@clerk/clerk-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}`}>
            Welcome to CampusHub
          </h1>
          <p className="text-muted-foreground">Sign in to access Campus Hub services</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-elegant"
            }
          }}
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
