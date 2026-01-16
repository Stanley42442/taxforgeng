import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
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
} from "lucide-react";
import { useSubscription, SubscriptionTier } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

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

const Pricing = () => {
  const navigate = useNavigate();
  const { tier: currentTier, upgradeTier } = useSubscription();

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === 'corporate') {
      toast.info("Contact us for Corporate pricing");
      return;
    }
    
    // Mock Paystack checkout - in production, this would open Paystack
    toast.success("Processing upgrade...", {
      description: 'This is a test mode transaction'
    });
    
    setTimeout(() => {
      upgradeTier(tier);
      toast.success("Upgrade successful!");
      navigate('/calculator');
    }, 1500);
  };

  return (
    <PageLayout maxWidth="7xl" showBackground={true}>
      {/* Header */}
      <div className="text-center mb-12 animate-slide-up">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your needs. Save ~17% with annual billing.
        </p>
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
          onUpgrade={handleUpgrade}
        />

        {/* Starter Tier */}
        <PricingCard
          tier="starter"
          name="Starter"
          icon={<Zap className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={500}
          annualPrice={5000}
          description="For side hustlers starting out"
          features={['Everything in Free', '1 saved business', 'PDF/CSV export', 'No watermarks', 'Email reminders']}
          currentTier={currentTier}
          onUpgrade={handleUpgrade}
        />

        {/* Basic Tier */}
        <PricingCard
          tier="basic"
          name="Basic"
          icon={<Star className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={2000}
          annualPrice={20000}
          description="For freelancers & solo professionals"
          features={['Everything in Starter', 'Up to 2 businesses', 'Invoices & P&L', 'OCR receipts', '75 AI queries', 'No watermarks']}
          currentTier={currentTier}
          onUpgrade={handleUpgrade}
        />

        {/* Professional Tier (was Freelancer) */}
        <PricingCard
          tier="professional"
          name="Professional"
          icon={<Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={4999}
          annualPrice={49990}
          description="For small businesses"
          features={['Everything in Basic', 'Up to 5 businesses', 'Payroll & Compliance', 'Digital VAT calc', 'Basic scenarios', 'Priority support']}
          currentTier={currentTier}
          onUpgrade={handleUpgrade}
        />

        {/* Business Tier */}
        <PricingCard
          tier="business"
          name="Business"
          icon={<Building2 className="h-5 w-5 sm:h-6 sm:w-6" />}
          monthlyPrice={8999}
          annualPrice={89990}
          description="For growing businesses"
          features={['Everything in Professional', 'Up to 10 businesses', 'CAC verification', 'Advanced scenarios', 'Tax filing prep', '2 user seats']}
          isPopular
          currentTier={currentTier}
          onUpgrade={handleUpgrade}
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
          onUpgrade={handleUpgrade}
        />
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Full Feature Comparison
        </h2>
        <div className="rounded-2xl border border-border glass-frosted overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-semibold text-foreground min-w-[200px]">Feature</th>
                  <th className="text-center p-4 font-semibold text-foreground min-w-[80px]">Individual</th>
                  <th className="text-center p-4 font-semibold text-foreground min-w-[80px]">Starter</th>
                  <th className="text-center p-4 font-semibold text-foreground min-w-[80px]">Basic</th>
                  <th className="text-center p-4 font-semibold text-foreground min-w-[80px]">Professional</th>
                  <th className="text-center p-4 font-semibold text-foreground bg-primary/5 min-w-[80px]">Business</th>
                  <th className="text-center p-4 font-semibold text-foreground min-w-[80px]">Corporate</th>
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
                        <td className="p-4 text-center bg-primary/5"><FeatureValue value={feature.business} /></td>
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
        <div className="rounded-2xl border border-border glass-frosted p-8 shadow-card hover-lift">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 glow-sm">
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
            <Button variant="hero" onClick={() => navigate('/advisory')}>
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © 2025 TaxForge NG. All prices include VAT. For educational purposes.
        </p>
      </div>
    </PageLayout>
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
}) => {
  const isCurrentTier = currentTier === tier;
  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <div className={`relative rounded-xl sm:rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${
      isPopular 
        ? 'border-primary glass-frosted shadow-lg sm:scale-105 glow-sm' 
        : 'border-border bg-card shadow-card hover:shadow-lg card-interactive'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-primary text-primary-foreground text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap animate-glow-border">
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
          isPopular ? 'bg-gradient-primary text-primary-foreground' : 'bg-secondary text-primary'
        }`}>
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground">{name}</h3>
      </div>

      <div className="mb-3 sm:mb-4">
        {typeof monthlyPrice === 'number' ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{formatPrice(monthlyPrice)}</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            {annualPrice && (
              <p className="text-xs sm:text-sm text-success mt-1">
                {formatPrice(annualPrice)}/year (save ~17%)
              </p>
            )}
          </>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{monthlyPrice}</span>
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
        variant={isPopular ? 'hero' : isCurrentTier ? 'secondary' : 'outline'}
        className="w-full text-xs sm:text-sm h-9 sm:h-10"
        disabled={isCurrentTier || (tier === 'free')}
        onClick={() => onUpgrade(tier)}
      >
        {isCurrentTier ? 'Current Plan' : tier === 'free' ? 'Free Forever' : tier === 'corporate' ? 'Contact Us' : 'Upgrade Now'}
      </Button>
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
