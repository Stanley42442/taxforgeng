import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAchievements } from "@/hooks/useAchievements";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Calculator,
  FileText,
  Bell,
  Users,
  CheckCircle2,
  Lock,
  Flame,
  Receipt,
  Loader2,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  category: 'starter' | 'calculation' | 'filing' | 'streak' | 'social';
}

const Achievements = () => {
  const { tier } = useSubscription();
  const { stats, earnedBadges, loading } = useAchievements();
  const navigate = useNavigate();
  const isBasicPlus = tier !== 'free';

  const getLevel = (points: number) => {
    if (points >= 1000) return { level: 5, title: 'Tax Master', nextLevel: null };
    if (points >= 500) return { level: 4, title: 'Tax Expert', nextLevel: 1000 };
    if (points >= 200) return { level: 3, title: 'Tax Pro', nextLevel: 500 };
    if (points >= 50) return { level: 2, title: 'Compliance Starter', nextLevel: 200 };
    return { level: 1, title: 'Beginner', nextLevel: 50 };
  };

  const hasBadge = (badgeId: string) => earnedBadges.some(b => b.badgeId === badgeId);
  
  const calculateEarnedPoints = () => {
    let points = 0;
    if (stats.calculationsCount >= 1) points += 10;
    if (stats.businessesSaved >= 1) points += 50;
    if (stats.expensesCount >= 1) points += 15;
    if (stats.calculationsCount >= 5) points += 25;
    if (stats.calculationsCount >= 10) points += 50;
    if (stats.remindersSet >= 1) points += 20;
    if (stats.businessesSaved >= 3) points += 75;
    if (stats.expensesCount >= 10) points += 30;
    if (stats.streak >= 7) points += 100;
    if (hasBadge('mock_filing')) points += 100;
    if (hasBadge('invite_team')) points += 50;
    if (hasBadge('perfect_year')) points += 500;
    return points;
  };
  
  const actualPoints = Math.max(stats.totalPoints, calculateEarnedPoints());
  const currentLevel = getLevel(actualPoints);

  const achievements: Achievement[] = [
    { id: 'first_calc', title: 'First Calculation', description: 'Complete your first tax calculation', icon: Calculator, points: 10, unlocked: stats.calculationsCount >= 1 || hasBadge('first_calc'), category: 'starter' },
    { id: 'save_business', title: 'Business Owner', description: 'Save your first business', icon: FileText, points: 50, unlocked: stats.businessesSaved >= 1 || hasBadge('save_business'), category: 'starter' },
    { id: 'expense_tracker', title: 'Expense Tracker', description: 'Add your first expense entry', icon: Receipt, points: 15, unlocked: stats.expensesCount >= 1 || hasBadge('expense_tracker'), category: 'starter' },
    { id: 'five_calcs', title: 'Number Cruncher', description: 'Complete 5 tax calculations', icon: Zap, points: 25, unlocked: stats.calculationsCount >= 5 || hasBadge('five_calcs'), progress: Math.min(stats.calculationsCount, 5), maxProgress: 5, category: 'calculation' },
    { id: 'ten_calcs', title: 'Tax Calculator Pro', description: 'Complete 10 tax calculations', icon: Trophy, points: 50, unlocked: stats.calculationsCount >= 10 || hasBadge('ten_calcs'), progress: Math.min(stats.calculationsCount, 10), maxProgress: 10, category: 'calculation' },
    { id: 'set_reminder', title: 'Reminder Set', description: 'Set up a tax deadline reminder', icon: Bell, points: 20, unlocked: stats.remindersSet >= 1 || hasBadge('set_reminder'), category: 'starter' },
    { id: 'three_businesses', title: 'Portfolio Manager', description: 'Save 3 businesses', icon: Target, points: 75, unlocked: stats.businessesSaved >= 3 || hasBadge('three_businesses'), progress: Math.min(stats.businessesSaved, 3), maxProgress: 3, category: 'filing' },
    { id: 'ten_expenses', title: 'Finance Tracker', description: 'Track 10 income/expense entries', icon: Receipt, points: 30, unlocked: stats.expensesCount >= 10 || hasBadge('ten_expenses'), progress: Math.min(stats.expensesCount, 10), maxProgress: 10, category: 'filing' },
    { id: 'week_streak', title: 'Weekly Warrior', description: 'Maintain a 7-day login streak', icon: Flame, points: 100, unlocked: stats.streak >= 7 || hasBadge('week_streak'), progress: Math.min(stats.streak, 7), maxProgress: 7, category: 'streak' },
    { id: 'mock_filing', title: 'E-Filer', description: 'Complete a mock e-filing', icon: FileText, points: 100, unlocked: hasBadge('mock_filing'), category: 'filing' },
    { id: 'invite_team', title: 'Team Player', description: 'Invite a team member', icon: Users, points: 50, unlocked: hasBadge('invite_team'), category: 'social' },
    { id: 'perfect_year', title: 'Perfect Compliance Year', description: 'File all returns on time for a year', icon: Award, points: 500, unlocked: hasBadge('perfect_year'), category: 'filing' },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const earnedPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  if (!isBasicPlus) {
    return (
      <PageLayout title="Achievements & Badges" description="Track your tax compliance journey" icon={Trophy}>
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-accent glow-accent">
            <Crown className="h-12 w-12 text-accent-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Available on Basic+ plans</h2>
          <p className="text-muted-foreground mb-8">
            Track your tax compliance journey and earn badges.
          </p>
          <Button variant="glow" size="lg" onClick={() => navigate('/pricing')}>
            <Crown className="h-5 w-5" />
            Upgrade to Basic+
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Achievements & Badges" icon={Trophy}>
        <div className="flex justify-center py-20">
          <div className="glass-frosted p-8 rounded-3xl inline-block text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading achievements...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Achievements & Badges" description="Track your tax compliance journey" icon={Trophy}>
      {/* Level Card */}
      <div className="neumorphic p-6 sm:p-8 mb-8 animate-slide-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-primary glow-primary flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-primary-foreground">{currentLevel.level}</span>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse-soft" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{currentLevel.title}</h2>
              <p className="text-muted-foreground">{actualPoints} Total Points</p>
            </div>
          </div>
          
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-accent glow-accent">
              <Flame className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{stats.streak} day streak</p>
              <p className="text-sm text-muted-foreground">Keep it going!</p>
            </div>
          </div>
        </div>

        {currentLevel.nextLevel && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">Progress to Level {currentLevel.level + 1}</span>
              <span className="text-foreground font-semibold">{actualPoints} / {currentLevel.nextLevel}</span>
            </div>
            <Progress value={Math.min((actualPoints / currentLevel.nextLevel) * 100, 100)} className="h-4" />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up-delay-1">
        {[
          { icon: Calculator, value: stats.calculationsCount, label: 'Calculations', color: 'primary' },
          { icon: FileText, value: stats.businessesSaved, label: 'Businesses', color: 'primary' },
          { icon: Trophy, value: unlockedAchievements.length, label: 'Badges', color: 'warning' },
          { icon: Star, value: earnedPoints, label: 'Points Earned', color: 'accent' }
        ].map((stat, idx) => (
          <div key={idx} className="glass hover-lift p-4 sm:p-5 rounded-2xl text-center">
            <div className={`p-3 rounded-xl bg-${stat.color}/10 w-fit mx-auto mb-3`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}`} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Unlocked Achievements */}
      <div className="glass-frosted rounded-3xl p-6 mb-8 animate-fade-in">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          Unlocked ({unlockedAchievements.length})
        </h2>
        {unlockedAchievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Start using TaxForge NG to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {unlockedAchievements.map((achievement) => (
              <div key={achievement.id} className="neon-border p-5 hover-lift">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-primary glow-primary flex items-center justify-center shrink-0">
                    <achievement.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                      <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-medium">
                        +{achievement.points}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locked Achievements */}
      <div className="glass-frosted rounded-3xl p-6 animate-fade-in">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          Locked ({lockedAchievements.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {lockedAchievements.map((achievement) => (
            <div key={achievement.id} className="glass p-5 rounded-2xl opacity-60 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                  <achievement.icon className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{achievement.title}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {achievement.points} pts
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="mt-3">
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Achievements;
