import { useState } from "react";
import { Calculator } from "lucide-react";
import { DEFAULT_BORDER_RADIUS } from "@/lib/constants";
import { PartnerTheme, defaultTheme, TabId } from "./embed/types";
import BusinessTab from "./embed/BusinessTab";
import PersonalTab from "./embed/PersonalTab";
import VATTab from "./embed/VATTab";

// Re-export for backward compatibility
export type { PartnerTheme } from "./embed/types";

interface EmbeddableCalculatorProps {
  theme?: PartnerTheme;
  onCalculate?: (result: any) => void;
  /** When true, renders without API key validation (for public sandbox demos) */
  sandboxMode?: boolean;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'business', label: 'Business' },
  { id: 'personal', label: 'Personal' },
  { id: 'vat', label: 'VAT' },
];

export const EmbeddableCalculator = ({ theme = defaultTheme, onCalculate, sandboxMode = false }: EmbeddableCalculatorProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('business');
  const borderRadius = parseInt(theme.borderRadius, 10) || DEFAULT_BORDER_RADIUS;
  const br = Math.min(borderRadius, 12);

  const containerStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily || 'Inter, system-ui, sans-serif',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderRadius: `${br}px`,
    padding: '24px',
    maxWidth: '480px',
    margin: '0 auto',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0',
    marginBottom: '24px',
    borderBottom: '2px solid #f1f5f9',
    position: 'relative',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 8px',
    border: 'none',
    borderBottom: active ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
    marginBottom: '-2px',
    backgroundColor: 'transparent',
    color: active ? theme.primaryColor : theme.textColor,
    fontSize: '14px',
    fontWeight: active ? '600' : '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    opacity: active ? 1 : 0.55,
    letterSpacing: '0.01em',
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        {theme.logoUrl ? (
          <img src={theme.logoUrl} alt={theme.brandName || 'Logo'} style={{ height: '36px', width: 'auto' }} />
        ) : (
          <div style={{
            backgroundColor: theme.primaryColor,
            padding: '8px',
            borderRadius: `${br / 2}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Calculator size={18} color="#ffffff" />
          </div>
        )}
        <div>
          <span style={{ fontSize: '17px', fontWeight: '600', color: theme.textColor, letterSpacing: '-0.01em' }}>
            {theme.brandName || 'Tax Calculator'}
          </span>
          <div style={{ fontSize: '11px', color: theme.textColor, opacity: 0.45, marginTop: '1px' }}>
            Nigeria 2026 Rules
          </div>
        </div>
      </div>

      {/* Tab bar — underline style */}
      <div style={tabBarStyle}>
        {TABS.map((tab) => (
          <button key={tab.id} style={tabStyle(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'business' && <BusinessTab theme={theme} borderRadius={borderRadius} onCalculate={onCalculate} />}
      {activeTab === 'personal' && <PersonalTab theme={theme} borderRadius={borderRadius} onCalculate={onCalculate} />}
      {activeTab === 'vat' && <VATTab theme={theme} borderRadius={borderRadius} onCalculate={onCalculate} />}

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #f1f5f9',
        textAlign: 'center',
        fontSize: '11px',
        color: theme.textColor,
        opacity: 0.4,
      }}>
        {sandboxMode ? (
          <span>Sandbox demo — <a href="https://taxforgeng.com/embed-partner" target="_blank" rel="noopener noreferrer" style={{ color: theme.primaryColor, textDecoration: 'none', fontWeight: '500' }}>get your API key →</a></span>
        ) : (
          <>Powered by{' '}
          <a href="https://taxforgeng.com" target="_blank" rel="noopener noreferrer"
            style={{ color: theme.primaryColor, textDecoration: 'none', fontWeight: '500' }}>
            TaxForge NG
          </a></>
        )}
      </div>
    </div>
  );
};

export default EmbeddableCalculator;
