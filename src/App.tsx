import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ReminderNotificationProvider } from "@/components/ReminderNotificationProvider";
import { TrialBanner } from "@/components/TrialBanner";
import { TierSelectionWrapper } from "@/components/TierSelectionWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { InstallPWAPrompt } from "@/components/InstallPWAPrompt";
import { SharedElementProvider } from "@/components/PageTransition";
import { NavMenu } from "@/components/NavMenu";
import { UpgradeCelebrationProvider } from "@/components/UpgradeCelebrationProvider";
import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
const SecurityDashboard = lazy(() => import("./pages/SecurityDashboard"));
const Referrals = lazy(() => import("./pages/Referrals"));
const TaxCalendar = lazy(() => import("./pages/TaxCalendar"));
const SuccessStoriesPage = lazy(() => import("./pages/SuccessStoriesPage"));
const AccountantPortal = lazy(() => import("./pages/AccountantPortal"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Payroll = lazy(() => import("./pages/Payroll"));
const ProfitLoss = lazy(() => import("./pages/ProfitLoss"));
const Compliance = lazy(() => import("./pages/Compliance"));
const PersonalExpenses = lazy(() => import("./pages/PersonalExpenses"));
const CalculationHistory = lazy(() => import("./pages/CalculationHistory"));
const Documentation = lazy(() => import("./pages/Documentation"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const BillingHistory = lazy(() => import("./pages/BillingHistory"));
const CancelSubscription = lazy(() => import("./pages/CancelSubscription"));
const LoyaltyRewards = lazy(() => import("./pages/LoyaltyRewards"));
const WebhookTesting = lazy(() => import("./pages/WebhookTesting"));
const PromoCodeAdmin = lazy(() => import("./pages/PromoCodeAdmin"));
const SecurityTestResults = lazy(() => import("./pages/SecurityTestResults"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load TaxAssistant (heavy component with AI chat)
const TaxAssistant = lazy(() => import("./components/TaxAssistant").then(m => ({ default: m.TaxAssistant })));

// Minimal loading fallback with premium styling
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-frosted rounded-2xl p-8"
    >
      <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin glow-primary" />
    </motion.div>
  </div>
);

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
  duration: 0.35,
};

// Animated Routes wrapper with shared elements support
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
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
          <Route path="/security" element={<SecurityDashboard />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/tax-calendar" element={<TaxCalendar />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/accountant-portal" element={<AccountantPortal />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/profit-loss" element={<ProfitLoss />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/personal-expenses" element={<PersonalExpenses />} />
          <Route path="/calculation-history" element={<CalculationHistory />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/billing" element={<BillingHistory />} />
          <Route path="/cancel-subscription" element={<CancelSubscription />} />
          <Route path="/rewards" element={<LoyaltyRewards />} />
          <Route path="/admin/webhooks" element={<WebhookTesting />} />
          <Route path="/admin/promo-codes" element={<PromoCodeAdmin />} />
          <Route path="/admin/security-tests" element={<SecurityTestResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="taxforge-ng-theme">
        <AuthProvider>
          <AuthLoadingScreen>
            <SubscriptionProvider>
              <LanguageProvider>
              <TooltipProvider>
                <>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <UpgradeCelebrationProvider>
                      <ScrollToTop />
                      <ReminderNotificationProvider />
                      <div className="min-h-screen">
                        <div className="sticky-header-wrapper">
                          <NavMenu />
                          <TrialBanner />
                        </div>
                        <TierSelectionWrapper />
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedRoutes />
                          <TaxAssistant />
                          <OfflineIndicator />
                          <InstallPWAPrompt />
                        </Suspense>
                      </div>
                    </UpgradeCelebrationProvider>
                  </BrowserRouter>
                </>
              </TooltipProvider>
            </LanguageProvider>
          </SubscriptionProvider>
        </AuthLoadingScreen>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
