import { useParams, useNavigate } from "react-router-dom";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { sectorGuides } from "@/lib/taxMyths";
import {
  ArrowLeft,
  Crown,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Cpu,
  Wheat,
  Factory,
  ShoppingCart,
  Globe,
  Package,
  ExternalLink
} from "lucide-react";

const SectorGuide = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tier } = useSubscription();

  const guide = sectorGuides.find(g => g.id === id);

  const sectorIcons: Record<string, typeof Cpu> = {
    tech: Cpu,
    agriculture: Wheat,
    manufacturing: Factory,
    retail: ShoppingCart,
    freezone: Globe,
    export: Package,
  };

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Guide Not Found</h1>
          <Button onClick={() => navigate('/learn')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tax Academy
          </Button>
        </div>
      </div>
    );
  }

  const tierOrder = { free: 0, basic: 1, business: 2 };
  const userTierValue = tierOrder[tier === 'corporate' ? 'business' : tier as keyof typeof tierOrder] || 0;
  const hasAccess = userTierValue >= tierOrder[guide.tier];

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <Crown className="h-16 w-16 text-warning mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Premium Content</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            This sector guide requires a {guide.tier === 'business' ? 'Business' : 'Basic'}+ subscription to access.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/learn')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="glow" onClick={() => navigate('/pricing')}>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const SectorIcon = sectorIcons[guide.sector] || Package;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl animate-float" />
        <div className="bg-mesh absolute inset-0" />
      </div>

      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 relative z-10">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" onClick={() => navigate('/learn')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tax Academy
          </Button>

          {/* Header */}
          <div className="glass-frosted rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl bg-gradient-primary text-primary-foreground flex-shrink-0">
                <SectorIcon className="h-10 w-10" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{guide.icon}</span>
                  <h1 className="text-3xl font-bold text-foreground">{guide.title}</h1>
                </div>
                <p className="text-lg text-muted-foreground">{guide.description}</p>
              </div>
            </div>
          </div>

          {/* Tax Incentives */}
          <div className="glass-frosted rounded-3xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Tax Incentives
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {guide.taxIncentives.map((incentive, i) => (
                <div key={i} className="glass p-4 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-1">{incentive.name}</h3>
                  <p className="text-success font-medium">{incentive.value}</p>
                  {incentive.duration && (
                    <p className="text-xs text-muted-foreground mt-1">{incentive.duration}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits & Requirements */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="glass-frosted rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Benefits
              </h2>
              <ul className="space-y-3">
                {guide.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-1" />
                    <span className="text-foreground text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-frosted rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Requirements
              </h2>
              <ul className="space-y-3">
                {guide.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-1" />
                    <span className="text-foreground text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full Content */}
          <div className="glass-frosted rounded-3xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Detailed Guide</h2>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed bg-secondary/30 p-4 rounded-xl">
                {guide.content}
              </pre>
            </div>
          </div>

          {/* CTA */}
          <div className="glass-frosted rounded-3xl p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Calculate Your Tax?</h3>
            <p className="text-muted-foreground mb-4">
              Use our calculator with {guide.sector} sector presets
            </p>
            <Button variant="glow" onClick={() => navigate('/calculator')}>
              <Calculator className="h-4 w-4 mr-2" />
              Open Calculator
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SectorGuide;