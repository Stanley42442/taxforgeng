import { useState } from "react";
import { Calculator } from "lucide-react";
import {
  PartnerTheme,
  formatCurrency,
  formatWithCommas,
  parseCurrencyInput,
  getStyles,
} from "./types";

interface VATTabProps {
  theme: PartnerTheme;
  borderRadius: number;
  onCalculate?: (result: any) => void;
}

const VATTab = ({ theme, borderRadius, onCalculate }: VATTabProps) => {
  const [amount, setAmount] = useState(0);
  const [vatRate, setVatRate] = useState(7.5);
  const [direction, setDirection] = useState<'add' | 'extract'>('add');
  const [result, setResult] = useState<any>(null);

  const s = getStyles(theme, borderRadius);
  const br = Math.min(borderRadius / 2, 8);

  const calculate = () => {
    const rate = vatRate / 100;
    let vatAmount: number, netAmount: number, totalAmount: number;

    if (direction === 'add') {
      netAmount = amount;
      vatAmount = Math.round(amount * rate);
      totalAmount = amount + vatAmount;
    } else {
      totalAmount = amount;
      netAmount = Math.round(amount / (1 + rate));
      vatAmount = totalAmount - netAmount;
    }

    const calculationResult = { type: 'vat', vatAmount, netAmount, totalAmount, vatRate, direction };
    setResult(calculationResult);
    onCalculate?.(calculationResult);
  };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    borderRadius: `${br}px`,
    border: `1.5px solid ${active ? theme.primaryColor : '#e2e8f0'}`,
    backgroundColor: active ? `${theme.primaryColor}08` : '#fafbfc',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: active ? theme.primaryColor : theme.textColor,
    textAlign: 'center',
    transition: 'all 0.2s',
  });

  return (
    <div>
      {/* Direction toggle */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button style={toggleStyle(direction === 'add')} onClick={() => setDirection('add')}>
          Add VAT to amount
        </button>
        <button style={toggleStyle(direction === 'extract')} onClick={() => setDirection('extract')}>
          Extract VAT from amount
        </button>
      </div>

      <div style={s.inputGroup}>
        <label style={s.label}>{direction === 'add' ? 'Net Amount' : 'VAT-Inclusive Amount'}</label>
        <input type="text" inputMode="numeric" style={s.input} placeholder="e.g., 1,000,000"
          value={amount ? `₦${formatWithCommas(amount)}` : ''}
          onChange={(e) => setAmount(parseCurrencyInput(e.target.value))}
          onFocus={(e) => { e.target.style.borderColor = theme.primaryColor; e.target.style.boxShadow = s.inputFocus.boxShadow as string; e.target.style.backgroundColor = '#ffffff'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#fafbfc'; }}
        />
      </div>

      <div style={s.inputGroup}>
        <label style={s.label}>VAT Rate (%)</label>
        <input type="number" style={s.input} value={vatRate} min={0} max={100} step={0.5}
          onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
          onFocus={(e) => { e.target.style.borderColor = theme.primaryColor; e.target.style.boxShadow = s.inputFocus.boxShadow as string; e.target.style.backgroundColor = '#ffffff'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#fafbfc'; }}
        />
      </div>

      <button style={s.button} onClick={calculate}>
        <Calculator size={16} />
        Calculate VAT
      </button>

      {result && (
        <div style={s.resultCard}>
          <div style={s.resultTitle}>VAT Amount</div>
          <div style={s.resultValue}>{formatCurrency(result.vatAmount)}</div>

          <div style={s.resultDivider} />

          <div style={s.resultGrid}>
            <div style={s.resultItem}>
              <div style={s.resultItemLabel}>Net Amount</div>
              <div style={s.resultItemValue}>{formatCurrency(result.netAmount)}</div>
            </div>
            <div style={s.resultItem}>
              <div style={s.resultItemLabel}>Total (Incl. VAT)</div>
              <div style={s.resultItemValue}>{formatCurrency(result.totalAmount)}</div>
            </div>
          </div>

          <div style={s.badgeWarning}>
            💡 Businesses with turnover under ₦25M are exempt from VAT registration (₦100M for admin exemption).
          </div>

          <a href="https://taxforgeng.com/vat-calculator-nigeria" target="_blank" rel="noopener noreferrer" style={s.ctaLink}>
            Get full features on TaxForge NG →
          </a>
        </div>
      )}
    </div>
  );
};

export default VATTab;
