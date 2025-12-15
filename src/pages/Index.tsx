import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  FileText, 
  Shield, 
  TrendingUp, 
  Building2, 
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">NaijaTaxPro</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/advisory" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Get Advice
            </Link>
            <Link to="/calculator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tax Calculator
            </Link>
          </div>
          <Link to="/advisory">
            <Button variant="outline" size="sm">
              Start Free
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-20 pt-12 md:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Updated for Nigeria Tax Act 2025
            </div>
            
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Smart Tax Advice for
              <span className="block text-gradient">Nigerian Businesses</span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Get personalized business structure recommendations and accurate tax calculations. 
              Built for small businesses and individuals navigating Nigeria's tax landscape.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/advisory">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Get Tax Advice
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/calculator">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Calculator className="h-5 w-5" />
                  Tax Calculator
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>FIRS Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>Pre-2026 & 2026 Rules</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>Free to Use</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need for Tax Compliance
            </h2>
            <p className="text-muted-foreground">
              From business structure advice to detailed tax calculations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={<Building2 className="h-6 w-6" />}
              title="Business Structure Advice"
              description="Get recommendations on whether to register as a Business Name or Limited Liability Company based on your needs."
            />
            <FeatureCard 
              icon={<Calculator className="h-6 w-6" />}
              title="Tax Calculator"
              description="Calculate CIT, PIT, VAT, and development levies with support for both pre-2026 and 2026+ rules."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />}
              title="Liability Protection"
              description="Understand how different business structures affect your personal asset protection."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-6 w-6" />}
              title="Small Company Benefits"
              description="Check if you qualify for 0% CIT rate under the new small company rules."
            />
            <FeatureCard 
              icon={<FileText className="h-6 w-6" />}
              title="Export Reports"
              description="Download your tax calculations as PDF or CSV for record keeping and filing."
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Educational Tips"
              description="Learn about Nigerian tax law with helpful tooltips referencing CAMA and Tax Act 2025."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Optimize Your Taxes?
          </h2>
          <p className="mx-auto mb-8 max-w-xl opacity-90">
            Join thousands of Nigerian businesses making smarter tax decisions. 
            Start with our free advisory tool.
          </p>
          <Link to="/advisory">
            <Button variant="accent" size="xl">
              Start Your Free Assessment
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Calculator className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">NaijaTaxPro</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 NaijaTaxPro. For educational purposes. Consult a tax professional for official advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
      {icon}
    </div>
    <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
