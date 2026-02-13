import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/individualTaxCalculations";

interface TaxBand {
  label: string;
  lowerBound: number;
  upperBound: number;
  rate: number;
  taxableAmount: number;
  taxCollected: number;
}

interface TaxBandVisualizationProps {
  taxableIncome: number;
  use2026Rules: boolean;
  className?: string;
}

const PIT_BANDS_2026 = [
  { threshold: 800000, rate: 0 },
  { threshold: 3000000, rate: 0.15 },
  { threshold: 12000000, rate: 0.18 },
  { threshold: 25000000, rate: 0.21 },
  { threshold: 50000000, rate: 0.23 },
  { threshold: Infinity, rate: 0.25 },
];

const PIT_BANDS_PRE2026 = [
  { threshold: 300000, rate: 0.07 },
  { threshold: 600000, rate: 0.11 },
  { threshold: 1100000, rate: 0.15 },
  { threshold: 1600000, rate: 0.19 },
  { threshold: 3200000, rate: 0.21 },
  { threshold: Infinity, rate: 0.24 },
];

const BAND_COLORS = [
  'hsl(var(--success))',
  'hsl(142, 71%, 45%)',
  'hsl(48, 96%, 53%)',
  'hsl(36, 100%, 50%)',
  'hsl(16, 100%, 50%)',
  'hsl(0, 84%, 50%)',
];

function computeBands(taxableIncome: number, use2026Rules: boolean): TaxBand[] {
  const rawBands = use2026Rules ? PIT_BANDS_2026 : PIT_BANDS_PRE2026;
  let remaining = taxableIncome;
  let prev = 0;
  const bands: TaxBand[] = [];

  for (const band of rawBands) {
    const bandWidth = band.threshold === Infinity ? Infinity : band.threshold - prev;
    const taxable = Math.min(Math.max(remaining, 0), bandWidth);
    bands.push({
      label: `${(prev / 1e6).toFixed(1)}M - ${band.threshold === Infinity ? '∞' : `${(band.threshold / 1e6).toFixed(1)}M`}`,
      lowerBound: prev,
      upperBound: band.threshold,
      rate: band.rate * 100,
      taxableAmount: taxable,
      taxCollected: taxable * band.rate,
    });
    remaining -= taxable;
    prev = band.threshold;
  }

  return bands;
}

export const TaxBandVisualization = ({ taxableIncome, use2026Rules, className = '' }: TaxBandVisualizationProps) => {
  const bands = computeBands(taxableIncome, use2026Rules);
  const maxBandWidth = Math.max(...bands.map(b => {
    const width = b.upperBound === Infinity ? b.taxableAmount : (b.upperBound - b.lowerBound);
    return width;
  }));

  if (taxableIncome <= 0) return null;

  const totalTax = bands.reduce((sum, b) => sum + b.taxCollected, 0);

  return (
    <Card className={`glass-frosted border-0 shadow-futuristic ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Progressive Tax Bands
          <Badge variant="outline" className="text-xs ml-auto">
            {use2026Rules ? '2026 Rules' : 'Pre-2026'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bands.map((band, i) => {
          const bandWidth = band.upperBound === Infinity ? (band.taxableAmount || maxBandWidth * 0.3) : (band.upperBound - band.lowerBound);
          const fillPercent = bandWidth > 0 ? Math.min((band.taxableAmount / bandWidth) * 100, 100) : 0;

          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  ₦{band.label} <span className="text-foreground font-semibold">({band.rate}%)</span>
                </span>
                <span className="text-muted-foreground">
                  {band.taxableAmount > 0 ? formatCurrency(band.taxCollected) : '—'}
                </span>
              </div>
              <div className="relative h-7 bg-muted/50 rounded-md overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-md flex items-center justify-end pr-2"
                  style={{ backgroundColor: BAND_COLORS[i] || BAND_COLORS[5] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(fillPercent, 0)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
                >
                  {fillPercent > 20 && (
                    <motion.span
                      className="text-[10px] font-semibold text-white drop-shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.12 + 0.5 }}
                    >
                      {formatCurrency(band.taxableAmount)}
                    </motion.span>
                  )}
                </motion.div>
                {fillPercent <= 20 && band.taxableAmount > 0 && (
                  <span className="absolute inset-y-0 left-2 flex items-center text-[10px] text-muted-foreground font-medium">
                    {formatCurrency(band.taxableAmount)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Total summary */}
        <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Total Tax from Bands</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(totalTax)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
