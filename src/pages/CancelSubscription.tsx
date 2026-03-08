import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Heart, 
  Loader2,
  Gift,
  MessageSquare
} from 'lucide-react';
import logger from '@/lib/logger';

const cancellationReasons = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using', label: "I'm not using it enough" },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'temporary', label: 'Just need a break, may come back' },
  { value: 'business_closed', label: 'My business has closed' },
  { value: 'other', label: 'Other reason' },
];

export default function CancelSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'reason' | 'feedback' | 'confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [wouldReturn, setWouldReturn] = useState<string>('');

  const handleCancel = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('paystack-cancel-subscription', {
        body: {
          reason: selectedReason === 'other' ? otherReason : selectedReason,
          feedback: {
            category: selectedReason,
            suggestions,
            wouldReturn,
          }
        },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error);

      toast.success('Subscription cancelled', {
        description: `You'll have access until ${new Date(response.data.accessUntil).toLocaleDateString()}`,
      });
      navigate('/billing');
    } catch (err) {
      logger.error('Cancellation error:', err);
      toast.error('Failed to cancel subscription', {
        description: err instanceof Error ? err.message : 'Please try again or contact support',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Please sign in</h2>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </PageLayout>
    );
  }

  if (tier === 'free') {
    return (
      <PageLayout maxWidth="2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Active Subscription</h2>
            <p className="text-muted-foreground mb-4">You don't have an active paid subscription to cancel.</p>
            <Button onClick={() => navigate('/pricing')}>View Plans</Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="2xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/billing')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Billing
        </Button>
      </div>

      {step === 'reason' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancel Subscription
            </CardTitle>
            <CardDescription>
              We're sorry to see you go! Please tell us why you're cancelling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Retention offer */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Before you go...</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Would you like 20% off your next 3 months? Contact our support team to claim this offer.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary" asChild>
                    <a href="mailto:support@taxforgeng.com?subject=Retention%20Offer">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Why are you cancelling?</Label>
              <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                {cancellationReasons.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="font-normal cursor-pointer">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {selectedReason === 'other' && (
                <Textarea
                  placeholder="Please tell us more..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate('/billing')} className="flex-1">
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStep('feedback')}
                disabled={!selectedReason || (selectedReason === 'other' && !otherReason.trim())}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'feedback' && (
        <Card>
          <CardHeader>
            <CardTitle>Help us improve</CardTitle>
            <CardDescription>
              Your feedback helps us build a better product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Would you ever come back?</Label>
              <RadioGroup value={wouldReturn} onValueChange={setWouldReturn}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="return-yes" />
                  <Label htmlFor="return-yes" className="font-normal cursor-pointer">
                    Yes, if things change
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maybe" id="return-maybe" />
                  <Label htmlFor="return-maybe" className="font-normal cursor-pointer">
                    Maybe, depends on improvements
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="return-no" />
                  <Label htmlFor="return-no" className="font-normal cursor-pointer">
                    Probably not
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Any suggestions for us? (Optional)</Label>
              <Textarea
                placeholder="What could we have done better?"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('reason')} className="flex-1">
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStep('confirm')}
                className="flex-1"
              >
                Continue to Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Cancellation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">When you cancel:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• You'll keep access until your current billing period ends</li>
                <li>• Your data will be preserved and accessible if you resubscribe</li>
                <li>• You'll be downgraded to the Free plan after your period ends</li>
                <li>• Some features may become limited based on the Free plan</li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <span className="font-medium">We'd love to have you back</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                You can resubscribe anytime and your data will be waiting for you.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate('/billing')} className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
