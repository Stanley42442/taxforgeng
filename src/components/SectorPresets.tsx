import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  Wheat, 
  Factory, 
  ShoppingCart, 
  Globe, 
  Package,
  Sparkles
} from "lucide-react";

interface SectorPreset {
  id: string;
  name: string;
  icon: typeof Cpu;
  description: string;
  presets: {
    turnover?: number;
    expenses?: number;
    fixedAssets?: number;
    vatableSales?: number;
    vatablePurchases?: number;
  };
  benefits: string[];
}

const SECTOR_PRESETS: SectorPreset[] = [
  {
    id: 'tech',
    name: 'Tech/NSA',
    icon: Cpu,
    description: 'NITDA Software Accreditation benefits',
    presets: {
      turnover: 50000000,
      expenses: 20000000,
      fixedAssets: 15000000,
      vatableSales: 50000000,
      vatablePurchases: 5000000,
    },
    benefits: ['5% EDTI tax credit', 'R&D deductions', 'IP income benefits']
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Wheat,
    description: '5-year CIT exemption for primary production',
    presets: {
      turnover: 30000000,
      expenses: 18000000,
      fixedAssets: 25000000,
      vatableSales: 0, // Zero-rated
      vatablePurchases: 8000000,
    },
    benefits: ['CIT holiday (5 years)', 'VAT zero-rating', 'Input VAT credits']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    description: 'Asset investment & wage deductions',
    presets: {
      turnover: 120000000,
      expenses: 80000000,
      fixedAssets: 200000000,
      vatableSales: 120000000,
      vatablePurchases: 60000000,
    },
    benefits: ['10% fixed asset credit', 'Wage deductions', 'Accelerated depreciation']
  },
  {
    id: 'retail',
    name: 'Retail/SME',
    icon: ShoppingCart,
    description: 'Presumptive tax option for small businesses',
    presets: {
      turnover: 15000000,
      expenses: 9000000,
      fixedAssets: 3000000,
      vatableSales: 15000000,
      vatablePurchases: 10000000,
    },
    benefits: ['Presumptive tax option', 'Simplified filing', 'Small company relief']
  },
  {
    id: 'freezone',
    name: 'Free Zone',
    icon: Globe,
    description: 'Export-focused tax incentives',
    presets: {
      turnover: 200000000,
      expenses: 100000000,
      fixedAssets: 80000000,
      vatableSales: 0, // Exports zero-rated
      vatablePurchases: 40000000,
    },
    benefits: ['CIT exemption', 'Duty-free imports', 'No WHT on dividends']
  },
  {
    id: 'export',
    name: 'Export Business',
    icon: Package,
    description: 'Export expansion grant benefits',
    presets: {
      turnover: 80000000,
      expenses: 50000000,
      fixedAssets: 30000000,
      vatableSales: 0, // Exports zero-rated
      vatablePurchases: 25000000,
    },
    benefits: ['VAT zero-rating', 'EEG eligibility', 'Forex retention']
  },
];

interface SectorPresetsProps {
  onApplyPreset: (presets: SectorPreset['presets']) => void;
}

export const SectorPresets = ({ onApplyPreset }: SectorPresetsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Sector Presets
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-frosted" align="start">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Choose Your Sector</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Apply sector-specific tax presets
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {SECTOR_PRESETS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => onApplyPreset(sector.presets)}
              className="w-full p-3 hover:bg-secondary/50 transition-colors text-left border-b border-border last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <sector.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{sector.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {sector.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sector.benefits.map((benefit, i) => (
                      <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
