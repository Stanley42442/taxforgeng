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
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { NavMenu } from "@/components/NavMenu";
import { FreeTrialCTA } from "@/components/FreeTrialCTA";
import { useState, useEffect } from "react";

const CAROUSEL_ITEMS = [
  {
    title: "2026 Tax Reforms Are Here",
    description: "New 0% CIT for small companies, updated PIT bands, and more. Get ready now.",
    gradient: "from-primary/20 to-accent/10",
    icon: Sparkles,
  },
  {
    title: "₦50M Turnover Threshold",
    description: "Companies under ₦50M turnover may qualify for 0% Company Income Tax.",
    gradient: "from-success/20 to-primary/10",
    icon: TrendingUp,
  },
  {
    title: "First ₦800K Tax Free",
    description: "Personal income exemption increased from ₦300K to ₦800K under new rules.",
    gradient: "from-accent/20 to-warning/10",
    icon: Shield,
  },
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-float-slow pointer-events-none" />
      <div className="fixed top-60 right-10 w-64 h-64 rounded-full bg-accent/12 blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-1/4 w-72 h-72 rounded-full bg-primary/6 blur-3xl animate-float-slow pointer-events-none" />
      <div className="fixed bottom-40 right-1/4 w-48 h-48 rounded-full bg-success/8 blur-3xl animate-float pointer-events-none" />
      
      <NavMenu />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-12 pt-8 md:pt-16 md:pb-20 relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Carousel */}
          <div className="mb-10 animate-slide-up">
            <div className="relative glass-frosted rounded-2xl p-6 md:p-8 overflow-hidden">
              {/* Carousel Content */}
              <div className="relative z-10">
                {CAROUSEL_ITEMS.map((item, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      index === currentSlide 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 absolute inset-0 translate-x-8'
                    }`}
                  >
                    {index === currentSlide && (
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg glow-primary">
                            <item.icon className="h-7 w-7 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <Link to="/calculator" className="shrink-0">
                          <Button variant="glow" size="lg" className="w-full md:w-auto">
                            Learn More <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  {CAROUSEL_ITEMS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'w-8 bg-primary glow-primary' 
                          : 'w-2 bg-border hover:bg-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prevSlide}
                    className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center animate-slide-up-delay-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium text-foreground shadow-futuristic">
              <Sparkles className="h-4 w-4 text-accent animate-pulse-soft" />
              <span>Updated for Nigeria Tax Act 2025</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Smart Tax Advice for
              <span className="block mt-2 text-gradient bg-gradient-to-r from-primary via-success to-accent bg-clip-text">
                Nigerian Businesses
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Get personalized business structure recommendations and accurate tax calculations. 
              Built for small businesses and individuals navigating Nigeria's tax landscape.
            </p>
            
            {/* Floating CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/advisory">
                <Button variant="glow" size="xl" className="w-full sm:w-auto group shadow-2xl">
                  <span>Get Tax Advice</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/calculator">
                <Button variant="glass" size="xl" className="w-full sm:w-auto neumorphic-button">
                  <Calculator className="h-5 w-5" />
                  <span>Tax Calculator</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-4 md:gap-8 animate-slide-up-delay-2">
            {[
              { icon: CheckCircle2, text: "FIRS Compliant" },
              { icon: CheckCircle2, text: "Pre-2026 & 2026 Rules" },
              { icon: CheckCircle2, text: "Free to Use" },
            ].map((badge, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 glass-subtle px-5 py-3 rounded-full hover-lift cursor-default"
              >
                <badge.icon className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-foreground">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial CTA for Guests */}
      <FreeTrialCTA />

      {/* Features Grid */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 glass-dark" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-14 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Tax Compliance
            </h2>
            <p className="text-lg text-muted-foreground">
              From business structure advice to detailed tax calculations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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
      <section className="py-16 md:py-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto glass-frosted rounded-3xl p-8 md:p-12 animate-slide-up hover-glow-primary">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Plans for Every Business
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Start free with unlimited calculations. Upgrade for exports, saved businesses, and filing tools.
            </p>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="group neon-border">
                <span>View Pricing Plans</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary-foreground/10 blur-3xl" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="mb-4 text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to Optimize Your Taxes?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-primary-foreground/90 text-lg">
            Join thousands of Nigerian businesses making smarter tax decisions. 
            Start with our free advisory tool.
          </p>
          <Link to="/advisory">
            <Button variant="glowAccent" size="xl" className="shadow-2xl">
              <span>Start Free Assessment</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-dark py-10 border-t border-border/30 mt-auto relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg glow-primary">
                <Calculator className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">TaxForge NG</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              {[
                { to: "/pricing", label: "Pricing" },
                { to: "/advisory", label: "Advisory" },
                { to: "/calculator", label: "Calculator" },
                { to: "/learn", label: "Learn" },
                { to: "/roadmap", label: "Roadmap" },
                { to: "/terms", label: "Terms & Privacy" },
                { to: "/auth", label: "Sign In" },
              ].map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
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
    className={`group relative rounded-2xl glass-frosted p-6 shadow-futuristic transition-all duration-400 hover-lift hover-glow-primary animate-slide-up stagger-${delay}`}
  >
    {/* Gradient Border on Hover */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 neon-border -z-10" />
    
    {badge && (
      <span className="absolute top-4 right-4 text-xs bg-accent/20 text-accent px-3 py-1 rounded-full font-medium border border-accent/30 shadow-sm">
        {badge}
      </span>
    )}
    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:glow-primary">
      {icon}
    </div>
    <h3 className="mb-3 text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default Index;