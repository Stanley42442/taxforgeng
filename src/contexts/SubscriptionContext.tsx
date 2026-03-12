import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import logger from '@/lib/logger';
import { safeLocalStorage } from '@/lib/safeStorage';
import { saveBusinesses as cacheBusinessesToIDB, getBusinesses as getCachedBusinesses } from '@/lib/offlineStorage';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

export type SubscriptionTier = 'free' | 'starter' | 'basic' | 'professional' | 'business' | 'corporate';

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
  deletedAt?: Date;
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
  isInGracePeriod: boolean;
  gracePeriodEndsAt: Date | null;
}

interface SubscriptionContextType extends SubscriptionState {
  setTier: (tier: SubscriptionTier) => void;
  addBusiness: (business: Omit<SavedBusiness, 'id' | 'createdAt'>) => Promise<boolean>;
  removeBusiness: (id: string) => Promise<void>;
  restoreBusiness: (id: string) => Promise<void>;
  getDeletedBusinesses: () => Promise<SavedBusiness[]>;
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
  refreshSubscription: () => Promise<void>;
  // Export feature tier checks
  canExportExcel: () => boolean;
  canEmailReports: () => boolean;
  canBulkExport: () => boolean;
  canAddDigitalSignature: () => boolean;
  canAddQRVerification: () => boolean;
}

