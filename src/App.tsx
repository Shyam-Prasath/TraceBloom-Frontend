import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import TrackBatch from "./pages/TrackBatch";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/farmer"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/distributor"
              element={
                <ProtectedRoute allowedRole="distributor">
                  <DistributorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consumer"
              element={
                <ProtectedRoute allowedRole="consumer">
                  <ConsumerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/track/:batchId" element={<TrackBatch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
