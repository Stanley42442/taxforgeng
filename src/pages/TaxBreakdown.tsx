import { useLocation, useNavigate } from "react-router-dom";
import { SEOHead, createBreadcrumbSchema } from "@/components/seo/SEOHead";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Info, CheckCircle2, BookOpen } from "lucide-react";
import { formatCurrency, type TaxResult, type TaxInputs } from "@/lib/taxCalculations";
import { Link } from "react-router-dom";

const TaxBreakdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as TaxResult | undefined;
  const inputs = location.state?.inputs as TaxInputs | undefined;

  if (!result || !inputs) {
    return (
      <PageLayout title="Tax Breakdown" icon={BookOpen} maxWidth="2xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-foreground mb-4">No Results Found</h2>
          <p className="text-muted-foreground mb-6">Please use the calculator first to see your tax breakdown.</p>
          <Link to="/calculator">
            <Button variant="hero">Go to Calculator</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const generateSteps = () => {
    const steps = [];
    let stepNumber = 1;

    steps.push({
      title: `Step ${stepNumber}: Calculate Your Gross Income`,
      content: `We add up all your income sources:
• Business Turnover: ${formatCurrency(inputs.turnover)}
• Rental Income: ${formatCurrency(inputs.rentalIncome)}
• Consultancy Income: ${formatCurrency(inputs.consultancyIncome)}
• Dividend Income: ${formatCurrency(inputs.dividendIncome)} (Tax-exempt from Nigerian companies)
• Capital Gains: ${formatCurrency(inputs.capitalGains)}
• Foreign Income: ${formatCurrency(inputs.foreignIncome)}

Total Gross Income = ${formatCurrency(result.grossIncome)}`,
      explanation: "This is the total money you made before any deductions."
    });
    stepNumber++;

    if (inputs.expenses > 0) {
      steps.push({
        title: `Step ${stepNumber}: Subtract Business Expenses`,
        content: `You reported ${formatCurrency(inputs.expenses)} in business expenses.

Taxable Income = ${formatCurrency(result.grossIncome)} - ${formatCurrency(inputs.expenses)} = ${formatCurrency(result.grossIncome - inputs.expenses)}`,
        explanation: "Legitimate business costs reduce the income you pay tax on."
      });
      stepNumber++;
    }

    if (inputs.entityType === 'company') {
      if (result.isSmallCompany) {
        steps.push({
          title: `Step ${stepNumber}: Company Income Tax (CIT) - Small Company`,
          content: `Great news! Your company qualifies as a "Small Company":
• Turnover: ${formatCurrency(inputs.turnover)} (≤ ₦50m ✓)
• Fixed Assets: ${formatCurrency(inputs.fixedAssets)} (≤ ₦250m ✓)

CIT Rate = 0% (Exempt under 2026 rules)
CIT Payable = ₦0`,
          explanation: "Small companies are exempt from CIT to support business growth."
        });
      } else {
      const citRate = 0.30;
      steps.push({
        title: `Step ${stepNumber}: Company Income Tax (CIT)`,
        content: `Calculating CIT on your taxable profit:
• Taxable Profit: ${formatCurrency(result.taxableIncome)}
• CIT Rate: 30%

CIT = ${formatCurrency(result.taxableIncome)} × 30% = ${formatCurrency(result.incomeTax)}`,
          explanation: inputs.use2026Rules ? "Under 2026 rules, CIT is 30% for large companies. Small companies (turnover up to ₦50M, assets up to ₦250M) pay 0%." : "Current CIT rate is 30%."
        });
      }
      stepNumber++;
    } else {
      steps.push({
        title: `Step ${stepNumber}: Personal Income Tax (PIT)`,
        content: `PIT is calculated in bands:
${inputs.use2026Rules ? `
• First ₦800,000: 0% (Exempt)
• ₦800k - ₦3m: 15%
• ₦3m - ₦12m: 18%
• ₦12m - ₦25m: 21%
• ₦25m - ₦50m: 23%
• Above ₦50m: 25%` : `
• First ₦300,000: 7%
• ₦300k - ₦600k: 11%
• ₦600k - ₦1.1m: 15%
• ₦1.1m - ₦1.6m: 19%
• ₦1.6m - ₦3.2m: 21%
• Above ₦3.2m: 24%`}

PIT Payable = ${formatCurrency(result.incomeTax)}`,
        explanation: "You pay higher rates only on income above each threshold."
      });
      stepNumber++;
    }

    steps.push({
      title: `Step ${stepNumber}: Final Tax Summary`,
      content: `Adding it all together:
• Income Tax: ${formatCurrency(result.incomeTax)}
• VAT Payable: ${formatCurrency(result.vatPayable)}
• Less: WHT Credits: -${formatCurrency(result.whtCredits)}

Total Tax Payable = ${formatCurrency(result.totalTaxPayable)}
Effective Tax Rate = ${result.effectiveRate.toFixed(2)}%`,
      explanation: "Your effective rate shows what percentage of your total income goes to taxes."
    });

    return steps;
  };

  const steps = generateSteps();

  return (
    <>
    <SEOHead
      title="Step-by-Step Nigerian Tax Breakdown & Analysis | TaxForge"
      description="Understand exactly how your Nigerian tax is calculated. Step-by-step breakdown of CIT, PIT, VAT, and WHT with educational explanations for each component."
      canonicalPath="/tax-breakdown"
      keywords="tax breakdown Nigeria, how Nigerian tax calculated, CIT breakdown, PIT calculation steps"
      schema={createBreadcrumbSchema([
        { name: 'Home', url: 'https://taxforgeng.com/' },
        { name: 'Calculator', url: 'https://taxforgeng.com/calculator' },
        { name: 'Tax Breakdown', url: 'https://taxforgeng.com/tax-breakdown' },
      ])}
    />
    <PageLayout title="Step-by-Step Tax Breakdown" description={`Understanding your ${formatCurrency(result.totalTaxPayable)} tax`} icon={BookOpen} maxWidth="2xl">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/results', { state: { result, inputs } })}>
        <ArrowLeft className="h-4 w-4" />
        Back to Results
      </Button>

      {/* Summary Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Gross Income</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(result.grossIncome)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Tax</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(result.totalTaxPayable)}</p>
          </div>
        </div>
      </div>

      {/* Steps Accordion */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <Accordion type="single" collapsible className="space-y-3">
          {steps.map((step, index) => (
            <AccordionItem 
              key={index} 
              value={`step-${index}`}
              className="border border-border rounded-xl px-4 overflow-hidden"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-foreground">{step.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="pl-11 space-y-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground bg-secondary/50 rounded-lg p-4 font-sans">
                    {step.content}
                  </pre>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-info/10 border border-info/20 rounded-lg p-3">
                    <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
                    <p>{step.explanation}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Educational Links */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Learn More
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link to="/learn" className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Understanding Nigerian Tax Rates
            </Link>
            <Link to="/learn" className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              2026 Tax Reform Explained
            </Link>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        This breakdown is for educational purposes. Please consult a tax professional for specific advice.
      </p>
    </PageLayout>
    </>
  );
};

export default TaxBreakdown;
