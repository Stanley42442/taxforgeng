import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'basic' | 'business' | 'corporate';

export interface CACVerificationDetails {
  companyName: string;
  status: 'Active' | 'Inactive';
  registrationDate: string;
  directors: string[];
}

export interface SavedBusiness {
  id: string;
  name: string;
  entityType: 'company' | 'business_name';
  turnover: number;
  createdAt: Date;
  // CAC Verification fields
  rcBnNumber?: string;
  verificationStatus?: 'verified' | 'not_verified' | 'pending' | 'manual';
  cacDetails?: CACVerificationDetails;
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
  updateBusiness: (id: string, updates: Partial<SavedBusiness>) => void;
  canSaveBusiness: () => boolean;
  canExport: () => boolean;
  canAccessFiling: () => boolean;
  canAccessScenarioModeling: () => boolean;
  canVerifyCAC: () => boolean;
  getBusinessLimit: () => number | 'unlimited';
  showWatermark: () => boolean;
  upgradeTier: (newTier: SubscriptionTier) => void;
  setEmail: (email: string) => void;
  verifyRCBN: (rcBnNumber: string) => { isValid: boolean; details?: CACVerificationDetails };
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

  const updateBusiness = (id: string, updates: Partial<SavedBusiness>) => {
    setState(prev => ({
      ...prev,
      savedBusinesses: prev.savedBusinesses.map(b => 
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  };

  const canExport = () => state.tier !== 'free';
  const canAccessFiling = () => state.tier === 'business' || state.tier === 'corporate';
  const canAccessScenarioModeling = () => state.tier === 'business' || state.tier === 'corporate';
  const canVerifyCAC = () => state.tier === 'business' || state.tier === 'corporate';
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

  // Mock CAC verification logic
  const verifyRCBN = (rcBnNumber: string): { isValid: boolean; details?: CACVerificationDetails } => {
    // Regex validation: RC + 6-8 digits or BN + digits
    const rcPattern = /^RC\d{6,8}$/i;
    const bnPattern = /^BN\d{5,8}$/i;
    
    const isValidFormat = rcPattern.test(rcBnNumber) || bnPattern.test(rcBnNumber);
    
    // Mock verified numbers for testing
    const mockVerifiedNumbers: Record<string, CACVerificationDetails> = {
      'RC1234567': { 
        companyName: 'Example Ventures Ltd', 
        status: 'Active', 
        registrationDate: '2024-05-15',
        directors: ['John Doe', 'Jane Smith']
      },
      'RC987654': { 
        companyName: 'Tech Solutions Nigeria Ltd', 
        status: 'Active', 
        registrationDate: '2023-08-20',
        directors: ['Chidi Okonkwo']
      },
      'BN111111': { 
        companyName: 'Adeyemi Trading Enterprise', 
        status: 'Active', 
        registrationDate: '2024-01-10',
        directors: ['Folake Adeyemi']
      },
      'RC555555': { 
        companyName: 'Lagos Digital Services Ltd', 
        status: 'Active', 
        registrationDate: '2022-11-30',
        directors: ['Emeka Johnson', 'Amara Williams']
      },
    };

    const upperCaseNumber = rcBnNumber.toUpperCase();
    
    if (mockVerifiedNumbers[upperCaseNumber]) {
      return { isValid: true, details: mockVerifiedNumbers[upperCaseNumber] };
    }
    
    // For valid format but not in mock database, still mark as verified with generated data
    if (isValidFormat) {
      const isCompany = upperCaseNumber.startsWith('RC');
      return { 
        isValid: true, 
        details: {
          companyName: isCompany ? 'Verified Company Ltd' : 'Verified Business Enterprise',
          status: 'Active',
          registrationDate: '2024-03-01',
          directors: ['Registered Owner']
        }
      };
    }
    
    return { isValid: false };
  };

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        setTier,
        addBusiness,
        removeBusiness,
        updateBusiness,
        canSaveBusiness,
        canExport,
        canAccessFiling,
        canAccessScenarioModeling,
        canVerifyCAC,
        getBusinessLimit,
        showWatermark,
        upgradeTier,
        setEmail,
        verifyRCBN,
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
