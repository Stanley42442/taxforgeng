import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubscriptionTier } from '@/contexts/SubscriptionContext';

export const useUpgradeSuccess = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);
  const [upgradedTier, setUpgradedTier] = useState<SubscriptionTier>('basic');

  useEffect(() => {
    const upgradeSuccess = searchParams.get('upgrade_success');
    const tier = searchParams.get('tier') as SubscriptionTier;
    
    if (upgradeSuccess === 'true' && tier) {
      setUpgradedTier(tier);
      setShowCelebration(true);
      
      // Remove query params
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

  return {
    showCelebration,
    upgradedTier,
    triggerCelebration,
    closeCelebration,
  };
};

export default useUpgradeSuccess;
