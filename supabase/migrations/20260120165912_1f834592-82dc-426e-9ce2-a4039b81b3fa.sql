-- =============================================
-- PAYROLL SYSTEM COMPREHENSIVE DATABASE SCHEMA
-- =============================================

-- Employees table (permanent employee records)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  employee_id_number VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  hire_date DATE,
  termination_date DATE,
  department VARCHAR(100),
  position VARCHAR(100),
  employment_type VARCHAR(50) DEFAULT 'full-time',
  current_gross_salary DECIMAL(15,2) NOT NULL,
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  tax_id VARCHAR(50),
  pension_pin VARCHAR(50),
  pfa_name VARCHAR(100),
  nhf_number VARCHAR(50),
  include_nhf BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  self_service_enabled BOOLEAN DEFAULT false,
  self_service_user_id UUID,
  self_service_invite_sent_at TIMESTAMP WITH TIME ZONE,
  self_service_last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employee salary history
CREATE TABLE public.employee_salary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  effective_date DATE NOT NULL,
  previous_salary DECIMAL(15,2),
  new_salary DECIMAL(15,2) NOT NULL,
  change_reason VARCHAR(255),
  approved_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payroll runs (monthly payroll batches)
CREATE TABLE public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  pay_period VARCHAR(7) NOT NULL,
  pay_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  total_employees INTEGER DEFAULT 0,
  total_gross_salaries DECIMAL(15,2) DEFAULT 0,
  total_net_salaries DECIMAL(15,2) DEFAULT 0,
  total_paye DECIMAL(15,2) DEFAULT 0,
  total_pension_employee DECIMAL(15,2) DEFAULT 0,
  total_pension_employer DECIMAL(15,2) DEFAULT 0,
  total_nhf DECIMAL(15,2) DEFAULT 0,
  total_overtime DECIMAL(15,2) DEFAULT 0,
  total_bonuses DECIMAL(15,2) DEFAULT 0,
  total_leave_deductions DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual payroll entries per employee
CREATE TABLE public.payroll_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name VARCHAR(255) NOT NULL,
  gross_salary DECIMAL(15,2) NOT NULL,
  basic_salary DECIMAL(15,2),
  housing_allowance DECIMAL(15,2),
  transport_allowance DECIMAL(15,2),
  other_allowances DECIMAL(15,2),
  overtime_amount DECIMAL(15,2) DEFAULT 0,
  bonus_amount DECIMAL(15,2) DEFAULT 0,
  leave_deduction DECIMAL(15,2) DEFAULT 0,
  pension_employee DECIMAL(15,2) NOT NULL,
  pension_employer DECIMAL(15,2) NOT NULL,
  nhf DECIMAL(15,2) DEFAULT 0,
  taxable_income DECIMAL(15,2) NOT NULL,
  paye DECIMAL(15,2) NOT NULL,
  net_salary DECIMAL(15,2) NOT NULL,
  include_nhf BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payroll templates
