import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SEOHead, createBreadcrumbSchema } from "@/components/seo/SEOHead";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { ContentMeta } from "@/components/seo/ContentMeta";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calculator,
  Check,
  X,
  Crown,
  Building2,
  Briefcase,
  Star,
  ArrowRight,
  MessageCircle,
  Mail,
  User,
  Zap,
  FileText,
  Receipt,
  Users,
  Shield,
  BarChart3,
  Clock,
  Bot,
  Key,
  ClipboardCheck,
  Loader2,
  ExternalLink,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscription, SubscriptionTier } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { useUpgradeCelebration } from "@/components/UpgradeCelebrationProvider";
import { DowngradeConfirmationDialog } from "@/components/DowngradeConfirmationDialog";
import { BillingCycleToggle } from "@/components/BillingCycleToggle";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { usePaystack, DiscountValidationResult } from "@/hooks/usePaystack";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";

interface TierFeature {
  name: string;
  category: string;
  free: boolean | string;
  starter: boolean | string;
  basic: boolean | string;
  professional: boolean | string;
  business: boolean | string;
  corporate: boolean | string;
}

const features: TierFeature[] = [
  // Tax Calculators
  { name: 'Personal Tax Calculator (PIT)', category: 'Tax Tools', free: true, starter: true, basic: true, professional: true, business: true, corporate: true },
  { name: 'Crypto & Investment Taxes', category: 'Tax Tools', free: true, starter: true, basic: true, professional: true, business: true, corporate: true },
  { name: 'Foreign Income / DTT Credits', category: 'Tax Tools', free: true, starter: true, basic: true, professional: true, business: true, corporate: true },
  { name: 'Business Tax Calculator', category: 'Tax Tools', free: false, starter: true, basic: true, professional: true, business: true, corporate: true },
  { name: 'Digital VAT Calculator', category: 'Tax Tools', free: false, starter: false, basic: false, professional: true, business: true, corporate: true },
  
  // Business Management
  { name: 'Saved Businesses', category: 'Business', free: '0', starter: '1', basic: '2', professional: '5', business: '10', corporate: 'Unlimited' },
  { name: 'Expense Tracking', category: 'Business', free: false, starter: true, basic: true, professional: true, business: true, corporate: true },
  { name: 'Invoices', category: 'Business', free: false, starter: false, basic: true, professional: true, business: true, corporate: true },
  { name: 'Payroll Calculator', category: 'Business', free: false, starter: false, basic: false, professional: true, business: true, corporate: true },
  { name: 'Profit & Loss Statement', category: 'Business', free: false, starter: false, basic: true, professional: true, business: true, corporate: true },
  { name: 'Compliance Tracker', category: 'Business', free: false, starter: false, basic: false, professional: true, business: true, corporate: true },
  
  // Features & Tools
  { name: 'PDF/CSV Export', category: 'Features', free: false, starter: true, basic: true, professional: true, business: true, corporate: true },
  { name: 'Tax Reminders', category: 'Features', free: false, starter: true, basic: true, professional: true, business: true, corporate: true },
  { name: 'Sector-Specific Presets', category: 'Features', free: false, starter: false, basic: true, professional: true, business: true, corporate: true },
  { name: 'OCR Receipt Scanner', category: 'Features', free: false, starter: false, basic: true, professional: true, business: true, corporate: true },
  { name: 'Scenario Modeling', category: 'Features', free: false, starter: false, basic: false, professional: 'Basic', business: 'Advanced', corporate: 'Advanced' },
  { name: 'Multi-Year Projection', category: 'Features', free: false, starter: false, basic: false, professional: false, business: true, corporate: true },
  
  // Verification & Filing
  { name: 'CAC Verification (Auto)', category: 'Verification', free: false, starter: false, basic: false, professional: false, business: true, corporate: true },
  { name: 'Bulk CAC Verification', category: 'Verification', free: false, starter: false, basic: false, professional: false, business: false, corporate: true },
  { name: 'Tax Filing Preparation', category: 'Verification', free: false, starter: false, basic: false, professional: false, business: true, corporate: true },
  
  // AI & Advisory
  { name: 'AI Tax Assistant', category: 'AI & Support', free: '5 queries', starter: '20 queries', basic: '75 queries', professional: '100 queries', business: 'Unlimited', corporate: 'Priority' },
  { name: 'Priority Support', category: 'AI & Support', free: false, starter: false, basic: false, professional: true, business: true, corporate: true },
  
  // Security & Admin
  { name: 'No Watermarks', category: 'Security', free: false, starter: true, basic: true, professional: true, business: true, corporate: true },
  { name: 'Audit Log', category: 'Security', free: false, starter: false, basic: false, professional: false, business: false, corporate: true },
  { name: 'IP Whitelist', category: 'Security', free: false, starter: false, basic: false, professional: false, business: false, corporate: true },
  { name: 'Multi-User Seats', category: 'Team', free: false, starter: false, basic: false, professional: false, business: '2 seats', corporate: 'Unlimited' },
  { name: 'API Access', category: 'Team', free: false, starter: false, basic: false, professional: false, business: false, corporate: true },
];

