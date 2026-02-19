import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";

import { ScrollToTop } from "@/components/ScrollToTop";
import { ReminderNotificationProvider } from "@/components/ReminderNotificationProvider";
import { TrialBanner } from "@/components/TrialBanner";
import { TierSelectionWrapper } from "@/components/TierSelectionWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LazyRouteErrorBoundary } from "@/components/LazyRouteErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { InstallPWAPrompt } from "@/components/InstallPWAPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { SharedElementProvider } from "@/components/PageTransition";
import { NavMenu } from "@/components/NavMenu";
import { UpgradeCelebrationProvider } from "@/components/UpgradeCelebrationProvider";
import { OfflineDataProvider } from "@/contexts/OfflineDataContext";
import { StorageWarningBanner } from "@/components/StorageWarningBanner";
import { OfflineBanner } from "@/components/OfflineBanner";
import "@/styles/print.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate } from "react-router-dom";

// Redirect component for old policy URLs
const RedirectToTerms = ({ section }: { section: 'terms' | 'privacy' | 'refund' }) => (
  <Navigate to={`/terms#${section}`} replace />
);

// Lazy load Index page to reduce main bundle size
const Index = lazy(() => import("./pages/Index"));

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
// Removed separate policy pages - now consolidated in Terms.tsx with hash navigation
// Redirects handled inline below
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AIQueryAnalytics = lazy(() => import("./pages/AIQueryAnalytics"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SectorGuide = lazy(() => import("./pages/SectorGuide"));
const PartnerBranding = lazy(() => import("./pages/PartnerBranding"));
const EmbedCalculator = lazy(() => import("./pages/EmbedCalculator"));
const EmbedPartner = lazy(() => import("./pages/EmbedPartner"));
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
const OfflineDashboard = lazy(() => import("./pages/OfflineDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TaxLogicReference = lazy(() => import("./pages/TaxLogicReference"));
const VerifyDocument = lazy(() => import("./pages/VerifyDocument"));
const ErrorDashboard = lazy(() => import("./pages/ErrorDashboard"));
const TaxProfessionalDirectory = lazy(() => import("./pages/TaxProfessionalDirectory"));

// SEO Landing Pages
const FreeCalculator = lazy(() => import("./pages/seo/FreeCalculator"));
const SmallCompanyExemption = lazy(() => import("./pages/seo/SmallCompanyExemption"));
const RentRelief2026 = lazy(() => import("./pages/seo/RentRelief2026"));
const PITPAYECalculator = lazy(() => import("./pages/seo/PITPAYECalculator"));
const TaxReforms2026 = lazy(() => import("./pages/seo/TaxReforms2026"));
const CITCalculator = lazy(() => import("./pages/seo/CITCalculator"));
const VATCalculator = lazy(() => import("./pages/seo/VATCalculator"));
const WHTCalculator = lazy(() => import("./pages/seo/WHTCalculator"));
const TaxReports = lazy(() => import("./pages/seo/TaxReports"));
const PortHarcourtGuide = lazy(() => import("./pages/seo/PortHarcourtGuide"));
const StateGuidesHub = lazy(() => import("./pages/seo/StateGuidesHub"));
const LagosGuide = lazy(() => import("./pages/seo/LagosGuide"));
const AbujaGuide = lazy(() => import("./pages/seo/AbujaGuide"));
const KanoGuide = lazy(() => import("./pages/seo/KanoGuide"));
const SalaryAfterTax = lazy(() => import("./pages/seo/SalaryAfterTax"));

// Standalone Pages
const About = lazy(() => import("./pages/About"));
const Resources = lazy(() => import("./pages/Resources"));

// Blog & FAQ
const Blog = lazy(() => import("./pages/Blog"));
const FAQ = lazy(() => import("./pages/FAQ"));
const BlogTaxReforms2026Summary = lazy(() => import("./pages/blog/TaxReforms2026Summary"));
const BlogSmallCompanyCITExemption = lazy(() => import("./pages/blog/SmallCompanyCITExemption"));
const BlogPITPAYEGuide2026 = lazy(() => import("./pages/blog/PITPAYEGuide2026"));
const BlogTaxGuideTechStartups = lazy(() => import("./pages/blog/TaxGuideTechStartups"));
const BlogVATGuideNigeria = lazy(() => import("./pages/blog/VATGuideNigeria"));
const BlogWHTExplained = lazy(() => import("./pages/blog/WHTExplained"));
const BlogPayrollTaxGuide = lazy(() => import("./pages/blog/PayrollTaxGuide"));
const BlogTaxCalendar2026 = lazy(() => import("./pages/blog/TaxCalendar2026"));

// Lazy load TaxAssistant (heavy component with AI chat)
const TaxAssistant = lazy(() => import("./components/TaxAssistant").then(m => ({ default: m.TaxAssistant })));

// Import page skeletons for better perceived performance
import { PageSkeleton } from "@/components/ui/premium-skeleton";

// Minimal loading fallback with premium skeleton
const PageLoader = () => (
  <div className="min-h-screen p-6">
    <PageSkeleton />
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
  const isEmbed = location.pathname.startsWith('/embed/');

  const routes = (
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
      <Route path="/e-filing" element={<EFiling />} />
      <Route path="/api-docs" element={<ApiDocs />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/business-report" element={<BusinessReport />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/terms-and-conditions" element={<RedirectToTerms section="terms" />} />
      <Route path="/privacy-policy" element={<RedirectToTerms section="privacy" />} />
      <Route path="/refund-policy" element={<RedirectToTerms section="refund" />} />
      <Route path="/admin-analytics" element={<AdminAnalytics />} />
      <Route path="/ai-analytics" element={<AIQueryAnalytics />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/sector/:id" element={<SectorGuide />} />
      <Route path="/partner-branding" element={<PartnerBranding />} />
      <Route path="/embed/calculator" element={<EmbedCalculator />} />
      <Route path="/embed-partner" element={<EmbedPartner />} />
      <Route path="/demo-widget" element={<Navigate to="/embed-partner#demo" replace />} />
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
      <Route path="/admin/errors" element={<ErrorDashboard />} />
      <Route path="/offline" element={<OfflineDashboard />} />
      <Route path="/verify/:documentId" element={<VerifyDocument />} />
      <Route path="/tax-logic" element={<TaxLogicReference />} />
      <Route path="/tax-professionals" element={<TaxProfessionalDirectory />} />
      <Route path="/free-tax-calculator" element={<FreeCalculator />} />
      <Route path="/small-company-exemption" element={<SmallCompanyExemption />} />
      <Route path="/rent-relief-2026" element={<RentRelief2026 />} />
      <Route path="/pit-paye-calculator" element={<PITPAYECalculator />} />
      <Route path="/tax-reforms-2026" element={<TaxReforms2026 />} />
      <Route path="/cit-calculator" element={<CITCalculator />} />
      <Route path="/vat-calculator" element={<VATCalculator />} />
      <Route path="/wht-calculator" element={<WHTCalculator />} />
      <Route path="/tax-reports" element={<TaxReports />} />
      <Route path="/port-harcourt-tax-guide" element={<PortHarcourtGuide />} />
      <Route path="/state-guides" element={<StateGuidesHub />} />
      <Route path="/state-guides/lagos" element={<LagosGuide />} />
      <Route path="/state-guides/abuja" element={<AbujaGuide />} />
      <Route path="/state-guides/kano" element={<KanoGuide />} />
      <Route path="/salary-after-tax-nigeria" element={<SalaryAfterTax />} />
      <Route path="/about" element={<About />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/tax-reforms-2026-summary" element={<BlogTaxReforms2026Summary />} />
      <Route path="/blog/small-company-cit-exemption" element={<BlogSmallCompanyCITExemption />} />
      <Route path="/blog/pit-paye-guide-2026" element={<BlogPITPAYEGuide2026 />} />
      <Route path="/blog/tax-guide-tech-startups" element={<BlogTaxGuideTechStartups />} />
      <Route path="/blog/vat-guide-nigeria" element={<BlogVATGuideNigeria />} />
      <Route path="/blog/wht-explained" element={<BlogWHTExplained />} />
      <Route path="/blog/payroll-tax-guide" element={<BlogPayrollTaxGuide />} />
      <Route path="/blog/tax-calendar-2026" element={<BlogTaxCalendar2026 />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  // Skip animations for embed routes to avoid opacity flash in iframes
  if (isEmbed) return routes;

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
        {routes}
      </motion.div>
    </AnimatePresence>
  );
};

// Helper to detect embed routes
const useIsEmbedRoute = () => {
  const location = useLocation();
  return location.pathname.startsWith('/embed/');
};

// Defer heavy components until browser is idle
const useDeferredRender = (delay = 3000) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(() => setReady(true), { timeout: delay });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setReady(true), delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
  return ready;
};

// App shell that hides nav/chrome on embed routes
const AppShell = () => {
  const isEmbed = useIsEmbedRoute();
  const showAssistant = useDeferredRender(3000);

  return (
    <>
      <ScrollToTop />
      <ReminderNotificationProvider />
      {!isEmbed && <StorageWarningBanner />}
      {!isEmbed && <OfflineBanner />}
      <div className="min-h-screen">
        {!isEmbed && (
          <div className="sticky-header-wrapper">
            <NavMenu />
            <TrialBanner />
          </div>
        )}
        {!isEmbed && <TierSelectionWrapper />}
        <main>
          <Suspense fallback={<PageLoader />}>
            <LazyRouteErrorBoundary>
              <AnimatedRoutes />
              {!isEmbed && showAssistant && <TaxAssistant />}
            </LazyRouteErrorBoundary>
            {!isEmbed && <OfflineIndicator />}
            {!isEmbed && <InstallPWAPrompt />}
          {!isEmbed && <PWAUpdatePrompt />}
        </Suspense>
        </main>
      </div>
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="taxforge-ng-theme">
      <AuthProvider>
          <SubscriptionProvider>
              <LanguageProvider>
              <TooltipProvider>
                <OfflineDataProvider>
                  <>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <UpgradeCelebrationProvider>
                        <SharedElementProvider>
                          <AppShell />
                        </SharedElementProvider>
                      </UpgradeCelebrationProvider>
                    </BrowserRouter>
                  </>
                </OfflineDataProvider>
              </TooltipProvider>
            </LanguageProvider>
          </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
