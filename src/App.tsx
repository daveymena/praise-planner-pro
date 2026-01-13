import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Ensayos from "./pages/Ensayos";
import Repertorio from "./pages/Repertorio";
import Integrantes from "./pages/Integrantes";
import Servicios from "./pages/Servicios";
import Calendario from "./pages/Calendario";
import Normas from "./pages/Normas";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/ensayos" element={<ProtectedRoute><Ensayos /></ProtectedRoute>} />
            <Route path="/repertorio" element={<ProtectedRoute><Repertorio /></ProtectedRoute>} />
            <Route path="/integrantes" element={<ProtectedRoute><Integrantes /></ProtectedRoute>} />
            <Route path="/servicios" element={<ProtectedRoute><Servicios /></ProtectedRoute>} />
            <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
            <Route path="/normas" element={<ProtectedRoute><Normas /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
