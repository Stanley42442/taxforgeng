import { Crown, Lock, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription, SubscriptionTier } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface TierFeature {
  name: string;
  description?: string;
}

interface TierInfo {
  name: string;
  features: TierFeature[];
  color: string;
}

const TIER_FEATURES: Record<string, TierInfo> = {
  starter: {
    name: 'Starter',
    color: 'from-emerald-500 to-teal-500',
    features: [
      { name: 'Save 1 business profile' },
      { name: 'Export calculations as PDF' },
      { name: 'Basic tax reminders' },
      { name: '25 AI assistant queries' },
    ],
  },
  basic: {
    name: 'Basic',
    color: 'from-blue-500 to-indigo-500',
    features: [
      { name: 'Save 2 business profiles' },
      { name: 'OCR receipt scanner', description: 'Scan receipts to auto-fill expenses' },
      { name: 'No watermarks on exports' },
      { name: '75 AI assistant queries' },
      { name: 'Advanced expense tracking' },
    ],
  },
  professional: {
    name: 'Professional',
    color: 'from-purple-500 to-pink-500',
    features: [
      { name: 'Save 5 business profiles' },
      { name: 'Payroll calculator', description: 'PAYE, pension & NHF calculations' },
      { name: 'Compliance tracker' },
      { name: 'Digital VAT calculator' },
      { name: 'Scenario modeling' },
      { name: '150 AI assistant queries' },
    ],
  },
  business: {
    name: 'Business',
    color: 'from-amber-500 to-orange-500',
    features: [
      { name: 'Save 10 business profiles' },
      { name: 'Invoice generator' },
      { name: 'Profit & loss reports' },
      { name: 'CAC verification' },
      { name: 'Team collaboration' },
      { name: '300 AI assistant queries' },
    ],
  },
  corporate: {
    name: 'Corporate',
    color: 'from-slate-700 to-slate-900',
    features: [
      { name: 'Unlimited business profiles' },
      { name: 'Dedicated account manager' },
      { name: 'Custom integrations' },
      { name: 'SLA guarantees' },
      { name: 'Unlimited AI queries' },
    ],
  },
};

interface UpgradePromptProps {
  feature: string;
  requiredTier: SubscriptionTier;
  variant?: 'card' | 'inline' | 'modal';
  showFeatures?: boolean;
  onClose?: () => void;
}

export const UpgradePrompt = ({
  feature,
  requiredTier,
  variant = 'card',
  showFeatures = true,
  onClose,
}: UpgradePromptProps) => {
  const { effectiveTier } = useSubscription();
  const { t } = useLanguage();
  
  const tierInfo = TIER_FEATURES[requiredTier];
  
  if (!tierInfo) return null;

  const getNextTierFeatures = () => {
    const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
    const currentIndex = tierOrder.indexOf(effectiveTier);
    const nextTier = tierOrder[currentIndex + 1];
    return nextTier ? TIER_FEATURES[nextTier] : null;
  };

  const nextTierInfo = getNextTierFeatures();

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="p-2 rounded-full bg-primary/20">
          <Lock className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {feature} requires <span className="text-primary font-semibold">{tierInfo.name}</span> plan
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link to="/pricing">
            <Crown className="h-3.5 w-3.5 mr-1.5" />
            Upgrade
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-primary/20 shadow-lg">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${tierInfo.color} p-6 text-white`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl text-white">Feature Locked</CardTitle>
        </div>
        <CardDescription className="text-white/90">
          <span className="font-semibold">{feature}</span> is available on the{' '}
          <span className="font-bold">{tierInfo.name}</span> plan and above
        </CardDescription>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* What you'll unlock */}
        {showFeatures && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>What you'll unlock with {tierInfo.name}</span>
            </div>
            <ul className="space-y-2">
              {tierInfo.features.map((feat, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-0.5 rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{feat.name}</span>
                    {feat.description && (
                      <p className="text-xs text-muted-foreground">{feat.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next tier preview (if not already showing required tier) */}
        {nextTierInfo && nextTierInfo.name !== tierInfo.name && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Your next upgrade: <span className="font-medium text-foreground">{nextTierInfo.name}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {nextTierInfo.features.slice(0, 3).map((feat, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {feat.name}
                </span>
              ))}
              {nextTierInfo.features.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  +{nextTierInfo.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-3">
          <Button asChild className="flex-1 group">
            <Link to="/pricing">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {tierInfo.name}
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          )}
        </div>

        {/* Trust indicator */}
        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime • 7-day free trial available
        </p>
      </CardContent>
    </Card>
  );
};

// Compact version for embedding in pages
export const UpgradePromptCompact = ({
  feature,
  requiredTier,
}: {
  feature: string;
  requiredTier: SubscriptionTier;
}) => {
  const tierInfo = TIER_FEATURES[requiredTier];
  
  if (!tierInfo) return null;

  return (
    <div className="text-center py-12 px-6">
      <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${tierInfo.color} mb-4`}>
        <Crown className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{feature}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        This feature is available on the <span className="font-medium text-foreground">{tierInfo.name}</span> plan and above.
        Upgrade to unlock this and more powerful features.
      </p>
      <Button asChild size="lg">
        <Link to="/pricing">
          <Crown className="h-4 w-4 mr-2" />
          View Plans
        </Link>
      </Button>
    </div>
  );
};
