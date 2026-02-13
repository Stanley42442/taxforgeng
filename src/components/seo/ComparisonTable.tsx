import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  pre2026: string | boolean;
  post2026: string | boolean;
  highlight?: boolean;
}

interface ComparisonTableProps {
  title?: string;
  rows: ComparisonRow[];
  className?: string;
}

/**
 * Comparison Table Component
 * Shows 2026 vs Pre-2026 tax rules side by side
 */
export const ComparisonTable = ({
  title = 'What Changed in 2026?',
  rows,
  className = '',
}: ComparisonTableProps) => {
  const renderValue = (value: string | boolean, isNew = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle2 className={`h-5 w-5 ${isNew ? 'text-success' : 'text-muted-foreground'}`} />
      ) : (
        <XCircle className="h-5 w-5 text-destructive" />
      );
    }
    return <span className={isNew ? 'font-semibold text-success' : ''}>{value}</span>;
  };

  return (
    <div className={`glass-frosted rounded-2xl overflow-hidden ${className}`}>
      {title && (
        <div className="p-4 md:p-6 border-b border-border/50">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="p-4 text-left text-sm font-semibold text-foreground">Feature</th>
              <th className="p-4 text-center text-sm font-semibold text-muted-foreground">
                Pre-2026
              </th>
              <th className="p-4 text-center">
                <ArrowRight className="h-4 w-4 text-primary mx-auto" />
              </th>
              <th className="p-4 text-center text-sm font-semibold text-primary">
                2026 Rules
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-border/30 last:border-0 ${
                  row.highlight ? 'bg-success/5' : ''
                }`}
              >
                <td className="p-4 text-sm text-foreground">
                  {row.feature}
                  {row.highlight && (
                    <span className="ml-2 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </td>
                <td className="p-4 text-center text-sm text-muted-foreground">
                  {renderValue(row.pre2026)}
                </td>
                <td className="p-4 text-center">
                  <ArrowRight className="h-3 w-3 text-border mx-auto" />
                </td>
                <td className="p-4 text-center text-sm">
                  {renderValue(row.post2026, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Pre-built comparison data for common use cases
export const PIT_COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Tax-Free Threshold', pre2026: '₦300,000', post2026: '₦800,000', highlight: true },
  { feature: 'Maximum Rate', pre2026: '24%', post2026: '25%' },
  { feature: 'CRA (Consolidated Relief)', pre2026: true, post2026: false },
  { feature: 'Rent Relief (20%, max ₦500k)', pre2026: false, post2026: true, highlight: true },
  { feature: 'Pension Deduction', pre2026: '8%', post2026: '8%' },
  { feature: 'NHF Deduction', pre2026: '2.5%', post2026: '2.5%' },
  { feature: 'NHIS Deduction', pre2026: false, post2026: true, highlight: true },
];

export const CIT_COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Standard Rate', pre2026: '30%', post2026: '30%' },
  { feature: 'Small Company Exemption', pre2026: '₦25M turnover', post2026: '₦50M turnover + ₦250M assets (excl. professional services)', highlight: true },
  { feature: 'Small Company Rate', pre2026: '0%', post2026: '0%' },
  { feature: 'Medium Company Tier (20%)', pre2026: '₦25M-₦100M turnover', post2026: 'ABOLISHED', highlight: true },
  { feature: 'TET (Tertiary Education Tax)', pre2026: '3%', post2026: 'Replaced by Dev Levy' },
  { feature: 'Development Levy', pre2026: false, post2026: '4%', highlight: true },
];
