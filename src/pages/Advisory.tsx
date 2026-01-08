import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Shield, 
  ShieldOff,
  Home,
  Briefcase,
  Building,
  Laptop,
  Package,
  Wallet,
  ArrowLeft,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { advisoryQuestions, getRecommendation, type AdvisoryAnswers } from "@/lib/advisoryLogic";
import { Link } from "react-router-dom";

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="h-5 w-5" />,
  user: <User className="h-5 w-5" />,
  "trending-up": <TrendingUp className="h-5 w-5" />,
  "trending-down": <TrendingDown className="h-5 w-5" />,
  minus: <Minus className="h-5 w-5" />,
  shield: <Shield className="h-5 w-5" />,
  "shield-off": <ShieldOff className="h-5 w-5" />,
  home: <Home className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
  building: <Building className="h-5 w-5" />,
  laptop: <Laptop className="h-5 w-5" />,
  package: <Package className="h-5 w-5" />,
  wallet: <Wallet className="h-5 w-5" />,
};

const Advisory = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AdvisoryAnswers>({
    hasPartners: null,
    expectedTurnover: null,
    needsAssetProtection: null,
    ownsHome: null,
    isProfessionalService: null,
    hasSignificantAssets: null,
    planToSeekInvestment: null,
  });
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = advisoryQuestions[currentStep];
  const progress = ((currentStep + 1) / advisoryQuestions.length) * 100;

  const handleAnswer = (value: boolean | string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(newAnswers);

    if (currentStep < advisoryQuestions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const recommendation = showResult ? getRecommendation(answers) : null;

  if (showResult && recommendation) {
    return (
      <PageLayout maxWidth="2xl" showBackground={true}>
        <div className="animate-slide-up">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              {recommendation.entityType === 'company' ? (
                <Building className="h-8 w-8 text-primary-foreground" />
              ) : (
                <Briefcase className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Our Recommendation
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
              {recommendation.suitabilityScore}% Match
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {recommendation.entityType === 'company' ? 'Limited Liability Company (LLC)' : 'Business Name / Sole Proprietorship'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {recommendation.entityType === 'company' 
                ? 'A separate legal entity that offers liability protection and is suitable for growth-oriented businesses.'
                : 'A simple business structure ideal for solo entrepreneurs with lower compliance requirements.'}
            </p>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Advantages
                </h3>
                <ul className="space-y-2">
                  {recommendation.prosKeys.map((proKey, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
                      {proKey.replace('advisory.pros.', '').replace(/([A-Z])/g, ' $1').trim()}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-warning mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Considerations
                </h3>
                <ul className="space-y-2">
                  {recommendation.consKeys.map((conKey, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning flex-shrink-0" />
                      {conKey.replace('advisory.cons.', '').replace(/([A-Z])/g, ' $1').trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl bg-secondary/50 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tax Authority</p>
                <p className="font-medium text-foreground text-sm">
                  {recommendation.entityType === 'company' ? 'FIRS (Federal)' : 'State IRS'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Registration Cost</p>
                <p className="font-medium text-foreground text-sm">
                  {recommendation.entityType === 'company' ? '₦50,000 - ₦150,000' : '₦10,000 - ₦25,000'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Annual Compliance</p>
                <p className="font-medium text-foreground text-sm">
                  {recommendation.entityType === 'company' ? '₦100,000+' : '₦20,000 - ₦50,000'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button 
              variant="hero" 
              size="lg" 
              className="flex-1"
              onClick={() => navigate('/calculator', { 
                state: { entityType: recommendation.entityType } 
              })}
            >
              Calculate Your Taxes
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setShowResult(false);
                setCurrentStep(0);
                setAnswers({
                  hasPartners: null,
                  expectedTurnover: null,
                  needsAssetProtection: null,
                  ownsHome: null,
                  isProfessionalService: null,
                  hasSignificantAssets: null,
                  planToSeekInvestment: null,
                });
              }}
            >
              Start Over
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="xl" showBackground={true}>
      <div className="mb-6 flex justify-end">
        <Link to="/calculator">
          <Button variant="ghost" size="sm">
            Skip to Calculator
          </Button>
        </Link>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentStep + 1} of {advisoryQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-8 shadow-card">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {currentQuestion.questionKey.replace('advisory.questions.', '').replace(/([A-Z])/g, ' $1').trim()}?
        </h2>
        <p className="text-muted-foreground mb-8">
          This helps us understand your business needs
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id as keyof AdvisoryAnswers] === option.value;
            return (
              <button
                key={String(option.value)}
                onClick={() => handleAnswer(option.value)}
                className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {iconMap[option.icon]}
                </div>
                <span className="font-medium text-foreground">
                  {option.labelKey.replace('advisory.options.', '').replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-1">
          {advisoryQuestions.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-primary/50' : 'bg-border'
              }`}
            />
          ))}
        </div>
        <div className="w-20" />
      </div>
    </PageLayout>
  );
};

export default Advisory;
