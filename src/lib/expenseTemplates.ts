import { 
  Home, 
  HeartPulse, 
  Shield, 
  GraduationCap, 
  Users, 
  Banknote,
  Building,
  LucideIcon
} from 'lucide-react';

export interface ExpenseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  payment_interval: string;
  suggestedAmount?: number;
  icon: LucideIcon;
}

export const EXPENSE_TEMPLATES: ExpenseTemplate[] = [
  {
    id: 'monthly_rent',
    name: 'Monthly Rent',
    description: 'Typical monthly rent payment',
    category: 'rent',
    payment_interval: 'monthly',
    suggestedAmount: 150000,
    icon: Home
  },
  {
    id: 'annual_rent',
    name: 'Annual Rent',
    description: 'Full year rent payment',
    category: 'rent',
    payment_interval: 'annually',
    suggestedAmount: 1800000,
    icon: Home
  },
  {
    id: 'monthly_pension',
    name: 'Monthly Pension',
    description: 'Employee pension contribution (8% of basic)',
    category: 'pension_contribution',
    payment_interval: 'monthly',
    icon: Banknote
  },
  {
    id: 'monthly_nhf',
    name: 'Monthly NHF',
    description: 'National Housing Fund (2.5% of basic)',
    category: 'nhf_contribution',
    payment_interval: 'monthly',
    icon: Building
  },
  {
    id: 'annual_health_insurance',
    name: 'Annual Health Insurance',
    description: 'Annual HMO/health insurance premium',
    category: 'health_insurance',
    payment_interval: 'annually',
    suggestedAmount: 200000,
    icon: HeartPulse
  },
  {
    id: 'annual_life_insurance',
    name: 'Annual Life Insurance',
    description: 'Annual life insurance premium',
    category: 'life_insurance',
    payment_interval: 'annually',
    suggestedAmount: 100000,
    icon: Shield
  },
  {
    id: 'school_fees_per_term',
    name: 'School Fees (Per Term)',
    description: 'School fees paid per term',
    category: 'child_education',
    payment_interval: 'quarterly',
    icon: GraduationCap
  },
  {
    id: 'annual_school_fees',
    name: 'Annual School Fees',
    description: 'Full year school fees',
    category: 'child_education',
    payment_interval: 'annually',
    icon: GraduationCap
  },
  {
    id: 'monthly_dependent_support',
    name: 'Monthly Dependent Support',
    description: 'Monthly support for elderly parent',
    category: 'dependent_care',
    payment_interval: 'monthly',
    suggestedAmount: 50000,
    icon: Users
  }
];

export function getTemplateById(templateId: string): ExpenseTemplate | undefined {
  return EXPENSE_TEMPLATES.find(t => t.id === templateId);
}
