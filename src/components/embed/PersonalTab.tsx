import { useState } from "react";
import { Calculator } from "lucide-react";
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

interface PersonalTabProps {
  theme: PartnerTheme;
  borderRadius: number;
  onCalculate?: (result: any) => void;
}

const PersonalTab = ({ theme, borderRadius, onCalculate }: PersonalTabProps) => {
  const [grossSalary, setGrossSalary] = useState(0);
  const [pension, setPension] = useState(0);
  const [nhf, setNhf] = useState(0);
  const [nhis, setNhis] = useState(0);
  const [lifeInsurance, setLifeInsurance] = useState(0);
  const [annualRent, setAnnualRent] = useState(0);
  const [mortgageInterest, setMortgageInterest] = useState(0);
  const [showDeductions, setShowDeductions] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const s = getStyles(theme, borderRadius);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: number) => void) => {
    setter(parseCurrencyInput(e.target.value));
  };

  const calculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      // Cap pension at 8% of gross
      const cappedPension = Math.min(pension, grossSalary * 0.08);
      const rentRelief = Math.min(annualRent * 0.2, RENT_RELIEF_CAP);
      const totalDeductions = cappedPension + nhf + nhis + lifeInsurance + rentRelief + mortgageInterest;
      const afterDeductions = Math.max(0, grossSalary - totalDeductions);
      const taxableAmount = Math.max(0, afterDeductions - PIT_EXEMPTION);

      const { bands, total: totalTax } = calculatePITBands(taxableAmount);
      const annualNet = grossSalary - cappedPension - totalTax;
      const monthlyTakeHome = Math.round(annualNet / 12);
      const effectiveRate = grossSalary > 0 ? ((totalTax / grossSalary) * 100).toFixed(2) : '0.00';

      const calculationResult = {
        type: 'personal',
        grossSalary,
        totalDeductions: Math.round(totalDeductions),
        taxableIncome: Math.round(taxableAmount),
        totalTaxPayable: totalTax,
        effectiveRate,
        monthlyTakeHome,
        annualNet: Math.round(annualNet),
        bands,
      };

      setResult(calculationResult);
      onCalculate?.(calculationResult);
      setIsCalculating(false);
    }, 400);
  };

  const renderInput = (label: string, value: number, setter: (v: number) => void, placeholder: string) => (
    <div style={s.inputGroup}>
      <label style={s.label}>{label}</label>
      <input type="text" inputMode="numeric" style={s.input} placeholder={placeholder}
        value={value ? `₦${formatWithCommas(value)}` : ''}
        onChange={(e) => handleInput(e, setter)}
        onFocus={(e) => (e.target.style.borderColor = theme.primaryColor)}
        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
      />
    </div>
  );

  return (
    <div>
      {renderInput('Gross Annual Salary', grossSalary, setGrossSalary, 'e.g., 12,000,000')}
      {renderInput('Employee Pension (8% cap)', pension, setPension, 'e.g., 960,000')}

      {/* Toggle deductions */}
      <button
        onClick={() => setShowDeductions(!showDeductions)}
        style={{
          background: 'none',
          border: 'none',
          color: theme.primaryColor,
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: '12px',
        }}
      >
        {showDeductions ? '▾ Hide' : '▸ Show'} optional deductions (NHF, NHIS, rent, etc.)
      </button>

      {showDeductions && (
        <>
          {renderInput('NHF Contribution', nhf, setNhf, 'e.g., 300,000')}
          {renderInput('NHIS Contribution', nhis, setNhis, 'e.g., 100,000')}
          {renderInput('Life Insurance Premium', lifeInsurance, setLifeInsurance, 'e.g., 200,000')}
          {renderInput('Annual Rent Paid', annualRent, setAnnualRent, 'e.g., 2,000,000')}
          {renderInput('Mortgage Interest', mortgageInterest, setMortgageInterest, 'e.g., 500,000')}
        </>
      )}

      <button style={{ ...s.button, opacity: isCalculating ? 0.7 : 1 }} onClick={calculate} disabled={isCalculating}>
        <Calculator size={18} />
        {isCalculating ? 'Calculating...' : 'Calculate Tax'}
      </button>

      {result && (
        <div style={s.resultCard}>
          <div style={s.resultTitle}>Total Annual Tax</div>
          <div style={s.resultValue}>{formatCurrency(result.totalTaxPayable)}</div>

          <div style={s.resultGrid}>
            <div style={s.resultItem}>
              <div style={s.resultItemLabel}>Monthly Take-Home</div>
              <div style={{ ...s.resultItemValue, color: theme.primaryColor }}>{formatCurrency(result.monthlyTakeHome)}</div>
            </div>
            <div style={s.resultItem}>
              <div style={s.resultItemLabel}>Effective Rate</div>
              <div style={s.resultItemValue}>{result.effectiveRate}%</div>
            </div>
            <div style={s.resultItem}>
              <div style={s.resultItemLabel}>Taxable Income</div>
              <div style={s.resultItemValue}>{formatCurrency(result.taxableIncome)}</div>
            </div>
            <div style={s.resultItem}>
              <div style={s.resultItemLabel}>Total Deductions</div>
              <div style={s.resultItemValue}>{formatCurrency(result.totalDeductions)}</div>
            </div>
          </div>

          {/* PIT band breakdown */}
          {result.bands && result.bands.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: theme.textColor }}>
                PIT Band Breakdown
              </div>
              {result.bands.map((band: any, i: number) => (
                <div key={i} style={s.bandRow}>
                  <span style={{ color: theme.textColor, opacity: 0.7 }}>{band.label} @ {band.rate}</span>
                  <span style={{ fontWeight: '600', color: theme.textColor }}>{formatCurrency(band.tax)}</span>
                </div>
              ))}
            </div>
          )}

          <a href="https://taxforgeng.com/individual-calculator" target="_blank" rel="noopener noreferrer" style={s.ctaLink}>
            Get full features on TaxForge NG →
          </a>
        </div>
      )}
    </div>
  );
};

export default PersonalTab;
