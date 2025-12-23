import { NavMenu } from "@/components/NavMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Shield, 
  Lock, 
  AlertTriangle, 
  Scale, 
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();
  const lastUpdated = "December 20, 2025";

  return (
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Terms of Service & Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <Card className="mb-6 border-warning/30 bg-warning/5 animate-fade-in">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Important Disclaimer</p>
                  <p className="text-sm text-muted-foreground">
                    TaxForge NG provides educational tax estimates based on the Nigeria Tax Act 2025. 
                    This is NOT official tax advice. Always consult FIRS, state IRS, or certified tax 
                    professionals for official guidance. We are not liable for any errors, omissions, 
                    or decisions made based on information from this platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 animate-fade-in">
            {/* Terms of Service */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Terms of Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
                  <p>
                    By accessing or using TaxForge NG ("the Service"), you agree to be bound by these 
                    Terms of Service. If you do not agree to these terms, do not use the Service.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. Service Description</h3>
                  <p>
                    TaxForge NG is a tax compliance and advisory platform designed for Nigerian businesses, 
                    SMEs, and freelancers. The Service provides tax calculations, educational resources, 
                    expense tracking, and related tools. All calculations are estimates for planning purposes only.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">3. No Professional Advice</h3>
                  <p>
                    The Service does NOT provide professional tax, legal, or financial advice. All 
                    information is for educational and illustrative purposes only. You should consult 
                    with qualified professionals (accountants, tax consultants, lawyers) before making 
                    any tax-related decisions or filings.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">4. Limitation of Liability</h3>
                  <p>
                    TaxForge NG, its owners, operators, and affiliates shall NOT be liable for any 
                    direct, indirect, incidental, consequential, or punitive damages arising from:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Errors or inaccuracies in tax calculations</li>
                    <li>Decisions made based on information from the Service</li>
                    <li>Penalties, fines, or liabilities from tax authorities</li>
                    <li>Loss of data or business interruption</li>
                    <li>Any use or inability to use the Service</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">5. User Responsibilities</h3>
                  <p>You agree to:</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Provide accurate and truthful information</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Not use the Service for any unlawful purpose</li>
                    <li>Verify all calculations with qualified professionals before filing</li>
                    <li>Comply with all applicable Nigerian tax laws and regulations</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">6. Subscription & Payments</h3>
                  <p>
                    Premium features require a paid subscription. Payments are processed securely via 
                    Paystack. Refunds are handled on a case-by-case basis. Subscription fees are 
                    subject to change with 30 days notice.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Policy */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. NDPR Compliance</h3>
                  <p>
                    TaxForge NG complies with the Nigeria Data Protection Regulation (NDPR) 2019 and 
                    related data protection laws. We are committed to protecting your personal data 
                    and respecting your privacy rights.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. Data We Collect</h3>
                  <p>We collect and process:</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Account information (email, name)</li>
                    <li>Business data (names, turnover, entity types)</li>
                    <li>Financial data (income, expenses, tax calculations)</li>
                    <li>Usage data (features used, interactions)</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">3. Data Security</h3>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20 mt-2">
                    <Lock className="h-5 w-5 text-success flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">AES-256 Encryption</p>
                      <p className="text-sm">
                        All sensitive data (TIN numbers, financial information) is encrypted using 
                        industry-standard AES-256 encryption at rest and TLS 1.3 in transit.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">4. Data Usage</h3>
                  <p>Your data is used to:</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Provide and improve the Service</li>
                    <li>Generate tax calculations and reports</li>
                    <li>Send notifications and reminders (with consent)</li>
                    <li>Analyze usage patterns (anonymized)</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">5. Data Sharing</h3>
                  <p>
                    We do NOT sell your personal data. Data may be shared with:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Service providers (hosting, payment processing) under strict contracts</li>
                    <li>Legal authorities when required by law</li>
                    <li>Third parties only with your explicit consent</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">6. Your Rights</h3>
                  <p>Under NDPR, you have the right to:</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to data processing</li>
                    <li>Data portability</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">7. Data Retention</h3>
                  <p>
                    We retain your data for as long as your account is active or as needed to provide 
                    services. After account deletion, data is retained for up to 90 days for legal 
                    compliance, then permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  For questions about these terms, privacy concerns, or data requests, contact us at:
                </p>
                <div className="mt-3 p-3 rounded-lg bg-muted">
                  <p className="font-medium text-foreground">TaxForge NG Legal & Privacy</p>
                  <p>Email: legal@taxforge.ng</p>
                  <p>Address: Lagos, Nigeria</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            By using TaxForge NG, you acknowledge that you have read, understood, and agree 
            to these Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Terms;
