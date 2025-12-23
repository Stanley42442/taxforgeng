import { useState } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  CreditCard,
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
    icon: CreditCard,
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "testing":
      return "text-success bg-success/10 border-success/20";
    case "in-progress":
      return "text-primary bg-primary/10 border-primary/20";
    case "planned":
      return "text-muted-foreground bg-muted border-border";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "testing":
      return "In Testing";
    case "in-progress":
      return "In Progress";
    case "planned":
      return "Planned";
    default:
      return status;
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
      const { error } = await supabase.from('waitlist').insert({
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
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <Map className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Roadmap & Coming Soon
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what we're building next for TaxForge NG. Subscribe to Business+ 
              to help fund faster development and get early access to new features.
            </p>
          </div>

          {/* Waitlist Signup */}
          <Card className="mb-10 shadow-card animate-fade-in border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Get Early Access
              </CardTitle>
              <CardDescription>
                Join our waitlist to be notified when new features launch
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-4 animate-fade-in">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                  <p className="font-medium text-foreground">You're on the list!</p>
                  <p className="text-sm text-muted-foreground">
                    We'll email you when new features are ready.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name (optional)</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feature">Most Interested In</Label>
                      <Select value={feature} onValueChange={setFeature}>
                        <SelectTrigger>
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
                  <div className="flex justify-center">
                    <Button type="submit" variant="hero" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Roadmap Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {ROADMAP_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.title} 
                  className="shadow-card animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.quarter}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        {item.tier}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.description}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Upgrade CTA */}
          <Card className="mt-10 shadow-card border-warning/20 bg-gradient-to-br from-warning/5 to-transparent animate-fade-in">
            <CardContent className="pt-6 text-center">
              <Rocket className="h-10 w-10 text-warning mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-2">
                Help Us Build Faster
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Subscribe to Business+ or Corporate tier to fund development 
                and get early access to features before they're publicly available.
              </p>
              <Button variant="hero" onClick={() => window.location.href = '/pricing'}>
                View Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            Roadmap items are subject to change. Timelines are estimates only. 
            We'll notify waitlist members of any significant updates.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
