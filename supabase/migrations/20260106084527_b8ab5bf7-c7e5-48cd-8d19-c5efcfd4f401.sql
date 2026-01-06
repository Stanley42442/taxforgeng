-- Create notification_deliveries table to track security alert delivery status
CREATE TABLE public.notification_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('whatsapp', 'sms', 'email', 'failed')),
  recipient TEXT NOT NULL,
  message_preview TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own notification deliveries
CREATE POLICY "Users can view their own notification deliveries" 
ON public.notification_deliveries 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for service role to insert notification deliveries
CREATE POLICY "Service role can insert notification deliveries"
ON public.notification_deliveries
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notification_deliveries_user_id ON public.notification_deliveries(user_id);
CREATE INDEX idx_notification_deliveries_created_at ON public.notification_deliveries(created_at DESC);
CREATE INDEX idx_notification_deliveries_alert_type ON public.notification_deliveries(alert_type);
CREATE INDEX idx_notification_deliveries_delivery_method ON public.notification_deliveries(delivery_method);