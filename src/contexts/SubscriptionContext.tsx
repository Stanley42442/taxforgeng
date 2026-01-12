import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SubscriptionTier = 'free' | 'starter' | 'basic' | 'freelancer' | 'business' | 'corporate';

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
  sector?: string;
  subSector?: string;
  // CAC Verification fields
  rcBnNumber?: string;
  verificationStatus?: 'verified' | 'not_verified' | 'pending' | 'manual';
  cacDetails?: CACVerificationDetails;
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  effectiveTier: SubscriptionTier; // The tier after considering trial
  businessCount: number;
  savedBusinesses: SavedBusiness[];
  subscriptionEndDate: Date | null;
  email: string | null;
  loading: boolean;
  isOnTrial: boolean;
  trialEndsAt: Date | null;
}

interface SubscriptionContextType extends SubscriptionState {
  setTier: (tier: SubscriptionTier) => void;
  addBusiness: (business: Omit<SavedBusiness, 'id' | 'createdAt'>) => Promise<boolean>;
  removeBusiness: (id: string) => Promise<void>;
  updateBusiness: (id: string, updates: Partial<SavedBusiness>) => Promise<void>;
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
  bulkVerifyRCBN: (numbers: string[]) => Array<{ rcBnNumber: string; isValid: boolean; details?: CACVerificationDetails }>;
  addSampleBusinesses: () => Promise<void>;
  refreshBusinesses: () => Promise<void>;
}

const TIER_LIMITS: Record<SubscriptionTier, number | 'unlimited'> = {
  free: 0,
  starter: 1,
  basic: 2,
  freelancer: 5,
  business: 10,
  corporate: 'unlimited',
};

