import { useState } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ROADMAP_ITEMS = [
  {
    title: "Real CAC API Integration",
    description: "Direct verification with Corporate Affairs Commission for instant business validation.",
    icon: Building2,
    progress: 35,
    status: "in-progress",
    quarter: "Q1 2026",
    tier: "Business+",
  },
  {
    title: "Bank Feed Integration",
    description: "Connect your Nigerian bank accounts for automatic transaction import and categorization.",
    icon: Landmark,
    progress: 20,
    status: "in-progress",
    quarter: "Q2 2026",
    tier: "Business+",
  },
  {
    title: "AI Tax Assistant",
    description: "Chat with an AI that understands Nigerian tax law. Ask questions, get instant answers.",
    icon: Bot,
    progress: 45,
    status: "in-progress",
    quarter: "Q1 2026",
    tier: "All Tiers",
  },
  {
    title: "Direct FIRS E-Filing",
    description: "Submit your tax returns directly to FIRS through our platform. No more manual filing.",
    icon: FileText,
    progress: 15,
    status: "planned",
    quarter: "Q2 2026",
    tier: "Business+",
  },
  {
    title: "Multi-User Team Access",
    description: "Invite accountants, partners, and staff with role-based permissions.",
    icon: Users,
    progress: 60,
    status: "in-progress",
    quarter: "Q1 2026",
    tier: "Business+",
  },
  {
    title: "Audit Trail & Compliance Reports",
    description: "Comprehensive logs and reports for tax audits and regulatory compliance.",
    icon: Shield,
    progress: 75,
    status: "testing",
    quarter: "Q4 2025",
    tier: "Corporate",
  },
  {
    title: "Bulk Operations",
    description: "Process multiple businesses, calculations, and filings in batch operations.",
    icon: Zap,
    progress: 40,
    status: "in-progress",
    quarter: "Q1 2026",
    tier: "Corporate",
  },
  {
    title: "Mobile App",
    description: "Native iOS and Android apps for on-the-go tax management.",
    icon: Rocket,
    progress: 10,
    status: "planned",
    quarter: "Q3 2026",
    tier: "All Tiers",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "testing":
      return { 
        label: 'In Testing', 
        bgColor: 'bg-success/10', 
        textColor: 'text-success',
        borderColor: 'border-success/30',
        glowClass: 'glow-success'
      };
    case "in-progress":
      return { 
        label: 'In Progress', 
        bgColor: 'bg-primary/10', 
        textColor: 'text-primary',
        borderColor: 'border-primary/30',
        glowClass: 'glow-primary'
      };
    case "planned":
      return { 
        label: 'Planned', 
        bgColor: 'bg-muted', 
        textColor: 'text-muted-foreground',
        borderColor: 'border-border',
        glowClass: ''
      };
    default:
      return { 
        label: status, 
        bgColor: 'bg-muted', 
        textColor: 'text-muted-foreground',
        borderColor: 'border-border',
        glowClass: ''
      };
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
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const { error } = await (supabase.from('waitlist') as any).insert({
        email: email.trim(),
        name: name.trim() || null,
        feature_interest: feature || null,
        user_id: user?.id || null,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("You're on the list! We'll notify you when new features launch.");
    } catch (error) {
      console.error("Waitlist error:", error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl animate-float" />
        <div className="bg-mesh absolute inset-0" />
        <div className="bg-dots absolute inset-0 opacity-30" />
      </div>

      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1 relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary glow-primary">
              <Map className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Roadmap & Coming Soon
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what we're building next for TaxForge NG. Subscribe to Business+ 
              to help fund faster development and get early access to new features.
            </p>
          </div>

          {/* Waitlist Signup - Premium Glass Card */}
          <div className="neon-border p-8 mb-12 animate-slide-up-delay-1">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Get Early Access</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Join Our Waitlist</h2>
              <p className="text-muted-foreground">
                Be the first to know when new features launch
              </p>
            </div>
            
            {submitted ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-success/20 glow-success flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <p className="text-xl font-semibold text-foreground">You're on the list!</p>
                <p className="text-muted-foreground mt-2">
                  We'll email you when new features are ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Name (optional)</Label>
                    <div className="neumorphic-sm p-1">
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-0 bg-transparent h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email *</Label>
                    <div className="neumorphic-sm p-1">
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-0 bg-transparent h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feature" className="text-foreground">Most Interested In</Label>
                    <Select value={feature} onValueChange={setFeature}>
                      <SelectTrigger className="h-14 neumorphic-sm border-0">
                        <SelectValue placeholder="Select feature" />
                      </SelectTrigger>
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
                <div className="flex justify-center pt-2">
                  <Button type="submit" variant="glow" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join Waitlist
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Roadmap Timeline */}
          <div className="grid gap-5 lg:grid-cols-2 animate-slide-up-delay-2">
            {ROADMAP_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const statusConfig = getStatusConfig(item.status);
              
              return (
                <div 
                  key={item.title} 
                  className="glass-frosted rounded-2xl p-6 hover-lift relative overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Progress Glow Effect */}
                  {item.status === 'testing' && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success via-success to-transparent" />
                  )}
                  {item.status === 'in-progress' && (
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary via-primary to-transparent" style={{ width: `${item.progress}%` }} />
                  )}

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
                            <Clock className="h-3 w-3" />
                            {item.quarter}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
                      {item.tier}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{item.progress}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={item.progress} className="h-2" />
                    </div>
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
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Help Us Build Faster
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Subscribe to Business+ or Corporate tier to fund development 
              and get early access to features before they're publicly available.
            </p>
            <Button variant="glowAccent" size="lg" onClick={() => window.location.href = '/pricing'}>
              View Plans
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-sm text-muted-foreground text-center mt-10">
            Roadmap items are subject to change. Timelines are estimates only. 
            We'll notify waitlist members of any significant updates.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
