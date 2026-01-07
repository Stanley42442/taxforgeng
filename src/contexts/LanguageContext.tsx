import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type Language = 'en' | 'pcm' | 'yo' | 'ha' | 'ig';

interface TranslationEntry {
  en: string;
  pcm: string;
  yo: string;
  ha: string;
  ig: string;
}

interface Translations {
  [key: string]: TranslationEntry;
}

// Core translations for all Nigerian languages
export const translations: Translations = {
  // Navigation
  'nav.dashboard': { 
    en: 'Dashboard', 
    pcm: 'Dashboard', 
    yo: 'Pánẹ́ẹ̀lì', 
    ha: 'Dashboard', 
    ig: 'Dashboard' 
  },
  'nav.getAdvice': { 
    en: 'Get Advice', 
    pcm: 'Get Advice', 
    yo: 'Gba Ìmọ̀ràn', 
    ha: 'Nemi Shawara', 
    ig: 'Nweta Ndụmọdụ' 
  },
  'nav.calculator': { 
    en: 'Calculator', 
    pcm: 'Calculator', 
    yo: 'Ẹ̀rọ ìṣirò', 
    ha: 'Na\'urar Ƙididdiga', 
    ig: 'Ngwa mgbako' 
  },
  'nav.pricing': { 
    en: 'Pricing', 
    pcm: 'How Much E Cost', 
    yo: 'Iye Owó', 
    ha: 'Farashin', 
    ig: 'Ọnụahịa' 
  },
  'nav.learn': { 
    en: 'Learn', 
    pcm: 'Learn Am', 
    yo: 'Kọ́ Ẹ̀kọ́', 
    ha: 'Koyi', 
    ig: 'Mụta' 
  },
  'nav.settings': { 
    en: 'Settings', 
    pcm: 'Settings', 
    yo: 'Ètò', 
    ha: 'Saituna', 
    ig: 'Ntọala' 
  },
  'nav.expenses': { 
    en: 'Expenses', 
    pcm: 'Money Wey Comot', 
    yo: 'Inawo', 
    ha: 'Kashe Kuɗi', 
    ig: 'Mmefu ego' 
  },
  'nav.reminders': { 
    en: 'Reminders', 
    pcm: 'Reminder Dem', 
    yo: 'Ìránṣọ́', 
    ha: 'Tunatarwa', 
    ig: 'Ncheta' 
  },
  'nav.referrals': { 
    en: 'Referrals', 
    pcm: 'Bring Your Padi', 
    yo: 'Pè Ọ̀rẹ́', 
    ha: 'Gayyato Abokai', 
    ig: 'Kpọọ Enyi' 
  },
  'nav.taxCalendar': { 
    en: 'Tax Calendar', 
    pcm: 'Tax Calendar', 
    yo: 'Kàlẹ́ndà Owó-orí', 
    ha: 'Kalandar Haraji', 
    ig: 'Kalenda Ụtụ' 
  },
  'nav.accountantPortal': { 
    en: 'Accountant Portal', 
    pcm: 'Accountant Corner', 
    yo: 'Ọ̀nà Àkàwò', 
    ha: 'Hanyar Akawo', 
    ig: 'Ọnụ ụzọ Akaụntant' 
  },
  
  // Common phrases
  'common.welcome': { 
    en: 'Welcome', 
    pcm: 'You do well', 
    yo: 'Ẹ káàbọ̀', 
    ha: 'Barka da zuwa', 
    ig: 'Nnọọ' 
  },
  'common.signIn': { 
    en: 'Sign In', 
    pcm: 'Enter Inside', 
    yo: 'Wọlé', 
    ha: 'Shiga', 
    ig: 'Banye' 
  },
  'common.signOut': { 
    en: 'Sign Out', 
    pcm: 'Comot', 
    yo: 'Jáde', 
    ha: 'Fita', 
    ig: 'Pụọ' 
  },
  'common.save': { 
    en: 'Save', 
    pcm: 'Keep Am', 
    yo: 'Fi Pamọ́', 
    ha: 'Ajiye', 
    ig: 'Chekwaa' 
  },
  'common.cancel': { 
    en: 'Cancel', 
    pcm: 'Leave Am', 
    yo: 'Fagilee', 
    ha: 'Soke', 
    ig: 'Kagbuo' 
  },
  'common.submit': { 
    en: 'Submit', 
    pcm: 'Send Am', 
    yo: 'Fi Ránṣẹ́', 
    ha: 'Aika', 
    ig: 'Nyefee' 
  },
  'common.loading': { 
    en: 'Loading...', 
    pcm: 'E dey load...', 
    yo: 'Ń gbéwọlé...', 
    ha: 'Ana lodawa...', 
    ig: 'Na-ebu...' 
  },
  'common.success': { 
    en: 'Success!', 
    pcm: 'E don work!', 
    yo: 'Ó ti ṣe!', 
    ha: 'An yi nasara!', 
    ig: 'Ọ gaara!' 
  },
  'common.error': { 
    en: 'Error', 
    pcm: 'Wahala', 
    yo: 'Àṣìṣe', 
    ha: 'Kuskure', 
    ig: 'Njehie' 
  },
  'common.next': { 
    en: 'Next', 
    pcm: 'Go Front', 
    yo: 'Tẹ̀lé', 
    ha: 'Na gaba', 
    ig: "N'ihu" 
  },
  'common.back': { 
    en: 'Back', 
    pcm: 'Go Back', 
    yo: 'Padà', 
    ha: 'Komawa', 
    ig: 'Laghachi' 
  },
  'common.close': { 
    en: 'Close', 
    pcm: 'Close Am', 
    yo: 'Pa', 
    ha: 'Rufe', 
    ig: 'Mechie' 
  },
  'common.delete': { 
    en: 'Delete', 
    pcm: 'Comot Am', 
    yo: 'Pa rẹ́', 
    ha: 'Share', 
    ig: 'Hichapụ' 
  },
  'common.edit': { 
    en: 'Edit', 
    pcm: 'Change Am', 
    yo: 'Ṣàtúnṣe', 
    ha: 'Gyara', 
    ig: 'Dezie' 
  },
  'common.add': { 
    en: 'Add', 
    pcm: 'Put Am', 
    yo: 'Fi Kún', 
    ha: 'Ƙara', 
    ig: 'Tinye' 
  },
  'common.search': { 
    en: 'Search', 
    pcm: 'Find Am', 
    yo: 'Wá', 
    ha: 'Bincika', 
    ig: 'Chọọ' 
  },
  'common.filter': { 
    en: 'Filter', 
    pcm: 'Sieve Am', 
    yo: 'Yọ̀', 
    ha: 'Tace', 
    ig: 'Nyocha' 
  },
  'common.all': { 
    en: 'All', 
    pcm: 'Everything', 
    yo: 'Gbogbo', 
    ha: 'Duka', 
    ig: 'Niile' 
  },
  'common.none': { 
    en: 'None', 
    pcm: 'Nothing', 
    yo: 'Kò sí', 
    ha: 'Babu', 
    ig: 'Ọ dịghị' 
  },
  'common.yes': { 
    en: 'Yes', 
    pcm: 'Yes o', 
    yo: 'Bẹ́ẹ̀ni', 
    ha: 'Eh', 
    ig: 'Ee' 
  },
  'common.no': { 
    en: 'No', 
    pcm: 'No o', 
    yo: 'Rárá', 
    ha: "A'a", 
    ig: 'Mba' 
  },
  'common.confirm': { 
    en: 'Confirm', 
    pcm: 'Agree Am', 
    yo: 'Jẹ́rìí', 
    ha: 'Tabbatar', 
    ig: 'Kwenye' 
  },
  'common.viewAll': { 
    en: 'View All', 
    pcm: 'See Everything', 
    yo: 'Wo Gbogbo', 
    ha: 'Duba Duka', 
    ig: 'Lee Niile' 
  },
  'common.learnMore': { 
    en: 'Learn More', 
    pcm: 'Hear More', 
    yo: 'Mọ̀ síi', 
    ha: 'Ƙara koyo', 
    ig: 'Mụtakwuo' 
  },
  'common.retry': { 
    en: 'Try Again', 
    pcm: 'Try Am Again', 
    yo: 'Gbìyànjú Lẹ́ẹ̀kan sí', 
    ha: 'Sake gwadawa', 
    ig: 'Nwalee ọzọ' 
  },
  'common.refresh': { 
    en: 'Refresh', 
    pcm: 'Reload Am', 
    yo: 'Mú Ṣe Tuntun', 
    ha: 'Sabunta', 
    ig: 'Kpọgharia' 
  },
  'common.copy': { 
    en: 'Copy', 
    pcm: 'Copy Am', 
    yo: 'Dá àdà', 
    ha: 'Kwafa', 
    ig: 'Detuo' 
  },
  'common.copied': { 
    en: 'Copied!', 
    pcm: 'E Don Copy!', 
    yo: 'Ti dá àdà!', 
    ha: 'An kwafa!', 
    ig: 'Edetuola!' 
  },
  'common.download': { 
    en: 'Download', 
    pcm: 'Download Am', 
    yo: 'Gbàmọ́lé', 
    ha: 'Sauke', 
    ig: 'Budata' 
  },
  'common.export': { 
    en: 'Export', 
    pcm: 'Carry Comot', 
    yo: 'Gbé Jáde', 
    ha: 'Fitar', 
    ig: 'Bupụ' 
  },
  'common.import': { 
    en: 'Import', 
    pcm: 'Bring Enter', 
    yo: 'Gbé Wọlé', 
    ha: 'Shigowa', 
    ig: 'Bubata' 
  },
  
  // Tax related
  'tax.calculate': { 
    en: 'Calculate Tax', 
    pcm: 'Calculate Tax', 
    yo: 'Ṣe ìṣirò owó-orí', 
    ha: 'Ƙididdige haraji', 
    ig: 'Gbakọọ ụtụ' 
  },
  'tax.totalTax': { 
    en: 'Total Tax', 
    pcm: 'Total Tax', 
    yo: 'Àpapọ̀ owó-orí', 
    ha: 'Jimlar haraji', 
    ig: 'Mkpokọta ụtụ' 
  },
  'tax.turnover': { 
    en: 'Annual Turnover', 
    pcm: 'Money Wey Enter For Year', 
    yo: 'Owó tí ó wọlé lọ́dún', 
    ha: 'Kuɗin shekara', 
    ig: 'Ego afọ' 
  },
  'tax.companyIncomeTax': { 
    en: 'Company Income Tax', 
    pcm: 'Company Tax', 
    yo: 'Owó-orí ilé-iṣẹ́', 
    ha: 'Harajin kamfani', 
    ig: 'Ụtụ ụlọ ọrụ' 
  },
  'tax.personalIncomeTax': { 
    en: 'Personal Income Tax', 
    pcm: 'Personal Tax', 
    yo: 'Owó-orí àkọọ́lẹ̀', 
    ha: 'Harajin mutum', 
    ig: 'Ụtụ onwe' 
  },
  'tax.vat': { 
    en: 'VAT', 
    pcm: 'VAT', 
    yo: 'VAT', 
    ha: 'VAT', 
    ig: 'VAT' 
  },
  'tax.deadline': { 
    en: 'Tax Deadline', 
    pcm: 'When E Suppose Enter', 
    yo: 'Àkókò ìpèsè owó-orí', 
    ha: "Lokacin biyan haraji", 
    ig: 'Oge ikwu ụtụ' 
  },
  'tax.estimatedTax': { 
    en: 'Estimated Tax', 
    pcm: 'Tax Wey We Calculate', 
    yo: 'Owó-orí tí a rò', 
    ha: 'Kiyasin haraji', 
    ig: 'Nkwurịta ụtụ' 
  },
  'tax.taxSavings': { 
    en: 'Tax Savings', 
    pcm: 'Tax Wey You Save', 
    yo: 'Owó-orí tí o fipamọ́', 
    ha: 'Ajiyar haraji', 
    ig: 'Nchekwa ụtụ' 
  },
  'tax.effectiveRate': { 
    en: 'Effective Rate', 
    pcm: 'Real Percentage', 
    yo: 'Ìwọ̀n gangan', 
    ha: 'Ainihin adadin', 
    ig: 'Ọnụọgụ n\'ezie' 
  },
  'tax.taxTips': { 
    en: 'Tax Tips', 
    pcm: 'Tax Advice', 
    yo: 'Ìmọ̀ràn owó-orí', 
    ha: 'Shawarar haraji', 
    ig: 'Ndụmọdụ ụtụ' 
  },
  
  // Business
  'business.name': { 
    en: 'Business Name', 
    pcm: 'Business Name', 
    yo: 'Orúkọ iṣẹ́', 
    ha: 'Sunan kasuwanci', 
    ig: 'Aha azụmaahịa' 
  },
  'business.save': { 
    en: 'Save Business', 
    pcm: 'Keep This Business', 
    yo: 'Fi iṣẹ́ pamọ́', 
    ha: 'Ajiye kasuwanci', 
    ig: 'Chekwaa azụmaahịa' 
  },
  'business.myBusinesses': { 
    en: 'My Businesses', 
    pcm: 'My Business Dem', 
    yo: 'Àwọn iṣẹ́ mi', 
    ha: 'Kasuwancina', 
    ig: 'Azụmaahịa m' 
  },
  'business.addNew': { 
    en: 'Add New Business', 
    pcm: 'Add New Business', 
    yo: 'Fi iṣẹ́ tuntun kún', 
    ha: 'Ƙara sabon kasuwanci', 
    ig: 'Tinye azụmaahịa ọhụrụ' 
  },
  'business.sector': { 
    en: 'Business Sector', 
    pcm: 'Type of Business', 
    yo: 'Ẹ̀ka iṣẹ́', 
    ha: 'Sashen kasuwanci', 
    ig: 'Ngalaba azụmaahịa' 
  },
  'business.turnover': { 
    en: 'Business Turnover', 
    pcm: 'Money Wey Enter', 
    yo: 'Owó tí ó wọlé', 
    ha: 'Kuɗin shiga', 
    ig: 'Ego batara' 
  },
  'business.entityType': { 
    en: 'Entity Type', 
    pcm: 'How Business Dey Registered', 
    yo: 'Irú ilé-iṣẹ́', 
    ha: 'Nau\'in kamfani', 
    ig: 'Ụdị ụlọ ọrụ' 
  },
  
  // Pricing
  'pricing.title': { 
    en: 'Simple, Transparent Pricing', 
    pcm: 'Price Wey Clear', 
    yo: 'Iye owó tó ṣe kedere', 
    ha: 'Farashin da ya bayyana', 
    ig: 'Ọnụahịa doro anya' 
  },
  'pricing.subtitle': { 
    en: 'Choose the plan that fits your business', 
    pcm: 'Pick the plan wey good for your business', 
    yo: 'Yan ètò tó bá iṣẹ́ rẹ mu', 
    ha: 'Zaɓi tsarin da ya dace da kasuwancinka', 
    ig: 'Họrọ atụmatụ dabara azụmaahịa gị' 
  },
  'pricing.free': { 
    en: 'Free', 
    pcm: 'Free', 
    yo: 'Ọ̀fẹ́', 
    ha: 'Kyauta', 
    ig: 'N\'efu' 
  },
  'pricing.starter': { 
    en: 'Starter', 
    pcm: 'Small Money', 
    yo: 'Ìbẹ̀rẹ̀', 
    ha: 'Farawa', 
    ig: 'Mmalite' 
  },
  'pricing.basic': { 
    en: 'Basic', 
    pcm: 'Normal', 
    yo: 'Ìpìlẹ̀', 
    ha: 'Na farko', 
    ig: 'Ndabere' 
  },
  'pricing.business': { 
    en: 'Business', 
    pcm: 'Business', 
    yo: 'Iṣẹ́', 
    ha: 'Kasuwanci', 
    ig: 'Azụmaahịa' 
  },
  'pricing.perMonth': { 
    en: '/month', 
    pcm: '/month', 
    yo: '/oṣù', 
    ha: '/wata', 
    ig: '/ọnwa' 
  },
  'pricing.upgrade': { 
    en: 'Upgrade Now', 
    pcm: 'Level Up Now', 
    yo: 'Gbéga Báyìí', 
    ha: 'Haɓaka Yanzu', 
    ig: 'Kwalite Ugbu a' 
  },
  'pricing.currentPlan': { 
    en: 'Current Plan', 
    pcm: 'Wetin You Dey Use Now', 
    yo: 'Ètò lọ́wọ́', 
    ha: 'Tsarin yanzu', 
    ig: 'Atụmatụ ugbu a' 
  },
  'pricing.choosePlan': { 
    en: 'Choose Plan', 
    pcm: 'Pick Plan', 
    yo: 'Yan Ètò', 
    ha: 'Zaɓi Tsari', 
    ig: 'Họrọ Atụmatụ' 
  },
  'pricing.features': { 
    en: 'Features', 
    pcm: 'Wetin E Get', 
    yo: 'Àwọn ẹ̀yà', 
    ha: 'Fasali', 
    ig: 'Atụmatụ' 
  },
  'pricing.mostPopular': { 
    en: 'Most Popular', 
    pcm: 'People Like Am Pass', 
    yo: 'Olókìkí jù', 
    ha: 'Mafi shahara', 
    ig: 'Kachasị ewu ewu' 
  },
  'pricing.enterprise': { 
    en: 'Enterprise', 
    pcm: 'Big Company', 
    yo: 'Ilé-iṣẹ́ ńlá', 
    ha: 'Babban kamfani', 
    ig: 'Nnukwu ụlọ ọrụ' 
  },
  'pricing.contactUs': { 
    en: 'Contact Us', 
    pcm: 'Reach Us', 
    yo: 'Kàn sí wa', 
    ha: 'Tuntuɓe mu', 
    ig: 'Kpọtụrụ anyị' 
  },
  
  // Messages & Toasts
  'msg.noBusinesses': { 
    en: 'No businesses saved yet', 
    pcm: 'You never save any business', 
    yo: 'Kò sí iṣẹ́ tí a fi pamọ́', 
    ha: 'Ba a ajiye kasuwanci ba tukuna', 
    ig: 'Ọ dịghị azụmaahịa echekwara' 
  },
  'msg.taxCalculated': { 
    en: 'Tax calculated successfully', 
    pcm: 'We don calculate your tax finish', 
    yo: 'A ti ṣe àṣeyọrí ìṣirò owó-orí', 
    ha: 'An yi nasarar ƙididdige haraji', 
    ig: 'Agbakọrọ ụtụ nke ọma' 
  },
  'msg.saveSuccess': { 
    en: 'Saved successfully', 
    pcm: 'E don save', 
    yo: 'A ti fi pamọ́', 
    ha: 'An ajiye', 
    ig: 'Echekwara' 
  },
  'msg.loginRequired': { 
    en: 'Please sign in to continue', 
    pcm: 'Abeg login first', 
    yo: 'Jọ̀wọ́ wọlé láti tẹ̀síwájú', 
    ha: 'Da fatan za a shiga don ci gaba', 
    ig: 'Biko banye ịga n\'ihu' 
  },
  'msg.noData': { 
    en: 'No data available', 
    pcm: 'Nothing dey here', 
    yo: 'Kò sí dátà', 
    ha: 'Babu bayani', 
    ig: 'Ọ dịghị data' 
  },
  'msg.tryAgain': { 
    en: 'Please try again', 
    pcm: 'Try am again', 
    yo: 'Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kan sí', 
    ha: 'Da fatan za a sake gwadawa', 
    ig: 'Biko nwaa ọzọ' 
  },
  'msg.comingSoon': { 
    en: 'Coming Soon', 
    pcm: 'E Dey Come', 
    yo: 'Ń bọ̀ láìpẹ́', 
    ha: 'Yana zuwa nan ba da jimawa ba', 
    ig: 'Na-abịa n\'oge na-adịghị anya' 
  },
  'msg.upgradeRequired': { 
    en: 'Upgrade required', 
    pcm: 'You need to level up', 
    yo: 'A nílò ìgbéga', 
    ha: 'Ana buƙatar haɓakawa', 
    ig: 'A chọrọ nkwalite' 
  },
  'msg.featureLocked': { 
    en: 'This feature requires upgrade', 
    pcm: 'You go upgrade before you fit use am', 
    yo: 'Ẹ̀yà yìí nílò ìgbéga', 
    ha: 'Wannan fasalin yana buƙatar haɓakawa', 
    ig: 'Atụmatụ a chọrọ nkwalite' 
  },
  
  // Toast notifications
  'toast.saveSuccess': { 
    en: 'Saved successfully!', 
    pcm: 'E don save finish!', 
    yo: 'A ti fi pamọ́!', 
    ha: 'An ajiye!', 
    ig: 'Echekwara!' 
  },
  'toast.saveFailed': { 
    en: 'Failed to save', 
    pcm: 'E no gree save', 
    yo: 'Fífípamọ́ kùnà', 
    ha: 'Ajiyewa ya kasa', 
    ig: 'Ọ dara nchekwa' 
  },
  'toast.deleteSuccess': { 
    en: 'Deleted successfully!', 
    pcm: 'E don comot finish!', 
    yo: 'A ti pa rẹ́!', 
    ha: 'An share!', 
    ig: 'Ehichapụla!' 
  },
  'toast.deleteFailed': { 
    en: 'Failed to delete', 
    pcm: 'E no gree comot', 
    yo: 'Pípa rẹ́ kùnà', 
    ha: 'Sharewa ya kasa', 
    ig: 'Ọ dara ihichapụ' 
  },
  'toast.updateSuccess': { 
    en: 'Updated successfully!', 
    pcm: 'E don update!', 
    yo: 'A ti ṣàtúnṣe!', 
    ha: 'An sabunta!', 
    ig: 'Emelitela!' 
  },
  'toast.updateFailed': { 
    en: 'Failed to update', 
    pcm: 'E no gree update', 
    yo: 'Àtúnṣe kùnà', 
    ha: 'Sabuntawa ya kasa', 
    ig: 'Ọ dara nmelite' 
  },
  'toast.copySuccess': { 
    en: 'Copied to clipboard!', 
    pcm: 'E don copy!', 
    yo: 'A ti dá àdà!', 
    ha: 'An kwafa!', 
    ig: 'Edetuola!' 
  },
  'toast.copyFailed': { 
    en: 'Failed to copy', 
    pcm: 'E no gree copy', 
    yo: 'Dídá àdà kùnà', 
    ha: 'Kwafawa ya kasa', 
    ig: 'Ọ dara ndetuo' 
  },
  'toast.downloadSuccess': { 
    en: 'Downloaded successfully!', 
    pcm: 'E don download!', 
    yo: 'A ti gbàmọ́lé!', 
    ha: 'An sauke!', 
    ig: 'Ebudatala!' 
  },
  'toast.downloadFailed': { 
    en: 'Download failed', 
    pcm: 'E no gree download', 
    yo: 'Gbígbàmọ́lé kùnà', 
    ha: 'Saukewa ya kasa', 
    ig: 'Ọ dara nbudata' 
  },
  'toast.uploadSuccess': { 
    en: 'Uploaded successfully!', 
    pcm: 'E don upload!', 
    yo: 'A ti gbé síorí ayélujára!', 
    ha: 'An ɗora!', 
    ig: 'Eburula!' 
  },
  'toast.uploadFailed': { 
    en: 'Upload failed', 
    pcm: 'E no gree upload', 
    yo: 'Gbígbé síorí ayélujára kùnà', 
    ha: 'Ɗorawa ya kasa', 
    ig: 'Ọ dara nburu' 
  },
  'toast.loginSuccess': { 
    en: 'Welcome back!', 
    pcm: 'You don come back!', 
    yo: 'Ẹ káàbọ̀ padà!', 
    ha: 'Barka da dawowa!', 
    ig: 'Nnọọ azụ!' 
  },
  'toast.loginFailed': { 
    en: 'Login failed', 
    pcm: 'E no gree make you enter', 
    yo: 'Wíwọlé kùnà', 
    ha: 'Shiga ya kasa', 
    ig: 'Ọ dara ịbanye' 
  },
  'toast.logoutSuccess': { 
    en: 'Logged out successfully', 
    pcm: 'You don comot', 
    yo: 'O ti jáde', 
    ha: 'Ka fita', 
    ig: 'Ị pụọla' 
  },
  'toast.signupSuccess': { 
    en: 'Account created!', 
    pcm: 'Account don ready!', 
    yo: 'A ti ṣẹ̀dá àkàùntì!', 
    ha: 'An ƙirƙiri asusu!', 
    ig: 'Emepụtala akaụntụ!' 
  },
  'toast.signupFailed': { 
    en: 'Signup failed', 
    pcm: 'E no gree create account', 
    yo: 'Ìfọwọ́sí kùnà', 
    ha: 'Rajista ya kasa', 
    ig: 'Ọ dara ndebanye aha' 
  },
  'toast.emailSent': { 
    en: 'Email sent!', 
    pcm: 'Email don go!', 
    yo: 'A ti fi ímeèlì ránṣẹ́!', 
    ha: 'An aika imel!', 
    ig: 'Ezigara email!' 
  },
  'toast.emailFailed': { 
    en: 'Failed to send email', 
    pcm: 'Email no gree go', 
    yo: 'Fífi ímeèlì ránṣẹ́ kùnà', 
    ha: 'Aika imel ya kasa', 
    ig: 'Ọ dara izipu email' 
  },
  'toast.verificationSent': { 
    en: 'Verification code sent!', 
    pcm: 'Code don enter your phone!', 
    yo: 'A ti fi kóòdù ìjẹ́rìísí ránṣẹ́!', 
    ha: 'An aika lambar tabbatarwa!', 
    ig: 'Ezigara koodu nkwenye!' 
  },
  'toast.verificationFailed': { 
    en: 'Verification failed', 
    pcm: 'E no gree verify', 
    yo: 'Ìjẹ́rìísí kùnà', 
    ha: 'Tabbatarwa ya kasa', 
    ig: 'Ọ dara nkwenye' 
  },
  'toast.paymentSuccess': { 
    en: 'Payment successful!', 
    pcm: 'Money don enter!', 
    yo: 'Ìsanwó ti ṣàṣeyọrí!', 
    ha: 'Biyan kuɗi ya yi nasara!', 
    ig: 'Ịkwụ ụgwọ gara nke ọma!' 
  },
  'toast.paymentFailed': { 
    en: 'Payment failed', 
    pcm: 'Payment no work', 
    yo: 'Ìsanwó kùnà', 
    ha: 'Biyan kuɗi ya kasa', 
    ig: 'Ọ dara ịkwụ ụgwọ' 
  },
  'toast.networkError': { 
    en: 'Network error. Check your connection.', 
    pcm: 'Network wahala. Check your data.', 
    yo: 'Àṣìṣe nẹ́tíwọ̀ọ̀kì. Ṣàyẹ̀wò ìsopọ̀ rẹ.', 
    ha: 'Matsalar hanyar sadarwa. Duba haɗin ku.', 
    ig: 'Njehie netwọk. Lelee njikọ gị.' 
  },
  'toast.serverError': { 
    en: 'Server error. Please try again.', 
    pcm: 'Server get problem. Try again.', 
    yo: 'Àṣìṣe sáfà. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kan sí.', 
    ha: 'Matsalar sabar. Da fatan za a sake gwadawa.', 
    ig: 'Njehie sava. Biko nwaa ọzọ.' 
  },
  'toast.sessionExpired': { 
    en: 'Session expired. Please login again.', 
    pcm: 'Session don expire. Login again.', 
    yo: 'Àkókò ti parí. Jọ̀wọ́ wọlé lẹ́ẹ̀kan sí.', 
    ha: 'Zaman ya ƙare. Da fatan za a sake shiga.', 
    ig: 'Oge ọgbakọ gwụrụ. Biko banye ọzọ.' 
  },
  'toast.upgradeSuccess': { 
    en: 'Plan upgraded successfully!', 
    pcm: 'You don level up!', 
    yo: 'A ti gbéga ètò!', 
    ha: 'An haɓaka tsari!', 
    ig: 'Ekwalitela atụmatụ!' 
  },
  'toast.exportSuccess': { 
    en: 'Export completed!', 
    pcm: 'Export don finish!', 
    yo: 'Gbígbé jáde ti parí!', 
    ha: 'Fitarwa ta cika!', 
    ig: 'Mbupụ gwụchara!' 
  },
  'toast.exportFailed': { 
    en: 'Export failed', 
    pcm: 'Export no work', 
    yo: 'Gbígbé jáde kùnà', 
    ha: 'Fitarwa ya kasa', 
    ig: 'Ọ dara mbupụ' 
  },
  'toast.reminderSet': { 
    en: 'Reminder set!', 
    pcm: 'Reminder don set!', 
    yo: 'A ti ṣètò ìránṣọ́!', 
    ha: 'An saita tunatarwa!', 
    ig: 'Edoziri ncheta!' 
  },
  'toast.reminderDeleted': { 
    en: 'Reminder deleted', 
    pcm: 'Reminder don comot', 
    yo: 'A ti pa ìránṣọ́ rẹ́', 
    ha: 'An share tunatarwa', 
    ig: 'Ehichapụla ncheta' 
  },
  'toast.businessSaved': { 
    en: 'Business saved!', 
    pcm: 'Business don save!', 
    yo: 'A ti fi iṣẹ́ pamọ́!', 
    ha: 'An ajiye kasuwanci!', 
    ig: 'Echekwara azụmaahịa!' 
  },
  'toast.businessDeleted': { 
    en: 'Business deleted', 
    pcm: 'Business don comot', 
    yo: 'A ti pa iṣẹ́ rẹ́', 
    ha: 'An share kasuwanci', 
    ig: 'Ehichapụla azụmaahịa' 
  },
  'toast.expenseAdded': { 
    en: 'Expense added!', 
    pcm: 'Expense don enter!', 
    yo: 'A ti fi inawo kún!', 
    ha: 'An ƙara kashe kuɗi!', 
    ig: 'Etinyela mmefu!' 
  },
  'toast.expenseDeleted': { 
    en: 'Expense deleted', 
    pcm: 'Expense don comot', 
    yo: 'A ti pa inawo rẹ́', 
    ha: 'An share kashe kuɗi', 
    ig: 'Ehichapụla mmefu' 
  },
  'toast.limitReached': { 
    en: 'Limit reached. Please upgrade.', 
    pcm: 'You don reach limit. Level up first.', 
    yo: 'O ti dé ìwọ̀n. Jọ̀wọ́ gbéga.', 
    ha: 'An kai iyaka. Da fatan za a haɓaka.', 
    ig: 'Eruola oke. Biko kwalite.' 
  },
  'toast.invalidInput': { 
    en: 'Please check your input', 
    pcm: 'Check wetin you type', 
    yo: 'Jọ̀wọ́ ṣàyẹ̀wò ohun tí o tẹ̀', 
    ha: 'Da fatan za a duba shigarku', 
    ig: 'Biko lelee ihe ị tinye' 
  },
  'toast.formError': { 
    en: 'Please fill all required fields', 
    pcm: 'Fill everything wey dey important', 
    yo: 'Jọ̀wọ́ kún gbogbo ààyè tó ṣe pàtàkì', 
    ha: 'Da fatan za a cika duk filayen da ake buƙata', 
    ig: 'Biko dejupụta mpaghara niile achọrọ' 
  },
  'toast.whatsappSent': { 
    en: 'WhatsApp message sent!', 
    pcm: 'WhatsApp don go!', 
    yo: 'A ti fi ifiranṣẹ́ WhatsApp ránṣẹ́!', 
    ha: 'An aika saƙon WhatsApp!', 
    ig: 'Ezigara ozi WhatsApp!' 
  },
  'toast.whatsappFailed': { 
    en: 'Failed to send WhatsApp message', 
    pcm: 'WhatsApp no gree send', 
    yo: 'Fífi ifiranṣẹ́ WhatsApp ránṣẹ́ kùnà', 
    ha: 'Aika saƙon WhatsApp ya kasa', 
    ig: 'Ọ dara izipu ozi WhatsApp' 
  },
  
  // Error messages
  'error.generic': { 
    en: 'Something went wrong', 
    pcm: 'Wahala don happen', 
    yo: 'Nǹkan kan ṣẹlẹ̀', 
    ha: 'Wani abu ya faru', 
    ig: 'Ihe mere' 
  },
  'error.notFound': { 
    en: 'Not found', 
    pcm: 'We no see am', 
    yo: 'A kò rí i', 
    ha: 'Ba a samu ba', 
    ig: 'Ahụghị ya' 
  },
  'error.unauthorized': { 
    en: 'Unauthorized access', 
    pcm: 'You no get permission', 
    yo: 'Ìwọ̀lé láìláṣẹ', 
    ha: 'Shiga marar izini', 
    ig: 'Ịbanye na-enweghị ikike' 
  },
  'error.forbidden': { 
    en: 'Access denied', 
    pcm: 'Dem no allow you', 
    yo: 'A kọ̀ ìwọ̀lé', 
    ha: 'An hana shiga', 
    ig: 'Agọnarị ịbanye' 
  },
  'error.timeout': { 
    en: 'Request timed out', 
    pcm: 'E take too long', 
    yo: 'Àkókò ìbéèrè ti parí', 
    ha: 'Buƙatar ta ƙare lokaci', 
    ig: 'Arịrịọ oge gwụrụ' 
  },
  'error.offline': { 
    en: 'You are offline', 
    pcm: 'You no get network', 
    yo: 'O wà lóffláìnì', 
    ha: 'Ba ku da haɗin kai', 
    ig: 'Ị nọ n\'ọflaịn' 
  },
  'error.invalidEmail': { 
    en: 'Please enter a valid email', 
    pcm: 'Email no correct', 
    yo: 'Jọ̀wọ́ tẹ ímeèlì tó tọ́', 
    ha: 'Da fatan za a shigar da imel mai inganci', 
    ig: 'Biko tinye email ziri ezi' 
  },
  'error.invalidPhone': { 
    en: 'Please enter a valid phone number', 
    pcm: 'Phone number no correct', 
    yo: 'Jọ̀wọ́ tẹ nọ́mbà fóònù tó tọ́', 
    ha: 'Da fatan za a shigar da lambar waya mai inganci', 
    ig: 'Biko tinye nọmba ekwentị ziri ezi' 
  },
  'error.invalidPassword': { 
    en: 'Password must be at least 6 characters', 
    pcm: 'Password too short, make am pass 6', 
    yo: 'Ọ̀rọ̀ aṣínà gbọ́dọ̀ jẹ́ kéré lẹ́tà 6', 
    ha: 'Kalmar wucewa dole ta kasance aƙalla haruffa 6', 
    ig: 'Okwuntughe ga-abụrịrị mkpụrụedemede 6 ma ọ dịkarịa ala' 
  },
  'error.passwordMismatch': { 
    en: 'Passwords do not match', 
    pcm: 'Password dem no match', 
    yo: 'Àwọn ọ̀rọ̀ aṣínà kò bára mu', 
    ha: 'Kalmomin wucewa ba su dace ba', 
    ig: 'Okwuntughe adịghị adakọ' 
  },
  'error.requiredField': { 
    en: 'This field is required', 
    pcm: 'You must fill this one', 
    yo: 'A nílò ààyè yìí', 
    ha: 'Ana buƙatar wannan filin', 
    ig: 'A chọrọ mpaghara a' 
  },
  'error.maxLength': { 
    en: 'Maximum length exceeded', 
    pcm: 'E too long', 
    yo: 'O ti kọjá ìwọ̀n gíga jù', 
    ha: 'An wuce tsayin da aka fi so', 
    ig: 'Ogologo kacha ukwuu agafeela' 
  },
  'error.minLength': { 
    en: 'Too short', 
    pcm: 'E too short', 
    yo: 'Ó kúrú jù', 
    ha: 'Gajere sosai', 
    ig: 'Dị mkpụmkpụ' 
  },
  'error.invalidAmount': { 
    en: 'Please enter a valid amount', 
    pcm: 'Put correct amount', 
    yo: 'Jọ̀wọ́ tẹ iye tó tọ́', 
    ha: 'Da fatan za a shigar da adadin da ya dace', 
    ig: 'Biko tinye ego ziri ezi' 
  },
  'error.negativeAmount': { 
    en: 'Amount cannot be negative', 
    pcm: 'Amount no fit be minus', 
    yo: 'Iye kò lè jẹ́ odi', 
    ha: 'Adadin ba zai iya zama mara kyau ba', 
    ig: 'Ego enweghị ike ịbụ ọdịmma' 
  },
  'error.fileTooLarge': { 
    en: 'File is too large', 
    pcm: 'File too big', 
    yo: 'Fáìlì tóbi jù', 
    ha: 'Fayil din ya yi girma', 
    ig: 'Faịlụ buru ibu' 
  },
  'error.invalidFileType': { 
    en: 'Invalid file type', 
    pcm: 'This type of file no good', 
    yo: 'Irú fáìlì tí kò tọ́', 
    ha: 'Nau\'in fayil mara inganci', 
    ig: 'Ụdị faịlụ anaghị adị mma' 
  },
  'error.uploadError': { 
    en: 'Error uploading file', 
    pcm: 'File no gree upload', 
    yo: 'Àṣìṣe nínú gbígbé fáìlì sókè', 
    ha: 'Kuskure wajen ɗora fayil', 
    ig: 'Njehie n\'iburu faịlụ' 
  },
  'error.accountLocked': { 
    en: 'Account is locked. Try again later.', 
    pcm: 'Account don lock. Try again later.', 
    yo: 'A ti ti àkàùntì. Gbìyànjú lẹ́ẹ̀kan sí níìjà.', 
    ha: 'An kulle asusu. Sake gwadawa daga baya.', 
    ig: 'Akpọchiri akaụntụ. Nwaa ọzọ ma emechaa.' 
  },
  'error.tooManyAttempts': { 
    en: 'Too many attempts. Please wait.', 
    pcm: 'You try am too many times. Wait small.', 
    yo: 'Ìgbìyànjú púpọ̀. Jọ̀wọ́ dúró.', 
    ha: 'Ƙoƙari da yawa. Da fatan za a jira.', 
    ig: 'Ọtụtụ mbọ. Biko chere.' 
  },
  
  // Referrals
  'referral.title': { 
    en: 'Invite Friends, Earn Rewards', 
    pcm: 'Bring Your Padi, Collect Bonus', 
    yo: 'Pe Àwọn Ọ̀rẹ́, Gba Ẹ̀bùn', 
    ha: 'Gayyaci Abokai, Sami Lada', 
    ig: 'Kpọọ Ndị Enyi, Nweta Ụgwọ' 
  },
  'referral.share': { 
    en: 'Share your link', 
    pcm: 'Share your link', 
    yo: 'Pin ìjápọ̀ rẹ', 
    ha: 'Raba hanyar haɗin ku', 
    ig: 'Kekọrịta njikọ gị' 
  },
  'referral.copied': { 
    en: 'Link copied!', 
    pcm: 'E don copy!', 
    yo: 'A ti dá ìjápọ̀ àdà!', 
    ha: 'An kwafa hanyar haɗi!', 
    ig: 'Edetuola njikọ!' 
  },
  'referral.invite': { 
    en: 'Invite a Friend', 
    pcm: 'Call Your Padi', 
    yo: 'Pe Ọ̀rẹ́ Kan', 
    ha: 'Gayyaci Aboki', 
    ig: 'Kpọọ Enyi' 
  },
  'referral.pending': { 
    en: 'Pending', 
    pcm: 'E Never Complete', 
    yo: 'Ń dúró', 
    ha: 'Ana jira', 
    ig: 'Na-eche' 
  },
  'referral.completed': { 
    en: 'Completed', 
    pcm: 'E Don Complete', 
    yo: 'Ti parí', 
    ha: 'An gama', 
    ig: 'Emechara' 
  },
  'referral.rewards': { 
    en: 'Your Rewards', 
    pcm: 'Your Bonus', 
    yo: 'Àwọn Ẹ̀bùn Rẹ', 
    ha: 'Ladarka', 
    ig: 'Ụgwọ ọrụ gị' 
  },
  'referral.howItWorks': { 
    en: 'How it works', 
    pcm: 'How e dey work', 
    yo: 'Bí ó ṣe ń ṣiṣẹ́', 
    ha: 'Yadda yake aiki', 
    ig: 'Otu ọ si arụ ọrụ' 
  },
  'referral.step1': { 
    en: 'Share your unique link', 
    pcm: 'Share your special link', 
    yo: 'Pin ìjápọ̀ àkànṣe rẹ', 
    ha: 'Raba hanyar haɗin ku na musamman', 
    ig: 'Kekọrịta njikọ pụrụ iche gị' 
  },
  'referral.step2': { 
    en: 'Friend signs up and subscribes', 
    pcm: 'Your padi go register and pay', 
    yo: 'Ọ̀rẹ́ forúkọ sílẹ̀ ó sì san owó', 
    ha: 'Aboki ya yi rajista kuma ya biya', 
    ig: 'Enyi debanye aha ma kwụọ ụgwọ' 
  },
  'referral.step3': { 
    en: 'You both get rewarded!', 
    pcm: 'Una two go collect bonus!', 
    yo: 'Ẹ méjèèjì máa gba ẹ̀bùn!', 
    ha: 'Duka biyun za ku sami lada!', 
    ig: 'Unu abụọ ga-enweta ụgwọ!' 
  },
  
  // Calendar
  'calendar.taxCalendar': { 
    en: 'Tax Calendar', 
    pcm: 'Tax Calendar', 
    yo: 'Kàlẹ́ndà Owó-orí', 
    ha: 'Kalandar Haraji', 
    ig: 'Kalenda Ụtụ' 
  },
  'calendar.upcoming': { 
    en: 'Upcoming Deadlines', 
    pcm: 'Deadline Wey Dey Come', 
    yo: 'Àwọn Àkókò Ìparí Tó Ń Bọ̀', 
    ha: 'Lokutan ƙarshe masu zuwa', 
    ig: 'Oge njedebe na-abịa' 
  },
  'calendar.daysLeft': { 
    en: 'days left', 
    pcm: 'days remain', 
    yo: 'ọjọ́ kù', 
    ha: 'kwanaki sun rage', 
    ig: 'ụbọchị fọdụrụ' 
  },
  'calendar.today': { 
    en: 'Today', 
    pcm: 'Today', 
    yo: 'Lónìí', 
    ha: 'Yau', 
    ig: 'Taa' 
  },
  'calendar.tomorrow': { 
    en: 'Tomorrow', 
    pcm: 'Tomorrow', 
    yo: 'Lọ́la', 
    ha: 'Gobe', 
    ig: 'Echi' 
  },
  'calendar.overdue': { 
    en: 'Overdue', 
    pcm: 'E Don Pass', 
    yo: 'Ti kọjá àkókò', 
    ha: 'An wuce lokaci', 
    ig: 'Agafeela oge' 
  },
  'calendar.dueToday': { 
    en: 'Due Today', 
    pcm: 'E Dey For Today', 
    yo: 'Ó yẹ kí ó jẹ́ lónìí', 
    ha: 'Ya kamata yau', 
    ig: 'Ọ ga-abụ taa' 
  },
  'calendar.dueSoon': { 
    en: 'Due Soon', 
    pcm: 'E Go Soon Reach', 
    yo: 'Ń bọ̀ láìpẹ́', 
    ha: 'Zai yi nan ba da jimawa ba', 
    ig: 'Ọ ga-abịa n\'oge na-adịghị anya' 
  },
  
  // Expenses
  'expense.title': { 
    en: 'Expenses', 
    pcm: 'Money Wey Comot', 
    yo: 'Inawo', 
    ha: 'Kashe Kuɗi', 
    ig: 'Mmefu ego' 
  },
  'expense.addExpense': { 
    en: 'Add Expense', 
    pcm: 'Put New Expense', 
    yo: 'Fi Inawo Kún', 
    ha: 'Ƙara Kashe Kuɗi', 
    ig: 'Tinye Mmefu' 
  },
  'expense.category': { 
    en: 'Category', 
    pcm: 'Type', 
    yo: 'Ẹ̀ka', 
    ha: 'Nau\'i', 
    ig: 'Ụdị' 
  },
  'expense.amount': { 
    en: 'Amount', 
    pcm: 'How Much', 
    yo: 'Iye', 
    ha: 'Adadi', 
    ig: 'Ego' 
  },
  'expense.date': { 
    en: 'Date', 
    pcm: 'When', 
    yo: 'Ọjọ́', 
    ha: 'Kwanan wata', 
    ig: 'Ụbọchị' 
  },
  'expense.description': { 
    en: 'Description', 
    pcm: 'Wetin E Be', 
    yo: 'Àlàyé', 
    ha: 'Bayani', 
    ig: 'Nkọwa' 
  },
  'expense.deductible': { 
    en: 'Tax Deductible', 
    pcm: 'Fit Reduce Tax', 
    yo: 'Ó lè yọ kúrò nínú owó-orí', 
    ha: 'Ana iya cire shi daga haraji', 
    ig: 'Nwere ike iwepụ ya na ụtụ' 
  },
  'expense.totalExpenses': { 
    en: 'Total Expenses', 
    pcm: 'All Money Wey Comot', 
    yo: 'Àpapọ̀ Inawo', 
    ha: 'Jimlar Kashe Kuɗi', 
    ig: 'Mkpokọta Mmefu' 
  },
  'expense.income': { 
    en: 'Income', 
    pcm: 'Money Wey Enter', 
    yo: 'Owó-wíwọlé', 
    ha: 'Kuɗin shiga', 
    ig: 'Ego na-abata' 
  },
  'expense.noExpenses': { 
    en: 'No expenses yet', 
    pcm: 'You never add any expense', 
    yo: 'Kò sí inawo síbẹ̀', 
    ha: 'Babu kashe kuɗi har yanzu', 
    ig: 'Ọ dịghị mmefu ka ugbu a' 
  },
  
  // Dashboard
  'dashboard.title': { 
    en: 'Dashboard', 
    pcm: 'Dashboard', 
    yo: 'Pánẹ́ẹ̀lì', 
    ha: 'Dashboard', 
    ig: 'Dashboard' 
  },
  'dashboard.welcome': { 
    en: 'Welcome back', 
    pcm: 'You do well', 
    yo: 'Ẹ káàbọ̀ padà', 
    ha: 'Barka da dawowa', 
    ig: 'Nnọọ azụ' 
  },
  'dashboard.overview': { 
    en: 'Overview', 
    pcm: 'Summary', 
    yo: 'Àkópọ̀', 
    ha: 'Taƙaitawa', 
    ig: 'Nchịkọta' 
  },
  'dashboard.recentActivity': { 
    en: 'Recent Activity', 
    pcm: 'Wetin Happen Recently', 
    yo: 'Ìṣẹ̀lẹ̀ Láìpẹ́', 
    ha: 'Ayyukan kwanan nan', 
    ig: 'Ihe mere n\'oge na-adịghị anya' 
  },
  'dashboard.quickActions': { 
    en: 'Quick Actions', 
    pcm: 'Quick Moves', 
    yo: 'Ìgbésẹ̀ Kíákíá', 
    ha: 'Ayyuka masu sauri', 
    ig: 'Ihe omume ngwa ngwa' 
  },
  'dashboard.taxSummary': { 
    en: 'Tax Summary', 
    pcm: 'Tax Summary', 
    yo: 'Àkópọ̀ Owó-orí', 
    ha: 'Taƙaitawar Haraji', 
    ig: 'Nchịkọta Ụtụ' 
  },
  'dashboard.totalTaxDue': { 
    en: 'Total Tax Due', 
    pcm: 'Total Tax Wey You Go Pay', 
    yo: 'Àpapọ̀ Owó-orí tó Yẹ kó San', 
    ha: 'Jimlar Harajin da za a biya', 
    ig: 'Mkpokọta Ụtụ A Ga-akwụ' 
  },
  'dashboard.upcomingDeadlines': { 
    en: 'Upcoming Deadlines', 
    pcm: 'Deadline Wey Dey Come', 
    yo: 'Àwọn Àkókò Ìparí Tó Ń Bọ̀', 
    ha: 'Lokutan ƙarshe masu zuwa', 
    ig: 'Oge njedebe na-abịa' 
  },
  'dashboard.noDeadlines': { 
    en: 'No upcoming deadlines', 
    pcm: 'No deadline dey come', 
    yo: 'Kò sí àkókò ìparí tó ń bọ̀', 
    ha: 'Babu lokutan ƙarshe masu zuwa', 
    ig: 'Ọ dịghị oge njedebe na-abịa' 
  },
  
  // Settings
  'settings.title': { 
    en: 'Settings', 
    pcm: 'Settings', 
    yo: 'Ètò', 
    ha: 'Saituna', 
    ig: 'Ntọala' 
  },
  'settings.profile': { 
    en: 'Profile', 
    pcm: 'Your Profile', 
    yo: 'Ìdánimọ̀', 
    ha: 'Bayanan kai', 
    ig: 'Profaịlụ' 
  },
  'settings.security': { 
    en: 'Security', 
    pcm: 'Security', 
    yo: 'Ààbò', 
    ha: 'Tsaro', 
    ig: 'Nchekwa' 
  },
  'settings.notifications': { 
    en: 'Notifications', 
    pcm: 'Notifications', 
    yo: 'Ìfitọ́nilétí', 
    ha: 'Sanarwa', 
    ig: 'Ọkwa' 
  },
  'settings.whatsapp': { 
    en: 'WhatsApp Notifications', 
    pcm: 'WhatsApp Alerts', 
    yo: 'Ìfitọ́nilétí WhatsApp', 
    ha: 'Sanarwar WhatsApp', 
    ig: 'Ọkwa WhatsApp' 
  },
  'settings.language': { 
    en: 'Language', 
    pcm: 'Language', 
    yo: 'Èdè', 
    ha: 'Harshe', 
    ig: 'Asụsụ' 
  },
  'settings.verifyNumber': { 
    en: 'Verify Number', 
    pcm: 'Verify Your Number', 
    yo: 'Ṣàyẹ̀wò Nọ́mbà', 
    ha: 'Tabbatar da Lamba', 
    ig: 'Kwenye Nọmba' 
  },
  'settings.darkMode': { 
    en: 'Dark Mode', 
    pcm: 'Dark Mode', 
    yo: 'Ipò Dúdú', 
    ha: 'Yanayin duhu', 
    ig: 'Ọnọdụ oji' 
  },
  'settings.emailNotifications': { 
    en: 'Email Notifications', 
    pcm: 'Email Alerts', 
    yo: 'Ìfitọ́nilétí Ímeèlì', 
    ha: 'Sanarwar Imel', 
    ig: 'Ọkwa Email' 
  },
  
  // Auth
  'auth.signIn': { 
    en: 'Sign In', 
    pcm: 'Enter Inside', 
    yo: 'Wọlé', 
    ha: 'Shiga', 
    ig: 'Banye' 
  },
  'auth.signUp': { 
    en: 'Sign Up', 
    pcm: 'Create Account', 
    yo: 'Forúkọ sílẹ̀', 
    ha: 'Yi rajista', 
    ig: 'Debanye aha' 
  },
  'auth.email': { 
    en: 'Email', 
    pcm: 'Email', 
    yo: 'Ímeèlì', 
    ha: 'Imel', 
    ig: 'Email' 
  },
  'auth.password': { 
    en: 'Password', 
    pcm: 'Password', 
    yo: 'Ọ̀rọ̀ aṣínà', 
    ha: 'Kalmar wucewa', 
    ig: 'Okwuntughe' 
  },
  'auth.forgotPassword': { 
    en: 'Forgot Password?', 
    pcm: 'You Forget Password?', 
    yo: 'Ṣé o gbàgbé ọ̀rọ̀ aṣínà?', 
    ha: 'Kun manta kalmar wucewa?', 
    ig: 'Ị chefuru okwuntughe?' 
  },
  'auth.noAccount': { 
    en: "Don't have an account?", 
    pcm: 'You no get account?', 
    yo: 'Ṣé o kò ní àkàùntì?', 
    ha: 'Ba ku da asusu?', 
    ig: 'Ọ nweghị akaụntụ?' 
  },
  'auth.hasAccount': { 
    en: 'Already have an account?', 
    pcm: 'You don get account?', 
    yo: 'Ṣé o ti ní àkàùntì?', 
    ha: 'Kun riga kun sami asusu?', 
    ig: 'Ị nwere akaụntụ?' 
  },
  'auth.resetPassword': { 
    en: 'Reset Password', 
    pcm: 'Reset Password', 
    yo: 'Tún ọ̀rọ̀ aṣínà ṣe', 
    ha: 'Sake saita kalmar wucewa', 
    ig: 'Tọgharia okwuntughe' 
  },
  'auth.newPassword': { 
    en: 'New Password', 
    pcm: 'New Password', 
    yo: 'Ọ̀rọ̀ aṣínà tuntun', 
    ha: 'Sabuwar kalmar wucewa', 
    ig: 'Okwuntughe ọhụrụ' 
  },
  'auth.confirmPassword': { 
    en: 'Confirm Password', 
    pcm: 'Confirm Password', 
    yo: 'Jẹ́rìí ọ̀rọ̀ aṣínà', 
    ha: 'Tabbatar da kalmar wucewa', 
    ig: 'Kwenye okwuntughe' 
  },
  
  // Accountant Portal
  'accountant.title': { 
    en: 'Accountant Portal', 
    pcm: 'Accountant Corner', 
    yo: 'Ọ̀nà Àkàwò', 
    ha: 'Hanyar Akawo', 
    ig: 'Ọnụ ụzọ Akaụntant' 
  },
  'accountant.clients': { 
    en: 'Client Businesses', 
    pcm: 'Customer Business Dem', 
    yo: 'Àwọn Iṣẹ́ Alábarà', 
    ha: 'Kasuwancin Abokai', 
    ig: 'Azụmaahịa Ndị ahịa' 
  },
  'accountant.addClient': { 
    en: 'Add Client', 
    pcm: 'Add Customer', 
    yo: 'Fi Alábarà Kún', 
    ha: 'Ƙara Abokin ciniki', 
    ig: 'Tinye Onye ahịa' 
  },
  'accountant.bulkActions': { 
    en: 'Bulk Actions', 
    pcm: 'Do Plenty At Once', 
    yo: 'Àwọn Ìgbésẹ̀ Púpọ̀', 
    ha: 'Ayyuka da yawa', 
    ig: 'Ihe omume ọtụtụ' 
  },
  'accountant.exportAll': { 
    en: 'Export All', 
    pcm: 'Download Everything', 
    yo: 'Gbé Gbogbo Jáde', 
    ha: 'Fitar da Duka', 
    ig: 'Bupụ Niile' 
  },
  'accountant.totalClients': { 
    en: 'Total Clients', 
    pcm: 'All Your Customer Dem', 
    yo: 'Àpapọ̀ Àwọn Alábarà', 
    ha: 'Jimlar Abokan ciniki', 
    ig: 'Mkpokọta Ndị ahịa' 
  },
  'accountant.pendingTasks': { 
    en: 'Pending Tasks', 
    pcm: 'Work Wey Never Finish', 
    yo: 'Àwọn Iṣẹ́ Tó Ń Dúró', 
    ha: 'Ayyukan da ke jira', 
    ig: 'Ọrụ na-eche' 
  },
  
  // Success stories
  'stories.title': { 
    en: 'Success Stories', 
    pcm: 'People Wey Don Win', 
    yo: 'Àwọn Ìtàn Àṣeyọrí', 
    ha: 'Labaran Nasara', 
    ig: 'Akụkọ Ihe Ịga Nke Ọma' 
  },
  'stories.readMore': { 
    en: 'Read More', 
    pcm: 'Read Am', 
    yo: 'Kà síi', 
    ha: 'Karanta ƙari', 
    ig: 'Gụkwuo' 
  },
  
  // Footer
  'footer.about': { 
    en: 'About Us', 
    pcm: 'About Us', 
    yo: 'Nípa Wa', 
    ha: 'Game da mu', 
    ig: 'Banyere anyị' 
  },
  'footer.contact': { 
    en: 'Contact', 
    pcm: 'Reach Us', 
    yo: 'Kàn sí Wa', 
    ha: 'Tuntuɓe mu', 
    ig: 'Kpọtụrụ anyị' 
  },
  'footer.privacy': { 
    en: 'Privacy Policy', 
    pcm: 'Privacy', 
    yo: 'Ètò Ìpamọ́', 
    ha: 'Manufar Sirri', 
    ig: 'Iwu Nzuzo' 
  },
  'footer.terms': { 
    en: 'Terms of Service', 
    pcm: 'Terms', 
    yo: 'Àwọn Òfin Iṣẹ́', 
    ha: 'Sharuɗɗan Sabis', 
    ig: 'Usoro Ọrụ' 
  },
  'footer.faq': { 
    en: 'FAQ', 
    pcm: 'Questions', 
    yo: 'Àwọn Ìbéèrè', 
    ha: 'Tambayoyi', 
    ig: 'Ajụjụ' 
  },
  'footer.support': { 
    en: 'Support', 
    pcm: 'Help', 
    yo: 'Ìrànlọ́wọ́', 
    ha: 'Taimako', 
    ig: 'Nkwado' 
  },
  
  // Time & dates
  'time.today': { 
    en: 'Today', 
    pcm: 'Today', 
    yo: 'Lónìí', 
    ha: 'Yau', 
    ig: 'Taa' 
  },
  'time.yesterday': { 
    en: 'Yesterday', 
    pcm: 'Yesterday', 
    yo: 'Àná', 
    ha: 'Jiya', 
    ig: 'Ụnyaahụ' 
  },
  'time.thisWeek': { 
    en: 'This Week', 
    pcm: 'This Week', 
    yo: 'Ọ̀sẹ̀ yìí', 
    ha: 'Wannan mako', 
    ig: 'Izu a' 
  },
  'time.thisMonth': { 
    en: 'This Month', 
    pcm: 'This Month', 
    yo: 'Oṣù yìí', 
    ha: 'Wannan watan', 
    ig: 'Ọnwa a' 
  },
  'time.thisYear': { 
    en: 'This Year', 
    pcm: 'This Year', 
    yo: 'Ọdún yìí', 
    ha: 'Wannan shekarar', 
    ig: 'Afọ a' 
  },
  'time.lastWeek': { 
    en: 'Last Week', 
    pcm: 'Last Week', 
    yo: 'Ọ̀sẹ̀ tó kọjá', 
    ha: 'Makon da ya gabata', 
    ig: 'Izu gara aga' 
  },
  'time.lastMonth': { 
    en: 'Last Month', 
    pcm: 'Last Month', 
    yo: 'Oṣù tó kọjá', 
    ha: 'Watan da ya gabata', 
    ig: 'Ọnwa gara aga' 
  },
  'time.ago': { 
    en: 'ago', 
    pcm: 'wey don pass', 
    yo: 'sẹ́yìn', 
    ha: 'da suka wuce', 
    ig: 'gara aga' 
  },
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
      if (saved === 'en' || saved === 'pcm' || saved === 'yo' || saved === 'ha' || saved === 'ig') {
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
