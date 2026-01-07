import { NavMenu } from "@/components/NavMenu";
import { SuccessStories } from "@/components/SuccessStories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Building2, TrendingUp, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SuccessStoriesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <NavMenu />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Real Results from
              <span className="block text-gradient bg-gradient-to-r from-primary via-success to-accent bg-clip-text">
                Real Nigerian Businesses
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover how businesses across Nigeria are transforming their tax compliance
              and saving money with TaxForge NG.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
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
        </section>

        {/* Testimonials */}
        <SuccessStories showTitle={false} autoPlay={false} />

        {/* CTA Section */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto glass-frosted rounded-3xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to Join Our Success Stories?
              </h2>
              <p className="text-muted-foreground mb-8">
                Start your free trial today and see why thousands of Nigerian businesses trust TaxForge NG.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/advisory">
                  <Button variant="hero" size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-dark py-8 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 TaxForge NG. For educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SuccessStoriesPage;
