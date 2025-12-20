import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Advisory from "./pages/Advisory";
import Calculator from "./pages/Calculator";
import Results from "./pages/Results";
import TaxBreakdown from "./pages/TaxBreakdown";
import Pricing from "./pages/Pricing";
import TaxFiling from "./pages/TaxFiling";
import SavedBusinesses from "./pages/SavedBusinesses";
import Reminders from "./pages/Reminders";
import Insights from "./pages/Insights";
import Team from "./pages/Team";
import Transactions from "./pages/Transactions";
import AuditLog from "./pages/AuditLog";
import Learn from "./pages/Learn";
import Expenses from "./pages/Expenses";
import ScenarioModeling from "./pages/ScenarioModeling";
import EFiling from "./pages/EFiling";
import ApiDocs from "./pages/ApiDocs";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="naijataxpro-theme">
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/advisory" element={<Advisory />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/results" element={<Results />} />
              <Route path="/breakdown" element={<TaxBreakdown />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/tax-filing" element={<TaxFiling />} />
              <Route path="/businesses" element={<SavedBusinesses />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/team" element={<Team />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/audit-log" element={<AuditLog />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/scenarios" element={<ScenarioModeling />} />
              <Route path="/e-filing" element={<EFiling />} />
              <Route path="/api" element={<ApiDocs />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
