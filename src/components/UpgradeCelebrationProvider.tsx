import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UpgradeSuccessCelebration } from './UpgradeSuccessCelebration';
import { SubscriptionTier } from '@/contexts/SubscriptionContext';

interface UpgradeCelebrationContextType {
  triggerCelebration: (tier: SubscriptionTier) => void;
}

const UpgradeCelebrationContext = createContext<UpgradeCelebrationContextType | undefined>(undefined);

export const useUpgradeCelebration = () => {
  const context = useContext(UpgradeCelebrationContext);
  if (!context) {
    throw new Error('useUpgradeCelebration must be used within UpgradeCelebrationProvider');
  }
  return context;
};

interface UpgradeCelebrationProviderProps {
  children: React.ReactNode;
}

export const UpgradeCelebrationProvider: React.FC<UpgradeCelebrationProviderProps> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);
  const [upgradedTier, setUpgradedTier] = useState<SubscriptionTier>('basic');

  // Check URL params for upgrade success on mount
  useEffect(() => {
    const upgradeSuccess = searchParams.get('upgrade_success');
    const tier = searchParams.get('tier') as SubscriptionTier;
    
    if (upgradeSuccess === 'true' && tier) {
      setUpgradedTier(tier);
      setShowCelebration(true);
      
      // Remove query params without navigation
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('upgrade_success');
      newParams.delete('tier');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const triggerCelebration = useCallback((tier: SubscriptionTier) => {
    setUpgradedTier(tier);
    setShowCelebration(true);
  }, []);

  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  return (
    <UpgradeCelebrationContext.Provider value={{ triggerCelebration }}>
      {children}
      <UpgradeSuccessCelebration
        isOpen={showCelebration}
        onClose={closeCelebration}
        newTier={upgradedTier}
      />
    </UpgradeCelebrationContext.Provider>
  );
};

export default UpgradeCelebrationProvider;
