import { Link } from "react-router-dom";
import { 
  Calculator, 
  Building2, 
  Home, 
  Users, 
  FileText,
  Percent,
  Receipt,
  MapPin,
  BarChart3,
  ArrowRight,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const FreeTaxToolsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  const tools = [
    { to: "/free-tax-calculator", icon: Calculator, title: "Free Tax Calculator", description: "Instant PIT, CIT, VAT calculations" },
    { to: "/small-company-exemption", icon: Building2, title: "Small Company Exemption", description: "Check if you qualify for 0% CIT" },
    { to: "/rent-relief-2026", icon: Home, title: "Rent Relief Calculator", description: "Claim up to ₦500,000 deduction" },
    { to: "/pit-paye-calculator", icon: Users, title: "PIT/PAYE Calculator", description: "Calculate salary tax instantly" },
    { to: "/tax-reforms-2026", icon: FileText, title: "2026 Tax Reforms Guide", description: "Everything new in Nigerian tax" },
    { to: "/cit-calculator", icon: Building2, title: "CIT Calculator", description: "Company income tax rates" },
    { to: "/vat-calculator", icon: Percent, title: "VAT Calculator", description: "7.5% VAT made simple" },
    { to: "/wht-calculator", icon: Receipt, title: "WHT Calculator", description: "Withholding tax rates guide" },
    { to: "/tax-reports", icon: BarChart3, title: "Tax Reports", description: "Professional PDF exports" },
    { to: "/port-harcourt-tax-guide", icon: MapPin, title: "Port Harcourt Tax Guide", description: "Local Rivers State tax info" },
    { to: "/blog", icon: BookOpen, title: "Blog", description: "Tax guides and expert articles" },
    { to: "/faq", icon: HelpCircle, title: "FAQ", description: "30+ answered tax questions" },
  ];

  return (
    <section ref={ref} className="py-20 md:py-28 relative z-10 border-t border-border">
      <div className="container mx-auto px-4">
        <div 
          className={`text-center mb-12 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Free Tax Tools
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Access our free calculators and guides — no signup required
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {tools.map((tool, index) => (
            <Link
              key={tool.to}
              to={tool.to}
              className={`group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-primary/20 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: isVisible ? `${index * 40}ms` : '0ms' }}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <tool.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
