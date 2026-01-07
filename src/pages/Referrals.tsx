import { useState, useEffect } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Gift,
  Users,
  Copy,
  Share2,
  Check,
  Clock,
  Trophy,
  ArrowRight,
} from "lucide-react";

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  reward_claimed: boolean;
  created_at: string;
}

const Referrals = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || "XXXXXX";
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  useEffect(() => {
    if (user) {
      fetchReferrals();
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
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Check out TaxForge NG - the smartest tax calculator for Nigerian businesses! Use my referral link to sign up: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareViaTwitter = () => {
    const message = encodeURIComponent(
      `I'm using TaxForge NG for all my business tax calculations. Join me with this link:`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(referralLink)}`,
      "_blank"
    );
  };

  const completedReferrals = referrals.filter((r) => r.status === "completed").length;
  const pendingReferrals = referrals.filter((r) => r.status === "pending").length;
  const totalRewards = completedReferrals; // 1 free month per completed referral

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <NavMenu />
        <main className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Gift className="h-4 w-4" />
              {t('referral.program')}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('referral.title')}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('referral.subtitle')}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                <p className="text-2xl font-bold text-foreground">{totalRewards}</p>
                <p className="text-sm text-muted-foreground">Free Months Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link Card */}
          <Card className="glass-frosted mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link with friends. You'll earn a free month when they upgrade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                />
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
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card className="glass-frosted mb-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-semibold mb-1">Share Your Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Send your unique referral link to friends
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-primary">2</span>
                  </div>
                  <h4 className="font-semibold mb-1">Friend Signs Up</h4>
                  <p className="text-sm text-muted-foreground">
                    They create an account using your link
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-primary">3</span>
                  </div>
                  <h4 className="font-semibold mb-1">Earn Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Get a free month when they upgrade
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-sm text-muted-foreground">
                    Share your link to start earning rewards!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <p className="font-medium">{referral.referred_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={referral.status === "completed" ? "default" : "secondary"}
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
      </main>
    </div>
  );
};

export default Referrals;
