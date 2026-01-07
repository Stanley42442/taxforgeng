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
  'auth.welcomeBack': { 
    en: 'Welcome Back', 
    pcm: 'You Don Come Back', 
    yo: 'Ẹ Káàbọ̀ Padà', 
    ha: 'Barka da dawowa', 
    ig: 'Nnọọ Azụ' 
  },
  'auth.createAccount': { 
    en: 'Create Account', 
    pcm: 'Open Account', 
    yo: 'Ṣẹ̀dá Àkàùntì', 
    ha: 'Ƙirƙiri Asusu', 
    ig: 'Mepụta Akaụntụ' 
  },
  'auth.setNewPassword': { 
    en: 'Set New Password', 
    pcm: 'Put New Password', 
    yo: 'Ṣètò Ọ̀rọ̀ Aṣínà Tuntun', 
    ha: 'Saita Sabuwar Kalmar Wucewa', 
    ig: 'Tọọ Okwuntughe Ọhụrụ' 
  },
  'auth.twoFactorAuth': { 
    en: 'Two-Factor Authentication', 
    pcm: 'Double Security Check', 
    yo: 'Ìjẹ́rìísí Méjì', 
    ha: 'Tabbatarwa ta Biyu', 
    ig: 'Nkwenye Ugboro Abụọ' 
  },
  'auth.signInSubtitle': { 
    en: 'Sign in to access your tax dashboard', 
    pcm: 'Login to see your tax things', 
    yo: 'Wọlé láti wọlé sí pánẹ́ẹ̀lì owó-orí rẹ', 
    ha: 'Shiga don samun damar dashboard ɗin harajin ku', 
    ig: 'Banye iji nweta dashboard ụtụ gị' 
  },
  'auth.signUpSubtitle': { 
    en: 'Start managing your taxes smarter', 
    pcm: 'Start manage your tax well well', 
    yo: 'Bẹ̀rẹ̀ sí í ṣàkóso owó-orí rẹ dáradára', 
    ha: 'Fara sarrafa harajin ku da kyau', 
    ig: 'Malite ijikwa ụtụ gị nke ọma' 
  },
  'auth.forgotPasswordSubtitle': { 
    en: 'Enter your email to receive a reset link', 
    pcm: 'Put your email make we send link', 
    yo: 'Tẹ ímeèlì rẹ láti gba ìjápọ̀ àtúnṣe', 
    ha: 'Shigar da imel ɗin ku don karɓar hanyar haɗin sake saiti', 
    ig: 'Tinye email gị iji nata njikọ ntọgharia' 
  },
  'auth.resetPasswordSubtitle': { 
    en: 'Choose a new password for your account', 
    pcm: 'Pick new password for your account', 
    yo: 'Yan ọ̀rọ̀ aṣínà tuntun fún àkàùntì rẹ', 
    ha: 'Zaɓi sabuwar kalmar wucewa don asusun ku', 
    ig: 'Họrọ okwuntughe ọhụrụ maka akaụntụ gị' 
  },
  'auth.mfaCodeSubtitle': { 
    en: 'Enter the code from your authenticator app', 
    pcm: 'Put the code from your authenticator app', 
    yo: 'Tẹ kóòdù láti inú àpẹ̀ẹ̀rẹ̀ ìjẹ́rìísí rẹ', 
    ha: 'Shigar da lambar daga aikace-aikacen tabbatarwa', 
    ig: 'Tinye koodu sitere na app nkwenye gị' 
  },
  'auth.mfaBackupSubtitle': { 
    en: 'Enter one of your backup codes', 
    pcm: 'Put one of your backup codes', 
    yo: 'Tẹ ọ̀kan nínú àwọn kóòdù ìpamọ́ rẹ', 
    ha: 'Shigar da ɗaya daga cikin lambobin ajiya', 
    ig: 'Tinye otu n\'ime koodu nchekwa gị' 
  },
  'auth.backToHome': { 
    en: 'Back to Home', 
    pcm: 'Go Back Home', 
    yo: 'Padà sí Ilé', 
    ha: 'Koma Gida', 
    ig: 'Laghachi n\'ụlọ' 
  },
  'auth.fullName': { 
    en: 'Full Name', 
    pcm: 'Your Full Name', 
    yo: 'Orúkọ Kíkún', 
    ha: 'Cikakken Suna', 
    ig: 'Aha Zuru Ezu' 
  },
  'auth.rememberMe': { 
    en: 'Remember me', 
    pcm: 'Remember me', 
    yo: 'Rántí mi', 
    ha: 'Tuna ni', 
    ig: 'Cheta m' 
  },
  'auth.continueWithGoogle': { 
    en: 'Continue with Google', 
    pcm: 'Use Google Enter', 
    yo: 'Tẹ̀síwájú pẹ̀lú Google', 
    ha: 'Ci gaba da Google', 
    ig: 'Gaa n\'ihu na Google' 
  },
  'auth.orContinueWithEmail': { 
    en: 'or continue with email', 
    pcm: 'or use email', 
    yo: 'tàbí tẹ̀síwájú pẹ̀lú ímeèlì', 
    ha: 'ko ci gaba da imel', 
    ig: 'maọbụ gaa n\'ihu na email' 
  },
  'auth.pleaseWait': { 
    en: 'Please wait...', 
    pcm: 'Wait small...', 
    yo: 'Jọ̀wọ́ dúró...', 
    ha: 'Da fatan za a jira...', 
    ig: 'Biko chere...' 
  },
  'auth.accountLocked': { 
    en: 'Account Locked', 
    pcm: 'Account Don Lock', 
    yo: 'A Ti Ti Àkàùntì', 
    ha: 'An Kulle Asusu', 
    ig: 'Akpọchiri Akaụntụ' 
  },
  'auth.sendResetLink': { 
    en: 'Send Reset Link', 
    pcm: 'Send Link', 
    yo: 'Fi Ìjápọ̀ Àtúnṣe Ránṣẹ́', 
    ha: 'Aika Hanyar Haɗin Sake Saiti', 
    ig: 'Zipu Njikọ Ntọgharia' 
  },
  'auth.sending': { 
    en: 'Sending...', 
    pcm: 'E dey send...', 
    yo: 'Ń fi ránṣẹ́...', 
    ha: 'Ana aikawa...', 
    ig: 'Na-ezipu...' 
  },
  'auth.backToSignIn': { 
    en: 'Back to Sign In', 
    pcm: 'Go Back to Login', 
    yo: 'Padà sí Wíwọlé', 
    ha: 'Koma zuwa Shiga', 
    ig: 'Laghachi na Ịbanye' 
  },
  'auth.updatePassword': { 
    en: 'Update Password', 
    pcm: 'Change Password', 
    yo: 'Ṣàtúnṣe Ọ̀rọ̀ Aṣínà', 
    ha: 'Sabunta Kalmar Wucewa', 
    ig: 'Melite Okwuntughe' 
  },
  'auth.updating': { 
    en: 'Updating...', 
    pcm: 'E dey update...', 
    yo: 'Ń ṣàtúnṣe...', 
    ha: 'Ana sabuntawa...', 
    ig: 'Na-emelite...' 
  },
  'auth.verify': { 
    en: 'Verify', 
    pcm: 'Verify', 
    yo: 'Ṣàyẹ̀wò', 
    ha: 'Tabbatar', 
    ig: 'Kwenye' 
  },
  'auth.verifying': { 
    en: 'Verifying...', 
    pcm: 'E dey check...', 
    yo: 'Ń ṣàyẹ̀wò...', 
    ha: 'Ana tabbatarwa...', 
    ig: 'Na-ekwenye...' 
  },
  'auth.backupCode': { 
    en: 'Backup Code', 
    pcm: 'Backup Code', 
    yo: 'Kóòdù Ìpamọ́', 
    ha: 'Lambar Ajiya', 
    ig: 'Koodu Nchekwa' 
  },
  'auth.verificationCode': { 
    en: 'Verification Code', 
    pcm: 'Verification Code', 
    yo: 'Kóòdù Ìjẹ́rìísí', 
    ha: 'Lambar Tabbatarwa', 
    ig: 'Koodu Nkwenye' 
  },
  'auth.enterBackupCode': { 
    en: 'Enter one of your 8-character backup codes', 
    pcm: 'Put one of your 8-letter backup codes', 
    yo: 'Tẹ ọ̀kan nínú àwọn kóòdù ìpamọ́ lẹ́tà 8', 
    ha: 'Shigar da ɗaya daga cikin lambobin ajiya haruffa 8', 
    ig: 'Tinye otu n\'ime koodu nchekwa mkpụrụedemede 8' 
  },
  'auth.enter6DigitCode': { 
    en: 'Enter the 6-digit code from your authenticator app', 
    pcm: 'Put the 6-number code from your authenticator', 
    yo: 'Tẹ kóòdù àwọn nọ́mbà 6 láti inú àpẹ̀ẹ̀rẹ̀ ìjẹ́rìísí rẹ', 
    ha: 'Shigar da lambar lambobi 6 daga aikace-aikacen tabbatarwa', 
    ig: 'Tinye koodu ọnụọgụ 6 sitere na app nkwenye gị' 
  },
  'auth.useAuthenticatorApp': { 
    en: 'Use authenticator app instead', 
    pcm: 'Use authenticator app instead', 
    yo: 'Lo àpẹ̀ẹ̀rẹ̀ ìjẹ́rìísí dípò', 
    ha: 'Yi amfani da aikace-aikacen tabbatarwa maimakon', 
    ig: 'Jiri app nkwenye kama' 
  },
  'auth.lostAuthenticator': { 
    en: 'Lost your authenticator? Use a backup code', 
    pcm: 'You lose your authenticator? Use backup code', 
    yo: 'Ṣé o pàdánù àpẹ̀ẹ̀rẹ̀ ìjẹ́rìísí rẹ? Lo kóòdù ìpamọ́', 
    ha: 'Kun rasa aikace-aikacen tabbatarwa? Yi amfani da lambar ajiya', 
    ig: 'Ị tụfuru app nkwenye gị? Jiri koodu nchekwa' 
  },
  'auth.resendVerificationEmail': { 
    en: 'Resend verification email', 
    pcm: 'Send verification email again', 
    yo: 'Tún fi ímeèlì ìjẹ́rìísí ránṣẹ́', 
    ha: 'Sake aika imel ɗin tabbatarwa', 
    ig: 'Zipugharia email nkwenye' 
  },
  'auth.emailNotVerified': { 
    en: 'Email not verified', 
    pcm: 'Email never verify', 
    yo: 'A kò tíì jẹ́rìísí ímeèlì', 
    ha: 'Ba a tabbatar da imel ba', 
    ig: 'Akwenyebeghị email' 
  },
  'auth.checkInboxMessage': { 
    en: 'Please check your inbox and click the verification link. If you didn\'t receive the email, use the button below to resend it.', 
    pcm: 'Check your inbox click the link. If you no see am, click button below make we send again.', 
    yo: 'Jọ̀wọ́ ṣàyẹ̀wò àpótí ìgbànísọ̀rọ̀ rẹ kí o sì tẹ ìjápọ̀ ìjẹ́rìísí náà. Tí o kò bá rí ímeèlì náà, lo bọ́tìnì ìsàlẹ̀ láti tún fi ránṣẹ́.', 
    ha: 'Da fatan za a duba akwatin saƙo ku kuma danna hanyar haɗin tabbatarwa. Idan ba ku sami imel ɗin ba, yi amfani da maɓallin da ke ƙasa don sake aika shi.', 
    ig: 'Biko lelee igbe ozi gị pịa njikọ nkwenye. Ọ bụrụ na ị nataghị email ahụ, jiri bọtịnụ dị n\'okpuru izipu ya ọzọ.' 
  },
  'auth.accountLockedTitle': { 
    en: 'Account Temporarily Locked', 
    pcm: 'Account Lock For Now', 
    yo: 'A Ti Ti Àkàùntì Fún Ìgbà Díẹ̀', 
    ha: 'An Kulle Asusu Na Wani Lokaci', 
    ig: 'Akpọchiri Akaụntụ Nwa Oge' 
  },
  'auth.tooManyAttempts': { 
    en: 'Too many failed login attempts. Please try again after', 
    pcm: 'You try login too many times. Try again after', 
    yo: 'Ìgbìyànjú wíwọlé tí kò ṣe àṣeyọrí púpọ̀ jù. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kan sí lẹ́yìn', 
    ha: 'Ƙoƙarin shiga da yawa da suka gaza. Da fatan za a sake gwadawa bayan', 
    ig: 'Ọtụtụ mbọ ịbanye dara. Biko nwaa ọzọ mgbe' 
  },
  'auth.attemptsRemaining': { 
    en: 'login attempts remaining before account lockout', 
    pcm: 'try remain before account go lock', 
    yo: 'ìgbìyànjú wíwọlé kù ṣáájú títi àkàùntì', 
    ha: 'ƙoƙarin shiga sun rage kafin kulle asusu', 
    ig: 'mbọ ịbanye fọdụrụ tupu akpọchie akaụntụ' 
  },
  'auth.termsAgreement': { 
    en: 'By continuing, you agree to our Terms of Service and Privacy Policy.', 
    pcm: 'If you continue, you don agree to our Terms and Privacy.', 
    yo: 'Nípa títẹ̀síwájú, o ti gba àwọn Òfin Iṣẹ́ àti Ètò Ìpamọ́ wa.', 
    ha: 'Ta hanyar ci gaba, kun yarda da Sharuɗɗan Sabis da Manufar Sirri.', 
    ig: 'Site n\'ịga n\'ihu, ị kwenyere na Usoro Ọrụ na Iwu Nzuzo anyị.' 
  },
  
  // Homepage / Index - Carousel
  'home.carousel1Title': { 
    en: '2026 Tax Reforms Are Here', 
    pcm: '2026 Tax Change Don Land', 
    yo: 'Àtúnṣe Owó-orí 2026 Ti Dé', 
    ha: 'Gyaran Haraji na 2026 Ya Zo', 
    ig: 'Mgbanwe Ụtụ 2026 Abịala' 
  },
  'home.carousel1Desc': { 
    en: 'New 0% CIT for small companies, updated PIT bands, and more. Get ready now.', 
    pcm: '0% CIT for small company, new PIT bands, and more. Prepare now.', 
    yo: 'CIT 0% tuntun fún àwọn ilé-iṣẹ́ kékeré, àwọn ìpele PIT tuntun, àti díẹ̀ síi. Múra sílẹ̀ báyìí.', 
    ha: 'Sabon 0% CIT don ƙananan kamfanoni, sabbin ƙungiyoyin PIT, da ƙari. Shirya yanzu.', 
    ig: 'Ọhụrụ 0% CIT maka obere ụlọ ọrụ, ogwe PIT emelitere, na ihe ndị ọzọ. Jikere ugbu a.' 
  },
  'home.carousel2Title': { 
    en: '₦50M Turnover Threshold', 
    pcm: '₦50M Turnover Threshold', 
    yo: 'Ààlà Ìyípadà ₦50M', 
    ha: 'Iyakar Juyawa ₦50M', 
    ig: 'Oke Ntụgharị ₦50M' 
  },
  'home.carousel2Desc': { 
    en: 'Companies under ₦50M turnover may qualify for 0% Company Income Tax.', 
    pcm: 'Company wey get less than ₦50M fit get 0% Company Tax.', 
    yo: 'Àwọn ilé-iṣẹ́ tí ìyípadà wọn kéré ju ₦50M lọ lè yẹ fún 0% Owó-orí Ilé-iṣẹ́.', 
    ha: 'Kamfanonin da ke ƙasa da juyawa ₦50M na iya cancancin 0% Harajin Kudin Shiga na Kamfani.', 
    ig: 'Ụlọ ọrụ nwere ntụgharị n\'okpuru ₦50M nwere ike iru eru maka 0% Ụtụ Ego Ụlọ Ọrụ.' 
  },
  'home.carousel3Title': { 
    en: 'First ₦800K Tax Free', 
    pcm: 'First ₦800K No Tax', 
    yo: 'Àkọ́kọ́ ₦800K Lọ́fẹ̀ẹ́', 
    ha: 'Na Farko ₦800K Ba Haraji', 
    ig: 'Nke Mbụ ₦800K Enweghị Ụtụ' 
  },
  'home.carousel3Desc': { 
    en: 'Personal income exemption increased from ₦300K to ₦800K under new rules.', 
    pcm: 'Tax-free income don increase from ₦300K to ₦800K under new rules.', 
    yo: 'Àyọ̀kúrò owó wíwọlé ti ara ẹni ti pọ̀ sí láti ₦300K sí ₦800K lábẹ́ àwọn òfin tuntun.', 
    ha: 'An ƙara keɓancewar kudin shiga daga ₦300K zuwa ₦800K a ƙarƙashin sabbin dokoki.', 
    ig: 'Enyemaka ego na-abata nke onwe pụtara site na ₦300K ruo ₦800K n\'okpuru iwu ọhụrụ.' 
  },
  'home.heroTitle': { 
    en: 'Smart Tax Advice for', 
    pcm: 'Better Tax Advice for', 
    yo: 'Ìmọ̀ràn Owó-orí Tó Dára fún', 
    ha: 'Shawarar Haraji Mai Kyau don', 
    ig: 'Ndụmọdụ Ụtụ Mara Mma maka' 
  },
  'home.heroSubtitle': { 
    en: 'Nigerian Businesses', 
    pcm: 'Nigerian Business Dem', 
    yo: 'Àwọn Iṣẹ́ Nàìjíríà', 
    ha: 'Kasuwancin Najeriya', 
    ig: 'Azụmaahịa Naịjirịa' 
  },
  'home.heroDescription': { 
    en: 'Get personalized business structure recommendations and accurate tax calculations. Built for small businesses and individuals navigating Nigeria\'s tax landscape.', 
    pcm: 'Get advice wey fit your business and correct tax calculation. We build am for small business and people wey wan understand Nigeria tax.', 
    yo: 'Gba àwọn àbá ètò iṣẹ́ tí ó bá ọ mu àti ìṣirò owó-orí tó pé. A ṣe fún àwọn iṣẹ́ kékeré àti àwọn ẹnìkọ̀ọ̀kan tí wọ́n ń sapá nínú ètò owó-orí Nàìjíríà.', 
    ha: 'Sami shawarar tsarin kasuwanci da ya dace da ku da ƙididdige haraji daidai. An gina shi don ƙananan kasuwanci da mutane da ke bi ta yanayin harajin Najeriya.', 
    ig: 'Nweta ntụnye usoro azụmaahịa akpọrọ maka gị na ngbako ụtụ ziri ezi. E wuru ya maka obere azụmaahịa na ndị mmadụ na-achọ ụzọ n\'ime ụtụ Naịjirịa.' 
  },
  'home.updatedFor2025': { 
    en: 'Updated for Nigeria Tax Act 2025', 
    pcm: 'We don update am for Nigeria Tax Act 2025', 
    yo: 'A ti ṣàtúnṣe fún Òfin Owó-orí Nàìjíríà 2025', 
    ha: 'An sabunta don Dokar Haraji ta Najeriya 2025', 
    ig: 'Emelitere maka Iwu Ụtụ Naịjirịa 2025' 
  },
  'home.getAdvice': { 
    en: 'Get Tax Advice', 
    pcm: 'Get Tax Advice', 
    yo: 'Gba Ìmọ̀ràn Owó-orí', 
    ha: 'Sami Shawarar Haraji', 
    ig: 'Nweta Ndụmọdụ Ụtụ' 
  },
  'home.taxCalculator': { 
    en: 'Tax Calculator', 
    pcm: 'Tax Calculator', 
    yo: 'Ẹ̀rọ Ìṣirò Owó-orí', 
    ha: 'Na\'urar Ƙididdiga Haraji', 
    ig: 'Ngwa Mgbako Ụtụ' 
  },
  'home.firsCompliant': { 
    en: 'FIRS Compliant', 
    pcm: 'FIRS Approved', 
    yo: 'Ó Bá FIRS Mu', 
    ha: 'Ya Dace da FIRS', 
    ig: 'Kwekọrọ na FIRS' 
  },
  'home.pre2026Rules': { 
    en: 'Pre-2026 & 2026 Rules', 
    pcm: 'Old and New Rules', 
    yo: 'Àwọn Òfin Ṣáájú-2026 àti 2026', 
    ha: 'Dokokin Kafin-2026 da 2026', 
    ig: 'Iwu Tupu-2026 na 2026' 
  },
  'home.freeToUse': { 
    en: 'Free to Use', 
    pcm: 'Free to Use', 
    yo: 'Ọ̀fẹ́ láti Lò', 
    ha: 'Kyauta don Amfani', 
    ig: 'N\'efu iji' 
  },
  'home.featuresTitle': { 
    en: 'Everything You Need for Tax Compliance', 
    pcm: 'Everything You Need for Tax', 
    yo: 'Gbogbo Ohun Tí O Nílò fún Ìdúróṣinṣin Owó-orí', 
    ha: 'Duk Abin da Kuke Buƙata don Bin Haraji', 
    ig: 'Ihe Niile Ị Chọrọ maka Ịdebe Ụtụ' 
  },
  'home.featuresSubtitle': { 
    en: 'From business structure advice to detailed tax calculations', 
    pcm: 'From business advice to tax calculation', 
    yo: 'Láti ìmọ̀ràn ètò iṣẹ́ dé àwọn ìṣirò owó-orí àlàyé', 
    ha: 'Daga shawarar tsarin kasuwanci zuwa ƙididdige haraji cikakke', 
    ig: 'Site na ndụmọdụ usoro azụmaahịa ruo ngbako ụtụ zuru ezu' 
  },
  'home.businessAdvice': { 
    en: 'Business Structure Advice', 
    pcm: 'Business Structure Advice', 
    yo: 'Ìmọ̀ràn Ètò Iṣẹ́', 
    ha: 'Shawarar Tsarin Kasuwanci', 
    ig: 'Ndụmọdụ Usoro Azụmaahịa' 
  },
  'home.businessAdviceDesc': { 
    en: 'Get recommendations on whether to register as a Business Name or Limited Liability Company based on your needs.', 
    pcm: 'Get advice if you go register as Business Name or Limited Company.', 
    yo: 'Gba àwọn àbá nípa bóyá o yẹ kí o forúkọ sílẹ̀ bí Orúkọ Iṣẹ́ tàbí Ilé-iṣẹ́ Ohun Ìnì Tó Lópin dá lórí àwọn ohun tí o nílò.', 
    ha: 'Sami shawarwarin ko za ku yi rijista a matsayin Sunan Kasuwanci ko Kamfanin Iyakance Abin Nauyi dangane da buƙatun ku.', 
    ig: 'Nweta ntụnye ma ị ga-edebanye aha dị ka Aha Azụmaahịa ma ọ bụ Ụlọ Ọrụ Nwere Oke Ntụkwasị dabere n\'ihe ị chọrọ.' 
  },
  'home.copyright': { 
    en: '© 2025 TaxForge NG. For educational purposes only.', 
    pcm: '© 2025 TaxForge NG. Na for learning only.', 
    yo: '© 2025 TaxForge NG. Fún àwọn ète ẹ̀kọ́ nìkan.', 
    ha: '© 2025 TaxForge NG. Don dalilan ilimi kawai.', 
    ig: '© 2025 TaxForge NG. Maka ebumnuche mmụta naanị.' 
  },
  'home.taxCalculatorTitle': {
    en: 'Tax Calculator', 
    pcm: 'Tax Calculator', 
    yo: 'Ẹ̀rọ Ìṣirò Owó-orí', 
    ha: 'Na\'urar Ƙididdiga Haraji', 
    ig: 'Ngwa Mgbako Ụtụ' 
  },
  'home.taxCalculatorDesc': { 
    en: 'Calculate CIT, PIT, VAT, and development levies with support for both pre-2026 and 2026+ rules.', 
    pcm: 'Calculate CIT, PIT, VAT, and levies with old and new rules.', 
    yo: 'Ṣe ìṣirò CIT, PIT, VAT, àti àwọn owó ìdàgbàsókè pẹ̀lú àtìlẹ́yìn fún àwọn òfin ṣáájú-2026 àti 2026+.', 
    ha: 'Ƙididdige CIT, PIT, VAT, da haraji na ci gaba tare da goyon bayan dokokin kafin-2026 da 2026+.', 
    ig: 'Gbakọọ CIT, PIT, VAT, na ụtụ mmepe na nkwado maka iwu tupu-2026 na 2026+.' 
  },
  'home.liabilityProtection': { 
    en: 'Liability Protection', 
    pcm: 'Protection', 
    yo: 'Ìdáàbòbò Ẹ̀ṣẹ̀', 
    ha: 'Kariyar Alhaki', 
    ig: 'Nchekwa Ọrụ' 
  },
  'home.liabilityProtectionDesc': { 
    en: 'Understand how different business structures affect your personal asset protection.', 
    pcm: 'Understand how different business type fit protect your things.', 
    yo: 'Mọ̀ bí àwọn ètò iṣẹ́ oríṣiríṣi ṣe ń kan ìdáàbòbò ohun ìní ara ẹni rẹ.', 
    ha: 'Fahimci yadda tsarin kasuwanci daban-daban ke shafar kariyar dukiyar ku.', 
    ig: 'Ghọta ka usoro azụmaahịa dị iche iche si emetụta nchekwa akụ nke onwe gị.' 
  },
  'home.smallCompanyBenefits': { 
    en: 'Small Company Benefits', 
    pcm: 'Small Company Benefits', 
    yo: 'Àwọn Ànfààní Ilé-iṣẹ́ Kékeré', 
    ha: 'Fa\'idodin Ƙaramin Kamfani', 
    ig: 'Uru Obere Ụlọ Ọrụ' 
  },
  'home.smallCompanyBenefitsDesc': { 
    en: 'Check if you qualify for 0% CIT rate under the new small company rules.', 
    pcm: 'Check if you fit get 0% CIT under new small company rules.', 
    yo: 'Ṣàyẹ̀wò bóyá o yẹ fún ìwọ̀n CIT 0% lábẹ́ àwọn òfin ilé-iṣẹ́ kékeré tuntun.', 
    ha: 'Duba ko kun cancanci adadin CIT 0% ƙarƙashin sabbin dokokin ƙaramin kamfani.', 
    ig: 'Lelee ma ị ruru uru maka ọnụọgụ CIT 0% n\'okpuru iwu ụlọ ọrụ obere ọhụrụ.' 
  },
  'home.exportReports': { 
    en: 'Export Reports', 
    pcm: 'Download Reports', 
    yo: 'Gbé Àwọn Ìròyìn Jáde', 
    ha: 'Fitar da Rahotanni', 
    ig: 'Bupụ Akụkọ' 
  },
  'home.exportReportsDesc': { 
    en: 'Download your tax calculations as PDF or CSV for record keeping and filing.', 
    pcm: 'Download your tax calculation as PDF or CSV for record.', 
    yo: 'Gbàmọ́lé àwọn ìṣirò owó-orí rẹ bí PDF tàbí CSV fún ìtọ́jú àkọsílẹ̀ àti fífi ìfín.', 
    ha: 'Sauke ƙididdige harajin ku a matsayin PDF ko CSV don adana bayanan da shigarwa.', 
    ig: 'Budata ngbako ụtụ gị dị ka PDF ma ọ bụ CSV maka nchekwa ndekọ na ntinye.' 
  },
  'home.taxFilingPreparation': { 
    en: 'Tax Filing Preparation', 
    pcm: 'Tax Filing Preparation', 
    yo: 'Ìgbékalẹ̀ Fífi Owó-orí Ìfín', 
    ha: 'Shirye-shiryen Shigar da Haraji', 
    ig: 'Nkwadebe Ntinye Ụtụ' 
  },
  'home.taxFilingPreparationDesc': { 
    en: 'Generate pre-filled FIRS forms ready for TaxProMax submission.', 
    pcm: 'Generate FIRS forms wey don ready for TaxProMax.', 
    yo: 'Ṣe àwọn fọ́ọ̀mù FIRS tí a ti kún tẹ́lẹ̀ tí wọ́n ti ṣetán fún fífi sí TaxProMax.', 
    ha: 'Ƙirƙiri fom ɗin FIRS da aka riga aka cika shirye don miƙa TaxProMax.', 
    ig: 'Mepụta fọm FIRS ejiri edebere akwadebere maka ntinye TaxProMax.' 
  },
  'home.plansForEveryBusiness': { 
    en: 'Plans for Every Business', 
    pcm: 'Plans for Every Business', 
    yo: 'Àwọn Ètò fún Gbogbo Iṣẹ́', 
    ha: 'Tsare-tsare don Kowane Kasuwanci', 
    ig: 'Atụmatụ maka Azụmaahịa Ọ Bụla' 
  },
  'home.startFreeWithUnlimited': { 
    en: 'Start free with unlimited calculations. Upgrade for exports, saved businesses, and filing tools.', 
    pcm: 'Start free with plenty calculation. Upgrade for export and more features.', 
    yo: 'Bẹ̀rẹ̀ lọ́fẹ̀ẹ́ pẹ̀lú àwọn ìṣirò àìlópin. Gbéga fún gbígbé jáde, àwọn iṣẹ́ tí a fi pamọ́, àti àwọn ọ̀pá iṣẹ́ fífi ìfín.', 
    ha: 'Fara kyauta tare da ƙididdiga marasa iyaka. Haɓaka don fitarwa, kasuwancin da aka ajiye, da kayan aikin shigarwa.', 
    ig: 'Malite n\'efu na ngbako enweghị oke. Kwalite maka mbupụ, azụmaahịa echekwara, na ngwa ntinye.' 
  },
  'home.viewPricingPlans': { 
    en: 'View Pricing Plans', 
    pcm: 'See All Plans', 
    yo: 'Wo Àwọn Ètò Iye Owó', 
    ha: 'Duba Tsarin Farashi', 
    ig: 'Lee Atụmatụ Ọnụahịa' 
  },
  'home.readyToOptimize': { 
    en: 'Ready to Optimize Your Taxes?', 
    pcm: 'Ready to Fix Your Tax?', 
    yo: 'Ṣé O Ti Ṣetán láti Mú Owó-orí Rẹ Dára Sí?', 
    ha: 'Shirye don Inganta Harajin Ku?', 
    ig: 'Ọ Dị Njikere Ịkwalite Ụtụ Gị?' 
  },
  'home.joinThousands': { 
    en: 'Join thousands of Nigerian businesses making smarter tax decisions. Start with our free advisory tool.', 
    pcm: 'Join plenty Nigerian business wey dey make better tax decision. Start with our free tool.', 
    yo: 'Darapọ̀ mọ́ ẹgbẹẹgbẹ̀rún àwọn iṣẹ́ Nàìjíríà tí wọ́n ń ṣe àwọn ìpinnu owó-orí tó dára jùlọ. Bẹ̀rẹ̀ pẹ̀lú ọ̀pá iṣẹ́ ìmọ̀ràn ọ̀fẹ́ wa.', 
    ha: 'Ku haɗa da dubbannin kasuwancin Najeriya da ke yanke shawara mafi kyau na haraji. Fara tare da kayan aikin ba da shawara kyauta.', 
    ig: 'Sonye na puku kwuru puku azụmaahịa Naịjirịa na-eme mkpebi ụtụ ka mma. Malite na ngwa ndụmọdụ n\'efu anyị.' 
  },
  'home.startFreeAssessment': { 
    en: 'Start Free Assessment', 
    pcm: 'Start Free Check', 
    yo: 'Bẹ̀rẹ̀ Ìṣàyẹ̀wò Ọ̀fẹ́', 
    ha: 'Fara Kimantawa Kyauta', 
    ig: 'Malite Nyocha N\'efu' 
  },
  'home.learnMore': { 
    en: 'Learn More', 
    pcm: 'Learn More', 
    yo: 'Kọ́ Síi', 
    ha: 'Ƙara koyo', 
    ig: 'Mụtakwuo' 
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
  
  // Calculator page (new additions that don't duplicate)
  'calculator.title': { 
    en: 'Tax Calculator', 
    pcm: 'Tax Calculator', 
    yo: 'Ẹ̀rọ Ìṣirò Owó-orí', 
    ha: 'Na\'urar Ƙididdiga Haraji', 
    ig: 'Ngwa Mgbako Ụtụ' 
  },
  'calculator.subtitle': { 
    en: 'Calculate your Nigerian taxes accurately', 
    pcm: 'Calculate your Nigeria tax correct', 
    yo: 'Ṣe ìṣirò owó-orí Nàìjíríà rẹ dájúdájú', 
    ha: 'Ƙididdige harajin Najeriya daidai', 
    ig: 'Gbakọọ ụtụ Naịjirịa gị nke ọma' 
  },
  'calculator.firsCompliant': { 
    en: 'FIRS Compliant Calculator', 
    pcm: 'FIRS Approved Calculator', 
    yo: 'Ẹ̀rọ Ìṣirò Tó Bá FIRS Mu', 
    ha: 'Na\'urar Ƙididdiga ta FIRS', 
    ig: 'Ngwa Mgbako Kwekọrọ na FIRS' 
  },
  'calculator.selectBusiness': { 
    en: 'Select Business', 
    pcm: 'Choose Business', 
    yo: 'Yan Iṣẹ́', 
    ha: 'Zaɓi Kasuwanci', 
    ig: 'Họrọ Azụmaahịa' 
  },
  'calculator.newCalculation': { 
    en: 'New Calculation', 
    pcm: 'New Calculation', 
    yo: 'Ìṣirò Tuntun', 
    ha: 'Sabon Ƙididdiga', 
    ig: 'Mgbako Ọhụrụ' 
  },
  'calculator.annualTurnover': { 
    en: 'Annual Turnover', 
    pcm: 'Yearly Sales', 
    yo: 'Ìyípadà Ọdún', 
    ha: 'Juyawa ta Shekara', 
    ig: 'Ntụgharị Afọ' 
  },
  'calculator.calculateNow': { 
    en: 'Calculate Now', 
    pcm: 'Calculate Now', 
    yo: 'Ṣe Ìṣirò Báyìí', 
    ha: 'Ƙididdige Yanzu', 
    ig: 'Gbakọọ Ugbu A' 
  },
  'calculator.businessNameOption': { 
    en: 'Business Name', 
    pcm: 'Business Name', 
    yo: 'Orúkọ Iṣẹ́', 
    ha: 'Sunan Kasuwanci', 
    ig: 'Aha Azụmaahịa' 
  },
  'calculator.companyOption': { 
    en: 'Company (LTD)', 
    pcm: 'Company (LTD)', 
    yo: 'Ilé-iṣẹ́ (LTD)', 
    ha: 'Kamfani (LTD)', 
    ig: 'Ụlọ Ọrụ (LTD)' 
  },
  'calculator.use2026Rules': { 
    en: 'Nigeria Tax Act 2025 Rules', 
    pcm: 'Nigeria Tax Act 2025 Rules', 
    yo: 'Àwọn Òfin Àṣà Owó-orí Nàìjíríà 2025', 
    ha: 'Dokokin Dokar Haraji ta Najeriya 2025', 
    ig: 'Iwu Iwu Ụtụ Naịjirịa 2025' 
  },
  'calculator.currentRules': { 
    en: 'Current (Pre-2026) Rules', 
    pcm: 'Old Rules (Before 2026)', 
    yo: 'Àwọn Òfin Lọ́wọ́lọ́wọ́ (Ṣáájú-2026)', 
    ha: 'Dokokin Yanzu (Kafin-2026)', 
    ig: 'Iwu Ugbu A (Tupu-2026)' 
  },
  
  // Learn page
  'learn.title': { 
    en: 'Tax Academy', 
    pcm: 'Tax School', 
    yo: 'Ilé-ẹ̀kọ́ Owó-orí', 
    ha: 'Makarantar Haraji', 
    ig: 'Ụlọ Akwụkwọ Ụtụ' 
  },
  'learn.subtitle': { 
    en: 'Master Nigerian tax rules • Bust common myths • Learn sector incentives', 
    pcm: 'Learn Nigeria tax rules • Clear your doubt • Know your sector', 
    yo: 'Ṣàkóso àwọn òfin owó-orí Nàìjíríà • Fọ́ àwọn ìtàn àlọ́sọ̀kan • Kọ́ àwọn ìdásílẹ̀ ẹ̀ka', 
    ha: 'Ƙware dokokin harajin Najeriya • Karya tatsuniyoyi na yau da kullun • Koyi abubuwan karfafawa', 
    ig: 'Chịkwaa iwu ụtụ Naịjirịa • Kụrie akụkọ ifo • Mụta ihe mkpali' 
  },
  'learn.yourTaxTips': { 
    en: 'Your Tax Tips', 
    pcm: 'Your Tax Tips', 
    yo: 'Àwọn Ìmọ̀ràn Owó-orí Rẹ', 
    ha: 'Shawarwarin Harajin Ku', 
    ig: 'Ndụmọdụ Ụtụ Gị' 
  },
  'learn.myths': { 
    en: 'Myths', 
    pcm: 'Myths', 
    yo: 'Àwọn Ìtàn Àlọ́', 
    ha: 'Tatsuniyoyi', 
    ig: 'Akụkọ Ifo' 
  },
  'learn.videos': { 
    en: 'Videos', 
    pcm: 'Videos', 
    yo: 'Àwọn Fídíò', 
    ha: 'Bidiyo', 
    ig: 'Vidiyo' 
  },
  'learn.sectors': { 
    en: 'Sectors', 
    pcm: 'Sectors', 
    yo: 'Àwọn Ẹ̀ka', 
    ha: 'Sassan', 
    ig: 'Ngalaba' 
  },
  'learn.articles': { 
    en: 'Articles', 
    pcm: 'Articles', 
    yo: 'Àwọn Àpilẹ̀kọ', 
    ha: 'Labaran', 
    ig: 'Edemede' 
  },
  'learn.faqs': { 
    en: 'FAQs', 
    pcm: 'Questions', 
    yo: 'Àwọn Ìbéèrè', 
    ha: 'Tambayoyi', 
    ig: 'Ajụjụ' 
  },
  
  // Referrals page (additional)
  'referral.inviteFriends': { 
    en: 'Invite Friends, Earn Rewards', 
    pcm: 'Bring Your Friends, Get Bonus', 
    yo: 'Pe Àwọn Ọ̀rẹ́, Gba Ẹ̀bùn', 
    ha: 'Gayyato Abokai, Sami Lada', 
    ig: 'Kpọọ Ndị Enyi, Nweta Ụgwọ' 
  },
  'referral.freeMonthsEarned': { 
    en: 'Free Months Earned', 
    pcm: 'Free Months You Get', 
    yo: 'Àwọn Oṣù Ọ̀fẹ́ Tí O Gba', 
    ha: 'Watanni Kyauta da Aka Samu', 
    ig: 'Ọnwa N\'efu Ị Nwetara' 
  },
  'referral.yourLink': { 
    en: 'Your Referral Link', 
    pcm: 'Your Referral Link', 
    yo: 'Ìjápọ̀ Ìpè Rẹ', 
    ha: 'Hanyar Gayyatar Ku', 
    ig: 'Njikọ Nkpọpụta Gị' 
  },
  'referral.shareYourLink': { 
    en: 'Share Your Link', 
    pcm: 'Share Your Link', 
    yo: 'Pin Ìjápọ̀ Rẹ', 
    ha: 'Raba Hanyar Ku', 
    ig: 'Kesaa Njikọ Gị' 
  },
  'referral.friendSignsUp': { 
    en: 'Friend Signs Up', 
    pcm: 'Friend Register', 
    yo: 'Ọ̀rẹ́ Forúkọ sílẹ̀', 
    ha: 'Aboki Ya Yi Rajista', 
    ig: 'Enyi Debanye Aha' 
  },
  'referral.earnRewards': { 
    en: 'Earn Rewards', 
    pcm: 'Get Bonus', 
    yo: 'Gba Ẹ̀bùn', 
    ha: 'Sami Lada', 
    ig: 'Nweta Ụgwọ' 
  },
  'referral.history': { 
    en: 'Referral History', 
    pcm: 'Referral History', 
    yo: 'Ìtàn Ìpè', 
    ha: 'Tarihin Gayyata', 
    ig: 'Akụkọ Nkpọpụta' 
  },
  'referral.noReferrals': { 
    en: 'No referrals yet', 
    pcm: 'No referral yet', 
    yo: 'Kò sí ìpè síbẹ̀', 
    ha: 'Babu gayyata har yanzu', 
    ig: 'Ọ dịghị nkpọpụta ka ugbu a' 
  },
  
  // Advisory page
  'advisory.title': { 
    en: 'Business Advisory', 
    pcm: 'Business Advice', 
    yo: 'Ìmọ̀ràn Iṣẹ́', 
    ha: 'Shawarar Kasuwanci', 
    ig: 'Ndụmọdụ Azụmaahịa' 
  },
  'advisory.ourRecommendation': { 
    en: 'Our Recommendation', 
    pcm: 'What We Recommend', 
    yo: 'Àbá Wa', 
    ha: 'Shawarar Mu', 
    ig: 'Ntụnye Anyị' 
  },
  'advisory.match': { 
    en: 'Match', 
    pcm: 'Match', 
    yo: 'Ìbámu', 
    ha: 'Daidaici', 
    ig: 'Ndakọrịta' 
  },
  'advisory.advantages': { 
    en: 'Advantages', 
    pcm: 'Good Things', 
    yo: 'Àwọn Ànfààní', 
    ha: 'Fa\'idodi', 
    ig: 'Uru' 
  },
  'advisory.considerations': { 
    en: 'Considerations', 
    pcm: 'Things To Think About', 
    yo: 'Àwọn Ohun Tí A Gbọ́dọ̀ Rò', 
    ha: 'Abubuwan Da Za A Yi La\'akari', 
    ig: 'Ihe A Ga-Atụle' 
  },
  'advisory.taxAuthority': { 
    en: 'Tax Authority', 
    pcm: 'Tax Office', 
    yo: 'Aṣẹ Owó-orí', 
    ha: 'Hukumar Haraji', 
    ig: 'Ọchịchị Ụtụ' 
  },
  'advisory.registrationCost': { 
    en: 'Registration Cost', 
    pcm: 'Registration Cost', 
    yo: 'Iye Ìforúkọsílẹ̀', 
    ha: 'Kudin Rajista', 
    ig: 'Ọnụ Ahịa Ndebanye Aha' 
  },
  'advisory.annualCompliance': { 
    en: 'Annual Compliance', 
    pcm: 'Yearly Cost', 
    yo: 'Ìdúróṣinṣin Ọdún', 
    ha: 'Bin Doka na Shekara-shekara', 
    ig: 'Ịdebe Iwu Afọ' 
  },
  'advisory.calculateTaxes': { 
    en: 'Calculate Your Taxes', 
    pcm: 'Calculate Your Tax', 
    yo: 'Ṣe Ìṣirò Owó-orí Rẹ', 
    ha: 'Ƙididdige Harajin Ku', 
    ig: 'Gbakọọ Ụtụ Gị' 
  },
  'advisory.startOver': { 
    en: 'Start Over', 
    pcm: 'Start Again', 
    yo: 'Bẹ̀rẹ̀ Láti Ìbẹ̀rẹ̀', 
    ha: 'Fara Daga Farko', 
    ig: 'Malite Ọzọ' 
  },
  'advisory.skipToCalculator': { 
    en: 'Skip to Calculator', 
    pcm: 'Go Straight to Calculator', 
    yo: 'Fò Lọ sí Ẹ̀rọ Ìṣirò', 
    ha: 'Tsallake zuwa Na\'ura', 
    ig: 'Wụfee Gaa Ngwa Mgbako' 
  },
  'advisory.question': { 
    en: 'Question', 
    pcm: 'Question', 
    yo: 'Ìbéèrè', 
    ha: 'Tambaya', 
    ig: 'Ajụjụ' 
  },
  'advisory.complete': { 
    en: 'Complete', 
    pcm: 'Done', 
    yo: 'Parí', 
    ha: 'An Kammala', 
    ig: 'Mezue' 
  },
  
  // Tax Calendar page
  'taxCalendar.title': { 
    en: 'Tax Calendar', 
    pcm: 'Tax Calendar', 
    yo: 'Kàlẹ́ndà Owó-orí', 
    ha: 'Kalandar Haraji', 
    ig: 'Kalenda Ụtụ' 
  },
  'taxCalendar.subtitle': { 
    en: 'Track all Nigerian tax deadlines in one place', 
    pcm: 'See all Nigeria tax deadline for one place', 
    yo: 'Tọpinpin gbogbo àkókò ìparí owó-orí Nàìjíríà ní ibi kan', 
    ha: 'Bin sawun duk ƙarshen harajin Najeriya a wuri ɗaya', 
    ig: 'Soro oge njedebe ụtụ Naịjirịa niile n\'otu ebe' 
  },
  'taxCalendar.exportToCalendar': { 
    en: 'Export to Calendar', 
    pcm: 'Download Calendar', 
    yo: 'Gbé Jáde sí Kàlẹ́ndà', 
    ha: 'Fitar zuwa Kalanda', 
    ig: 'Bupụ na Kalenda' 
  },
  'taxCalendar.upcomingDeadlines': { 
    en: 'Upcoming Deadlines', 
    pcm: 'Deadline Wey Dey Come', 
    yo: 'Àwọn Àkókò Ìparí Tó Ń Bọ̀', 
    ha: 'Lokutan ƙarshe masu zuwa', 
    ig: 'Oge njedebe na-abịa' 
  },
  'taxCalendar.noDeadlines': { 
    en: 'No deadlines on this date', 
    pcm: 'No deadline for this date', 
    yo: 'Kò sí àkókò ìparí ní ọjọ́ yìí', 
    ha: 'Babu ƙarshen lokaci a wannan ranar', 
    ig: 'Ọ dịghị oge njedebe n\'ụbọchị a' 
  },
  'taxCalendar.today': { 
    en: 'Today', 
    pcm: 'Today', 
    yo: 'Lónìí', 
    ha: 'Yau', 
    ig: 'Taa' 
  },
  'taxCalendar.tomorrow': { 
    en: 'Tomorrow', 
    pcm: 'Tomorrow', 
    yo: 'Lọ́la', 
    ha: 'Gobe', 
    ig: 'Echi' 
  },
  'taxCalendar.days': { 
    en: 'days', 
    pcm: 'days', 
    yo: 'ọjọ́', 
    ha: 'kwanaki', 
    ig: 'ụbọchị' 
  },
  'notFound.title': { 
    en: 'Oops! Page not found', 
    pcm: 'E no dey! Page no dey', 
    yo: 'Ó dà bí! Ojú-ìwé kò rí', 
    ha: 'Kuskure! Ba a sami shafin ba', 
    ig: 'Ewu! Ahụghị peeji a' 
  },
  'notFound.goHome': { 
    en: 'Return to Home', 
    pcm: 'Go Back Home', 
    yo: 'Padà sí Ilé', 
    ha: 'Koma Gida', 
    ig: 'Laghachi Ụlọ' 
  },
  
  // Form Labels
  'form.fullName': { 
    en: 'Full Name', 
    pcm: 'Your Full Name', 
    yo: 'Orúkọ Kíkún', 
    ha: 'Cikakken Suna', 
    ig: 'Aha Zuru Oke' 
  },
  'form.email': { 
    en: 'Email Address', 
    pcm: 'Your Email', 
    yo: 'Àdírẹ́sì Ímeèlì', 
    ha: 'Adireshin Imel', 
    ig: 'Adreesị Email' 
  },
  'form.password': { 
    en: 'Password', 
    pcm: 'Password', 
    yo: 'Ọ̀rọ̀ Aṣínà', 
    ha: 'Kalmar Sirri', 
    ig: 'Okwuntughe' 
  },
  'form.currentPassword': { 
    en: 'Current Password', 
    pcm: 'Your Current Password', 
    yo: 'Ọ̀rọ̀ Aṣínà Lọ́wọ́', 
    ha: 'Kalmar Sirri ta Yanzu', 
    ig: 'Okwuntughe Ugbu a' 
  },
  'form.newPassword': { 
    en: 'New Password', 
    pcm: 'New Password', 
    yo: 'Ọ̀rọ̀ Aṣínà Tuntun', 
    ha: 'Sabuwar Kalmar Sirri', 
    ig: 'Okwuntughe Ọhụrụ' 
  },
  'form.confirmPassword': { 
    en: 'Confirm Password', 
    pcm: 'Type Password Again', 
    yo: 'Jẹ́rìí Ọ̀rọ̀ Aṣínà', 
    ha: 'Tabbatar Kalmar Sirri', 
    ig: 'Kwenye Okwuntughe' 
  },
  'form.phoneNumber': { 
    en: 'Phone Number', 
    pcm: 'Your Phone Number', 
    yo: 'Nọ́mbà Fóònù', 
    ha: 'Lambar Waya', 
    ig: 'Nọmba Ekwentị' 
  },
  'form.whatsappNumber': { 
    en: 'WhatsApp Number', 
    pcm: 'Your WhatsApp Number', 
    yo: 'Nọ́mbà WhatsApp', 
    ha: 'Lambar WhatsApp', 
    ig: 'Nọmba WhatsApp' 
  },
  'form.description': { 
    en: 'Description', 
    pcm: 'Description', 
    yo: 'Àpèjúwe', 
    ha: 'Bayani', 
    ig: 'Nkọwa' 
  },
  'form.amount': { 
    en: 'Amount', 
    pcm: 'How Much', 
    yo: 'Iye', 
    ha: 'Adadi', 
    ig: 'Ego' 
  },
  'form.date': { 
    en: 'Date', 
    pcm: 'Date', 
    yo: 'Ọjọ́', 
    ha: 'Kwanan Wata', 
    ig: 'Ụbọchị' 
  },
  'form.category': { 
    en: 'Category', 
    pcm: 'Category', 
    yo: 'Ẹ̀ka', 
    ha: 'Rukunin', 
    ig: 'Ụdị' 
  },
  'form.type': { 
    en: 'Type', 
    pcm: 'Type', 
    yo: 'Irú', 
    ha: "Nau'i", 
    ig: 'Ụdị' 
  },
  'form.title': { 
    en: 'Title', 
    pcm: 'Title', 
    yo: 'Àkọlé', 
    ha: 'Take', 
    ig: 'Aha' 
  },
  'form.notes': { 
    en: 'Notes', 
    pcm: 'Notes', 
    yo: 'Àkọsílẹ̀', 
    ha: 'Bayanan', 
    ig: 'Ndetu' 
  },
  'form.optional': { 
    en: '(Optional)', 
    pcm: '(No Be Must)', 
    yo: '(Kò ṣe dandan)', 
    ha: '(Ba dole ba)', 
    ig: '(Ọ dịghị mkpa)' 
  },
  'form.required': { 
    en: 'Required', 
    pcm: 'E Must', 
    yo: 'Ó ṣe dandan', 
    ha: 'Ana buƙata', 
    ig: 'Achọrọ' 
  },
  
  // Buttons
  'btn.updateProfile': { 
    en: 'Update Profile', 
    pcm: 'Update Your Profile', 
    yo: 'Ṣe Àtúnṣe Àkọọ́lẹ̀', 
    ha: 'Sabunta Bayani', 
    ig: 'Melite Profaịlụ' 
  },
  'btn.changePassword': { 
    en: 'Change Password', 
    pcm: 'Change Password', 
    yo: 'Yí Ọ̀rọ̀ Aṣínà Padà', 
    ha: 'Canja Kalmar Sirri', 
    ig: 'Gbanwee Okwuntughe' 
  },
  'btn.updateEmail': { 
    en: 'Update Email', 
    pcm: 'Change Email', 
    yo: 'Ṣe Àtúnṣe Ímeèlì', 
    ha: 'Sabunta Imel', 
    ig: 'Melite Email' 
  },
  'btn.enable2FA': { 
    en: 'Enable 2FA', 
    pcm: 'Turn On 2FA', 
    yo: 'Mú 2FA Ṣiṣẹ́', 
    ha: 'Kunna 2FA', 
    ig: 'Mee 2FA' 
  },
  'btn.disable2FA': { 
    en: 'Disable 2FA', 
    pcm: 'Turn Off 2FA', 
    yo: 'Pa 2FA', 
    ha: 'Kashe 2FA', 
    ig: 'Gbanyụọ 2FA' 
  },
  'btn.generateBackupCodes': { 
    en: 'Generate Backup Codes', 
    pcm: 'Create Backup Codes', 
    yo: 'Ṣẹ̀dá Àwọn Kóòdù Àfipamọ́', 
    ha: 'Ƙirƙiri Lambobin Ajiya', 
    ig: 'Mepụta Koodu Nchekwa' 
  },
  'btn.viewBackupCodes': { 
    en: 'View Backup Codes', 
    pcm: 'See Backup Codes', 
    yo: 'Wo Àwọn Kóòdù Àfipamọ́', 
    ha: 'Duba Lambobin Ajiya', 
    ig: 'Lee Koodu Nchekwa' 
  },
  'btn.signOutAll': { 
    en: 'Sign Out All Devices', 
    pcm: 'Sign Out All Devices', 
    yo: 'Jáde Kúrò Ní Gbogbo Ẹ̀rọ', 
    ha: 'Fita Daga Dukan Na\'urori', 
    ig: 'Pụọ na Ngwaọrụ Niile' 
  },
  'btn.addExpense': { 
    en: 'Add Expense', 
    pcm: 'Add Expense', 
    yo: 'Fi Inawo Kún', 
    ha: 'Ƙara Kashewa', 
    ig: 'Tinye Mmefu' 
  },
  'btn.addIncome': { 
    en: 'Add Income', 
    pcm: 'Add Income', 
    yo: 'Fi Owó Wọlé Kún', 
    ha: 'Ƙara Kuɗin Shiga', 
    ig: 'Tinye Ego Mbata' 
  },
  'btn.createReminder': { 
    en: 'Create Reminder', 
    pcm: 'Create Reminder', 
    yo: 'Ṣẹ̀dá Ìránṣọ́', 
    ha: 'Ƙirƙiri Tunatarwa', 
    ig: 'Mepụta Ncheta' 
  },
  'btn.inviteMember': { 
    en: 'Invite Team Member', 
    pcm: 'Invite Team Member', 
    yo: 'Pè Ẹlẹ́gbẹ́ Ẹgbẹ́', 
    ha: 'Gayyaci Memba', 
    ig: 'Kpọọ Onye Otu' 
  },
  'btn.exportPDF': { 
    en: 'Export PDF', 
    pcm: 'Download PDF', 
    yo: 'Gbé PDF Jáde', 
    ha: 'Fitar PDF', 
    ig: 'Bupụ PDF' 
  },
  'btn.exportCSV': { 
    en: 'Export CSV', 
    pcm: 'Download CSV', 
    yo: 'Gbé CSV Jáde', 
    ha: 'Fitar CSV', 
    ig: 'Bupụ CSV' 
  },
  'btn.sendTestNotification': { 
    en: 'Send Test Notification', 
    pcm: 'Send Test Notification', 
    yo: 'Fi Ìkìlọ̀ Ìdánwò Ránṣẹ́', 
    ha: 'Aika Sanarwar Gwaji', 
    ig: 'Zipu Ọkwa Nnwale' 
  },
  'btn.startFiling': { 
    en: 'Start E-Filing', 
    pcm: 'Start E-Filing', 
    yo: 'Bẹ̀rẹ̀ Fífi Ránṣẹ́', 
    ha: 'Fara Shigar', 
    ig: 'Malite E-Filing' 
  },
  'btn.submitReturn': { 
    en: 'Submit Return', 
    pcm: 'Submit Return', 
    yo: 'Fi Ránṣẹ́', 
    ha: 'Mika Dawowa', 
    ig: 'Nyefee Nlọghachi' 
  },
  'btn.payNow': { 
    en: 'Pay Now', 
    pcm: 'Pay Now', 
    yo: 'Sanwó Báyìí', 
    ha: 'Biya Yanzu', 
    ig: 'Kwụọ Ugbu a' 
  },
  'btn.downloadReceipt': { 
    en: 'Download Receipt', 
    pcm: 'Download Receipt', 
    yo: 'Gbà Ìwé-ẹ̀rí Owó', 
    ha: 'Sauke Rasit', 
    ig: 'Budata Nnata' 
  },
  'btn.fileAnother': { 
    en: 'File Another Return', 
    pcm: 'File Another Return', 
    yo: 'Fi Mìíràn Ránṣẹ́', 
    ha: 'Shigar da Wani', 
    ig: 'Nyefee Ọzọ' 
  },
  'btn.viewDetails': { 
    en: 'View Details', 
    pcm: 'See Details', 
    yo: 'Wo Àwọn Àlàyé', 
    ha: 'Duba Cikakkun Bayanai', 
    ig: 'Lee Nkọwa' 
  },
  'btn.markComplete': { 
    en: 'Mark as Complete', 
    pcm: 'Mark as Done', 
    yo: 'Sàmì Gẹ́gẹ́ bí Tó Parí', 
    ha: 'Yiwa Alamar An Kammala', 
    ig: 'Kaa ka Emezuru' 
  },
  'btn.trustDevice': { 
    en: 'Trust Device', 
    pcm: 'Trust This Device', 
    yo: 'Gbẹ́kẹ̀lé Ẹ̀rọ Yìí', 
    ha: 'Amince da Na\'ura', 
    ig: 'Tụkwasị Ngwaọrụ Obi' 
  },
  'btn.blockDevice': { 
    en: 'Block Device', 
    pcm: 'Block This Device', 
    yo: 'Dènà Ẹ̀rọ Yìí', 
    ha: 'Toshe Na\'ura', 
    ig: 'Gbochie Ngwaọrụ' 
  },
  'btn.removeDevice': { 
    en: 'Remove Device', 
    pcm: 'Remove This Device', 
    yo: 'Yọ Ẹ̀rọ Yìí Kúrò', 
    ha: 'Cire Na\'ura', 
    ig: 'Wepụ Ngwaọrụ' 
  },
  
  
  // E-Filing
  'efiling.title': { 
    en: 'E-Filing & Payment', 
    pcm: 'E-Filing & Payment', 
    yo: 'Fífi Ránṣẹ́ & Ìsanwó', 
    ha: 'Shigar & Biya', 
    ig: 'E-Filing & Ịkwụ Ụgwọ' 
  },
  'efiling.selectBusiness': { 
    en: 'Select Business to File', 
    pcm: 'Choose Business to File', 
    yo: 'Yan Iṣẹ́ Láti Fí Ránṣẹ́', 
    ha: 'Zaɓi Kasuwanci don Shigar', 
    ig: 'Họrọ Azụmaahịa Iji Fanye' 
  },
  'efiling.noBusinesses': { 
    en: 'No saved businesses. Save a business first to file returns.', 
    pcm: 'You never save any business. Save business first before you fit file.', 
    yo: 'Kò sí iṣẹ́ tí o fipamọ́. Fi iṣẹ́ pamọ́ kí o tó lè fí ránṣẹ́.', 
    ha: 'Babu kasuwanci da aka ajiye. Ajiye kasuwanci da farko.', 
    ig: 'Ọ dịghị azụmaahịa echekwara. Chekwaa azụmaahịa tupu ịfanye.' 
  },
  'efiling.chooseBusiness': { 
    en: 'Choose a business', 
    pcm: 'Choose a business', 
    yo: 'Yan iṣẹ́ kan', 
    ha: 'Zaɓi kasuwanci', 
    ig: 'Họrọ azụmaahịa' 
  },
  'efiling.estTaxDue': { 
    en: 'Est. Tax Due', 
    pcm: 'Tax Wey You Go Pay', 
    yo: 'Owó-orí Tí A Rò', 
    ha: 'Kiyasin Harajin da za\'a biya', 
    ig: 'Nkwurịta Ụtụ A Ga-akwụ' 
  },
  'efiling.reviewReturn': { 
    en: 'Review Pre-Filled Return', 
    pcm: 'Check Return Wey Don Fill', 
    yo: 'Ṣàyẹ̀wò Ìpadàsí Tí A Ti Kún', 
    ha: 'Sake duba Dawowa da Aka Cika', 
    ig: 'Nyochaa Nlọghachi Ejupụtara' 
  },
  'efiling.mockDemo': { 
    en: 'Mock E-Filing', 
    pcm: 'Mock E-Filing', 
    yo: 'Ìdánwò Fífi Ránṣẹ́', 
    ha: 'Gwajin Shigar', 
    ig: 'Nnwale E-Filing' 
  },
  'efiling.realIntegration': { 
    en: 'This is a demonstration. Real FIRS integration coming soon!', 
    pcm: 'This na just demo. Real FIRS go come soon!', 
    yo: 'Èyí jẹ́ ìfihàn. Ìsopọ̀ FIRS gangan ń bọ̀ láìpẹ́!', 
    ha: 'Wannan nuni ne. Haɗin FIRS na gaske yana zuwa nan da nan!', 
    ig: 'Nke a bụ ngosi. Njikọ FIRS n\'ezie na-abịa n\'oge adịghị anya!' 
  },
  'efiling.processing': { 
    en: 'Processing Your Return', 
    pcm: 'Processing Your Return', 
    yo: 'Ń Ṣàlàyé Ìpadàsí Rẹ', 
    ha: 'Ana Aiki da Dawowarka', 
    ig: 'Na-arụ Ọrụ na Nlọghachi Gị' 
  },
  'efiling.submittedSuccess': { 
    en: 'Return Submitted Successfully!', 
    pcm: 'Return Don Submit!', 
    yo: 'A Ti Fí Ìpadàsí Ránṣẹ́ Dáadáa!', 
    ha: 'An Mika Dawowa Cikin Nasara!', 
    ig: 'Nyefere Nlọghachi Nke Ọma!' 
  },
  'efiling.taxDue': { 
    en: 'Tax Due', 
    pcm: 'Tax Wey You Go Pay', 
    yo: 'Owó-orí Tí O Gbọ́dọ̀ San', 
    ha: 'Harajin da za\'a biya', 
    ig: 'Ụtụ Aga Akwụ' 
  },
  'efiling.filingComplete': { 
    en: 'Filing Complete!', 
    pcm: 'Filing Done!', 
    yo: 'Fífi Ránṣẹ́ Ti Parí!', 
    ha: 'Shigar Ya Kammala!', 
    ig: 'Filing Emezula!' 
  },
  'efiling.paymentProcessed': { 
    en: 'Your tax return has been submitted and payment processed.', 
    pcm: 'Your tax return don submit and payment don process.', 
    yo: 'A ti fi ìpadàsí owó-orí rẹ ránṣẹ́ àti a ti ṣe ìsanwó.', 
    ha: 'An mika dawowar harajinka kuma an aiwatar da biyan kuɗi.', 
    ig: 'Enyefela nlọghachi ụtụ gị ma kwụọ ụgwọ.' 
  },
  'efiling.filingReference': { 
    en: 'Filing Reference', 
    pcm: 'Filing Reference', 
    yo: 'Àkọsílẹ̀ Fífi Ránṣẹ́', 
    ha: 'Maganar Shigar', 
    ig: 'Nrụaka Filing' 
  },
  'efiling.paymentReference': { 
    en: 'Payment Reference', 
    pcm: 'Payment Reference', 
    yo: 'Àkọsílẹ̀ Ìsanwó', 
    ha: 'Maganar Biyan Kuɗi', 
    ig: 'Nrụaka Ịkwụ Ụgwọ' 
  },
  'efiling.amountPaid': { 
    en: 'Amount Paid', 
    pcm: 'Amount Wey You Pay', 
    yo: 'Iye Owó Tí O San', 
    ha: 'Adadin da Aka Biya', 
    ig: 'Ego Akwụrụ' 
  },
  'efiling.status': { 
    en: 'Status', 
    pcm: 'Status', 
    yo: 'Ipò', 
    ha: 'Matsayi', 
    ig: 'Ọnọdụ' 
  },
  'efiling.completed': { 
    en: 'Completed', 
    pcm: 'Done', 
    yo: 'Ti Parí', 
    ha: 'An Kammala', 
    ig: 'Emezuru' 
  },
  
  // Tooltips
  'tooltip.securityScore': { 
    en: 'Your security score based on account protection measures', 
    pcm: 'How your account dey protected', 
    yo: 'Ìwọ̀n ààbò rẹ dá lórí àwọn ètò ààbò àkọọ́lẹ̀', 
    ha: 'Makin tsaron ku bisa matakan kariyar asusu', 
    ig: 'Akara nchekwa gị dabere na usoro nchekwa akaụntụ' 
  },
  'tooltip.trustedDevice': { 
    en: 'This device is trusted and can access your account without additional verification', 
    pcm: 'This device trusted. E fit enter your account without extra check', 
    yo: 'A gbẹ́kẹ̀lé ẹ̀rọ yìí ó sì lè wọ àkọọ́lẹ̀ rẹ láì sí ìjẹ́rìísí míràn', 
    ha: 'An amince da wannan na\'ura kuma tana iya samun damar asusunka ba tare da ƙarin tabbatarwa ba', 
    ig: 'Atụkwasịrị ngwaọrụ a obi ma nwee ike ịbanye akaụntụ gị na-enweghị nyocha ọzọ' 
  },
  'tooltip.blockedDevice': { 
    en: 'This device is blocked and cannot access your account', 
    pcm: 'This device don block. E no fit enter your account', 
    yo: 'A ti dínà ẹ̀rọ yìí kò sì lè wọ àkọọ́lẹ̀ rẹ', 
    ha: 'An toshe wannan na\'ura kuma ba za ta iya samun damar asusunka ba', 
    ig: 'Egbochiri ngwaọrụ a ma enweghị ike ịbanye akaụntụ gị' 
  },
  'tooltip.mfaEnabled': { 
    en: 'Two-factor authentication adds an extra layer of security to your account', 
    pcm: '2FA go add extra security to your account', 
    yo: 'Ìjẹ́rìísí ọ̀nà méjì ń fi àfikún ààbò kún àkọọ́lẹ̀ rẹ', 
    ha: 'Tabbatarwar hanyoyi biyu yana ƙara wani mataki na tsaro ga asusunka', 
    ig: 'Nyocha ụzọ abụọ na-etinye nchekwa ọzọ na akaụntụ gị' 
  },
  'tooltip.backupCodes': { 
    en: 'Backup codes can be used to access your account if you lose access to your authenticator', 
    pcm: 'Backup code fit help you enter your account if your authenticator no dey', 
    yo: 'Àwọn kóòdù àfipamọ́ lè jẹ́ lílò láti wọ àkọọ́lẹ̀ rẹ tí o bá pàdánù ẹ̀rọ ìjẹ́rìísí rẹ', 
    ha: 'Ana iya amfani da lambobin ajiya don samun damar asusunka idan ka rasa damar mai tabbatarwa', 
    ig: 'Enwere ike iji koodu nchekwa banye akaụntụ gị ma ị furu ngwaọrụ nyocha gị' 
  },
  'tooltip.deductibleExpense': { 
    en: 'This expense can be deducted from your taxable income', 
    pcm: 'This expense fit reduce the tax wey you go pay', 
    yo: 'Inawo yìí lè yọ kúrò nínú owó tí a gbọ́dọ̀ san owó-orí lórí rẹ̀', 
    ha: 'Za\'a iya cire wannan kashewa daga kuɗin shigarku da ake biya haraji', 
    ig: 'Enwere ike iwepụ mmefu a na ego a ga-atụ ụtụ' 
  },
  'tooltip.taxSavings': { 
    en: 'The amount of tax you saved through deductions and exemptions', 
    pcm: 'How much tax you save through deductions', 
    yo: 'Iye owó-orí tí o fipamọ́ nípasẹ̀ àwọn ìyọkúrò àti àwọn ìfàsẹ́yìn', 
    ha: 'Adadin harajin da kuka tanada ta hanyar ragewa da keɓewa', 
    ig: 'Ego ụtụ ị zọpụtara site na mwepu na mpụnarị' 
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
