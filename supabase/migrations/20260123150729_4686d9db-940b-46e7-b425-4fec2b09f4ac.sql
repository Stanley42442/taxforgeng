-- Create user_reviews table for storing user testimonials
CREATE TABLE public.user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  sector TEXT,
  metric TEXT,
  metric_label TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews"
  ON public.user_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own reviews (approved or not)
CREATE POLICY "Users can view own reviews"
  ON public.user_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can view approved reviews (including anonymous)
CREATE POLICY "Anyone can view approved reviews"
  ON public.user_reviews FOR SELECT
  USING (is_approved = true);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.user_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.user_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_reviews_updated_at
BEFORE UPDATE ON public.user_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();