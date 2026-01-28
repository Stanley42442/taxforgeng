import { useState, useEffect } from 'react';
import { Check, X, Phone, MapPin, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { NIGERIAN_STATES } from '@/lib/nigerianStates';
import type { SubscriptionTier } from '@/contexts/SubscriptionContext';

interface TierUpgradeRequirementsProps {
  open: boolean;
  onClose: () => void;
  targetTier: SubscriptionTier;
  onRequirementsMet: () => void;
}

interface UserProfile {
  whatsapp_number: string | null;
  whatsapp_verified: boolean | null;
  state_of_residence: string | null;
  tin: string | null;
  kyc_level: number | null;
  email_verified: boolean;
}

// KYC requirements per tier
const TIER_REQUIREMENTS: Record<SubscriptionTier, {
  phoneRequired: boolean;
  stateRequired: boolean;
  tinRequired: boolean;
  minKycLevel: number;
}> = {
  free: { phoneRequired: false, stateRequired: false, tinRequired: false, minKycLevel: 0 },
  starter: { phoneRequired: true, stateRequired: false, tinRequired: false, minKycLevel: 1 },
  basic: { phoneRequired: true, stateRequired: false, tinRequired: false, minKycLevel: 1 },
  professional: { phoneRequired: true, stateRequired: true, tinRequired: false, minKycLevel: 2 },
  business: { phoneRequired: true, stateRequired: true, tinRequired: true, minKycLevel: 3 },
  corporate: { phoneRequired: true, stateRequired: true, tinRequired: true, minKycLevel: 3 },
};

const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  basic: 'Basic',
  professional: 'Professional',
  business: 'Business',
  corporate: 'Corporate',
};

export const TierUpgradeRequirements = ({
  open,
  onClose,
  targetTier,
  onRequirementsMet,
}: TierUpgradeRequirementsProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [phone, setPhone] = useState('');
  const [stateOfResidence, setStateOfResidence] = useState('');
  const [tin, setTin] = useState('');

  const requirements = TIER_REQUIREMENTS[targetTier];

  useEffect(() => {
    if (user && open) {
      fetchProfile();
    }
  }, [user, open]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Query only columns that exist in current types
      const { data, error } = await supabase
        .from('profiles')
        .select('whatsapp_number, whatsapp_verified')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile({
        whatsapp_number: data?.whatsapp_number || null,
        whatsapp_verified: data?.whatsapp_verified || null,
        state_of_residence: null,
        tin: null,
        kyc_level: 0,
        email_verified: !!user.email_confirmed_at,
      });

      if (data?.whatsapp_number) setPhone(data.whatsapp_number);
      // state_of_residence and tin will be pre-filled after types regenerate
    } catch {
      // Silent fail - use defaults
    } finally {
      setLoading(false);
    }
  };

  const validateNigerianPhone = (phoneNumber: string): boolean => {
    // Nigerian phone format: +234 or 0 followed by 7, 8, or 9, then 0 or 1, then 8 more digits
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const formatNigerianNumber = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\s/g, '');
    if (cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    }
    return cleaned;
  };

  const validateTIN = (tinNumber: string): boolean => {
    // Nigerian TIN format: typically 10-11 digits
    const tinRegex = /^\d{10,11}$/;
    return tinRegex.test(tinNumber.replace(/[-\s]/g, ''));
  };

  const checkRequirements = (): { met: boolean; missing: string[] } => {
    const missing: string[] = [];

    if (!profile?.email_verified) {
      missing.push('Email verification');
    }

    if (requirements.phoneRequired && !profile?.whatsapp_number && !phone) {
      missing.push('Phone number');
    }

    if (requirements.stateRequired && !profile?.state_of_residence && !stateOfResidence) {
      missing.push('State of residence');
    }

    if (requirements.tinRequired && !profile?.tin && !tin) {
      missing.push('Tax Identification Number (TIN)');
    }

    return { met: missing.length === 0, missing };
  };

  const handleSaveAndContinue = async () => {
    if (!user) return;

    // Validate phone if provided
    if (phone && !validateNigerianPhone(phone)) {
      toast.error('Please enter a valid Nigerian phone number');
      return;
    }

    // Validate TIN if required and provided
    if (requirements.tinRequired && tin && !validateTIN(tin)) {
      toast.error('Please enter a valid 10-11 digit TIN');
      return;
    }

    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};

      if (phone && phone !== profile?.whatsapp_number) {
        updates.whatsapp_number = formatNigerianNumber(phone);
        // Note: whatsapp_verified stays false until OTP verification is implemented
      }

      if (stateOfResidence && stateOfResidence !== profile?.state_of_residence) {
        updates.state_of_residence = stateOfResidence;
      }

      if (tin && tin !== profile?.tin) {
        updates.tin = tin.replace(/[-\s]/g, '');
      }

      // Update KYC level based on completed requirements
      let newKycLevel = profile?.kyc_level || 0;
      if (updates.whatsapp_number || profile?.whatsapp_number) newKycLevel = Math.max(newKycLevel, 1);
      if ((updates.state_of_residence || profile?.state_of_residence) && newKycLevel >= 1) newKycLevel = Math.max(newKycLevel, 2);
      if ((updates.tin || profile?.tin) && newKycLevel >= 2) newKycLevel = Math.max(newKycLevel, 3);
      
      updates.kyc_level = newKycLevel;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;
      }

      toast.success('Profile updated successfully');
      onRequirementsMet();
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const { met, missing } = checkRequirements();

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to {TIER_DISPLAY_NAMES[targetTier]}</DialogTitle>
          <DialogDescription>
            To unlock {TIER_DISPLAY_NAMES[targetTier]} features, please complete the following:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email verification status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            {profile?.email_verified ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-destructive" />
            )}
            <span className={profile?.email_verified ? 'text-foreground' : 'text-muted-foreground'}>
              Email verified
            </span>
          </div>

          {/* Phone number */}
          {requirements.phoneRequired && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {profile?.whatsapp_number ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-destructive" />
                )}
                <span>Phone number</span>
              </div>
              {!profile?.whatsapp_number && (
                <div className="pl-4">
                  <Label className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4" />
                    Nigerian Phone Number
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    WhatsApp verification will be enabled soon
                  </p>
                </div>
              )}
            </div>
          )}

          {/* State of residence */}
          {requirements.stateRequired && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {profile?.state_of_residence ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-destructive" />
                )}
                <span>State of residence</span>
              </div>
              {!profile?.state_of_residence && (
                <div className="pl-4">
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    State of Residence
                  </Label>
                  <Select value={stateOfResidence} onValueChange={setStateOfResidence}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* TIN */}
          {requirements.tinRequired && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {profile?.tin ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-destructive" />
                )}
                <span>Tax Identification Number (TIN)</span>
              </div>
              {!profile?.tin && (
                <div className="pl-4">
                  <Label className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    TIN Number
                  </Label>
                  <Input
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                    placeholder="Enter your 10-11 digit TIN"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your TIN from the Federal Inland Revenue Service (FIRS)
                  </p>
                </div>
              )}
            </div>
          )}

          {missing.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete the missing requirements above to continue with your upgrade.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Stay on Current Plan
          </Button>
          <Button 
            onClick={handleSaveAndContinue} 
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Complete & Upgrade'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
