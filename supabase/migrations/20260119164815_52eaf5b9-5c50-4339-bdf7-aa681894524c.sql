-- Document verifications for QR code verification
CREATE TABLE public.document_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_id TEXT NOT NULL UNIQUE,
  document_type TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  business_name TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_verifications ENABLE ROW LEVEL SECURITY;

-- Users can manage their own documents
CREATE POLICY "Users can manage their own documents"
  ON public.document_verifications FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can verify documents (read-only for verification page)
CREATE POLICY "Anyone can verify documents by document_id"
  ON public.document_verifications FOR SELECT
  USING (true);

-- Email recipients table
CREATE TABLE public.email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  type TEXT DEFAULT 'other' CHECK (type IN ('accountant', 'tax_office', 'other')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Enable RLS
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;

-- Users can manage their own recipients
CREATE POLICY "Users can manage their own recipients"
  ON public.email_recipients FOR ALL
  USING (auth.uid() = user_id);

-- Email logs for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_title TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own email logs
CREATE POLICY "Users can view their email logs"
  ON public.email_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own email logs
CREATE POLICY "Users can insert their email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_document_verifications_document_id ON public.document_verifications(document_id);
CREATE INDEX idx_document_verifications_user_id ON public.document_verifications(user_id);
CREATE INDEX idx_email_recipients_user_id ON public.email_recipients(user_id);
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);