// Sample test businesses
const SAMPLE_BUSINESSES: Omit<SavedBusiness, 'id' | 'createdAt'>[] = [
  {
    name: 'Lagos Tech Hub Ltd',
    entityType: 'company',
    turnover: 35000000,
    rcBnNumber: 'RC1234567',
    verificationStatus: 'verified',
    cacDetails: {
      companyName: 'Lagos Tech Hub Limited',
      status: 'Active',
      registrationDate: '2023-06-15',
      directors: ['Chinedu Okafor', 'Aisha Mohammed']
    }
  },
  {
    name: 'Adeyemi Consulting',
    entityType: 'business_name',
    turnover: 8500000,
    rcBnNumber: 'BN111111',
    verificationStatus: 'verified',
    cacDetails: {
      companyName: 'Adeyemi Consulting Services',
      status: 'Active',
      registrationDate: '2024-01-10',
      directors: ['Folake Adeyemi']
    }
  },
  {
    name: 'Abuja Digital Services',
    entityType: 'company',
    turnover: 120000000,
    rcBnNumber: 'RC555555',
    verificationStatus: 'verified',
    cacDetails: {
      companyName: 'Abuja Digital Services Ltd',
      status: 'Active',
      registrationDate: '2022-11-30',
      directors: ['Emeka Johnson', 'Amara Williams']
    }
  },
  {
    name: 'Kano Trading Enterprise',
    entityType: 'business_name',
    turnover: 15000000,
  },
];

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tier: 'free',
    effectiveTier: 'free',
    businessCount: 0,
    savedBusinesses: [],
    subscriptionEndDate: null,
    email: null,
    loading: true,
    isOnTrial: false,
    trialEndsAt: null,
  });

  // Fetch user profile and businesses from database
  const fetchUserData = useCallback(async () => {
    if (!user) {
      setState({
        tier: 'free',
        effectiveTier: 'free',
        businessCount: 0,
        savedBusinesses: [],
        subscriptionEndDate: null,
        email: null,
        loading: false,
        isOnTrial: false,
        trialEndsAt: null,
      });
      return;
    }

    try {
      // Fetch profile for subscription tier and trial info
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, email, created_at, trial_started_at, trial_expires_at, has_selected_initial_tier')
        .eq('id', user.id)
        .single();

      // Fetch businesses
      const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const mappedBusinesses: SavedBusiness[] = (businesses || []).map(b => ({
        id: b.id,
        name: b.name,
        entityType: b.entity_type as 'company' | 'business_name',
        turnover: Number(b.turnover),
        createdAt: new Date(b.created_at),
        sector: b.sector || undefined,
        subSector: b.sub_sector || undefined,
        verificationStatus: b.cac_verified ? 'verified' : 'not_verified',
      }));

      // Calculate trial status using the dedicated fields
      const baseTier = (profile?.subscription_tier as SubscriptionTier) || 'free';
      let isOnTrial = false;
      let trialEndsAt: Date | null = null;
      let effectiveTier = baseTier;

      // Check if user has an active trial (any tier with trial_expires_at)
      if (profile?.trial_expires_at) {
        trialEndsAt = new Date(profile.trial_expires_at);
        isOnTrial = new Date() < trialEndsAt;
        if (!isOnTrial) {
          // Trial expired - the database function should have downgraded them
          // but we'll show free tier just in case
          effectiveTier = 'free';
        }
      }

      setState({
        tier: baseTier,
        effectiveTier: isOnTrial ? baseTier : baseTier,
        businessCount: mappedBusinesses.length,
        savedBusinesses: mappedBusinesses,
        subscriptionEndDate: null,
        email: profile?.email || user.email || null,
        loading: false,
        isOnTrial,
        trialEndsAt,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const refreshBusinesses = async () => {
    await fetchUserData();
  };

  const setTier = async (tier: SubscriptionTier) => {
    if (!user) return;
    
    await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', user.id);
    
    setState(prev => ({ ...prev, tier, effectiveTier: tier }));
  };

  const getBusinessLimit = () => TIER_LIMITS[state.effectiveTier];

  const canSaveBusiness = () => {
    const limit = getBusinessLimit();
    if (limit === 'unlimited') return true;
    return state.businessCount < limit;
  };

  const addBusiness = async (business: Omit<SavedBusiness, 'id' | 'createdAt'>): Promise<boolean> => {
    if (!user || !canSaveBusiness()) return false;
    
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: business.name,
        entity_type: business.entityType,
        turnover: business.turnover,
        cac_verified: business.verificationStatus === 'verified',
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding business:', error);
      return false;
    }

    const newBusiness: SavedBusiness = {
      id: data.id,
      name: data.name,
      entityType: data.entity_type as 'company' | 'business_name',
      turnover: Number(data.turnover),
      createdAt: new Date(data.created_at),
      sector: data.sector || undefined,
      subSector: data.sub_sector || undefined,
      verificationStatus: data.cac_verified ? 'verified' : 'not_verified',
    };

    setState(prev => ({
      ...prev,
      savedBusinesses: [newBusiness, ...prev.savedBusinesses],
      businessCount: prev.businessCount + 1,
    }));
    
    return true;
  };

  const removeBusiness = async (id: string) => {
    if (!user) return;

    await supabase
      .from('businesses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    setState(prev => ({
      ...prev,
      savedBusinesses: prev.savedBusinesses.filter(b => b.id !== id),
      businessCount: Math.max(0, prev.businessCount - 1),
    }));
  };

  const updateBusiness = async (id: string, updates: Partial<SavedBusiness>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.entityType) dbUpdates.entity_type = updates.entityType;
    if (updates.turnover !== undefined) dbUpdates.turnover = updates.turnover;
    if (updates.verificationStatus) dbUpdates.cac_verified = updates.verificationStatus === 'verified';

    await supabase
      .from('businesses')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    setState(prev => ({
      ...prev,
      savedBusinesses: prev.savedBusinesses.map(b => 
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  };

  const canExport = () => state.effectiveTier !== 'free';
  const canAccessFiling = () => state.effectiveTier === 'business' || state.effectiveTier === 'corporate';
  const canAccessScenarioModeling = () => state.effectiveTier === 'freelancer' || state.effectiveTier === 'business' || state.effectiveTier === 'corporate';
  const canVerifyCAC = () => state.effectiveTier === 'business' || state.effectiveTier === 'corporate';
  const showWatermark = () => state.effectiveTier === 'free' || state.effectiveTier === 'basic';

  const upgradeTier = async (newTier: SubscriptionTier) => {
    if (!user) return;
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    await supabase
      .from('profiles')
      .update({ subscription_tier: newTier })
      .eq('id', user.id);

    setState(prev => ({
      ...prev,
      tier: newTier,
      effectiveTier: newTier,
      subscriptionEndDate: endDate,
      isOnTrial: false, // Upgrading ends trial
    }));
  };

  const setEmail = (email: string) => {
    setState(prev => ({ ...prev, email }));
  };

  // Mock CAC verification logic
  const verifyRCBN = (rcBnNumber: string): { isValid: boolean; details?: CACVerificationDetails } => {
    const rcPattern = /^RC\d{6,8}$/i;
    const bnPattern = /^BN\d{5,8}$/i;
    
    const isValidFormat = rcPattern.test(rcBnNumber) || bnPattern.test(rcBnNumber);
    
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

  const bulkVerifyRCBN = (numbers: string[]): Array<{ rcBnNumber: string; isValid: boolean; details?: CACVerificationDetails }> => {
    return numbers.map(rcBnNumber => {
      const result = verifyRCBN(rcBnNumber);
      return { rcBnNumber: rcBnNumber.toUpperCase(), ...result };
    });
  };

  const addSampleBusinesses = async () => {
    for (const business of SAMPLE_BUSINESSES) {
      if (canSaveBusiness()) {
        await addBusiness(business);
      }
    }
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
        bulkVerifyRCBN,
        addSampleBusinesses,
        refreshBusinesses,
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
