-- Add WhatsApp notification column to reminders table
ALTER TABLE public.reminders
ADD COLUMN notify_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;

-- Add WhatsApp number column to profiles table for storing user's WhatsApp number
ALTER TABLE public.profiles
ADD COLUMN whatsapp_number TEXT;