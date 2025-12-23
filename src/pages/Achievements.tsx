import { NavMenu } from "@/components/NavMenu";
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

  const currentLevel = getLevel(stats.totalPoints);

  const hasBadge = (badgeId: string) => earnedBadges.some(b => b.badgeId === badgeId);

  const achievements: Achievement[] = [
    {
      id: 'first_calc',
      title: 'First Calculation',
      description: 'Complete your first tax calculation',
      icon: Calculator,
      points: 10,
      unlocked: stats.calculationsCount >= 1 || hasBadge('first_calc'),
      category: 'starter'
    },
    {
      id: 'save_business',
      title: 'Business Owner',
      description: 'Save your first business',
      icon: FileText,
      points: 50,
      unlocked: stats.businessesSaved >= 1 || hasBadge('save_business'),
      category: 'starter'
    },
    {
      id: 'expense_tracker',
      title: 'Expense Tracker',
      description: 'Add your first expense entry',
      icon: Receipt,
      points: 15,
      unlocked: stats.expensesCount >= 1 || hasBadge('expense_tracker'),
      category: 'starter'
    },
    {
      id: 'five_calcs',
      title: 'Number Cruncher',
      description: 'Complete 5 tax calculations',
      icon: Zap,
      points: 25,
      unlocked: stats.calculationsCount >= 5 || hasBadge('five_calcs'),
      progress: Math.min(stats.calculationsCount, 5),
      maxProgress: 5,
      category: 'calculation'
    },
    {
      id: 'ten_calcs',
      title: 'Tax Calculator Pro',
      description: 'Complete 10 tax calculations',
      icon: Trophy,
      points: 50,
      unlocked: stats.calculationsCount >= 10 || hasBadge('ten_calcs'),
      progress: Math.min(stats.calculationsCount, 10),
      maxProgress: 10,
      category: 'calculation'
    },
    {
      id: 'set_reminder',
      title: 'Reminder Set',
      description: 'Set up a tax deadline reminder',
      icon: Bell,
      points: 20,
      unlocked: stats.remindersSet >= 1 || hasBadge('set_reminder'),
      category: 'starter'
    },
    {
      id: 'three_businesses',
      title: 'Portfolio Manager',
      description: 'Save 3 businesses',
      icon: Target,
      points: 75,
      unlocked: stats.businessesSaved >= 3 || hasBadge('three_businesses'),
      progress: Math.min(stats.businessesSaved, 3),
      maxProgress: 3,
      category: 'filing'
    },
    {
      id: 'ten_expenses',
      title: 'Finance Tracker',
      description: 'Track 10 income/expense entries',
      icon: Receipt,
      points: 30,
      unlocked: stats.expensesCount >= 10 || hasBadge('ten_expenses'),
      progress: Math.min(stats.expensesCount, 10),
      maxProgress: 10,
      category: 'filing'
    },
    {
      id: 'week_streak',
      title: 'Weekly Warrior',
      description: 'Maintain a 7-day login streak',
      icon: Flame,
      points: 100,
      unlocked: stats.streak >= 7 || hasBadge('week_streak'),
      progress: Math.min(stats.streak, 7),
      maxProgress: 7,
      category: 'streak'
    },
    {
      id: 'mock_filing',
      title: 'E-Filer',
      description: 'Complete a mock e-filing',
      icon: FileText,
      points: 100,
      unlocked: hasBadge('mock_filing'),
      category: 'filing'
    },
    {
      id: 'invite_team',
      title: 'Team Player',
      description: 'Invite a team member',
      icon: Users,
      points: 50,
      unlocked: hasBadge('invite_team'),
      category: 'social'
    },
    {
      id: 'perfect_year',
      title: 'Perfect Compliance Year',
      description: 'File all returns on time for a year',
      icon: Award,
      points: 500,
      unlocked: hasBadge('perfect_year'),
      category: 'filing'
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const earnedPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'starter': return Star;
      case 'calculation': return Calculator;
      case 'filing': return FileText;
      case 'streak': return Flame;
      case 'social': return Users;
      default: return Star;
    }
  };

  // Find next achievement to unlock
  const nextUnlock = lockedAchievements.find(a => a.progress !== undefined && a.maxProgress !== undefined && a.progress > 0);
  const nextUnlockMessage = nextUnlock 
    ? `Complete ${nextUnlock.maxProgress! - nextUnlock.progress!} more to unlock "${nextUnlock.title}"!`
    : 'Keep using TaxForge NG to unlock more achievements!';

  if (!isBasicPlus) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
              <Crown className="h-10 w-10 text-warning" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Achievements & Progress</h1>
            <p className="text-muted-foreground mb-6">
              Track your tax compliance journey with points, badges, and achievements. Available on Basic+ plans.
            </p>
            <Button variant="hero" onClick={() => navigate('/pricing')}>
              <Crown className="h-4 w-4" />
              Upgrade to Basic
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Achievements
            </h1>
            <p className="text-muted-foreground">
              Track your tax compliance journey
            </p>
          </div>

          {/* Level Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">{currentLevel.level}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{currentLevel.title}</h2>
                  <p className="text-sm text-muted-foreground">{stats.totalPoints || earnedPoints} total points</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-warning mb-1">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold">{stats.streak} day streak</span>
                </div>
                <p className="text-xs text-muted-foreground">Keep it going!</p>
              </div>
            </div>

            {currentLevel.nextLevel && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress to Level {currentLevel.level + 1}</span>
                  <span className="text-foreground font-medium">
                    {stats.totalPoints || earnedPoints} / {currentLevel.nextLevel}
                  </span>
                </div>
                <Progress value={((stats.totalPoints || earnedPoints) / currentLevel.nextLevel) * 100} className="h-3" />
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-slide-up">
            <div className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
              <Calculator className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.calculationsCount}</p>
              <p className="text-xs text-muted-foreground">Calculations</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.businessesSaved}</p>
              <p className="text-xs text-muted-foreground">Businesses</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
              <Trophy className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{unlockedAchievements.length}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
              <Star className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{earnedPoints}</p>
              <p className="text-xs text-muted-foreground">Points Earned</p>
            </div>
          </div>

          {/* Unlocked Achievements */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card mb-6 animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Unlocked ({unlockedAchievements.length})
            </h2>
            {unlockedAchievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Start using TaxForge NG to unlock achievements!</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {unlockedAchievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20"
                  >
                    <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <achievement.icon className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground text-sm">{achievement.title}</h3>
                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                          +{achievement.points}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Locked Achievements */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              Locked ({lockedAchievements.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {lockedAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border opacity-75"
                >
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <achievement.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground text-sm">{achievement.title}</h3>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                        {achievement.points} pts
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mt-2">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1.5" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivation */}
          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm text-primary">
              🎯 {nextUnlockMessage}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Achievements;
