import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/NavMenu";
import { useLanguage } from "@/contexts/LanguageContext";
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
} from "lucide-react";
import { useSubscription, SubscriptionTier } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

interface TierFeature {
  name: string;
  free: boolean | string;
  starter: boolean | string;
  basic: boolean | string;
  freelancer: boolean | string;
  business: boolean | string;
  corporate: boolean | string;
}

const features: TierFeature[] = [
  { name: 'Personal tax calculator (PIT)', free: true, starter: true, basic: true, freelancer: true, business: true, corporate: true },
  { name: 'Crypto & investment taxes', free: true, starter: true, basic: true, freelancer: true, business: true, corporate: true },
  { name: 'Foreign income/DTT credits', free: true, starter: true, basic: true, freelancer: true, business: true, corporate: true },
  { name: 'Business tax calculator', free: false, starter: true, basic: true, freelancer: true, business: true, corporate: true },
  { name: 'Digital VAT calculator', free: false, starter: false, basic: false, freelancer: true, business: true, corporate: true },
  { name: 'Saved businesses', free: '0', starter: '1', basic: '2', freelancer: '5', business: '10', corporate: 'Unlimited' },
  { name: 'Data storage', free: false, starter: true, basic: true, freelancer: true, business: true, corporate: true },
  { name: 'PDF/CSV export', free: false, starter: true, basic: true, freelancer: true, business: true, corporate: true },
  { name: 'Sector-specific presets', free: false, starter: false, basic: true, freelancer: true, business: true, corporate: true },
  { name: 'Scenario modeling', free: false, starter: false, basic: false, freelancer: 'Basic', business: 'Advanced', corporate: 'Advanced' },
  { name: 'CAC verification (auto)', free: false, starter: false, basic: false, freelancer: false, business: true, corporate: true },
  { name: 'No watermarks', free: false, starter: true, basic: false, freelancer: true, business: true, corporate: true },
  { name: 'Tax filing preparation', free: false, starter: false, basic: false, freelancer: false, business: true, corporate: true },
  { name: 'Email reminders', free: false, starter: true, basic: true, freelancer: true, business: true, corporate: true },
  { name: 'Bulk CAC verification', free: false, starter: false, basic: false, freelancer: false, business: false, corporate: true },
  { name: 'Multi-user seats', free: false, starter: false, basic: false, freelancer: false, business: '2 seats', corporate: 'Unlimited' },
  { name: 'Priority support', free: false, starter: false, basic: false, freelancer: true, business: true, corporate: true },
  { name: 'API access', free: false, starter: false, basic: false, freelancer: false, business: false, corporate: true },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { tier: currentTier, upgradeTier } = useSubscription();
  const { t } = useLanguage();

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === 'corporate') {
      toast.info(t('pricing.contactUs'));
      return;
    }
    
    // Mock Paystack checkout - in production, this would open Paystack
    toast.success(t('toast.upgradeSuccess'), {
      description: 'This is a test mode transaction'
    });
    
    setTimeout(() => {
      upgradeTier(tier);
      toast.success(t('toast.upgradeSuccess'));
      navigate('/calculator');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 pb-12 flex-1">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pricing.subtitle')}. {t('pricing.saveAnnual')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 max-w-7xl mx-auto mb-12 sm:mb-16">
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

          {/* Starter Tier - NEW */}
          <PricingCard
            tier="starter"
            name="Starter"
            icon={<Zap className="h-5 w-5 sm:h-6 sm:w-6" />}
            monthlyPrice={500}
            annualPrice={5000}
            description="For small business owners"
            features={['Everything in Free', '1 saved business', 'PDF/CSV export', 'No watermarks', 'Email reminders']}
            limitations={['No scenario modeling']}
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
            description="Perfect for side hustlers"
            features={['Everything in Starter', 'Up to 2 businesses', 'Sector presets', 'Data storage']}
            limitations={['Watermarked results']}
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
          />

          {/* Freelancer Tier - NEW */}
          <PricingCard
            tier="freelancer"
            name="Freelancer"
            icon={<Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />}
            monthlyPrice={4999}
            annualPrice={49990}
            description="For solo professionals & freelancers"
            features={['Everything in Basic', 'Up to 5 businesses', 'Basic scenario modeling', 'Basic integrations', 'No watermarks', 'Priority support']}
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
            features={['Everything in Freelancer', 'Up to 10 businesses', 'CAC verification', 'Advanced scenarios', 'Tax filing prep', '2 user seats']}
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
            features={['Everything in Business', 'Unlimited businesses', 'Unlimited users', 'Custom reports', 'Dedicated support', 'API access (coming)']}
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            {t('pricing.fullComparison')}
          </h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 font-semibold text-foreground">{t('pricing.feature')}</th>
                    <th className="text-center p-4 font-semibold text-foreground">{t('pricing.individual')}</th>
                    <th className="text-center p-4 font-semibold text-foreground">{t('pricing.starter')}</th>
                    <th className="text-center p-4 font-semibold text-foreground">{t('pricing.basic')}</th>
                    <th className="text-center p-4 font-semibold text-foreground">{t('pricing.freelancer')}</th>
                    <th className="text-center p-4 font-semibold text-foreground bg-primary/5">Business</th>
                    <th className="text-center p-4 font-semibold text-foreground">{t('pricing.corporate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}>
                      <td className="p-4 text-sm text-foreground">{feature.name}</td>
                      <td className="p-4 text-center"><FeatureValue value={feature.free} /></td>
                      <td className="p-4 text-center"><FeatureValue value={feature.starter} /></td>
                      <td className="p-4 text-center"><FeatureValue value={feature.basic} /></td>
                      <td className="p-4 text-center"><FeatureValue value={feature.freelancer} /></td>
                      <td className="p-4 text-center bg-primary/5"><FeatureValue value={feature.business} /></td>
                      <td className="p-4 text-center"><FeatureValue value={feature.corporate} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t('pricing.securePayments')}
          </p>
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <span className="text-xs">💳 Card</span>
            <span className="text-xs">🏦 Bank Transfer</span>
            <span className="text-xs">📱 USSD</span>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">{t('pricing.needHelp')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('pricing.helpDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="mailto:support@taxforge.ng">
                  <Mail className="h-4 w-4" />
                  {t('pricing.contactSales')}
                </a>
              </Button>
              <Link to="/advisory">
                <Button variant="hero">
                  {t('pricing.startFreeTrial')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card py-6 border-t border-border mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 TaxForge NG. All prices include VAT. For educational purposes.
          </p>
        </div>
      </footer>
    </div>
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
  const { t } = useLanguage();
  const isCurrentTier = currentTier === tier;
  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <div className={`relative rounded-xl sm:rounded-2xl border p-4 sm:p-6 transition-all ${
      isPopular 
        ? 'border-primary bg-card shadow-lg sm:scale-105' 
        : 'border-border bg-card shadow-card hover:shadow-card-hover'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-primary text-primary-foreground text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
            {t('pricing.mostPopular')}
          </span>
        </div>
      )}
      
      {isCurrentTier && (
        <div className="absolute -top-3 right-2 sm:right-4">
          <span className="bg-success text-success-foreground text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
            {t('pricing.currentPlan')}
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
        {isCurrentTier ? t('pricing.currentPlan') : tier === 'free' ? t('pricing.freeForever') : tier === 'corporate' ? t('pricing.contactUs') : t('pricing.upgradeNow')}
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
