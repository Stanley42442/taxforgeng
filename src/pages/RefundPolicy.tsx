import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle2, XCircle, Clock, Mail, AlertTriangle } from "lucide-react";

const RefundPolicy = () => {
  return (
    <PageLayout
      title="Refund Policy"
      description="Our commitment to fair and transparent refund practices"
      icon={CreditCard}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Effective Date */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Effective Date: January 1, 2025
          </span>
        </div>

        {/* Summary Card */}
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-2">Quick Summary</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ <strong>7-day free trial</strong> – cancel anytime, no charge</li>
                  <li>✓ <strong>30-day</strong> pro-rated refunds for annual subscriptions</li>
                  <li>✓ <strong>Monthly subscriptions</strong> can be cancelled anytime (no refund for current period)</li>
                  <li>✗ <strong>No refunds</strong> after 30 days of subscription</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Free Trial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Clock className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">1</span>
              7-Day Free Trial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>All paid plans include a <strong>7-day free trial</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>No payment is required to start your trial</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>Cancel anytime during the trial period with <strong>no charge</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>After the trial, you will be billed automatically unless you cancel</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2: Annual Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">2</span>
              Annual Subscription Refunds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-success/50 bg-success/5 p-4">
              <p className="font-semibold text-success-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                30-Day Pro-Rated Refund Period
              </p>
              <p className="text-sm text-muted-foreground">
                If you cancel within 30 days of your annual subscription payment, you are eligible 
                for a <strong>pro-rated refund</strong> for the unused portion of your subscription.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground mb-2">Example Calculation:</p>
              <p className="text-sm text-muted-foreground">
                If you paid ₦49,990 for a Professional annual plan and cancel after 15 days, 
                you would receive approximately ₦47,940 back (₦49,990 × 350/365 days remaining).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Monthly Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">3</span>
              Monthly Subscription Cancellations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You may cancel your monthly subscription at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Your access continues until the end of your current billing period</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span><strong>No refunds</strong> are provided for partial months</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You will not be charged for subsequent billing periods after cancellation</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4: Non-Refundable Items */}
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-warning">
              <AlertTriangle className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-warning/10 text-sm font-bold">4</span>
              Non-Refundable Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              The following are <strong>not eligible for refunds</strong>:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>Subscriptions after 30 days from the payment date</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>Partial month usage on monthly plans</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>Accounts terminated for Terms of Service violations</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>One-time add-on purchases (if applicable)</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>Promotional or discounted subscriptions (unless otherwise stated)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 5: How to Request a Refund */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Mail className="h-5 w-5" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">5</span>
              How to Request a Refund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To request a refund, please follow these steps:
            </p>
            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
              <li>Email us at <a href="mailto:billing@taxforgeng.com" className="text-primary hover:underline">billing@taxforgeng.com</a></li>
              <li>Include your account email address and subscription details</li>
              <li>Provide a brief reason for your refund request</li>
              <li>We will review and respond within <strong>5 business days</strong></li>
            </ol>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground mb-2">Refund Processing Time</p>
              <p className="text-sm text-muted-foreground">
                Approved refunds are processed within <strong>7-14 business days</strong>. 
                The time for the refund to appear in your account depends on your payment method and bank.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Disputes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">6</span>
              Disputes & Chargebacks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We encourage you to contact us directly before initiating a dispute with your bank or 
              payment provider. We are committed to resolving issues fairly and promptly. Chargebacks 
              filed without first contacting us may result in account suspension pending investigation.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-accent">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-sm font-bold">7</span>
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              If you have questions about this Refund Policy or need assistance:
            </p>
            <div className="rounded-lg bg-card border p-4 space-y-2 text-sm">
              <p><strong>Billing Support</strong></p>
              <p>Email: <a href="mailto:billing@taxforgeng.com" className="text-primary hover:underline">billing@taxforgeng.com</a></p>
              <p><strong>General Support</strong></p>
              <p>Email: <a href="mailto:support@taxforgeng.com" className="text-primary hover:underline">support@taxforgeng.com</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Related Policies */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Also see our{" "}
            <Link to="/terms-and-conditions" className="text-primary hover:underline">Terms & Conditions</Link>
            {" "}and{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default RefundPolicy;
