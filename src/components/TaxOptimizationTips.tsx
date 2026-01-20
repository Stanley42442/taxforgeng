import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingDown, 
  Shield, 
  Coins, 
  AlertTriangle,
  Heart,
  Home,
  Landmark,
  CheckCircle
} from "lucide-react";

interface TaxOptimizationTipsProps {
  inputs: {
    employmentIncome: number;
    pensionContribution: number;
    nhfContribution: number;
    healthInsurance: number;
    lifeInsurance: number;
    rentPaid: number;
  };
  use2026Rules: boolean;
  calculationType: string;
}

interface Tip {
  icon: React.ReactNode;
  title: string;
  description: string;
  savings?: number;
  priority: 'high' | 'medium' | 'low';
}

export function TaxOptimizationTips({ inputs, use2026Rules, calculationType }: TaxOptimizationTipsProps) {
  const tips = useMemo(() => {
    const tipsList: Tip[] = [];
    const income = inputs.employmentIncome;

    if (calculationType !== 'pit' || income <= 0) {
      return tipsList;
    }

    // Pension optimization (8% of basic salary is tax-deductible)
    const maxPensionDeductible = income * 0.08;
    if (inputs.pensionContribution < maxPensionDeductible && inputs.pensionContribution < income * 0.05) {
      const potentialAdditional = maxPensionDeductible - inputs.pensionContribution;
      // Estimate savings based on approximate marginal rate
      const marginalRate = income > 25000000 ? 0.25 : income > 12000000 ? 0.21 : income > 800000 ? 0.15 : 0;
      const potentialSavings = potentialAdditional * marginalRate;
      
      if (potentialSavings > 10000) {
        tipsList.push({
          icon: <Coins className="h-4 w-4" />,
          title: 'Maximize Pension Contribution',
          description: `You can contribute up to ₦${maxPensionDeductible.toLocaleString()} (8% of income). This is fully deductible and grows tax-free.`,
          savings: potentialSavings,
          priority: 'high',
        });
      }
    }

    // NHF contribution (2.5% of basic salary)
    const suggestedNHF = income * 0.025;
    if (inputs.nhfContribution < suggestedNHF * 0.5 && income > 1000000) {
      tipsList.push({
        icon: <Landmark className="h-4 w-4" />,
        title: 'NHF Contribution Deduction',
        description: `NHF contributions of up to 2.5% of basic salary (₦${suggestedNHF.toLocaleString()}) are tax-deductible and help you access housing loans.`,
        priority: 'medium',
      });
    }

    // Health Insurance
    if (inputs.healthInsurance === 0 && income > 2000000) {
      tipsList.push({
        icon: <Heart className="h-4 w-4" />,
        title: 'Add Health Insurance',
        description: 'NHIS or private health insurance premiums are fully deductible. Consider enrolling to reduce taxable income while getting coverage.',
        priority: 'medium',
      });
    }

    // Rent Relief (2026 rules)
    if (use2026Rules) {
      const currentRelief = Math.min(inputs.rentPaid * 0.20, 500000);
      if (inputs.rentPaid > 0 && currentRelief < 500000 && inputs.rentPaid < 2500000) {
        tipsList.push({
          icon: <Home className="h-4 w-4" />,
          title: 'Rent Relief Cap',
          description: `You're getting ₦${currentRelief.toLocaleString()} relief. The maximum is ₦500,000 (on annual rent of ₦2.5M+). Ensure you document your rent payments.`,
          priority: 'low',
        });
      } else if (inputs.rentPaid === 0 && income > 3000000) {
        tipsList.push({
          icon: <Home className="h-4 w-4" />,
          title: 'Claim Rent Relief',
          description: 'Under 2026 rules, you can claim 20% of annual rent paid (up to ₦500,000). Enter your rent to reduce your tax liability.',
          priority: 'high',
        });
      }
    }

    // Life Insurance
    if (inputs.lifeInsurance === 0 && income > 5000000) {
      tipsList.push({
        icon: <Shield className="h-4 w-4" />,
        title: 'Consider Life Insurance',
        description: 'Life insurance premiums are tax-deductible. This provides family protection while reducing your tax liability.',
        priority: 'low',
      });
    }

    // Income splitting tip for high earners
    if (income > 25000000) {
      tipsList.push({
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'High Income Alert',
        description: 'Income above ₦25M is taxed at 23-25%. Consider consulting a tax professional for advanced planning strategies like proper timing of bonuses.',
        priority: 'high',
      });
    }

    // 2026 Rules benefit reminder
    if (use2026Rules && income <= 800000 && income > 0) {
      tipsList.push({
        icon: <TrendingDown className="h-4 w-4" />,
        title: 'Tax-Free Under 2026 Rules',
        description: 'Good news! Under the 2026 Tax Act, income up to ₦800,000 is completely tax-exempt.',
        priority: 'high',
      });
    }

    return tipsList;
  }, [inputs, use2026Rules, calculationType]);

  if (calculationType !== 'pit' || inputs.employmentIncome <= 0) {
    return null;
  }

  if (tips.length === 0) {
    return (
      <Card className="glass-frosted border-success/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Great job!</p>
              <p className="text-xs text-muted-foreground">
                You're utilizing available tax reliefs effectively.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by priority
  const sortedTips = [...tips].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card className="glass-frosted">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="rounded-lg bg-accent/10 p-2">
            <Lightbulb className="h-5 w-5 text-accent" />
          </div>
          Tax Optimization Tips
          <Badge variant="secondary" className="ml-auto">
            {tips.length} suggestion{tips.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedTips.slice(0, 4).map((tip, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border transition-colors ${
              tip.priority === 'high' 
                ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10' 
                : 'bg-secondary/30 border-border/50 hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-md p-1.5 flex-shrink-0 ${
                tip.priority === 'high' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'
              }`}>
                {tip.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{tip.title}</p>
                  {tip.priority === 'high' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600">
                      Priority
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                {tip.savings && tip.savings > 0 && (
                  <p className="text-xs text-success font-medium mt-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Potential savings: ~₦{Math.round(tip.savings).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {tips.length > 4 && (
          <p className="text-xs text-center text-muted-foreground">
            +{tips.length - 4} more suggestions available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
