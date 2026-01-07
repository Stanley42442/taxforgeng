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
  
  // Tax related
  'tax.calculate': { en: 'Calculate Tax', pcm: 'Calculate Tax' },
  'tax.totalTax': { en: 'Total Tax', pcm: 'Total Tax' },
  'tax.turnover': { en: 'Annual Turnover', pcm: 'Money Wey Enter For Year' },
  'tax.companyIncomeTax': { en: 'Company Income Tax', pcm: 'Company Tax' },
  'tax.personalIncomeTax': { en: 'Personal Income Tax', pcm: 'Personal Tax' },
  'tax.vat': { en: 'VAT', pcm: 'VAT' },
  'tax.deadline': { en: 'Tax Deadline', pcm: 'When E Suppose Enter' },
  
  // Business
  'business.name': { en: 'Business Name', pcm: 'Business Name' },
  'business.save': { en: 'Save Business', pcm: 'Keep This Business' },
  'business.myBusinesses': { en: 'My Businesses', pcm: 'My Business Dem' },
  'business.addNew': { en: 'Add New Business', pcm: 'Add New Business' },
  
  // Pricing
  'pricing.free': { en: 'Free', pcm: 'Free' },
  'pricing.starter': { en: 'Starter', pcm: 'Small Money' },
  'pricing.basic': { en: 'Basic', pcm: 'Normal' },
  'pricing.business': { en: 'Business', pcm: 'Business' },
  'pricing.perMonth': { en: '/month', pcm: '/month' },
  'pricing.upgrade': { en: 'Upgrade Now', pcm: 'Level Up Now' },
  
  // Messages
  'msg.noBusinesses': { en: 'No businesses saved yet', pcm: 'You never save any business' },
  'msg.taxCalculated': { en: 'Tax calculated successfully', pcm: 'We don calculate your tax finish' },
  'msg.saveSuccess': { en: 'Saved successfully', pcm: 'E don save' },
  'msg.loginRequired': { en: 'Please sign in to continue', pcm: 'Abeg login first' },
  
  // Referrals
  'referral.title': { en: 'Invite Friends, Earn Rewards', pcm: 'Bring Your Padi, Collect Bonus' },
  'referral.share': { en: 'Share your link', pcm: 'Share your link' },
  'referral.copied': { en: 'Link copied!', pcm: 'E don copy!' },
  
  // Calendar
  'calendar.taxCalendar': { en: 'Tax Calendar', pcm: 'Tax Calendar' },
  'calendar.upcoming': { en: 'Upcoming Deadlines', pcm: 'Deadline Wey Dey Come' },
  'calendar.daysLeft': { en: 'days left', pcm: 'days remain' },
  'calendar.today': { en: 'Today', pcm: 'Today' },
  'calendar.tomorrow': { en: 'Tomorrow', pcm: 'Tomorrow' },
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
