import { useState, useEffect } from "react";
import logger from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, Edit2, Trash2, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SECTORS = [
  "Technology",
  "Retail",
  "Agriculture",
  "Professional Services",
  "Construction",
  "Accounting",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Finance",
  "Oil & Gas",
  "Other",
];

interface UserReview {
  id: string;
  quote: string;
  author_name: string;
  role: string | null;
  company: string | null;
  sector: string | null;
  metric: string | null;
  metric_label: string | null;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

export const ReviewSubmissionForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<UserReview | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState("");
  const [metric, setMetric] = useState("");
  const [metricLabel, setMetricLabel] = useState("");

  useEffect(() => {
    if (user) {
      fetchExistingReview();
    }
  }, [user]);

  const fetchExistingReview = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_reviews")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching review:", error);
      return;
    }

    if (data) {
      setExistingReview(data);
      setRating(data.rating);
      setQuote(data.quote);
      setAuthorName(data.author_name);
      setRole(data.role || "");
      setCompany(data.company || "");
      setSector(data.sector || "");
      setMetric(data.metric || "");
      setMetricLabel(data.metric_label || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!quote.trim() || !authorName.trim()) {
      toast.error("Please fill in your name and review");
      return;
    }

    setIsLoading(true);

    try {
      const reviewData = {
        user_id: user.id,
        quote: quote.trim(),
        author_name: authorName.trim(),
        role: role.trim() || null,
        company: company.trim() || null,
        sector: sector || null,
        metric: metric.trim() || null,
        metric_label: metricLabel.trim() || null,
        rating,
        is_approved: false,
      };

      if (existingReview) {
        const { error } = await supabase
          .from("user_reviews")
          .update(reviewData)
          .eq("id", existingReview.id);

        if (error) throw error;
        toast.success("Review updated! It will appear after approval.");
      } else {
        const { error } = await supabase
          .from("user_reviews")
          .insert(reviewData);

        if (error) throw error;
        toast.success("Review submitted! It will appear after approval.");
      }

      setIsEditing(false);
      fetchExistingReview();
    } catch (error) {
      logger.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("user_reviews")
        .delete()
        .eq("id", existingReview.id);

      if (error) throw error;

      toast.success("Review deleted");
      setExistingReview(null);
      setQuote("");
      setAuthorName("");
      setRole("");
      setCompany("");
      setSector("");
      setMetric("");
      setMetricLabel("");
      setRating(5);
    } catch (error) {
      logger.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setIsLoading(false);
    }
  };

  // Show existing review view
  if (existingReview && !isEditing) {
    return (
      <Card className="glass-frosted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Your Review
            {existingReview.is_approved ? (
              <span className="inline-flex items-center gap-1 text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                <CheckCircle className="h-3 w-3" /> Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" /> Pending Approval
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${star <= existingReview.rating ? "text-warning fill-warning" : "text-muted"}`}
              />
            ))}
          </div>
          <p className="text-foreground italic">"{existingReview.quote}"</p>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{existingReview.author_name}</p>
            {existingReview.role && existingReview.company && (
              <p>{existingReview.role}, {existingReview.company}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-frosted">
      <CardHeader>
        <CardTitle>{existingReview ? "Edit Your Review" : "Share Your Experience"}</CardTitle>
        <CardDescription>
          Tell us how TaxForge NG has helped your business. Your review will appear after approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= rating ? "text-warning fill-warning" : "text-muted hover:text-warning/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="space-y-2">
            <Label htmlFor="quote">Your Review *</Label>
            <Textarea
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="How has TaxForge NG helped your business?"
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">Your Name *</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Role and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role (Optional)</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., CEO, Founder"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name"
              />
            </div>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <Label htmlFor="sector">Industry (Optional)</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Key Metric */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metric">Key Result (Optional)</Label>
              <Input
                id="metric"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                placeholder="e.g., ₦2M+, 90%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metricLabel">Result Description (Optional)</Label>
              <Input
                id="metricLabel"
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
                placeholder="e.g., Tax Savings, Time Saved"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Send className="h-4 w-4" />
              {isLoading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
