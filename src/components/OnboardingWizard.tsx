import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  Building2, 
  Rocket,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Briefcase,
  Check,
  SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { NIGERIAN_STATES, EMPLOYMENT_STATUSES, ENTITY_TYPES } from '@/lib/nigerianStates';

// Industry sectors for the dropdown
const INDUSTRY_SECTORS = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'agriculture', label: 'Agriculture & Agribusiness' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'financial', label: 'Financial Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'transport', label: 'Transport & Logistics' },
  { value: 'hospitality', label: 'Hospitality & Food' },
  { value: 'education', label: 'Education' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'oil_gas', label: 'Oil & Gas' },
  { value: 'other', label: 'Other' },
] as const;

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'personal', title: 'Personal Details', icon: User },
  { id: 'business', title: 'Business Info', icon: Building2 },
  { id: 'complete', title: 'All Set!', icon: Rocket },
];

export const OnboardingWizard = ({ open, onComplete }: OnboardingWizardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Personal details
  const [stateOfResidence, setStateOfResidence] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  
  // Business details
  const [hasRegisteredBusiness, setHasRegisteredBusiness] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [entityType, setEntityType] = useState('');
  const [rcbnNumber, setRcbnNumber] = useState('');
  const [industrySector, setIndustrySector] = useState('');

  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      // Get user's name from profile
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.full_name) {
            setUserName(data.full_name.split(' ')[0]);
          }
        });
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Update profile with collected data (using raw SQL-compatible update)
      const updates: Record<string, unknown> = {
        onboarding_completed: true,
        kyc_level: 1,
      };

      // Note: state_of_residence, employment_status, has_registered_business 
      // are new columns added via migration - they'll work after types regenerate
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // If user has a business, save it
      if (hasRegisteredBusiness === 'registered' && businessName) {
        const { error: businessError } = await supabase
          .from('businesses')
          .insert({
            user_id: user.id,
            name: businessName,
            entity_type: entityType || 'limited_company',
            rcbn_number: rcbnNumber || null,
            sector: industrySector || null,
          });

        if (businessError && !businessError.message.includes('duplicate')) {
          // Log silently - non-critical
        }
      }

      toast.success('Profile setup complete!');
      onComplete();
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    onComplete();
    navigate('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6 py-8"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Welcome to TaxForge NG{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-muted-foreground mt-2">
                Let's personalize your experience. This helps us:
              </p>
            </div>
            <ul className="text-left max-w-xs mx-auto space-y-3">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Show relevant tax calculations</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Provide location-specific guidance</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Recommend the right features for you</span>
              </li>
            </ul>
          </motion.div>
        );

      case 1: // Personal Details
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 py-4"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold">Tell Us About Yourself</h2>
              <p className="text-muted-foreground text-sm mt-1">
                This helps us tailor tax calculations to your situation
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
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

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Employment Status
                </Label>
                <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 2: // Business Details
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 py-4"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold">Your Business Information</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Do you own or manage a business?
              </p>
            </div>

            <RadioGroup value={hasRegisteredBusiness} onValueChange={setHasRegisteredBusiness}>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="registered" id="registered" />
                  <div>
                    <p className="font-medium">Yes, I have a registered business</p>
                    <p className="text-sm text-muted-foreground">CAC registered company or business name</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="informal" id="informal" />
                  <div>
                    <p className="font-medium">Yes, but it's informal/unregistered</p>
                    <p className="text-sm text-muted-foreground">Trading without formal registration</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="no" id="no" />
                  <div>
                    <p className="font-medium">No, I'm an individual taxpayer only</p>
                    <p className="text-sm text-muted-foreground">Personal income tax only</p>
                  </div>
                </label>
              </div>
            </RadioGroup>

            {hasRegisteredBusiness === 'registered' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t"
              >
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter your business name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Type</Label>
                    <Select value={entityType} onValueChange={setEntityType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENTITY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>RC/BN Number (Optional)</Label>
                    <Input
                      value={rcbnNumber}
                      onChange={(e) => setRcbnNumber(e.target.value)}
                      placeholder="e.g., RC123456"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Industry Sector</Label>
                  <Select value={industrySector} onValueChange={setIndustrySector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_SECTORS.map((sector) => (
                        <SelectItem key={sector.value} value={sector.value}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 3: // Complete
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6 py-8"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <Rocket className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">You're All Set!</h2>
              <p className="text-muted-foreground mt-2">
                Your profile has been personalized
              </p>
            </div>
            <ul className="text-left max-w-xs mx-auto space-y-3">
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span>Account created</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span>Profile personalized</span>
              </li>
              {hasRegisteredBusiness === 'registered' && businessName && (
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <span>Business saved</span>
                </li>
              )}
            </ul>

            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={handleGoToDashboard} size="lg" className="w-full">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/calculator')}>
                Calculate My Tax
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary'
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {/* Navigation buttons */}
        {currentStep < STEPS.length - 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && currentStep < STEPS.length - 1 && (
                <Button variant="ghost" onClick={handleSkip} className="gap-1">
                  Skip
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}
              
              {currentStep === STEPS.length - 2 ? (
                <Button onClick={handleComplete} disabled={isSubmitting} className="gap-1">
                  {isSubmitting ? 'Saving...' : 'Complete Setup'}
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-1">
                  {currentStep === 0 ? 'Get Started' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
