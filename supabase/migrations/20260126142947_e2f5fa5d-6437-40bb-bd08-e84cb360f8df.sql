-- Fix RLS policies for analytics_events (Issue 3)
-- Restrict INSERT to authenticated users with proper user_id validation
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics_events;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON analytics_events;
DROP POLICY IF EXISTS "Authenticated users can insert analytics_events" ON analytics_events;

CREATE POLICY "Authenticated users can insert analytics_events"
ON analytics_events FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Add deleted_at check to UPDATE/DELETE policies for soft-delete protection (Issue 10)

-- Businesses table
DROP POLICY IF EXISTS "Users can update their own businesses" ON businesses;
CREATE POLICY "Users can update their own businesses"
ON businesses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own businesses" ON businesses;
CREATE POLICY "Users can delete their own businesses"
ON businesses FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Expenses table
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
CREATE POLICY "Users can update their own expenses"
ON expenses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;
CREATE POLICY "Users can delete their own expenses"
ON expenses FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Employees table
DROP POLICY IF EXISTS "Users can update their own employees" ON employees;
CREATE POLICY "Users can update their own employees"
ON employees FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own employees" ON employees;
CREATE POLICY "Users can delete their own employees"
ON employees FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Invoices table
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
CREATE POLICY "Users can update their own invoices"
ON invoices FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
CREATE POLICY "Users can delete their own invoices"
ON invoices FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Clients table
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
CREATE POLICY "Users can update their own clients"
ON clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
CREATE POLICY "Users can delete their own clients"
ON clients FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Compliance items table
DROP POLICY IF EXISTS "Users can update their own compliance_items" ON compliance_items;
CREATE POLICY "Users can update their own compliance_items"
ON compliance_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own compliance_items" ON compliance_items;
CREATE POLICY "Users can delete their own compliance_items"
ON compliance_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Payroll runs table
DROP POLICY IF EXISTS "Users can update their own payroll_runs" ON payroll_runs;
CREATE POLICY "Users can update their own payroll_runs"
ON payroll_runs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own payroll_runs" ON payroll_runs;
CREATE POLICY "Users can delete their own payroll_runs"
ON payroll_runs FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Payroll templates table
DROP POLICY IF EXISTS "Users can update their own payroll_templates" ON payroll_templates;
CREATE POLICY "Users can update their own payroll_templates"
ON payroll_templates FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own payroll_templates" ON payroll_templates;
CREATE POLICY "Users can delete their own payroll_templates"
ON payroll_templates FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Reminders table
DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
CREATE POLICY "Users can update their own reminders"
ON reminders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;
CREATE POLICY "Users can delete their own reminders"
ON reminders FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Remittance reminders table
DROP POLICY IF EXISTS "Users can update their own remittance_reminders" ON remittance_reminders;
CREATE POLICY "Users can update their own remittance_reminders"
ON remittance_reminders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own remittance_reminders" ON remittance_reminders;
CREATE POLICY "Users can delete their own remittance_reminders"
ON remittance_reminders FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Tax calculations table
DROP POLICY IF EXISTS "Users can update their own tax_calculations" ON tax_calculations;
CREATE POLICY "Users can update their own tax_calculations"
ON tax_calculations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own tax_calculations" ON tax_calculations;
CREATE POLICY "Users can delete their own tax_calculations"
ON tax_calculations FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Audit logs table
DROP POLICY IF EXISTS "Users can update their own audit_logs" ON audit_logs;
CREATE POLICY "Users can update their own audit_logs"
ON audit_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own audit_logs" ON audit_logs;
CREATE POLICY "Users can delete their own audit_logs"
ON audit_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);