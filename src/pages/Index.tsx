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
} from "lucide-react";

import { FreeTrialCTA } from "@/components/FreeTrialCTA";
import { FreeTaxToolsSection } from "@/components/FreeTaxToolsSection";
import { lazy, Suspense } from "react";

const SuccessStories = lazy(() => import("@/components/SuccessStories").then(m => ({ default: m.SuccessStories })));
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { SEOHead, createSoftwareApplicationSchema, createOrganizationSchema, createLocalBusinessSchema } from "@/components/seo/SEOHead";
import { useReviewStats } from "@/hooks/useReviewStats";

const Index = () => {
  const { data: reviewStats } = useReviewStats();

  const homepageSchema = [
    createSoftwareApplicationSchema(reviewStats),
    createOrganizationSchema(),
    createLocalBusinessSchema(),
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative bg-background bg-ambient">
      <SEOHead
        title="TaxForge NG | Free Nigerian Tax Calculator 2026 - CIT, VAT, WHT, PIT"
        description="TaxForge NG: Free Nigerian tax calculator for CIT, VAT, WHT, PIT with 2026 reforms. Business advisory, sector guides, and small company tools. No signup needed."
        canonicalPath="/"
        keywords="Nigeria tax calculator, CIT calculator Nigeria, VAT calculator Nigeria, PIT PAYE calculator, 2026 tax reforms Nigeria, NRS compliant, FIRS compliant"
        schema={homepageSchema}
      />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-16 md:pt-24 md:pb-28 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Main Hero Content */}
          <div className="animate-slide-up">
            <p className="mb-5 text-sm font-medium text-primary tracking-wide uppercase">
              Updated for 2026 Tax Rules
            </p>
            
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Nigerian Tax Calculator{' '}
              <span className="text-primary">
                For Smart Businesses
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Calculate CIT, VAT, WHT, and PIT accurately. Compare entity structures. Get personalized tax advice — all in one platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row animate-slide-up-delay-1">
              <Link to="/advisory">
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base font-semibold">
                  Get Advice
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/calculator">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-12 text-base font-semibold">
                  <Calculator className="h-4 w-4 mr-2" />
                  Tax Calculator
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-slide-up-delay-2">
            {[
              { text: "NRS Compliant" },
              { text: "2026 Rules Preview" },
              { text: "Free to Use" },
            ].map((badge, index) => (
              <div 
                key={index}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 md:py-28 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
            {[
              {
                title: "How Much Tax Do I Pay in Nigeria?",
                text: "Under the 2026 Nigeria Tax Act, the first ₦800,000 of your annual income is tax-free. Above that, rates range from 15% to 25%. Use our free calculator to see your exact breakdown in seconds — no signup required.",
                link: "/individual-calculator",
                cta: "Calculate Your Tax",
              },
              {
                title: "Is My Small Company Exempt From CIT?",
                text: "Yes — if your company's turnover is ₦50 million or less AND fixed assets are ₦250 million or less, you pay 0% Company Income Tax under the 2026 rules (Nigeria Tax Act 2025).",
                link: "/small-company-exemption",
                cta: "Check Your Eligibility",
              },
              {
                title: "What Is the VAT Rate in Nigeria?",
                text: "Nigeria's VAT rate is 7.5% on taxable goods and services. Essential items like basic food, medical supplies, and educational materials are VAT-exempt. Businesses with turnover above ₦25 million must register for VAT.",
                link: "/vat-calculator",
                cta: "Calculate VAT",
              },
              {
                title: "When Are Nigerian Tax Deadlines?",
                text: "VAT returns are due by the 21st of each month. PAYE remittances by the 10th. CIT annual returns by June 30th, and PIT annual filing by March 31st. Track all deadlines with our free tax calendar.",
                link: "/tax-calendar",
                cta: "View Tax Calendar",
              },
            ].map((item, index) => (
              <article key={index} className="rounded-xl border border-border bg-card p-6 md:p-8 transition-shadow duration-200 hover:shadow-md">
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-3">
                  {item.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {item.text}
                </p>
                <Link to={item.link}>
                  <Button variant="link" className="p-0 gap-1 text-primary h-auto">
                    {item.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial CTA for Guests */}
      <FreeTrialCTA />

      {/* Features Grid */}
      <FeaturesSection />

      {/* Free Tax Tools */}
      <FreeTaxToolsSection />

      {/* Latest from the Blog */}
      <BlogPromoSection />

      {/* Success Stories */}
      <Suspense fallback={null}>
        <SuccessStories limit={3} />
      </Suspense>

      {/* Pricing Teaser */}
      <PricingTeaser />

      {/* CTA Section */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-2xl bg-primary p-10 md:p-16 text-center">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Optimize Your Taxes?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80 text-lg">
              Start calculating your taxes with NRS-compliant 2026 rules today.
            </p>
            <Link to="/advisory">
              <Button variant="secondary" size="lg" className="px-8 h-12 text-base font-semibold">
                Start Free Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-14 mt-auto relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Calculator className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">TaxForge NG</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Free Nigerian tax calculator with NRS-compliant 2026 rules.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Port Harcourt, Rivers State, Nigeria</p>
                <p>hello@taxforgeng.com</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <p className="font-semibold text-foreground mb-4 text-sm">Platform</p>
              <div className="flex flex-col gap-2.5 text-sm">
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
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Free Tools Links */}
            <div>
              <p className="font-semibold text-foreground mb-4 text-sm">Free Tools</p>
              <div className="flex flex-col gap-2.5 text-sm">
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
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* More Tools */}
            <div>
              <p className="font-semibold text-foreground mb-4 text-sm">More Tools</p>
              <div className="flex flex-col gap-2.5 text-sm">
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
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company Links */}
            <div>
              <p className="font-semibold text-foreground mb-4 text-sm">Company</p>
              <div className="flex flex-col gap-2.5 text-sm">
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
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <Link to="/terms#terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/terms#privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms#refund" className="text-muted-foreground hover:text-foreground transition-colors">
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

// Features Section
const FeaturesSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  
  const features = [
    { icon: <Building2 className="h-5 w-5" />, title: "Business Structure Advice", description: "Get personalized guidance on whether to register as a Business Name or Limited Company" },
    { icon: <Calculator className="h-5 w-5" />, title: "Tax Calculator", description: "Calculate CIT, VAT, WHT, and PIT instantly with our comprehensive calculator" },
    { icon: <Shield className="h-5 w-5" />, title: "Liability Protection", description: "Understand how different structures protect your personal assets" },
    { icon: <TrendingUp className="h-5 w-5" />, title: "Small Company Benefits", description: "See if you qualify for reduced CIT rates and other incentives" },
    { icon: <FileText className="h-5 w-5" />, title: "Export Reports", description: "Download professional PDF and CSV reports for your records", badge: "Basic+" },
    { icon: <Users className="h-5 w-5" />, title: "Tax Filing Preparation", description: "Get your documents ready for seamless NRS filing", badge: "Business+" },
  ];

  return (
    <section ref={sectionRef} className="relative z-10 py-20 md:py-28 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 relative z-10">
        <div className={`mx-auto max-w-2xl text-center mb-14 transition-all duration-500 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Nigerian Taxes
          </h2>
          <p className="text-lg text-muted-foreground">
            From basic calculations to advanced tax planning
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
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

// Pricing Teaser
const PricingTeaser = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <section ref={ref} className="py-20 md:py-28 relative z-10">
      <div className="container mx-auto px-4 text-center">
        <div className={`max-w-2xl mx-auto transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Plans for Every Business
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Start free with unlimited personal tax calculations. Upgrade for business features.
          </p>
          <Link to="/pricing">
            <Button variant="outline" size="lg" className="px-8 h-12 text-base font-semibold group">
              View Pricing Plans
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
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
    className={`group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-md hover:border-primary/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    style={{ transitionDelay: isVisible ? `${delay * 80}ms` : '0ms' }}
  >
    {badge && (
      <span className="absolute top-4 right-4 text-xs bg-accent/10 text-accent px-2.5 py-0.5 rounded-full font-medium">
        {badge}
      </span>
    )}
    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
      {icon}
    </div>
    <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
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
    <section ref={ref} className="py-20 md:py-28 relative z-10 border-t border-border">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Latest from the Blog</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Expert tax guides and analysis for Nigerian businesses</p>
        </div>
        <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto mb-10 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link to="/blog">
            <Button variant="outline" className="group">
              View All Posts <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/faq">
            <Button variant="ghost" className="group text-muted-foreground">
              Have Questions? <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Index;
