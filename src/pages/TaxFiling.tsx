import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  ArrowRight,
  Lock,
  Crown,
  Building2,
  Briefcase,
  ExternalLink,
  Mail,
  Info,
} from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { NavMenu } from "@/components/NavMenu";
import { toast } from "sonner";
import { useState } from "react";
import { jsPDF } from "jspdf";

const TaxFiling = () => {
  const navigate = useNavigate();
  const { tier, canAccessFiling, savedBusinesses } = useSubscription();
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleGenerateForm = (formType: string) => {
    if (!selectedBusiness) {
      toast.error("Please select a business first");
      return;
    }

    const business = savedBusinesses.find((b) => b.id === selectedBusiness);

    // Prototype-friendly download (mock pre-filled form)
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`TaxForge NG — ${formType}`, 20, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Business: ${business?.name ?? ""}`, 20, 38);
    doc.text(
      `Entity: ${business?.entityType === "company" ? "Limited Company" : "Business Name"}`,
      20,
      48
    );

    if (business?.rcBnNumber) {
      doc.text(`RC/BN: ${business.rcBnNumber}`, 20, 58);
    }

    if (business?.verificationStatus === "verified") {
      doc.setTextColor(22, 163, 74);
      doc.text("✓ Using verified CAC data for accuracy (prototype)", 20, 70);
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(10);
    doc.text(
      "NOTE: This is a prototype mock form for testing. Live TaxProMax/FIRS submission is not enabled.",
      20,
      86,
      { maxWidth: 170 }
    );

    const filename = `taxforge-ng-${formType.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    doc.save(filename);

    toast.success(`${formType} downloaded`, {
      description: "Prototype mock file generated for testing",
    });
  };

  const handleMockSubmit = () => {
    toast.success('Filing prepared successfully!', {
      description: 'In future, we\'ll submit directly to FIRS. A copy has been sent to your email.',
      duration: 5000
    });
  };

  // Gated content for lower tiers
  if (!canAccessFiling()) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Tax Filing Preparation
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Upgrade to Business or Corporate tier to access tax filing preparation tools, 
              including pre-filled FIRS forms and step-by-step filing guides.
            </p>
            
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-8">
              <Crown className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Business Tier Features</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Auto-generate pre-filled CIT, PIT, VAT forms</li>
                <li>✓ Step-by-step TaxProMax filing guide</li>
                <li>✓ Download forms matching FIRS templates</li>
                <li>✓ Email copies of all filings</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button variant="hero" size="lg">
                  <Crown className="h-4 w-4" />
                  Upgrade to Business
                </Button>
              </Link>
              <Link to="/calculator">
                <Button variant="outline" size="lg">
                  Back to Calculator
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Prepare & File Taxes
            </h1>
            <p className="text-muted-foreground">
              Generate pre-filled forms ready for FIRS TaxProMax submission
            </p>
          </div>

          {/* Advisory Banner */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-8 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Coming Soon: Direct Filing</p>
              <p className="text-sm text-muted-foreground">
                Automated direct filing to FIRS via partnerships is in development. Stay subscribed for early access!
              </p>
            </div>
          </div>

          {/* Business Selection */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6">
            <h2 className="font-semibold text-foreground mb-4">Select Business</h2>
            
            {savedBusinesses.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No saved businesses yet</p>
                <Link to="/calculator">
                  <Button variant="outline">
                    Go to Calculator to Save a Business
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {savedBusinesses.map(business => (
                  <button
                    key={business.id}
                    onClick={() => setSelectedBusiness(business.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedBusiness === business.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {business.entityType === 'company' 
                        ? <Building2 className="h-5 w-5 text-primary" />
                        : <Briefcase className="h-5 w-5 text-primary" />
                      }
                      <div>
                        <p className="font-medium text-foreground">{business.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {business.entityType === 'company' ? 'Limited Company' : 'Business Name'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Generation */}
          {selectedBusiness && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
              <h2 className="font-semibold text-foreground mb-4">Generate Tax Forms</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Forms are pre-filled based on your saved business data and calculations.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormCard
                  title="CIT Return"
                  description="Companies Income Tax return form"
                  icon={<FileText className="h-5 w-5" />}
                  onGenerate={() => handleGenerateForm('CIT Return')}
                />
                <FormCard
                  title="VAT Return"
                  description="Value Added Tax return form"
                  icon={<FileText className="h-5 w-5" />}
                  onGenerate={() => handleGenerateForm('VAT Return')}
                />
                <FormCard
                  title="PIT Return"
                  description="Personal Income Tax return form"
                  icon={<FileText className="h-5 w-5" />}
                  onGenerate={() => handleGenerateForm('PIT Return')}
                />
              </div>
            </div>
          )}

          {/* Filing Guide */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Filing Guide</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowGuide(!showGuide)}>
                {showGuide ? 'Hide' : 'Show'} Steps
              </Button>
            </div>

            {showGuide && (
              <div className="space-y-4 animate-slide-up">
                <StepCard
                  step={1}
                  title="Download Pre-filled Form"
                  description="Click 'Generate' above to download your form with data pre-filled from your calculations."
                />
                <StepCard
                  step={2}
                  title="Log into FIRS TaxProMax"
                  description="Visit taxpromax.firs.gov.ng and log in with your Tax Identification Number (TIN)."
                  link="https://taxpromax.firs.gov.ng"
                />
                <StepCard
                  step={3}
                  title="Upload/Submit Form"
                  description="Navigate to the relevant filing section and upload your pre-filled form or enter the data manually."
                />
                <StepCard
                  step={4}
                  title="Make Payment"
                  description="Complete any tax payments through the FIRS payment portal or your bank."
                />
              </div>
            )}
          </div>

          {/* Mock Submit */}
          {selectedBusiness && (
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center">
              <Upload className="h-10 w-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Ready to File?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click below to prepare your filing package. We'll email you a copy and guide.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" onClick={handleMockSubmit}>
                  <CheckCircle2 className="h-4 w-4" />
                  Prepare Filing Package
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://taxpromax.firs.gov.ng" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open FIRS TaxProMax
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const FormCard = ({
  title,
  description,
  icon,
  onGenerate
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onGenerate: () => void;
}) => (
  <div className="rounded-xl border border-border p-4 hover:border-primary/50 transition-colors">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Button variant="outline" size="sm" className="w-full" onClick={onGenerate}>
      <Download className="h-4 w-4" />
      Generate
    </Button>
  </div>
);

const StepCard = ({
  step,
  title,
  description,
  link
}: {
  step: number;
  title: string;
  description: string;
  link?: string;
}) => (
  <div className="flex gap-4">
    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
      {step}
    </div>
    <div>
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
      {link && (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
        >
          Visit site <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  </div>
);

export default TaxFiling;
