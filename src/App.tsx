import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ReminderNotificationProvider } from "@/components/ReminderNotificationProvider";
import { lazy, Suspense } from "react";

// Eagerly load Index for fast initial render
import Index from "./pages/Index";

// Lazy load all other pages
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Advisory = lazy(() => import("./pages/Advisory"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Results = lazy(() => import("./pages/Results"));
const TaxBreakdown = lazy(() => import("./pages/TaxBreakdown"));
const Pricing = lazy(() => import("./pages/Pricing"));
const TaxFiling = lazy(() => import("./pages/TaxFiling"));
const SavedBusinesses = lazy(() => import("./pages/SavedBusinesses"));
const Reminders = lazy(() => import("./pages/Reminders"));
const Insights = lazy(() => import("./pages/Insights"));
const Team = lazy(() => import("./pages/Team"));
const Transactions = lazy(() => import("./pages/Transactions"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const Learn = lazy(() => import("./pages/Learn"));
const Expenses = lazy(() => import("./pages/Expenses"));
const ScenarioModeling = lazy(() => import("./pages/ScenarioModeling"));
const EFiling = lazy(() => import("./pages/EFiling"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const Achievements = lazy(() => import("./pages/Achievements"));
const BusinessReport = lazy(() => import("./pages/BusinessReport"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Terms = lazy(() => import("./pages/Terms"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AIQueryAnalytics = lazy(() => import("./pages/AIQueryAnalytics"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SectorGuide = lazy(() => import("./pages/SectorGuide"));
const PartnerBranding = lazy(() => import("./pages/PartnerBranding"));
const EmbedCalculator = lazy(() => import("./pages/EmbedCalculator"));
const IndividualCalculator = lazy(() => import("./pages/IndividualCalculator"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load TaxAssistant (heavy component with AI chat)
const TaxAssistant = lazy(() => import("./components/TaxAssistant").then(m => ({ default: m.TaxAssistant })));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="taxforge-ng-theme">
      <AuthProvider>
        <AuthLoadingScreen>
          <SubscriptionProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <ReminderNotificationProvider />
                <Suspense fallback={<PageLoader />}>
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
                    <Route path="/ai-analytics" element={<AIQueryAnalytics />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/sector/:id" element={<SectorGuide />} />
                    <Route path="/partner-branding" element={<PartnerBranding />} />
                    <Route path="/embed/calculator" element={<EmbedCalculator />} />
                    <Route path="/individual-calculator" element={<IndividualCalculator />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <TaxAssistant />
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </SubscriptionProvider>
        </AuthLoadingScreen>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
