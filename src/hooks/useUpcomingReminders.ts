import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { addDays, isAfter, isBefore } from "date-fns";

export interface UpcomingReminder {
  id: string;
  title: string;
  dueDate: Date;
  isOverdue: boolean;
  isDueSoon: boolean;
  businessId?: string;
}

export const useUpcomingReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<UpcomingReminder[]>([]);
  const [urgentCount, setUrgentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      if (!user) {
        setReminders([]);
        setUrgentCount(0);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("reminders")
        .select("id, title, due_date, business_id")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching reminders:", error);
        setLoading(false);
        return;
      }

      const now = new Date();
      const sevenDaysFromNow = addDays(now, 7);

      const mapped: UpcomingReminder[] = (data || []).map((r) => {
        const dueDate = new Date(r.due_date);
        const isOverdue = isAfter(now, dueDate);
        const isDueSoon = !isOverdue && isBefore(dueDate, sevenDaysFromNow);

        return {
          id: r.id,
          title: r.title,
          dueDate,
          isOverdue,
          isDueSoon,
          businessId: r.business_id || undefined,
        };
      });

      // Count all incomplete reminders
      setReminders(mapped);
      setUrgentCount(mapped.length);
      setLoading(false);
    };

    fetchReminders();

    // Set up realtime subscription for reminders
    const channel = supabase
      .channel("reminders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reminders",
        },
        () => {
          fetchReminders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { reminders, urgentCount, loading };
};
