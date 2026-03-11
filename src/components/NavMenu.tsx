import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TierSwitcher } from "@/components/TierSwitcher";
import { FeedbackForm } from "@/components/FeedbackForm";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useUpcomingReminders } from "@/hooks/useUpcomingReminders";
import { useSyncedNotifications } from "@/hooks/useSyncedNotifications";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Search,
  X,
  Scale,
  AlertTriangle,
  Handshake,
  Download,
  Share,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface NavLink {
  to: string;
  label: string;
  icon: LucideIcon;
  minTier?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  links: NavLink[];
  adminOnly?: boolean;
  showCondition?: 'always' | 'freeOnly' | 'paidOnly';
  badgeKey?: 'reminders' | 'notifications';
}

const navGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    links: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/advisory", label: "Get Advice", icon: Lightbulb },
    ]
  },
  {
    id: 'personal',
    label: 'Personal Tax',
    icon: User,
    links: [
      { to: "/individual-calculator", label: "Personal Tax Calculator", icon: Calculator },
      { to: "/personal-expenses", label: "Personal Transactions", icon: Wallet },
      { to: "/calculation-history", label: "Tax History", icon: History },
    ]
  },
  {
    id: 'business',
    label: 'Business Tax',
    icon: Building2,
    showCondition: 'paidOnly',
    links: [
      { to: "/calculator", label: "Business Calculator", icon: Calculator, minTier: 'starter' },
      { to: "/businesses", label: "My Businesses", icon: FolderOpen, minTier: 'starter' },
      { to: "/expenses", label: "Business Transactions", icon: Receipt, minTier: 'starter' },
      { to: "/invoices", label: "Invoices", icon: FileText, minTier: 'basic' },
      { to: "/payroll", label: "Payroll", icon: Users, minTier: 'basic' },
      { to: "/profit-loss", label: "P&L Statement", icon: PieChart, minTier: 'basic' },
    ]
  },
  {
    id: 'filing',
    label: 'Filing & Compliance',
    icon: Send,
    badgeKey: 'reminders',
    links: [
      { to: "/compliance", label: "Compliance", icon: Building2, minTier: 'professional' },
      { to: "/e-filing", label: "E-Filing", icon: Send, minTier: 'business' },
      { to: "/tax-filing", label: "Tax Filing", icon: FileText, minTier: 'business' },
      { to: "/tax-calendar", label: "Tax Calendar", icon: Calendar },
      { to: "/reminders", label: "Reminders", icon: Bell, minTier: 'starter' },
    ]
  },
  {
    id: 'reports',
    label: 'Reports & Insights',
    icon: BarChart3,
    links: [
      { to: "/business-report", label: "Reports", icon: BarChart3, minTier: 'basic' },
      { to: "/insights", label: "Insights", icon: BarChart3, minTier: 'business' },
      { to: "/scenarios", label: "Scenarios", icon: GitBranch, minTier: 'professional' },
      { to: "/transactions", label: "Transactions", icon: Upload, minTier: 'business' },
    ]
  },
  {
    id: 'team',
    label: 'Team & Tools',
    icon: Users,
    links: [
      { to: "/team", label: "Team", icon: Users, minTier: 'business' },
      { to: "/accountant-portal", label: "Accountant Portal", icon: Building2, minTier: 'business' },
      { to: "/audit-log", label: "Audit Log", icon: History, minTier: 'corporate' },
      { to: "/api-docs", label: "API Docs", icon: Code, minTier: 'corporate' },
    ]
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: GraduationCap,
    links: [
      { to: "/embed-partner", label: "Partner with Us", icon: Handshake },
      { to: "/blog", label: "Blog", icon: FileText },
      { to: "/faq", label: "FAQ", icon: GraduationCap },
      { to: "/about", label: "About", icon: Building2 },
      { to: "/resources", label: "Downloads & Templates", icon: FileText },
      { to: "/state-guides", label: "State Guides", icon: Map },
      { to: "/learn", label: "Learn", icon: GraduationCap },
      { to: "/tax-logic", label: "Tax Logic Reference", icon: FileText },
      { to: "/tax-calendar", label: "Tax Calendar", icon: Calendar },
      { to: "/documentation", label: "Documentation", icon: FileText },
      { to: "/pricing", label: "Pricing", icon: DollarSign },
      { to: "/roadmap", label: "Roadmap", icon: Map },
      { to: "/success-stories", label: "Success Stories", icon: Star },
      { to: "/tax-professionals", label: "Find a Tax Pro", icon: Users },
    ]
  },
  {
    id: 'account',
    label: 'Account',
    icon: Trophy,
    links: [
      { to: "/achievements", label: "Achievements", icon: Trophy, minTier: 'basic' },
      { to: "/referrals", label: "Referrals", icon: Gift },
      { to: "/rewards", label: "Loyalty Rewards", icon: Gift },
      { to: "/billing", label: "Billing History", icon: Receipt },
    ]
  },
  {
    id: 'legal',
    label: 'Legal & Policies',
    icon: Scale,
    links: [
      { to: "/terms#terms", label: "Terms & Conditions", icon: FileText },
      { to: "/terms#privacy", label: "Privacy Policy", icon: Shield },
      { to: "/terms#refund", label: "Refund Policy", icon: Receipt },
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    adminOnly: true,
    links: [
      { to: "/admin-analytics", label: "Admin Analytics", icon: Shield },
      { to: "/admin/promo-codes", label: "Promo Codes", icon: Gift },
      { to: "/admin/webhooks", label: "Webhook Testing", icon: Code },
      { to: "/ai-analytics", label: "AI Analytics", icon: BarChart3 },
      { to: "/admin/errors", label: "Error Dashboard", icon: AlertTriangle },
    ]
  },
];

