import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoyaltyPointsCard } from "@/components/LoyaltyPointsCard";
import {
  Gift,
  Users,
  Copy,
  Share2,
  Check,
  Clock,
  Trophy,
  Percent,
  Sparkles,
} from "lucide-react";
import logger from "@/lib/logger";

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  reward_claimed: boolean;
  created_at: string;
  completed_at: string | null;
}

interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  expires_at: string;
  is_used: boolean;
  owner_type: string;
}

const Referrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || "XXXXXX";
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  useEffect(() => {
    if (user) {
      fetchReferrals();
      fetchDiscountCodes();
    }
  }, [user]);

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      logger.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscountCodes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("referral_discount_codes")
        .select("*")
        .eq("owner_user_id", user.id)
        .eq("is_used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDiscountCodes(data || []);
    } catch (error) {
      logger.error("Error fetching discount codes:", error);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyDiscountCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Discount code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Check out TaxForge NG - the smartest tax calculator for Nigerian businesses! Use my referral link to sign up and we both get 10% off: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareViaTwitter = () => {
    const message = encodeURIComponent(
      `I'm using TaxForge NG for all my business tax calculations. Join me with this link and we both get 10% off:`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(referralLink)}`,
      "_blank"
    );
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join me on TaxForge NG - Get 10% Off!");
    const body = encodeURIComponent(
      `Hi!\n\nI've been using TaxForge NG for my business tax calculations and it's been great.\n\nUse my referral link to sign up and you'll get 10% off your first subscription:\n${referralLink}\n\nCheers!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const completedReferrals = referrals.filter((r) => r.status === "completed").length;
  const pendingReferrals = referrals.filter((r) => r.status === "pending").length;

  if (!user) {
    return (
      <PageLayout title="Referral Program" description="Invite friends and earn rewards" icon={Gift} maxWidth="lg">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign in to access referrals</h2>
            <p className="text-muted-foreground mb-4">
              Create an account to get your unique referral link and start earning rewards.
            </p>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Invite Friends, Earn Rewards" description="Share TaxForge NG and both get 10% off when friends upgrade" icon={Gift} maxWidth="4xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass-frosted">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
            <p className="text-sm text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="glass-frosted">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{pendingReferrals}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass-frosted">
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{completedReferrals}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="glass-frosted">
          <CardContent className="pt-6 text-center">
            <Percent className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{discountCodes.length}</p>
            <p className="text-sm text-muted-foreground">Active Discounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Referral Link Card */}
          <Card className="glass-frosted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Your Referral Link
              </CardTitle>
              <CardDescription>Share this link with friends - you both get 10% off!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input value={referralLink} readOnly className="font-mono text-sm" />
                <Button onClick={copyLink} variant="outline" className="shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={shareViaWhatsApp} variant="outline" size="sm" className="gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button onClick={shareViaTwitter} variant="outline" size="sm" className="gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </Button>
                <Button onClick={shareViaEmail} variant="outline" size="sm" className="gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Discount Codes */}
          {discountCodes.length > 0 && (
            <Card className="glass-frosted border-success/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-success" />
                  Your Reward Codes
                </CardTitle>
                <CardDescription>Use these codes on your next subscription payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discountCodes.map((code) => (
                    <div 
                      key={code.id}
                      className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            {code.discount_percentage}% OFF
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {code.owner_type === 'referrer' ? 'Referral Reward' : 'Welcome Bonus'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires {new Date(code.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyDiscountCode(code.code)}
                        className="gap-1 font-mono"
                      >
                        {copiedCode === code.code ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            {code.code}
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Referral History */}
          <Card className="glass-frosted">
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                </div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No referrals yet</p>
                  <p className="text-sm text-muted-foreground">Share your link to start earning rewards</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">{referral.referred_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString()}
                          {referral.completed_at && (
                            <span className="text-success ml-2">
                              • Completed {new Date(referral.completed_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge 
                        variant={referral.status === "completed" ? "default" : "secondary"}
                        className={referral.status === "completed" ? "bg-success/10 text-success" : ""}
                      >
                        {referral.status === "completed" ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {referral.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Loyalty Points Card */}
          <LoyaltyPointsCard />

          {/* How it Works */}
          <Card className="glass-frosted">
            <CardHeader>
              <CardTitle className="text-lg">How it Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Share Your Link</h4>
                  <p className="text-xs text-muted-foreground">Send your unique referral link to friends</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Friend Signs Up</h4>
                  <p className="text-xs text-muted-foreground">They get 10% off their first subscription</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">You Earn Rewards</h4>
                  <p className="text-xs text-muted-foreground">Get 10% off + 1,000 loyalty points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Referrals;
