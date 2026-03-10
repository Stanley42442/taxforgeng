import { useState, useEffect } from 'react';
import { SEOHead, createBreadcrumbSchema } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Users, Building2, Calculator, 
  Receipt, FileSpreadsheet, Bell, Bot, Shield, 
  CreditCard, Code, Lock, LayoutDashboard, Rocket,
  TrendingUp, CheckCircle2, Zap, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentationStats } from '@/hooks/useDocumentationStats';
import { downloadDocumentationPDF } from '@/lib/documentationPdf';
import { downloadTaxLogicDocumentPDF } from '@/lib/taxLogicDocumentPdf';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import logger from '@/lib/logger';

const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  isLoading 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  isLoading: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="relative overflow-hidden border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardContent className="relative p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">
                <AnimatedCounter value={value} />
              </p>
            )}
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  features 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  features: string[];
}) => (
  <Card className="h-full border-border/50">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const PricingTier = ({ 
  name, 
  price, 
  target, 
  features, 
  popular 
}: { 
  name: string; 
  price: string; 
  target: string; 
  features: string[];
  popular?: boolean;
}) => (
  <Card className={`relative border-border/50 bg-card/50 backdrop-blur-sm ${popular ? 'ring-2 ring-primary' : ''}`}>
    {popular && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
        Most Popular
      </Badge>
    )}
    <CardHeader className="text-center">
      <CardTitle className="text-xl">{name}</CardTitle>
      <div className="mt-2">
        <span className="text-3xl font-bold text-primary">{price}</span>
        {price !== 'Custom' && price !== '₦0' && <span className="text-muted-foreground">/mo</span>}
      </div>
      <CardDescription>{target}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const Documentation = () => {
  const { data: stats, isLoading } = useDocumentationStats();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingTaxLogic, setIsExportingTaxLogic] = useState(false);

  const handleExportPDF = async () => {
    if (!stats) {
      toast.error('Please wait for statistics to load');
      return;
    }

    setIsExporting(true);
    try {
      await downloadDocumentationPDF(stats);
      toast.success('Documentation PDF downloaded successfully!');
    } catch (error) {
      logger.error('PDF export error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTaxLogicPDF = async () => {
    setIsExportingTaxLogic(true);
    try {
      await downloadTaxLogicDocumentPDF();
      toast.success('Tax Logic Reference PDF downloaded successfully!');
    } catch (error) {
      logger.error('Tax Logic PDF export error:', error);
      toast.error('Failed to generate Tax Logic PDF. Please try again.');
    } finally {
      setIsExportingTaxLogic(false);
    }
  };

  const defaultStats = {
    totalUsers: 0,
    totalBusinesses: 0,
    totalCalculations: 0,
    totalExpenses: 0,
    totalInvoices: 0,
    totalReminders: 0,
    totalAiQueries: 0,
    totalIndividualCalcs: 0,
  };

  const currentStats = stats || defaultStats;

  return (
    <>
    <SEOHead
      title="TaxForge NG Documentation - Platform Overview & Tax Rules"
      description="Comprehensive documentation for TaxForge NG: live statistics, feature overview, pricing tiers, technical architecture, and security details for investors and partners."
      canonicalPath="/documentation"
      keywords="TaxForge documentation, Nigerian tax platform, tax software documentation, TaxForge NG overview"
      schema={createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Documentation', url: 'https://taxforgeng.com/documentation' },
      ])}
    />
    <PageLayout 
      title="Project Documentation" 
      description="Comprehensive overview of TaxForge NG for investors and partners"
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">
            <FileText className="h-3 w-3 mr-1" />
            Project Documentation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            TaxForge NG
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Nigerian Tax Calculator For Smart Businesses
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={handleExportPDF} disabled={isExporting || isLoading} size="lg">
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Generating PDF...' : 'Download PDF'}
            </Button>
            <Button onClick={handleExportTaxLogicPDF} disabled={isExportingTaxLogic} size="lg" variant="secondary">
              <FileText className="h-4 w-4 mr-2" />
              {isExportingTaxLogic ? 'Generating...' : 'Tax Logic Reference'}
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://taxforgeng.com" target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Visit Live Site
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Live Statistics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Live Platform Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={currentStats.totalUsers} isLoading={isLoading} />
            <StatCard icon={Building2} label="Businesses Created" value={currentStats.totalBusinesses} isLoading={isLoading} />
            <StatCard icon={Calculator} label="Tax Calculations" value={currentStats.totalCalculations + currentStats.totalIndividualCalcs} isLoading={isLoading} />
            <StatCard icon={Bot} label="AI Queries Processed" value={currentStats.totalAiQueries} isLoading={isLoading} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard icon={Receipt} label="Expenses Tracked" value={currentStats.totalExpenses} isLoading={isLoading} />
            <StatCard icon={FileSpreadsheet} label="Invoices Generated" value={currentStats.totalInvoices} isLoading={isLoading} />
            <StatCard icon={Bell} label="Active Reminders" value={currentStats.totalReminders} isLoading={isLoading} />
            <StatCard icon={Zap} label="Edge Functions" value={17} isLoading={false} />
          </div>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2 bg-transparent">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Features
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Pricing
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Technical
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Security
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  TaxForge NG is a comprehensive Nigerian tax calculation and compliance platform designed to 
                  simplify tax management for individuals and businesses. The platform addresses the complexity 
                  of Nigerian tax law, including the 2026 tax reform changes, providing accessible tools for 
                  accurate calculations, compliance tracking, and business financial management.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Problem Statement</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        Complex Nigerian tax calculations spanning CIT, VAT, WHT, PIT, and CGT
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        2026 tax reform changes creating confusion for businesses
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        Lack of accessible, affordable tax tools for small businesses
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        Manual compliance tracking leading to missed deadlines and penalties
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Our Solution</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        All-in-one tax calculation and compliance platform
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        AI-powered tax assistant for complex queries
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Progressive pricing from free to enterprise
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Automated reminders and compliance tracking
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Key Differentiators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Calculator, title: 'Accurate Calculations', desc: '2026 Tax Rules (NTA 2025)' },
                    { icon: Bot, title: 'AI-Powered', desc: 'Intelligent tax assistant' },
                    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade protection' },
                    { icon: Rocket, title: 'PWA Support', desc: 'Works offline, installs on device' },
                  ].map((item, index) => (
                    <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                      <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard
                icon={Calculator}
                title="Tax Calculators"
                description="Comprehensive Nigerian tax calculations"
                features={[
                  'Personal Income Tax (PIT) with 2026 rules (NTA 2025)',
                  'Company Income Tax (CIT) with small company exemptions',
                  'VAT calculations with sector-specific rules',
                  'Withholding Tax (WHT) credit tracking',
                  'Capital Gains Tax (CGT) with investor exemptions',
                  'Foreign income with Double Tax Treaty credits',
                  'Crypto and investment income calculations',
                ]}
              />
              <FeatureCard
                icon={Building2}
                title="Business Management"
                description="Complete business financial tools"
                features={[
                  'Multi-business portfolio management',
                  'CAC verification integration',
                  'Professional invoice creation',
                  'AI-powered OCR receipt scanning',
                  'Profit and Loss statements',
                  'Payroll and PAYE calculator',
                ]}
              />
              <FeatureCard
                icon={Bell}
                title="Compliance & Planning"
                description="Stay compliant and plan ahead"
                features={[
                  'Nigerian tax calendar with deadlines',
                  'Email, push, and WhatsApp reminders',
                  'E-filing preparation and documents',
                  'Compliance status dashboards',
                  'Scenario modeling for optimization',
                  'Multi-year financial projections',
                ]}
              />
              <FeatureCard
                icon={Bot}
                title="AI & Advisory"
                description="Intelligent guidance and support"
                features={[
                  'Business structure wizard',
                  'AI Tax Assistant for queries',
                  'Sector-specific guidance (15+ industries)',
                  'Personalized tax-saving recommendations',
                  'Interactive advisory questionnaire',
                ]}
              />
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-6">
              <CardContent className="py-4">
                <p className="text-center text-muted-foreground">
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  6-tier subscription model • Annual billing saves ~17% • Free trial available
                </p>
              </CardContent>
            </Card>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <PricingTier
                name="Free (Individual)"
                price="₦0"
                target="Employees with no business income"
                features={[
                  'Personal tax calculator',
                  'Crypto tax calculations',
                  'Foreign income credits',
                  'Basic tax guidance',
                ]}
              />
              <PricingTier
                name="Starter"
                price="₦500"
                target="Side hustlers"
                features={[
                  '1 saved business',
                  'PDF/CSV exports',
                  'No watermarks',
                  'Email reminders',
                ]}
              />
              <PricingTier
                name="Basic"
                price="₦2,000"
                target="Freelancers & solo professionals"
                features={[
                  '2 businesses',
                  'Invoice management',
                  'OCR receipt scanning',
                  '75 AI queries/month',
                  'P&L statements',
                ]}
              />
              <PricingTier
                name="Professional"
                price="₦4,999"
                target="Small businesses"
                popular
                features={[
                  '5 businesses',
                  'Payroll calculator',
                  'Digital VAT support',
                  'Compliance tracker',
                  'Scenario modeling',
                ]}
              />
              <PricingTier
                name="Business"
                price="₦8,999"
                target="Growing businesses"
                features={[
                  '10 businesses',
                  'CAC verification',
                  'Advanced scenarios',
                  'Tax filing prep',
                  '2 team seats',
                ]}
              />
              <PricingTier
                name="Corporate"
                price="Custom"
                target="Enterprises"
                features={[
                  'Unlimited everything',
                  'API access',
                  'Audit log',
                  'IP whitelist',
                  'Dedicated support',
                  'White-label options',
                ]}
              />
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Frontend Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• React 18 with TypeScript</li>
                    <li>• Vite for fast builds</li>
                    <li>• Tailwind CSS with glass-morphism design</li>
                    <li>• shadcn/ui component library</li>
                    <li>• Framer Motion animations</li>
                    <li>• Progressive Web App (PWA)</li>
                    <li>• Offline support</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Backend Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• PostgreSQL database</li>
                    <li>• Row Level Security (RLS)</li>
                    <li>• 17 Edge Functions</li>
                    <li>• Real-time subscriptions</li>
                    <li>• Secure secrets management</li>
                    <li>• Auto-scaling infrastructure</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Database Schema (25+ Tables)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    'profiles', 'businesses', 'expenses', 'invoices', 'tax_calculations',
                    'reminders', 'compliance_items', 'subscription_history', 'tier_data_snapshots',
                    'auth_events', 'known_devices', 'audit_logs', 'ai_queries', 'partners',
                    'clients', 'personal_expenses', 'referrals', 'achievements', 'feedback'
                  ].map((table) => (
                    <Badge key={table} variant="outline">{table}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Edge Functions (17 Serverless Functions)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div>• tax-assistant</div>
                  <div>• categorize-expense</div>
                  <div>• expense-insights</div>
                  <div>• send-welcome-email</div>
                  <div>• send-reminder-email</div>
                  <div>• send-tier-change-email</div>
                  <div>• send-security-alert</div>
                  <div>• send-whatsapp-notification</div>
                  <div>• check-reminders</div>
                  <div>• check-trial-expiry</div>
                  <div>• send-scheduled-reports</div>
                  <div>• partner-api</div>
                  <div>• get-ip-location</div>
                  <div>• send-backup-code-alert</div>
                  <div>• send-trial-expiry-reminder</div>
                  <div>• send-trial-final-reminder</div>
                  <div>• send-winback-email</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Enterprise-Grade Security
                </CardTitle>
                <CardDescription>
                  Comprehensive security measures to protect user data and ensure compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Device Fingerprinting', desc: 'Track and verify user devices' },
                    { title: 'IP Whitelist', desc: 'Restrict access by IP for corporate accounts' },
                    { title: 'Time Restrictions', desc: 'Limit access by time and day' },
                    { title: 'Two-Factor Auth', desc: 'Additional login verification' },
                    { title: 'Backup Codes', desc: 'Recovery codes with email alerts' },
                    { title: 'Login Blocking', desc: 'Block after failed attempts' },
                    { title: 'Security Analytics', desc: 'Dashboard for security insights' },
                    { title: 'Audit Logging', desc: 'Comprehensive event tracking' },
                    { title: 'Row Level Security', desc: 'Database-level access control' },
                    { title: 'Encrypted Storage', desc: 'All sensitive data encrypted' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Platform Pages (44+)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Public Pages</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Landing page</li>
                      <li>• Pricing</li>
                      <li>• Tax Calendar</li>
                      <li>• Learn Center</li>
                      <li>• Terms & Roadmap</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Authenticated Pages</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Dashboard</li>
                      <li>• Tax Calculators</li>
                      <li>• Businesses & Invoices</li>
                      <li>• Expenses & Payroll</li>
                      <li>• Settings & Security</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Admin Pages</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Admin Analytics</li>
                      <li>• AI Query Analytics</li>
                      <li>• Audit Log</li>
                      <li>• Accountant Portal</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Roadmap & Future Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Enhanced API access for integrations',
                    'Native mobile apps (iOS & Android)',
                    'QuickBooks & Xero integrations',
                    'Advanced team collaboration',
                    'Multi-currency support',
                    'Expanded sector modules',
                    'White-label solutions',
                    'Advanced reporting suite',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="border-border/50 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold mb-2">Interested in Learning More?</h3>
              <p className="text-muted-foreground mb-4">
                Visit our live platform or get in touch for partnership opportunities
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <a href="https://taxforgeng.com" target="_blank" rel="noopener noreferrer">
                    Visit TaxForge NG
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:hello@taxforgeng.com">
                    Contact Us
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
    </>
  );
};

export default Documentation;
