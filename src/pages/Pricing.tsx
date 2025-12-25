import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/NavMenu";
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
} from "lucide-react";
import { useSubscription, SubscriptionTier } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

interface TierFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  business: boolean | string;
  corporate: boolean | string;
}

const features: TierFeature[] = [
  { name: 'Unlimited tax calculations', free: true, basic: true, business: true, corporate: true },
  { name: 'Basic advisory', free: true, basic: true, business: true, corporate: true },
  { name: 'Pre-2026 & 2026 rules', free: true, basic: true, business: true, corporate: true },
  { name: 'Saved businesses', free: '0', basic: '2', business: '10', corporate: 'Unlimited' },
  { name: 'Data storage', free: false, basic: true, business: true, corporate: true },
  { name: 'PDF/CSV export', free: false, basic: true, business: true, corporate: true },
  { name: 'CAC verification (auto)', free: false, basic: false, business: true, corporate: true },
  { name: 'No watermarks', free: false, basic: false, business: true, corporate: true },
  { name: 'Scenario modeling', free: false, basic: false, business: true, corporate: true },
  { name: 'Tax filing preparation', free: false, basic: false, business: true, corporate: true },
  { name: 'Email reminders', free: false, basic: true, business: true, corporate: true },
  { name: 'Bulk CAC verification', free: false, basic: false, business: false, corporate: true },
  { name: 'Multi-user seats', free: false, basic: false, business: '2 seats', corporate: 'Unlimited' },
  { name: 'Priority support', free: false, basic: false, business: true, corporate: true },
  { name: 'Custom reports', free: false, basic: false, business: false, corporate: true },
  { name: 'Dedicated support', free: false, basic: false, business: false, corporate: true },
  { name: 'API access (coming)', free: false, basic: false, business: false, corporate: true },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { tier: currentTier, upgradeTier } = useSubscription();

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === 'corporate') {
      toast.info('Our team will contact you shortly!');
      return;
    }
    
    // Mock Paystack checkout - in production, this would open Paystack
    toast.success(`Upgrading to ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan...`, {
      description: 'This is a test mode transaction'
    });
    
    setTimeout(() => {
      upgradeTier(tier);
      toast.success(`Successfully upgraded to ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`);
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. All prices include VAT. 
            Save ~17% with annual billing.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto mb-16">
          {/* Free Tier */}
          <PricingCard
            tier="free"
            name="Free"
            icon={<Briefcase className="h-6 w-6" />}
            monthlyPrice={0}
            description="Get started with basic tax calculations"
            features={['Unlimited calculations', 'Basic advisory', 'Pre-2026 & 2026 rules', 'Watermarked results']}
            limitations={['No data storage', 'No exports', 'No saved businesses']}
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
          />

          {/* Basic Tier */}
          <PricingCard
            tier="basic"
            name="Basic"
            icon={<Star className="h-6 w-6" />}
            monthlyPrice={2000}
            annualPrice={20000}
            description="Perfect for individual professionals"
            features={['Everything in Free', 'Up to 2 saved businesses', 'PDF/CSV export', 'Data storage', 'Email reminders']}
            limitations={['Watermarked results', 'No scenario modeling']}
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
          />

          {/* Business Tier */}
          <PricingCard
            tier="business"
            name="Business"
            icon={<Building2 className="h-6 w-6" />}
            monthlyPrice={9900}
            annualPrice={99000}
            description="For growing businesses with multiple entities"
            features={['Everything in Basic', 'Up to 10 businesses', 'CAC verification', 'Scenario modeling', 'Tax filing prep', 'No watermarks', '2 user seats', 'Priority support']}
            isPopular
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
          />

          {/* Corporate Tier */}
          <PricingCard
            tier="corporate"
            name="Corporate"
            icon={<Crown className="h-6 w-6" />}
            monthlyPrice="Custom"
            description="Enterprise solution for large organizations"
            features={['Everything in Business', 'Unlimited businesses', 'Unlimited users', 'Custom reports', 'Dedicated support', 'API access (coming)', 'Direct filing (coming)']}
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Full Feature Comparison
          </h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                    <th className="text-center p-4 font-semibold text-foreground">Free</th>
                    <th className="text-center p-4 font-semibold text-foreground">Basic</th>
                    <th className="text-center p-4 font-semibold text-foreground bg-primary/5">Business</th>
                    <th className="text-center p-4 font-semibold text-foreground">Corporate</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}>
                      <td className="p-4 text-sm text-foreground">{feature.name}</td>
                      <td className="p-4 text-center"><FeatureValue value={feature.free} /></td>
                      <td className="p-4 text-center"><FeatureValue value={feature.basic} /></td>
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
            Secure payments via Paystack. Pay with Card, Bank Transfer, or USSD.
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
            <h3 className="text-xl font-bold text-foreground mb-2">Need Help Choosing?</h3>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you find the perfect plan for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="mailto:support@taxforge.ng">
                  <Mail className="h-4 w-4" />
                  Contact Sales
                </a>
              </Button>
              <Link to="/advisory">
                <Button variant="hero">
                  Start Free Trial
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
  const isCurrentTier = currentTier === tier;
  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <div className={`relative rounded-2xl border p-6 transition-all ${
      isPopular 
        ? 'border-primary bg-card shadow-lg scale-105' 
        : 'border-border bg-card shadow-card hover:shadow-card-hover'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      
      {isCurrentTier && (
        <div className="absolute -top-3 right-4">
          <span className="bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          isPopular ? 'bg-gradient-primary text-primary-foreground' : 'bg-secondary text-primary'
        }`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground">{name}</h3>
      </div>

      <div className="mb-4">
        {typeof monthlyPrice === 'number' ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-foreground">{formatPrice(monthlyPrice)}</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            {annualPrice && (
              <p className="text-sm text-success mt-1">
                {formatPrice(annualPrice)}/year (save ~17%)
              </p>
            )}
          </>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-foreground">{monthlyPrice}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
        {limitations.map((limitation, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <X className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-muted-foreground">{limitation}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isPopular ? 'hero' : isCurrentTier ? 'secondary' : 'outline'}
        className="w-full"
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
