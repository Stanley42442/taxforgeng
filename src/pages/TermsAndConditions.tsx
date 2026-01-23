import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Scale, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <PageLayout
      title="Terms & Conditions"
      description="Please read these terms carefully before using TaxForge NG"
      icon={Scale}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Effective Date */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Effective Date: January 1, 2025
          </span>
        </div>

        {/* Important Notice */}
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Important Notice</p>
                <p className="text-sm text-muted-foreground">
                  By creating an account or using TaxForge NG, you confirm that you have read, understood, 
                  and agree to be bound by these Terms & Conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">1</span>
              Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>These Terms constitute a legally binding agreement between you and TaxForge Nigeria Limited.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>By accessing or using our services, you agree to these Terms, our Privacy Policy, and Refund Policy.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>If you do not agree to these Terms, you must not use our services.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2: Service Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">2</span>
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              TaxForge NG provides tax calculation tools and educational resources for Nigerian individuals and businesses.
            </p>
            <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
              <p className="text-sm font-medium text-warning-foreground mb-2">⚠️ Educational Use Only</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• All calculations are <strong>estimates for planning purposes only</strong></li>
                <li>• This is <strong>not professional tax, legal, or financial advice</strong></li>
                <li>• You are responsible for verifying all calculations with a qualified tax professional</li>
                <li>• We do not guarantee the accuracy of any calculations or recommendations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Account Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">3</span>
              Account Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You must be at least <strong>18 years old</strong> to create an account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You must provide accurate and complete information during registration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You are responsible for maintaining the security of your account credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You must notify us immediately of any unauthorized access to your account</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4: Subscriptions & Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">4</span>
              Subscriptions & Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Paid subscriptions are billed in advance on a monthly or annual basis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>All prices are in Nigerian Naira (₦) and include applicable taxes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Subscriptions auto-renew unless cancelled before the renewal date</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Payments are processed securely via Paystack</span>
              </li>
            </ul>
            <Separator />
            <p className="text-sm text-muted-foreground">
              For refund eligibility and procedures, please see our{" "}
              <Link to="/refund-policy" className="text-primary hover:underline inline-flex items-center gap-1">
                Refund Policy <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Section 5: User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">5</span>
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">You agree to:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use the service only for lawful purposes</li>
              <li>• Provide accurate financial and tax information</li>
              <li>• Verify all calculations before filing with FIRS or other authorities</li>
              <li>• Not attempt to reverse-engineer, copy, or redistribute our software</li>
              <li>• Not use automated tools to scrape or access our services</li>
              <li>• Maintain confidentiality of your account credentials</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 6: Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">6</span>
              Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>All content, software, and trademarks are owned by TaxForge Nigeria Limited</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You are granted a limited, non-exclusive license to use our services</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You may not copy, modify, or distribute our content without permission</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 7: Disclaimers & Limitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">7</span>
              Disclaimers & Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>THE SERVICE IS PROVIDED "AS IS"</strong> without warranties of any kind, either express or implied, 
                including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• We are not liable for any tax penalties, fines, or losses resulting from your use of our calculations</li>
              <li>• Our maximum liability is limited to the amount you paid for the service in the preceding 12 months</li>
              <li>• We do not guarantee uninterrupted or error-free service availability</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 8: Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">8</span>
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your privacy is important to us. Please review our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline inline-flex items-center gap-1">
                Privacy Policy <ExternalLink className="h-3 w-3" />
              </Link>{" "}
              to understand how we collect, use, and protect your personal data in compliance with the 
              Nigeria Data Protection Act 2023 (NDPA).
            </p>
          </CardContent>
        </Card>

        {/* Section 9: Termination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">9</span>
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You may cancel your account at any time from your account settings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>We may suspend or terminate accounts that violate these Terms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Upon termination, your right to use the service ceases immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>We may retain your data as required by law or for legitimate business purposes</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 10: Governing Law */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">10</span>
              Governing Law & Jurisdiction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>These Terms are governed by the <strong>laws of the Federal Republic of Nigeria</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Any disputes shall be subject to the exclusive jurisdiction of the courts in <strong>Lagos or Port Harcourt, Nigeria</strong></span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 11: Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">11</span>
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• We may update these Terms from time to time</li>
              <li>• Material changes will be notified via email or in-app notification at least <strong>30 days</strong> in advance</li>
              <li>• Continued use of the service after changes constitutes acceptance of the new Terms</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 12: Contact */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-accent">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-sm font-bold">12</span>
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="rounded-lg bg-card border p-4 space-y-2 text-sm">
              <p><strong>TaxForge Nigeria Limited</strong></p>
              <p>Email: <a href="mailto:legal@taxforgeng.com" className="text-primary hover:underline">legal@taxforgeng.com</a></p>
              <p>Website: <a href="https://taxforgeng.com" className="text-primary hover:underline">taxforgeng.com</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TermsAndConditions;
