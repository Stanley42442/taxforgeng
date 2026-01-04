-- Add sector columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS sub_sector TEXT;

-- Create sector_presets table for configurable sector rules
CREATE TABLE IF NOT EXISTS public.sector_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  tax_rules JSONB NOT NULL DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  myths JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ai_queries table for TaxBot analytics
CREATE TABLE IF NOT EXISTS public.ai_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  sector TEXT,
  feedback INTEGER CHECK (feedback IN (-1, 0, 1)),
  session_id TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create individual_calculations table for non-business users
CREATE TABLE IF NOT EXISTS public.individual_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_type TEXT NOT NULL, -- 'pit', 'foreign_income', 'crypto', 'investment'
  inputs JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create digital_vat_registrations for NRP/SEP tracking
CREATE TABLE IF NOT EXISTS public.digital_vat_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  country_of_origin TEXT NOT NULL,
  annual_digital_revenue NUMERIC NOT NULL DEFAULT 0,
  sep_threshold_met BOOLEAN DEFAULT false,
  registration_status TEXT DEFAULT 'pending', -- 'pending', 'registered', 'exempt'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscription_addons for modular pricing
CREATE TABLE IF NOT EXISTS public.subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  addon_type TEXT NOT NULL, -- 'ai_queries', 'extra_businesses', 'premium_reports'
  quantity INTEGER DEFAULT 1,
  remaining INTEGER DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS on all new tables
ALTER TABLE public.sector_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_vat_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sector_presets (public read)
CREATE POLICY "Anyone can view sector presets"
ON public.sector_presets FOR SELECT
USING (true);

-- RLS Policies for ai_queries
CREATE POLICY "Users can view their own queries"
ON public.ai_queries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create queries"
ON public.ai_queries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queries"
ON public.ai_queries FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for individual_calculations
CREATE POLICY "Users can view their own individual calculations"
ON public.individual_calculations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own individual calculations"
ON public.individual_calculations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own individual calculations"
ON public.individual_calculations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for digital_vat_registrations
CREATE POLICY "Users can view their own digital VAT registrations"
ON public.digital_vat_registrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own digital VAT registrations"
ON public.digital_vat_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own digital VAT registrations"
ON public.digital_vat_registrations FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for subscription_addons
CREATE POLICY "Users can view their own addons"
ON public.subscription_addons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addons"
ON public.subscription_addons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addons"
ON public.subscription_addons FOR UPDATE
USING (auth.uid() = user_id);

-- Insert default sector presets
INSERT INTO public.sector_presets (sector_id, name, description, icon, tax_rules, benefits, myths) VALUES
('renewables', 'Renewables/Green Energy', 'Eco-investment incentives and green technology benefits', 'Leaf', 
 '{"edti_rate": 5, "ev_vat": 0, "solar_vat": 0, "green_hire_deduction": 50, "cit_rate": 25}',
 ARRAY['5% EDTI on eco-investments', 'Zero VAT on EVs/solar', '50% green tech hire deduction'],
 '[{"myth": "All green investments are tax-free", "truth": "Only qualifying eco-investments get EDTI credit, not full exemption"}]'),
 
('oil_gas', 'Oil & Gas/Hydrocarbons', 'Dual taxation with Hydrocarbon Tax and CIT', 'Droplet',
 '{"hydrocarbon_tax_min": 15, "hydrocarbon_tax_max": 30, "cit_rate": 25, "environmental_surcharge": 5, "ppt_legacy_min": 50, "ppt_legacy_max": 85, "gas_credit": true}',
 ARRAY['Gas investment credits', 'Accelerated depreciation', 'Export incentives'],
 '[{"myth": "Oil companies pay 85% tax", "truth": "Legacy PPT rates (50-85%) are being phased out for new Hydrocarbon Tax (15-30%)"}]'),

('hospitality', 'Hospitality/Tourism', 'Seasonal business incentives and presumptive options', 'Utensils',
 '{"presumptive_available": true, "transport_vat_exempt": true, "seasonal_wage_deduction": true, "cit_rate": 25}',
 ARRAY['Presumptive tax for small operators', 'VAT-exempt transport services', 'Seasonal wage deductions'],
 '[{"myth": "Hotels dont pay VAT", "truth": "Accommodation is VATable at 7.5%, only passenger transport is exempt"}]'),

('education_health', 'Education/Health Services', 'Social sector exemptions and reduced rates', 'GraduationCap',
 '{"education_vat": 0, "health_vat": 0, "small_institution_cit": 0, "donation_cap": 10, "cit_rate": 25}',
 ARRAY['Zero VAT on educational materials', '0% CIT for small institutions', '10% donation deduction cap'],
 '[{"myth": "All schools are tax exempt", "truth": "Only qualifying small educational institutions get 0% CIT"}]'),

('construction', 'Construction/Real Estate', 'Property development and rental income taxation', 'HardHat',
 '{"wht_contracts_min": 5, "wht_contracts_max": 10, "rent_relief_max": 500000, "rent_relief_percent": 20, "cgt_home_exempt": true, "cit_rate": 25}',
 ARRAY['WHT 5-10% on contracts', 'Rent relief up to ₦500k', 'CGT home sale exemptions'],
 '[{"myth": "Selling your home is always tax-free", "truth": "Principal residence exemption has conditions and limits"}]'),

('informal', 'Informal/Micro-Enterprise', 'Simplified compliance for unregistered businesses', 'Store',
 '{"presumptive_min": 5000, "presumptive_max": 50000, "location_based": true, "formalization_incentives": true, "vat_exempt": true}',
 ARRAY['Location-based flat taxes (₦5k-50k)', 'Formalization incentives', 'VAT exemption for micro-enterprises'],
 '[{"myth": "Small traders dont need to pay any tax", "truth": "Presumptive taxes still apply based on location and activity"}]')

ON CONFLICT (sector_id) DO NOTHING;