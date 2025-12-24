import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TaxAssistant } from "@/components/TaxAssistant";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
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
import BusinessReport from "./pages/BusinessReport";
import Roadmap from "./pages/Roadmap";
import Terms from "./pages/Terms";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="taxforge-ng-theme">
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/advisory" element={<Advisory />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/results" element={<Results />} />
                <Route path="/tax-breakdown" element={<TaxBreakdown />} />
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
                <Route path="/api-docs" element={<ApiDocs />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/business-report" element={<BusinessReport />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/admin-analytics" element={<AdminAnalytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <TaxAssistant />
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
