import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'basic' | 'business' | 'corporate';

export interface SavedBusiness {
  id: string;
  name: string;
  entityType: 'company' | 'business_name';
  turnover: number;
  createdAt: Date;
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  businessCount: number;
  savedBusinesses: SavedBusiness[];
  subscriptionEndDate: Date | null;
  email: string | null;
}

interface SubscriptionContextType extends SubscriptionState {
  setTier: (tier: SubscriptionTier) => void;
  addBusiness: (business: Omit<SavedBusiness, 'id' | 'createdAt'>) => boolean;
  removeBusiness: (id: string) => void;
  canSaveBusiness: () => boolean;
  canExport: () => boolean;
  canAccessFiling: () => boolean;
  canAccessScenarioModeling: () => boolean;
  getBusinessLimit: () => number | 'unlimited';
  showWatermark: () => boolean;
  upgradeTier: (newTier: SubscriptionTier) => void;
  setEmail: (email: string) => void;
}

const TIER_LIMITS: Record<SubscriptionTier, number | 'unlimited'> = {
  free: 0,
  basic: 2,
  business: 10,
  corporate: 'unlimited',
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SubscriptionState>(() => {
    // Try to load from localStorage for non-free tiers
    const saved = localStorage.getItem('naijataxpro_subscription');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        subscriptionEndDate: parsed.subscriptionEndDate ? new Date(parsed.subscriptionEndDate) : null,
        savedBusinesses: parsed.savedBusinesses?.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt)
        })) || []
      };
    }
    return {
      tier: 'free',
      businessCount: 0,
      savedBusinesses: [],
      subscriptionEndDate: null,
      email: null,
    };
  });

  // Persist to localStorage when state changes (except for free tier)
  useEffect(() => {
    if (state.tier !== 'free') {
      localStorage.setItem('naijataxpro_subscription', JSON.stringify(state));
    } else {
      // Clear data on free tier (no persistence)
      localStorage.removeItem('naijataxpro_subscription');
    }
  }, [state]);

  const setTier = (tier: SubscriptionTier) => {
    setState(prev => ({ ...prev, tier }));
  };

  const getBusinessLimit = () => TIER_LIMITS[state.tier];

  const canSaveBusiness = () => {
    const limit = getBusinessLimit();
    if (limit === 'unlimited') return true;
    return state.businessCount < limit;
  };

  const addBusiness = (business: Omit<SavedBusiness, 'id' | 'createdAt'>): boolean => {
    if (!canSaveBusiness()) return false;
    
    const newBusiness: SavedBusiness = {
      ...business,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    setState(prev => ({
      ...prev,
      savedBusinesses: [...prev.savedBusinesses, newBusiness],
      businessCount: prev.businessCount + 1,
    }));
    return true;
  };

  const removeBusiness = (id: string) => {
    setState(prev => ({
      ...prev,
      savedBusinesses: prev.savedBusinesses.filter(b => b.id !== id),
      businessCount: Math.max(0, prev.businessCount - 1),
    }));
  };

  const canExport = () => state.tier !== 'free';
  const canAccessFiling = () => state.tier === 'business' || state.tier === 'corporate';
  const canAccessScenarioModeling = () => state.tier === 'business' || state.tier === 'corporate';
  const showWatermark = () => state.tier === 'free';

  const upgradeTier = (newTier: SubscriptionTier) => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    setState(prev => ({
      ...prev,
      tier: newTier,
      subscriptionEndDate: endDate,
    }));
  };

  const setEmail = (email: string) => {
    setState(prev => ({ ...prev, email }));
  };

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        setTier,
        addBusiness,
        removeBusiness,
        canSaveBusiness,
        canExport,
        canAccessFiling,
        canAccessScenarioModeling,
        getBusinessLimit,
        showWatermark,
        upgradeTier,
        setEmail,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