// Tier limits for saved businesses
// free: 0 (Individuals with no business)
// starter: 1 (Side hustlers)
// basic: 2 (Freelancers & solo professionals)
// professional: 5 (Small businesses)
// business: 10 (Growing businesses)
// corporate: unlimited (Enterprise)
const TIER_LIMITS: Record<SubscriptionTier, number | 'unlimited'> = {
  free: 0,
  starter: 1,
  basic: 2,
  professional: 5,
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
  const { user, loading: authLoading } = useAuth();
  const { isOnline } = useOfflineStatus();
  const profileCreateAttempted = useRef(false);
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
    isInGracePeriod: false,
    gracePeriodEndsAt: null,
  });

  // Load cached data for offline mode
  const loadOfflineData = useCallback(async () => {
    try {
      const cachedTier = safeLocalStorage.getItem('taxforge_cached_tier') as SubscriptionTier | null;
      const cachedEmail = safeLocalStorage.getItem('taxforge_cached_email');
      const cachedBusinesses = await getCachedBusinesses<SavedBusiness>();
      
      setState({
        tier: cachedTier || 'free',
        effectiveTier: cachedTier || 'free',
        businessCount: cachedBusinesses.length,
        savedBusinesses: cachedBusinesses,
        subscriptionEndDate: null,
        email: cachedEmail || user?.email || null,
        loading: false,
        isOnTrial: false,
        trialEndsAt: null,
        isInGracePeriod: false,
        gracePeriodEndsAt: null,
      });
    } catch (error) {
      logger.error('[SubscriptionContext] Failed to load offline data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  // Fetch user profile and businesses from database
  const fetchUserData = useCallback(async () => {
    // CRITICAL: Wait for auth to fully initialize before making any DB requests
    if (authLoading) {
      return;
    }

    if (!user) {
      // OFFLINE FALLBACK: Even without a valid user session, load cached data
      // so the app remains functional with previously cached businesses/tier
      if (!isOnline) {
        await loadOfflineData();
        return;
      }
      profileCreateAttempted.current = false;
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
        isInGracePeriod: false,
        gracePeriodEndsAt: null,
      });
      return;
    }

    // OFFLINE: Use cached data instead of network requests
    if (!isOnline) {
      await loadOfflineData();
      return;
    }

    try {
      // Fetch profile for subscription tier and trial info
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, email, created_at, trial_started_at, trial_expires_at, has_selected_initial_tier')
        .eq('id', user.id)
        .single();

      // Defensive check: Create profile if it doesn't exist (handles edge case)
      if (profileError && profileError.code === 'PGRST116') {
        if (profileCreateAttempted.current) {
          logger.warn('[SubscriptionContext] Profile creation already attempted, skipping retry');
          setState(prev => ({ ...prev, loading: false }));
          return;
        }
        profileCreateAttempted.current = true;
        logger.warn('[SubscriptionContext] No profile found, creating one...');
        const { error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            subscription_tier: 'free',
          }, { onConflict: 'id' });

        if (createError) {
          logger.error('[SubscriptionContext] Failed to create profile:', createError);
          setState(prev => ({ ...prev, loading: false }));
          return;
        } else {
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('subscription_tier, email, created_at, trial_started_at, trial_expires_at, has_selected_initial_tier')
            .eq('id', user.id)
            .maybeSingle();
          profile = newProfile;
        }
      } else if (profileError) {
        logger.error('[SubscriptionContext] Profile fetch error:', profileError);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Fetch businesses (exclude soft-deleted)
      const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
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

      // Cache businesses to IndexedDB and tier to localStorage for offline use
      const baseTier = (profile?.subscription_tier as SubscriptionTier) || 'free';
      safeLocalStorage.setItem('taxforge_cached_tier', baseTier);
      safeLocalStorage.setItem('taxforge_cached_email', profile?.email || user.email || '');
      cacheBusinessesToIDB(mappedBusinesses).catch(err => 
        logger.error('[SubscriptionContext] Failed to cache businesses:', err)
      );

      // Calculate trial status using the dedicated fields
      let isOnTrial = false;
      let trialEndsAt: Date | null = null;
      let effectiveTier = baseTier;

      if (profile?.trial_expires_at) {
        trialEndsAt = new Date(profile.trial_expires_at);
        const now = new Date();
        isOnTrial = now < trialEndsAt;
        if (isOnTrial) {
          effectiveTier = baseTier;
        } else {
          effectiveTier = 'free';
        }
      }

      // Check for grace period on active subscription
      let isInGracePeriod = false;
      let gracePeriodEndsAt: Date | null = null;

      const { data: activeSub } = await supabase
        .from('paystack_subscriptions')
        .select('grace_period_ends_at, status')
        .eq('user_id', user.id)
        .in('status', ['past_due', 'active', 'non_renewing'])
        .not('grace_period_ends_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeSub?.grace_period_ends_at) {
        gracePeriodEndsAt = new Date(activeSub.grace_period_ends_at);
        isInGracePeriod = new Date() < gracePeriodEndsAt;
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
        isInGracePeriod,
        gracePeriodEndsAt,
      });
    } catch (error) {
      logger.error('Error fetching user data:', error);
      // If network error while offline, try cached data
      if (!navigator.onLine) {
        await loadOfflineData();
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [user, authLoading, isOnline, loadOfflineData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Set up realtime subscription for profile changes (tier updates)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          logger.debug('Profile updated in real-time:', payload);
          const newTier = (payload.new as { subscription_tier: SubscriptionTier }).subscription_tier;
          const trialExpiresAt = (payload.new as { trial_expires_at: string | null }).trial_expires_at;
          
          setState(prev => ({
            ...prev,
            tier: newTier,
            effectiveTier: newTier,
            trialEndsAt: trialExpiresAt ? new Date(trialExpiresAt) : null,
            isOnTrial: trialExpiresAt ? new Date(trialExpiresAt) > new Date() : false,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    logger.debug('[SubscriptionContext] Force refreshing subscription...');
    setState(prev => ({ ...prev, loading: true }));
    await fetchUserData();
    logger.debug('[SubscriptionContext] Refresh complete');
  }, [fetchUserData]);

  const refreshBusinesses = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Subscribe to business changes for immediate UI updates across all pages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`business-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'businesses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          logger.debug('Business changed in real-time:', payload.eventType);
          refreshBusinesses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshBusinesses]);

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
      logger.error('Error adding business:', error);
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

    // Use soft delete function for cascade delete
    const { error } = await supabase.rpc('soft_delete_business', {
      business_uuid: id,
      deleting_user_id: user.id
    });

    if (error) {
      logger.error('Error soft-deleting business:', error);
      throw error;
    }

    setState(prev => ({
      ...prev,
      savedBusinesses: prev.savedBusinesses.filter(b => b.id !== id),
      businessCount: Math.max(0, prev.businessCount - 1),
    }));
  };

  const restoreBusiness = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.rpc('restore_business', {
      business_uuid: id,
      restoring_user_id: user.id
    });

    if (error) {
      logger.error('Error restoring business:', error);
      throw error;
    }

    // Refresh businesses to get the restored one
    await refreshBusinesses();
  };

  const getDeletedBusinesses = useCallback(async (): Promise<SavedBusiness[]> => {
    if (!user) return [];

    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    return (businesses || []).map(b => ({
      id: b.id,
      name: b.name,
      entityType: b.entity_type as 'company' | 'business_name',
      turnover: Number(b.turnover),
      createdAt: new Date(b.created_at),
      deletedAt: b.deleted_at ? new Date(b.deleted_at) : undefined,
      sector: b.sector || undefined,
      subSector: b.sub_sector || undefined,
      verificationStatus: b.cac_verified ? 'verified' : 'not_verified',
    }));
  }, [user]);

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
  const canAccessScenarioModeling = () => state.effectiveTier === 'professional' || state.effectiveTier === 'business' || state.effectiveTier === 'corporate';
  const canVerifyCAC = () => state.effectiveTier === 'business' || state.effectiveTier === 'corporate';
  // Only free tier shows watermark (Starter, Basic+ all have no watermarks)
  const showWatermark = () => state.effectiveTier === 'free';
  
  // Export feature tier checks
  // Excel export: Basic+ tiers
  const canExportExcel = () => ['basic', 'professional', 'business', 'corporate'].includes(state.effectiveTier);
  // Email reports: Basic+ tiers
  const canEmailReports = () => ['basic', 'professional', 'business', 'corporate'].includes(state.effectiveTier);
  // Bulk export (ZIP): Business+ tiers only
  const canBulkExport = () => ['business', 'corporate'].includes(state.effectiveTier);
  // Digital signature and QR verification: Professional+ tiers
  const canAddDigitalSignature = () => ['professional', 'business', 'corporate'].includes(state.effectiveTier);
  const canAddQRVerification = () => ['professional', 'business', 'corporate'].includes(state.effectiveTier);

  const upgradeTier = async (newTier: SubscriptionTier) => {
    if (!user) return;
    
    const previousTier = state.tier;
    const isDowngrade = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'].indexOf(newTier) < 
                        ['free', 'starter', 'basic', 'professional', 'business', 'corporate'].indexOf(previousTier);
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    // Update profile
    await supabase
      .from('profiles')
      .update({ subscription_tier: newTier })
      .eq('id', user.id);

    // Log subscription history
    await supabase
      .from('subscription_history')
      .insert({
        user_id: user.id,
        previous_tier: previousTier,
        new_tier: newTier,
        change_type: isDowngrade ? 'downgrade' : 'upgrade',
        metadata: {
          timestamp: new Date().toISOString(),
          previous_trial_status: state.isOnTrial,
        }
      });

    // If downgrading, create data snapshot for future reference
    if (isDowngrade) {
      const dataCounts = await Promise.all([
        supabase.from('businesses').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('expenses').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('tax_calculations').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      ]);

      const snapshots = [
        { data_type: 'businesses', data_count: dataCounts[0].count || 0 },
        { data_type: 'invoices', data_count: dataCounts[1].count || 0 },
        { data_type: 'expenses', data_count: dataCounts[2].count || 0 },
        { data_type: 'calculations', data_count: dataCounts[3].count || 0 },
      ].filter(s => s.data_count > 0);

      for (const snapshot of snapshots) {
        await supabase.from('tier_data_snapshots').insert({
          user_id: user.id,
          snapshot_tier: previousTier,
          data_type: snapshot.data_type,
          data_count: snapshot.data_count,
          notes: `Data preserved from ${previousTier} tier`,
        });
      }
    }

    // Send tier change email notification (fire and forget)
    supabase.functions.invoke('send-tier-change-email', {
      body: {
        email: user.email,
        userName: user.user_metadata?.full_name || user.user_metadata?.name,
        previousTier,
        newTier,
        changeType: isDowngrade ? 'downgrade' : 'upgrade',
      }
    }).catch(err => {
      logger.error('Failed to send tier change email:', err);
    });

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
        restoreBusiness,
        getDeletedBusinesses,
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
        refreshSubscription,
        canExportExcel,
        canEmailReports,
        canBulkExport,
        canAddDigitalSignature,
        canAddQRVerification,
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
