import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Canteen from "./pages/Canteen";
import Academic from "./pages/Academic";
import Campus from "./pages/Campus";
import NotFound from "./pages/NotFound";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import CanteenDashboard from "./pages/CanteenDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import CampusConnectApp from "./pages/CampusConnectApp";
import { config } from "@/lib/mongodb";

// Use environment configuration
const CLERK_PUBLISHABLE_KEY = config.clerk.publishableKey;

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">
    <Navigation />
    {children}
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sign-in/*" element={<SignIn />} />
              <Route path="/sign-up/*" element={<SignUp />} />
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/librarian" element={<ProtectedRoute><Layout><LibrarianDashboard /></Layout></ProtectedRoute>} />
              <Route path="/canteen-incharge" element={<ProtectedRoute><Layout><CanteenDashboard /></Layout></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Layout><Library /></Layout></ProtectedRoute>} />
              <Route path="/canteen" element={<ProtectedRoute><Layout><Canteen /></Layout></ProtectedRoute>} />
              <Route path="/academic" element={<ProtectedRoute><Layout><Academic /></Layout></ProtectedRoute>} />
              <Route path="/campus" element={<ProtectedRoute><Layout><Campus /></Layout></ProtectedRoute>} />
              <Route path="/faculty" element={<ProtectedRoute><Layout><FacultyDashboard /></Layout></ProtectedRoute>} />
              <Route path="/canteen-integrated" element={<ProtectedRoute><Layout><CampusConnectApp /></Layout></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ClerkProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
