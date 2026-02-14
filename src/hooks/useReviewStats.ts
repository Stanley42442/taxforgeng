import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReviewStats {
  ratingValue: number;
  reviewCount: number;
}

/**
 * Fetches aggregate review statistics from the user_reviews table.
 * Returns undefined when no reviews exist, so schema omits aggregateRating.
 */
export const useReviewStats = () => {
  return useQuery<ReviewStats | undefined>({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('rating');

      if (error || !data || data.length === 0) return undefined;

      const total = data.length;
      const avg = data.reduce((sum, r) => sum + (r.rating ?? 0), 0) / total;

      return { ratingValue: avg, reviewCount: total };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
