import { Link } from "react-router-dom";
import { 
  Calculator, 
  Building2, 
  Home, 
  Users, 
  FileText,
  ArrowRight 
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * Free Tax Tools Section
 * Links to SEO landing pages from homepage for internal PageRank flow
 * Improves SEO juice distribution and user discoverability
 */
export const FreeTaxToolsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  const tools = [
    {
      to: "/free-tax-calculator",
      icon: Calculator,
      title: "Free Tax Calculator",
      description: "Instant PIT, CIT, VAT calculations",
      gradient: "from-primary to-primary/70",
    },
    {
      to: "/small-company-exemption",
      icon: Building2,
      title: "Small Company Exemption",
      description: "Check if you qualify for 0% CIT",
      gradient: "from-success to-success/70",
    },
    {
      to: "/rent-relief-2026",
      icon: Home,
      title: "Rent Relief Calculator",
      description: "Claim up to ₦500,000 deduction",
      gradient: "from-accent to-accent/70",
    },
    {
      to: "/pit-paye-calculator",
      icon: Users,
      title: "PIT/PAYE Calculator",
      description: "Calculate salary tax instantly",
      gradient: "from-info to-info/70",
    },
    {
      to: "/tax-reforms-2026",
      icon: FileText,
      title: "2026 Tax Reforms Guide",
      description: "Everything new in Nigerian tax",
      gradient: "from-warning to-warning/70",
    },
  ];

  return (
    <section ref={ref} className="py-12 md:py-16 relative z-10">
      <div className="container mx-auto px-4">
        <div 
          className={`text-center mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Free Tax Tools
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Access our free calculators and guides — no signup required
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
          {tools.map((tool, index) => (
            <Link
              key={tool.to}
              to={tool.to}
              className={`group relative rounded-xl glass-frosted p-5 transition-all duration-500 hover-lift hover-glow-primary ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
            >
              <div 
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${tool.gradient} text-white shadow-lg transition-transform group-hover:scale-110`}
              >
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {tool.description}
              </p>
              <span className="inline-flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Try Now <ArrowRight className="h-3 w-3 ml-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
