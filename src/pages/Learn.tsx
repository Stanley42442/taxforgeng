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
  DollarSign
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
    if (articleTier === 'business') return { label: 'Business+', color: 'bg-accent text-accent-foreground' };
    if (articleTier === 'corporate') return { label: 'Corporate', color: 'bg-warning/20 text-warning' };
    return null;
  };

  const canAccess = (articleTier: string) => {
    const tierOrder = ['free', 'basic', 'business', 'corporate'];
    return tierOrder.indexOf(tier) >= tierOrder.indexOf(articleTier);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tax Academy
            </h1>
            <p className="text-muted-foreground">
              Learn Nigerian tax rules in simple English
            </p>
          </div>

          {/* Personalized Tips */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              Your Tax Tips
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {personalizedTips.map((tip, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <tip.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm mb-1">{tip.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{tip.description}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                        {tip.action} →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 animate-slide-up">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Video Section Placeholder */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Quick Videos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="aspect-video rounded-xl bg-secondary/50 flex items-center justify-center border border-border">
                <div className="text-center">
                  <Play className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">2026 Tax Reforms Explained</p>
                  <p className="text-xs text-muted-foreground">2 min</p>
                </div>
              </div>
              <div className="aspect-video rounded-xl bg-secondary/50 flex items-center justify-center border border-border">
                <div className="text-center">
                  <Play className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">How to Calculate PIT</p>
                  <p className="text-xs text-muted-foreground">3 min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Knowledge Base
            </h2>
            <div className="space-y-3">
              {filteredArticles.map((article) => {
                const badge = getTierBadge(article.tier);
                const hasAccess = canAccess(article.tier);
                
                return (
                  <Accordion type="single" collapsible key={article.id}>
                    <AccordionItem value={article.id} className="border border-border rounded-xl px-4">
                      <AccordionTrigger className="py-4 hover:no-underline" disabled={!hasAccess}>
                        <div className="flex items-start gap-3 text-left w-full pr-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                                {article.category}
                              </span>
                              {badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                                  {badge.label}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">{article.readTime}</span>
                            </div>
                            <h3 className="font-medium text-foreground flex items-center gap-2">
                              {article.title}
                              {!hasAccess && <Lock className="h-4 w-4 text-muted-foreground" />}
                            </h3>
                            <p className="text-sm text-muted-foreground">{article.description}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      {hasAccess ? (
                        <AccordionContent className="pb-4">
                          <div className="pt-2 border-t border-border">
                            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                              {article.content}
                            </pre>
                          </div>
                        </AccordionContent>
                      ) : (
                        <AccordionContent className="pb-4">
                          <div className="pt-2 border-t border-border">
                            <div className="p-4 rounded-lg bg-secondary/50 text-center">
                              <Crown className="h-8 w-8 text-warning mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground mb-3">
                                Upgrade to {badge?.label} to access this content
                              </p>
                              <Button variant="hero" size="sm" onClick={() => navigate('/pricing')}>
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

          {/* FAQs */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border border-border rounded-lg px-4"
                >
                  <AccordionTrigger className="py-3 text-sm hover:no-underline text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Content is for educational purposes only. Always consult a certified tax professional for advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Learn;