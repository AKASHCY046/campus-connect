import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

import { initializeAppPerformance } from "./lib/performance";
import { initializeSampleData } from "./lib/sample-data";

// Optimized query client used by the performance bootstrap
const performanceQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
  },
});

// Seed the local-first data layer before the first render
initializeSampleData();
initializeAppPerformance(performanceQueryClient).catch(console.debug);

createRoot(document.getElementById("root")!).render(<App />);
