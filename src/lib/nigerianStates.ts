export const NIGERIAN_STATES = [
  { code: 'AB', name: 'Abia', zone: 'South East' },
  { code: 'AD', name: 'Adamawa', zone: 'North East' },
  { code: 'AK', name: 'Akwa Ibom', zone: 'South South' },
  { code: 'AN', name: 'Anambra', zone: 'South East' },
  { code: 'BA', name: 'Bauchi', zone: 'North East' },
  { code: 'BY', name: 'Bayelsa', zone: 'South South' },
  { code: 'BE', name: 'Benue', zone: 'North Central' },
  { code: 'BO', name: 'Borno', zone: 'North East' },
  { code: 'CR', name: 'Cross River', zone: 'South South' },
  { code: 'DE', name: 'Delta', zone: 'South South' },
  { code: 'EB', name: 'Ebonyi', zone: 'South East' },
  { code: 'ED', name: 'Edo', zone: 'South South' },
  { code: 'EK', name: 'Ekiti', zone: 'South West' },
  { code: 'EN', name: 'Enugu', zone: 'South East' },
  { code: 'FC', name: 'FCT Abuja', zone: 'North Central' },
  { code: 'GO', name: 'Gombe', zone: 'North East' },
  { code: 'IM', name: 'Imo', zone: 'South East' },
  { code: 'JI', name: 'Jigawa', zone: 'North West' },
  { code: 'KD', name: 'Kaduna', zone: 'North West' },
  { code: 'KN', name: 'Kano', zone: 'North West' },
  { code: 'KT', name: 'Katsina', zone: 'North West' },
  { code: 'KE', name: 'Kebbi', zone: 'North West' },
  { code: 'KO', name: 'Kogi', zone: 'North Central' },
  { code: 'KW', name: 'Kwara', zone: 'North Central' },
  { code: 'LA', name: 'Lagos', zone: 'South West' },
  { code: 'NA', name: 'Nasarawa', zone: 'North Central' },
  { code: 'NI', name: 'Niger', zone: 'North Central' },
  { code: 'OG', name: 'Ogun', zone: 'South West' },
  { code: 'ON', name: 'Ondo', zone: 'South West' },
  { code: 'OS', name: 'Osun', zone: 'South West' },
  { code: 'OY', name: 'Oyo', zone: 'South West' },
  { code: 'PL', name: 'Plateau', zone: 'North Central' },
  { code: 'RI', name: 'Rivers', zone: 'South South' },
  { code: 'SO', name: 'Sokoto', zone: 'North West' },
  { code: 'TA', name: 'Taraba', zone: 'North East' },
  { code: 'YO', name: 'Yobe', zone: 'North East' },
  { code: 'ZA', name: 'Zamfara', zone: 'North West' },
] as const;

export const EMPLOYMENT_STATUSES = [
  { value: 'employed_paye', label: 'Employed (PAYE)' },
  { value: 'self_employed', label: 'Self-Employed / Freelancer' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'unemployed', label: 'Unemployed / Student' },
  { value: 'retired', label: 'Retired' },
] as const;

export const REFERRAL_SOURCES = [
  { value: 'social_media', label: 'Social Media (Twitter/X, Instagram, Facebook)' },
  { value: 'friend', label: 'Friend or Colleague' },
  { value: 'google', label: 'Google Search' },
  { value: 'tax_professional', label: 'Tax Professional / Accountant' },
  { value: 'news', label: 'News Article / Blog' },
  { value: 'other', label: 'Other' },
] as const;

export const ENTITY_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'limited_company', label: 'Limited Liability Company (LLC)' },
  { value: 'plc', label: 'Public Limited Company (PLC)' },
  { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
] as const;

export type NigerianState = typeof NIGERIAN_STATES[number];
export type EmploymentStatus = typeof EMPLOYMENT_STATUSES[number]['value'];
export type ReferralSource = typeof REFERRAL_SOURCES[number]['value'];
export type EntityType = typeof ENTITY_TYPES[number]['value'];
