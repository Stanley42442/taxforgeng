export interface TaxProfessional {
  id: string;
  firmName: string;
  contactPerson?: string;
  state: string;
  city: string;
  specialties: Specialty[];
  professionalBodies: ProfessionalBody[];
  phone?: string;
  email?: string;
  website?: string;
  description: string;
}

export type Specialty = 'CIT' | 'PIT' | 'VAT' | 'WHT' | 'Payroll' | 'Transfer Pricing' | 'Tax Audit' | 'E-Filing' | 'Advisory';
export type ProfessionalBody = 'CITN' | 'ICAN' | 'ACCA' | 'ANAN';

export const SPECIALTIES: { value: Specialty; label: string }[] = [
  { value: 'CIT', label: 'Company Income Tax' },
  { value: 'PIT', label: 'Personal Income Tax' },
  { value: 'VAT', label: 'Value Added Tax' },
  { value: 'WHT', label: 'Withholding Tax' },
  { value: 'Payroll', label: 'Payroll & PAYE' },
  { value: 'Transfer Pricing', label: 'Transfer Pricing' },
  { value: 'Tax Audit', label: 'Tax Audit Defence' },
  { value: 'E-Filing', label: 'E-Filing Assistance' },
  { value: 'Advisory', label: 'Tax Advisory' },
];

export const PROFESSIONAL_BODIES: { value: ProfessionalBody; label: string; verifyUrl: string }[] = [
  { value: 'CITN', label: 'Chartered Institute of Taxation of Nigeria', verifyUrl: 'https://www.citn.org' },
  { value: 'ICAN', label: 'Institute of Chartered Accountants of Nigeria', verifyUrl: 'https://www.icanig.org' },
  { value: 'ACCA', label: 'Association of Chartered Certified Accountants', verifyUrl: 'https://www.accaglobal.com' },
  { value: 'ANAN', label: 'Association of National Accountants of Nigeria', verifyUrl: 'https://www.aborchianan.org.ng' },
];

export const TAX_PROFESSIONALS: TaxProfessional[] = [
  // Lagos
  {
    id: 'lagos-001',
    firmName: 'Andersen Tax Nigeria',
    state: 'Lagos',
    city: 'Victoria Island',
    specialties: ['CIT', 'Transfer Pricing', 'Advisory', 'Tax Audit'],
    professionalBodies: ['CITN', 'ICAN'],
    phone: '+234 1 271 2538',
    website: 'https://ng.andersen.com',
    description: 'Full-service tax advisory covering corporate tax planning, transfer pricing documentation, and tax audit defence for multinationals.',
  },
  {
    id: 'lagos-002',
    firmName: 'Taxaide Professional Services',
    state: 'Lagos',
    city: 'Ikeja',
    specialties: ['PIT', 'Payroll', 'E-Filing', 'VAT'],
    professionalBodies: ['CITN'],
    phone: '+234 1 453 0000',
    website: 'https://www.taxaborchide.com',
    description: 'Specialists in PAYE compliance, payroll processing, and personal income tax filing for SMEs and individuals.',
  },
  {
    id: 'lagos-003',
    firmName: 'KPMG Professional Services',
    state: 'Lagos',
    city: 'Victoria Island',
    specialties: ['CIT', 'VAT', 'Transfer Pricing', 'Advisory', 'Tax Audit'],
    professionalBodies: ['CITN', 'ICAN', 'ACCA'],
    website: 'https://kpmg.com/ng',
    description: 'Big 4 firm providing comprehensive tax services including international tax structuring, VAT advisory, and regulatory compliance.',
  },
  {
    id: 'lagos-004',
    firmName: 'Deloitte Nigeria',
    state: 'Lagos',
    city: 'Victoria Island',
    specialties: ['CIT', 'Transfer Pricing', 'WHT', 'Advisory'],
    professionalBodies: ['CITN', 'ICAN'],
    website: 'https://www2.deloitte.com/ng',
    description: 'Global professional services firm with deep expertise in Nigerian tax reform advisory and cross-border transactions.',
  },
  // Abuja
  {
    id: 'abuja-001',
    firmName: 'PwC Nigeria',
    state: 'FCT Abuja',
    city: 'Maitama',
    specialties: ['CIT', 'VAT', 'Advisory', 'Transfer Pricing'],
    professionalBodies: ['CITN', 'ICAN', 'ACCA'],
    website: 'https://www.pwc.com/ng',
    description: 'Advisory services spanning tax policy engagement, government sector consulting, and compliance management.',
  },
  {
    id: 'abuja-002',
    firmName: 'Pedabo Associates',
    state: 'FCT Abuja',
    city: 'Wuse 2',
    specialties: ['PIT', 'CIT', 'Payroll', 'E-Filing'],
    professionalBodies: ['CITN', 'ICAN'],
    description: 'Mid-tier firm focused on SME tax compliance, payroll outsourcing, and government contractor tax obligations.',
  },
  // Rivers
  {
    id: 'rivers-001',
    firmName: 'Ernst & Young (EY) Port Harcourt',
    state: 'Rivers',
    city: 'Port Harcourt',
    specialties: ['CIT', 'VAT', 'Transfer Pricing', 'Tax Audit'],
    professionalBodies: ['CITN', 'ICAN', 'ACCA'],
    website: 'https://www.ey.com/ng',
    description: 'Serving the oil & gas sector with specialised tax structuring, production sharing contract advisory, and upstream tax compliance.',
  },
  {
    id: 'rivers-002',
    firmName: 'Nolands Nigeria',
    state: 'Rivers',
    city: 'Port Harcourt',
    specialties: ['PIT', 'CIT', 'Payroll', 'Advisory'],
    professionalBodies: ['CITN', 'ICAN'],
    description: 'Independent firm serving Niger Delta businesses with tax planning, compliance, and payroll management services.',
  },
  // Kano
  {
    id: 'kano-001',
    firmName: 'BDO Nigeria – Kano',
    state: 'Kano',
    city: 'Kano',
    specialties: ['CIT', 'PIT', 'VAT', 'Advisory'],
    professionalBodies: ['CITN', 'ICAN'],
    description: 'Northern Nigeria practice covering manufacturing sector tax incentives, pioneer status applications, and VAT compliance.',
  },
  // Oyo
  {
    id: 'oyo-001',
    firmName: 'Grant Thornton Ibadan',
    state: 'Oyo',
    city: 'Ibadan',
    specialties: ['CIT', 'PIT', 'E-Filing', 'Advisory'],
    professionalBodies: ['CITN', 'ICAN'],
    description: 'Serving South-West businesses with corporate tax advisory, FIRS engagement support, and agribusiness tax planning.',
  },
  // Kaduna
  {
    id: 'kaduna-001',
    firmName: 'Mazars Nigeria – Kaduna',
    state: 'Kaduna',
    city: 'Kaduna',
    specialties: ['CIT', 'VAT', 'WHT', 'Payroll'],
    professionalBodies: ['CITN', 'ANAN'],
    description: 'Focused on North-West manufacturing and agribusiness sectors with expertise in tax incentives and WHT compliance.',
  },
  // Enugu
  {
    id: 'enugu-001',
    firmName: 'PKF Nigeria – Enugu',
    state: 'Enugu',
    city: 'Enugu',
    specialties: ['PIT', 'CIT', 'E-Filing', 'Tax Audit'],
    professionalBodies: ['CITN', 'ICAN'],
    description: 'South-East practice providing SME tax compliance, audit defence, and individual tax advisory services.',
  },
];
