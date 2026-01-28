import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { notifyAchievement } from '@/lib/notifications';
import logger from '@/lib/logger';

export interface UserStats {
  totalPoints: number;
  calculationsCount: number;
  businessesSaved: number;
  remindersSet: number;
  expensesCount: number;
  streak: number;
}

export interface EarnedBadge {
  id: string;
  badgeId: string;
  badgeName: string;
  earnedAt: Date;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    calculationsCount: 0,
    businessesSaved: 0,
    remindersSet: 0,
    expensesCount: 0,
    streak: 1,
  });
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch calculations count
      const { count: calcCount } = await supabase
        .from('tax_calculations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch businesses count
      const { count: bizCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch reminders count
      const { count: reminderCount } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch expenses count
      const { count: expenseCount } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch profile for total points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .maybeSingle();

      // Fetch earned achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      // Calculate streak based on login activity (simplified: mock 1-7 days)
      const streak = Math.min(7, Math.max(1, (calcCount || 0) + (bizCount || 0)));

      setStats({
        totalPoints: profile?.total_points || 0,
        calculationsCount: calcCount || 0,
        businessesSaved: bizCount || 0,
        remindersSet: reminderCount || 0,
        expensesCount: expenseCount || 0,
        streak,
      });

      setEarnedBadges((achievements || []).map(a => ({
        id: a.id,
        badgeId: a.badge_id,
        badgeName: a.badge_name,
        earnedAt: new Date(a.earned_at),
      })));

    } catch (error) {
      logger.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const awardBadge = async (badgeId: string, badgeName: string, points: number): Promise<boolean> => {
    if (!user) return false;

    // Check if already earned
    const alreadyEarned = earnedBadges.some(b => b.badgeId === badgeId);
    if (alreadyEarned) return false;

    try {
      // Insert achievement
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          badge_id: badgeId,
          badge_name: badgeName,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error awarding badge:', error);
        return false;
      }

      // Update total points
      await supabase
        .from('profiles')
        .update({ total_points: stats.totalPoints + points })
        .eq('id', user.id);

      // Update local state
      setStats(prev => ({ ...prev, totalPoints: prev.totalPoints + points }));
      setEarnedBadges(prev => [...prev, {
        id: data.id,
        badgeId: data.badge_id,
        badgeName: data.badge_name,
        earnedAt: new Date(data.earned_at),
      }]);

      // Send notification for the achievement
      notifyAchievement(badgeName, points);

      return true;
    } catch (error) {
      logger.error('Error awarding badge:', error);
      return false;
    }
  };

  const hasBadge = (badgeId: string): boolean => {
    return earnedBadges.some(b => b.badgeId === badgeId);
  };

  const addPoints = async (points: number): Promise<void> => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ total_points: stats.totalPoints + points })
        .eq('id', user.id);

      setStats(prev => ({ ...prev, totalPoints: prev.totalPoints + points }));
    } catch (error) {
      logger.error('Error adding points:', error);
    }
  };

  return {
    stats,
    earnedBadges,
    loading,
    awardBadge,
    hasBadge,
    addPoints,
    refresh: fetchStats,
  };
};
