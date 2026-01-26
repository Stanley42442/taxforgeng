-- Fix duplicate RLS policies that conflict with soft delete
-- Drop old policies without deleted_at filter

-- businesses: drop old policy
DROP POLICY IF EXISTS "Users can view their own businesses" ON businesses;

-- expenses: drop old policy  
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;

-- employees: drop ALL policy without filter and old SELECT
DROP POLICY IF EXISTS "Users manage own employees" ON employees;
DROP POLICY IF EXISTS "Users can view their own employees" ON employees;

-- Add back the ALL policy for employees with deleted_at filter
CREATE POLICY "Users manage own employees"
ON employees FOR ALL
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- invoices: drop old policy
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;

-- clients: drop old policy
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;

-- compliance_items: drop old policy
DROP POLICY IF EXISTS "Users can view their own compliance items" ON compliance_items;

-- reminders: drop old policy
DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;

-- tax_calculations: drop old policy
DROP POLICY IF EXISTS "Users can view their own calculations" ON tax_calculations;

-- audit_logs: drop old policy
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;