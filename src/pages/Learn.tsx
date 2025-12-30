import { useState } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  Search,
  Play,
  FileText,
  Lightbulb,
  Crown,
  Lock,
  CheckCircle2,
  TrendingUp,
  Building2,
  Briefcase,
  Calculator,
  DollarSign,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";

const Learn = () => {
  const { tier, savedBusinesses } = useSubscription();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const isBusinessPlus = tier === 'business' || tier === 'corporate';

  // Generate personalized tips based on user's saved businesses
  const generatePersonalizedTips = () => {
    const tips = [];
    
    if (savedBusinesses.length > 0) {
      const totalTurnover = savedBusinesses.reduce((sum, b) => sum + b.turnover, 0);
      const hasCompany = savedBusinesses.some(b => b.entityType === 'company');
      const hasBusinessName = savedBusinesses.some(b => b.entityType === 'business_name');
      
      if (totalTurnover > 25000000) {
        tips.push({
          icon: DollarSign,
          title: "VAT Registration Required",
          description: `Your combined turnover of ${formatCurrency(totalTurnover)} exceeds ₦25m. Register for VAT immediately to avoid penalties.`,
          action: "Learn about VAT"
        });
      }
      
      if (hasCompany && savedBusinesses.some(b => b.turnover <= 50000000)) {
        tips.push({
          icon: CheckCircle2,
          title: "Small Company Benefits",
          description: "Under 2026 rules, companies with turnover ≤₦50m and assets ≤₦250m pay 0% CIT!",
          action: "See eligibility"
        });
      }

      if (hasBusinessName) {
        tips.push({
          icon: TrendingUp,
          title: "Consider Rent Relief",
          description: "2026 rules allow Business Name owners to claim up to ₦500k in rent relief.",
          action: "Calculate savings"
        });
      }
    }

    // Default tips
    tips.push({
      icon: Lightbulb,
      title: "File Early, Avoid Penalties",
      description: "CIT returns are due by June 30th. File early to avoid 10% late filing penalty.",
      action: "Set reminder"
    });

    tips.push({
      icon: Building2,
      title: "Entity Structure Matters",
      description: "Choosing between Business Name and Company can save you thousands in taxes.",
      action: "Compare entities"
    });

    return tips.slice(0, 4);
  };

  const personalizedTips = generatePersonalizedTips();

  const articles = [
    {
      id: "2026-reforms",
      title: "Nigeria Tax Act 2025: Complete Guide",
      description: "Everything you need to know about the new tax reforms taking effect in 2026",
      category: "Tax Reforms",
      readTime: "8 min",
      tier: 'free',
      content: `The Nigeria Tax Act 2025 introduces significant changes:

**Personal Income Tax (PIT) Changes:**
• First ₦800,000 is now exempt (up from ₦300,000)
• New progressive bands: 15%, 19%, 21%, 25%
• Rent relief: Min of 20% rent paid or ₦500,000

**Company Income Tax (CIT) Changes:**
• Standard rate reduced to 25% (from 30%)
• Small companies (turnover ≤₦50m, assets ≤₦250m): 0% CIT
• New 4% Development Levy replaces 2% Education Levy

**VAT Remains:**
• 7.5% rate unchanged
• Mandatory registration if turnover > ₦25m`
    },
    {
      id: "entity-choice",
      title: "Business Name vs Company: Which Saves More Tax?",
      description: "A comprehensive comparison to help you choose the right structure",
      category: "Entity Types",
      readTime: "6 min",
      tier: 'free',
      content: `**Business Name (Sole Proprietorship)**
• Taxed via Personal Income Tax (PIT)
• Progressive rates up to 25%
• Unlimited personal liability
• Simpler compliance
• Best for: Freelancers, consultants, small traders

**Limited Liability Company (LTD)**
• Taxed via Company Income Tax (CIT)
• 25% flat rate (or 0% for small companies)
• Limited liability protection
• More complex compliance
• Best for: Scaling businesses, contractors, professionals

**When to Switch:**
Consider incorporating when:
• Annual profit exceeds ₦3-5 million
• You need liability protection
• You want to attract investors`
    },
    {
      id: "vat-guide",
      title: "VAT Registration & Compliance Guide",
      description: "When to register, how to file, and common mistakes to avoid",
      category: "VAT",
      readTime: "5 min",
      tier: 'free',
      content: `**Registration Threshold:**
VAT registration is mandatory if your annual turnover exceeds ₦25 million.

**How VAT Works:**
• Charge 7.5% on vatable sales (Output VAT)
• Claim back 7.5% on vatable purchases (Input VAT)
• Remit the difference to FIRS

**Filing Deadlines:**
• VAT returns due by 21st of following month
• Late filing: 5% penalty + ₦5,000 per month

**Exempt Items:**
• Basic food items
• Medical supplies
• Educational materials
• Agricultural equipment`
    },
    {
      id: "freelancer-taxes",
      title: "Tax Guide for Freelancers & Remote Workers",
      description: "Special considerations for those earning in foreign currency",
      category: "Freelancers",
      readTime: "7 min",
      tier: 'business',
      content: `**Declaring Foreign Income:**
• Convert at CBN rate on payment date
• All worldwide income is taxable in Nigeria

**Withholding Tax on Consultancy:**
• 10% WHT on payments to companies
• 5% WHT on payments to individuals

**Common Deductions:**
• Home office expenses (proportional)
• Internet and phone costs
• Equipment depreciation
• Software subscriptions

**Crypto Gains (Coming Soon):**
• Expected 10% CGT on crypto disposals
• Keep records of all transactions`
    },
    {
      id: "sme-payroll",
      title: "PAYE & Payroll for SMEs",
      description: "Managing employee taxes and pension contributions",
      category: "Payroll",
      readTime: "6 min",
      tier: 'business',
      content: `**PAYE Obligations:**
As an employer, you must:
• Deduct PIT from employee salaries
• Remit to State IRS by 10th of following month
• File annual returns by January 31st

**Pension Contributions:**
• Employer: 10% of basic salary
• Employee: 8% of basic salary
• Total: 18% to PFA

**Contractor vs Employee:**
• Contractors: Deduct 5-10% WHT
• Employees: Deduct PAYE + Pension
• Misclassification attracts penalties`
    },
    {
      id: "audit-preparation",
      title: "How to Prepare for a Tax Audit",
      description: "Best practices for maintaining records and handling FIRS inquiries",
      category: "Compliance",
      readTime: "8 min",
      tier: 'corporate',
      content: `**Record Keeping Requirements:**
• Maintain records for 6 years minimum
• Store invoices, receipts, bank statements
• Keep digital backups

**Common Audit Triggers:**
• Large refund claims
• Inconsistent filing patterns
• Industry-specific reviews
• Random selection

**During an Audit:**
• Respond within stipulated timelines
• Provide only what's requested
• Document all communications
• Consider professional representation`
    }
  ];

  const faqs = [
    {
      question: "When are CIT returns due?",
      answer: "Company Income Tax returns must be filed by June 30th of each year for the preceding year. For example, 2024 returns are due by June 30, 2025."
    },
    {
      question: "What's the penalty for late filing?",
      answer: "Late CIT filing attracts a 10% penalty on the tax due, plus interest at CBN lending rate. VAT late filing is 5% penalty plus ₦5,000 per month."
    },
    {
      question: "Do I need to register for VAT?",
      answer: "VAT registration is mandatory if your annual turnover exceeds ₦25 million. Below this threshold, registration is optional but may be beneficial."
    },
    {
      question: "Are dividends taxable in Nigeria?",
      answer: "Franked dividends from Nigerian companies are tax-exempt. However, dividends from foreign companies are taxable as foreign income."
    },
    {
      question: "How do I claim WHT credits?",
      answer: "WHT deducted at source can be credited against your final tax liability. You need the WHT receipt/certificate as proof of deduction."
    },
    {
      question: "What qualifies as a 'Small Company'?",
      answer: "Under 2026 rules, a company qualifies as small if turnover is ≤₦50 million AND fixed assets are ≤₦250 million. Small companies enjoy 0% CIT."
    }
  ];

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierBadge = (articleTier: string) => {
    if (articleTier === 'business') return { label: 'Business+', color: 'bg-accent/20 text-accent border border-accent/30' };
    if (articleTier === 'corporate') return { label: 'Corporate', color: 'bg-warning/20 text-warning border border-warning/30' };
    return null;
  };

  const canAccess = (articleTier: string) => {
    const tierOrder = ['free', 'basic', 'business', 'corporate'];
    return tierOrder.indexOf(tier) >= tierOrder.indexOf(articleTier);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl animate-float" />
        <div className="bg-mesh absolute inset-0" />
        <div className="bg-dots absolute inset-0 opacity-30" />
      </div>

      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1 relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-up">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary glow-primary">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Tax Academy
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Learn Nigerian tax rules in simple English
            </p>
          </div>

          {/* Personalized Tips - Glass Cards */}
          <div className="glass-frosted rounded-3xl p-6 mb-8 animate-slide-up-delay-1">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-warning/10">
                <Sparkles className="h-5 w-5 text-warning" />
              </div>
              Your Tax Tips
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {personalizedTips.map((tip, index) => (
                <div 
                  key={index}
                  className="glass p-5 rounded-2xl hover-lift cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-primary glow-primary group-hover:scale-110 transition-transform">
                      <tip.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{tip.description}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-primary font-medium">
                        {tip.action} →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search - Neumorphic */}
          <div className="relative mb-8 animate-slide-up-delay-2">
            <div className="neumorphic p-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles, topics, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>

          {/* Video Section - Glass Cards */}
          <div className="glass-frosted rounded-3xl p-6 mb-8 animate-slide-up-delay-3">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Play className="h-5 w-5 text-primary" />
              </div>
              Quick Videos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: '2026 Tax Reforms Explained', duration: '2 min' },
                { title: 'How to Calculate PIT', duration: '3 min' }
              ].map((video, idx) => (
                <div 
                  key={idx}
                  className="glass aspect-video rounded-2xl flex items-center justify-center cursor-pointer group hover-lift relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary glow-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 text-primary-foreground fill-primary-foreground ml-1" />
                    </div>
                    <p className="font-medium text-foreground">{video.title}</p>
                    <p className="text-sm text-muted-foreground">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Articles - Premium Glass Cards */}
          <div className="glass-frosted rounded-3xl p-6 mb-8 animate-fade-in">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Knowledge Base
            </h2>
            <div className="space-y-4">
              {filteredArticles.map((article) => {
                const badge = getTierBadge(article.tier);
                const hasAccess = canAccess(article.tier);
                
                return (
                  <Accordion type="single" collapsible key={article.id}>
                    <AccordionItem value={article.id} className="glass rounded-2xl px-5 border-0">
                      <AccordionTrigger className="py-5 hover:no-underline" disabled={!hasAccess}>
                        <div className="flex items-start gap-4 text-left w-full pr-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                                {article.category}
                              </span>
                              {badge && (
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${badge.color}`}>
                                  {badge.label}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">{article.readTime}</span>
                            </div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              {article.title}
                              {!hasAccess && <Lock className="h-4 w-4 text-muted-foreground" />}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      {hasAccess ? (
                        <AccordionContent className="pb-5">
                          <div className="pt-4 border-t border-border/50">
                            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                              {article.content}
                            </pre>
                          </div>
                        </AccordionContent>
                      ) : (
                        <AccordionContent className="pb-5">
                          <div className="pt-4 border-t border-border/50">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-warning/10 to-accent/5 text-center">
                              <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-3">
                                <Crown className="h-7 w-7 text-warning" />
                              </div>
                              <p className="text-muted-foreground mb-4">
                                Upgrade to {badge?.label} to access this content
                              </p>
                              <Button variant="glow" size="sm" onClick={() => navigate('/pricing')}>
                                Upgrade Now
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  </Accordion>
                );
              })}
            </div>
          </div>

          {/* FAQs - Neumorphic Accordion */}
          <div className="neumorphic p-6 mb-8 animate-fade-in">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="glass rounded-xl px-5 border-0"
                >
                  <AccordionTrigger className="py-4 hover:no-underline text-left">
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Upgrade CTA */}
          {!isBusinessPlus && (
            <div className="neon-border p-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gradient-accent glow-accent flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Unlock Premium Content
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get access to advanced tax guides, freelancer tips, and audit preparation guides.
              </p>
              <Button variant="glow" size="lg" onClick={() => navigate('/pricing')}>
                View Plans
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Learn;
