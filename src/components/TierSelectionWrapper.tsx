import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TierSelectionModal } from './TierSelectionModal';

export const TierSelectionWrapper = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkInitialTier = async () => {
      if (!user || checking) return;
      
      setChecking(true);
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('has_selected_initial_tier')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          setChecking(false);
          return;
        }
        
        if (profile && !profile.has_selected_initial_tier) {
          setShowModal(true);
        }
      } catch {
        // Silent fail
      } finally {
        setChecking(false);
      }
    };

    checkInitialTier();
  }, [user]);

  const handleComplete = () => {
    setShowModal(false);
    // Refresh the page to update subscription context
    window.location.reload();
  };

  if (!user || !showModal) return null;

  return (
    <TierSelectionModal 
      open={showModal} 
      onComplete={handleComplete}
      userId={user.id}
    />
  );
};
