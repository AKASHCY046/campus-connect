import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Environment variable utilities
export const env = {
  // MongoDB
  MONGODB_URI: import.meta.env.VITE_MONGODB_URI,
  
  // Clerk
  CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  
  // Environment info
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

// Validate required environment variables
export const validateRequiredEnvVars = () => {
  const required = [
    { key: 'VITE_MONGODB_URI', value: env.MONGODB_URI },
    { key: 'VITE_CLERK_PUBLISHABLE_KEY', value: env.CLERK_PUBLISHABLE_KEY },
  ];

  const missing = required.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    const missingKeys = missing.map(({ key }) => key);
    console.error('Missing required environment variables:', missingKeys);
    
    if (env.isDev) {
      console.error(
        'Please check your .env file and ensure all required variables are set.\n' +
        'See .env.example for the required format.'
      );
    }
    
    return { isValid: false, missing: missingKeys };
  }
  
  return { isValid: true, missing: [] };
};

// Get environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    mode: env.mode,
    isDev: env.isDev,
    isProd: env.isProd,
    hasMongoUri: !!env.MONGODB_URI,
    hasClerkKey: !!env.CLERK_PUBLISHABLE_KEY,
    timestamp: new Date().toISOString(),
  };
};
