import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Building2, 
  Briefcase,
  Trash2,
  Plus,
  Crown,
  ArrowRight,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/taxCalculations";

const SavedBusinesses = () => {
  const navigate = useNavigate();
  const { 
    tier, 
    savedBusinesses, 
    removeBusiness, 
    canSaveBusiness, 
    getBusinessLimit,
    businessCount 
  } = useSubscription();

  const limit = getBusinessLimit();
  const limitText = limit === 'unlimited' ? 'Unlimited' : `${businessCount}/${limit}`;

  const handleDelete = (id: string, name: string) => {
    removeBusiness(id);
    toast.success(`Removed "${name}" from saved businesses`);
  };

  // Free tier - no access
  if (tier === 'free') {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Saved Businesses
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Upgrade to Basic or higher to save businesses and access your calculation history.
            </p>
            
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-8">
              <Crown className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Basic Tier Benefits</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Save up to 2 business profiles</li>
                <li>✓ Persistent data storage</li>
                <li>✓ PDF/CSV export</li>
                <li>✓ Email reminders</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button variant="hero" size="lg">
                  <Crown className="h-4 w-4" />
                  Upgrade Now
                </Button>
              </Link>
              <Link to="/calculator">
                <Button variant="outline" size="lg">
                  Use Calculator
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Saved Businesses
              </h1>
              <p className="text-muted-foreground">
                Manage your saved business profiles and calculations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                {limitText} businesses
              </span>
              <Link to="/calculator">
                <Button variant="hero" disabled={!canSaveBusiness()}>
                  <Plus className="h-4 w-4" />
                  Add Business
                </Button>
              </Link>
            </div>
          </div>

          {/* Upgrade Nudge */}
          {!canSaveBusiness() && (
            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-warning" />
                <p className="text-sm text-foreground">
                  You've reached your business limit. Upgrade for more!
                </p>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="sm">
                  Upgrade
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Empty State */}
          {savedBusinesses.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Saved Businesses</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Save your first business from the tax calculator to track calculations and access filing tools.
              </p>
              <Link to="/calculator">
                <Button variant="hero">
                  <Calculator className="h-4 w-4" />
                  Go to Calculator
                </Button>
              </Link>
            </div>
          ) : (
            /* Business Cards Grid */
            <div className="grid gap-4 sm:grid-cols-2">
              {savedBusinesses.map((business) => (
                <div 
                  key={business.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        business.entityType === 'company' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-accent/10 text-accent'
                      }`}>
                        {business.entityType === 'company' 
                          ? <Building2 className="h-5 w-5" />
                          : <Briefcase className="h-5 w-5" />
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{business.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {business.entityType === 'company' ? 'Limited Company' : 'Business Name'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(business.id, business.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Annual Turnover
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(business.turnover)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Added
                      </span>
                      <span className="text-foreground">
                        {new Date(business.createdAt).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate('/calculator', { 
                        state: { entityType: business.entityType } 
                      })}
                    >
                      <Calculator className="h-4 w-4" />
                      Calculate
                    </Button>
                    {(tier === 'business' || tier === 'corporate') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/tax-filing')}
                      >
                        File Taxes
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          {savedBusinesses.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <StatCard 
                label="Total Businesses"
                value={savedBusinesses.length.toString()}
                icon={<Building2 className="h-5 w-5" />}
              />
              <StatCard 
                label="Companies"
                value={savedBusinesses.filter(b => b.entityType === 'company').length.toString()}
                icon={<Building2 className="h-5 w-5" />}
              />
              <StatCard 
                label="Business Names"
                value={savedBusinesses.filter(b => b.entityType === 'business_name').length.toString()}
                icon={<Briefcase className="h-5 w-5" />}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Header = () => {
  const { tier } = useSubscription();
  
  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
            <Calculator className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">NaijaTaxPro</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/calculator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Calculator
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {tier !== 'free' && (
            <span className="hidden sm:inline text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          )}
          <ThemeToggle />
          <Link to="/pricing">
            <Button variant="outline" size="sm">
              {tier === 'free' ? 'Upgrade' : 'Plans'}
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

const StatCard = ({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

export default SavedBusinesses;
