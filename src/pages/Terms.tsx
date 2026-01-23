import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Shield, 
  Lock, 
  AlertTriangle, 
  Scale, 
  Mail, 
  ArrowLeft, 
  CreditCard, 
  RefreshCcw,
  CheckCircle2,
  Database,
  Eye,
  UserCheck,
  Globe,
  Bell,
  XCircle,
  Clock,
  ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";

type PolicySection = 'terms' | 'privacy' | 'refund';

const Terms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastUpdated = "January 22, 2026";
  const [activeSection, setActiveSection] = useState<PolicySection>('terms');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle hash navigation for direct links to sections
  useEffect(() => {
    const hash = location.hash.slice(1) as PolicySection;
    if (['terms', 'privacy', 'refund'].includes(hash)) {
      setActiveSection(hash);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  // Show back to top button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (section: PolicySection) => {
    setActiveSection(section);
    window.history.replaceState(null, '', `/terms#${section}`);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout title="Legal & Policies" description={`Last updated: ${lastUpdated}`} icon={FileText} maxWidth="4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />Back
      </Button>

      {/* Quick Navigation Tabs */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-3 mb-6 -mx-4 px-4 border-b border-border/50">
        <Tabs value={activeSection} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger 
              value="terms" 
              onClick={() => scrollToSection('terms')}
              className="flex items-center gap-2"
            >
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Terms</span>
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              onClick={() => scrollToSection('privacy')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger 
              value="refund" 
              onClick={() => scrollToSection('refund')}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Refund</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Important Notice */}
      <Card className="mb-6 border-warning/30 bg-warning/5">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">Important Disclaimer</p>
              <p className="text-sm text-muted-foreground">
                TaxForge NG provides tax estimates for planning purposes only. This is NOT professional tax advice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* ========== TERMS OF SERVICE ========== */}
        <section id="terms" className="scroll-mt-32">
          <Card className="shadow-card border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Scale className="h-6 w-6 text-primary" />
                Terms & Conditions
              </CardTitle>
              <p className="text-sm text-muted-foreground">Effective Date: January 1, 2025</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground">
              {/* Section 1 */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                  Acceptance of Terms
                </h3>
                <p>By accessing or using TaxForge NG, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
              </div>
              <Separator />
              
              {/* Section 2 */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                  Service Description
                </h3>
                <p className="mb-2">TaxForge NG is a tax compliance and advisory platform for Nigerian businesses and individuals.</p>
                <div className="rounded-lg border border-warning/50 bg-warning/5 p-3">
                  <p className="text-sm font-medium text-warning-foreground mb-1">⚠️ Educational Use Only</p>
                  <ul className="space-y-1 text-sm">
                    <li>• All calculations are <strong>estimates for planning purposes only</strong></li>
                    <li>• This is <strong>not professional tax, legal, or financial advice</strong></li>
                    <li>• You are responsible for verifying all calculations</li>
                  </ul>
                </div>
              </div>
              <Separator />
              
              {/* Section 3 */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                  Account Registration
                </h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>You must be at least <strong>18 years old</strong> to create an account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>You must provide accurate and complete information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>You are responsible for maintaining account security</span>
                  </li>
                </ul>
              </div>
              <Separator />
              
              {/* Section 4 */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">4</span>
                  Subscriptions & Payments
                </h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Paid subscriptions are billed in advance (monthly or annually)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>All prices are in Nigerian Naira (₦) and include applicable taxes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Payments are processed securely via Paystack</span>
                  </li>
                </ul>
              </div>
              <Separator />
              
              {/* Section 5 */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">5</span>
                  User Responsibilities
                </h3>
                <ul className="space-y-1">
                  <li>• Use the service only for lawful purposes</li>
                  <li>• Provide accurate financial and tax information</li>
                  <li>• Verify all calculations before filing with FIRS</li>
                  <li>• Not reverse-engineer or redistribute our software</li>
                </ul>
              </div>
              <Separator />
              
              {/* Section 6 */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">6</span>
                  Limitation of Liability
                </h3>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p><strong>THE SERVICE IS PROVIDED "AS IS"</strong> without warranties of any kind.</p>
                </div>
                <ul className="space-y-1 mt-2">
                  <li>• We are not liable for tax penalties or losses from using our calculations</li>
                  <li>• Maximum liability is limited to the amount paid in the preceding 12 months</li>
                </ul>
              </div>
              <Separator />
              
              {/* Section 7 */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">7</span>
                  Termination
                </h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>You may cancel your account at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>We may suspend accounts that violate these Terms</span>
                  </li>
                </ul>
              </div>
              <Separator />
              
              {/* Section 8 - Governing Law */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">8</span>
                  Governing Law & Jurisdiction
                </h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>These Terms are governed by the <strong>laws of the Federal Republic of Nigeria</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Disputes subject to exclusive jurisdiction of courts in <strong>Lagos or Port Harcourt</strong></span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ========== PRIVACY POLICY ========== */}
        <section id="privacy" className="scroll-mt-32">
          <Card className="shadow-card border-success/20">
            <CardHeader className="bg-success/5 border-b border-success/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-6 w-6 text-success" />
                Privacy Policy
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <Shield className="h-3 w-3" />
                  NDPA 2023 Compliant
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground">
              {/* Data Controller */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">1</span>
                  Data Controller & DPO
                </h3>
                <div className="rounded-lg bg-card border p-3 space-y-1">
                  <p><strong>Data Controller:</strong> TaxForge Nigeria Limited</p>
                  <p>Email: <a href="mailto:privacy@taxforgeng.com" className="text-primary hover:underline">privacy@taxforgeng.com</a></p>
                  <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@taxforgeng.com" className="text-primary hover:underline">dpo@taxforgeng.com</a></p>
                </div>
              </div>
              <Separator />
              
              {/* Data We Collect */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4 text-success" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">2</span>
                  Data We Collect
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="font-semibold text-foreground text-xs mb-1">Account Information</p>
                    <p className="text-xs">Name, email, phone, state of residence</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="font-semibold text-foreground text-xs mb-1">Tax & Financial Data</p>
                    <p className="text-xs">Income, expenses, business info, TIN</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="font-semibold text-foreground text-xs mb-1">Payment Information</p>
                    <p className="text-xs">Card details (via Paystack), transaction history</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="font-semibold text-foreground text-xs mb-1">Usage & Device Data</p>
                    <p className="text-xs">IP address, browser, device info</p>
                  </div>
                </div>
              </div>
              <Separator />
              
              {/* Lawful Basis */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-success" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">3</span>
                  Lawful Basis for Processing
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold">Purpose</th>
                        <th className="text-left p-2 font-semibold">Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="p-2">Tax calculation services</td><td className="p-2"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Contract</span></td></tr>
                      <tr className="border-b"><td className="p-2">Payment processing</td><td className="p-2"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Contract</span></td></tr>
                      <tr className="border-b"><td className="p-2">Security & fraud prevention</td><td className="p-2"><span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">Legitimate Interest</span></td></tr>
                      <tr className="border-b"><td className="p-2">Marketing communications</td><td className="p-2"><span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">Consent</span></td></tr>
                      <tr><td className="p-2">Legal compliance</td><td className="p-2"><span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning">Legal Obligation</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <Separator />
              
              {/* Data Security */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-success" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">4</span>
                  Data Security
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
                    <Lock className="h-4 w-4 text-success" />
                    <span className="text-xs">AES-256 Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span className="text-xs">Role-Based Access Controls</span>
                  </div>
                </div>
              </div>
              <Separator />
              
              {/* Your Rights */}
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-success" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">5</span>
                  Your Rights Under NDPA 2023
                </h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { title: "Access", desc: "Request a copy of your data" },
                    { title: "Rectification", desc: "Correct inaccurate data" },
                    { title: "Erasure", desc: "Request deletion" },
                    { title: "Restriction", desc: "Limit processing" },
                    { title: "Object", desc: "Object to processing" },
                    { title: "Portability", desc: "Receive data in portable format" },
                  ].map((right) => (
                    <div key={right.title} className="rounded-lg border bg-card p-2">
                      <p className="font-semibold text-foreground text-xs">{right.title}</p>
                      <p className="text-xs text-muted-foreground">{right.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3">
                  Contact our DPO at <a href="mailto:dpo@taxforgeng.com" className="text-primary hover:underline">dpo@taxforgeng.com</a>. 
                  We respond within 30 days. You may lodge complaints with the <strong>Nigeria Data Protection Commission (NDPC)</strong>.
                </p>
              </div>
              <Separator />
              
              {/* Data Breach */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-success" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">6</span>
                  Data Breach Notification
                </h3>
                <div className="rounded-lg border border-warning/50 bg-warning/5 p-3">
                  <p className="text-xs">
                    In the event of a data breach that poses a risk to your rights and freedoms, 
                    we will notify you and the NDPC within <strong>72 hours</strong> of becoming aware of the breach.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ========== REFUND POLICY ========== */}
        <section id="refund" className="scroll-mt-32">
          <Card className="shadow-card border-accent/20">
            <CardHeader className="bg-accent/5 border-b border-accent/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-6 w-6 text-accent" />
                Refund Policy
              </CardTitle>
              <p className="text-sm text-muted-foreground">Effective Date: January 1, 2025</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground">
              {/* Quick Summary */}
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Quick Summary</p>
                    <ul className="space-y-1 text-xs">
                      <li>✓ <strong>7-day free trial</strong> – cancel anytime, no charge</li>
                      <li>✓ <strong>30-day</strong> pro-rated refunds for annual subscriptions</li>
                      <li>✓ <strong>Monthly subscriptions</strong> can be cancelled anytime</li>
                      <li>✗ <strong>No refunds</strong> after 30 days of subscription</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Free Trial */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">1</span>
                  7-Day Free Trial
                </h3>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <RefreshCcw className="h-5 w-5 text-accent shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Try Before You Buy</p>
                    <p className="text-xs">All paid plans include a 7-day free trial. Cancel anytime during trial with no charge.</p>
                  </div>
                </div>
              </div>
              <Separator />
              
              {/* Annual Refunds */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">2</span>
                  Annual Subscription Refunds
                </h3>
                <div className="rounded-lg border border-success/50 bg-success/5 p-3">
                  <p className="font-semibold text-success-foreground text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    30-Day Pro-Rated Refund Period
                  </p>
                  <p className="text-xs">
                    Cancel within 30 days of annual payment for a pro-rated refund of unused days.
                  </p>
                </div>
              </div>
              <Separator />
              
              {/* Monthly Subscriptions */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">3</span>
                  Monthly Subscription Cancellations
                </h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>Cancel anytime; access continues until end of billing period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span><strong>No refunds</strong> for partial months</span>
                  </li>
                </ul>
              </div>
              <Separator />
              
              {/* Non-Refundable */}
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10 text-xs font-bold text-warning">4</span>
                  Non-Refundable Items
                </h3>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                    <span>Subscriptions after 30 days from payment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                    <span>Partial month usage on monthly plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                    <span>Accounts terminated for ToS violations</span>
                  </li>
                </ul>
              </div>
              <Separator />
              
              {/* How to Request */}
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">5</span>
                  How to Request a Refund
                </h3>
                <p className="mb-2">Email us at <a href="mailto:billing@taxforgeng.com" className="text-primary hover:underline">billing@taxforgeng.com</a> with:</p>
                <ol className="space-y-1 list-decimal list-inside text-xs">
                  <li>Your account email address</li>
                  <li>Subscription details / transaction reference</li>
                  <li>Reason for refund request</li>
                </ol>
                <p className="text-xs mt-2">We respond within <strong>5 business days</strong>. Refunds processed within 7-14 business days.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>For questions about these policies, contact our team:</p>
            <div className="mt-3 p-3 rounded-lg bg-muted">
              <p className="font-medium text-foreground">TaxForge NG Legal & Privacy</p>
              <p>Legal: <a href="mailto:legal@taxforgeng.com" className="text-primary hover:underline">legal@taxforgeng.com</a></p>
              <p>Privacy/DPO: <a href="mailto:dpo@taxforgeng.com" className="text-primary hover:underline">dpo@taxforgeng.com</a></p>
              <p>Billing: <a href="mailto:billing@taxforgeng.com" className="text-primary hover:underline">billing@taxforgeng.com</a></p>
              <p>Support: <a href="mailto:support@taxforgeng.com" className="text-primary hover:underline">support@taxforgeng.com</a></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        By using TaxForge NG, you acknowledge that you have read and agree to these Terms of Service, Privacy Policy, and Refund Policy.
      </p>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </PageLayout>
  );
};

export default Terms;