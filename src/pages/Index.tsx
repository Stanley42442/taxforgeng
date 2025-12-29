import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  FileText, 
  Shield, 
  TrendingUp, 
  Building2, 
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { NavMenu } from "@/components/NavMenu";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden relative">
      {/* Background Mesh Pattern */}
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-40 left-1/4 w-56 h-56 rounded-full bg-primary/5 blur-3xl animate-float-slow pointer-events-none" />
      
      <NavMenu />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-12 pt-8 md:pt-16 md:pb-16 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-accent animate-pulse-soft" />
              Updated for Nigeria Tax Act 2025
            </div>
            
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Smart Tax Advice for
              <span className="block text-gradient bg-gradient-to-r from-primary via-primary to-accent bg-clip-text">Nigerian Businesses</span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Get personalized business structure recommendations and accurate tax calculations. 
              Built for small businesses and individuals navigating Nigeria's tax landscape.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/advisory">
                <Button variant="glow" size="xl" className="w-full sm:w-auto group">
                  Get Tax Advice
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/calculator">
                <Button variant="glass" size="xl" className="w-full sm:w-auto">
                  <Calculator className="h-5 w-5" />
                  Tax Calculator
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-slide-up-delay-1">
          <div className="flex items-center gap-2 glass-subtle px-4 py-2 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>FIRS Compliant</span>
          </div>
          <div className="flex items-center gap-2 glass-subtle px-4 py-2 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>Pre-2026 & 2026 Rules</span>
          </div>
          <div className="flex items-center gap-2 glass-subtle px-4 py-2 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>Free to Use</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-card/50 backdrop-blur-sm py-12 md:py-16 relative z-10 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need for Tax Compliance
            </h2>
            <p className="text-muted-foreground">
              From business structure advice to detailed tax calculations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={<Building2 className="h-6 w-6" />}
              title="Business Structure Advice"
              description="Get recommendations on whether to register as a Business Name or Limited Liability Company based on your needs."
              delay={1}
            />
            <FeatureCard 
              icon={<Calculator className="h-6 w-6" />}
              title="Tax Calculator"
              description="Calculate CIT, PIT, VAT, and development levies with support for both pre-2026 and 2026+ rules."
              delay={2}
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />}
              title="Liability Protection"
              description="Understand how different business structures affect your personal asset protection."
              delay={3}
            />
            <FeatureCard 
              icon={<TrendingUp className="h-6 w-6" />}
              title="Small Company Benefits"
              description="Check if you qualify for 0% CIT rate under the new small company rules."
              delay={4}
            />
            <FeatureCard 
              icon={<FileText className="h-6 w-6" />}
              title="Export Reports"
              description="Download your tax calculations as PDF or CSV for record keeping and filing."
              badge="Basic+"
              delay={5}
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Tax Filing Preparation"
              description="Generate pre-filled FIRS forms ready for TaxProMax submission."
              badge="Business+"
              delay={6}
            />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-12 md:py-16 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 animate-slide-up">
            Plans for Every Business
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto animate-slide-up-delay-1">
            Start free with unlimited calculations. Upgrade for exports, saved businesses, and filing tools.
          </p>
          <Link to="/pricing" className="animate-slide-up-delay-2 inline-block">
            <Button variant="outline" size="lg" className="group">
              View Pricing Plans
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-12 md:py-16 text-primary-foreground relative z-10 overflow-hidden">
        {/* CTA Background Effects */}
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Optimize Your Taxes?
          </h2>
          <p className="mx-auto mb-8 max-w-xl opacity-90">
            Join thousands of Nigerian businesses making smarter tax decisions. 
            Start with our free advisory tool.
          </p>
          <Link to="/advisory">
            <Button variant="glowAccent" size="xl" className="w-full max-w-xs sm:w-auto">
              <span className="truncate">Start Free Assessment</span>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-sm py-8 border-t border-border/50 mt-auto relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-lg">
                <Calculator className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">TaxForge NG</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/pricing" className="hover:text-foreground transition-colors hover:text-primary">Pricing</Link>
              <Link to="/advisory" className="hover:text-foreground transition-colors hover:text-primary">Advisory</Link>
              <Link to="/calculator" className="hover:text-foreground transition-colors hover:text-primary">Calculator</Link>
              <Link to="/learn" className="hover:text-foreground transition-colors hover:text-primary">Learn</Link>
              <Link to="/roadmap" className="hover:text-foreground transition-colors hover:text-primary">Roadmap</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors hover:text-primary">Terms & Privacy</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors hover:text-primary">Sign In</Link>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 TaxForge NG. For educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description,
  badge,
  delay = 0
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  badge?: string;
  delay?: number;
}) => (
  <div 
    className={`group relative rounded-xl glass p-6 shadow-futuristic transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:glow-primary animate-slide-up stagger-${delay}`}
  >
    {badge && (
      <span className="absolute top-4 right-4 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium border border-accent/30">
        {badge}
      </span>
    )}
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/80 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-lg">
      {icon}
    </div>
    <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;