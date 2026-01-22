import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, Lock, AlertTriangle, Scale, Mail, ArrowLeft, CreditCard, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastUpdated = "January 22, 2026";

  // Handle hash navigation for direct links to sections
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <PageLayout title="Terms, Privacy & Refund Policy" description={`Last updated: ${lastUpdated}`} icon={FileText} maxWidth="4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />Back
      </Button>

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

      <div className="space-y-6">
        {/* Terms of Service */}
        <Card id="terms" className="shadow-card scroll-mt-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
              <p>By accessing or using TaxForge NG, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Service Description</h3>
              <p>TaxForge NG is a tax compliance and advisory platform for Nigerian businesses and individuals. All calculations are estimates for planning purposes only and should not be considered as final tax obligations.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. No Professional Advice</h3>
              <p>The Service does NOT provide professional tax, legal, or financial advice. You should consult qualified tax professionals, accountants, or legal advisors before making any tax-related decisions or filing tax returns.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Limitation of Liability</h3>
              <p>TaxForge NG shall NOT be liable for any direct, indirect, incidental, or consequential damages arising from:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Errors or inaccuracies in calculations</li>
                <li>Decisions made based on information from the Service</li>
                <li>Penalties or fines from tax authorities</li>
                <li>Loss of data or service interruptions</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. User Responsibilities</h3>
              <p>You agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Verify all calculations with qualified professionals before filing</li>
                <li>Comply with all applicable Nigerian tax laws and regulations</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">6. Account Termination</h3>
              <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the service.</p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card id="privacy" className="shadow-card scroll-mt-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. NDPR Compliance</h3>
              <p>TaxForge NG complies with the Nigeria Data Protection Regulation (NDPR) 2019 and is committed to protecting your personal data.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Data We Collect</h3>
              <p>We collect and process the following categories of data:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Account Information:</strong> Name, email address, phone number</li>
                <li><strong>Business Data:</strong> Company name, RC/BN numbers, sector information</li>
                <li><strong>Financial Data:</strong> Revenue, expenses, tax calculations</li>
                <li><strong>Usage Data:</strong> How you interact with our services</li>
                <li><strong>Device Information:</strong> Browser type, IP address, device identifiers</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Data Security</h3>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 mt-2">
                <Lock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">AES-256 Encryption</p>
                  <p className="text-sm">All sensitive data is encrypted using industry-standard AES-256 encryption at rest and in transit.</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Data Sharing</h3>
              <p>We do NOT sell your personal data to third parties. We may share data only:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Your Rights</h3>
              <p>Under NDPR, you have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
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
              <h3 className="font-semibold text-foreground mb-2">6. Data Retention</h3>
              <p>We retain your data for as long as your account is active or as needed to provide services. Financial and tax data may be retained for up to 7 years to comply with Nigerian tax record-keeping requirements.</p>
            </div>
          </CardContent>
        </Card>

        {/* Refund Policy */}
        <Card id="refund" className="shadow-card scroll-mt-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Free Trial</h3>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 mt-2">
                <RefreshCcw className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">7-Day Free Trial</p>
                  <p className="text-sm">All paid plans include a 7-day free trial. You can cancel anytime during the trial period without being charged.</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Subscription Cancellation</h3>
              <p>You may cancel your subscription at any time:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cancellation during trial: No charges applied</li>
                <li>Cancellation after trial: Access continues until the end of the current billing period</li>
                <li>No partial refunds for unused portions of the billing period</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Refund Eligibility</h3>
              <p>Refunds may be granted in the following circumstances:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Within 30 days:</strong> Pro-rated refunds for annual subscriptions if requested within 30 days of payment</li>
                <li><strong>Technical issues:</strong> If persistent technical issues prevent you from using the service</li>
                <li><strong>Duplicate charges:</strong> Full refund for any accidental duplicate charges</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Non-Refundable Items</h3>
              <p>The following are NOT eligible for refunds:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Subscriptions after 30 days of payment</li>
                <li>Monthly subscriptions (cancel to avoid future charges)</li>
                <li>Fees for add-on services already rendered</li>
                <li>Accounts terminated for Terms of Service violations</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. How to Request a Refund</h3>
              <p>To request a refund, contact our support team at <span className="font-medium text-foreground">support@taxforgeng.com</span> with:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your account email address</li>
                <li>Transaction reference or receipt</li>
                <li>Reason for the refund request</li>
              </ul>
              <p className="mt-2">Refunds are typically processed within 5-10 business days.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>For questions about these terms, our privacy practices, or refund requests, contact our team:</p>
            <div className="mt-3 p-3 rounded-lg bg-muted">
              <p className="font-medium text-foreground">TaxForge NG Legal & Privacy</p>
              <p>Email: legal@taxforgeng.com</p>
              <p>Support: support@taxforgeng.com</p>
              <p>Address: Lagos, Nigeria</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        By using TaxForge NG, you acknowledge that you have read and agree to these Terms of Service, Privacy Policy, and Refund Policy.
      </p>
    </PageLayout>
  );
};

export default Terms;
