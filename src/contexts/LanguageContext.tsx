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
  'common.retry': { en: 'Try Again', pcm: 'Try Am Again' },
  'common.refresh': { en: 'Refresh', pcm: 'Reload Am' },
  'common.copy': { en: 'Copy', pcm: 'Copy Am' },
  'common.copied': { en: 'Copied!', pcm: 'E Don Copy!' },
  'common.download': { en: 'Download', pcm: 'Download Am' },
  'common.export': { en: 'Export', pcm: 'Carry Comot' },
  'common.import': { en: 'Import', pcm: 'Bring Enter' },
  
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
  'pricing.title': { en: 'Simple, Transparent Pricing', pcm: 'Price Wey Clear' },
  'pricing.subtitle': { en: 'Choose the plan that fits your business', pcm: 'Pick the plan wey good for your business' },
  'pricing.free': { en: 'Free', pcm: 'Free' },
  'pricing.starter': { en: 'Starter', pcm: 'Small Money' },
  'pricing.basic': { en: 'Basic', pcm: 'Normal' },
  'pricing.business': { en: 'Business', pcm: 'Business' },
  'pricing.perMonth': { en: '/month', pcm: '/month' },
  'pricing.upgrade': { en: 'Upgrade Now', pcm: 'Level Up Now' },
  'pricing.currentPlan': { en: 'Current Plan', pcm: 'Wetin You Dey Use Now' },
  'pricing.choosePlan': { en: 'Choose Plan', pcm: 'Pick Plan' },
  'pricing.features': { en: 'Features', pcm: 'Wetin E Get' },
  'pricing.mostPopular': { en: 'Most Popular', pcm: 'People Like Am Pass' },
  'pricing.enterprise': { en: 'Enterprise', pcm: 'Big Company' },
  'pricing.contactUs': { en: 'Contact Us', pcm: 'Reach Us' },
  
  // Messages & Toasts
  'msg.noBusinesses': { en: 'No businesses saved yet', pcm: 'You never save any business' },
  'msg.taxCalculated': { en: 'Tax calculated successfully', pcm: 'We don calculate your tax finish' },
  'msg.saveSuccess': { en: 'Saved successfully', pcm: 'E don save' },
  'msg.loginRequired': { en: 'Please sign in to continue', pcm: 'Abeg login first' },
  'msg.noData': { en: 'No data available', pcm: 'Nothing dey here' },
  'msg.tryAgain': { en: 'Please try again', pcm: 'Try am again' },
  'msg.comingSoon': { en: 'Coming Soon', pcm: 'E Dey Come' },
  'msg.upgradeRequired': { en: 'Upgrade required', pcm: 'You need to level up' },
  'msg.featureLocked': { en: 'This feature requires upgrade', pcm: 'You go upgrade before you fit use am' },
  
  // Toast notifications
  'toast.saveSuccess': { en: 'Saved successfully!', pcm: 'E don save finish!' },
  'toast.saveFailed': { en: 'Failed to save', pcm: 'E no gree save' },
  'toast.deleteSuccess': { en: 'Deleted successfully!', pcm: 'E don comot finish!' },
  'toast.deleteFailed': { en: 'Failed to delete', pcm: 'E no gree comot' },
  'toast.updateSuccess': { en: 'Updated successfully!', pcm: 'E don update!' },
  'toast.updateFailed': { en: 'Failed to update', pcm: 'E no gree update' },
  'toast.copySuccess': { en: 'Copied to clipboard!', pcm: 'E don copy!' },
  'toast.copyFailed': { en: 'Failed to copy', pcm: 'E no gree copy' },
  'toast.downloadSuccess': { en: 'Downloaded successfully!', pcm: 'E don download!' },
  'toast.downloadFailed': { en: 'Download failed', pcm: 'E no gree download' },
  'toast.uploadSuccess': { en: 'Uploaded successfully!', pcm: 'E don upload!' },
  'toast.uploadFailed': { en: 'Upload failed', pcm: 'E no gree upload' },
  'toast.loginSuccess': { en: 'Welcome back!', pcm: 'You don come back!' },
  'toast.loginFailed': { en: 'Login failed', pcm: 'E no gree make you enter' },
  'toast.logoutSuccess': { en: 'Logged out successfully', pcm: 'You don comot' },
  'toast.signupSuccess': { en: 'Account created!', pcm: 'Account don ready!' },
  'toast.signupFailed': { en: 'Signup failed', pcm: 'E no gree create account' },
  'toast.emailSent': { en: 'Email sent!', pcm: 'Email don go!' },
  'toast.emailFailed': { en: 'Failed to send email', pcm: 'Email no gree go' },
  'toast.verificationSent': { en: 'Verification code sent!', pcm: 'Code don enter your phone!' },
  'toast.verificationFailed': { en: 'Verification failed', pcm: 'E no gree verify' },
  'toast.paymentSuccess': { en: 'Payment successful!', pcm: 'Money don enter!' },
  'toast.paymentFailed': { en: 'Payment failed', pcm: 'Payment no work' },
  'toast.networkError': { en: 'Network error. Check your connection.', pcm: 'Network wahala. Check your data.' },
  'toast.serverError': { en: 'Server error. Please try again.', pcm: 'Server get problem. Try again.' },
  'toast.sessionExpired': { en: 'Session expired. Please login again.', pcm: 'Session don expire. Login again.' },
  'toast.upgradeSuccess': { en: 'Plan upgraded successfully!', pcm: 'You don level up!' },
  'toast.exportSuccess': { en: 'Export completed!', pcm: 'Export don finish!' },
  'toast.exportFailed': { en: 'Export failed', pcm: 'Export no work' },
  'toast.reminderSet': { en: 'Reminder set!', pcm: 'Reminder don set!' },
  'toast.reminderDeleted': { en: 'Reminder deleted', pcm: 'Reminder don comot' },
  'toast.businessSaved': { en: 'Business saved!', pcm: 'Business don save!' },
  'toast.businessDeleted': { en: 'Business deleted', pcm: 'Business don comot' },
  'toast.expenseAdded': { en: 'Expense added!', pcm: 'Expense don enter!' },
  'toast.expenseDeleted': { en: 'Expense deleted', pcm: 'Expense don comot' },
  'toast.limitReached': { en: 'Limit reached. Please upgrade.', pcm: 'You don reach limit. Level up first.' },
  'toast.invalidInput': { en: 'Please check your input', pcm: 'Check wetin you type' },
  'toast.formError': { en: 'Please fill all required fields', pcm: 'Fill everything wey dey important' },
  'toast.whatsappSent': { en: 'WhatsApp message sent!', pcm: 'WhatsApp don go!' },
  'toast.whatsappFailed': { en: 'Failed to send WhatsApp message', pcm: 'WhatsApp no gree send' },
  
  // Error messages
  'error.generic': { en: 'Something went wrong', pcm: 'Wahala don happen' },
  'error.notFound': { en: 'Not found', pcm: 'We no see am' },
  'error.unauthorized': { en: 'Unauthorized access', pcm: 'You no get permission' },
  'error.forbidden': { en: 'Access denied', pcm: 'Dem no allow you' },
  'error.timeout': { en: 'Request timed out', pcm: 'E take too long' },
  'error.offline': { en: 'You are offline', pcm: 'You no get network' },
  'error.invalidEmail': { en: 'Please enter a valid email', pcm: 'Email no correct' },
  'error.invalidPhone': { en: 'Please enter a valid phone number', pcm: 'Phone number no correct' },
  'error.invalidPassword': { en: 'Password must be at least 6 characters', pcm: 'Password too short, make am pass 6' },
  'error.passwordMismatch': { en: 'Passwords do not match', pcm: 'Password dem no match' },
  'error.requiredField': { en: 'This field is required', pcm: 'You must fill this one' },
  'error.maxLength': { en: 'Maximum length exceeded', pcm: 'E too long' },
  'error.minLength': { en: 'Too short', pcm: 'E too short' },
  'error.invalidAmount': { en: 'Please enter a valid amount', pcm: 'Put correct amount' },
  'error.negativeAmount': { en: 'Amount cannot be negative', pcm: 'Amount no fit be minus' },
  'error.fileTooLarge': { en: 'File is too large', pcm: 'File too big' },
  'error.invalidFileType': { en: 'Invalid file type', pcm: 'This type of file no good' },
  'error.uploadError': { en: 'Error uploading file', pcm: 'File no gree upload' },
  'error.accountLocked': { en: 'Account is locked. Try again later.', pcm: 'Account don lock. Try again later.' },
  'error.tooManyAttempts': { en: 'Too many attempts. Please wait.', pcm: 'You try am too many times. Wait small.' },
  
  // Referrals
  'referral.title': { en: 'Invite Friends, Earn Rewards', pcm: 'Bring Your Padi, Collect Bonus' },
  'referral.share': { en: 'Share your link', pcm: 'Share your link' },
  'referral.copied': { en: 'Link copied!', pcm: 'E don copy!' },
  'referral.invite': { en: 'Invite a Friend', pcm: 'Call Your Padi' },
  'referral.pending': { en: 'Pending', pcm: 'E Never Complete' },
  'referral.completed': { en: 'Completed', pcm: 'E Don Complete' },
  'referral.rewards': { en: 'Your Rewards', pcm: 'Your Bonus' },
  'referral.howItWorks': { en: 'How it works', pcm: 'How e dey work' },
  'referral.step1': { en: 'Share your unique link', pcm: 'Share your special link' },
  'referral.step2': { en: 'Friend signs up and subscribes', pcm: 'Your padi go register and pay' },
  'referral.step3': { en: 'You both get rewarded!', pcm: 'Una two go collect bonus!' },
  
  // Calendar
  'calendar.taxCalendar': { en: 'Tax Calendar', pcm: 'Tax Calendar' },
  'calendar.upcoming': { en: 'Upcoming Deadlines', pcm: 'Deadline Wey Dey Come' },
  'calendar.daysLeft': { en: 'days left', pcm: 'days remain' },
  'calendar.today': { en: 'Today', pcm: 'Today' },
  'calendar.tomorrow': { en: 'Tomorrow', pcm: 'Tomorrow' },
  'calendar.overdue': { en: 'Overdue', pcm: 'E Don Pass' },
  'calendar.dueToday': { en: 'Due Today', pcm: 'E Dey For Today' },
  'calendar.dueSoon': { en: 'Due Soon', pcm: 'E Go Soon Reach' },
  
  // Expenses
  'expense.title': { en: 'Expenses', pcm: 'Money Wey Comot' },
  'expense.addExpense': { en: 'Add Expense', pcm: 'Put New Expense' },
  'expense.category': { en: 'Category', pcm: 'Type' },
  'expense.amount': { en: 'Amount', pcm: 'How Much' },
  'expense.date': { en: 'Date', pcm: 'When' },
  'expense.description': { en: 'Description', pcm: 'Wetin E Be' },
  'expense.deductible': { en: 'Tax Deductible', pcm: 'Fit Reduce Tax' },
  'expense.totalExpenses': { en: 'Total Expenses', pcm: 'All Money Wey Comot' },
  'expense.income': { en: 'Income', pcm: 'Money Wey Enter' },
  'expense.noExpenses': { en: 'No expenses yet', pcm: 'You never add any expense' },
  
  // Dashboard
  'dashboard.title': { en: 'Dashboard', pcm: 'Dashboard' },
  'dashboard.welcome': { en: 'Welcome back', pcm: 'You do well' },
  'dashboard.overview': { en: 'Overview', pcm: 'Summary' },
  'dashboard.recentActivity': { en: 'Recent Activity', pcm: 'Wetin Happen Recently' },
  'dashboard.quickActions': { en: 'Quick Actions', pcm: 'Quick Moves' },
  'dashboard.taxSummary': { en: 'Tax Summary', pcm: 'Tax Summary' },
  'dashboard.totalTaxDue': { en: 'Total Tax Due', pcm: 'Total Tax Wey You Go Pay' },
  'dashboard.upcomingDeadlines': { en: 'Upcoming Deadlines', pcm: 'Deadline Wey Dey Come' },
  'dashboard.noDeadlines': { en: 'No upcoming deadlines', pcm: 'No deadline dey come' },
  
  // Settings
  'settings.title': { en: 'Settings', pcm: 'Settings' },
  'settings.profile': { en: 'Profile', pcm: 'Your Profile' },
  'settings.security': { en: 'Security', pcm: 'Security' },
  'settings.notifications': { en: 'Notifications', pcm: 'Notifications' },
  'settings.whatsapp': { en: 'WhatsApp Notifications', pcm: 'WhatsApp Alerts' },
  'settings.language': { en: 'Language', pcm: 'Language' },
  'settings.verifyNumber': { en: 'Verify Number', pcm: 'Verify Your Number' },
  'settings.darkMode': { en: 'Dark Mode', pcm: 'Dark Mode' },
  'settings.emailNotifications': { en: 'Email Notifications', pcm: 'Email Alerts' },
  
  // Auth
  'auth.signIn': { en: 'Sign In', pcm: 'Enter Inside' },
  'auth.signUp': { en: 'Sign Up', pcm: 'Create Account' },
  'auth.email': { en: 'Email', pcm: 'Email' },
  'auth.password': { en: 'Password', pcm: 'Password' },
  'auth.forgotPassword': { en: 'Forgot Password?', pcm: 'You Forget Password?' },
  'auth.noAccount': { en: "Don't have an account?", pcm: 'You no get account?' },
  'auth.hasAccount': { en: 'Already have an account?', pcm: 'You don get account?' },
  'auth.resetPassword': { en: 'Reset Password', pcm: 'Reset Password' },
  'auth.newPassword': { en: 'New Password', pcm: 'New Password' },
  'auth.confirmPassword': { en: 'Confirm Password', pcm: 'Confirm Password' },
  
  // Accountant Portal
  'accountant.title': { en: 'Accountant Portal', pcm: 'Accountant Corner' },
  'accountant.clients': { en: 'Client Businesses', pcm: 'Customer Business Dem' },
  'accountant.addClient': { en: 'Add Client', pcm: 'Add Customer' },
  'accountant.bulkActions': { en: 'Bulk Actions', pcm: 'Do Plenty At Once' },
  'accountant.exportAll': { en: 'Export All', pcm: 'Download Everything' },
  'accountant.totalClients': { en: 'Total Clients', pcm: 'All Your Customer Dem' },
  'accountant.pendingTasks': { en: 'Pending Tasks', pcm: 'Work Wey Never Finish' },
  
  // Success stories
  'stories.title': { en: 'Success Stories', pcm: 'People Wey Don Win' },
  'stories.readMore': { en: 'Read More', pcm: 'Read Am' },
  
  // Footer
  'footer.about': { en: 'About Us', pcm: 'About Us' },
  'footer.contact': { en: 'Contact', pcm: 'Reach Us' },
  'footer.privacy': { en: 'Privacy Policy', pcm: 'Privacy' },
  'footer.terms': { en: 'Terms of Service', pcm: 'Terms' },
  'footer.faq': { en: 'FAQ', pcm: 'Questions' },
  'footer.support': { en: 'Support', pcm: 'Help' },
  
  // Time & dates
  'time.today': { en: 'Today', pcm: 'Today' },
  'time.yesterday': { en: 'Yesterday', pcm: 'Yesterday' },
  'time.thisWeek': { en: 'This Week', pcm: 'This Week' },
  'time.thisMonth': { en: 'This Month', pcm: 'This Month' },
  'time.thisYear': { en: 'This Year', pcm: 'This Year' },
  'time.lastWeek': { en: 'Last Week', pcm: 'Last Week' },
  'time.lastMonth': { en: 'Last Month', pcm: 'Last Month' },
  'time.ago': { en: 'ago', pcm: 'wey don pass' },
};

// Helper function to get toast messages
export const getToastMessage = (key: string, language: Language): string => {
  const toastKey = `toast.${key}`;
  const translation = translations[toastKey];
  if (translation) {
    return translation[language] || translation.en || key;
  }
  return key;
};

// Helper function to get error messages
export const getErrorMessage = (key: string, language: Language): string => {
  const errorKey = `error.${key}`;
  const translation = translations[errorKey];
  if (translation) {
    return translation[language] || translation.en || key;
  }
  return key;
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
