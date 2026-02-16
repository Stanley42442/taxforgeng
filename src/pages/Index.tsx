import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/BlogCard";
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
} from "lucide-react";

import { FreeTrialCTA } from "@/components/FreeTrialCTA";
import { SuccessStories } from "@/components/SuccessStories";
import { FreeTaxToolsSection } from "@/components/FreeTaxToolsSection";
import { useState, useEffect, useCallback } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { SEOHead, createSoftwareApplicationSchema, createOrganizationSchema, createLocalBusinessSchema } from "@/components/seo/SEOHead";
import { useReviewStats } from "@/hooks/useReviewStats";

const Index = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: reviewStats } = useReviewStats();

  const CAROUSEL_ITEMS = [
    {
      title: "2026 Tax Reform Preview",
      description: "See how the new 0% CIT for small companies affects your business",
      gradient: "from-primary/20 to-accent/10",
      icon: Sparkles,
      cta: "Preview 2026 Tax Reforms",
    },
    {
      title: "Smart Entity Comparison",
      description: "Compare Business Name vs Company structure to minimize tax",
      gradient: "from-success/20 to-primary/10",
      icon: TrendingUp,
      cta: "Compare Entity Structures",
    },
    {
      title: "Sector-Specific Insights",
      description: "Get tax rules tailored to your industry - Tech, Oil & Gas, Agriculture & more",
      gradient: "from-accent/20 to-warning/10",
      icon: Shield,
      cta: "Explore Sector Tax Rules",
    },
  ];

  // Sync Embla state
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  const homepageSchema = [
    createSoftwareApplicationSchema(reviewStats),
    createOrganizationSchema(),
    createLocalBusinessSchema(),
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      <SEOHead
        title="TaxForge NG | Free Nigerian Tax Calculator 2026 - CIT, VAT, WHT, PIT"
        description="TaxForge NG: Free Nigerian tax calculator for CIT, VAT, WHT, PIT with 2026 reforms. Business advisory, sector guides, and small company tools. No signup needed."
        canonicalPath="/"
        keywords="Nigeria tax calculator, CIT calculator Nigeria, VAT calculator Nigeria, PIT PAYE calculator, 2026 tax reforms Nigeria, NRS compliant, FIRS compliant"
        schema={homepageSchema}
      />

      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-float-slow pointer-events-none" />
      <div className="fixed top-60 right-10 w-64 h-64 rounded-full bg-accent/12 blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-1/4 w-72 h-72 rounded-full bg-primary/6 blur-3xl animate-float-slow pointer-events-none" />
      <div className="fixed bottom-40 right-1/4 w-48 h-48 rounded-full bg-success/8 blur-3xl animate-float pointer-events-none" />
      

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-12 pt-8 md:pt-16 md:pb-20 relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Carousel */}
          <div className="mb-10 animate-slide-up">
            <div className="relative glass-frosted rounded-2xl p-6 md:p-8 overflow-hidden">
              <Carousel
                setApi={setApi}
                opts={{
                  loop: true,
                  duration: 30,
                }}
                plugins={[
                  Autoplay({
                    delay: 5000,
                    stopOnInteraction: false,
                    stopOnMouseEnter: true,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent>
                  {CAROUSEL_ITEMS.map((item, index) => (
                    <CarouselItem key={index}>
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
                            {item.cta} <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Carousel Controls */}
              <div className="flex items-center justify-center mt-6">
                <div className="flex gap-2">
                  {CAROUSEL_ITEMS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollTo(index)}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === currentSlide 
                          ? 'w-8 bg-primary glow-primary' 
                          : 'w-2 bg-border hover:bg-muted-foreground'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center animate-slide-up-delay-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium text-foreground shadow-futuristic">
              <Sparkles className="h-4 w-4 text-accent animate-pulse-soft" />
              <span>Updated for 2026 Tax Rules</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Nigerian Tax Calculator
              <span className="block mt-2 text-gradient bg-gradient-to-r from-primary via-success to-accent bg-clip-text">
                For Smart Businesses
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Calculate CIT, VAT, WHT, and PIT accurately. Compare entity structures. Get personalized tax advice — all in one platform.
            </p>
            
            {/* Floating CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/advisory">
                <Button variant="glow" size="xl" className="w-full sm:w-auto group shadow-2xl">
                  <span>Get Advice</span>
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
              { icon: CheckCircle2, text: "NRS Compliant" },
              { icon: CheckCircle2, text: "2026 Rules Preview" },
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

      {/* Snippet-Bait FAQ Section for Voice Search & Featured Snippets */}
      <section className="relative z-10 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl grid gap-10 md:grid-cols-2">
            <article className="glass-frosted rounded-2xl p-6 md:p-8 hover-lift">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                How Much Tax Do I Pay in Nigeria?
              </h2>
              <p className="text-muted-foreground mb-4">
                Under the 2026 Nigeria Tax Act, the first ₦800,000 of your annual income is tax-free. Above that, rates range from 15% to 25%. Use our free calculator to see your exact breakdown in seconds — no signup required.
              </p>
              <Link to="/individual-calculator">
                <Button variant="link" className="p-0 gap-1 text-primary">
                  Calculate Your Tax <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </article>

            <article className="glass-frosted rounded-2xl p-6 md:p-8 hover-lift">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                Is My Small Company Exempt From CIT?
              </h2>
              <p className="text-muted-foreground mb-4">
                Yes — if your company's turnover is ₦50 million or less AND fixed assets are ₦250 million or less, you pay 0% Company Income Tax under the 2026 rules (Nigeria Tax Act 2025).
              </p>
              <Link to="/small-company-exemption">
                <Button variant="link" className="p-0 gap-1 text-primary">
                  Check Your Eligibility <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </article>

            <article className="glass-frosted rounded-2xl p-6 md:p-8 hover-lift">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                What Is the VAT Rate in Nigeria?
              </h2>
              <p className="text-muted-foreground mb-4">
                Nigeria's VAT rate is 7.5% on taxable goods and services. Essential items like basic food, medical supplies, and educational materials are VAT-exempt. Businesses with turnover above ₦25 million must register for VAT.
              </p>
              <Link to="/vat-calculator">
                <Button variant="link" className="p-0 gap-1 text-primary">
                  Calculate VAT <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </article>

            <article className="glass-frosted rounded-2xl p-6 md:p-8 hover-lift">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                When Are Nigerian Tax Deadlines?
              </h2>
              <p className="text-muted-foreground mb-4">
                VAT returns are due by the 21st of each month. PAYE remittances by the 10th. CIT annual returns by June 30th, and PIT annual filing by March 31st. Track all deadlines with our free tax calendar.
              </p>
              <Link to="/tax-calendar">
                <Button variant="link" className="p-0 gap-1 text-primary">
                  View Tax Calendar <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Free Trial CTA for Guests */}
      <FreeTrialCTA />

      {/* Features Grid */}
      <FeaturesSection />

      {/* Free Tax Tools - SEO Internal Links */}
      <FreeTaxToolsSection />

      {/* Latest from the Blog */}
      <BlogPromoSection />

      {/* Success Stories Section */}
      <SuccessStories limit={3} />

      {/* Pricing Teaser */}
      <PricingTeaser />

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
            Start calculating your taxes with NRS-compliant 2026 rules today.
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
      <footer className="glass-dark py-12 border-t border-border/30 mt-auto relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg glow-primary">
                  <Calculator className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">TaxForge NG</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Free Nigerian tax calculator with NRS-compliant 2026 rules.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Port Harcourt, Rivers State, Nigeria</p>
                <p>hello@taxforgeng.com</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { to: "/advisory", label: "Get Advice" },
                  { to: "/calculator", label: "Calculator" },
                  { to: "/pricing", label: "Pricing" },
                  { to: "/learn", label: "Learn" },
                  { to: "/tax-calendar", label: "Tax Calendar" },
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
            </div>

            {/* Free Tools Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Free Tools</h4>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { to: "/free-tax-calculator", label: "Tax Calculator" },
                  { to: "/small-company-exemption", label: "SME Exemption" },
                  { to: "/rent-relief-2026", label: "Rent Relief" },
                  { to: "/pit-paye-calculator", label: "PIT/PAYE" },
                  { to: "/vat-calculator", label: "VAT Calculator" },
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
            </div>

            {/* More Tools */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">More Tools</h4>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { to: "/cit-calculator", label: "CIT Calculator" },
                  { to: "/wht-calculator", label: "WHT Calculator" },
                  { to: "/tax-reports", label: "Tax Reports" },
                  { to: "/tax-reforms-2026", label: "2026 Reforms" },
                  { to: "/port-harcourt-tax-guide", label: "PH Tax Guide" },
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
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { to: "/about", label: "About Us" },
                  { to: "/resources", label: "Resources" },
                  { to: "/state-guides", label: "State Guides" },
                  { to: "/success-stories", label: "Success Stories" },
                  { to: "/roadmap", label: "Roadmap" },
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
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-border/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <Link to="/terms#terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/terms#privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms#refund" className="text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                © 2026 TaxForge NG. Educational tool only — not official tax advice. Operated by Gillespie / OptiSolve Labs, Port Harcourt.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Features Section with scroll animations
const FeaturesSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  
  const features = [
    { icon: <Building2 className="h-6 w-6" />, title: "Business Structure Advice", description: "Get personalized guidance on whether to register as a Business Name or Limited Company" },
    { icon: <Calculator className="h-6 w-6" />, title: "Tax Calculator", description: "Calculate CIT, VAT, WHT, and PIT instantly with our comprehensive calculator" },
    { icon: <Shield className="h-6 w-6" />, title: "Liability Protection", description: "Understand how different structures protect your personal assets" },
    { icon: <TrendingUp className="h-6 w-6" />, title: "Small Company Benefits", description: "See if you qualify for reduced CIT rates and other incentives" },
    { icon: <FileText className="h-6 w-6" />, title: "Export Reports", description: "Download professional PDF and CSV reports for your records", badge: "Basic+" },
    { icon: <Users className="h-6 w-6" />, title: "Tax Filing Preparation", description: "Get your documents ready for seamless NRS filing", badge: "Business+" },
  ];

  return (
    <section ref={sectionRef} className="relative z-10 py-16 md:py-24">
      <div className="absolute inset-0 glass-dark" />
      <div className="container mx-auto px-4 relative z-10">
        <div className={`mx-auto max-w-3xl text-center mb-14 transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Nigerian Taxes
          </h2>
          <p className="text-lg text-muted-foreground">
            From basic calculations to advanced tax planning
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              badge={feature.badge}
              delay={index + 1}
              isVisible={sectionVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Teaser with scroll animation
const PricingTeaser = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <section ref={ref} className="py-16 md:py-20 relative z-10">
      <div className="container mx-auto px-4 text-center">
        <div className={`max-w-2xl mx-auto glass-frosted rounded-3xl p-8 md:p-12 hover-glow-primary transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Plans for Every Business
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Start free with unlimited personal tax calculations. Upgrade for business features.
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
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description,
  badge,
  delay = 0,
  isVisible = true
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  badge?: string;
  delay?: number;
  isVisible?: boolean;
}) => (
  <div 
    className={`group relative rounded-2xl glass-frosted p-6 shadow-futuristic transition-all duration-500 hover-lift hover-glow-primary ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    style={{ transitionDelay: isVisible ? `${delay * 100}ms` : '0ms' }}
  >
    
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

// Blog Promotion Section
const BlogPromoSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const blogPosts = [
    { slug: 'tax-reforms-2026-summary', title: 'Nigeria Tax Reforms 2026: Complete Summary', excerpt: 'Everything that changed under the Nigeria Tax Act 2025 — PIT, CIT, VAT, WHT, and Rent Relief explained.', date: 'Feb 8, 2026', category: 'Tax Reforms', readTime: '8 min' },
    { slug: 'small-company-cit-exemption', title: '0% CIT for Small Companies', excerpt: 'How to qualify for the Small Company Exemption. The turnover threshold doubled to ₦50 million.', date: 'Feb 5, 2026', category: 'Guides', readTime: '7 min' },
    { slug: 'pit-paye-guide-2026', title: 'PIT & PAYE Calculator Guide 2026', excerpt: 'Step-by-step personal income tax calculation with worked Naira examples and Rent Relief.', date: 'Jan 30, 2026', category: 'Guides', readTime: '6 min' },
    { slug: 'tax-guide-tech-startups', title: 'Tax Guide for Tech Startups', excerpt: 'CIT, VAT, WHT, PAYE — which taxes apply to your startup? Practical guide for founders.', date: 'Jan 25, 2026', category: 'Guides', readTime: '9 min' },
  ];

  return (
    <section ref={ref} className="py-12 md:py-16 relative z-10">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Latest from the Blog</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Expert tax guides and analysis for Nigerian businesses</p>
        </div>
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link to="/blog">
            <Button variant="outline" className="group">
              View All Posts <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/faq">
            <Button variant="ghost" className="group">
              Have Questions? <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Index;
