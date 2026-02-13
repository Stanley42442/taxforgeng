import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Truck,
  Leaf,
  Droplet,
  Utensils,
  GraduationCap,
  HardHat,
  Store,
  AlertCircle,
  Check
} from "lucide-react";

export interface SectorTaxRules {
  citRate?: number;
  vatStatus?: 'standard' | 'zero' | 'exempt' | 'reduced';
  vatRate?: number;
  edtiRate?: number;
  hydrocarbonTaxMin?: number;
  hydrocarbonTaxMax?: number;
  environmentalSurcharge?: number;
  presumptiveMin?: number;
  presumptiveMax?: number;
  whtRate?: number;
  rentReliefMax?: number;
  rentReliefPercent?: number;
  donationCap?: number;
  specialIncentives?: string[];
  pioneerStatus?: boolean;
  greenHireDeduction?: number;
}

export interface SectorMyth {
  myth: string;
  truth: string;
}

interface SectorPreset {
  id: string;
  name: string;
  icon: typeof Cpu;
  description: string;
  benefits: string[];
  taxRules: SectorTaxRules;
  myths: SectorMyth[];
  formFields?: string[]; // Which fields to show/hide for this sector
}

// Sector presets with ONLY tax rules - no numerical pre-fills
const SECTOR_PRESETS: SectorPreset[] = [
  {
    id: 'tech',
    name: 'Tech/NSA',
    icon: Cpu,
    description: 'NITDA Software Accreditation benefits',
    benefits: ['5% EDTI tax credit', 'R&D deductions', 'IP income benefits'],
    taxRules: {
      citRate: 0,
      vatStatus: 'standard',
      vatRate: 7.5,
      edtiRate: 5,
      pioneerStatus: true,
      specialIncentives: ['NSA labeling (<₦1.5B)', 'EDTI 5% credit', 'R&D 120% deduction']
    },
    myths: [
      { myth: 'All tech companies are tax-free', truth: 'Only NSA-approved software companies qualify for reduced rates' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Wheat,
    description: '5-year CIT exemption for primary production',
    benefits: ['CIT holiday (5 years)', 'VAT zero-rating', 'Input VAT credits'],
    taxRules: {
      citRate: 0,
      vatStatus: 'zero',
      vatRate: 0,
      specialIncentives: ['Duty-free equipment', 'Accelerated depreciation', 'Export incentives']
    },
    myths: [
      { myth: 'Farm income is never taxed', truth: 'CIT holiday is 5 years only for primary production' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    description: 'Asset investment & wage deductions',
    benefits: ['10% fixed asset credit', 'Wage deductions', 'Accelerated depreciation'],
    taxRules: {
      citRate: 30,
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Investment Tax Credit 10%', 'Local raw material bonus 10%', 'Job creation 10% deduction']
    },
    myths: [
      { myth: 'Manufacturing always qualifies for pioneer status', truth: 'Pioneer status requires NIPC approval and specific conditions' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'retail',
    name: 'Retail/SME',
    icon: ShoppingCart,
    description: 'Presumptive tax option for small businesses',
    benefits: ['Presumptive tax option', 'Simplified filing', 'Small company relief'],
    taxRules: {
      citRate: 0,
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Simplified record-keeping', 'Reduced audit risk']
    },
    myths: [
      { myth: 'Small shops don\'t need to register for tax', truth: 'All businesses must register, but may qualify for simplified filing' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'freezone',
    name: 'Free Zone',
    icon: Globe,
    description: 'Export-focused tax incentives',
    benefits: ['CIT exemption', 'Duty-free imports', 'No WHT on dividends'],
    taxRules: {
      citRate: 0,
      vatStatus: 'zero',
      vatRate: 0,
      specialIncentives: ['NEPZA/OGFZA registration', 'Repatriation guaranteed', 'One-stop approval']
    },
    myths: [
      { myth: 'Free zone companies pay no tax ever', truth: 'Exemptions apply to qualifying exports; local sales may be taxable' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'export',
    name: 'Export Business',
    icon: Package,
    description: 'Export expansion grant benefits',
    benefits: ['VAT zero-rating', 'EEG eligibility', 'Forex retention'],
    taxRules: {
      citRate: 30,
      vatStatus: 'zero',
      vatRate: 0,
      specialIncentives: ['EEG up to 30%', 'Duty drawback', 'Export Development Fund']
    },
    myths: [
      { myth: 'All export income is tax-free', truth: 'CIT still applies, but VAT is zero-rated for qualifying exports' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'fintech',
    name: 'Fintech',
    icon: CreditCard,
    description: 'Digital financial services taxation',
    benefits: ['NSA labeling eligible', 'R&D deductions', 'EDTI credits'],
    taxRules: {
      citRate: 30,
      vatStatus: 'standard',
      vatRate: 7.5,
      edtiRate: 5,
      pioneerStatus: true,
      specialIncentives: ['CBN sandbox benefits', 'Platform development deductions']
    },
    myths: [
      { myth: 'Fintech companies are always exempt from VAT', truth: 'Financial service fees are VATable; some interest income may be exempt' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Stethoscope,
    description: 'Medical services exemptions',
    benefits: ['VAT-exempt services', 'Equipment duty waiver', 'Pioneer Status'],
    taxRules: {
      citRate: 30,
      vatStatus: 'exempt',
      vatRate: 0,
      pioneerStatus: true,
      specialIncentives: ['Duty-free medical equipment', 'NAFDAC fast-track']
    },
    myths: [
      { myth: 'All healthcare is tax-free', truth: 'Medical services are VAT-exempt, but CIT still applies' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    icon: Building,
    description: 'Property development & rental income',
    benefits: ['Capital allowances', 'Interest deductions', 'CGT deferral'],
    taxRules: {
      citRate: 30,
      vatStatus: 'standard',
      vatRate: 7.5,
      whtRate: 10,
      specialIncentives: ['10% CGT on disposal', 'Rollover relief available']
    },
    myths: [
      { myth: 'Rental income is only taxed when withdrawn', truth: 'Rental income is taxed when earned; 10% WHT applies' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases', 'rentalIncome']
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: Truck,
    description: 'Transportation and warehousing',
    benefits: ['Vehicle depreciation', 'Fuel deductions', 'Export logistics incentives'],
    taxRules: {
      citRate: 30,
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Accelerated vehicle depreciation', 'Export logistics zero-rated']
    },
    myths: [
      { myth: 'Transport is always VAT-exempt', truth: 'Only public passenger transport is exempt; freight is VATable' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'renewables',
    name: 'Renewables/Green Energy',
    icon: Leaf,
    description: 'Eco-investment incentives and green technology',
    benefits: ['5% EDTI on eco-investments', 'Zero VAT on EVs/solar', '50% green tech hire deduction'],
    taxRules: {
      citRate: 30,
      vatStatus: 'zero',
      vatRate: 0,
      edtiRate: 5,
      greenHireDeduction: 50,
      specialIncentives: ['EV import duty exemption', 'Solar equipment zero-rating', 'Green bond incentives']
    },
    myths: [
      { myth: 'All green investments are tax-free', truth: 'Only qualifying eco-investments get 5% EDTI credit, not full exemption' },
      { myth: 'Solar panels have no import duty', truth: 'Zero-rated for VAT, but import duty still applies unless exempted' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'oil_gas',
    name: 'Oil & Gas/Hydrocarbons',
    icon: Droplet,
    description: 'Dual taxation with Hydrocarbon Tax and CIT',
    benefits: ['Gas investment credits', 'Accelerated depreciation', 'Cost recovery provisions'],
    taxRules: {
      citRate: 30,
      hydrocarbonTaxMin: 15,
      hydrocarbonTaxMax: 30,
      environmentalSurcharge: 5,
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Gas flare penalty exemptions', 'Deep offshore incentives', 'Marginal field incentives']
    },
    myths: [
      { myth: 'Oil companies pay 85% tax', truth: 'Legacy PPT (50-85%) is being phased out; new Hydrocarbon Tax is 15-30%' },
      { myth: 'All oil income goes to government', truth: 'Cost recovery and profit sharing determine actual government take' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'hospitality',
    name: 'Hospitality/Tourism',
    icon: Utensils,
    description: 'Seasonal business incentives and presumptive options',
    benefits: ['Presumptive tax for small operators', 'VAT-exempt transport services', 'Seasonal wage deductions'],
    taxRules: {
      citRate: 30,
      vatStatus: 'standard',
      vatRate: 7.5,
      specialIncentives: ['Tourism levy credits', 'Hotel equipment duty waivers', 'Local sourcing incentives']
    },
    myths: [
      { myth: 'Hotels don\'t pay VAT', truth: 'Accommodation is VATable at 7.5%; only passenger transport is exempt' },
      { myth: 'Tips are tax-free', truth: 'Tips are taxable income for employees under PAYE' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases']
  },
  {
    id: 'education_health',
    name: 'Education/Health Services',
    icon: GraduationCap,
    description: 'Social sector exemptions and reduced rates',
    benefits: ['Zero VAT on educational materials', '0% CIT for small institutions', '10% donation deduction cap'],
    taxRules: {
      citRate: 0,
      vatStatus: 'exempt',
      vatRate: 0,
      donationCap: 10,
      specialIncentives: ['Scholarship deductions', 'Research grants exemption', 'Equipment duty waivers']
    },
    myths: [
      { myth: 'All schools are tax-exempt', truth: 'Only qualifying small educational institutions get 0% CIT' },
      { myth: 'Private schools pay no tax', truth: 'For-profit schools pay standard CIT; VAT exemption applies to tuition' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatablePurchases']
  },
  {
    id: 'construction',
    name: 'Construction',
    icon: HardHat,
    description: 'Property development and contract taxation',
    benefits: ['WHT 5-10% on contracts', 'Rent relief up to ₦500k', 'CGT home sale exemptions'],
    taxRules: {
      citRate: 30,
      vatStatus: 'standard',
      vatRate: 7.5,
      whtRate: 5,
      rentReliefMax: 500000,
      rentReliefPercent: 20,
      specialIncentives: ['Infrastructure bond incentives', 'Affordable housing credits', 'Stamp duty reductions']
    },
    myths: [
      { myth: 'Selling your home is always tax-free', truth: 'Principal residence exemption has conditions and limits' },
      { myth: 'Construction contracts avoid withholding tax', truth: '5% WHT applies to all construction contracts' }
    ],
    formFields: ['turnover', 'expenses', 'fixedAssets', 'vatableSales', 'vatablePurchases', 'rentPaid']
  },
  {
    id: 'informal',
    name: 'Informal/Micro-Enterprise',
    icon: Store,
    description: 'Simplified compliance for unregistered businesses',
    benefits: ['Location-based flat taxes (₦5k-50k)', 'Formalization incentives', 'VAT exemption'],
    taxRules: {
      citRate: 0,
      vatStatus: 'exempt',
      vatRate: 0,
      presumptiveMin: 5000,
      presumptiveMax: 50000,
      specialIncentives: ['CAC registration assistance', 'Business development support', 'Microfinance access']
    },
    myths: [
      { myth: 'Small traders don\'t need to pay any tax', truth: 'Presumptive taxes (₦5k-50k) still apply based on location and activity' },
      { myth: 'Unregistered businesses are illegal', truth: 'Registration is encouraged but informal trading is common and taxable' }
    ],
    formFields: ['turnover', 'expenses']
  },
];

interface SectorPresetsProps {
  onApplyPreset: (taxRules: SectorTaxRules, sectorId: string, formFields?: string[]) => void;
  selectedSector?: string;
}

export const SectorPresets = ({ onApplyPreset, selectedSector }: SectorPresetsProps) => {
  const [open, setOpen] = useState(false);

  const handleSelectSector = (sector: SectorPreset) => {
    onApplyPreset(sector.taxRules, sector.id, sector.formFields);
    setOpen(false);
  };

  const currentSector = selectedSector ? SECTOR_PRESETS.find(s => s.id === selectedSector) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          {currentSector ? currentSector.name : 'Select Sector'}
          {currentSector && <Check className="h-3 w-3 text-success" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0 glass-frosted" align="start">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Choose Your Sector</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Apply sector-specific tax rules and exemptions (no data pre-filling)
          </p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {SECTOR_PRESETS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => handleSelectSector(sector)}
              className={`w-full p-3 hover:bg-secondary/50 transition-colors text-left border-b border-border last:border-0 ${
                selectedSector === sector.id ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  selectedSector === sector.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  <sector.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{sector.name}</span>
                    {selectedSector === sector.id && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        Active
                      </Badge>
                    )}
                    {sector.taxRules.citRate !== undefined && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        CIT: {sector.taxRules.citRate}%
                      </Badge>
                    )}
                    {sector.taxRules.vatStatus && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] px-1.5 py-0 ${
                          sector.taxRules.vatStatus === 'zero' ? 'border-success text-success' :
                          sector.taxRules.vatStatus === 'exempt' ? 'border-info text-info' : ''
                        }`}
                      >
                        VAT: {sector.taxRules.vatStatus}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {sector.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {sector.benefits.slice(0, 3).map((benefit, i) => (
                      <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                  {/* Myth-busting tooltip */}
                  {sector.myths.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center gap-1 text-[10px] text-warning cursor-help">
                          <AlertCircle className="h-3 w-3" />
                          <span>Common myth</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs p-3">
                        <p className="font-medium text-destructive text-xs mb-1">
                          ❌ Myth: {sector.myths[0].myth}
                        </p>
                        <p className="text-xs text-success">
                          ✓ Truth: {sector.myths[0].truth}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { SECTOR_PRESETS };
export type { SectorPreset };
