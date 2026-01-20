-- Add annual_rent column to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS annual_rent NUMERIC DEFAULT NULL;

COMMENT ON COLUMN employees.annual_rent IS 'Optional: Annual rent amount for Rent Relief calculation. Requires proof documentation from employee.';