CREATE TABLE public.payroll_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Template entries
CREATE TABLE public.payroll_template_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.payroll_templates(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name VARCHAR(255) NOT NULL,
  gross_salary DECIMAL(15,2) NOT NULL,
  include_nhf BOOLEAN DEFAULT true,
  position VARCHAR(255),
  department VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Leave types
CREATE TABLE public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  default_days_per_year INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  color VARCHAR(7) DEFAULT '#3b82f6',
  requires_approval BOOLEAN DEFAULT true,
  can_carry_over BOOLEAN DEFAULT false,
  max_carry_over_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employee leave balances
CREATE TABLE public.employee_leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  leave_type_id UUID REFERENCES public.leave_types(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  entitled_days DECIMAL(5,2) NOT NULL,
  used_days DECIMAL(5,2) DEFAULT 0,
  carried_over_days DECIMAL(5,2) DEFAULT 0,
  adjustment_days DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Leave requests
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  leave_type_id UUID REFERENCES public.leave_types(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  half_day_period VARCHAR(10),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Public holidays
CREATE TABLE public.public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Overtime rates
CREATE TABLE public.overtime_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Overtime entries
CREATE TABLE public.overtime_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_entry_id UUID REFERENCES public.payroll_entries(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  pay_period VARCHAR(7) NOT NULL,
  overtime_rate_id UUID REFERENCES public.overtime_rates(id),
  hours DECIMAL(6,2) NOT NULL,
  hourly_rate DECIMAL(15,2) NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bonus entries
CREATE TABLE public.bonus_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_entry_id UUID REFERENCES public.payroll_entries(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  pay_period VARCHAR(7) NOT NULL,
  bonus_type VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  is_taxable BOOLEAN DEFAULT true,
  tax_treatment VARCHAR(50) DEFAULT 'marginal_rate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Remittance reminders
CREATE TABLE public.remittance_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  remittance_type VARCHAR(20) NOT NULL,
  reminder_days_before INTEGER DEFAULT 3,
  is_enabled BOOLEAN DEFAULT true,
  last_sent_for_period VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employee portal sessions
CREATE TABLE public.employee_portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_template_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remittance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_portal_sessions ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "Users manage own employees" ON public.employees
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Employees view own record via self-service" ON public.employees
  FOR SELECT USING (auth.uid() = self_service_user_id);

-- Employee salary history
CREATE POLICY "Users view salary history for own employees" ON public.employee_salary_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
  );

-- Payroll runs
CREATE POLICY "Users manage own payroll runs" ON public.payroll_runs
  FOR ALL USING (auth.uid() = user_id);

-- Payroll entries
CREATE POLICY "Users manage entries for own payroll runs" ON public.payroll_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.payroll_runs WHERE id = payroll_run_id AND user_id = auth.uid())
  );

CREATE POLICY "Employees view own payslips" ON public.payroll_entries
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE self_service_user_id = auth.uid())
  );

-- Payroll templates
CREATE POLICY "Users manage own templates" ON public.payroll_templates
  FOR ALL USING (auth.uid() = user_id);

-- Template entries
CREATE POLICY "Users manage entries for own templates" ON public.payroll_template_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.payroll_templates WHERE id = template_id AND user_id = auth.uid())
  );

-- Leave types
CREATE POLICY "Users manage own leave types" ON public.leave_types
  FOR ALL USING (auth.uid() = user_id);

-- Leave balances
CREATE POLICY "Users view balances for own employees" ON public.employee_leave_balances
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
  );

CREATE POLICY "Employees view own leave balances" ON public.employee_leave_balances
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE self_service_user_id = auth.uid())
  );

-- Leave requests
CREATE POLICY "Users manage leave requests for own employees" ON public.leave_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
  );

CREATE POLICY "Employees manage own leave requests" ON public.leave_requests
  FOR ALL USING (
    employee_id IN (SELECT id FROM public.employees WHERE self_service_user_id = auth.uid())
  );

-- Public holidays
CREATE POLICY "Users manage own holidays" ON public.public_holidays
  FOR ALL USING (auth.uid() = user_id);

-- Overtime rates
CREATE POLICY "Users manage own overtime rates" ON public.overtime_rates
  FOR ALL USING (auth.uid() = user_id);

-- Overtime entries
CREATE POLICY "Users manage overtime for own employees" ON public.overtime_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
  );

-- Bonus entries
CREATE POLICY "Users manage bonuses for own employees" ON public.bonus_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
  );

-- Remittance reminders
CREATE POLICY "Users manage own remittance reminders" ON public.remittance_reminders
  FOR ALL USING (auth.uid() = user_id);

-- Portal sessions
CREATE POLICY "Users view portal sessions for own employees" ON public.employee_portal_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_self_service ON public.employees(self_service_user_id);
CREATE INDEX idx_employee_salary_history_employee_id ON public.employee_salary_history(employee_id);
CREATE INDEX idx_payroll_runs_user_id ON public.payroll_runs(user_id);
CREATE INDEX idx_payroll_runs_pay_period ON public.payroll_runs(pay_period);
CREATE INDEX idx_payroll_entries_run_id ON public.payroll_entries(payroll_run_id);
CREATE INDEX idx_payroll_entries_employee_id ON public.payroll_entries(employee_id);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);
CREATE INDEX idx_leave_balances_employee_year ON public.employee_leave_balances(employee_id, year);
CREATE INDEX idx_overtime_entries_employee ON public.overtime_entries(employee_id);
CREATE INDEX idx_bonus_entries_employee ON public.bonus_entries(employee_id);

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_runs_updated_at
  BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_templates_updated_at
  BEFORE UPDATE ON public.payroll_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON public.employee_leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_remittance_reminders_updated_at
  BEFORE UPDATE ON public.remittance_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();