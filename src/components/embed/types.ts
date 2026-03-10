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

/** Converts hex #RRGGBB to "R, G, B" for rgba() usage */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function getStyles(theme: PartnerTheme, borderRadius: number) {
  const rgb = hexToRgb(theme.primaryColor);

  return {
    inputGroup: { marginBottom: '16px' } as React.CSSProperties,
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      marginBottom: '6px',
      color: theme.textColor,
      opacity: 0.7,
      letterSpacing: '0.01em',
    } as React.CSSProperties,
    input: {
      width: '100%',
      padding: '11px 14px',
      borderRadius: `${Math.min(borderRadius / 2, 8)}px`,
      border: '1px solid #e2e8f0',
      fontSize: '15px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box' as const,
      backgroundColor: '#fafbfc',
    } as React.CSSProperties,
    inputFocus: {
      borderColor: theme.primaryColor,
      boxShadow: `0 0 0 3px rgba(${rgb}, 0.1)`,
      backgroundColor: '#ffffff',
    },
    button: {
      width: '100%',
      padding: '13px',
      borderRadius: `${Math.min(borderRadius / 2, 8)}px`,
      backgroundColor: theme.primaryColor,
      color: '#ffffff',
      fontSize: '15px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s, transform 0.1s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      letterSpacing: '0.01em',
    } as React.CSSProperties,
    resultCard: {
      marginTop: '24px',
      padding: '20px',
      borderRadius: `${Math.min(borderRadius / 2, 8)}px`,
      backgroundColor: theme.backgroundColor,
      border: '1px solid #e2e8f0',
    } as React.CSSProperties,
    resultTitle: {
      fontSize: '13px',
      color: theme.textColor,
      opacity: 0.6,
      marginBottom: '4px',
      fontWeight: '500',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    } as React.CSSProperties,
    resultValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: theme.primaryColor,
      letterSpacing: '-0.02em',
    } as React.CSSProperties,
    resultDivider: {
      height: '1px',
      backgroundColor: '#e2e8f0',
      margin: '16px 0',
    } as React.CSSProperties,
    resultGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginTop: '16px',
    } as React.CSSProperties,
    resultItem: {
      padding: '10px 12px',
      borderRadius: `${Math.min(borderRadius / 3, 6)}px`,
      backgroundColor: '#f8fafc',
      border: '1px solid #f1f5f9',
    } as React.CSSProperties,
    resultItemLabel: {
      fontSize: '11px',
      color: theme.textColor,
      opacity: 0.5,
      fontWeight: '500',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.04em',
      marginBottom: '2px',
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
      padding: '10px',
      borderRadius: `${Math.min(borderRadius / 3, 6)}px`,
      border: `1px solid rgba(${rgb}, 0.2)`,
      transition: 'background-color 0.2s',
    } as React.CSSProperties,
    bandRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '7px 0',
      fontSize: '13px',
      borderBottom: '1px solid #f1f5f9',
    } as React.CSSProperties,
    badgeSuccess: {
      marginTop: '12px',
      padding: '10px 14px',
      borderRadius: `${Math.min(borderRadius / 3, 6)}px`,
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      fontSize: '13px',
      color: '#166534',
      fontWeight: '500',
    } as React.CSSProperties,
    badgeWarning: {
      marginTop: '12px',
      padding: '10px 14px',
      borderRadius: `${Math.min(borderRadius / 3, 6)}px`,
      backgroundColor: '#fffbeb',
      border: '1px solid #fde68a',
      fontSize: '12px',
      color: '#92400e',
    } as React.CSSProperties,
  };
}
