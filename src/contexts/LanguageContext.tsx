import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type Language = 'en' | 'pcm';

interface Translations {
  [key: string]: {
    en: string;
    pcm: string;
  };
}

// Core translations for Nigerian Pidgin English
export const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', pcm: 'Dashboard' },
  'nav.getAdvice': { en: 'Get Advice', pcm: 'Get Advice' },
  'nav.calculator': { en: 'Calculator', pcm: 'Calculator' },
  'nav.pricing': { en: 'Pricing', pcm: 'How Much E Cost' },
  'nav.learn': { en: 'Learn', pcm: 'Learn Am' },
  'nav.settings': { en: 'Settings', pcm: 'Settings' },
  'nav.expenses': { en: 'Expenses', pcm: 'Money Wey Comot' },
  'nav.reminders': { en: 'Reminders', pcm: 'Reminder Dem' },
  'nav.referrals': { en: 'Referrals', pcm: 'Bring Your Padi' },
  'nav.taxCalendar': { en: 'Tax Calendar', pcm: 'Tax Calendar' },
  'nav.accountantPortal': { en: 'Accountant Portal', pcm: 'Accountant Corner' },
  
  // Common phrases
  'common.welcome': { en: 'Welcome', pcm: 'You do well' },
  'common.signIn': { en: 'Sign In', pcm: 'Enter Inside' },
  'common.signOut': { en: 'Sign Out', pcm: 'Comot' },
  'common.save': { en: 'Save', pcm: 'Keep Am' },
  'common.cancel': { en: 'Cancel', pcm: 'Leave Am' },
  'common.submit': { en: 'Submit', pcm: 'Send Am' },
  'common.loading': { en: 'Loading...', pcm: 'E dey load...' },
  'common.success': { en: 'Success!', pcm: 'E don work!' },
  'common.error': { en: 'Error', pcm: 'Wahala' },
  'common.next': { en: 'Next', pcm: 'Go Front' },
  'common.back': { en: 'Back', pcm: 'Go Back' },
  'common.close': { en: 'Close', pcm: 'Close Am' },
  'common.delete': { en: 'Delete', pcm: 'Comot Am' },
  'common.edit': { en: 'Edit', pcm: 'Change Am' },
  'common.add': { en: 'Add', pcm: 'Put Am' },
  'common.search': { en: 'Search', pcm: 'Find Am' },
  'common.filter': { en: 'Filter', pcm: 'Sieve Am' },
  'common.all': { en: 'All', pcm: 'Everything' },
  'common.none': { en: 'None', pcm: 'Nothing' },
  'common.yes': { en: 'Yes', pcm: 'Yes o' },
  'common.no': { en: 'No', pcm: 'No o' },
  'common.confirm': { en: 'Confirm', pcm: 'Agree Am' },
  'common.viewAll': { en: 'View All', pcm: 'See Everything' },
  'common.learnMore': { en: 'Learn More', pcm: 'Hear More' },
  
  // Tax related
  'tax.calculate': { en: 'Calculate Tax', pcm: 'Calculate Tax' },
  'tax.totalTax': { en: 'Total Tax', pcm: 'Total Tax' },
  'tax.turnover': { en: 'Annual Turnover', pcm: 'Money Wey Enter For Year' },
  'tax.companyIncomeTax': { en: 'Company Income Tax', pcm: 'Company Tax' },
  'tax.personalIncomeTax': { en: 'Personal Income Tax', pcm: 'Personal Tax' },
  'tax.vat': { en: 'VAT', pcm: 'VAT' },
  'tax.deadline': { en: 'Tax Deadline', pcm: 'When E Suppose Enter' },
  'tax.estimatedTax': { en: 'Estimated Tax', pcm: 'Tax Wey We Calculate' },
  'tax.taxSavings': { en: 'Tax Savings', pcm: 'Tax Wey You Save' },
  'tax.effectiveRate': { en: 'Effective Rate', pcm: 'Real Percentage' },
  'tax.taxTips': { en: 'Tax Tips', pcm: 'Tax Advice' },
  
  // Business
  'business.name': { en: 'Business Name', pcm: 'Business Name' },
  'business.save': { en: 'Save Business', pcm: 'Keep This Business' },
  'business.myBusinesses': { en: 'My Businesses', pcm: 'My Business Dem' },
  'business.addNew': { en: 'Add New Business', pcm: 'Add New Business' },
  'business.sector': { en: 'Business Sector', pcm: 'Type of Business' },
  'business.turnover': { en: 'Business Turnover', pcm: 'Money Wey Enter' },
  'business.entityType': { en: 'Entity Type', pcm: 'How Business Dey Registered' },
  
  // Pricing
  'pricing.free': { en: 'Free', pcm: 'Free' },
  'pricing.starter': { en: 'Starter', pcm: 'Small Money' },
  'pricing.basic': { en: 'Basic', pcm: 'Normal' },
  'pricing.business': { en: 'Business', pcm: 'Business' },
  'pricing.perMonth': { en: '/month', pcm: '/month' },
  'pricing.upgrade': { en: 'Upgrade Now', pcm: 'Level Up Now' },
  'pricing.currentPlan': { en: 'Current Plan', pcm: 'Wetin You Dey Use Now' },
  'pricing.choosePlan': { en: 'Choose Plan', pcm: 'Pick Plan' },
  'pricing.features': { en: 'Features', pcm: 'Wetin E Get' },
  
  // Messages
  'msg.noBusinesses': { en: 'No businesses saved yet', pcm: 'You never save any business' },
  'msg.taxCalculated': { en: 'Tax calculated successfully', pcm: 'We don calculate your tax finish' },
  'msg.saveSuccess': { en: 'Saved successfully', pcm: 'E don save' },
  'msg.loginRequired': { en: 'Please sign in to continue', pcm: 'Abeg login first' },
  'msg.noData': { en: 'No data available', pcm: 'Nothing dey here' },
  'msg.tryAgain': { en: 'Please try again', pcm: 'Try am again' },
  'msg.comingSoon': { en: 'Coming Soon', pcm: 'E Dey Come' },
  
  // Referrals
  'referral.title': { en: 'Invite Friends, Earn Rewards', pcm: 'Bring Your Padi, Collect Bonus' },
  'referral.share': { en: 'Share your link', pcm: 'Share your link' },
  'referral.copied': { en: 'Link copied!', pcm: 'E don copy!' },
  'referral.invite': { en: 'Invite a Friend', pcm: 'Call Your Padi' },
  'referral.pending': { en: 'Pending', pcm: 'E Never Complete' },
  'referral.completed': { en: 'Completed', pcm: 'E Don Complete' },
  'referral.rewards': { en: 'Your Rewards', pcm: 'Your Bonus' },
  
  // Calendar
  'calendar.taxCalendar': { en: 'Tax Calendar', pcm: 'Tax Calendar' },
  'calendar.upcoming': { en: 'Upcoming Deadlines', pcm: 'Deadline Wey Dey Come' },
  'calendar.daysLeft': { en: 'days left', pcm: 'days remain' },
  'calendar.today': { en: 'Today', pcm: 'Today' },
  'calendar.tomorrow': { en: 'Tomorrow', pcm: 'Tomorrow' },
  'calendar.overdue': { en: 'Overdue', pcm: 'E Don Pass' },
  
  // Expenses
  'expense.title': { en: 'Expenses', pcm: 'Money Wey Comot' },
  'expense.addExpense': { en: 'Add Expense', pcm: 'Put New Expense' },
  'expense.category': { en: 'Category', pcm: 'Type' },
  'expense.amount': { en: 'Amount', pcm: 'How Much' },
  'expense.date': { en: 'Date', pcm: 'When' },
  'expense.description': { en: 'Description', pcm: 'Wetin E Be' },
  'expense.deductible': { en: 'Tax Deductible', pcm: 'Fit Reduce Tax' },
  'expense.totalExpenses': { en: 'Total Expenses', pcm: 'All Money Wey Comot' },
  
  // Dashboard
  'dashboard.title': { en: 'Dashboard', pcm: 'Dashboard' },
  'dashboard.overview': { en: 'Overview', pcm: 'Summary' },
  'dashboard.recentActivity': { en: 'Recent Activity', pcm: 'Wetin Happen Recently' },
  'dashboard.quickActions': { en: 'Quick Actions', pcm: 'Quick Moves' },
  'dashboard.taxSummary': { en: 'Tax Summary', pcm: 'Tax Summary' },
  
  // Settings
  'settings.title': { en: 'Settings', pcm: 'Settings' },
  'settings.profile': { en: 'Profile', pcm: 'Your Profile' },
  'settings.security': { en: 'Security', pcm: 'Security' },
  'settings.notifications': { en: 'Notifications', pcm: 'Notifications' },
  'settings.whatsapp': { en: 'WhatsApp Notifications', pcm: 'WhatsApp Alerts' },
  'settings.language': { en: 'Language', pcm: 'Language' },
  'settings.verifyNumber': { en: 'Verify Number', pcm: 'Verify Your Number' },
  
  // Auth
  'auth.signIn': { en: 'Sign In', pcm: 'Enter Inside' },
  'auth.signUp': { en: 'Sign Up', pcm: 'Create Account' },
  'auth.email': { en: 'Email', pcm: 'Email' },
  'auth.password': { en: 'Password', pcm: 'Password' },
  'auth.forgotPassword': { en: 'Forgot Password?', pcm: 'You Forget Password?' },
  'auth.noAccount': { en: "Don't have an account?", pcm: 'You no get account?' },
  'auth.hasAccount': { en: 'Already have an account?', pcm: 'You don get account?' },
  
  // Accountant Portal
  'accountant.title': { en: 'Accountant Portal', pcm: 'Accountant Corner' },
  'accountant.clients': { en: 'Client Businesses', pcm: 'Customer Business Dem' },
  'accountant.addClient': { en: 'Add Client', pcm: 'Add Customer' },
  'accountant.bulkActions': { en: 'Bulk Actions', pcm: 'Do Plenty At Once' },
  'accountant.exportAll': { en: 'Export All', pcm: 'Download Everything' },
  
  // Success stories
  'stories.title': { en: 'Success Stories', pcm: 'People Wey Don Win' },
  'stories.readMore': { en: 'Read More', pcm: 'Read Am' },
  
  // Footer
  'footer.about': { en: 'About Us', pcm: 'About Us' },
  'footer.contact': { en: 'Contact', pcm: 'Reach Us' },
  'footer.privacy': { en: 'Privacy Policy', pcm: 'Privacy' },
  'footer.terms': { en: 'Terms of Service', pcm: 'Terms' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's language preference
  useEffect(() => {
    const fetchLanguage = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('language_preference')
            .eq('id', user.id)
            .single();
          
          if (data?.language_preference) {
            setLanguageState(data.language_preference as Language);
          }
        } catch (error) {
          console.error('Error fetching language preference:', error);
        }
      }
      setIsLoading(false);
    };

    fetchLanguage();
  }, [user]);

  // Also check localStorage for non-logged-in users
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('taxforge-language');
      if (saved === 'en' || saved === 'pcm') {
        setLanguageState(saved);
      }
      setIsLoading(false);
    }
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('taxforge-language', lang);

    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ language_preference: lang })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
