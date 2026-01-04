import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Building2, Briefcase } from "lucide-react";

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

interface EmbeddableCalculatorProps {
  theme?: PartnerTheme;
  onCalculate?: (result: any) => void;
}

const defaultTheme: PartnerTheme = {
  primaryColor: '#10b981',
  secondaryColor: '#3b82f6',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '12',
  fontFamily: 'Inter',
  showPoweredBy: true
};

export const EmbeddableCalculator = ({ theme = defaultTheme, onCalculate }: EmbeddableCalculatorProps) => {
  const [entityType, setEntityType] = useState<'business_name' | 'company'>('business_name');
  const [turnover, setTurnover] = useState('');
  const [expenses, setExpenses] = useState('');
  const [fixedAssets, setFixedAssets] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const styles = {
    container: {
      fontFamily: theme.fontFamily || 'Inter, sans-serif',
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      borderRadius: `${theme.borderRadius}px`,
      padding: '24px',
      maxWidth: '480px',
      margin: '0 auto',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    logo: {
      height: '40px',
      width: 'auto',
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: theme.textColor,
    },
    iconContainer: {
      backgroundColor: theme.primaryColor,
      padding: '10px',
      borderRadius: `${parseInt(theme.borderRadius) / 2}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    entitySelector: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '20px',
    },
    entityButton: (selected: boolean) => ({
      padding: '16px',
      borderRadius: `${parseInt(theme.borderRadius) / 2}px`,
      border: `2px solid ${selected ? theme.primaryColor : '#e5e7eb'}`,
      backgroundColor: selected ? `${theme.primaryColor}10` : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center' as const,
    }),
    entityIcon: {
      marginBottom: '8px',
    },
    entityLabel: {
      fontSize: '14px',
      fontWeight: '500',
    },
    inputGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px',
      color: theme.textColor,
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: `${parseInt(theme.borderRadius) / 2}px`,
      border: '1px solid #e5e7eb',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    button: {
      width: '100%',
      padding: '14px',
      borderRadius: `${parseInt(theme.borderRadius) / 2}px`,
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
    },
    resultCard: {
      marginTop: '24px',
      padding: '20px',
      borderRadius: `${parseInt(theme.borderRadius) / 2}px`,
      backgroundColor: `${theme.primaryColor}10`,
      border: `1px solid ${theme.primaryColor}30`,
    },
    resultTitle: {
      fontSize: '14px',
      color: theme.textColor,
      opacity: 0.7,
      marginBottom: '4px',
    },
    resultValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: theme.primaryColor,
    },
    resultGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginTop: '16px',
    },
    resultItem: {
      padding: '12px',
      borderRadius: `${parseInt(theme.borderRadius) / 3}px`,
      backgroundColor: theme.backgroundColor,
      border: '1px solid #e5e7eb',
    },
    resultItemLabel: {
      fontSize: '12px',
      color: theme.textColor,
      opacity: 0.6,
    },
    resultItemValue: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.textColor,
    },
    poweredBy: {
      marginTop: '20px',
      textAlign: 'center' as const,
      fontSize: '12px',
      color: theme.textColor,
      opacity: 0.5,
    },
    poweredByLink: {
      color: theme.primaryColor,
      textDecoration: 'none',
      fontWeight: '500',
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const turnoverNum = Number(turnover) || 0;
      const expensesNum = Number(expenses) || 0;
      const assetsNum = Number(fixedAssets) || 0;
      const taxableIncome = Math.max(0, turnoverNum - expensesNum);

      let pit = 0;
      let cit = 0;
      let developmentLevy = 0;

      if (entityType === 'company') {
        const isSmallCompany = turnoverNum <= 50000000 && assetsNum <= 250000000;
        if (isSmallCompany) {
          cit = 0;
        } else {
          cit = taxableIncome * 0.25;
        }
        developmentLevy = taxableIncome * 0.04;
      } else {
        const exemption = 800000;
        const taxableAmount = Math.max(0, taxableIncome - exemption);
        
        if (taxableAmount <= 300000) {
          pit = taxableAmount * 0.15;
        } else if (taxableAmount <= 600000) {
          pit = 300000 * 0.15 + (taxableAmount - 300000) * 0.19;
        } else if (taxableAmount <= 1100000) {
          pit = 300000 * 0.15 + 300000 * 0.19 + (taxableAmount - 600000) * 0.21;
        } else {
          pit = 300000 * 0.15 + 300000 * 0.19 + 500000 * 0.21 + (taxableAmount - 1100000) * 0.25;
        }
      }

      const totalTax = pit + cit + developmentLevy;
      const effectiveRate = turnoverNum > 0 ? (totalTax / turnoverNum) * 100 : 0;

      const calculationResult = {
        grossIncome: turnoverNum,
        taxableIncome,
        pit: Math.round(pit),
        cit: Math.round(cit),
        developmentLevy: Math.round(developmentLevy),
        totalTaxPayable: Math.round(totalTax),
        effectiveRate: effectiveRate.toFixed(2),
        entityType: entityType === 'company' ? 'Limited Company' : 'Business Name',
      };

      setResult(calculationResult);
      onCalculate?.(calculationResult);
      setIsCalculating(false);
    }, 500);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {theme.logoUrl ? (
          <img src={theme.logoUrl} alt={theme.brandName || 'Logo'} style={styles.logo} />
        ) : (
          <div style={styles.iconContainer}>
            <Calculator size={20} color="#ffffff" />
          </div>
        )}
        <span style={styles.title}>
          {theme.brandName || 'Tax Calculator'}
        </span>
      </div>

      {/* Entity Type Selector */}
      <div style={styles.entitySelector}>
        <button
          style={styles.entityButton(entityType === 'business_name')}
          onClick={() => setEntityType('business_name')}
        >
          <Briefcase 
            size={24} 
            color={entityType === 'business_name' ? theme.primaryColor : '#9ca3af'} 
            style={styles.entityIcon}
          />
          <div style={styles.entityLabel}>Business Name</div>
        </button>
        <button
          style={styles.entityButton(entityType === 'company')}
          onClick={() => setEntityType('company')}
        >
          <Building2 
            size={24} 
            color={entityType === 'company' ? theme.primaryColor : '#9ca3af'} 
            style={styles.entityIcon}
          />
          <div style={styles.entityLabel}>Company (LTD)</div>
        </button>
      </div>

      {/* Input Fields */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>Annual Turnover (₦)</label>
        <input
          type="number"
          style={styles.input}
          placeholder="e.g., 15,000,000"
          value={turnover}
          onChange={(e) => setTurnover(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Deductible Expenses (₦)</label>
        <input
          type="number"
          style={styles.input}
          placeholder="e.g., 3,000,000"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {entityType === 'company' && (
        <div style={styles.inputGroup}>
          <label style={styles.label}>Fixed Assets (₦) - For small company check</label>
          <input
            type="number"
            style={styles.input}
            placeholder="e.g., 100,000,000"
            value={fixedAssets}
            onChange={(e) => setFixedAssets(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      )}

      {/* Calculate Button */}
      <button
        style={{
          ...styles.button,
          opacity: isCalculating ? 0.7 : 1,
        }}
        onClick={calculate}
        disabled={isCalculating}
      >
        <Calculator size={18} />
        {isCalculating ? 'Calculating...' : 'Calculate Tax'}
      </button>

      {/* Results */}
      {result && (
        <div style={styles.resultCard}>
          <div style={styles.resultTitle}>Total Tax Payable</div>
          <div style={styles.resultValue}>{formatCurrency(result.totalTaxPayable)}</div>
          
          <div style={styles.resultGrid}>
            <div style={styles.resultItem}>
              <div style={styles.resultItemLabel}>Taxable Income</div>
              <div style={styles.resultItemValue}>{formatCurrency(result.taxableIncome)}</div>
            </div>
            <div style={styles.resultItem}>
              <div style={styles.resultItemLabel}>Effective Rate</div>
              <div style={styles.resultItemValue}>{result.effectiveRate}%</div>
            </div>
            {result.pit > 0 && (
              <div style={styles.resultItem}>
                <div style={styles.resultItemLabel}>PIT</div>
                <div style={styles.resultItemValue}>{formatCurrency(result.pit)}</div>
              </div>
            )}
            {result.cit > 0 && (
              <div style={styles.resultItem}>
                <div style={styles.resultItemLabel}>CIT</div>
                <div style={styles.resultItemValue}>{formatCurrency(result.cit)}</div>
              </div>
            )}
            {result.developmentLevy > 0 && (
              <div style={styles.resultItem}>
                <div style={styles.resultItemLabel}>Dev. Levy</div>
                <div style={styles.resultItemValue}>{formatCurrency(result.developmentLevy)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Powered By */}
      {theme.showPoweredBy && (
        <div style={styles.poweredBy}>
          Powered by{' '}
          <a href="https://taxforge.ng" target="_blank" rel="noopener noreferrer" style={styles.poweredByLink}>
            TaxForge NG
          </a>
        </div>
      )}
    </div>
  );
};

export default EmbeddableCalculator;