export const NavMenu = () => {
  const { tier } = useSubscription();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { urgentCount } = useUpcomingReminders();
  const { unreadCount: notificationCount } = useSyncedNotifications();
  const { isConnected: isRealtimeConnected } = useRealtimeNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalNotificationCount = notificationCount + urgentCount;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isFreeTierOrGuest = !user || tier === 'free';
  const isPaidTier = user && tier !== 'free';

  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const userTierIndex = tierOrder.indexOf(tier);

  const isActive = (path: string) => location.pathname === path;

  const visibleGroups = useMemo(() => {
    return navGroups
      .filter(group => {
        if (group.adminOnly && !isAdmin) return false;
        if (group.showCondition === 'freeOnly' && !isFreeTierOrGuest) return false;
        if (group.showCondition === 'paidOnly' && !isPaidTier) return false;
        return true;
      })
      .map(group => ({
        ...group,
        links: group.links.filter(link => {
          const linkTierIndex = tierOrder.indexOf(link.minTier || 'free');
          if (linkTierIndex > userTierIndex) return false;
          if (searchQuery) {
            return link.label.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return true;
        })
      }))
      .filter(group => group.links.length > 0);
  }, [isAdmin, isFreeTierOrGuest, isPaidTier, userTierIndex, searchQuery]);

  const activeGroupId = useMemo(() => {
    for (const group of navGroups) {
      if (group.links.some(link => isActive(link.to))) {
        return group.id;
      }
    }
    return 'overview';
  }, [location.pathname]);

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === 'reminders') return urgentCount;
    if (badgeKey === 'notifications') return totalNotificationCount;
    return 0;
  };

  const quickLinks = useMemo(() => {
    const links: NavLink[] = [];
    for (const group of visibleGroups) {
      for (const link of group.links) {
        if (links.length < 5) links.push(link);
      }
    }
    return links;
  }, [visibleGroups]);

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        <nav className="flex h-14 sm:h-16 items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <Calculator className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base sm:text-lg font-bold text-foreground truncate">TaxForge NG</span>
          </Link>

          {/* Desktop Quick Links */}
          <div className="hidden xl:flex items-center gap-6">
            {quickLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(link.to) 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/embed-partner"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 transition-colors whitespace-nowrap"
            >
              <Handshake className="h-4 w-4" />
              Partner
            </Link>
            <div className="hidden sm:block">
              <FeedbackForm />
            </div>
            <div className="hidden lg:block">
              <TierSwitcher />
            </div>
            {tier !== 'free' && (
              <span className="hidden md:inline-flex text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium whitespace-nowrap">
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </span>
            )}
            <ThemeToggle />

            <Link 
              to="/notifications" 
              aria-label="Notifications"
              className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-md hover:bg-secondary transition-colors"
            >
              {totalNotificationCount > 0 ? (
                <BellRing className="h-4 w-4 text-foreground" />
              ) : (
                <Bell className="h-4 w-4 text-muted-foreground" />
              )}
              {totalNotificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center pointer-events-none"
                >
                  {totalNotificationCount > 9 ? '9+' : totalNotificationCount}
                </Badge>
              )}
            </Link>
            
            {/* Hamburger Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] h-full flex flex-col p-0">
                <div className="flex flex-col h-full min-h-0">
                  {/* Header */}
                  <div className="px-4 pt-4 pb-3 shrink-0 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
                          <Calculator className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-foreground truncate">TaxForge NG</span>
                      </Link>
                    </div>

                    {/* Tier Badge */}
                    {tier !== 'free' && (
                      <div className="mb-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-sm font-medium text-primary flex items-center gap-2">
                          <Crown className="h-4 w-4 shrink-0" />
                          <span className="truncate">{tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</span>
                        </p>
                      </div>
                    )}

                    {/* Tier Switcher */}
                    <div className="mb-3">
                      <TierSwitcher />
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                      {searchQuery && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Navigation Accordion */}
                  <div className="flex-1 overflow-y-auto px-2 py-2">
                    <Accordion 
                      type="multiple" 
                      defaultValue={[activeGroupId]}
                      className="w-full"
                    >
                      {visibleGroups.map((group) => {
                        const badgeCount = getBadgeCount(group.badgeKey);
                        const GroupIcon = group.icon;
                        
                        return (
                          <AccordionItem 
                            key={group.id} 
                            value={group.id}
                            className="border-b-0"
                          >
                            <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-secondary rounded-lg [&[data-state=open]]:bg-secondary/50">
                              <div className="flex items-center gap-2">
                                <GroupIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{group.label}</span>
                                {badgeCount > 0 && (
                                  <Badge variant="destructive" className="h-5 px-1.5 text-xs ml-auto mr-2">
                                    {badgeCount}
                                  </Badge>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-1 pt-0">
                              <div className="flex flex-col gap-0.5 pl-4">
                                {group.links.map((link) => {
                                  const LinkIcon = link.icon;
                                  return (
                                    <SheetClose asChild key={link.to}>
                                      <Link
                                        to={link.to}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                                          isActive(link.to)
                                            ? 'bg-primary/5 text-primary font-medium'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                      >
                                        <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{link.label}</span>
                                      </Link>
                                    </SheetClose>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-border space-y-2 shrink-0 bg-background">
                    {user ? (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
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
                          <Button className="w-full h-9 text-sm">
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
