import { 
  Home, 
  HeartPulse, 
  Shield, 
  GraduationCap, 
  Users, 
  Accessibility,
  Banknote,
  Building,
  Receipt,
  LucideIcon
} from 'lucide-react';

export interface PersonalExpenseCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  reliefType: string;
  maxRelief?: number;
  reliefRate?: number;
  tooltip?: string;
}

export const PERSONAL_EXPENSE_CATEGORIES: PersonalExpenseCategory[] = [
  {
    id: 'rent',
    name: 'Rent',
    description: 'Rent paid on residential accommodation',
    icon: Home,
    reliefType: 'Rent Relief',
    tooltip: 'Rent paid for your primary residence qualifies for tax relief'
  },
  {
    id: 'pension_contribution',
    name: 'Pension Contribution',
    description: 'Employee pension contribution (8% of basic)',
    icon: Banknote,
    reliefType: 'Pension Relief',
    reliefRate: 1.0,
    tooltip: 'Mandatory pension contributions are fully deductible'
  },
  {
    id: 'nhf_contribution',
    name: 'NHF Contribution',
    description: 'National Housing Fund (2.5% of basic)',
    icon: Building,
    reliefType: 'NHF Relief',
    reliefRate: 1.0,
    tooltip: 'NHF contributions are fully deductible from taxable income'
  },
  {
    id: 'health_insurance',
    name: 'Health Insurance',
    description: 'Health insurance premiums (approved plans)',
    icon: HeartPulse,
    reliefType: 'Health Insurance Relief',
    reliefRate: 1.0,
    tooltip: 'Premiums paid on approved health insurance plans are deductible'
  },
  {
    id: 'life_insurance',
    name: 'Life Insurance',
    description: 'Life insurance premiums',
    icon: Shield,
    reliefType: 'Life Insurance Relief',
    reliefRate: 1.0,
    tooltip: 'Life insurance premiums paid during the year'
  },
  {
    id: 'child_education',
    name: 'Child Education',
    description: 'School fees, uniforms, books for children',
    icon: GraduationCap,
    reliefType: 'Child Education Allowance',
    maxRelief: 2500,
    tooltip: 'Education expenses for children (max 4 children, ₦2,500 each under 2026 rules)'
  },
  {
    id: 'dependent_care',
    name: 'Dependent Care',
    description: 'Support for elderly parents/relatives',
    icon: Users,
    reliefType: 'Dependent Relative Relief',
    maxRelief: 2000,
    tooltip: 'Support provided to dependent relatives (max 2 relatives, ₦2,000 each)'
  },
  {
    id: 'disability_support',
    name: 'Disability Support',
    description: 'Disability-related expenses',
    icon: Accessibility,
    reliefType: 'Disability Relief',
    maxRelief: 50000,
    tooltip: 'Additional relief of ₦50,000 for persons with disability'
  },
  {
    id: 'gratuity_received',
    name: 'Gratuity/Retirement',
    description: 'Gratuity or retirement lump sums received',
    icon: Receipt,
    reliefType: 'Gratuity Exemption',
    tooltip: 'Gratuities received are exempt up to certain thresholds'
  },
  {
    id: 'other',
    name: 'Other Deductible',
    description: 'Other tax-deductible personal expenses',
    icon: Receipt,
    reliefType: 'General',
    tooltip: 'Other qualifying personal expenses'
  }
];

export const PAYMENT_INTERVALS = [
  { value: 'one_time', label: 'One-time Payment' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

export function calculateAnnualAmount(amount: number, interval: string, startDate?: Date, endDate?: Date, taxYear?: number): number {
  const year = taxYear || new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  
  // Calculate effective months in the tax year
  const effectiveStart = startDate && startDate > yearStart ? startDate : yearStart;
  const effectiveEnd = endDate && endDate < yearEnd ? endDate : yearEnd;
  
  if (effectiveStart > effectiveEnd) return 0;
  
  const monthsDiff = (effectiveEnd.getFullYear() - effectiveStart.getFullYear()) * 12 
    + effectiveEnd.getMonth() - effectiveStart.getMonth() + 1;
  
  switch (interval) {
    case 'one_time':
      return amount;
    case 'weekly':
      return amount * (monthsDiff * 4.33); // Average weeks per month
    case 'monthly':
      return amount * monthsDiff;
    case 'quarterly':
      return amount * Math.ceil(monthsDiff / 3);
    case 'annually':
      return amount;
    default:
      return amount;
  }
}

export function getCategoryById(categoryId: string): PersonalExpenseCategory | undefined {
  return PERSONAL_EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
}
