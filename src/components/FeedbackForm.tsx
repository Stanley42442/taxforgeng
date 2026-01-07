import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Star, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedbackFormProps {
  trigger?: React.ReactNode;
}

const CATEGORY_KEYS: Record<string, string> = {
  'general': 'feedback.generalFeedback',
  'feature': 'feedback.featureRequest',
  'bug': 'feedback.bugReport',
  'improvement': 'feedback.improvementSuggestion',
  'praise': 'feedback.praise',
};

const CATEGORIES = ['general', 'feature', 'bug', 'improvement', 'praise'];

export const FeedbackForm = ({ trigger }: FeedbackFormProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to submit feedback');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const { error } = await (supabase.from('feedback') as any).insert({
        user_id: user.id,
        rating,
        category,
        message: message.trim() || null,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      // Reset after delay
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setRating(0);
        setCategory('general');
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <MessageSquare className="h-4 w-4" />
      {t('feedback.giveFeedback')}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="py-8 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{t('feedback.thankYou')}</h3>
            <p className="text-muted-foreground">{t('feedback.helpUsImprove')}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t('feedback.giveFeedback')}
              </DialogTitle>
              <DialogDescription>
                {t('feedback.helpUsImprove')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Star Rating */}
              <div className="space-y-2">
                <Label>{t('feedback.rateExperience')}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'fill-warning text-warning'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">{t('feedback.category')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholder.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(CATEGORY_KEYS[cat])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">{t('feedback.yourFeedback')}</Label>
                <Textarea
                  id="message"
                  placeholder={t('placeholder.tellUsWhatYouThink')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                {t('btn.cancel')}
              </Button>
              <Button 
                variant="hero" 
                onClick={handleSubmit} 
                disabled={loading || rating === 0}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('status.submitting')}
                  </>
                ) : (
                  t('btn.submitFeedback')
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
