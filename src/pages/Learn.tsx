import { useState, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { 
  taxMyths, 
  sectorGuides, 
  searchMythsAndGuides,
  type TaxMyth,
  type SectorGuide,
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

  const tierForMyths = tier === 'corporate' ? 'business' : (tier === 'basic' ? 'basic' : 'free');

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

  const generatePersonalizedTips = () => {
    const tips = [];
    
    if (savedBusinesses.length > 0) {
      const totalTurnover = savedBusinesses.reduce((sum, b) => sum + b.turnover, 0);
      const hasCompany = savedBusinesses.some(b => b.entityType === 'company');
      
      if (totalTurnover > 25000000) {
        tips.push({
          icon: DollarSign,
          title: "VAT Registration Required",
          description: `Your combined turnover of ${formatCurrency(totalTurnover)} exceeds ₦25m. Register for VAT.`,
        });
      }
      
      if (hasCompany && savedBusinesses.some(b => b.turnover <= 50000000)) {
        tips.push({
          icon: CheckCircle2,
          title: "Small Company Benefits",
          description: "Under 2026 rules, companies with turnover ≤₦50m pay 0% CIT!",
        });
      }
    }

    tips.push({
      icon: Lightbulb,
      title: "File Early, Avoid Penalties",
      description: "CIT returns are due by June 30th. File early to avoid 10% late filing penalty.",
    });

    tips.push({
      icon: Building2,
      title: "Entity Structure Matters",
      description: "Choosing between Business Name and Company can save you thousands in taxes.",
    });

    return tips.slice(0, 4);
  };

  const personalizedTips = generatePersonalizedTips();

  const mythCategories = [
    { value: 'all', label: 'All Myths', icon: ShieldAlert },
    { value: 'gifts', label: 'Gifts & Income', icon: DollarSign },
    { value: 'audits', label: 'Audits', icon: Search },
    { value: 'penalties', label: 'Penalties', icon: AlertTriangle },
    { value: 'vat', label: 'VAT', icon: Calculator },
    { value: 'reforms', label: '2026 Reforms', icon: Sparkles },
    { value: 'general', label: 'General', icon: HelpCircle },
  ];

  const canAccessMyth = (myth: TaxMyth) => {
    const tierOrder = { free: 0, basic: 1, business: 2 };
    const userTierValue = tierOrder[tierForMyths as keyof typeof tierOrder] || 0;
    return userTierValue >= tierOrder[myth.tier];
  };

  const getSeverityColor = (severity: TaxMyth['severity']) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      case 'low': return 'bg-info/10 text-info border-info/30';
    }
  };

  const answeredQuizzes = Object.keys(showQuizResults).filter(id => showQuizResults[id]).length;
  const correctQuizzes = Object.keys(showQuizResults).filter(id => {
    const myth = taxMyths.find(m => m.id === id);
    return myth?.quiz && quizAnswers[id] === myth.quiz.correctIndex;
  }).length;

  const faqs = [
    {
      question: "When are CIT returns due?",
      answer: "Company Income Tax returns must be filed by June 30th of each year for the preceding year."
    },
    {
      question: "What's the penalty for late filing?",
      answer: "Late CIT filing attracts a 10% penalty on the tax due, plus interest at CBN lending rate."
    },
    {
      question: "Do I need to register for VAT?",
      answer: "VAT registration is mandatory if your annual turnover exceeds ₦25 million."
    },
    {
      question: "Are dividends taxable in Nigeria?",
      answer: "Franked dividends from Nigerian companies are tax-exempt."
    },
    {
      question: "What qualifies as a 'Small Company'?",
      answer: "Under 2026 rules, a company qualifies as small if turnover is ≤₦50m AND fixed assets are ≤₦250m."
    }
  ];

  return (
    <PageLayout 
      title="Tax Learning Center" 
      description="Master Nigerian tax laws with our comprehensive guides" 
      icon={GraduationCap} 
      maxWidth="6xl"
    >
      {/* Quiz Progress */}
      {answeredQuizzes > 0 && (
        <div className="glass-frosted rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Quiz Progress</span>
            <span className="text-sm text-muted-foreground">{correctQuizzes}/{answeredQuizzes} correct</span>
          </div>
          <Progress value={(correctQuizzes / Math.max(answeredQuizzes, 1)) * 100} className="h-2" />
        </div>
      )}

      {/* Personalized Tips */}
      <div className="glass-frosted rounded-3xl p-6 mb-8">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-warning/10">
            <Sparkles className="h-5 w-5 text-warning" />
          </div>
          Your Tax Tips
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {personalizedTips.map((tip, index) => (
            <div key={index} className="glass p-5 rounded-2xl hover-lift cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-primary glow-primary group-hover:scale-110 transition-transform">
                  <tip.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <div className="neumorphic p-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search myths, guides, articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 glass-frosted rounded-2xl mb-6">
          <TabsTrigger value="myths" className="py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Myths
          </TabsTrigger>
          <TabsTrigger value="articles" className="py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="faqs" className="py-3 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
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

          <p className="text-sm text-muted-foreground">
            Showing {filteredMyths.length} myths
          </p>

          {/* Myths List */}
          <div className="space-y-4">
            {filteredMyths.map((myth) => {
              const hasAccess = canAccessMyth(myth);

              return (
                <Accordion type="single" collapsible key={myth.id}>
                  <AccordionItem value={myth.id} className="glass-frosted rounded-2xl border-0 overflow-hidden">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                      <div className="flex items-start gap-3 text-left">
                        <div className={`p-2 rounded-lg ${getSeverityColor(myth.severity)}`}>
                          <XCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{myth.myth}</p>
                          {!hasAccess && (
                            <Badge variant="secondary" className="mt-1">
                              <Lock className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5">
                      {hasAccess ? (
                        <div className="space-y-4 pl-11">
                          <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span className="font-semibold text-success text-sm">Reality</span>
                            </div>
                            <p className="text-sm text-foreground">{myth.fact}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{myth.explanation}</p>
                        </div>
                      ) : (
                        <div className="pl-11 p-4 rounded-xl bg-muted/50 text-center">
                          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">Upgrade to access this content</p>
                          <Button size="sm" onClick={() => navigate('/pricing')}>
                            <Crown className="h-4 w-4 mr-1" />
                            Upgrade
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </div>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-4">
          <div className="glass-frosted rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Nigeria Tax Act 2025: Complete Guide</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Everything you need to know about the new tax reforms taking effect in 2026.
            </p>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-secondary/50">
                <strong className="text-foreground">Personal Income Tax (PIT):</strong>
                <p className="text-muted-foreground mt-1">First ₦800,000 now exempt. New rates: 15%, 19%, 21%, 25%.</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <strong className="text-foreground">Company Income Tax (CIT):</strong>
                <p className="text-muted-foreground mt-1">Standard rate reduced to 25%. Small companies (≤₦50m): 0% CIT.</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <strong className="text-foreground">VAT:</strong>
                <p className="text-muted-foreground mt-1">7.5% rate unchanged. Mandatory registration if turnover &gt; ₦25m.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="glass-frosted rounded-2xl border-0 px-5">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <span className="font-medium text-foreground text-left">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Learn;
