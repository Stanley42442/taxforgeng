import { PageLayout } from "@/components/PageLayout";
import { SuccessStories } from "@/components/SuccessStories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Building2, TrendingUp, Shield, Star } from "lucide-react";

const SuccessStoriesPage = () => {
  return (
    <PageLayout title="Success Stories" description="Real results from real Nigerian businesses" icon={Star} maxWidth="6xl">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="glass-frosted text-center">
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">5,000+</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card className="glass-frosted text-center">
          <CardContent className="p-6">
            <Building2 className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">₦500M+</p>
            <p className="text-sm text-muted-foreground">Tax Calculated</p>
          </CardContent>
        </Card>
        <Card className="glass-frosted text-center">
          <CardContent className="p-6">
            <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">85%</p>
            <p className="text-sm text-muted-foreground">Time Saved</p>
          </CardContent>
        </Card>
        <Card className="glass-frosted text-center">
          <CardContent className="p-6">
            <Shield className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">100%</p>
            <p className="text-sm text-muted-foreground">FIRS Compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials */}
      <SuccessStories showTitle={false} autoPlay={false} />

      {/* CTA Section */}
      <div className="mt-16">
        <div className="max-w-2xl mx-auto glass-frosted rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Join Our Success Stories?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start your free trial today and see why thousands of Nigerian businesses trust TaxForge NG.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/advisory">
              <Button variant="hero" size="lg" className="gap-2">
                Get Started Free<ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg">View Pricing</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SuccessStoriesPage;
