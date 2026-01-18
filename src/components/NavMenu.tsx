import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TierSwitcher } from "@/components/TierSwitcher";
import { FeedbackForm } from "@/components/FeedbackForm";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useUpcomingReminders } from "@/hooks/useUpcomingReminders";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Badge } from "@/components/ui/badge";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { 
  Calculator, 
  Crown, 
  FolderOpen, 
  Menu, 
  FileText,
  DollarSign,
  Lightbulb,
  Bell,
  BellRing,
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
  Map,
  Shield,
  Gift,
  Calendar,
  Star,
  Building2,
  Wallet,
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
  const { isAdmin } = useAdminCheck();
  const { urgentCount } = useUpcomingReminders();
  const { unreadCount: notificationCount } = useNotificationCount();
  const { isConnected: isRealtimeConnected, newNotificationCount } = useRealtimeNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Combined notification count
  const totalNotificationCount = notificationCount + newNotificationCount;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Determine if user should see personal vs business calculator
  const isFreeTierOrGuest = !user || tier === 'free' || tier === 'starter';
  const isPaidTier = user && tier !== 'free' && tier !== 'starter';

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/advisory", label: "Get Advice", icon: Lightbulb, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    // Personal Tax: only for guests or free tier
    { to: "/individual-calculator", label: "Personal Tax", icon: User, minTier: 'free', adminOnly: false, showCondition: 'freeOnly' as const },
    { to: "/personal-expenses", label: "Personal Expenses", icon: Wallet, minTier: 'free', adminOnly: false, showCondition: 'freeOnly' as const },
    { to: "/calculation-history", label: "Tax History", icon: History, minTier: 'free', adminOnly: false, showCondition: 'freeOnly' as const },
    // Business Tax: only for basic tier and above
    { to: "/calculator", label: "Calculator", icon: Calculator, minTier: 'basic', adminOnly: false, showCondition: 'paidOnly' as const },
    { to: "/learn", label: "Learn", icon: GraduationCap, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/pricing", label: "Pricing", icon: DollarSign, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/businesses", label: "My Businesses", icon: FolderOpen, minTier: 'starter', adminOnly: false, showCondition: 'always' as const },
    { to: "/achievements", label: "Achievements", icon: Trophy, minTier: 'basic', adminOnly: false, showCondition: 'always' as const },
    { to: "/reminders", label: "Reminders", icon: Bell, minTier: 'starter', adminOnly: false, showCondition: 'always' as const },
    
    // Business Management Features
    { to: "/expenses", label: "Expenses", icon: Receipt, minTier: 'starter', adminOnly: false, showCondition: 'always' as const },
    { to: "/invoices", label: "Invoices", icon: FileText, minTier: 'basic', adminOnly: false, showCondition: 'always' as const },
    { to: "/payroll", label: "Payroll", icon: Users, minTier: 'professional', adminOnly: false, showCondition: 'always' as const },
    { to: "/profit-loss", label: "P&L Statement", icon: PieChart, minTier: 'basic', adminOnly: false, showCondition: 'always' as const },
    { to: "/compliance", label: "Compliance", icon: Building2, minTier: 'professional', adminOnly: false, showCondition: 'always' as const },
    
    { to: "/scenarios", label: "Scenarios", icon: GitBranch, minTier: 'professional', adminOnly: false, showCondition: 'always' as const },
    { to: "/business-report", label: "Reports", icon: BarChart3, minTier: 'basic', adminOnly: false, showCondition: 'always' as const },
    { to: "/insights", label: "Insights", icon: BarChart3, minTier: 'business', adminOnly: false, showCondition: 'always' as const },
    { to: "/transactions", label: "Transactions", icon: Upload, minTier: 'business', adminOnly: false, showCondition: 'always' as const },
    { to: "/e-filing", label: "E-Filing", icon: Send, minTier: 'business', adminOnly: false, showCondition: 'always' as const },
    { to: "/tax-filing", label: "Tax Filing", icon: FileText, minTier: 'business', adminOnly: false, showCondition: 'always' as const },
    { to: "/team", label: "Team", icon: Users, minTier: 'business', adminOnly: false, showCondition: 'always' as const },
    { to: "/api-docs", label: "API Docs", icon: Code, minTier: 'corporate', adminOnly: false, showCondition: 'always' as const },
    { to: "/audit-log", label: "Audit Log", icon: History, minTier: 'corporate', adminOnly: false, showCondition: 'always' as const },
    
    { to: "/accountant-portal", label: "Accountant Portal", icon: Building2, minTier: 'business', adminOnly: false, showCondition: 'always' as const },
    { to: "/tax-calendar", label: "Tax Calendar", icon: Calendar, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/referrals", label: "Referrals", icon: Gift, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/success-stories", label: "Success Stories", icon: Star, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/roadmap", label: "Roadmap", icon: Map, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/documentation", label: "Documentation", icon: FileText, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/rewards", label: "Loyalty Rewards", icon: Gift, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    { to: "/billing", label: "Billing History", icon: Receipt, minTier: 'free', adminOnly: false, showCondition: 'always' as const },
    // Admin-only links
    { to: "/admin-analytics", label: "Admin Analytics", icon: Shield, minTier: 'free', adminOnly: true, showCondition: 'always' as const },
    { to: "/admin/promo-codes", label: "Promo Codes", icon: Gift, minTier: 'free', adminOnly: true, showCondition: 'always' as const },
    { to: "/admin/webhooks", label: "Webhook Testing", icon: Code, minTier: 'free', adminOnly: true, showCondition: 'always' as const },
    { to: "/ai-analytics", label: "AI Analytics", icon: BarChart3, minTier: 'free', adminOnly: true, showCondition: 'always' as const },
  ];

  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const userTierIndex = tierOrder.indexOf(tier);
  
  const filteredLinks = navLinks.filter(link => {
    const linkTierIndex = tierOrder.indexOf(link.minTier);
    const tierMatch = linkTierIndex <= userTierIndex;
    const adminMatch = link.adminOnly ? isAdmin : true;
    
    // Check show condition for calculator visibility
    let showConditionMatch = true;
    if (link.showCondition === 'freeOnly') {
      showConditionMatch = isFreeTierOrGuest;
    } else if (link.showCondition === 'paidOnly') {
      showConditionMatch = isPaidTier;
    }
    
    return tierMatch && adminMatch && showConditionMatch;
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4">
        <nav className="flex h-14 sm:h-16 items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-primary shrink-0">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-base sm:text-xl font-bold text-foreground truncate">TaxForge NG</span>
          </Link>

          {/* Desktop Quick Links - shows on xl screens only */}
          <div className="hidden xl:flex items-center gap-4 2xl:gap-6">
            {filteredLinks.slice(0, 5).map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(link.to) 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions - always visible */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:block">
              <FeedbackForm />
            </div>
            <div className="hidden lg:block">
              <TierSwitcher />
            </div>
            {tier !== 'free' && (
              <span className="hidden md:inline-flex text-[10px] sm:text-xs bg-success/20 text-success px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium whitespace-nowrap">
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </span>
            )}
            <ThemeToggle />

            {/* Realtime Indicator */}
            {user && isRealtimeConnected && (
              <LiveIndicator isLive={true} label="" className="hidden sm:flex" />
            )}

            {/* Notification Badge - links to notifications page */}
            <Link 
              to="/notifications" 
              className="relative flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {totalNotificationCount > 0 ? (
                <BellRing className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              ) : (
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              )}
              {totalNotificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center animate-pulse pointer-events-none"
                >
                  {totalNotificationCount > 9 ? '9+' : totalNotificationCount}
                </Badge>
              )}
            </Link>
            
            {/* Hamburger Menu - always visible */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] h-full flex flex-col">
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shrink-0">
                        <Calculator className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="font-bold text-foreground truncate">TaxForge NG</span>
                    </Link>
                  </div>

                  {/* Tier Badge */}
                  {tier !== 'free' && (
                    <div className="mb-3 p-2.5 rounded-lg bg-success/10 border border-success/20 shrink-0">
                      <p className="text-sm font-medium text-success flex items-center gap-2">
                        <Crown className="h-4 w-4 shrink-0" />
                        <span className="truncate">{tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</span>
                      </p>
                    </div>
                  )}

                  {/* Tier Switcher for testing */}
                  <div className="mb-3 shrink-0">
                    <TierSwitcher />
                  </div>

                  {/* Nav Links - Vertical scrollable list */}
                  <nav className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0 pr-1">
                    {filteredLinks.map((link) => (
                      <SheetClose asChild key={link.to}>
                        <Link
                          to={link.to}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                            isActive(link.to)
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          <link.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{link.label}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  {/* Mobile CTA */}
                  <div className="mt-auto pt-4 border-t border-border space-y-2 shrink-0">
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                        <SheetClose asChild>
                          <Link to="/settings" className="block">
                            <Button variant="ghost" className="w-full h-9 text-sm justify-start">
                              <User className="h-4 w-4 shrink-0" />
                              <span className="truncate">Account Settings</span>
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full h-9 text-sm" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span className="truncate">Sign Out</span>
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <Link to="/auth" className="block">
                          <Button variant="hero" className="w-full h-9 text-sm">
                            <LogIn className="h-4 w-4 shrink-0" />
                            <span className="truncate">Sign In</span>
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