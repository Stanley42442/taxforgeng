export interface PartnerTheme {
  brandName?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  showPoweredBy: boolean;
}

export const defaultTheme: PartnerTheme = {
  primaryColor: '#10b981',
  secondaryColor: '#3b82f6',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '12',
  fontFamily: 'Inter',
  showPoweredBy: true,
};

export type TabId = 'business' | 'personal' | 'vat';

export interface PITBand {
  label: string;
  lower: number;
  upper: number | null;
  rate: number;
}

export const PIT_BANDS: PITBand[] = [
  { label: 'First ₦2.2M', lower: 0, upper: 2200000, rate: 0.15 },
  { label: 'Next ₦9M', lower: 2200000, upper: 11200000, rate: 0.18 },
  { label: 'Next ₦13M', lower: 11200000, upper: 24200000, rate: 0.21 },
  { label: 'Next ₦25M', lower: 24200000, upper: 49200000, rate: 0.23 },
  { label: 'Above ₦49.2M', lower: 49200000, upper: null, rate: 0.25 },
];

export const PIT_EXEMPTION = 800000;
export const RENT_RELIEF_CAP = 500000;

export interface BandBreakdown {
  label: string;
  rate: string;
  taxable: number;
  tax: number;
}

export function calculatePITBands(taxableAmount: number): { bands: BandBreakdown[]; total: number } {
  const bands: BandBreakdown[] = [];
  let remaining = taxableAmount;
  let totalTax = 0;

  for (const band of PIT_BANDS) {
    if (remaining <= 0) break;
    const width = band.upper !== null ? band.upper - band.lower : Infinity;
    const taxable = Math.min(remaining, width);
    const tax = taxable * band.rate;
    bands.push({
      label: band.label,
      rate: `${(band.rate * 100).toFixed(0)}%`,
      taxable: Math.round(taxable),
      tax: Math.round(tax),
    });
    totalTax += tax;
    remaining -= taxable;
  }

  return { bands, total: Math.round(totalTax) };
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatWithCommas = (num: number): string => {
  if (!num) return '';
  return num.toLocaleString('en-NG');
};

export const parseCurrencyInput = (value: string): number => {
  const numeric = value.replace(/[^0-9]/g, '');
  return numeric ? Number(numeric) : 0;
};

export function getStyles(theme: PartnerTheme, borderRadius: number) {
  return {
    inputGroup: { marginBottom: '16px' } as React.CSSProperties,
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px',
      color: theme.textColor,
    } as React.CSSProperties,
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: `${borderRadius / 2}px`,
      border: '1px solid #e5e7eb',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    button: {
      width: '100%',
      padding: '14px',
      borderRadius: `${borderRadius / 2}px`,
      backgroundColor: theme.primaryColor,
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    } as React.CSSProperties,
    resultCard: {
      marginTop: '24px',
      padding: '20px',
      borderRadius: `${borderRadius / 2}px`,
      backgroundColor: `${theme.primaryColor}10`,
      border: `1px solid ${theme.primaryColor}30`,
    } as React.CSSProperties,
    resultTitle: {
      fontSize: '14px',
      color: theme.textColor,
      opacity: 0.7,
      marginBottom: '4px',
    } as React.CSSProperties,
    resultValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.primaryColor,
    } as React.CSSProperties,
    resultGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '16px',
    } as React.CSSProperties,
    resultItem: {
      padding: '10px',
      borderRadius: `${borderRadius / 3}px`,
      backgroundColor: theme.backgroundColor,
      border: '1px solid #e5e7eb',
    } as React.CSSProperties,
    resultItemLabel: {
      fontSize: '12px',
      color: theme.textColor,
      opacity: 0.6,
    } as React.CSSProperties,
    resultItemValue: {
      fontSize: '15px',
      fontWeight: '600',
      color: theme.textColor,
    } as React.CSSProperties,
    ctaLink: {
      display: 'block',
      marginTop: '16px',
      textAlign: 'center' as const,
      fontSize: '13px',
      color: theme.primaryColor,
      textDecoration: 'none',
      fontWeight: '500',
    } as React.CSSProperties,
    bandRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      fontSize: '13px',
      borderBottom: '1px solid #f3f4f6',
    } as React.CSSProperties,
  };
}
