-- Create table for scheduled report preferences
CREATE TABLE public.report_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('weekly', 'monthly')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, for weekly
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 28), -- for monthly
  preferred_hour INTEGER NOT NULL DEFAULT 9 CHECK (preferred_hour >= 0 AND preferred_hour <= 23),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, schedule_type)
);

-- Enable RLS
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own report schedules"
ON public.report_schedules
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own report schedules"
ON public.report_schedules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own report schedules"
ON public.report_schedules
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own report schedules"
ON public.report_schedules
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_report_schedules_updated_at
BEFORE UPDATE ON public.report_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();