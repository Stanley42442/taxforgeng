import { Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

interface FeatureCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileFeatureComparisonProps {
  features: TierFeature[];
  featureCategories: FeatureCategory[];
}

const TIERS = [
  { key: 'free' as const, label: 'Individual', highlight: false },
  { key: 'starter' as const, label: 'Starter', highlight: false },
  { key: 'basic' as const, label: 'Basic', highlight: false },
  { key: 'professional' as const, label: 'Professional', highlight: false },
  { key: 'business' as const, label: 'Business', highlight: true },
  { key: 'corporate' as const, label: 'Corporate', highlight: false },
];

const FeatureValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-success" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/40" />
    );
  }
  return <span className="text-xs font-medium text-foreground">{value}</span>;
};

export const MobileFeatureComparison = ({
  features,
  featureCategories,
}: MobileFeatureComparisonProps) => {
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {TIERS.map((tier) => (
        <AccordionItem
          key={tier.key}
          value={tier.key}
          className={`rounded-2xl border bg-card overflow-hidden ${
            tier.highlight ? 'border-primary border-2' : 'border-border'
          }`}
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{tier.label}</span>
              {tier.highlight && (
                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                  Popular
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            {featureCategories.map((category) => {
              const categoryFeatures = features.filter(
                (f) => f.category === category.name
              );
              if (categoryFeatures.length === 0) return null;

              return (
                <div key={category.name}>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/30">
                    <category.icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {category.name}
                    </span>
                  </div>
                  {categoryFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-2.5 ${
                        i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'
                      }`}
                    >
                      <span className="text-xs text-foreground pr-3">
                        {feature.name}
                      </span>
                      <div className="shrink-0">
                        <FeatureValue value={feature[tier.key]} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
