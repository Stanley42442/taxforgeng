import { useState, useMemo } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  GraduationCap,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Factory,
  Wheat,
  ShoppingCart,
  Globe,
  Package,
  Cpu,
  XCircle,
  CheckCircle,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { 
  taxMyths, 
  sectorGuides, 
  videoGuides,
  searchMythsAndGuides,
  getMythsByTier,
  getSectorGuidesByTier,
  getVideoGuidesByTier,
  type TaxMyth,
  type SectorGuide,
  type VideoGuide
} from "@/lib/taxMyths";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Learn = () => {
  const { tier, savedBusinesses } = useSubscription();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("myths");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});
  const [showQuizResults, setShowQuizResults] = useState<Record<string, boolean>>({});

  const isBusinessPlus = tier === 'business' || tier === 'corporate';
  const isBasicPlus = tier !== 'free';

  // Map tier to expected format
  const tierForMyths = tier === 'corporate' ? 'business' : (tier === 'basic' ? 'basic' : 'free');

  // Filter myths and guides based on search and tier
  const { filteredMyths, filteredGuides } = useMemo(() => {
    if (searchQuery.trim()) {
      const results = searchMythsAndGuides(searchQuery);
      return {
        filteredMyths: results.myths,
        filteredGuides: results.guides
      };
    }
    return {
      filteredMyths: selectedCategory === 'all' 
        ? taxMyths 
        : taxMyths.filter(m => m.category === selectedCategory),
      filteredGuides: sectorGuides
    };
  }, [searchQuery, selectedCategory]);

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

  const mythCategories = [
    { value: 'all', label: 'All Myths', icon: ShieldAlert },
    { value: 'gifts', label: 'Gifts & Income', icon: DollarSign },
    { value: 'audits', label: 'Audits', icon: Search },
    { value: 'penalties', label: 'Penalties', icon: AlertTriangle },
    { value: 'foreign', label: 'Foreign Income', icon: Globe },
    { value: 'vat', label: 'VAT', icon: Calculator },
    { value: 'exemptions', label: 'Exemptions', icon: CheckCircle2 },
    { value: 'reforms', label: '2026 Reforms', icon: Sparkles },
    { value: 'general', label: 'General', icon: HelpCircle },
  ];

  const sectorIcons: Record<string, typeof Cpu> = {
    tech: Cpu,
    agriculture: Wheat,
    manufacturing: Factory,
    retail: ShoppingCart,
    freezone: Globe,
    export: Package,
  };

  const canAccessMyth = (myth: TaxMyth) => {
    const tierOrder = { free: 0, basic: 1, business: 2 };
    const userTierValue = tierOrder[tierForMyths as keyof typeof tierOrder] || 0;
    return userTierValue >= tierOrder[myth.tier];
  };

  const canAccessGuide = (guide: SectorGuide) => {
    const tierOrder = { free: 0, basic: 1, business: 2 };
    const userTierValue = tierOrder[tierForMyths as keyof typeof tierOrder] || 0;
    return userTierValue >= tierOrder[guide.tier];
  };

  const handleQuizAnswer = (mythId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [mythId]: answerIndex }));
  };

  const checkQuizAnswer = (mythId: string) => {
    setShowQuizResults(prev => ({ ...prev, [mythId]: true }));
  };

  const getSeverityColor = (severity: TaxMyth['severity']) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      case 'low': return 'bg-info/10 text-info border-info/30';
    }
  };

  const getTierBadge = (articleTier: string) => {
    if (articleTier === 'basic') return { label: 'Basic+', color: 'bg-accent/20 text-accent border border-accent/30' };
    if (articleTier === 'business') return { label: 'Business+', color: 'bg-warning/20 text-warning border border-warning/30' };
    return null;
  };

  // Calculate quiz progress
  const answeredQuizzes = Object.keys(showQuizResults).filter(id => showQuizResults[id]).length;
  const correctQuizzes = Object.keys(showQuizResults).filter(id => {
    const myth = taxMyths.find(m => m.id === id);
    return myth?.quiz && quizAnswers[id] === myth.quiz.correctIndex;
  }).length;

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
• Best for: Scaling businesses, contractors, professionals`
    },
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
              Tax Learning Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Master Nigerian tax laws with our comprehensive guides and resources
            </p>
          </div>

          {/* Quiz Progress (if started) */}
          {answeredQuizzes > 0 && (
            <div className="glass-frosted rounded-2xl p-4 mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Quiz Progress</span>
                <span className="text-sm text-muted-foreground">
                  {correctQuizzes}/{answeredQuizzes} correct
                </span>
              </div>
              <Progress value={(correctQuizzes / Math.max(answeredQuizzes, 1)) * 100} className="h-2" />
            </div>
          )}

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
                  placeholder="Search myths, guides, articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up-delay-3">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1.5 glass-frosted rounded-2xl mb-6">
              <TabsTrigger value="myths" className="py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <ShieldAlert className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Myths</span>
                <span className="sm:hidden">Myths</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <Play className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Videos</span>
                <span className="sm:hidden">Videos</span>
              </TabsTrigger>
              <TabsTrigger value="sectors" className="py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <Factory className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sectors</span>
                <span className="sm:hidden">Sectors</span>
              </TabsTrigger>
              <TabsTrigger value="articles" className="py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Articles</span>
                <span className="sm:hidden">Articles</span>
              </TabsTrigger>
              <TabsTrigger value="faqs" className="py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">FAQs</span>
                <span className="sm:hidden">FAQs</span>
              </TabsTrigger>
            </TabsList>

            {/* Myths Tab */}
            <TabsContent value="myths" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mythCategories.map(cat => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className="rounded-full"
                  >
                    <cat.icon className="h-3 w-3 mr-1" />
                    {cat.label}
                  </Button>
                ))}
              </div>

              {/* Myths Count */}
              <p className="text-sm text-muted-foreground">
                Showing {filteredMyths.length} myths {selectedCategory !== 'all' && `in "${mythCategories.find(c => c.value === selectedCategory)?.label}"`}
              </p>

              {/* Myths List */}
              <div className="space-y-4">
                {filteredMyths.map((myth) => {
                  const hasAccess = canAccessMyth(myth);
                  const badge = getTierBadge(myth.tier);
                  const quizAnswer = quizAnswers[myth.id];
                  const showResult = showQuizResults[myth.id];
                  const isCorrect = myth.quiz && quizAnswer === myth.quiz.correctIndex;

                  return (
                    <Accordion type="single" collapsible key={myth.id}>
                      <AccordionItem value={myth.id} className="glass rounded-2xl px-5 border-0 overflow-hidden">
                        <AccordionTrigger className="py-5 hover:no-underline" disabled={!hasAccess}>
                          <div className="flex items-start gap-4 text-left w-full pr-4">
                            <div className={`p-3 rounded-xl ${getSeverityColor(myth.severity)} flex-shrink-0`}>
                              <XCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline" className={getSeverityColor(myth.severity)}>
                                  {myth.severity === 'high' ? '⚠️ Dangerous' : myth.severity === 'medium' ? '⚡ Moderate' : 'ℹ️ Minor'}
                                </Badge>
                                {badge && (
                                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <span className="text-destructive">MYTH:</span> {myth.myth}
                                {!hasAccess && <Lock className="h-4 w-4 text-muted-foreground" />}
                              </h3>
                            </div>
                          </div>
                        </AccordionTrigger>
                        {hasAccess && (
                          <AccordionContent className="pb-5">
                            <div className="space-y-4 pt-4 border-t border-border/50">
                              {/* Truth */}
                              <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-success mb-1">TRUTH:</p>
                                  <p className="text-foreground">{myth.truth}</p>
                                </div>
                              </div>

                              {/* Explanation */}
                              <div className="p-4 rounded-xl bg-secondary/50">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {myth.explanation}
                                </p>
                              </div>

                              {/* Related Topics */}
                              <div className="flex flex-wrap gap-2">
                                {myth.relatedTopics.map((topic, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>

                              {/* Quiz */}
                              {myth.quiz && (
                                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                                  <p className="font-semibold text-foreground flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-primary" />
                                    Quick Quiz
                                  </p>
                                  <p className="text-sm text-foreground">{myth.quiz.question}</p>
                                  <div className="space-y-2">
                                    {myth.quiz.options.map((option, i) => (
                                      <button
                                        key={i}
                                        onClick={() => handleQuizAnswer(myth.id, i)}
                                        disabled={showResult}
                                        className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                                          showResult
                                            ? i === myth.quiz!.correctIndex
                                              ? 'bg-success/20 border-success text-success'
                                              : quizAnswer === i
                                              ? 'bg-destructive/20 border-destructive text-destructive'
                                              : 'bg-secondary/50 text-muted-foreground'
                                            : quizAnswer === i
                                            ? 'bg-primary/20 border-primary'
                                            : 'bg-secondary/50 hover:bg-secondary'
                                        } border`}
                                      >
                                        {String.fromCharCode(65 + i)}. {option}
                                      </button>
                                    ))}
                                  </div>
                                  {quizAnswer !== null && quizAnswer !== undefined && !showResult && (
                                    <Button size="sm" onClick={() => checkQuizAnswer(myth.id)}>
                                      Check Answer
                                    </Button>
                                  )}
                                  {showResult && (
                                    <div className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                      {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
                                      {myth.quiz.explanation}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    </Accordion>
                  );
                })}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-6">
              {/* Video Categories */}
              {['basics', 'reforms', 'sectors', 'tips'].map((category) => {
                const categoryVideos = videoGuides.filter(v => v.category === category);
                if (categoryVideos.length === 0) return null;
                
                const categoryTitles: Record<string, string> = {
                  basics: 'Tax Fundamentals',
                  reforms: '2026 Tax Reforms',
                  sectors: 'Sector-Specific',
                  tips: 'Tips & Best Practices'
                };
                
                return (
                  <div key={category} className="glass-frosted rounded-3xl p-6">
                    <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      {categoryTitles[category]}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryVideos.map((video) => {
                        const tierOrder = { free: 0, basic: 1, business: 2 };
                        const userTierValue = tierOrder[tierForMyths as keyof typeof tierOrder] || 0;
                        const hasAccess = userTierValue >= tierOrder[video.tier];
                        const badge = getTierBadge(video.tier);
                        
                        return (
                          <div 
                            key={video.id}
                            className={`glass aspect-video rounded-2xl flex items-center justify-center cursor-pointer group hover-lift relative overflow-hidden ${!hasAccess ? 'opacity-70' : ''}`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                              {badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                                  {badge.label}
                                </span>
                              )}
                              {!hasAccess && <Lock className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="text-center relative z-10 px-4">
                              <div className={`w-14 h-14 rounded-full ${hasAccess ? 'bg-gradient-primary glow-primary' : 'bg-muted'} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                {hasAccess ? (
                                  <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-1" />
                                ) : (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <p className="font-medium text-foreground text-sm">{video.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{video.duration} • {video.description.slice(0, 40)}...</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {/* Coming Soon Notice */}
              <div className="glass rounded-2xl p-6 text-center">
                <Play className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">More Videos Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  We're creating more educational content. Check back regularly!
                </p>
              </div>
            </TabsContent>

            {/* Sectors Tab */}
            <TabsContent value="sectors" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGuides.map((guide) => {
                  const hasAccess = canAccessGuide(guide);
                  const badge = getTierBadge(guide.tier);
                  const SectorIcon = sectorIcons[guide.sector] || Package;

                  return (
                    <div
                      key={guide.id}
                      className={`glass rounded-2xl p-5 hover-lift cursor-pointer group ${!hasAccess ? 'opacity-70' : ''}`}
                      onClick={() => hasAccess && navigate(`/learn/sector/${guide.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground flex-shrink-0">
                          <SectorIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {badge && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                                {badge.label}
                              </span>
                            )}
                            {!hasAccess && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {guide.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {guide.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {guide.taxIncentives.slice(0, 2).map((incentive, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {incentive.name}
                              </Badge>
                            ))}
                            {guide.taxIncentives.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{guide.taxIncentives.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sector Detail Modal / Expanded View */}
              <div className="glass-frosted rounded-3xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Quick Reference
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a href="https://nitda.gov.ng" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-primary/5 transition-colors">
                    <Cpu className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">NITDA Portal</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                  <a href="https://nepza.gov.ng" target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-primary/5 transition-colors">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">NEPZA Portal</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                  <a href="https://firs.gov.ng" target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-primary/5 transition-colors">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">FIRS Portal</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                  <a href="https://nepc.gov.ng" target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-primary/5 transition-colors">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">NEPC Portal</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                </div>
              </div>
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles" className="space-y-6">
              {/* Video Section - Glass Cards */}
              <div className="glass-frosted rounded-3xl p-6">
                <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  Quick Videos
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: '2026 Tax Reforms Explained', duration: '2 min' },
                    { title: 'How to Calculate PIT', duration: '3 min' },
                    { title: 'VAT Registration Guide', duration: '4 min' },
                    { title: 'Small Company Benefits', duration: '2 min' }
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

              {/* Articles List */}
              <div className="glass-frosted rounded-3xl p-6">
                <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  Knowledge Base
                </h2>
                <div className="space-y-4">
                  {articles.map((article) => (
                    <Accordion type="single" collapsible key={article.id}>
                      <AccordionItem value={article.id} className="glass rounded-2xl px-5 border-0">
                        <AccordionTrigger className="py-5 hover:no-underline">
                          <div className="flex items-start gap-4 text-left w-full pr-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                                  {article.category}
                                </span>
                                <span className="text-xs text-muted-foreground">{article.readTime}</span>
                              </div>
                              <h3 className="font-semibold text-foreground">{article.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-5">
                          <div className="pt-4 border-t border-border/50">
                            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                              {article.content}
                            </pre>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* FAQs Tab */}
            <TabsContent value="faqs" className="space-y-6">
              <div className="glass-frosted rounded-3xl p-6">
                <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-accent/10">
                    <HelpCircle className="h-5 w-5 text-accent" />
                  </div>
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="glass rounded-2xl px-5 border-0">
                      <AccordionTrigger className="py-4 hover:no-underline text-left">
                        <span className="font-medium text-foreground">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>

          {/* Upgrade CTA */}
          {!isBusinessPlus && (
            <div className="glass-frosted rounded-3xl p-8 text-center mt-8 animate-fade-in">
              <Crown className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Unlock All Content
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get access to advanced sector guides, all tax myths, and exclusive content with a Business plan.
              </p>
              <Button variant="glow" size="lg" onClick={() => navigate('/pricing')}>
                <Crown className="h-5 w-5" />
                Upgrade Now
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Learn;
