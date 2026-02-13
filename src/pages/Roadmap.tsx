import { useState } from "react";
import { SEOHead, createBreadcrumbSchema } from "@/components/seo/SEOHead";
import { PageLayout } from "@/components/PageLayout";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { ContentMeta } from "@/components/seo/ContentMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Map,
  Rocket,
  Zap,
  Building2,
  Bot,
  FileText,
  Landmark,
  Users,
  Shield,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ROADMAP_ITEMS = [
  { title: "Real CAC API Integration", description: "Direct verification with Corporate Affairs Commission.", icon: Building2, progress: 35, status: "in-progress", quarter: "Q1 2026", tier: "Business+" },
  { title: "Bank Feed Integration", description: "Connect your Nigerian bank accounts for automatic import.", icon: Landmark, progress: 20, status: "in-progress", quarter: "Q2 2026", tier: "Business+" },
  { title: "AI Tax Assistant", description: "Chat with an AI that understands Nigerian tax law.", icon: Bot, progress: 45, status: "in-progress", quarter: "Q1 2026", tier: "All Tiers" },
  { title: "Direct NRS E-Filing", description: "Submit your tax returns directly to NRS.", icon: FileText, progress: 15, status: "planned", quarter: "Q2 2026", tier: "Business+" },
  { title: "Multi-User Team Access", description: "Invite accountants and staff with role-based permissions.", icon: Users, progress: 60, status: "in-progress", quarter: "Q1 2026", tier: "Business+" },
  { title: "Audit Trail & Compliance Reports", description: "Comprehensive logs for tax audits.", icon: Shield, progress: 75, status: "testing", quarter: "Q4 2025", tier: "Corporate" },
  { title: "Bulk Operations", description: "Process multiple businesses in batch operations.", icon: Zap, progress: 40, status: "in-progress", quarter: "Q1 2026", tier: "Corporate" },
  { title: "Mobile App", description: "Native iOS and Android apps.", icon: Rocket, progress: 10, status: "planned", quarter: "Q3 2026", tier: "All Tiers" },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "testing": return { label: 'In Testing', bgColor: 'bg-success/10', textColor: 'text-success', borderColor: 'border-success/30', glowClass: 'glow-success' };
    case "in-progress": return { label: 'In Progress', bgColor: 'bg-primary/10', textColor: 'text-primary', borderColor: 'border-primary/30', glowClass: 'glow-primary' };
    case "planned": return { label: 'Planned', bgColor: 'bg-muted', textColor: 'text-muted-foreground', borderColor: 'border-border', glowClass: '' };
    default: return { label: status, bgColor: 'bg-muted', textColor: 'text-muted-foreground', borderColor: 'border-border', glowClass: '' };
  }
};

const Roadmap = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [feature, setFeature] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);

    try {
      const { error } = await (supabase.from('waitlist') as any).insert({
        email: email.trim(), name: name.trim() || null, feature_interest: feature || null, user_id: user?.id || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("You're on the list!");
    } catch (error) {
      toast.error("Failed to join waitlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEOHead
      title="TaxForge NG Product Roadmap - Coming Soon Features"
      description="See what's next for TaxForge NG: CAC API integration, bank feeds, AI tax assistant, direct NRS e-filing, and mobile app. Join the waitlist for early access."
      canonicalPath="/roadmap"
      keywords="TaxForge roadmap, Nigerian tax software features, NRS e-filing, FIRS e-filing, tax app Nigeria"
      schema={createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Roadmap', url: 'https://taxforgeng.com/roadmap' },
      ])}
    />
    <PageLayout title="Roadmap & Coming Soon" description="See what we're building next for TaxForge NG" icon={Map}>
      <article>
      <PageBreadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Roadmap' },
      ]} />
      <ContentMeta published="2026-02-09" publishedLabel="9 February 2026" updated="2026-02-13" updatedLabel="13 February 2026" />

      {/* Waitlist Signup */}
      <div className="neon-border p-8 mb-12 animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Get Early Access</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Join Our Waitlist</h2>
          <p className="text-muted-foreground">Be the first to know when new features launch</p>
        </div>
        
        {submitted ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-success/20 glow-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <p className="text-xl font-semibold text-foreground">You're on the list!</p>
          </div>
        ) : (
          <form onSubmit={handleWaitlistSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Name (optional)</Label>
                <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Most Interested In</Label>
                <Select value={feature} onValueChange={setFeature}>
                  <SelectTrigger><SelectValue placeholder="Select feature" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cac-api">CAC Integration</SelectItem>
                    <SelectItem value="bank-feed">Bank Feeds</SelectItem>
                    <SelectItem value="ai-assistant">AI Assistant</SelectItem>
                    <SelectItem value="e-filing">Direct E-Filing</SelectItem>
                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                    <SelectItem value="all">All Features</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-center">
              <Button type="submit" variant="glow" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Joining...</> : <>Join Waitlist<ArrowRight className="h-5 w-5" /></>}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Roadmap Items */}
      <div className="grid gap-5 lg:grid-cols-2 animate-slide-up-delay-1">
        {ROADMAP_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const statusConfig = getStatusConfig(item.status);
          
          return (
            <div key={item.title} className="glass-frosted rounded-2xl p-6 hover-lift relative overflow-hidden">
              {item.status === 'testing' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success via-success to-transparent" />}
              {item.status === 'in-progress' && <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary via-primary to-transparent" style={{ width: `${item.progress}%` }} />}

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${statusConfig.bgColor} ${statusConfig.glowClass}`}>
                    <Icon className={`h-6 w-6 ${statusConfig.textColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{item.quarter}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
                  {item.tier}
                </span>
              </div>
              
              <p className="text-muted-foreground mb-4">{item.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      <div className="mt-12 glass-frosted rounded-3xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-gradient-accent glow-accent flex items-center justify-center mx-auto mb-4">
          <Rocket className="h-8 w-8 text-accent-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">Help Us Build Faster</h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Subscribe to Business+ or Corporate tier to fund development and get early access.
        </p>
        <Button variant="glowAccent" size="lg" onClick={() => window.location.href = '/pricing'}>
          View Plans<ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-10">
        Roadmap items are subject to change. Timelines are estimates only.
      </p>
      </article>
    </PageLayout>
    </>
  );
};

export default Roadmap;
