import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TierSwitcher } from "@/components/TierSwitcher";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calculator, 
  Crown, 
  FolderOpen, 
  Menu, 
  FileText,
  DollarSign,
  Lightbulb,
  Bell,
  BarChart3,
  Users,
  Upload,
  History,
  GraduationCap,
  Receipt,
  GitBranch,
  Send,
  Code,
  Trophy,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  PieChart,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export const NavMenu = () => {
  const { tier } = useSubscription();
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, minTier: 'free' },
    { to: "/advisory", label: "Get Advice", icon: Lightbulb, minTier: 'free' },
    { to: "/calculator", label: "Calculator", icon: Calculator, minTier: 'free' },
    { to: "/learn", label: "Learn", icon: GraduationCap, minTier: 'free' },
    { to: "/pricing", label: "Pricing", icon: DollarSign, minTier: 'free' },
    { to: "/businesses", label: "My Businesses", icon: FolderOpen, minTier: 'free' },
    { to: "/achievements", label: "Achievements", icon: Trophy, minTier: 'basic' },
    { to: "/reminders", label: "Reminders", icon: Bell, minTier: 'basic' },
    { to: "/expenses", label: "Expenses", icon: Receipt, minTier: 'basic' },
    { to: "/scenarios", label: "Scenarios", icon: GitBranch, minTier: 'business' },
    { to: "/business-report", label: "Reports", icon: PieChart, minTier: 'basic' },
    { to: "/insights", label: "Insights", icon: BarChart3, minTier: 'business' },
    { to: "/transactions", label: "Transactions", icon: Upload, minTier: 'business' },
    { to: "/e-filing", label: "E-Filing", icon: Send, minTier: 'business' },
    { to: "/tax-filing", label: "Tax Filing", icon: FileText, minTier: 'business' },
    { to: "/team", label: "Team", icon: Users, minTier: 'business' },
    { to: "/api-docs", label: "API Docs", icon: Code, minTier: 'corporate' },
    { to: "/audit-log", label: "Audit Log", icon: History, minTier: 'corporate' },
  ];

  const tierOrder = ['free', 'basic', 'business', 'corporate'];
  const userTierIndex = tierOrder.indexOf(tier);
  
  const filteredLinks = navLinks.filter(link => {
    const linkTierIndex = tierOrder.indexOf(link.minTier);
    return linkTierIndex <= userTierIndex;
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaxForge NG</span>
          </Link>

          {/* Desktop Navigation - now shows at lg breakpoint */}
          <div className="hidden lg:flex items-center gap-6">
            {filteredLinks.slice(0, 6).map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-sm font-medium transition-colors ${
                  isActive(link.to) 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions - now shows at lg breakpoint */}
          <div className="hidden lg:flex items-center gap-3">
            <TierSwitcher />
            {tier !== 'free' && (
              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium">
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </span>
            )}
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile & Tablet Menu - now shows below lg breakpoint */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                        <Calculator className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="font-bold text-foreground">TaxForge NG</span>
                    </Link>
                  </div>

                  {/* Tier Badge */}
                  {tier !== 'free' && (
                    <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm font-medium text-success flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                      </p>
                    </div>
                  )}

                  {/* Tier Switcher for testing */}
                  <div className="mb-4">
                    <TierSwitcher />
                  </div>

                  {/* Mobile Nav Links */}
                  <nav className="flex flex-col gap-1 overflow-y-auto">
                    {filteredLinks.map((link) => (
                      <SheetClose asChild key={link.to}>
                        <Link
                          to={link.to}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive(link.to)
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          <link.icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  {/* Mobile CTA */}
                  <div className="mt-auto pt-6 border-t border-border space-y-3">
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <Link to="/auth" className="block">
                          <Button variant="hero" className="w-full">
                            <LogIn className="h-4 w-4" />
                            Sign In
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};
