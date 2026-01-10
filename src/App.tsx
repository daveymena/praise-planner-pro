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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ensayos" element={<Ensayos />} />
          <Route path="/repertorio" element={<Repertorio />} />
          <Route path="/integrantes" element={<Integrantes />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/normas" element={<Normas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
