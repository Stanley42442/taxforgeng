import { useState, useEffect } from "react";
import { SEOHead, createHowToSchema, createBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  Trophy,
  Star,
  Zap,
  Award,
  Target,
  Sparkles,
} from "lucide-react";
import { advisoryQuestions, getRecommendation, type AdvisoryAnswers } from "@/lib/advisoryLogic";
import { Link } from "react-router-dom";
import { useAchievements } from "@/hooks/useAchievements";
import { motion, AnimatePresence } from "framer-motion";

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

// Milestone definitions
const milestones = [
  { step: 1, badge: "First Step", icon: Star, points: 10, color: "text-yellow-500" },
  { step: 3, badge: "Halfway There", icon: Zap, points: 25, color: "text-blue-500" },
  { step: 5, badge: "Almost Done", icon: Target, points: 35, color: "text-purple-500" },
  { step: 7, badge: "Advisory Master", icon: Trophy, points: 50, color: "text-amber-500" },
];

const Advisory = () => {
  const navigate = useNavigate();
  const { awardBadge, hasBadge } = useAchievements();
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
  const [earnedMilestones, setEarnedMilestones] = useState<string[]>([]);
  const [showMilestonePopup, setShowMilestonePopup] = useState<typeof milestones[0] | null>(null);

  const currentQuestion = advisoryQuestions[currentStep];
  const progress = ((currentStep + 1) / advisoryQuestions.length) * 100;

  // Check and award milestones
  useEffect(() => {
    const completedStep = currentStep + 1;
    const milestone = milestones.find(m => m.step === completedStep);
    
    if (milestone && !earnedMilestones.includes(milestone.badge)) {
      setEarnedMilestones(prev => [...prev, milestone.badge]);
      setShowMilestonePopup(milestone);
      
      // Award badge in database
      const badgeId = `advisory_${milestone.badge.toLowerCase().replace(/\s+/g, '_')}`;
      if (!hasBadge(badgeId)) {
        awardBadge(badgeId, milestone.badge, milestone.points);
      }
      
      // Auto-hide popup after 3 seconds
      setTimeout(() => setShowMilestonePopup(null), 3000);
    }
  }, [currentStep, earnedMilestones, awardBadge, hasBadge]);

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
          {/* Completion Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 px-4 py-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-amber-600 dark:text-amber-400">Advisory Complete!</span>
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">
                +{milestones.reduce((sum, m) => sum + m.points, 0)} pts
              </Badge>
            </div>
          </motion.div>

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

          <div className="rounded-2xl border border-border glass-frosted p-8 shadow-card mb-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {recommendation.title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {recommendation.summary}
            </p>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div>
                <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Advantages
                </h3>
                <ul className="space-y-2">
                  {recommendation.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
                      {pro}
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
                  {recommendation.cons.map((con, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl bg-secondary/50 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tax Authority</p>
                <p className="font-medium text-foreground text-sm">
                  {recommendation.taxAuthority}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Registration Cost</p>
                <p className="font-medium text-foreground text-sm">
                  {recommendation.estimatedCosts.registration}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Annual Compliance</p>
                <p className="font-medium text-foreground text-sm">
                  {recommendation.estimatedCosts.annual}
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
                setEarnedMilestones([]);
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

  const advisorySchema = [
    createHowToSchema(
      'How to Choose Your Business Structure in Nigeria',
      'Answer 7 questions to get a personalised recommendation on Business Name vs Limited Company.',
      [
        { name: 'Answer partner question', text: 'Tell us if you have business partners.' },
        { name: 'Estimate your turnover', text: 'Select your expected annual revenue range.' },
        { name: 'Review asset protection needs', text: 'Indicate if you need personal asset protection.' },
        { name: 'Complete all questions', text: 'Answer remaining questions about your business situation.' },
        { name: 'Get recommendation', text: 'Receive a tailored recommendation with tax authority details and cost estimates.' },
      ]
    ),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://taxforgeng.com/' },
      { name: 'Business Advisory', url: 'https://taxforgeng.com/advisory' },
    ]),
  ];

  return (
    <>
    <SEOHead
      title="Free Nigerian Business Structure Advisory Tool | TaxForge NG"
      description="Should you register a Business Name or Limited Company in Nigeria? Answer 7 questions for a personalised recommendation with tax implications and costs."
      canonicalPath="/advisory"
      keywords="business structure Nigeria, Business Name vs LLC, CAC registration advisory, Nigerian business tax advice"
      schema={{ '@context': 'https://schema.org', '@graph': advisorySchema }}
    />
    <PageLayout maxWidth="xl" showBackground={true}>
      {/* Milestone Popup */}
      <AnimatePresence>
        {showMilestonePopup && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-primary/90 to-primary px-6 py-3 shadow-lg">
              <div className={`${showMilestonePopup.color}`}>
                <showMilestonePopup.icon className="h-6 w-6" />
              </div>
              <div className="text-primary-foreground">
                <p className="font-semibold text-sm">{showMilestonePopup.badge}</p>
                <p className="text-xs opacity-90">+{showMilestonePopup.points} points earned!</p>
              </div>
              <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex justify-between items-center">
        {/* Earned Badges Display */}
        <div className="flex items-center gap-2 flex-wrap">
          {milestones.map((milestone) => {
            const isEarned = earnedMilestones.includes(milestone.badge);
            const MilestoneIcon = milestone.icon;
            return (
              <div
                key={milestone.badge}
                className={`flex items-center justify-center h-8 w-8 rounded-full transition-all ${
                  isEarned 
                    ? `bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/50 ${milestone.color}` 
                    : 'bg-muted/50 border border-border text-muted-foreground/40'
                }`}
                title={isEarned ? `${milestone.badge} (+${milestone.points} pts)` : `Complete step ${milestone.step} to unlock`}
              >
                <MilestoneIcon className="h-4 w-4" />
              </div>
            );
          })}
        </div>
        <Link to="/calculator">
          <Button variant="ghost" size="sm">
            Skip to Calculator
          </Button>
        </Link>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-2">
            Question {currentStep + 1} of {advisoryQuestions.length}
            {/* Next milestone indicator */}
            {(() => {
              const nextMilestone = milestones.find(m => m.step > currentStep + 1);
              if (nextMilestone) {
                return (
                  <span className="text-xs text-muted-foreground/60">
                    • Next badge in {nextMilestone.step - (currentStep + 1)} steps
                  </span>
                );
              }
              return null;
            })()}
          </span>
          <span className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="rounded-2xl border border-border glass-frosted p-8 shadow-card"
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {currentQuestion.question}
        </h2>
        <p className="text-muted-foreground mb-8">
          {currentQuestion.description}
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id as keyof AdvisoryAnswers] === option.value;
            return (
              <button
                key={String(option.value)}
                onClick={() => handleAnswer(option.value)}
                className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-300 btn-press ${
                  isSelected
                    ? 'border-primary bg-primary/10 glow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50 glass-frosted'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {iconMap[option.icon]}
                </div>
                <span className="font-medium text-foreground">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

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
          {advisoryQuestions.map((_, i) => {
            const isMilestone = milestones.some(m => m.step === i + 1);
            return (
              <div
                key={i}
                className={`h-2 rounded-full transition-colors ${
                  isMilestone ? 'w-3' : 'w-2'
                } ${
                  i === currentStep 
                    ? 'bg-primary' 
                    : i < currentStep 
                      ? isMilestone ? 'bg-amber-500' : 'bg-primary/50' 
                      : 'bg-border'
                }`}
              />
            );
          })}
        </div>
        <div className="w-20" />
      </div>
    </PageLayout>
    </>
  );
};

export default Advisory;