const featureCategories = [
  { name: 'Tax Tools', icon: Calculator },
  { name: 'Business', icon: Building2 },
  { name: 'Features', icon: FileText },
  { name: 'Verification', icon: ClipboardCheck },
  { name: 'AI & Support', icon: Bot },
  { name: 'Security', icon: Shield },
  { name: 'Team', icon: Users },
];

const TIER_ORDER: SubscriptionTier[] = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];

// Pricing in Naira (kobo will be calculated in backend)
const TIER_PRICES: Record<string, { monthly: number; annually: number }> = {
  starter: { monthly: 500, annually: 5000 },
  basic: { monthly: 2000, annually: 20000 },
  professional: { monthly: 4999, annually: 49990 },
  business: { monthly: 8999, annually: 89990 },
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier: currentTier, upgradeTier, refreshSubscription } = useSubscription();
  const { triggerCelebration } = useUpgradeCelebration();
  const { 
    initializePayment, 
    validateDiscountCode, 
    cancelPayment, 
    checkConnectionQuality,
    loading: paymentLoading, 
    retryCount,
    connectionQuality 
  } = usePaystack();
  
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [pendingDowngradeTier, setPendingDowngradeTier] = useState<SubscriptionTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<DiscountValidationResult | null>(null);
  const [selectedTierForPromo, setSelectedTierForPromo] = useState<SubscriptionTier>('starter');
  const [processingTier, setProcessingTier] = useState<SubscriptionTier | null>(null);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'good' | 'slow' | 'offline'>('checking');

  // Smart pre-warming: auth session + authenticated edge function ping
  useEffect(() => {
    const prewarmAll = async () => {
      try {
        // Get session first
        const { data } = await supabase.auth.getSession();
        logger.debug('[Pricing] Session pre-warmed:', !!data.session);
        
        // Check connection quality
        const start = Date.now();
        await supabase.auth.getSession(); // Quick ping
        const latency = Date.now() - start;
        
        if (!navigator.onLine) {
          setConnectionStatus('offline');
        } else if (latency < 1500) {
          setConnectionStatus('good');
        } else {
          setConnectionStatus('slow');
        }
        
        // Pre-warm edge function with authenticated ping (if user is logged in)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl && data.session?.access_token) {
          fetch(`${supabaseUrl}/functions/v1/paystack-initialize`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ping: true }),
          }).then(() => {
            logger.debug('[Pricing] Edge function pre-warmed with auth');
          }).catch(() => {
            // Ignore errors, this is just warming
          });
        }
      } catch (err) {
        logger.debug('[Pricing] Pre-warm error (non-critical):', err);
        setConnectionStatus('slow');
      }
    };
    
    prewarmAll();
  }, []);

  // Force refresh subscription data on page mount
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const handleCancelPayment = () => {
    cancelPayment();
    setProcessingTier(null);
    toast.info('Payment cancelled');
  };

  const isDowngrade = (targetTier: SubscriptionTier): boolean => {
    const currentIndex = TIER_ORDER.indexOf(currentTier);
    const targetIndex = TIER_ORDER.indexOf(targetTier);
    return targetIndex < currentIndex;
  };

  const handleTierSelect = async (tier: SubscriptionTier) => {
    logger.debug('[TierSelect] Called with tier:', tier, {
      user: user?.email,
      currentTier,
      policiesAccepted,
      billingCycle,
      connectionStatus
    });

    if (tier === 'free') {
      logger.debug('[TierSelect] Free tier selected - no action');
      toast.info("You're already on the free tier or this is the free tier");
      return;
    }

    if (tier === 'corporate') {
      logger.debug('[TierSelect] Corporate tier - contact required');
      toast.info("Contact us for Corporate pricing");
      return;
    }

    // Require authentication
    if (!user) {
      logger.debug('[TierSelect] No user - redirecting to auth');
      toast.info("Please sign in to upgrade");
      navigate('/auth?redirect=/pricing');
      return;
    }

    // Check if this is a downgrade
    if (isDowngrade(tier)) {
      logger.debug('[TierSelect] Downgrade detected - showing dialog');
      setPendingDowngradeTier(tier);
      setShowDowngradeDialog(true);
      return;
    }

    // Check if policies are accepted for paid tiers
    if (!policiesAccepted) {
      logger.debug('[TierSelect] Policies not accepted - blocking payment');
      toast.error("Please accept the Terms & Conditions, Privacy Policy, and Refund Policy to continue");
      return;
    }

    logger.debug('[TierSelect] All checks passed - processing payment');
    // Process payment with Paystack
    await processPayment(tier);
  };

  const processPayment = async (tier: SubscriptionTier) => {
    logger.debug('[Payment] Starting payment for tier:', tier, { billingCycle, promoCode, promoValidation });
    setProcessingTier(tier);
    
    try {
      logger.debug('[Payment] Calling initializePayment...');
      const result = await initializePayment(
        tier,
        billingCycle,
        promoValidation?.valid ? promoCode : undefined,
        promoValidation?.discountType
      );

      logger.debug('[Payment] initializePayment result:', result);

      if (!result.success) {
        logger.error('[Payment] Failed:', result.error);
        toast.error(result.error || 'Failed to initialize payment');
        return;
      }

      // Show discount info if applied (discountAmount is in kobo, convert to Naira)
      if (result.discountApplied && result.discountAmount) {
        toast.success(`Discount applied! You save ₦${(result.discountAmount / 100).toLocaleString()}`);
      }

      // Redirect to Paystack checkout
      if (result.authorizationUrl) {
        logger.debug('[Payment] Redirecting to Paystack:', result.authorizationUrl);
        window.location.href = result.authorizationUrl;
      } else {
        logger.error('[Payment] No authorizationUrl in result');
        toast.error('No payment URL received from server');
      }
    } catch (err) {
      logger.error('[Payment] Exception:', err);
      toast.error('Payment initialization failed');
    } finally {
      setProcessingTier(null);
    }
  };

  const handleDowngradeConfirm = () => {
    if (!pendingDowngradeTier) return;
    
    toast.success(`Downgraded to ${pendingDowngradeTier.charAt(0).toUpperCase() + pendingDowngradeTier.slice(1)}`, {
      description: 'Your data has been preserved and will be available if you upgrade again.'
    });
    
    upgradeTier(pendingDowngradeTier);
    setPendingDowngradeTier(null);
    navigate('/dashboard');
  };

  const getPrice = (tier: SubscriptionTier) => {
    if (tier === 'free' || tier === 'corporate') return null;
    const prices = TIER_PRICES[tier];
    return billingCycle === 'annually' ? prices.annually : prices.monthly;
  };

  return (
    <>
    <SEOHead
      title="Pricing - Nigerian Tax Calculator Plans | TaxForge NG"
      description="TaxForge NG pricing plans from free to ₦8,999/month. PDF reports, payroll calculator, expense tracking, OCR scanning. Start free, upgrade anytime."
      canonicalPath="/pricing"
      keywords="TaxForge pricing, Nigeria tax calculator plans, business tax software Nigeria, affordable tax tools"
      schema={createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Pricing', url: 'https://taxforgeng.com/pricing' },
      ])}
    />
    <PageLayout maxWidth="7xl" showBackground={true}>
      <article>
      <PageBreadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Pricing' },
      ]} />
      <ContentMeta published="2026-02-09" publishedLabel="9 February 2026" updated="2026-02-13" updatedLabel="13 February 2026" />

      {/* Connection Status Warning */}
      {connectionStatus === 'slow' && (
        <Alert variant="default" className="mb-4 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            Slow connection detected. Payment processing may take longer than usual.
          </AlertDescription>
        </Alert>
      )}
      
      {connectionStatus === 'offline' && (
        <Alert variant="destructive" className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Please check your internet connection to make payments.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Choose the plan that fits your needs. Save ~17% with annual billing.
        </p>
        
        {/* Billing Cycle Toggle */}
        <BillingCycleToggle 
          value={billingCycle} 
          onChange={setBillingCycle}
          className="mb-6"
        />

        {/* Promo Code Input with tier selector */}
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Validate code for:</span>
            <select
              value={selectedTierForPromo}
              onChange={(e) => setSelectedTierForPromo(e.target.value as SubscriptionTier)}
              className="bg-secondary border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="starter">Starter</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="business">Business</option>
            </select>
          </div>
          <PromoCodeInput
            tier={selectedTierForPromo}
            billingCycle={billingCycle}
            onDiscountApplied={(result, code) => {
              setPromoValidation(result);
              setPromoCode(code || '');
            }}
          />
        </div>

        {/* Policy Acceptance Checkbox */}
        <div className="mt-6 max-w-lg mx-auto">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="checkout-policies"
                checked={policiesAccepted}
                onCheckedChange={(checked) => setPoliciesAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="checkout-policies" className="text-sm cursor-pointer leading-relaxed">
                I accept the{' '}
                <Link to="/terms#terms" target="_blank" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">
                  Terms & Conditions <ExternalLink className="h-3 w-3" />
                </Link>,{' '}
                <Link to="/terms#privacy" target="_blank" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">
                  Privacy Policy <ExternalLink className="h-3 w-3" />
                </Link>, and{' '}
                <Link to="/terms#refund" target="_blank" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">
                  Refund Policy <ExternalLink className="h-3 w-3" />
                </Link>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 mb-12 sm:mb-16">
        {/* Individual (Free) Tier */}
        <PricingCard
          tier="free"
          name="Individual"
          icon={<User className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={0}
          description="For individuals with no business income"
          features={['Personal tax calculator', 'Employment/Salary PIT', 'Crypto & investment taxes', 'Foreign income credits']}
          limitations={['No business saves', 'No exports']}
          currentTier={currentTier}
          onUpgrade={handleTierSelect}
          isProcessing={processingTier === 'free'}
          billingCycle={billingCycle}
        />

        {/* Starter Tier */}
        <PricingCard
          tier="starter"
          name="Starter"
          icon={<Zap className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={getPrice('starter') || 500}
          annualPrice={billingCycle === 'annually' ? undefined : TIER_PRICES.starter.annually}
          description="For side hustlers starting out"
          features={['Everything in Free', '1 saved business', 'PDF/CSV export', 'No watermarks', 'Email reminders']}
          currentTier={currentTier}
          onUpgrade={handleTierSelect}
          onCancel={handleCancelPayment}
          isProcessing={processingTier === 'starter'}
          retryCount={processingTier === 'starter' ? retryCount : 0}
          billingCycle={billingCycle}
          promoDiscount={promoValidation?.valid ? promoValidation.discountPercentage : undefined}
        />

        {/* Basic Tier */}
        <PricingCard
          tier="basic"
          name="Basic"
          icon={<Star className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={getPrice('basic') || 2000}
          annualPrice={billingCycle === 'annually' ? undefined : TIER_PRICES.basic.annually}
          description="For freelancers & solo professionals"
          features={['Everything in Starter', 'Up to 2 businesses', 'Invoices & P&L', 'OCR receipts', '75 AI queries', 'No watermarks']}
          currentTier={currentTier}
          onUpgrade={handleTierSelect}
          onCancel={handleCancelPayment}
          isProcessing={processingTier === 'basic'}
          retryCount={processingTier === 'basic' ? retryCount : 0}
          billingCycle={billingCycle}
          promoDiscount={promoValidation?.valid ? promoValidation.discountPercentage : undefined}
        />

        {/* Professional Tier */}
        <PricingCard
          tier="professional"
          name="Professional"
          icon={<Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={getPrice('professional') || 4999}
          annualPrice={billingCycle === 'annually' ? undefined : TIER_PRICES.professional.annually}
          description="For small businesses"
          features={['Everything in Basic', 'Up to 5 businesses', 'Payroll & Compliance', 'Digital VAT calc', 'Basic scenarios', 'Priority support']}
          currentTier={currentTier}
          onUpgrade={handleTierSelect}
          onCancel={handleCancelPayment}
          isProcessing={processingTier === 'professional'}
          retryCount={processingTier === 'professional' ? retryCount : 0}
          billingCycle={billingCycle}
          promoDiscount={promoValidation?.valid ? promoValidation.discountPercentage : undefined}
        />

        {/* Business Tier */}
        <PricingCard
          tier="business"
          name="Business"
          icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={getPrice('business') || 8999}
          annualPrice={billingCycle === 'annually' ? undefined : TIER_PRICES.business.annually}
          description="For growing businesses"
          features={['Everything in Professional', 'Up to 10 businesses', 'CAC verification', 'Advanced scenarios', 'Tax filing prep', '2 user seats']}
          isPopular
          currentTier={currentTier}
          onUpgrade={handleTierSelect}
          onCancel={handleCancelPayment}
          isProcessing={processingTier === 'business'}
          retryCount={processingTier === 'business' ? retryCount : 0}
          billingCycle={billingCycle}
          promoDiscount={promoValidation?.valid ? promoValidation.discountPercentage : undefined}
        />

        {/* Corporate Tier */}
        <PricingCard
          tier="corporate"
          name="Corporate"
          icon={<Crown className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice="Custom"
          description="Enterprise solution"
          features={['Everything in Business', 'Unlimited businesses', 'Unlimited users', 'API access', 'Audit log & IP whitelist', 'Dedicated support']}
          currentTier={currentTier}
          onUpgrade={handleTierSelect}
          isProcessing={processingTier === 'corporate'}
          billingCycle={billingCycle}
        />
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Full Feature Comparison
        </h2>
        <div className="rounded-2xl border border-border bg-card shadow-card">
           <div className="overflow-x-auto">
             <table className="w-full table-fixed border-collapse">
               <thead>
                 <tr className="border-b border-border bg-secondary/50">
                   <th className="text-left p-4 font-semibold text-foreground w-[28%]">Feature</th>
                   <th className="text-center p-4 font-semibold text-foreground w-[12%]">Individual</th>
                   <th className="text-center p-4 font-semibold text-foreground w-[12%]">Starter</th>
                   <th className="text-center p-4 font-semibold text-foreground w-[12%]">Basic</th>
                   <th className="text-center p-4 font-semibold text-foreground w-[12%]">Professional</th>
                   <th className="text-center p-4 font-semibold text-primary w-[12%]">Business ✦</th>
                   <th className="text-center p-4 font-semibold text-foreground w-[12%]">Corporate</th>
                 </tr>
              </thead>
            <tbody>
              {featureCategories.map((category, catIndex) => (
                <>
                  {/* Category Header */}
                  <tr key={`cat-${catIndex}`} className="bg-muted/30">
                    <td colSpan={7} className="p-3">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <category.icon className="h-4 w-4 text-primary" />
                        {category.name}
                      </div>
                    </td>
                  </tr>
                  {/* Features in this category */}
                  {features.filter(f => f.category === category.name).map((feature, i) => (
                    <tr key={`${category.name}-${i}`} className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}>
                       <td className="p-4 text-sm text-foreground">{feature.name}</td>
                       <td className="p-4 text-center"><FeatureValue value={feature.free} /></td>
                       <td className="p-4 text-center"><FeatureValue value={feature.starter} /></td>
                       <td className="p-4 text-center"><FeatureValue value={feature.basic} /></td>
                       <td className="p-4 text-center"><FeatureValue value={feature.professional} /></td>
                       <td className="p-4 text-center"><FeatureValue value={feature.business} /></td>
                       <td className="p-4 text-center"><FeatureValue value={feature.corporate} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="text-center mb-12">
        <p className="text-sm text-muted-foreground mb-4">
          Secure payments via Paystack
        </p>
        <div className="flex items-center justify-center gap-6 text-muted-foreground">
          <span className="text-xs">💳 Card</span>
          <span className="text-xs">🏦 Bank Transfer</span>
          <span className="text-xs">📱 USSD</span>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-2xl mx-auto text-center">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Need Help Choosing?</h3>
          <p className="text-muted-foreground mb-6">
            Our team can help you find the right plan for your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="mailto:support@taxforgeng.com">
                <Mail className="h-4 w-4" />
                Contact Sales
              </a>
            </Button>
            <Button variant="default" onClick={() => navigate('/advisory')}>
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 TaxForge NG. All prices include VAT. For educational purposes.
        </p>
      </div>
      </article>
    </PageLayout>

    {/* Downgrade Confirmation Dialog */}
    <DowngradeConfirmationDialog
      open={showDowngradeDialog}
      onOpenChange={setShowDowngradeDialog}
      currentTier={currentTier}
      targetTier={pendingDowngradeTier || 'free'}
      onConfirm={handleDowngradeConfirm}
    />
  </>
  );
};

const PricingCard = ({
  tier,
  name,
  icon,
  monthlyPrice,
  annualPrice,
  description,
  features,
  limitations = [],
  isPopular = false,
  currentTier,
  onUpgrade,
  onCancel,
  isProcessing = false,
  retryCount = 0,
  billingCycle,
  promoDiscount,
}: {
  tier: SubscriptionTier;
  name: string;
  icon: React.ReactNode;
  monthlyPrice: number | string;
  annualPrice?: number;
  description: string;
  features: string[];
  limitations?: string[];
  isPopular?: boolean;
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
  onCancel?: () => void;
  isProcessing?: boolean;
  retryCount?: number;
  billingCycle: 'monthly' | 'annually';
  promoDiscount?: number;
}) => {
  const isCurrentTier = currentTier === tier;
  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
  
  // Determine if selecting this tier is a downgrade
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const tierIndex = TIER_ORDER.indexOf(tier);
  const isDowngradeTier = tierIndex < currentIndex;

  // Calculate discounted price if promo applied
  const displayPrice = typeof monthlyPrice === 'number' && promoDiscount
    ? monthlyPrice * (1 - promoDiscount / 100)
    : monthlyPrice;

  const getProcessingText = () => {
    if (retryCount > 0) return `Retrying... (${retryCount}/2)`;
    return 'Connecting to Paystack...';
  };


  return (
    <div className={`relative rounded-xl sm:rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${
      isPopular 
        ? 'border-2 border-primary bg-card shadow-md sm:scale-105' 
        : 'border-border bg-card hover:shadow-md'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}
      
      {isCurrentTier && (
        <div className="absolute -top-3 right-2 sm:right-4">
          <span className="bg-success text-success-foreground text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
            Current Plan
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center ${
          isPopular ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
        }`}>
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground">{name}</h3>
      </div>

      <div className="mb-3 sm:mb-4">
        {typeof displayPrice === 'number' ? (
          <>
            <div className="flex items-baseline gap-1">
              {promoDiscount && typeof monthlyPrice === 'number' && (
                <span className="text-sm line-through text-muted-foreground mr-1">
                  {formatPrice(monthlyPrice)}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{formatPrice(displayPrice)}</span>
              <span className="text-muted-foreground text-sm">/{billingCycle === 'annually' ? 'yr' : 'mo'}</span>
            </div>
            {annualPrice && billingCycle === 'monthly' && (
              <p className="text-xs sm:text-sm text-success mt-1">
                {formatPrice(annualPrice)}/year (save ~17%)
              </p>
            )}
          </>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{displayPrice}</span>
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">{description}</p>

      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success mt-0.5 shrink-0" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
        {limitations.map((limitation, i) => (
          <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <X className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-muted-foreground">{limitation}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isPopular ? 'hero' : isCurrentTier ? 'secondary' : isDowngradeTier ? 'outline' : 'outline'}
        className={`w-full text-xs sm:text-sm h-9 sm:h-10 ${isDowngradeTier ? 'border-warning/50 text-warning hover:bg-warning/10' : ''}`}
        disabled={isCurrentTier || isProcessing}
        onClick={() => onUpgrade(tier)}
      >
        {isProcessing ? (
          <span className="flex flex-col items-center gap-0.5">
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {getProcessingText()}
            </span>
          </span>
        ) : isCurrentTier 
          ? 'Current Plan' 
          : tier === 'corporate' 
            ? 'Contact Us' 
            : isDowngradeTier 
              ? 'Downgrade' 
              : 'Upgrade Now'}
      </Button>
      {isProcessing && onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

const FeatureValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-success mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
};

export default Pricing;
