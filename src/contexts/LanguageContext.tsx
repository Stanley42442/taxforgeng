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
  },

  // Calculator page
  'calculator.title': { 
    en: 'Tax Calculator', 
    pcm: 'Tax Calculator', 
    yo: 'Ẹ̀rọ Ìṣirò Owó-orí', 
    ha: 'Na\'urar Ƙididdige Haraji', 
    ig: 'Ngwa Mgbako Ụtụ' 
  },
  'calculator.subtitle': { 
    en: 'Calculate your Nigerian taxes accurately', 
    pcm: 'Calculate your Nigeria tax correct', 
    yo: 'Ṣe ìṣirò owó-orí Nàìjíríà rẹ dáadáa', 
    ha: 'Ƙididdige harajin Najeriya daidai', 
    ig: 'Gbakọọ ụtụ Naịjirịa gị nke ọma' 
  },
  'calculator.firsCompliant': { 
    en: 'FIRS Compliant Calculator', 
    pcm: 'Calculator Wey Follow FIRS Rule', 
    yo: 'Ẹ̀rọ Ìṣirò tó Bá FIRS Mu', 
    ha: 'Na\'ura Mai Biyayya ga FIRS', 
    ig: 'Ngwa Mgbako Na-edebe Iwu FIRS' 
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
    pcm: 'Money Wey Enter For Year', 
    yo: 'Owó tó Wọlé Lọ́dún', 
    ha: 'Kuɗin Shekara', 
    ig: 'Ego Afọ' 
  },
  'calculator.expenses': { 
    en: 'Business Expenses', 
    pcm: 'Money Wey You Spend', 
    yo: 'Ìnáwó Iṣẹ́', 
    ha: 'Kashe Kuɗin Kasuwanci', 
    ig: 'Mmefu Azụmaahịa' 
  },
  'calculator.rentPaid': { 
    en: 'Rent Paid', 
    pcm: 'House Rent Wey You Pay', 
    yo: 'Owó Ilé tó San', 
    ha: 'Hayar da Aka Biya', 
    ig: 'Ego Ụlọ E Kwụrụ' 
  },
  'calculator.vatableSales': { 
    en: 'VATable Sales', 
    pcm: 'Sales With VAT', 
    yo: 'Àwọn Títà tó Ní VAT', 
    ha: 'Sayayya mai VAT', 
    ig: 'Ire Nwere VAT' 
  },
  'calculator.vatablePurchases': { 
    en: 'VATable Purchases', 
    pcm: 'Things Wey You Buy With VAT', 
    yo: 'Àwọn Rírà tó Ní VAT', 
    ha: 'Saye mai VAT', 
    ig: 'Azụmahịa Nwere VAT' 
  },
  'calculator.rentalIncome': { 
    en: 'Rental Income', 
    pcm: 'Rent Money Wey You Collect', 
    yo: 'Owó Ìyálé', 
    ha: 'Kuɗin Haya', 
    ig: 'Ego Ụlọ E Natara' 
  },
  'calculator.consultancyIncome': { 
    en: 'Consultancy Income', 
    pcm: 'Consulting Money', 
    yo: 'Owó Ìgbìmọ̀ràn', 
    ha: 'Kuɗin Shawarwari', 
    ig: 'Ego Ndụmọdụ' 
  },
  'calculator.dividendIncome': { 
    en: 'Dividend Income', 
    pcm: 'Shares Money', 
    yo: 'Owó Ìpín', 
    ha: 'Kuɗin Rabo', 
    ig: 'Ego Nkesa' 
  },
  'calculator.capitalGains': { 
    en: 'Capital Gains', 
    pcm: 'Profit From Selling Property', 
    yo: 'Ẹ̀rè Ohun-ìní', 
    ha: 'Ribar Jari', 
    ig: 'Uru Akụ' 
  },
  'calculator.foreignIncome': { 
    en: 'Foreign Income', 
    pcm: 'Money From Abroad', 
    yo: 'Owó Láti Ilẹ̀ Òkèèrè', 
    ha: 'Kuɗin Waje', 
    ig: 'Ego Si Mba Ọzọ' 
  },
  'calculator.fixedAssets': { 
    en: 'Fixed Assets Value', 
    pcm: 'Value of Property and Equipment', 
    yo: 'Iye Ohun-ìní Àgbékalẹ̀', 
    ha: 'Darajar Kadarori', 
    ig: 'Uru Akụ Kwụsịrị Ike' 
  },
  'calculator.calculateTax': { 
    en: 'Calculate Tax', 
    pcm: 'Calculate Tax', 
    yo: 'Ṣe Ìṣirò Owó-orí', 
    ha: 'Ƙididdige Haraji', 
    ig: 'Gbakọọ Ụtụ' 
  },
  'calculator.businessName': { 
    en: 'Business Name', 
    pcm: 'Business Name', 
    yo: 'Orúkọ Iṣẹ́', 
    ha: 'Sunan Kasuwanci', 
    ig: 'Aha Azụmaahịa' 
  },
  'calculator.company': { 
    en: 'Company (LTD)', 
    pcm: 'Limited Company', 
    yo: 'Ilé-iṣẹ́ (LTD)', 
    ha: 'Kamfani (LTD)', 
    ig: 'Ụlọ Ọrụ (LTD)' 
  },
  'calculator.2026Rules': { 
    en: 'Nigeria Tax Act 2025 Rules', 
    pcm: '2026 Tax Rules', 
    yo: 'Òfin Owó-orí 2025', 
    ha: 'Dokokin Haraji 2025', 
    ig: 'Iwu Ụtụ 2025' 
  },
  'calculator.pre2026Rules': { 
    en: 'Current (Pre-2026) Rules', 
    pcm: 'Old Rules', 
    yo: 'Òfin Lọ́wọ́lọ́wọ́', 
    ha: 'Dokokin Yanzu', 
    ig: 'Iwu Ugbu A' 
  },
  'calculator.primaryIncome': { 
    en: 'Primary Income', 
    pcm: 'Main Money', 
    yo: 'Owó Àkọ́kọ́', 
    ha: 'Kuɗi Na Farko', 
    ig: 'Ego Mbụ' 
  },
  'calculator.additionalIncome': { 
    en: 'Additional Income', 
    pcm: 'Extra Money', 
    yo: 'Owó Àfikún', 
    ha: 'Ƙarin Kuɗi', 
    ig: 'Ego Ọzọ' 
  },
  'calculator.vatDetails': { 
    en: 'VAT Details', 
    pcm: 'VAT Details', 
    yo: 'Àlàyé VAT', 
    ha: 'Cikakken Bayani na VAT', 
    ig: 'Nkọwa VAT' 
  },
  'calculator.quickAddExpense': { 
    en: 'Quick Add Expense', 
    pcm: 'Quick Add Expense', 
    yo: 'Fi Ìnáwó Kún Yára', 
    ha: 'Ƙara Kashewa Cikin Sauri', 
    ig: 'Tinye Mmefu Ngwa Ngwa' 
  },

  // Expenses page
  'expense.title': { 
    en: 'Expense Tracker', 
    pcm: 'Track Your Spending', 
    yo: 'Tẹ̀lé Ìnáwó Rẹ', 
    ha: 'Binciken Kashewa', 
    ig: 'Nsoro Mmefu' 
  },
  'expense.subtitle': { 
    en: 'Track income and expenses for all your businesses', 
    pcm: 'Track money wey enter and comot for your business', 
    yo: 'Tẹ̀lé owó tó wọlé àti tó jáde fún àwọn iṣẹ́ rẹ', 
    ha: 'Bin duk kuɗin shiga da kashewa na kasuwancinka', 
    ig: 'Soro ego batara na pụrụ n\'azụmaahịa gị niile' 
  },
  'expense.addExpense': { 
    en: 'Add Expense', 
    pcm: 'Add Money Wey Comot', 
    yo: 'Fi Ìnáwó Kún', 
    ha: 'Ƙara Kashewa', 
    ig: 'Tinye Mmefu' 
  },
  'expense.addIncome': { 
    en: 'Add Income', 
    pcm: 'Add Money Wey Enter', 
    yo: 'Fi Owó Tó Wọlé Kún', 
    ha: 'Ƙara Kuɗi', 
    ig: 'Tinye Ego' 
  },
  'expense.totalIncome': { 
    en: 'Total Income', 
    pcm: 'All Money Wey Enter', 
    yo: 'Àpapọ̀ Owó Tó Wọlé', 
    ha: 'Jimlar Kuɗi', 
    ig: 'Mkpokọta Ego' 
  },
  'expense.totalExpenses': { 
    en: 'Total Expenses', 
    pcm: 'All Money Wey Comot', 
    yo: 'Àpapọ̀ Ìnáwó', 
    ha: 'Jimlar Kashewa', 
    ig: 'Mkpokọta Mmefu' 
  },
  'expense.netIncome': { 
    en: 'Net Income', 
    pcm: 'Profit', 
    yo: 'Owó Tó Kù', 
    ha: 'Kuɗin da Ya Rage', 
    ig: 'Ego Fọdụrụ' 
  },
  'expense.deductible': { 
    en: 'Tax Deductible', 
    pcm: 'E Fit Reduce Tax', 
    yo: 'Ó lè dín owó-orí kù', 
    ha: 'Za a iya rage haraji', 
    ig: 'Nwere ike belata ụtụ' 
  },
  'expense.category': { 
    en: 'Category', 
    pcm: 'Type', 
    yo: 'Ẹ̀ka', 
    ha: 'Rukuni', 
    ig: 'Ụdị' 
  },
  'expense.date': { 
    en: 'Date', 
    pcm: 'Date', 
    yo: 'Ọjọ́', 
    ha: 'Kwanan wata', 
    ig: 'Ụbọchị' 
  },
  'expense.description': { 
    en: 'Description', 
    pcm: 'Wetin E Be', 
    yo: 'Àpèjúwe', 
    ha: 'Bayani', 
    ig: 'Nkọwa' 
  },
  'expense.amount': { 
    en: 'Amount', 
    pcm: 'How Much', 
    yo: 'Iye', 
    ha: 'Adadin', 
    ig: 'Ego Ole' 
  },
  'expense.scanReceipt': { 
    en: 'Scan Receipt', 
    pcm: 'Scan Receipt', 
    yo: 'Ṣayẹwo Ìwé Ẹ̀rí', 
    ha: 'Duba Rasiti', 
    ig: 'Nyochaa Ereesiiti' 
  },
  'expense.importCSV': { 
    en: 'Import CSV', 
    pcm: 'Upload CSV File', 
    yo: 'Gbé CSV Wọlé', 
    ha: 'Shigar da CSV', 
    ig: 'Bubata CSV' 
  },
  'expense.exportPDF': { 
    en: 'Export PDF', 
    pcm: 'Download PDF', 
    yo: 'Gbé PDF Jáde', 
    ha: 'Sauke PDF', 
    ig: 'Budata PDF' 
  },
  'expense.budget': { 
    en: 'Monthly Budget', 
    pcm: 'Monthly Budget', 
    yo: 'Ìṣúná Oṣù', 
    ha: 'Kasafin Wata', 
    ig: 'Mmefu Ọnwa' 
  },
  'expense.setBudget': { 
    en: 'Set Budget', 
    pcm: 'Set How Much You Wan Spend', 
    yo: 'Ṣètò Ìṣúná', 
    ha: 'Saita Kasafin', 
    ig: 'Tọọ Mmefu' 
  },
  'expense.recurring': { 
    en: 'Recurring Expenses', 
    pcm: 'Regular Expenses', 
    yo: 'Ìnáwó Tó Ń Padà Wá', 
    ha: 'Kashewar da Ke Maimaitawa', 
    ig: 'Mmefu Na-alaghachi' 
  },
  'expense.analytics': { 
    en: 'Analytics', 
    pcm: 'See Charts', 
    yo: 'Àyẹ̀wò', 
    ha: 'Nazari', 
    ig: 'Nnyocha' 
  },
  'expense.comparison': { 
    en: 'Monthly Comparison', 
    pcm: 'Compare Month by Month', 
    yo: 'Ìfiwé Oṣù', 
    ha: 'Kwatanta Wata-wata', 
    ig: 'Ntụnyere Ọnwa' 
  },

  // Results page
  'results.title': { 
    en: 'Tax Calculation Results', 
    pcm: 'Your Tax Calculation', 
    yo: 'Èsì Ìṣirò Owó-orí', 
    ha: 'Sakamakon Ƙididdige Haraji', 
    ig: 'Nsonaazụ Mgbako Ụtụ' 
  },
  'results.grossIncome': { 
    en: 'Gross Income', 
    pcm: 'Total Money Wey Enter', 
    yo: 'Owó Tó Wọlé Lápapọ̀', 
    ha: 'Jimlar Kuɗi', 
    ig: 'Mkpokọta Ego' 
  },
  'results.taxableIncome': { 
    en: 'Taxable Income', 
    pcm: 'Money Wey Get Tax', 
    yo: 'Owó Tí A Lè Gbá Owó-orí Lé', 
    ha: 'Kuɗin da Ake Biyan Haraji', 
    ig: 'Ego Nwere Ụtụ' 
  },
  'results.totalTaxPayable': { 
    en: 'Total Tax Payable', 
    pcm: 'Total Tax Wey You Go Pay', 
    yo: 'Àpapọ̀ Owó-orí Láti San', 
    ha: 'Jimlar Harajin da Za a Biya', 
    ig: 'Mkpokọta Ụtụ Ị Ga-akwụ' 
  },
  'results.effectiveRate': { 
    en: 'Effective Tax Rate', 
    pcm: 'Real Tax Percentage', 
    yo: 'Ìwọ̀n Owó-orí Gangan', 
    ha: 'Ainihin Farashin Haraji', 
    ig: 'Ọnụọgụ Ụtụ N\'ezie' 
  },
  'results.breakdown': { 
    en: 'Tax Breakdown', 
    pcm: 'How Tax Break Down', 
    yo: 'Ìpínkiri Owó-orí', 
    ha: 'Ragargaje Harajin', 
    ig: 'Nkewa Ụtụ' 
  },
  'results.viewBreakdown': { 
    en: 'View Breakdown', 
    pcm: 'See How E Break Down', 
    yo: 'Wo Ìpínkiri', 
    ha: 'Duba Ragargajewa', 
    ig: 'Lee Nkewa' 
  },
  'results.showComparison': { 
    en: 'Show Comparison', 
    pcm: 'Compare Am', 
    yo: 'Fi Ìfiwé Hàn', 
    ha: 'Nuna Kwatanci', 
    ig: 'Gosi Ntụnyere' 
  },
  'results.saveBusiness': { 
    en: 'Save Business', 
    pcm: 'Keep This Business', 
    yo: 'Fi Iṣẹ́ Pamọ́', 
    ha: 'Ajiye Kasuwanci', 
    ig: 'Chekwaa Azụmaahịa' 
  },
  'results.downloadPDF': { 
    en: 'Download PDF', 
    pcm: 'Download PDF', 
    yo: 'Gbàmọ́lé PDF', 
    ha: 'Sauke PDF', 
    ig: 'Budata PDF' 
  },
  'results.downloadCSV': { 
    en: 'Download CSV', 
    pcm: 'Download CSV', 
    yo: 'Gbàmọ́lé CSV', 
    ha: 'Sauke CSV', 
    ig: 'Budata CSV' 
  },
  'results.backToCalculator': { 
    en: 'Back to Calculator', 
    pcm: 'Go Back to Calculator', 
    yo: 'Padà sí Ẹ̀rọ Ìṣirò', 
    ha: 'Koma zuwa Na\'ura', 
    ig: 'Laghachi na Ngwa Mgbako' 
  },
  'results.entityComparison': { 
    en: 'Entity Comparison Dashboard', 
    pcm: 'Compare Business Types', 
    yo: 'Pánẹ́ẹ̀lì Ìfiwé Iṣẹ́', 
    ha: 'Kwatanta Nau\'in Kasuwanci', 
    ig: 'Tụnyere Ụdị Azụmaahịa' 
  },
  'results.optimalStructure': { 
    en: 'You selected the optimal structure!', 
    pcm: 'You choose the best one!', 
    yo: 'O ti yan ètò tó dára jù!', 
    ha: 'Ka zaɓi tsari mafi kyau!', 
    ig: 'Ị họọrọ nhọrọ kacha mma!' 
  },
  'results.couldSave': { 
    en: 'Switching could save you', 
    pcm: 'If you change you fit save', 
    yo: 'Títí yípadà lè jẹ́ kí o fipamọ́', 
    ha: 'Sauya zai iya cece maka', 
    ig: 'Ịgbanwe nwere ike ịchekwa gị' 
  },

  // Reminders page
  'reminders.title': { 
    en: 'Tax Deadline Reminders', 
    pcm: 'Tax Deadline Reminders', 
    yo: 'Ìránṣọ́ Àkókò Ìparí Owó-orí', 
    ha: 'Tunatarwar Ƙarshen Lokacin Haraji', 
    ig: 'Ncheta Oge Njedebe Ụtụ' 
  },
  'reminders.subtitle': { 
    en: 'Set up automated reminders for your tax filing deadlines', 
    pcm: 'Set reminder so you no go forget tax deadline', 
    yo: 'Ṣètò ìránṣọ́ fún àwọn àkókò ìparí owó-orí rẹ', 
    ha: 'Saita tunatarwar don ƙarshen lokacin harajinka', 
    ig: 'Tọọ ncheta maka oge njedebe ịkwụ ụtụ gị' 
  },
  'reminders.enableNotifications': { 
    en: 'Enable Push Notifications', 
    pcm: 'Turn On Notifications', 
    yo: 'Mú Ìfitónilétí Ṣiṣẹ́', 
    ha: 'Kunna Sanarwa', 
    ig: 'Mepee Ọkwa' 
  },
  'reminders.notificationsEnabled': { 
    en: 'Notifications Enabled', 
    pcm: 'Notifications Don Turn On', 
    yo: 'Ìfitónilétí Ti Ṣiṣẹ́', 
    ha: 'An Kunna Sanarwa', 
    ig: 'Emepeela Ọkwa' 
  },
  'reminders.addCustom': { 
    en: 'Add Custom Reminder', 
    pcm: 'Add Your Own Reminder', 
    yo: 'Fi Ìránṣọ́ Àdáni Kún', 
    ha: 'Ƙara Tunatarwa Na Musamman', 
    ig: 'Tinye Ncheta Nke Gị' 
  },
  'reminders.monthlyVAT': { 
    en: 'Monthly VAT Filing', 
    pcm: 'Monthly VAT', 
    yo: 'Fífi VAT Ránṣẹ́ Oṣù', 
    ha: 'Fayil VAT na Wata', 
    ig: 'Ịdekọ VAT Ọnwa' 
  },
  'reminders.annualCIT': { 
    en: 'Annual CIT Return', 
    pcm: 'Yearly Company Tax', 
    yo: 'Ìpadà CIT Ọdún', 
    ha: 'Dawowar CIT ta Shekara', 
    ig: 'Nlọghachi CIT Afọ' 
  },
  'reminders.pitRemittance': { 
    en: 'PIT Remittance', 
    pcm: 'Personal Tax Payment', 
    yo: 'Fífi PIT Ránṣẹ́', 
    ha: 'Biyan PIT', 
    ig: 'Ịkwụ PIT' 
  },
  'reminders.payeRemittance': { 
    en: 'PAYE Remittance', 
    pcm: 'Staff Tax Payment', 
    yo: 'Fífi PAYE Ránṣẹ́', 
    ha: 'Biyan PAYE', 
    ig: 'Ịkwụ PAYE' 
  },
  'reminders.sendTestEmail': { 
    en: 'Send Test Email', 
    pcm: 'Send Test Email', 
    yo: 'Fi Ìmèélì Ìdánwò Ránṣẹ́', 
    ha: 'Aika Imel ɗin Gwaji', 
    ig: 'Zipu Email Nnwale' 
  },
  'reminders.whatsappNotify': { 
    en: 'WhatsApp Notification', 
    pcm: 'WhatsApp Alert', 
    yo: 'Ìfitónilétí WhatsApp', 
    ha: 'Sanarwar WhatsApp', 
    ig: 'Ọkwa WhatsApp' 
  },
  'reminders.emailNotify': { 
    en: 'Email Notification', 
    pcm: 'Email Alert', 
    yo: 'Ìfitónilétí Ìmèélì', 
    ha: 'Sanarwar Imel', 
    ig: 'Ọkwa Email' 
  },

  // Settings page
  'settings.title': { 
    en: 'Settings', 
    pcm: 'Settings', 
    yo: 'Ètò', 
    ha: 'Saituna', 
    ig: 'Ntọala' 
  },
  'settings.profile': { 
    en: 'Profile', 
    pcm: 'Your Info', 
    yo: 'Àkọọ́lẹ̀', 
    ha: 'Bayanan Kai', 
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
    pcm: 'Alerts', 
    yo: 'Ìfitónilétí', 
    ha: 'Sanarwa', 
    ig: 'Ọkwa' 
  },
  'settings.reports': { 
    en: 'Scheduled Reports', 
    pcm: 'Auto Reports', 
    yo: 'Ìròyìn tó Ti Gbékalẹ̀', 
    ha: 'Rahotannin da Aka Tsara', 
    ig: 'Akụkọ Ahaziri' 
  },
  'settings.fullName': { 
    en: 'Full Name', 
    pcm: 'Your Name', 
    yo: 'Orúkọ Kíkún', 
    ha: 'Cikakken Suna', 
    ig: 'Aha Zuru Oke' 
  },
  'settings.email': { 
    en: 'Email Address', 
    pcm: 'Email', 
    yo: 'Àdírẹ́sì Ìmèélì', 
    ha: 'Adireshin Imel', 
    ig: 'Adreesị Email' 
  },
  'settings.changeEmail': { 
    en: 'Change Email', 
    pcm: 'Change Email', 
    yo: 'Yí Ìmèélì Padà', 
    ha: 'Canja Imel', 
    ig: 'Gbanwee Email' 
  },
  'settings.changePassword': { 
    en: 'Change Password', 
    pcm: 'Change Password', 
    yo: 'Yí Ọ̀rọ̀ Aṣínà Padà', 
    ha: 'Canja Kalmar Wucewa', 
    ig: 'Gbanwee Okwuntụghe' 
  },
  'settings.currentPassword': { 
    en: 'Current Password', 
    pcm: 'Your Current Password', 
    yo: 'Ọ̀rọ̀ Aṣínà Lọ́wọ́', 
    ha: 'Kalmar Wucewa ta Yanzu', 
    ig: 'Okwuntụghe Ugbu A' 
  },
  'settings.newPassword': { 
    en: 'New Password', 
    pcm: 'New Password', 
    yo: 'Ọ̀rọ̀ Aṣínà Tuntun', 
    ha: 'Sabuwar Kalmar Wucewa', 
    ig: 'Okwuntụghe Ọhụrụ' 
  },
  'settings.confirmPassword': { 
    en: 'Confirm Password', 
    pcm: 'Enter Password Again', 
    yo: 'Jẹ́rìí Ọ̀rọ̀ Aṣínà', 
    ha: 'Tabbatar da Kalmar Wucewa', 
    ig: 'Kwenye Okwuntụghe' 
  },
  'settings.enable2FA': { 
    en: 'Enable Two-Factor Authentication', 
    pcm: 'Add Extra Security', 
    yo: 'Mú Ìdánilójú Méjì Ṣiṣẹ́', 
    ha: 'Kunna Tantancewa Biyu', 
    ig: 'Mepee Nkwenye Ugboro Abụọ' 
  },
  'settings.backupCodes': { 
    en: 'Backup Codes', 
    pcm: 'Emergency Codes', 
    yo: 'Àwọn Kóòdù Ìfipamọ́', 
    ha: 'Lambobin Ajiya', 
    ig: 'Koodu Ndabere' 
  },
  'settings.activityLog': { 
    en: 'Activity Log', 
    pcm: 'Your Activity', 
    yo: 'Ìwé Ìṣe', 
    ha: 'Tarihin Aiki', 
    ig: 'Ndekọ Ọrụ' 
  },
  'settings.whatsappNumber': { 
    en: 'WhatsApp Number', 
    pcm: 'WhatsApp Number', 
    yo: 'Nọ́mbà WhatsApp', 
    ha: 'Lambar WhatsApp', 
    ig: 'Nọmba WhatsApp' 
  },
  'settings.testNotification': { 
    en: 'Test Notification', 
    pcm: 'Test Alert', 
    yo: 'Dán Ìfitónilétí Wò', 
    ha: 'Gwada Sanarwa', 
    ig: 'Nwalee Ọkwa' 
  },
  'settings.saveChanges': { 
    en: 'Save Changes', 
    pcm: 'Keep Changes', 
    yo: 'Fi Àwọn Àyípadà Pamọ́', 
    ha: 'Ajiye Canje-canje', 
    ig: 'Chekwaa Mgbanwe' 
  },
  'settings.updateProfile': { 
    en: 'Update Profile', 
    pcm: 'Update Your Info', 
    yo: 'Mú Àkọọ́lẹ̀ Ṣe Tuntun', 
    ha: 'Sabunta Bayani', 
    ig: 'Melite Profaịlụ' 
  },

  // Learn page
  'learn.title': { 
    en: 'Tax Academy', 
    pcm: 'Tax Academy', 
    yo: 'Ilé Ẹ̀kọ́ Owó-orí', 
    ha: 'Makarantar Haraji', 
    ig: 'Ụlọ Akwụkwọ Ụtụ' 
  },
  'learn.subtitle': { 
    en: 'Master Nigerian tax rules • Bust common myths • Learn sector incentives', 
    pcm: 'Understand Nigeria tax • Know the truth • Learn about different business', 
    yo: 'Mọ òfin owó-orí Nàìjíríà • Fọ àwọn àsọjáde • Kọ́ àwọn ìmúṣe ẹ̀ka', 
    ha: 'Koyi dokokin harajin Najeriya • Karyata tatsuniyoyi • Koyi fa\'idodin sashe', 
    ig: 'Mụta iwu ụtụ Naịjirịa • Kwatụ akụkọ ụgha • Mụta uru ngalaba' 
  },
  'learn.yourTaxTips': { 
    en: 'Your Tax Tips', 
    pcm: 'Tax Tips For You', 
    yo: 'Àwọn Ìmọ̀ràn Owó-orí Rẹ', 
    ha: 'Shawarwarin Haraji', 
    ig: 'Ndụmọdụ Ụtụ Gị' 
  },
  'learn.quizProgress': { 
    en: 'Quiz Progress', 
    pcm: 'Quiz Progress', 
    yo: 'Ìtẹ̀síwájú Ìdánwò', 
    ha: 'Ci gaban Jarrabawa', 
    ig: 'Ọganihu Ajụjụ' 
  },
  'learn.myths': { 
    en: 'Myths', 
    pcm: 'Myths', 
    yo: 'Àsọjáde', 
    ha: 'Tatsuniyoyi', 
    ig: 'Akụkọ Ụgha' 
  },
  'learn.videos': { 
    en: 'Videos', 
    pcm: 'Videos', 
    yo: 'Fídíò', 
    ha: 'Bidiyo', 
    ig: 'Vidiyo' 
  },
  'learn.sectors': { 
    en: 'Sectors', 
    pcm: 'Business Types', 
    yo: 'Àwọn Ẹ̀ka', 
    ha: 'Sassan', 
    ig: 'Ngalaba' 
  },
  'learn.articles': { 
    en: 'Articles', 
    pcm: 'Articles', 
    yo: 'Àwọn Àkọlé', 
    ha: 'Labarai', 
    ig: 'Akụkọ' 
  },
  'learn.faqs': { 
    en: 'FAQs', 
    pcm: 'Common Questions', 
    yo: 'Àwọn Ìbéèrè Tó Wọ́pọ̀', 
    ha: 'Tambayoyi Masu Yawa', 
    ig: 'Ajụjụ A Na-ajụkarị' 
  },
  'learn.mythBusted': { 
    en: 'Myth Busted!', 
    pcm: 'E No Be True!', 
    yo: 'Àsọjáde Ti Fọ́!', 
    ha: 'An Karyata Tatsuniya!', 
    ig: 'Akwatụrụ Akụkọ Ụgha!' 
  },
  'learn.readMore': { 
    en: 'Read More', 
    pcm: 'Read More', 
    yo: 'Kà Síi', 
    ha: 'Ƙara Karantawa', 
    ig: 'Gụkwuo' 
  },

  // Saved Businesses page
  'savedBusinesses.title': { 
    en: 'Saved Businesses', 
    pcm: 'Your Saved Business Dem', 
    yo: 'Àwọn Iṣẹ́ Tí A Fi Pamọ́', 
    ha: 'Kasuwancin da Aka Ajiye', 
    ig: 'Azụmaahịa Echekwara' 
  },
  'savedBusinesses.subtitle': { 
    en: 'Manage and recalculate taxes for your saved businesses', 
    pcm: 'Manage your saved business and calculate tax again', 
    yo: 'Ṣàkóso àti ṣe ìṣirò owó-orí tuntun fún àwọn iṣẹ́ rẹ', 
    ha: 'Sarrafa kuma sake ƙididdige haraji don kasuwancin da aka ajiye', 
    ig: 'Jikwaa ma gbakọọ ụtụ ọzọ maka azụmaahịa gị' 
  },
  'savedBusinesses.recalculate': { 
    en: 'Recalculate Tax', 
    pcm: 'Calculate Tax Again', 
    yo: 'Ṣe Ìṣirò Owó-orí Lẹ́ẹ̀kan Sí', 
    ha: 'Sake Ƙididdige Haraji', 
    ig: 'Gbakọọ Ụtụ Ọzọ' 
  },
  'savedBusinesses.deleteBusiness': { 
    en: 'Delete Business', 
    pcm: 'Remove Business', 
    yo: 'Pa Iṣẹ́ Rẹ́', 
    ha: 'Share Kasuwanci', 
    ig: 'Hichapụ Azụmaahịa' 
  },
  'savedBusinesses.verified': { 
    en: 'CAC Verified', 
    pcm: 'CAC Verified', 
    yo: 'CAC Ti Jẹ́rìí', 
    ha: 'An Tabbatar da CAC', 
    ig: 'CAC Kwenyere' 
  },

  // Team page
  'team.title': { 
    en: 'Team Management', 
    pcm: 'Manage Your Team', 
    yo: 'Ìṣàkóso Ẹgbẹ́', 
    ha: 'Gudanar da Ƙungiya', 
    ig: 'Njikwa Otu' 
  },
  'team.subtitle': { 
    en: 'Invite team members and manage access', 
    pcm: 'Add team members and control who fit access', 
    yo: 'Pe àwọn ọmọ ẹgbẹ́ kí o sì ṣàkóso ìráyè', 
    ha: 'Gayyaci membobi kuma sarrafa isa', 
    ig: 'Kpọọ ndị otu wee jikwaa ohere' 
  },
  'team.inviteMember': { 
    en: 'Invite Member', 
    pcm: 'Add Person', 
    yo: 'Pe Ọmọ Ẹgbẹ́', 
    ha: 'Gayyaci Memba', 
    ig: 'Kpọọ Onye' 
  },
  'team.pendingInvites': { 
    en: 'Pending Invites', 
    pcm: 'Invites Wey Never Accept', 
    yo: 'Àwọn Ìkésí tó Ń Dúró', 
    ha: 'Gayyatar Jira', 
    ig: 'Oku Na-eche' 
  },
  'team.activeMembers': { 
    en: 'Active Members', 
    pcm: 'Active People', 
    yo: 'Àwọn Ọmọ Ẹgbẹ́ Tó Ń Ṣiṣẹ́', 
    ha: 'Membobi Masu Aiki', 
    ig: 'Ndị Otu Na-arụ Ọrụ' 
  },
  'team.role': { 
    en: 'Role', 
    pcm: 'Role', 
    yo: 'Ipò', 
    ha: 'Matsayi', 
    ig: 'Ọrụ' 
  },
  'team.admin': { 
    en: 'Admin', 
    pcm: 'Admin', 
    yo: 'Alàkóso', 
    ha: 'Mai Gudanarwa', 
    ig: 'Onye Njikwa' 
  },
  'team.member': { 
    en: 'Member', 
    pcm: 'Member', 
    yo: 'Ọmọ Ẹgbẹ́', 
    ha: 'Memba', 
    ig: 'Onye Otu' 
  },
  'team.viewer': { 
    en: 'Viewer', 
    pcm: 'Viewer Only', 
    yo: 'Olùwò', 
    ha: 'Mai Kallo', 
    ig: 'Onye Na-ele' 
  },
  'team.removeAccess': { 
    en: 'Remove Access', 
    pcm: 'Remove Access', 
    yo: 'Yọ Ìráyè Kúrò', 
    ha: 'Cire Isa', 
    ig: 'Wepụ Ohere' 
  },

  // Notifications page
  'notifications.title': { 
    en: 'Notifications', 
    pcm: 'Your Notifications', 
    yo: 'Ìfitónilétí', 
    ha: 'Sanarwa', 
    ig: 'Ọkwa' 
  },
  'notifications.settings': { 
    en: 'Notification Settings', 
    pcm: 'Settings', 
    yo: 'Ètò Ìfitónilétí', 
    ha: 'Saitin Sanarwa', 
    ig: 'Ntọala Ọkwa' 
  },
  'notifications.markAllRead': { 
    en: 'Mark All as Read', 
    pcm: 'Mark All as Read', 
    yo: 'Samisi Gbogbo Rẹ̀ Bí A Ti Kà', 
    ha: 'Yi Duka alama an karanta', 
    ig: 'Dee Niile Dịka Agụrụ' 
  },
  'notifications.clearAll': { 
    en: 'Clear All', 
    pcm: 'Clear Everything', 
    yo: 'Pa Gbogbo Rẹ̀', 
    ha: 'Share Duka', 
    ig: 'Kpochapụ Niile' 
  },
  'notifications.noNotifications': { 
    en: 'No notifications yet', 
    pcm: 'No notifications yet', 
    yo: 'Kò sí ìfitónilétí síbẹ̀', 
    ha: 'Babu sanarwa tukuna', 
    ig: 'Ọ dịghị ọkwa ka' 
  },
  'notifications.enableSound': { 
    en: 'Enable Sound', 
    pcm: 'Turn On Sound', 
    yo: 'Mú Ohùn Ṣiṣẹ́', 
    ha: 'Kunna Sauti', 
    ig: 'Mepee Ụda' 
  },
  'notifications.enableBrowser': { 
    en: 'Enable Browser Notifications', 
    pcm: 'Turn On Browser Alerts', 
    yo: 'Mú Ìfitónilétí Aṣàwákiri Ṣiṣẹ́', 
    ha: 'Kunna Sanarwar Burauza', 
    ig: 'Mepee Ọkwa Nchọgharị' 
  },

  // Security Dashboard
  'security.title': { 
    en: 'Security Dashboard', 
    pcm: 'Security Dashboard', 
    yo: 'Pánẹ́ẹ̀lì Ààbò', 
    ha: 'Dashboard na Tsaro', 
    ig: 'Dashbọọdụ Nchekwa' 
  },
  'security.score': { 
    en: 'Security Score', 
    pcm: 'Security Score', 
    yo: 'Iṣirò Ààbò', 
    ha: 'Maki Tsaro', 
    ig: 'Akara Nchekwa' 
  },
  'security.devices': { 
    en: 'Known Devices', 
    pcm: 'Devices Wey We Know', 
    yo: 'Àwọn Ẹ̀rọ Tó Mọ̀', 
    ha: 'Na\'urori da Aka Sani', 
    ig: 'Ngwaọrụ A Maara' 
  },
  'security.ipWhitelist': { 
    en: 'IP Whitelist', 
    pcm: 'Allowed IP Addresses', 
    yo: 'Àtòjọ IP Fúnfún', 
    ha: 'Jerin Fararen IP', 
    ig: 'Ndepụta IP' 
  },
  'security.timeRestrictions': { 
    en: 'Time Restrictions', 
    pcm: 'When You Fit Login', 
    yo: 'Ìdíwọ́n Àkókò', 
    ha: 'Ƙayyadaddun Lokaci', 
    ig: 'Mgbochi Oge' 
  },
  'security.blockedAttempts': { 
    en: 'Blocked Login Attempts', 
    pcm: 'Failed Login Wey We Block', 
    yo: 'Àwọn Ìgbìyànjú Wíwọlé Tó Dínà', 
    ha: 'Ƙoƙarin Shiga da Aka Toshe', 
    ig: 'Ọgbụgba Ịbanye Egbochiri' 
  },

  // Referrals page
  'referrals.title': { 
    en: 'Referral Program', 
    pcm: 'Bring Your Padi', 
    yo: 'Ètò Ìtọkàsí', 
    ha: 'Shirin Mika Abokai', 
    ig: 'Mmemme Nkwụsara' 
  },
  'referrals.subtitle': { 
    en: 'Invite friends and earn rewards', 
    pcm: 'Bring your people, collect rewards', 
    yo: 'Pe àwọn ọ̀rẹ́ kí o sì jèrè ẹ̀bùn', 
    ha: 'Gayyaci abokai ka sami lada', 
    ig: 'Kpọọ ndị enyi nweta ụgwọ' 
  },
  'referrals.yourCode': { 
    en: 'Your Referral Code', 
    pcm: 'Your Code', 
    yo: 'Kóòdù Ìtọkàsí Rẹ', 
    ha: 'Lambar Mika Abokai', 
    ig: 'Koodu Nkwụsara Gị' 
  },
  'referrals.shareLink': { 
    en: 'Share Link', 
    pcm: 'Share Link', 
    yo: 'Pín Àjápọ̀', 
    ha: 'Raba Haɗin', 
    ig: 'Kesaa Njikọ' 
  },
  'referrals.totalReferrals': { 
    en: 'Total Referrals', 
    pcm: 'People Wey You Bring', 
    yo: 'Àpapọ̀ Àwọn Ìtọkàsí', 
    ha: 'Jimlar Mika Abokai', 
    ig: 'Mkpokọta Nkwụsara' 
  },
  'referrals.pendingRewards': { 
    en: 'Pending Rewards', 
    pcm: 'Rewards Wey Dey Come', 
    yo: 'Àwọn Ẹ̀bùn Tó Ń Dúró', 
    ha: 'Ladar Jira', 
    ig: 'Ụgwọ Na-eche' 
  },
  'referrals.earnedRewards': { 
    en: 'Earned Rewards', 
    pcm: 'Rewards Wey You Don Get', 
    yo: 'Àwọn Ẹ̀bùn Tí O Ti Jèrè', 
    ha: 'Ladar da Aka Samu', 
    ig: 'Ụgwọ Enwetara' 
  },
  'referrals.howItWorks': { 
    en: 'How It Works', 
    pcm: 'How E Dey Work', 
    yo: 'Bí Ó Ṣe Ń Ṣiṣẹ́', 
    ha: 'Yadda Yake Aiki', 
    ig: 'Otu Ọ Si Arụ Ọrụ' 
  },
  'referrals.step1': { 
    en: 'Share your unique referral code', 
    pcm: 'Share your code', 
    yo: 'Pín kóòdù ìtọkàsí àkànṣe rẹ', 
    ha: 'Raba lambar mika abokai na musamman', 
    ig: 'Kesaa koodu nkwụsara pụrụ iche gị' 
  },
  'referrals.step2': { 
    en: 'Friend signs up and subscribes', 
    pcm: 'Your friend register and pay', 
    yo: 'Ọ̀rẹ́ forúkọsílẹ̀ tí ó sì san owó', 
    ha: 'Abokin ya yi rajista ya biyan kuɗi', 
    ig: 'Enyi debanye aha ma kwụọ ụgwọ' 
  },
  'referrals.step3': { 
    en: 'Both of you get rewarded!', 
    pcm: 'Una two go chop reward!', 
    yo: 'Ẹ méjèèjì máa jèrè ẹ̀bùn!', 
    ha: 'Ku biyu za ku sami lada!', 
    ig: 'Unu abụọ ga-enweta ụgwọ!' 
  },

  // Achievements page
  'achievements.title': { 
    en: 'Achievements', 
    pcm: 'Your Achievements', 
    yo: 'Àwọn Àṣeyọrí', 
    ha: 'Nasarori', 
    ig: 'Ihe Emezuru' 
  },
  'achievements.subtitle': { 
    en: 'Track your progress and unlock badges', 
    pcm: 'See your progress and collect badges', 
    yo: 'Tẹ̀lé ìtẹ̀síwájú rẹ kí o sì ṣí àmì', 
    ha: 'Bin sawun ci gabanka kuma buɗe alamomi', 
    ig: 'Soro ọganihu gị ma meghee akara' 
  },
  'achievements.totalPoints': { 
    en: 'Total Points', 
    pcm: 'Your Points', 
    yo: 'Àpapọ̀ Àmì', 
    ha: 'Jimlar Maki', 
    ig: 'Mkpokọta Akara' 
  },
  'achievements.badgesEarned': { 
    en: 'Badges Earned', 
    pcm: 'Badges Wey You Get', 
    yo: 'Àwọn Àmì Tí O Jèrè', 
    ha: 'Alamomin da Aka Samu', 
    ig: 'Akara Enwetara' 
  },
  'achievements.locked': { 
    en: 'Locked', 
    pcm: 'E Never Open', 
    yo: 'Tìí', 
    ha: 'Kulle', 
    ig: 'Kpọchiri' 
  },
  'achievements.unlocked': { 
    en: 'Unlocked', 
    pcm: 'E Don Open', 
    yo: 'Ti Ṣí', 
    ha: 'An Buɗe', 
    ig: 'Emepela' 
  },

  // Accountant Portal
  'accountant.title': { 
    en: 'Accountant Portal', 
    pcm: 'Accountant Portal', 
    yo: 'Ẹnu-ọ̀nà Àkàwò', 
    ha: 'Ƙofar Akawo', 
    ig: 'Ọnụ Ụzọ Akaụntant' 
  },
  'accountant.clients': { 
    en: 'My Clients', 
    pcm: 'My Clients', 
    yo: 'Àwọn Oníbàárà Mi', 
    ha: 'Abokan Cinikin Na', 
    ig: 'Ndị Ahịa M' 
  },
  'accountant.addClient': { 
    en: 'Add Client', 
    pcm: 'Add New Client', 
    yo: 'Fi Oníbàárà Kún', 
    ha: 'Ƙara Abokin Ciniki', 
    ig: 'Tinye Onye Ahịa' 
  },
  'accountant.viewReport': { 
    en: 'View Report', 
    pcm: 'See Report', 
    yo: 'Wo Ìròyìn', 
    ha: 'Duba Rahoto', 
    ig: 'Lee Akụkọ' 
  },
  'accountant.calculateForClient': { 
    en: 'Calculate for Client', 
    pcm: 'Calculate Tax for Client', 
    yo: 'Ṣe Ìṣirò Fún Oníbàárà', 
    ha: 'Ƙididdige don Abokin Ciniki', 
    ig: 'Gbakọọ maka Onye Ahịa' 
  },

  // API Docs
  'apiDocs.title': { 
    en: 'API Documentation', 
    pcm: 'API Documentation', 
    yo: 'Ìwé Àkọsílẹ̀ API', 
    ha: 'Takardun API', 
    ig: 'Akwụkwọ API' 
  },
  'apiDocs.subtitle': { 
    en: 'Integrate TaxForge into your applications', 
    pcm: 'Connect TaxForge to your app', 
    yo: 'Ṣàkópọ̀ TaxForge sínú àwọn ohun èlò rẹ', 
    ha: 'Haɗa TaxForge cikin manhajojinku', 
    ig: 'Jikọọ TaxForge na ngwa gị' 
  },
  'apiDocs.authentication': { 
    en: 'Authentication', 
    pcm: 'How to Login', 
    yo: 'Ìfìdánimọ̀', 
    ha: 'Tantancewa', 
    ig: 'Nkwenye' 
  },
  'apiDocs.endpoints': { 
    en: 'Endpoints', 
    pcm: 'API Endpoints', 
    yo: 'Àwọn Àyè Òpin', 
    ha: 'Maɓuɓɓuka', 
    ig: 'Ebe Njedebe' 
  },
  'apiDocs.rateLimit': { 
    en: 'Rate Limits', 
    pcm: 'Request Limits', 
    yo: 'Àwọn Ìdíwọ́n Ìdásílẹ̀', 
    ha: 'Ƙayyadaddun Adadi', 
    ig: 'Oke Ọnụọgụ' 
  },
  'apiDocs.examples': { 
    en: 'Examples', 
    pcm: 'Examples', 
    yo: 'Àwọn Àpẹẹrẹ', 
    ha: 'Misalai', 
    ig: 'Ọmụmaatụ' 
  },

  // Audit Log
  'auditLog.title': { 
    en: 'Audit Log', 
    pcm: 'Activity History', 
    yo: 'Ìwé Àyẹ̀wò', 
    ha: 'Tarihin Aiki', 
    ig: 'Ndekọ Nyocha' 
  },
  'auditLog.action': { 
    en: 'Action', 
    pcm: 'What Happen', 
    yo: 'Ìṣe', 
    ha: 'Aiki', 
    ig: 'Ihe Emere' 
  },
  'auditLog.timestamp': { 
    en: 'Timestamp', 
    pcm: 'When E Happen', 
    yo: 'Àkókò', 
    ha: 'Lokaci', 
    ig: 'Oge' 
  },
  'auditLog.user': { 
    en: 'User', 
    pcm: 'Who Do Am', 
    yo: 'Olùmúlò', 
    ha: 'Mai Amfani', 
    ig: 'Onye Ọrụ' 
  },
  'auditLog.details': { 
    en: 'Details', 
    pcm: 'More Info', 
    yo: 'Àlàyé', 
    ha: 'Cikakken Bayani', 
    ig: 'Nkọwa' 
  },

  // E-Filing page
  'eFiling.title': { 
    en: 'E-Filing', 
    pcm: 'File Tax Online', 
    yo: 'Fífi Ránṣẹ́ Lórí Ayélujára', 
    ha: 'Aika ta yanar gizo', 
    ig: 'Iziga na Ịntanetị' 
  },
  'eFiling.subtitle': { 
    en: 'Submit your tax returns electronically', 
    pcm: 'Send your tax returns online', 
    yo: 'Fi àwọn ìpadà owó-orí rẹ ránṣẹ́ lórí ẹ̀rọ ayélujára', 
    ha: 'Aika dawowar harajinka ta yanar gizo', 
    ig: 'Nyefee nloghachi ụtụ gị n\'ịntanetị' 
  },
  'eFiling.selectForm': { 
    en: 'Select Form', 
    pcm: 'Choose Form', 
    yo: 'Yan Fọọ́mù', 
    ha: 'Zaɓi Fom', 
    ig: 'Họrọ Fọm' 
  },
  'eFiling.submitReturn': { 
    en: 'Submit Return', 
    pcm: 'Send Return', 
    yo: 'Fi Ìpadà Ránṣẹ́', 
    ha: 'Aika Dawowa', 
    ig: 'Nyefee Nloghachi' 
  },
  'eFiling.filingHistory': { 
    en: 'Filing History', 
    pcm: 'Past Filings', 
    yo: 'Ìtàn Fífi Ránṣẹ́', 
    ha: 'Tarihin Aika', 
    ig: 'Akụkọ Ịde' 
  },

  // Scenario Modeling
  'scenario.title': { 
    en: 'Scenario Modeling', 
    pcm: 'What If Analysis', 
    yo: 'Ṣíṣe Àwòrán Ìṣẹ̀lẹ̀', 
    ha: 'Yin Kwatancen Yanayi', 
    ig: 'Nhazi Ihe Omume' 
  },
  'scenario.subtitle': { 
    en: 'Compare different tax scenarios', 
    pcm: 'See how different options affect your tax', 
    yo: 'Fiwé àwọn ìṣẹ̀lẹ̀ owó-orí oriṣiriṣi', 
    ha: 'Kwatanta yanayin haraji daban-daban', 
    ig: 'Tụnyere ọnọdụ ụtụ dị iche iche' 
  },
  'scenario.addScenario': { 
    en: 'Add Scenario', 
    pcm: 'Add New Scenario', 
    yo: 'Fi Ìṣẹ̀lẹ̀ Kún', 
    ha: 'Ƙara Yanayi', 
    ig: 'Tinye Ọnọdụ' 
  },
  'scenario.compare': { 
    en: 'Compare Scenarios', 
    pcm: 'Compare Them', 
    yo: 'Fiwé Àwọn Ìṣẹ̀lẹ̀', 
    ha: 'Kwatanta Yanayi', 
    ig: 'Tụnyere Ọnọdụ' 
  },

  // Business Report
  'businessReport.title': { 
    en: 'Business Report', 
    pcm: 'Business Report', 
    yo: 'Ìròyìn Iṣẹ́', 
    ha: 'Rahoton Kasuwanci', 
    ig: 'Akụkọ Azụmaahịa' 
  },
  'businessReport.generate': { 
    en: 'Generate Report', 
    pcm: 'Create Report', 
    yo: 'Ṣèdá Ìròyìn', 
    ha: 'Ƙirƙiri Rahoto', 
    ig: 'Mepụta Akụkọ' 
  },
  'businessReport.period': { 
    en: 'Report Period', 
    pcm: 'Time Period', 
    yo: 'Àsìkò Ìròyìn', 
    ha: 'Lokacin Rahoto', 
    ig: 'Oge Akụkọ' 
  },

  // Insights page
  'insights.title': { 
    en: 'Tax Insights', 
    pcm: 'Smart Tax Tips', 
    yo: 'Ìmọ̀ràn Owó-orí', 
    ha: 'Fahimtar Haraji', 
    ig: 'Nghọta Ụtụ' 
  },
  'insights.subtitle': { 
    en: 'AI-powered recommendations for your business', 
    pcm: 'Smart advice for your business', 
    yo: 'Àwọn ìmọ̀ràn tó dá lórí AI fún iṣẹ́ rẹ', 
    ha: 'Shawarwari masu ƙarfin AI don kasuwancinka', 
    ig: 'Ndụmọdụ AI maka azụmaahịa gị' 
  },

  // Terms page
  'terms.title': { 
    en: 'Terms of Service', 
    pcm: 'Terms and Conditions', 
    yo: 'Àwọn Òfin Ìṣètò', 
    ha: 'Sharuɗɗan Sabis', 
    ig: 'Usoro Ọrụ' 
  },
  'terms.lastUpdated': { 
    en: 'Last Updated', 
    pcm: 'Last Updated', 
    yo: 'Ìmúdójúìwọ̀n Ìkẹ́yìn', 
    ha: 'Sabuntawa ta Ƙarshe', 
    ig: 'Mmelite Ikpeazụ' 
  },

  // Roadmap page
  'roadmap.title': { 
    en: 'Product Roadmap', 
    pcm: 'What We Dey Plan', 
    yo: 'Ètò Ọjà', 
    ha: 'Tsarin Samfuri', 
    ig: 'Atụmatụ Ngwaahịa' 
  },
  'roadmap.subtitle': { 
    en: 'See what features are coming next', 
    pcm: 'See wetin dey come next', 
    yo: 'Wo àwọn ẹ̀yà tó ń bọ̀', 
    ha: 'Duba fasalolin da ke zuwa', 
    ig: 'Lee ihe na-abịa' 
  },
  'roadmap.planned': { 
    en: 'Planned', 
    pcm: 'We Plan Am', 
    yo: 'Tí A Gbékalẹ̀', 
    ha: 'An Shirya', 
    ig: 'Atụmatụ' 
  },
  'roadmap.inProgress': { 
    en: 'In Progress', 
    pcm: 'We Dey Work On Am', 
    yo: 'Ń Lọ Lọ́wọ́', 
    ha: 'Ci Gaba', 
    ig: 'Na-aga N\'ihu' 
  },
  'roadmap.completed': { 
    en: 'Completed', 
    pcm: 'E Don Finish', 
    yo: 'Ti Parí', 
    ha: 'An Kammala', 
    ig: 'Emechara' 
  },

  // Not Found page
  'notFound.title': { 
    en: 'Page Not Found', 
    pcm: 'Page No Dey', 
    yo: 'Ojú-ìwé Kò Sí', 
    ha: 'Ba a Sami Shafin ba', 
    ig: 'Ahụghị Peeji' 
  },
  'notFound.message': { 
    en: 'The page you are looking for does not exist', 
    pcm: 'The page wey you dey find no dey', 
    yo: 'Ojú-ìwé tí o ń wá kò sí', 
    ha: 'Shafin da kake nema ba ya nan', 
    ig: 'Peeji ị na-achọ adịghị' 
  },
  'notFound.goHome': { 
    en: 'Go to Homepage', 
    pcm: 'Go Back Home', 
    yo: 'Lọ sí Ojú-ìwé Àkọ́kọ́', 
    ha: 'Je zuwa Babban Shafi', 
    ig: 'Gaa na Peeji Mbụ' 
  },

  // Individual Calculator
  'individual.title': { 
    en: 'Personal Tax Calculator', 
    pcm: 'Personal Tax Calculator', 
    yo: 'Ẹ̀rọ Ìṣirò Owó-orí Àdáni', 
    ha: 'Na\'urar Ƙididdige Harajin Mutum', 
    ig: 'Ngwa Mgbako Ụtụ Onwe' 
  },
  'individual.subtitle': { 
    en: 'Calculate your personal income tax', 
    pcm: 'Calculate your own tax', 
    yo: 'Ṣe ìṣirò owó-orí àkọọ́lẹ̀ rẹ', 
    ha: 'Ƙididdige harajin samun kuɗinka', 
    ig: 'Gbakọọ ụtụ ego onwe gị' 
  },
  'individual.salary': { 
    en: 'Monthly Salary', 
    pcm: 'Your Salary', 
    yo: 'Owó-oṣù Oṣù', 
    ha: 'Albashin Wata', 
    ig: 'Ụgwọ Ọnwa' 
  },
  'individual.otherIncome': { 
    en: 'Other Income', 
    pcm: 'Other Money', 
    yo: 'Owó Mìíràn', 
    ha: 'Sauran Kuɗi', 
    ig: 'Ego Ọzọ' 
  },
  'individual.pension': { 
    en: 'Pension Contribution', 
    pcm: 'Pension', 
    yo: 'Ìfikún Pẹ́ńṣọ̀ọ̀nù', 
    ha: 'Gudunmuwar Fensho', 
    ig: 'Ntinye Penshọn' 
  },
  'individual.nhf': { 
    en: 'NHF Contribution', 
    pcm: 'NHF', 
    yo: 'Ìfikún NHF', 
    ha: 'Gudunmuwar NHF', 
    ig: 'Ntinye NHF' 
  },

  // Transactions page
  'transactions.title': { 
    en: 'Transactions', 
    pcm: 'Your Transactions', 
    yo: 'Àwọn Ìṣòwò', 
    ha: 'Ma\'amaloli', 
    ig: 'Azụmahịa' 
  },
  'transactions.subtitle': { 
    en: 'View and manage all your financial transactions', 
    pcm: 'See all your money movement', 
    yo: 'Wo àti ṣàkóso gbogbo àwọn ìṣòwò owó rẹ', 
    ha: 'Duba kuma sarrafa duk ma\'amalolinku na kuɗi', 
    ig: 'Lee ma jikwaa azụmahịa ego gị niile' 
  },

  // Admin Analytics
  'adminAnalytics.title': { 
    en: 'Admin Analytics', 
    pcm: 'Admin Dashboard', 
    yo: 'Àyẹ̀wò Alàkóso', 
    ha: 'Nazarin Mai Gudanarwa', 
    ig: 'Nnyocha Onye Njikwa' 
  },
  'adminAnalytics.users': { 
    en: 'Total Users', 
    pcm: 'All Users', 
    yo: 'Àpapọ̀ Àwọn Olùmúlò', 
    ha: 'Jimlar Masu Amfani', 
    ig: 'Mkpokọta Ndị Ọrụ' 
  },
  'adminAnalytics.calculations': { 
    en: 'Total Calculations', 
    pcm: 'All Calculations', 
    yo: 'Àpapọ̀ Àwọn Ìṣirò', 
    ha: 'Jimlar Ƙididdiga', 
    ig: 'Mkpokọta Mgbako' 
  },
  'adminAnalytics.revenue': { 
    en: 'Total Revenue', 
    pcm: 'Money Wey Enter', 
    yo: 'Àpapọ̀ Owó Tó Wọlé', 
    ha: 'Jimlar Kuɗin Shiga', 
    ig: 'Mkpokọta Ego' 
  },

  // AI Query Analytics
  'aiQuery.title': { 
    en: 'AI Query Analytics', 
    pcm: 'AI Questions Analysis', 
    yo: 'Àyẹ̀wò Ìbéèrè AI', 
    ha: 'Nazarin Tambayar AI', 
    ig: 'Nnyocha Ajụjụ AI' 
  },
  'aiQuery.topQuestions': { 
    en: 'Top Questions', 
    pcm: 'Popular Questions', 
    yo: 'Àwọn Ìbéèrè Tó Gbajúmọ̀', 
    ha: 'Tambayoyi Mafi Yawa', 
    ig: 'Ajụjụ Kachasị' 
  },
  'aiQuery.responseTime': { 
    en: 'Average Response Time', 
    pcm: 'How Fast We Reply', 
    yo: 'Àkókò Ìdáhùn Àárín', 
    ha: 'Matsakaicin Lokacin Amsa', 
    ig: 'Oge Azịza Nkezi' 
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
