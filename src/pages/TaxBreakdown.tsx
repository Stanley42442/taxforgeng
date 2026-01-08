import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/NavMenu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Calculator, Info, CheckCircle2, BookOpen } from "lucide-react";
import { formatCurrency, type TaxResult, type TaxInputs } from "@/lib/taxCalculations";
import { Link } from "react-router-dom";

const TaxBreakdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as TaxResult | undefined;
  const inputs = location.state?.inputs as TaxInputs | undefined;

  if (!result || !inputs) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">No Results Found</h1>
            <p className="text-muted-foreground mb-6">Please use the calculator first to see your tax breakdown.</p>
            <Link to="/calculator">
              <Button variant="hero">Go to Calculator</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate step-by-step breakdown in simple English
  const generateSteps = () => {
    const steps = [];
    let stepNumber = 1;

    // Step 1: Gross Income
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

    // Step 2: Deduct Expenses
    if (inputs.expenses > 0) {
      steps.push({
        title: `Step ${stepNumber}: Subtract Business Expenses`,
        content: `You reported ${formatCurrency(inputs.expenses)} in business expenses.

Taxable Income = ${formatCurrency(result.grossIncome)} - ${formatCurrency(inputs.expenses)} = ${formatCurrency(result.grossIncome - inputs.expenses)}`,
        explanation: "Legitimate business costs reduce the income you pay tax on."
      });
      stepNumber++;
    }

    // Step 3: Apply Reliefs (for Business Name with 2026 rules)
    if (inputs.entityType === 'business_name' && inputs.use2026Rules && inputs.rentPaid > 0) {
      const rentRelief = Math.min(inputs.rentPaid * 0.20, 500000);
      steps.push({
        title: `Step ${stepNumber}: Apply Rent Relief (2026 Rules)`,
        content: `Under 2026 tax rules, you get relief for rent paid:
• Rent Paid: ${formatCurrency(inputs.rentPaid)}
• Relief = min(20% of rent, ₦500,000)
• Your Relief = ${formatCurrency(rentRelief)}

This reduces your taxable income further.`,
        explanation: "The government allows you to deduct part of your rent to reduce your tax burden."
      });
      stepNumber++;
    }

    // Step 4: Income Tax Calculation
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
        const citRate = inputs.use2026Rules ? 0.25 : 0.30;
        steps.push({
          title: `Step ${stepNumber}: Company Income Tax (CIT)`,
          content: `Calculating CIT on your taxable profit:
• Taxable Profit: ${formatCurrency(result.taxableIncome)}
• CIT Rate: ${inputs.use2026Rules ? '25%' : '30%'} (${inputs.use2026Rules ? '2026 rules' : 'Pre-2026 rules'})

CIT = ${formatCurrency(result.taxableIncome)} × ${citRate * 100}% = ${formatCurrency(result.incomeTax)}`,
          explanation: inputs.use2026Rules 
            ? "Under 2026 rules, CIT is 25% (reduced from 30%)."
            : "Current CIT rate is 30% of taxable profits."
        });
      }
      stepNumber++;

      // Development/Education Levy
      if (result.developmentLevy > 0) {
        steps.push({
          title: `Step ${stepNumber}: ${inputs.use2026Rules ? 'Development' : 'Education'} Levy`,
          content: `Additional levy on profits:
• Rate: ${inputs.use2026Rules ? '4%' : '2%'}
• Levy = ${formatCurrency(result.taxableIncome)} × ${inputs.use2026Rules ? '4%' : '2%'} = ${formatCurrency(result.developmentLevy)}`,
          explanation: inputs.use2026Rules 
            ? "The Development Levy funds infrastructure projects."
            : "Education Levy supports the Tertiary Education Trust Fund."
        });
        stepNumber++;
      }
    } else {
      // Personal Income Tax
      steps.push({
        title: `Step ${stepNumber}: Personal Income Tax (PIT)`,
        content: `PIT is calculated in bands (like a ladder):
${inputs.use2026Rules ? `
• First ₦800,000: 0% (Exempt)
• ₦800k - ₦3m: 15%
• ₦3m - ₦10m: 19%
• ₦10m - ₦50m: 21%
• Above ₦50m: 25%` : `
• First ₦300,000: 7%
• ₦300k - ₦600k: 11%
• ₦600k - ₦1.1m: 15%
• ₦1.1m - ₦1.6m: 19%
• ₦1.6m - ₦3.2m: 21%
• Above ₦3.2m: 24%`}

PIT Payable = ${formatCurrency(result.incomeTax)}`,
        explanation: "You pay higher rates only on income above each threshold, not your entire income."
      });
      stepNumber++;
    }

    // VAT
    if (inputs.vatableSales > 0 || inputs.vatablePurchases > 0) {
      const outputVat = inputs.vatableSales * 0.075;
      const inputVat = inputs.vatablePurchases * 0.075;
      steps.push({
        title: `Step ${stepNumber}: Value Added Tax (VAT)`,
        content: `VAT is 7.5% on vatable transactions:
• Output VAT (on sales): ${formatCurrency(inputs.vatableSales)} × 7.5% = ${formatCurrency(outputVat)}
• Input VAT (on purchases): ${formatCurrency(inputs.vatablePurchases)} × 7.5% = ${formatCurrency(inputVat)}

Net VAT Payable = ${formatCurrency(outputVat)} - ${formatCurrency(inputVat)} = ${formatCurrency(result.vatPayable)}`,
        explanation: "You pay the difference between VAT collected and VAT paid."
      });
      stepNumber++;
    }

    // WHT Credits
    if (result.whtCredits > 0) {
      steps.push({
        title: `Step ${stepNumber}: Withholding Tax (WHT) Credits`,
        content: `Some tax was already deducted at source:
• Rental Income WHT (10%): ${formatCurrency(inputs.rentalIncome * 0.10)}
• Consultancy Income WHT (10%): ${formatCurrency(inputs.consultancyIncome * 0.10)}

Total WHT Credits = ${formatCurrency(result.whtCredits)} (Reduces your final tax)`,
        explanation: "WHT is tax already paid on your behalf by the payer. It's credited against your total tax."
      });
      stepNumber++;
    }

    // Capital Gains Tax
    if (inputs.capitalGains > 0) {
      steps.push({
        title: `Step ${stepNumber}: Capital Gains Tax (CGT)`,
        content: `Tax on profits from selling assets:
• Capital Gains: ${formatCurrency(inputs.capitalGains)}
• CGT Rate: 10%

CGT Payable = ${formatCurrency(inputs.capitalGains * 0.10)}`,
        explanation: "CGT applies when you sell property, shares, or other capital assets at a profit."
      });
      stepNumber++;
    }

    // Final Summary
    steps.push({
      title: `Step ${stepNumber}: Final Tax Summary`,
      content: `Adding it all together:
• Income Tax: ${formatCurrency(result.incomeTax)}
• ${inputs.entityType === 'company' ? 'Development Levy' : ''}: ${inputs.entityType === 'company' ? formatCurrency(result.developmentLevy) : ''}
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
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="mx-auto max-w-3xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/results', { state: { result, inputs } })}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>

          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Step-by-Step Tax Breakdown
            </h1>
            <p className="text-muted-foreground">
              Understanding how we calculated your {formatCurrency(result.totalTaxPayable)} tax
            </p>
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
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
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
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
                <Link 
                  to="/learn" 
                  className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Understanding Nigerian Tax Rates
                </Link>
                <Link 
                  to="/learn" 
                  className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  2026 Tax Reform Explained
                </Link>
                <Link 
                  to="/learn" 
                  className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  VAT Registration & Filing Guide
                </Link>
                <Link 
                  to="/learn" 
                  className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Maximizing Tax Reliefs
                </Link>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            This breakdown is for educational purposes. Please consult a tax professional for specific advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default TaxBreakdown;