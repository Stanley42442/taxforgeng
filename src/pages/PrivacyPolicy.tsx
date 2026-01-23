import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, CheckCircle2, Lock, Database, Eye, UserCheck, Globe, Bell, ExternalLink } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <PageLayout
      title="Privacy Policy"
      description="How we collect, use, and protect your personal data under NDPA 2023"
      icon={Shield}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Effective Date & NDPA Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Effective Date: January 1, 2025
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
            <Shield className="h-4 w-4" />
            NDPA 2023 Compliant
          </span>
        </div>

        {/* Introduction */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">1</span>
              Introduction & Data Controller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This Privacy Policy explains how TaxForge Nigeria Limited ("we", "us", "our") collects, uses, 
              shares, and protects your personal data when you use our services. We are committed to 
              protecting your privacy in accordance with the <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> 
              and regulations issued by the Nigeria Data Protection Commission (NDPC).
            </p>
            <div className="rounded-lg bg-card border p-4 space-y-2 text-sm">
              <p><strong>Data Controller:</strong></p>
              <p>TaxForge Nigeria Limited</p>
              <p>Email: <a href="mailto:privacy@taxforgeng.com" className="text-primary hover:underline">privacy@taxforgeng.com</a></p>
              <p><strong>Data Protection Officer (DPO):</strong></p>
              <p>Email: <a href="mailto:dpo@taxforgeng.com" className="text-primary hover:underline">dpo@taxforgeng.com</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Data We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Database className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">2</span>
              Data We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="font-semibold text-foreground mb-2">Account Information</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Full name</li>
                  <li>• Email address</li>
                  <li>• Phone number</li>
                  <li>• State of residence</li>
                </ul>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="font-semibold text-foreground mb-2">Tax & Financial Data</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Income and revenue figures</li>
                  <li>• Expense records</li>
                  <li>• Business information</li>
                  <li>• Tax identification numbers</li>
                </ul>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="font-semibold text-foreground mb-2">Payment Information</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Payment card details (via Paystack)</li>
                  <li>• Transaction history</li>
                  <li>• Billing address</li>
                </ul>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="font-semibold text-foreground mb-2">Usage & Device Data</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• IP address</li>
                  <li>• Browser type and version</li>
                  <li>• Device information</li>
                  <li>• Usage patterns and preferences</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Purposes & Lawful Basis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Eye className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">3</span>
              Purposes & Lawful Basis for Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Purpose</th>
                    <th className="text-left p-3 font-semibold">Lawful Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Providing tax calculation services</td>
                    <td className="p-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">Contract</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Processing payments</td>
                    <td className="p-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">Contract</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Account security & fraud prevention</td>
                    <td className="p-3"><span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Legitimate Interest</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Service improvements & analytics</td>
                    <td className="p-3"><span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">Legitimate Interest</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Marketing communications</td>
                    <td className="p-3"><span className="rounded-full bg-success/10 px-2 py-1 text-xs text-success">Consent</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">Legal compliance & tax record keeping</td>
                    <td className="p-3"><span className="rounded-full bg-warning/10 px-2 py-1 text-xs text-warning">Legal Obligation</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">4</span>
              Data Sharing & Third Parties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We may share your data with the following categories of recipients:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Payment Processors:</strong> Paystack (for payment processing)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Cloud Infrastructure:</strong> Secure cloud hosting providers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Email Services:</strong> For transactional and notification emails</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Legal Authorities:</strong> When required by law or court order</span>
              </li>
            </ul>
            <div className="rounded-lg border border-success/50 bg-success/5 p-4">
              <p className="text-sm font-medium text-success-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                We Never Sell Your Data
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                We do not sell, rent, or trade your personal data to third parties for marketing purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Lock className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">5</span>
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <Lock className="h-5 w-5 text-primary" />
                <span className="text-sm">AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">Role-Based Access Controls</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm">Regular Security Audits</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <Database className="h-5 w-5 text-primary" />
                <span className="text-sm">Secure Data Backups</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">6</span>
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Active accounts:</strong> Data retained for the duration of your account plus 7 years for tax records</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Payment records:</strong> 7 years as required by Nigerian tax law</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Usage logs:</strong> 2 years for security and analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>After retention period:</strong> Data is anonymized or securely deleted</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 7: Your Rights (NDPA) */}
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-success">
              <UserCheck className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-sm font-bold">7</span>
              Your Rights Under NDPA 2023
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Under the Nigeria Data Protection Act 2023, you have the following rights:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-3">
                <p className="font-semibold text-foreground text-sm">Right of Access</p>
                <p className="text-xs text-muted-foreground">Request a copy of your personal data</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="font-semibold text-foreground text-sm">Right to Rectification</p>
                <p className="text-xs text-muted-foreground">Correct inaccurate or incomplete data</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="font-semibold text-foreground text-sm">Right to Erasure</p>
                <p className="text-xs text-muted-foreground">Request deletion of your data</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="font-semibold text-foreground text-sm">Right to Restriction</p>
                <p className="text-xs text-muted-foreground">Limit how we process your data</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="font-semibold text-foreground text-sm">Right to Object</p>
                <p className="text-xs text-muted-foreground">Object to certain processing activities</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="font-semibold text-foreground text-sm">Right to Data Portability</p>
                <p className="text-xs text-muted-foreground">Receive your data in a portable format</p>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              To exercise any of these rights, contact our DPO at{" "}
              <a href="mailto:dpo@taxforgeng.com" className="text-primary hover:underline">dpo@taxforgeng.com</a>.
              We will respond within 30 days. If you are not satisfied with our response, you have the right 
              to lodge a complaint with the <strong>Nigeria Data Protection Commission (NDPC)</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Section 8: International Transfers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Globe className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">8</span>
              International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your data may be transferred to and processed in countries outside Nigeria where our 
              service providers operate. When this occurs, we ensure adequate safeguards are in place:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Standard Contractual Clauses (SCCs) with processors</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Verification that recipients have adequate data protection measures</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Compliance with NDPC guidelines on international transfers</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 9: Cookies & Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">9</span>
              Cookies & Tracking Technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We use cookies and similar technologies to improve your experience:
            </p>
            <div className="space-y-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-semibold text-foreground text-sm">Essential Cookies</p>
                <p className="text-xs text-muted-foreground">Required for the service to function (authentication, security)</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-semibold text-foreground text-sm">Preference Cookies</p>
                <p className="text-xs text-muted-foreground">Remember your settings and preferences</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-semibold text-foreground text-sm">Analytics Cookies</p>
                <p className="text-xs text-muted-foreground">Help us understand how you use our service (with consent)</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              You can manage cookie preferences in your browser settings. Disabling essential cookies 
              may affect service functionality.
            </p>
          </CardContent>
        </Card>

        {/* Section 10: Breach Notification */}
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-warning">
              <Bell className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-warning/10 text-sm font-bold">10</span>
              Data Breach Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              In the event of a personal data breach that poses a risk to your rights and freedoms:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span>We will notify the NDPC within <strong>72 hours</strong> of becoming aware</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span>If high risk to you, we will notify you directly without undue delay</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span>We will provide information about the breach and recommended protective measures</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 11: Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">11</span>
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our service is not intended for individuals under 18 years of age. We do not knowingly 
              collect personal data from children. If you believe a child has provided us with their 
              data, please contact us immediately at{" "}
              <a href="mailto:dpo@taxforgeng.com" className="text-primary hover:underline">dpo@taxforgeng.com</a>.
            </p>
          </CardContent>
        </Card>

        {/* Section 12: Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">12</span>
              Changes to This Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• We may update this Privacy Policy from time to time</li>
              <li>• Material changes will be communicated via email or in-app notification at least <strong>30 days</strong> before they take effect</li>
              <li>• The "Effective Date" at the top indicates when the policy was last updated</li>
              <li>• Continued use after changes constitutes acceptance of the updated policy</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 13: Contact & Complaints */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-accent">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-sm font-bold">13</span>
              Contact Us & Complaints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For any privacy-related questions or to exercise your rights:
            </p>
            <div className="rounded-lg bg-card border p-4 space-y-2 text-sm">
              <p><strong>Data Protection Officer</strong></p>
              <p>Email: <a href="mailto:dpo@taxforgeng.com" className="text-primary hover:underline">dpo@taxforgeng.com</a></p>
              <p><strong>General Privacy Inquiries</strong></p>
              <p>Email: <a href="mailto:privacy@taxforgeng.com" className="text-primary hover:underline">privacy@taxforgeng.com</a></p>
            </div>
            <Separator />
            <div className="rounded-lg border border-muted p-4">
              <p className="text-sm font-medium text-foreground mb-2">Supervisory Authority</p>
              <p className="text-sm text-muted-foreground">
                If you are not satisfied with our response to your privacy concerns, you have the right 
                to lodge a complaint with the <strong>Nigeria Data Protection Commission (NDPC)</strong>.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Website:{" "}
                <a 
                  href="https://ndpc.gov.ng" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  ndpc.gov.ng <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;
