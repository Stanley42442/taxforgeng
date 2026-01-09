import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, Lock, AlertTriangle, Scale, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();
  const lastUpdated = "December 20, 2025";

  return (
    <PageLayout title="Terms & Privacy" description={`Last updated: ${lastUpdated}`} icon={FileText} maxWidth="4xl">
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
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
              <p>By accessing or using TaxForge NG, you agree to be bound by these Terms of Service.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Service Description</h3>
              <p>TaxForge NG is a tax compliance and advisory platform for Nigerian businesses. All calculations are estimates for planning purposes only.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. No Professional Advice</h3>
              <p>The Service does NOT provide professional tax, legal, or financial advice. Consult qualified professionals before making tax-related decisions.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Limitation of Liability</h3>
              <p>TaxForge NG shall NOT be liable for any damages arising from errors in calculations, decisions based on the Service, or penalties from tax authorities.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. User Responsibilities</h3>
              <p>You agree to provide accurate information, maintain account security, and verify calculations with professionals before filing.</p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. NDPR Compliance</h3>
              <p>TaxForge NG complies with the Nigeria Data Protection Regulation (NDPR) 2019.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Data We Collect</h3>
              <p>Account information, business data, financial data, usage data, and device information.</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Data Security</h3>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20 mt-2">
                <Lock className="h-5 w-5 text-success shrink-0" />
                <div>
                  <p className="font-medium text-foreground">AES-256 Encryption</p>
                  <p className="text-sm">All sensitive data is encrypted using industry-standard AES-256 encryption.</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Your Rights</h3>
              <p>Under NDPR, you have the right to access, correct, delete your data, object to processing, and data portability.</p>
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
            <p>For questions about these terms or our privacy practices, contact our legal team.</p>
            <div className="mt-3 p-3 rounded-lg bg-muted">
              <p className="font-medium text-foreground">TaxForge NG Legal & Privacy</p>
              <p>Email: legal@taxforge.ng</p>
              <p>Address: Lagos, Nigeria</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        By using TaxForge NG, you acknowledge that you have read and agree to these Terms of Service and Privacy Policy.
      </p>
    </PageLayout>
  );
};

export default Terms;
