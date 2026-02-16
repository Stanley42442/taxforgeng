import { useState } from "react";
import { Calculator, Building2, Briefcase } from "lucide-react";
import {
  PartnerTheme,
  PIT_EXEMPTION,
  RENT_RELIEF_CAP,
  calculatePITBands,
  formatCurrency,
  formatWithCommas,
  parseCurrencyInput,
  getStyles,
} from "./types";

interface BusinessTabProps {
  theme: PartnerTheme;
  borderRadius: number;
  onCalculate?: (result: any) => void;
}

const BusinessTab = ({ theme, borderRadius, onCalculate }: BusinessTabProps) => {
  const [entityType, setEntityType] = useState<'business_name' | 'company'>('business_name');
  const [turnover, setTurnover] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [fixedAssets, setFixedAssets] = useState(0);
  const [rentPaid, setRentPaid] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const s = getStyles(theme, borderRadius);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: number) => void) => {
    setter(parseCurrencyInput(e.target.value));
  };

  const calculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const taxableIncome = Math.max(0, turnover - expenses);
      let cit = 0;
      let developmentLevy = 0;
      let pitBands: ReturnType<typeof calculatePITBands> | null = null;
      let isSmallCompany = false;

      if (entityType === 'company') {
        isSmallCompany = turnover <= 50000000 && fixedAssets <= 250000000;
        if (!isSmallCompany) {
          cit = taxableIncome * 0.30;
        }
        developmentLevy = taxableIncome * 0.04;
      } else {
        // Business Name → PIT
        const rentRelief = Math.min(rentPaid * 0.2, RENT_RELIEF_CAP);
        const taxableAmount = Math.max(0, taxableIncome - PIT_EXEMPTION - rentRelief);
        pitBands = calculatePITBands(taxableAmount);
      }

      const totalTax = pitBands ? pitBands.total : Math.round(cit + developmentLevy);
      const effectiveRate = turnover > 0 ? ((totalTax / turnover) * 100).toFixed(2) : '0.00';

      const calculationResult = {
        entityType: entityType === 'company' ? 'Limited Company' : 'Business Name',
        grossIncome: turnover,
        taxableIncome,
        totalTaxPayable: totalTax,
        effectiveRate,
        cit: Math.round(cit),
        developmentLevy: Math.round(developmentLevy),
        isSmallCompany,
        pitBands: pitBands?.bands || null,
      };

      setResult(calculationResult);
      onCalculate?.(calculationResult);
      setIsCalculating(false);
    }, 400);
  };

  const entityBtn = (selected: boolean): React.CSSProperties => ({
    padding: '14px',
    borderRadius: `${borderRadius / 2}px`,
    border: `2px solid ${selected ? theme.primaryColor : '#e5e7eb'}`,
    backgroundColor: selected ? `${theme.primaryColor}10` : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  });

  return (
    <div>
      {/* Entity selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <button style={entityBtn(entityType === 'business_name')} onClick={() => setEntityType('business_name')}>
          <Briefcase size={22} color={entityType === 'business_name' ? theme.primaryColor : '#9ca3af'} style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '14px', fontWeight: '500' }}>Business Name</div>
        </button>
        <button style={entityBtn(entityType === 'company')} onClick={() => setEntityType('company')}>
          <Building2 size={22} color={entityType === 'company' ? theme.primaryColor : '#9ca3af'} style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '14px', fontWeight: '500' }}>Company (LTD)</div>
        </button>
      </div>

      {/* Inputs */}
      <div style={s.inputGroup}>
        <label style={s.label}>Annual Turnover</label>
        <input type="text" inputMode="numeric" style={s.input} placeholder="e.g., 15,000,000"
          value={turnover ? `₦${formatWithCommas(turnover)}` : ''}
          onChange={(e) => handleInput(e, setTurnover)}
          onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
        />
      </div>
      <div style={s.inputGroup}>
        <label style={s.label}>Deductible Expenses</label>
        <input type="text" inputMode="numeric" style={s.input} placeholder="e.g., 3,000,000"
          value={expenses ? `₦${formatWithCommas(expenses)}` : ''}
          onChange={(e) => handleInput(e, setExpenses)}
          onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
        />
      </div>

      {entityType === 'company' && (
        <div style={s.inputGroup}>
          <label style={s.label}>Fixed Assets (for small company check)</label>
          <input type="text" inputMode="numeric" style={s.input} placeholder="e.g., 100,000,000"
            value={fixedAssets ? `₦${formatWithCommas(fixedAssets)}` : ''}
            onChange={(e) => handleInput(e, setFixedAssets)}
            onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>
      )}

      {entityType === 'business_name' && (
        <div style={s.inputGroup}>
          <label style={s.label}>Annual Rent Paid (for rent relief)</label>
          <input type="text" inputMode="numeric" style={s.input} placeholder="e.g., 2,000,000"
            value={rentPaid ? `₦${formatWithCommas(rentPaid)}` : ''}
            onChange={(e) => handleInput(e, setRentPaid)}
            onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>
      )}

      {/* Calculate */}
      <button style={{ ...s.button, opacity: isCalculating ? 0.7 : 1 }} onClick={calculate} disabled={isCalculating}>
        <Calculator size={18} />
        {isCalculating ? 'Calculating...' : 'Calculate Tax'}
      </button>

      {/* Results */}
      {result && (
        <div style={s.resultCard}>
          <div style={s.resultTitle}>Total Tax Payable</div>
          <div style={s.resultValue}>{formatCurrency(result.totalTaxPayable)}</div>

          <div style={s.resultGrid}>
            <div style={s.resultItem}>
              <div style={s.resultItemLabel}>Taxable Income</div>
              <div style={s.resultItemValue}>{formatCurrency(result.taxableIncome)}</div>
            </div>
            <div style={s.resultItem}>
              <div style={s.resultItemLabel}>Effective Rate</div>
              <div style={s.resultItemValue}>{result.effectiveRate}%</div>
            </div>
          </div>

          {/* Company breakdown */}
          {entityType === 'company' && result.isSmallCompany && (
            <div style={{ marginTop: '12px', padding: '10px', borderRadius: `${borderRadius / 3}px`, backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '13px', color: '#065f46' }}>
              ✅ Small Company Exemption — 0% CIT
            </div>
          )}
          {entityType === 'company' && !result.isSmallCompany && (
            <div style={{ ...s.resultGrid, marginTop: '12px' }}>
              <div style={s.resultItem}>
                <div style={s.resultItemLabel}>CIT (30%)</div>
                <div style={s.resultItemValue}>{formatCurrency(result.cit)}</div>
              </div>
              <div style={s.resultItem}>
                <div style={s.resultItemLabel}>Dev. Levy (4%)</div>
                <div style={s.resultItemValue}>{formatCurrency(result.developmentLevy)}</div>
              </div>
            </div>
          )}

          {/* PIT band breakdown for Business Name */}
          {entityType === 'business_name' && result.pitBands && result.pitBands.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: theme.textColor }}>
                PIT Band Breakdown
              </div>
              {result.pitBands.map((band: any, i: number) => (
                <div key={i} style={s.bandRow}>
                  <span style={{ color: theme.textColor, opacity: 0.7 }}>{band.label} @ {band.rate}</span>
                  <span style={{ fontWeight: '600', color: theme.textColor }}>{formatCurrency(band.tax)}</span>
                </div>
              ))}
            </div>
          )}

          <a href="https://taxforgeng.com/calculator" target="_blank" rel="noopener noreferrer" style={s.ctaLink}>
            Get full features on TaxForge NG →
          </a>
        </div>
      )}
    </div>
  );
};

export default BusinessTab;
