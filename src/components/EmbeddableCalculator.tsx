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
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'business', label: 'Business' },
  { id: 'personal', label: 'Personal' },
  { id: 'vat', label: 'VAT' },
];

export const EmbeddableCalculator = ({ theme = defaultTheme, onCalculate }: EmbeddableCalculatorProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('business');
  const borderRadius = parseInt(theme.borderRadius, 10) || DEFAULT_BORDER_RADIUS;

  const containerStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily || 'Inter, sans-serif',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderRadius: `${borderRadius}px`,
    padding: '24px',
    maxWidth: '480px',
    margin: '0 auto',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    backgroundColor: '#f3f4f6',
    borderRadius: `${borderRadius / 2}px`,
    padding: '4px',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 8px',
    borderRadius: `${borderRadius / 2 - 2}px`,
    border: 'none',
    backgroundColor: active ? theme.primaryColor : 'transparent',
    color: active ? '#ffffff' : theme.textColor,
    fontSize: '14px',
    fontWeight: active ? '600' : '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    opacity: active ? 1 : 0.7,
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        {theme.logoUrl ? (
          <img src={theme.logoUrl} alt={theme.brandName || 'Logo'} style={{ height: '40px', width: 'auto' }} />
        ) : (
          <div style={{
            backgroundColor: theme.primaryColor,
            padding: '10px',
            borderRadius: `${borderRadius / 2}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Calculator size={20} color="#ffffff" />
          </div>
        )}
        <span style={{ fontSize: '20px', fontWeight: '600', color: theme.textColor }}>
          {theme.brandName || 'Tax Calculator'}
        </span>
      </div>

      {/* Tab bar */}
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

      {/* Powered By */}
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: theme.textColor, opacity: 0.5 }}>
        Powered by{' '}
        <a href="https://taxforgeng.com" target="_blank" rel="noopener noreferrer"
          style={{ color: theme.primaryColor, textDecoration: 'none', fontWeight: '500' }}>
          TaxForge NG
        </a>
      </div>
    </div>
  );
};

export default EmbeddableCalculator;
