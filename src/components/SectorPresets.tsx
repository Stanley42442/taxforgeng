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
  Sparkles,
  CreditCard,
  Stethoscope,
  Building,
  Truck
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
  taxRules: {
    citRate?: string;
    vatStatus?: string;
    specialIncentives?: string[];
  };
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
    benefits: ['5% EDTI tax credit', 'R&D deductions', 'IP income benefits'],
    taxRules: {
      citRate: '0% with Pioneer Status',
      vatStatus: 'Standard 7.5%',
      specialIncentives: ['NSA labeling (<₦1.5B)', 'EDTI 5% credit', 'R&D 120% deduction']
    }
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
      vatableSales: 0,
      vatablePurchases: 8000000,
    },
    benefits: ['CIT holiday (5 years)', 'VAT zero-rating', 'Input VAT credits'],
    taxRules: {
      citRate: '0% for 5 years',
      vatStatus: 'Zero-rated inputs, exempt output',
      specialIncentives: ['Duty-free equipment', 'Accelerated depreciation', 'Export incentives']
    }
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
    benefits: ['10% fixed asset credit', 'Wage deductions', 'Accelerated depreciation'],
    taxRules: {
      citRate: '25% (standard)',
      vatStatus: 'Standard 7.5%',
      specialIncentives: ['Investment Tax Credit 10%', 'Local raw material bonus 10%', 'Job creation 10% deduction']
    }
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
    benefits: ['Presumptive tax option', 'Simplified filing', 'Small company relief'],
    taxRules: {
      citRate: '0% (small company) or 1% presumptive',
      vatStatus: 'Optional registration <₦25m',
      specialIncentives: ['Simplified record-keeping', 'Reduced audit risk']
    }
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
      vatableSales: 0,
      vatablePurchases: 40000000,
    },
    benefits: ['CIT exemption', 'Duty-free imports', 'No WHT on dividends'],
    taxRules: {
      citRate: '0% on exports',
      vatStatus: 'Zero-rated exports',
      specialIncentives: ['NEPZA/OGFZA registration', 'Repatriation guaranteed', 'One-stop approval']
    }
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
      vatableSales: 0,
      vatablePurchases: 25000000,
    },
    benefits: ['VAT zero-rating', 'EEG eligibility', 'Forex retention'],
    taxRules: {
      citRate: 'Reduced on export profits',
      vatStatus: 'Zero-rated',
      specialIncentives: ['EEG up to 30%', 'Duty drawback', 'Export Development Fund']
    }
  },
  {
    id: 'fintech',
    name: 'Fintech',
    icon: CreditCard,
    description: 'Digital financial services taxation',
    presets: {
      turnover: 100000000,
      expenses: 60000000,
      fixedAssets: 20000000,
      vatableSales: 100000000,
      vatablePurchases: 30000000,
    },
    benefits: ['NSA labeling eligible', 'R&D deductions', 'EDTI credits'],
    taxRules: {
      citRate: '25% or Pioneer Status',
      vatStatus: 'Standard 7.5% on fees',
      specialIncentives: ['CBN sandbox benefits', 'Platform development deductions']
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Stethoscope,
    description: 'Medical services exemptions',
    presets: {
      turnover: 50000000,
      expenses: 35000000,
      fixedAssets: 40000000,
      vatableSales: 0,
      vatablePurchases: 15000000,
    },
    benefits: ['VAT-exempt services', 'Equipment duty waiver', 'Pioneer Status'],
    taxRules: {
      citRate: '25% or Pioneer Status',
      vatStatus: 'Exempt (medical services)',
      specialIncentives: ['Duty-free medical equipment', 'NAFDAC fast-track']
    }
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    icon: Building,
    description: 'Property development & rental income',
    presets: {
      turnover: 150000000,
      expenses: 100000000,
      fixedAssets: 500000000,
      vatableSales: 150000000,
      vatablePurchases: 80000000,
    },
    benefits: ['Capital allowances', 'Interest deductions', 'CGT deferral'],
    taxRules: {
      citRate: '25% on rental income',
      vatStatus: 'Exempt (residential), Standard (commercial)',
      specialIncentives: ['10% CGT on disposal', 'Rollover relief available']
    }
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: Truck,
    description: 'Transportation and warehousing',
    presets: {
      turnover: 80000000,
      expenses: 55000000,
      fixedAssets: 60000000,
      vatableSales: 80000000,
      vatablePurchases: 40000000,
    },
    benefits: ['Vehicle depreciation', 'Fuel deductions', 'Export logistics incentives'],
    taxRules: {
      citRate: '25% standard',
      vatStatus: 'Standard 7.5%',
      specialIncentives: ['Accelerated vehicle depreciation', 'Export logistics zero-rated']
    }
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
      <PopoverContent className="w-96 p-0 glass-frosted" align="start">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Choose Your Sector</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Apply sector-specific tax presets and incentives
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
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
                    {sector.taxRules.citRate && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {sector.taxRules.citRate}
                      </Badge>
                    )}
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
