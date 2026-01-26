-- Add deleted_at column to all relevant tables
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.compliance_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.payroll_runs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.payroll_templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.remittance_reminders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.tax_calculations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create indexes for better query performance on deleted_at
CREATE INDEX IF NOT EXISTS idx_businesses_deleted_at ON public.businesses(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_deleted_at ON public.expenses(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_deleted_at ON public.employees(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON public.invoices(deleted_at) WHERE deleted_at IS NOT NULL;

-- Soft Delete Business Function
CREATE OR REPLACE FUNCTION public.soft_delete_business(business_uuid UUID, deleting_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deletion_time TIMESTAMPTZ := now();
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_uuid AND user_id = deleting_user_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Business not found or not owned by user';
  END IF;

  -- Soft delete the business
  UPDATE businesses SET deleted_at = deletion_time WHERE id = business_uuid;
  
  -- Cascade soft delete to related tables
  UPDATE expenses SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE employees SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE invoices SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE clients SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE compliance_items SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE payroll_runs SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE payroll_templates SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE reminders SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE remittance_reminders SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE tax_calculations SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE audit_logs SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
END;
$$;

-- Restore Business Function
CREATE OR REPLACE FUNCTION public.restore_business(business_uuid UUID, restoring_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  business_deleted_at TIMESTAMPTZ;
BEGIN
  -- Get the business's deleted_at timestamp and verify ownership
  SELECT deleted_at INTO business_deleted_at
  FROM businesses 
  WHERE id = business_uuid AND user_id = restoring_user_id AND deleted_at IS NOT NULL;
  
  IF business_deleted_at IS NULL THEN
    RAISE EXCEPTION 'Business not found, not deleted, or not owned by user';
  END IF;

  -- Restore the business
  UPDATE businesses SET deleted_at = NULL WHERE id = business_uuid;
  
  -- Restore all related records that were deleted at the same time
  UPDATE expenses SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE employees SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE invoices SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE clients SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE compliance_items SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE payroll_runs SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE payroll_templates SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE reminders SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE remittance_reminders SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE tax_calculations SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE audit_logs SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
END;
$$;

-- Cleanup Function for permanently deleting old soft-deleted businesses
CREATE OR REPLACE FUNCTION public.cleanup_deleted_businesses(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cutoff_date TIMESTAMPTZ := now() - (retention_days || ' days')::interval;
  deleted_count INTEGER;
BEGIN
  -- Get count before deletion
  SELECT COUNT(*) INTO deleted_count FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date;
  
  -- Delete from child tables first (due to foreign keys)
  DELETE FROM audit_logs WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM expenses WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM invoices WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM clients WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM compliance_items WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM payroll_runs WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM payroll_templates WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM reminders WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM remittance_reminders WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM tax_calculations WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  DELETE FROM employees WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date);
  
  -- Finally delete the businesses
  DELETE FROM businesses WHERE deleted_at IS NOT NULL AND deleted_at < cutoff_date;
  
  RETURN deleted_count;
END;
$$;

-- Update RLS policies to exclude soft-deleted records from normal queries

-- Businesses policies
DROP POLICY IF EXISTS "Users can view own businesses" ON businesses;
CREATE POLICY "Users can view own businesses"
ON businesses FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Policy to allow viewing deleted businesses (for restore functionality)
DROP POLICY IF EXISTS "Users can view own deleted businesses" ON businesses;
CREATE POLICY "Users can view own deleted businesses"
ON businesses FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Expenses policies
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses"
ON expenses FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Employees policies  
DROP POLICY IF EXISTS "Users can view own employees" ON employees;
CREATE POLICY "Users can view own employees"
ON employees FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Invoices policies
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices"
ON invoices FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Clients policies
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
CREATE POLICY "Users can view own clients"
ON clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Compliance items policies
DROP POLICY IF EXISTS "Users can view own compliance items" ON compliance_items;
CREATE POLICY "Users can view own compliance items"
ON compliance_items FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Reminders policies
DROP POLICY IF EXISTS "Users can view own reminders" ON reminders;
CREATE POLICY "Users can view own reminders"
ON reminders FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Remittance reminders policies
DROP POLICY IF EXISTS "Users can view own remittance reminders" ON remittance_reminders;
CREATE POLICY "Users can view own remittance reminders"
ON remittance_reminders FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Tax calculations policies
DROP POLICY IF EXISTS "Users can view own tax calculations" ON tax_calculations;
CREATE POLICY "Users can view own tax calculations"
ON tax_calculations FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Audit logs policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);