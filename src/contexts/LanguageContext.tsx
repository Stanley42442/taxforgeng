import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { safeLocalStorage } from '@/lib/safeStorage';

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
  'nav.personalTax': { 
    en: 'Personal Tax', 
    pcm: 'Personal Tax', 
    yo: 'Owó-orí Ti Ara Ẹni', 
    ha: 'Harajin Kai', 
    ig: 'Ụtụ Nkeonwe' 
  },
  'nav.achievements': { 
    en: 'Achievements', 
    pcm: 'Achievements', 
    yo: 'Àṣeyọrí', 
    ha: 'Nasarori', 
    ig: 'Ihe Emere' 
  },
  'nav.scenarios': { 
    en: 'Scenarios', 
    pcm: 'Scenarios', 
    yo: 'Àwọn Ìṣẹ̀lẹ̀', 
    ha: 'Yanayin', 
    ig: 'Ọnọdụ' 
  },
  'nav.reports': { 
    en: 'Reports', 
    pcm: 'Reports', 
    yo: 'Ìròyìn', 
    ha: 'Rahotanni', 
    ig: 'Akụkọ' 
  },
  'nav.insights': { 
    en: 'Insights', 
    pcm: 'Insights', 
    yo: 'Òye', 
    ha: 'Fahimta', 
    ig: 'Nghọta' 
  },
  'nav.transactions': { 
    en: 'Transactions', 
    pcm: 'Transactions', 
    yo: 'Àwọn Ìdúnàádúrà', 
    ha: "Ma'amaloli", 
    ig: 'Azụmahịa' 
  },
  'nav.efiling': { 
    en: 'E-Filing', 
    pcm: 'E-Filing', 
    yo: 'Ìfọwọ́sí Lórí Ayélujára', 
    ha: 'Shigar Intanet', 
    ig: "Edere N'ịntanetị" 
  },
  'nav.taxFiling': { 
    en: 'Tax Filing', 
    pcm: 'Tax Filing', 
    yo: 'Fọwọ́sí Owó-orí', 
    ha: 'Shigar Haraji', 
    ig: 'Edere Ụtụ' 
  },
  'nav.team': { 
    en: 'Team', 
    pcm: 'Team', 
    yo: 'Ẹgbẹ́', 
    ha: 'Tawaga', 
    ig: 'Ndị Otu' 
  },
  'nav.roadmap': { 
    en: 'Roadmap', 
    pcm: 'Roadmap', 
    yo: 'Àtẹ Ọ̀nà', 
    ha: 'Taswira', 
    ig: 'Ụzọ' 
  },
  'nav.accountSettings': { 
    en: 'Account Settings', 
    pcm: 'Account Settings', 
    yo: 'Ètò Àkọsílẹ̀', 
    ha: 'Saitin Asusun', 
    ig: 'Ntọala Akaụntụ' 
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
  'settings.emailStatus': { 
    en: 'Email Status', 
    pcm: 'Email Status', 
    yo: 'Ipò Ímeèlì', 
    ha: 'Matsayin Imel', 
    ig: 'Ọnọdụ Email' 
  },
  'settings.verified': { 
    en: 'Verified', 
    pcm: 'Verified', 
    yo: 'Ti Jẹ́rìí', 
    ha: 'An Tabbatar', 
    ig: 'Eziri' 
  },
  'settings.unverified': { 
    en: 'Unverified', 
    pcm: 'Unverified', 
    yo: 'Kò Tí Jẹ́rìí', 
    ha: 'Ba A Tabbatar Ba', 
    ig: 'Ezighị Ezi' 
  },
  'settings.twoFactorStatus': { 
    en: '2FA Status', 
    pcm: '2FA Status', 
    yo: 'Ipò 2FA', 
    ha: 'Matsayin 2FA', 
    ig: 'Ọnọdụ 2FA' 
  },
  'settings.enabled': { 
    en: 'Enabled', 
    pcm: 'Enabled', 
    yo: 'Ń Ṣiṣẹ́', 
    ha: 'An Kunna', 
    ig: 'Enyere Ike' 
  },
  'settings.disabled': { 
    en: 'Disabled', 
    pcm: 'Disabled', 
    yo: 'Kò Ṣiṣẹ́', 
    ha: 'An Kashe', 
    ig: 'Agbanyụrụ' 
  },
  'settings.backupCodes': { 
    en: 'Backup Codes', 
    pcm: 'Backup Codes', 
    yo: 'Àwọn Kóòdù Ìtọ́jú', 
    ha: 'Lambobin Ajiya', 
    ig: 'Koodu Nchekwa' 
  },
  'settings.recentActivity': { 
    en: 'Recent Activity', 
    pcm: 'Recent Activity', 
    yo: 'Ìṣe Àìpẹ́', 
    ha: 'Ayyukan Kwanan Nan', 
    ig: 'Ọrụ Na-adịbeghị' 
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
  'home.updatedFor2026': { 
    en: 'Updated for 2026 Tax Rules', 
    pcm: 'We don update am for 2026 Tax Rules', 
    yo: 'A ti ṣàtúnṣe fún Àwọn Òfin Owó-orí 2026', 
    ha: 'An sabunta don Dokokin Haraji 2026', 
    ig: 'Emelitere maka Iwu Ụtụ 2026' 
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
    en: '© 2026 TaxForge NG. For educational purposes only.', 
    pcm: '© 2026 TaxForge NG. Na for learning only.', 
    yo: '© 2026 TaxForge NG. Fún àwọn ète ẹ̀kọ́ nìkan.', 
    ha: '© 2026 TaxForge NG. Don dalilan ilimi kawai.', 
    ig: '© 2026 TaxForge NG. Maka ebumnuche mmụta naanị.' 
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
    en: '2026 Tax Rules (NTA 2025)', 
    pcm: '2026 Tax Rules (NTA 2025)', 
    yo: 'Àwọn Òfin Owó-orí 2026 (NTA 2025)', 
    ha: 'Dokokin Haraji 2026 (NTA 2025)', 
    ig: 'Iwu Ụtụ 2026 (NTA 2025)' 
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
  'learn.searchPlaceholder': { 
    en: 'Search myths, guides, articles...', 
    pcm: 'Find myths, guides, articles...', 
    yo: 'Wá àwọn ìtàn àlọ́, ìtọ́nisọ́nà, àpilẹ̀kọ...', 
    ha: 'Bincika tatsuniyoyi, jagororori, labarai...', 
    ig: 'Chọọ akụkọ ifo, nduzi, edemede...' 
  },
  'learn.quizProgress': { 
    en: 'Quiz Progress', 
    pcm: 'Quiz Progress', 
    yo: 'Ìlọsíwájú Ìdánwò', 
    ha: 'Ci gaban Jarrabawa', 
    ig: 'Ọganihu Ajụjụ' 
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
  // Component-level translations - Table Headers
  'table.year': { en: 'Year', pcm: 'Year', yo: 'Ọdún', ha: 'Shekara', ig: 'Afọ' },
  'table.turnover': { en: 'Turnover', pcm: 'Total Sales', yo: 'Iye Tita', ha: 'Jimillar Siyarwa', ig: 'Ego Ahịa' },
  'table.taxableIncome': { en: 'Taxable Income', pcm: 'Income Wey Dem Tax', yo: 'Owó Tí A Ń San Owó-orí', ha: 'Kuɗin Shigarwa Mai Haraji', ig: 'Ego A Na-atụ Ụtụ' },
  'table.totalTax': { en: 'Total Tax', pcm: 'Total Tax', yo: 'Àpapọ̀ Owó-orí', ha: 'Jimillar Haraji', ig: 'Mkpokọta Ụtụ' },
  'table.effectiveRate': { en: 'Eff. Rate', pcm: 'Rate', yo: 'Ìdíyelé', ha: 'Ƙimar', ig: 'Ọnụego' },
  'table.status': { en: 'Status', pcm: 'Status', yo: 'Ipò', ha: 'Matsayi', ig: 'Ọnọdụ' },
  'table.date': { en: 'Date', pcm: 'Date', yo: 'Ọjọ́', ha: 'Kwanan Wata', ig: 'Ụbọchị' },
  'table.amount': { en: 'Amount', pcm: 'Amount', yo: 'Iye', ha: 'Adadi', ig: 'Ego' },
  'table.description': { en: 'Description', pcm: 'Wetin E Be', yo: 'Àlàyé', ha: 'Bayani', ig: 'Nkọwa' },
  'table.category': { en: 'Category', pcm: 'Type', yo: 'Ẹ̀ka', ha: 'Nau\'i', ig: 'Ụdị' },
  'table.action': { en: 'Action', pcm: 'Action', yo: 'Ìṣe', ha: 'Aiki', ig: 'Omume' },
  'table.ipRange': { en: 'IP Range', pcm: 'IP Range', yo: 'Ìbùdó IP', ha: 'Kewayon IP', ig: 'Oke IP' },
  'table.active': { en: 'Active', pcm: 'Active', yo: 'Ṣíṣẹ́', ha: 'Aiki', ig: 'Na-arụ ọrụ' },
  'table.city': { en: 'City', pcm: 'City', yo: 'Ìlú', ha: 'Birni', ig: 'Obodo' },
  'table.country': { en: 'Country', pcm: 'Country', yo: 'Orílẹ̀-èdè', ha: 'Ƙasa', ig: 'Mba' },
  'table.createdAt': { en: 'Created At', pcm: 'When E Start', yo: 'Ìgbà Tí A Dá', ha: 'Lokacin Ƙirƙira', ig: 'Oge Emebere' },
  
  // Form Labels (additional)
  'form.taxType': { en: 'Tax Type', pcm: 'Tax Type', yo: 'Irú Owó-orí', ha: 'Nau\'in Haraji', ig: 'Ụdị Ụtụ' },
  'form.taxDue': { en: 'Tax Due', pcm: 'Tax Wey You Owe', yo: 'Owó-orí Tó Kù', ha: 'Harajin da Ake Bi', ig: 'Ụtụ Dị' },
  'form.monthsLate': { en: 'Months Late', pcm: 'Months Wey Don Pass', yo: 'Oṣù Tó Ṣẹ́yìn', ha: 'Watanni Da Suka Wuce', ig: 'Ọnwa Gara Aga' },
  'form.incomeType': { en: 'Income Type', pcm: 'Type of Money', yo: 'Irú Owó Gbígba', ha: 'Nau\'in Kuɗi', ig: 'Ụdị Ego Nnata' },
  'form.sourceCountry': { en: 'Source Country', pcm: 'Where E Come From', yo: 'Orílẹ̀-èdè Tó Ti Wá', ha: 'Ƙasar Tushe', ig: 'Mba Isi Mmalite' },
  'form.foreignCurrency': { en: 'Foreign Currency', pcm: 'Foreign Money', yo: 'Owó Ilẹ̀ Òkèèrè', ha: 'Kuɗin Ƙasashen Waje', ig: 'Ego Mba Ọzọ' },
  'form.exchangeRate': { en: 'Exchange Rate', pcm: 'Exchange Rate', yo: 'Ìdíyelé Pàṣípààrọ̀', ha: 'Ƙimar Musanya', ig: 'Ọnụego Mgbanwe' },
  'form.foreignTaxPaid': { en: 'Foreign Tax Paid', pcm: 'Tax Wey You Pay Abroad', yo: 'Owó-orí Tí A San Ní Ilẹ̀ Òkèèrè', ha: 'Harajin Ƙasashen Waje Da Aka Biya', ig: 'Ụtụ Mba Ọzọ Akwụrụ' },
  'form.startingTurnover': { en: 'Starting Turnover', pcm: 'Starting Sales', yo: 'Iye Tita Ìbẹ̀rẹ̀', ha: 'Farkon Juya Hannu', ig: 'Mmalite Ego Ahịa' },
  'form.startingExpenses': { en: 'Starting Expenses', pcm: 'Starting Expenses', yo: 'Inawo Ìbẹ̀rẹ̀', ha: 'Farkon Kashewa', ig: 'Mmalite Mmefu' },
  'form.growthRate': { en: 'Revenue Growth Rate', pcm: 'How Fast Money Dey Grow', yo: 'Ìdagbàsókè Owó Gbígba', ha: 'Adadin Haɓakar Kudaden Shiga', ig: 'Ọnụego Uto Ego Nnata' },
  'form.expenseGrowthRate': { en: 'Expense Growth Rate', pcm: 'How Fast Expense Dey Grow', yo: 'Ìdagbàsókè Inawo', ha: 'Adadin Haɓakar Kashewa', ig: 'Ọnụego Uto Mmefu' },
  'form.projectionYears': { en: 'Projection Years', pcm: 'How Many Years', yo: 'Ọdún Àsọtẹ́lẹ̀', ha: 'Shekarun Hasashe', ig: 'Afọ Atụmatụ' },
  'form.verificationCode': { en: 'Verification Code', pcm: 'Verification Code', yo: 'Kóòdù Ìjẹ́rìísí', ha: 'Lambar Tabbatarwa', ig: 'Koodu Nyocha' },
  'form.ipAddress': { en: 'IP Address', pcm: 'IP Address', yo: 'Àdírẹ́sì IP', ha: 'Adireshin IP', ig: 'Adreesị IP' },
  'form.timezone': { en: 'Timezone', pcm: 'Time Zone', yo: 'Àgbègbè Àkókò', ha: 'Yankin Lokaci', ig: 'Mpaghara Oge' },
  'form.startTime': { en: 'Start Time', pcm: 'Start Time', yo: 'Àkókò Ìbẹ̀rẹ̀', ha: 'Lokacin Farawa', ig: 'Oge Mmalite' },
  'form.endTime': { en: 'End Time', pcm: 'End Time', yo: 'Àkókò Ìparí', ha: 'Lokacin Ƙarewa', ig: 'Oge Njedebe' },
  
  // Form Placeholders
  'placeholder.enterEmail': { en: 'Enter your email', pcm: 'Put your email', yo: 'Tẹ ímeèlì rẹ', ha: 'Shigar da imel ɗinka', ig: 'Tinye email gị' },
  'placeholder.enterPassword': { en: 'Enter your password', pcm: 'Put your password', yo: 'Tẹ ọ̀rọ̀ aṣínà rẹ', ha: 'Shigar da kalmar sirri', ig: 'Tinye okwuntụghe gị' },
  'placeholder.enterAmount': { en: 'Enter amount', pcm: 'Put amount', yo: 'Tẹ iye owó', ha: 'Shigar da adadi', ig: 'Tinye ego' },
  'placeholder.enterDescription': { en: 'Enter description', pcm: 'Describe am', yo: 'Ṣàlàyé rẹ̀', ha: 'Bayyana shi', ig: 'Kọwaa ya' },
  'placeholder.selectCategory': { en: 'Select category', pcm: 'Choose category', yo: 'Yan ẹ̀ka', ha: 'Zaɓi nau\'i', ig: 'Họrọ ụdị' },
  'placeholder.selectDate': { en: 'Select date', pcm: 'Choose date', yo: 'Yan ọjọ́', ha: 'Zaɓi kwanan wata', ig: 'Họrọ ụbọchị' },
  'placeholder.search': { en: 'Search...', pcm: 'Find am...', yo: 'Ṣàwárí...', ha: 'Bincika...', ig: 'Chọọ...' },
  'placeholder.typeMessage': { en: 'Type your message...', pcm: 'Type your message...', yo: 'Tẹ ìròyìn rẹ...', ha: 'Rubuta saƙonka...', ig: 'Dee ozi gị...' },
  'placeholder.enterCode': { en: 'Enter code', pcm: 'Put code', yo: 'Tẹ kóòdù', ha: 'Shigar da lambar', ig: 'Tinye koodu' },
  'placeholder.enterPhoneNumber': { en: 'Enter phone number', pcm: 'Put phone number', yo: 'Tẹ nọ́ńbà fóònù', ha: 'Shigar da lambar waya', ig: 'Tinye nọmba ekwentị' },
  'placeholder.receiptDescription': { en: 'Receipt description', pcm: 'Wetin the receipt talk', yo: 'Àlàyé ìwé ìdánilẹ́kọ̀ọ́', ha: 'Bayanin rasit', ig: 'Nkọwa risịtị' },
  'placeholder.tellUsWhatYouThink': { en: 'Tell us what you think, suggest features, or report issues...', pcm: 'Tell us wetin you think, suggest features, or report wahala...', yo: 'Sọ ohun tí o rò fún wa, dábàá àwọn ẹ̀yà, tàbí jábọ̀ àwọn ìṣòro...', ha: 'Gaya mana abin da kuke tunani, ba da shawara kan abubuwa, ko bayar da rahoto...', ig: 'Gwa anyị ihe ị chere, tụọ atụ njirimara, ma ọ bụ kọọ nsogbu...' },
  'placeholder.askAboutTaxes': { en: 'Ask about Nigerian taxes...', pcm: 'Ask about Nigeria tax...', yo: 'Bi lórí owó-orí Nàìjíríà...', ha: 'Tambayi game da harajin Najeriya...', ig: 'Jụọ maka ụtụ Naịjirịa...' },
  
  // Validation Messages
  'validation.required': { en: 'This field is required', pcm: 'You must fill this one', yo: 'Ibi yìí jẹ́ dandan', ha: 'Wannan filin yana buƙata', ig: 'A chọrọ ebe a' },
  'validation.invalidEmail': { en: 'Please enter a valid email', pcm: 'Enter correct email', yo: 'Jọ̀wọ́ tẹ ímeèlì tó tọ́', ha: 'Da fatan za a shigar da imel ɗin da ya dace', ig: 'Biko tinye email ziri ezi' },
  'validation.passwordTooShort': { en: 'Password must be at least 8 characters', pcm: 'Password must reach 8 letters', yo: 'Ọ̀rọ̀ aṣínà gbọ́dọ̀ jẹ́ o kéré jù lọ àwọn ohun kikọ 8', ha: 'Kalmar sirri dole ta kasance aƙalla haruffa 8', ig: 'Okwuntụghe aghaghị ịbụ opekata mpe mkpụrụedemede 8' },
  'validation.passwordMismatch': { en: 'Passwords do not match', pcm: 'The two password no match', yo: 'Àwọn ọ̀rọ̀ aṣínà kò bára dọ́gba', ha: 'Kalmomin sirri ba su daidaita ba', ig: 'Okwuntụghe adabaghị' },
  'validation.invalidAmount': { en: 'Please enter a valid amount', pcm: 'Enter correct amount', yo: 'Jọ̀wọ́ tẹ iye owó tó tọ́', ha: 'Da fatan za a shigar da adadin da ya dace', ig: 'Biko tinye ego ziri ezi' },
  'validation.selectRating': { en: 'Please select a rating', pcm: 'Choose how many stars', yo: 'Jọ̀wọ́ yan ìdíyelé', ha: 'Da fatan za a zaɓi ƙima', ig: 'Biko họrọ ntụle' },
  'validation.selectAtLeastOneDay': { en: 'Please select at least one day', pcm: 'Choose at least one day', yo: 'Jọ̀wọ́ yan o kéré jù lọ ọjọ́ kan', ha: 'Da fatan za a zaɓi aƙalla rana ɗaya', ig: 'Biko họrọ opekata mpe otu ụbọchị' },
  'validation.endTimeAfterStart': { en: 'End time must be after start time', pcm: 'End time must come after start time', yo: 'Àkókò ìparí gbọ́dọ̀ jẹ́ lẹ́yìn àkókò ìbẹ̀rẹ̀', ha: 'Lokacin ƙarewa dole ya kasance bayan lokacin farawa', ig: 'Oge njedebe ga-abụrịrị mgbe mmalite gachara' },
  'validation.invalidIPFormat': { en: 'Invalid IP format', pcm: 'IP format no correct', yo: 'Ọ̀nà IP tó jẹ́ àṣìṣe', ha: 'Tsarin IP mara inganci', ig: 'Usoro IP ezighị ezi' },
  'validation.invalidPhoneNumber': { en: 'Please enter a valid phone number', pcm: 'Enter correct phone number', yo: 'Jọ̀wọ́ tẹ nọ́ńbà fóònù tó tọ́', ha: 'Da fatan za a shigar da lambar waya mai inganci', ig: 'Biko tinye nọmba ekwentị ziri ezi' },
  
  // Buttons
  'btn.calculate': { en: 'Calculate', pcm: 'Calculate', yo: 'Ṣe Ìṣirò', ha: 'Ƙididdige', ig: 'Gbakọọ' },
  'btn.calculateTax': { en: 'Calculate Tax', pcm: 'Calculate Tax', yo: 'Ṣe Ìṣirò Owó-orí', ha: 'Ƙididdige Haraji', ig: 'Gbakọọ Ụtụ' },
  'btn.calculatePenalty': { en: 'Calculate Penalty', pcm: 'Calculate Penalty', yo: 'Ṣe Ìṣirò Ìjìyà', ha: 'Ƙididdige Hukunci', ig: 'Gbakọọ Ntaramahụhụ' },
  'btn.scanReceipt': { en: 'Scan Receipt', pcm: 'Scan Receipt', yo: 'Ṣayẹ̀wò Ìwé Ìdánilẹ́kọ̀ọ́', ha: 'Duba Rasit', ig: 'Nyochaa Risịtị' },
  'btn.addEntry': { en: 'Add Entry', pcm: 'Add Entry', yo: 'Fi Ìwọlé Kún', ha: 'Ƙara Shigarwa', ig: 'Tinye Ntinye' },
  'btn.scanAnother': { en: 'Scan Another', pcm: 'Scan Another One', yo: 'Ṣayẹ̀wò Òmíràn', ha: 'Duba Wani', ig: 'Nyochaa Ọzọ' },
  'btn.sendVerificationCode': { en: 'Send Verification Code', pcm: 'Send Verification Code', yo: 'Fi Kóòdù Ìjẹ́rìísí Ránṣẹ́', ha: 'Aika Lambar Tabbatarwa', ig: 'Ziga Koodu Nyocha' },
  'btn.verify': { en: 'Verify', pcm: 'Verify', yo: 'Jẹ́rìísí', ha: 'Tabbatar', ig: 'Nyochaa' },
  'btn.changeNumber': { en: 'Change Number', pcm: 'Change Number', yo: 'Yi Nọ́ńbà Padà', ha: 'Canja Lamba', ig: 'Gbanwee Nọmba' },
  'btn.addCurrentIP': { en: 'Add Current IP', pcm: 'Add Current IP', yo: 'Fi IP Yìí Kún', ha: 'Ƙara IP na Yanzu', ig: 'Tinye IP Ugbu a' },
  'btn.addIPRange': { en: 'Add IP Range', pcm: 'Add IP Range', yo: 'Fi Ìbùdó IP Kún', ha: 'Ƙara Kewayon IP', ig: 'Tinye Oke IP' },
  'btn.importCSV': { en: 'Import CSV', pcm: 'Import CSV', yo: 'Ṣe Àwọlé CSV', ha: 'Shigo da CSV', ig: 'Bubata CSV' },
  'btn.saveTimeRestrictions': { en: 'Save Time Restrictions', pcm: 'Save Time Rules', yo: 'Fi Àwọn Ìdènà Àkókò Pamọ́', ha: 'Ajiye Takaitawar Lokaci', ig: 'Chekwaa Mmachi Oge' },
  'btn.submitFeedback': { en: 'Submit Feedback', pcm: 'Submit Feedback', yo: 'Fi Èsì Ránṣẹ́', ha: 'Aika Bayani', ig: 'Nyefee Nzaghachi' },
  'btn.tryAgain': { en: 'Try Again', pcm: 'Try Again', yo: 'Gbìyànjú Lẹ́ẹ̀kan Sí', ha: 'Sake Gwadawa', ig: 'Nwaa Ọzọ' },
  'btn.goHome': { en: 'Go Home', pcm: 'Go Home', yo: 'Lọ Sílé', ha: 'Je Gida', ig: 'Gaa Ụlọ' },
  'btn.refresh': { en: 'Refresh', pcm: 'Refresh', yo: 'Ṣe Àtúnṣe', ha: 'Sabunta', ig: 'Mee Ọhụrụ' },
  'btn.download': { en: 'Download', pcm: 'Download', yo: 'Ṣe Ìgbàsílẹ̀', ha: 'Sauke', ig: 'Budata' },
  'btn.upload': { en: 'Upload', pcm: 'Upload', yo: 'Gbé Sókè', ha: 'Ɗora', ig: 'Bulite' },
  'btn.copy': { en: 'Copy', pcm: 'Copy', yo: 'Ṣe Àdàkọ', ha: 'Kwafi', ig: 'Detuo' },
  'btn.share': { en: 'Share', pcm: 'Share', yo: 'Pín', ha: 'Raba', ig: 'Kekọrịta' },
  'btn.print': { en: 'Print', pcm: 'Print', yo: 'Tẹ̀ Jáde', ha: 'Buga', ig: 'Bipụta' },
  'btn.export': { en: 'Export', pcm: 'Export', yo: 'Ṣe Ìkójáde', ha: 'Fitar', ig: 'Bufee' },
  'btn.import': { en: 'Import', pcm: 'Import', yo: 'Ṣe Àwọlé', ha: 'Shigo', ig: 'Bubata' },
  'btn.filter': { en: 'Filter', pcm: 'Filter', yo: 'Ṣàyẹ̀wò', ha: 'Tace', ig: 'Nzacha' },
  'btn.clearFilters': { en: 'Clear Filters', pcm: 'Clear Filters', yo: 'Pa Àwọn Àyẹ̀wò', ha: 'Share Tace', ig: 'Kpochapụ Nzacha' },
  'btn.viewDetails': { en: 'View Details', pcm: 'See Details', yo: 'Wo Àwọn Àlàyé', ha: 'Duba Cikakkun Bayanai', ig: 'Lee Nkọwa' },
  'btn.learnMore': { en: 'Learn More', pcm: 'Learn More', yo: 'Kọ́ Púpọ̀ Sí', ha: 'Ƙara Koyo', ig: 'Mụtakwuo' },
  
  // Component-specific - Feedback Form
  'feedback.title': { en: 'Give Feedback', pcm: 'Give Feedback', yo: 'Fun Ní Èsì', ha: 'Ba da Ra\'ayi', ig: 'Nye Nzaghachi' },
  'feedback.description': { en: 'Help us improve TaxForge NG. Your feedback is valuable!', pcm: 'Help us improve TaxForge NG. Your feedback dey important!', yo: 'Ràn wá lọ́wọ́ láti mú TaxForge NG dára sí. Èsì rẹ jẹ́ ọlọ́rọ̀!', ha: 'Taimake mu inganta TaxForge NG. Ra\'ayoyinku suna da daraja!', ig: 'Nyere anyị aka ịkwalite TaxForge NG. Nzaghachi gị bara uru!' },
  'feedback.rateExperience': { en: 'How would you rate your experience?', pcm: 'How you take see am?', yo: 'Báwo ni o ṣe ń ṣàyẹ̀wò ìrírí rẹ?', ha: 'Ta yaya za ku kimanta ƙwarewarku?', ig: 'Kedu ka ị ga-esi nye nnwale gị ntụle?' },
  'feedback.category': { en: 'Category', pcm: 'Category', yo: 'Ẹ̀ka', ha: 'Nau\'i', ig: 'Ụdị' },
  'feedback.yourFeedback': { en: 'Your Feedback (Optional)', pcm: 'Your Feedback (Optional)', yo: 'Èsì Rẹ (Kìí Ṣe Dandan)', ha: 'Ra\'ayinku (Zaɓi)', ig: 'Nzaghachi Gị (Nhọrọ)' },
  'feedback.thankYou': { en: 'Thank You!', pcm: 'Thank You!', yo: 'E Ṣé O!', ha: 'Na Gode!', ig: 'Daalụ!' },
  'feedback.thankYouMessage': { en: 'Your feedback helps us improve TaxForge NG.', pcm: 'Your feedback go help us improve TaxForge NG.', yo: 'Èsì rẹ ń ràn wá lọ́wọ́ láti mú TaxForge NG dára sí.', ha: 'Ra\'ayinku yana taimaka mana inganta TaxForge NG.', ig: 'Nzaghachi gị na-enyere anyị aka ịkwalite TaxForge NG.' },
  'feedback.generalFeedback': { en: 'General Feedback', pcm: 'General Feedback', yo: 'Èsì Àpapọ̀', ha: 'Ra\'ayi Gabaɗaya', ig: 'Nzaghachi Izugbe' },
  'feedback.featureRequest': { en: 'Feature Request', pcm: 'Feature Request', yo: 'Ìbéèrè Ẹ̀yà', ha: 'Buƙatar Fasali', ig: 'Arịrịọ Njirimara' },
  'feedback.bugReport': { en: 'Bug Report', pcm: 'Bug Report', yo: 'Ìròyìn Àṣìṣe', ha: 'Rahoton Matsala', ig: 'Akụkọ Ahụhụ' },
  'feedback.improvementSuggestion': { en: 'Improvement Suggestion', pcm: 'Improvement Suggestion', yo: 'Àbá Ìlọsíwájú', ha: 'Shawarar Ingantawa', ig: 'Atụmụaka Nkwalite' },
  'feedback.praise': { en: 'Praise / Thanks', pcm: 'Praise / Thanks', yo: 'Ìyìn / Ọpẹ́', ha: 'Yabo / Godiya', ig: 'Otuto / Ekele' },
  
  // Company Size
  'companySize.small': { en: 'Small', pcm: 'Small', yo: 'Kékeré', ha: 'Ƙarami', ig: 'Obere' },
  'companySize.medium': { en: 'Medium', pcm: 'Medium', yo: 'Àárín', ha: 'Matsakaici', ig: 'Etiti' },
  'companySize.large': { en: 'Large', pcm: 'Big', yo: 'Ńlá', ha: 'Babba', ig: 'Ukwuu' },
  
  // Entity Types
  'entityType.company': { en: 'Company', pcm: 'Company', yo: 'Ilé-iṣẹ́', ha: 'Kamfani', ig: 'Ụlọ Ọrụ' },
  'entityType.businessName': { en: 'Business Name', pcm: 'Business Name', yo: 'Orúkọ Iṣẹ́', ha: 'Sunan Kasuwanci', ig: 'Aha Azụmahịa' },
  
  
  // Component-specific - Foreign Income Calculator
  'foreignIncome.title': { en: 'Foreign Income Calculator', pcm: 'Foreign Income Calculator', yo: 'Ẹ̀rọ Ìṣirò Owó Ilẹ̀ Òkèèrè', ha: 'Na\'urar Ƙididdiga Kuɗin Ƙasashen Waje', ig: 'Ngwa Mgbako Ego Mba Ọzọ' },
  'foreignIncome.description': { en: 'Calculate tax on foreign income with treaty benefits', pcm: 'Calculate tax for foreign money with treaty benefits', yo: 'Ṣe ìṣirò owó-orí lórí owó ilẹ̀ òkèèrè pẹ̀lú àwọn àǹfààní àdéhùn', ha: 'Ƙididdige haraji akan kuɗin ƙasashen waje tare da fa\'idodin yarjejeniya', ig: 'Gbakọọ ụtụ na ego mba ọzọ na uru nkwekọrịta' },
  'foreignIncome.nigerianResident': { en: 'Nigerian Tax Resident', pcm: 'Nigerian Tax Resident', yo: 'Olùsanwó Owó-orí Nàìjíríà', ha: 'Mazaunin Haraji na Najeriya', ig: 'Onye Ụtụ Naịjirịa' },
  'foreignIncome.residencyNote': { en: '183+ days in Nigeria or permanent home', pcm: '183+ days for Nigeria or permanent home', yo: 'Ọjọ́ 183+ ní Nàìjíríà tàbí ilé àyérayé', ha: 'Kwanaki 183+ a Najeriya ko gida na dindindin', ig: 'Ụbọchị 183+ na Naịjirịa ma ọ bụ ụlọ ebighi ebi' },
  'foreignIncome.employmentIncome': { en: 'Employment Income', pcm: 'Salary Money', yo: 'Owó Iṣẹ́', ha: 'Kuɗin Aikin Yi', ig: 'Ego Ọrụ' },
  'foreignIncome.dividendIncome': { en: 'Dividend Income', pcm: 'Dividend Money', yo: 'Owó Ìpín', ha: 'Kuɗin Raba', ig: 'Ego Nkewa' },
  'foreignIncome.interestIncome': { en: 'Interest Income', pcm: 'Interest Money', yo: 'Owó Ère', ha: 'Kuɗin Riba', ig: 'Ego Ọmụrụnwa' },
  'foreignIncome.royaltyIncome': { en: 'Royalty Income', pcm: 'Royalty Money', yo: 'Owó Ẹ̀tọ́', ha: 'Kuɗin Royalty', ig: 'Ego Ụgwọ Onyinye' },
  'foreignIncome.businessIncome': { en: 'Business/Professional Income', pcm: 'Business/Professional Money', yo: 'Owó Iṣẹ́/Ọjọ́gba', ha: 'Kuɗin Kasuwanci/Ƙwararru', ig: 'Ego Azụmahịa/Ọkachamara' },
  'foreignIncome.nairaEquivalent': { en: 'Naira Equivalent', pcm: 'Naira Equivalent', yo: 'Iye Náírà', ha: 'Daidaitaccen Naira', ig: 'Ihe Kwekọrọ Naira' },
  'foreignIncome.applicableRate': { en: 'Applicable Rate', pcm: 'Rate Wey Apply', yo: 'Ìdíyelé Tí Ó Wúlò', ha: 'Ƙimar da Ta Dace', ig: 'Ọnụego Metụtara' },
  'foreignIncome.treatyRate': { en: 'Treaty rate', pcm: 'Treaty rate', yo: 'Ìdíyelé àdéhùn', ha: 'Ƙimar yarjejeniya', ig: 'Ọnụego nkwekọrịta' },
  'foreignIncome.foreignTaxCredit': { en: 'Foreign Tax Credit', pcm: 'Foreign Tax Credit', yo: 'Kírẹ́dítì Owó-orí Ilẹ̀ Òkèèrè', ha: 'Bashi na Harajin Ƙasashen Waje', ig: 'Kredit Ụtụ Mba Ọzọ' },
  'foreignIncome.netNigerianTax': { en: 'Net Nigerian Tax', pcm: 'Final Nigeria Tax', yo: 'Àpapọ̀ Owó-orí Nàìjíríà', ha: 'Jimillar Harajin Najeriya', ig: 'Ụtụ Naịjirịa Net' },
  'foreignIncome.nonResidentNote': { en: 'Non-residents are only taxed on Nigerian-sourced income. Foreign income may not be taxable.', pcm: 'If you no dey stay Nigeria, dem go only tax you for money wey come from Nigeria. Foreign money fit no get tax.', yo: 'Àwọn tí kò gbé ní Nàìjíríà a máa san owó-orí lórí owó tí ó ti Nàìjíríà wá nìkan. Owó ilẹ̀ òkèèrè le ma jẹ́ sísanwó.', ha: 'Waɗanda ba mazauna ba ana biyan haraji ne kawai akan kuɗin da aka samu daga Najeriya. Kuɗin ƙasashen waje na iya zama ba a biyan haraji ba.', ig: 'A na-atụ ndị anaghị ebi Naịjirịa ụtụ naanị na ego sitere na Naịjirịa. O nwere ike ọ gaghị atụ ụtụ na ego mba ọzọ.' },
  'foreignIncome.treatyNote': { en: 'Nigeria has a Double Taxation Treaty with {country}. You may be eligible for reduced rates.', pcm: 'Nigeria get Double Taxation Treaty with {country}. You fit qualify for lower rates.', yo: 'Nàìjíríà ní Àdéhùn Owó-orí Méjì pẹ̀lú {country}. O lè wúlò fún àwọn ìdíyelé tí a dín kù.', ha: 'Najeriya tana da Yarjejeniyar Biyan Haraji Sau Biyu tare da {country}. Kuna iya cancanta don ƙimar da aka rage.', ig: 'Naịjirịa nwere Nkwekọrịta Ụtụ Ugboro Abụọ na {country}. I nwere ike tozuru maka ọnụego ebelata.' },
  'foreignIncome.useCBNRate': { en: 'Use CBN rate at time of receipt', pcm: 'Use CBN rate when you receive am', yo: 'Lo ìdíyelé CBN ní àkókò gbígba', ha: 'Yi amfani da ƙimar CBN a lokacin karɓa', ig: 'Jiri ọnụego CBN n\'oge nnata' },
  
  // Component-specific - OCR Receipt Scanner
  'ocr.title': { en: 'Scan Receipt', pcm: 'Scan Receipt', yo: 'Ṣayẹ̀wò Ìwé Ìdánilẹ́kọ̀ọ́', ha: 'Duba Rasit', ig: 'Nyochaa Risịtị' },
  'ocr.description': { en: 'Upload a receipt image for automatic data extraction', pcm: 'Upload receipt picture for automatic data extraction', yo: 'Gbé àwòrán ìwé ìdánilẹ́kọ̀ọ́ sókè fún ìyọkúrò dátà aláìfọwọ́yí', ha: 'Ɗora hoton rasit don fitowar bayanan ta atomatik', ig: 'Bulite foto risịtị maka mwepụta data akpaghị aka' },
  'ocr.aiCategorization': { en: 'AI Categorization', pcm: 'AI Categorization', yo: 'Ìsọ̀rí AI', ha: 'Rarraba AI', ig: 'Nhazi AI' },
  'ocr.aiCategorizationNote': { en: 'Use AI to categorize & check deductibility', pcm: 'Use AI to put am for category & check if e fit reduce tax', yo: 'Lo AI láti ṣe ìsọ̀rí & ṣàyẹ̀wò bóyá ó lè yọ́kúrò', ha: 'Yi amfani da AI don rarrabawa & duba ko za a iya cire shi', ig: 'Jiri AI ịhazi & lelee ma enwere ike iwepụ' },
  'ocr.clickToUpload': { en: 'Click to upload receipt', pcm: 'Click to upload receipt', yo: 'Tẹ láti gbé ìwé ìdánilẹ́kọ̀ọ́ sókè', ha: 'Danna don ɗora rasit', ig: 'Pịa iji bulite risịtị' },
  'ocr.supportsFormats': { en: 'Supports JPG, PNG, PDF', pcm: 'E support JPG, PNG, PDF', yo: 'Ó ṣàtìlẹ́yìn JPG, PNG, PDF', ha: 'Yana goyan baya JPG, PNG, PDF', ig: 'Na-akwado JPG, PNG, PDF' },
  'ocr.initializingOCR': { en: 'Initializing OCR...', pcm: 'Starting OCR...', yo: 'Ń bẹ̀rẹ̀ OCR...', ha: 'Ana fara OCR...', ig: 'Na-amalite OCR...' },
  'ocr.readingReceipt': { en: 'Reading receipt...', pcm: 'Reading receipt...', yo: 'Ń kà ìwé ìdánilẹ́kọ̀ọ́...', ha: 'Ana karanta rasit...', ig: 'Na-agụ risịtị...' },
  'ocr.processingImage': { en: 'Processing image...', pcm: 'Processing picture...', yo: 'Ń ṣiṣẹ́ àwòrán...', ha: 'Ana sarrafa hoto...', ig: 'Na-arụ ọrụ foto...' },
  'ocr.analyzingReceipt': { en: 'Analyzing receipt...', pcm: 'Checking receipt...', yo: 'Ń ṣàyẹ̀wò ìwé ìdánilẹ́kọ̀ọ́...', ha: 'Ana nazarin rasit...', ig: 'Na-enyocha risịtị...' },
  'ocr.aiCategorizing': { en: 'AI categorizing...', pcm: 'AI dey categorize am...', yo: 'AI ń ṣe ìsọ̀rí...', ha: 'AI yana rarrabawa...', ig: 'AI na-ahazi...' },
  'ocr.highConfidence': { en: 'High confidence scan', pcm: 'E sure pass', yo: 'Ìṣayẹ̀wò tó dájú', ha: 'Duba mai tabbas', ig: 'Nyocha ntụkwasị obi' },
  'ocr.pleaseVerify': { en: 'Please verify details', pcm: 'Abeg verify the details', yo: 'Jọ̀wọ́ jẹ́rìísí àwọn àlàyé', ha: 'Da fatan za a tabbatar da cikakkun bayanai', ig: 'Biko nyochaa nkọwa' },
  'ocr.lowConfidence': { en: 'Low confidence - manual entry recommended', pcm: 'E no sure - better enter am yourself', yo: 'Kò dájú - a ṣe àbá pé kí o tẹ̀ fúnra rẹ', ha: 'Ƙarancin tabbaci - ana ba da shawarar shigarwar hannu', ig: 'Ntụkwasị obi dị ala - a na-atụ aro ịtinye aka' },
  'ocr.amountNaira': { en: 'Amount (₦)', pcm: 'Amount (₦)', yo: 'Iye (₦)', ha: 'Adadi (₦)', ig: 'Ego (₦)' },
  'ocr.taxDeductible': { en: 'Tax Deductible', pcm: 'Tax Deductible', yo: 'Àlèyọ Owó-orí', ha: 'Za\'a iya Cire Haraji', ig: 'Enwere ike iwepụ Ụtụ' },
  'ocr.taxTip': { en: 'Tax tip', pcm: 'Tax tip', yo: 'Ìmọ̀ràn owó-orí', ha: 'Shawarar haraji', ig: 'Ntụziaka ụtụ' },
  'ocr.viewExtractedText': { en: 'View extracted text', pcm: 'See the text wey we extract', yo: 'Wo ọ̀rọ̀ tí a yọ jáde', ha: 'Duba rubutun da aka fitar', ig: 'Lee ederede ewepụtara' },
  
  // Component-specific - Penalty Estimator
  'penalty.title': { en: 'Penalty Estimator', pcm: 'Penalty Calculator', yo: 'Ẹ̀rọ Ìṣirò Ìjìyà', ha: 'Na\'urar Ƙididdiga Hukunci', ig: 'Ngwa Mgbako Ntaramahụhụ' },
  'penalty.description': { en: 'Estimate late filing and payment penalties', pcm: 'Calculate penalty for late filing and payment', yo: 'Ṣe àmúdájú ìjìyà fún fíránṣẹ́ àti sísanwó tó pẹ́', ha: 'Kimanta hukunce-hukuncen jinkirin shigarwa da biya', ig: 'Chọpụta ntaramahụhụ maka itinye ozi na ịkwụ ụgwọ na-adịghị oge' },
  'penalty.companyIncomeTax': { en: 'Company Income Tax (CIT)', pcm: 'Company Income Tax (CIT)', yo: 'Owó-orí Owó-wíwọlé Ilé-iṣẹ́ (CIT)', ha: 'Harajin Kuɗin Shigar Kamfani (CIT)', ig: 'Ụtụ Ego Nnata Ụlọ Ọrụ (CIT)' },
  'penalty.valueAddedTax': { en: 'Value Added Tax (VAT)', pcm: 'Value Added Tax (VAT)', yo: 'Owó-orí Iye Àfikún (VAT)', ha: 'Harajin Ƙimar da aka Ƙara (VAT)', ig: 'Ụtụ Uru Etinyere (VAT)' },
  'penalty.personalIncomeTax': { en: 'Personal Income Tax (PIT)', pcm: 'Personal Income Tax (PIT)', yo: 'Owó-orí Owó-wíwọlé Ara-ẹni (PIT)', ha: 'Harajin Kuɗin Shigar Mutum (PIT)', ig: 'Ụtụ Ego Nnata Onwe (PIT)' },
  'penalty.payAsYouEarn': { en: 'Pay As You Earn (PAYE)', pcm: 'Pay As You Earn (PAYE)', yo: 'San Bí O Ṣe Ń Jèrè (PAYE)', ha: 'Biya Yayin da Kuke Samu (PAYE)', ig: 'Kwụọ Dịka Ị Na-erite (PAYE)' },
  'penalty.cbnLendingRate': { en: 'CBN Lending Rate', pcm: 'CBN Lending Rate', yo: 'Ìdíyelé Àwín CBN', ha: 'Ƙimar Lamuni na CBN', ig: 'Ọnụego Ịgbazinye CBN' },
  'penalty.lateFilingPenalty': { en: 'Late Filing Penalty', pcm: 'Late Filing Penalty', yo: 'Ìjìyà Fíránṣẹ́ Tó Pẹ́', ha: 'Hukuncin Jinkirin Shigarwa', ig: 'Ntaramahụhụ Itinye Ozi Na-adịghị Oge' },
  'penalty.interestCharges': { en: 'Interest Charges', pcm: 'Interest Charges', yo: 'Ìdíyelé Ère', ha: 'Cajin Riba', ig: 'Ụgwọ Ọmụrụnwa' },
  'penalty.totalPenalty': { en: 'Total Penalty', pcm: 'Total Penalty', yo: 'Àpapọ̀ Ìjìyà', ha: 'Jimillar Hukunci', ig: 'Mkpokọta Ntaramahụhụ' },
  'penalty.ofOriginalTax': { en: 'of original tax', pcm: 'of original tax', yo: 'ti owó-orí àkọ́kọ́', ha: 'na asalin haraji', ig: 'nke ụtụ mbụ' },
  'penalty.disclaimer': { en: 'Estimates only. Actual penalties may vary. Consider voluntary disclosure for reduced penalties.', pcm: 'Na estimate only. Real penalty fit different. Think about voluntary disclosure for smaller penalty.', yo: 'Àmúdájú nìkan. Àwọn ìjìyà gidi lè yàtọ̀. Ronu nípa ìfihàn aráyédéyíì fún àwọn ìjìyà tí a dín kù.', ha: 'Kimantawa kawai. Ainihin hukunci na iya bambanta. Yi la\'akari da bayyanar son rai don rage hukunci.', ig: 'Nchọpụta naanị. Ntaramahụhụ n\'ezie nwere ike ịdị iche. Tụlee mkpughe aka maka ntaramahụhụ ebelata.' },
  
  // Component-specific - Multi-Year Projection
  'projection.revenueVsTax': { en: 'Revenue vs Tax Over Time', pcm: 'Sales vs Tax Over Time', yo: 'Owó Gbígba vs Owó-orí Ní Àkókò', ha: 'Kudaden Shiga vs Haraji A Kan Lokaci', ig: 'Ego Nnata vs Ụtụ N\'oge' },
  'projection.yearByYear': { en: 'Year-by-Year Breakdown', pcm: 'Year by Year Breakdown', yo: 'Ìpínpín Ọdún-sí-Ọdún', ha: 'Rarraba Shekara-zuwa-Shekara', ig: 'Nkewa Afọ-ka-Afọ' },
  'projection.insights': { en: 'Projection Insights', pcm: 'Projection Insights', yo: 'Àwọn Ìmọ̀ràn Àsọtẹ́lẹ̀', ha: 'Fahimtar Hasashe', ig: 'Nghọta Atụmatụ' },
  'projection.totalTaxOverPeriod': { en: 'Total Tax Over Period', pcm: 'Total Tax For The Period', yo: 'Àpapọ̀ Owó-orí Ní Àkókò', ha: 'Jimillar Haraji A Kan Lokaci', ig: 'Mkpokọta Ụtụ N\'oge' },
  'projection.exemptYearsSavings': { en: 'Exempt Years Savings', pcm: 'Money Wey You Save From Exempt Years', yo: 'Àwọn Ìfipamọ́ Ọdún Àìsanwó', ha: 'Tanadin Shekarun Keɓewa', ig: 'Nchekwa Afọ Mpụnarị' },
  'projection.yearNRevenue': { en: 'Year {n} Revenue', pcm: 'Year {n} Sales', yo: 'Owó Gbígba Ọdún {n}', ha: 'Kudaden Shigar Shekara {n}', ig: 'Ego Nnata Afọ {n}' },
  'projection.taxTransition': { en: 'Tax Transition in {year}', pcm: 'Tax go Change for {year}', yo: 'Ìyípadà Owó-orí ní {year}', ha: 'Canjin Haraji a {year}', ig: 'Mgbanwe Ụtụ na {year}' },
  'projection.exceedThreshold': { en: 'Your company will exceed ₦50M turnover and transition from 0% to {rate}% CIT rate.', pcm: 'Your company go pass ₦50M sales and tax go change from 0% to {rate}% CIT.', yo: 'Ilé-iṣẹ́ rẹ yóò kọjá iye tita ₦50M àti yípadà láti 0% sí {rate}% CIT.', ha: 'Kamfanin ku zai wuce jujjuyawar ₦50M kuma zai canza daga 0% zuwa {rate}% CIT.', ig: 'Ụlọ ọrụ gị ga-agafe ₦50M ahịa ma gbanwee site na 0% gaa {rate}% CIT.' },
  'projection.estimatedSavings': { en: 'Estimated savings during exemption period', pcm: 'Money wey you save during exemption period', yo: 'Àmúdájú ìfipamọ́ ní àkókò àìsanwó', ha: 'Kimantaccen tanadin lokacin keɓewa', ig: 'Nchekwa achọpụtara n\'oge mpụnarị' },
  'projection.exempt': { en: 'Exempt', pcm: 'No Tax', yo: 'Àìsanwó', ha: 'Keɓe', ig: 'Mpụnarị' },
  'projection.small': { en: 'Small', pcm: 'Small', yo: 'Kékeré', ha: 'Ƙarami', ig: 'Obere' },
  'projection.medium': { en: 'Medium', pcm: 'Medium', yo: 'Àárín', ha: 'Matsakaici', ig: 'Etiti' },
  'projection.large': { en: 'Large', pcm: 'Big', yo: 'Ńlá', ha: 'Babba', ig: 'Ukwu' },
  'projection.company': { en: 'Company', pcm: 'Company', yo: 'Ilé-iṣẹ́', ha: 'Kamfani', ig: 'Ụlọ Ọrụ' },
  'projection.businessName': { en: 'Business Name', pcm: 'Business Name', yo: 'Orúkọ Iṣẹ́', ha: 'Sunan Kasuwanci', ig: 'Aha Azụmahịa' },
  'projection.2026Rules': { en: '2026 Rules', pcm: '2026 Rules', yo: 'Àwọn Òfin 2026', ha: 'Dokokin 2026', ig: 'Iwu 2026' },
  'projection.pre2026Rules': { en: 'Pre-2026 Rules', pcm: 'Before 2026 Rules', yo: 'Àwọn Òfin Ṣáájú 2026', ha: 'Dokokin Kafin 2026', ig: 'Iwu Tupu 2026' },
  
  // Component-specific - WhatsApp Verification
  'whatsapp.title': { en: 'WhatsApp Notifications', pcm: 'WhatsApp Notifications', yo: 'Àwọn Ìfitónilétí WhatsApp', ha: 'Sanarwar WhatsApp', ig: 'Ọkwa WhatsApp' },
  'whatsapp.description': { en: 'Get tax reminders and alerts via WhatsApp', pcm: 'Get tax reminders and alerts for WhatsApp', yo: 'Gba àwọn ìránṣọ́ àti ìkìlọ̀ owó-orí nípasẹ̀ WhatsApp', ha: 'Sami tunatarwa da faɗakarwa ta haraji ta WhatsApp', ig: 'Nweta ncheta ụtụ na mkpọsa site na WhatsApp' },
  'whatsapp.verified': { en: 'WhatsApp Verified', pcm: 'WhatsApp Verified', yo: 'WhatsApp Ti Jẹ́rìísí', ha: 'WhatsApp An Tabbatar', ig: 'WhatsApp Enyochara' },
  'whatsapp.numberConnected': { en: 'Number connected', pcm: 'Number connected', yo: 'Nọ́ńbà ti so pọ̀', ha: 'An haɗa lamba', ig: 'Ejikọtara nọmba' },
  'whatsapp.nigerianPhoneNumber': { en: 'Nigerian Phone Number', pcm: 'Nigerian Phone Number', yo: 'Nọ́ńbà Fóònù Nàìjíríà', ha: 'Lambar Waya ta Najeriya', ig: 'Nọmba Ekwentị Naịjirịa' },
  'whatsapp.sendCodeNote': { en: "We'll send a verification code to this number", pcm: 'We go send verification code to this number', yo: 'A óò fi kóòdù ìjẹ́rìísí ránṣẹ́ sí nọ́ńbà yìí', ha: 'Za mu aika lambar tabbatarwa zuwa wannan lambar', ig: 'Anyị ga-eziga koodu nyocha na nọmba a' },
  'whatsapp.enterCodeSent': { en: 'Enter the code sent to your WhatsApp', pcm: 'Enter the code wey we send to your WhatsApp', yo: 'Tẹ kóòdù tí a fi ránṣẹ́ sí WhatsApp rẹ', ha: 'Shigar da lambar da aka aika zuwa WhatsApp ɗinka', ig: 'Tinye koodu ezigara na WhatsApp gị' },
  
  // Component-specific - IP Whitelist Manager
  'ipWhitelist.title': { en: 'IP Address Whitelist', pcm: 'IP Address Whitelist', yo: 'Àkójọ Àdírẹ́sì IP Tó Wúlò', ha: 'Jerin Adireshin IP da Aka Yarda', ig: 'Listi IP Akwadoro' },
  'ipWhitelist.description': { en: 'Restrict logins to specific IP addresses or ranges', pcm: 'Restrict login to specific IP addresses or ranges', yo: 'Dènà wíwọlé sí àwọn àdírẹ́sì IP tàbí àwọn ìbùdó pàtó', ha: 'Iyakance shiga zuwa takamaiman adireshin IP ko kewayon', ig: 'Gbochie ịbanye na adreesị IP ma ọ bụ oke akọwapụtara' },
  'ipWhitelist.currentIP': { en: 'Your current IP', pcm: 'Your current IP', yo: 'Àdírẹ́sì IP rẹ lọ́wọ́lọ́wọ́', ha: 'Adireshin IP ɗinka na yanzu', ig: 'IP gị ugbu a' },
  'ipWhitelist.whitelisted': { en: 'Whitelisted', pcm: 'Whitelisted', yo: 'Ó wà ní àkójọ', ha: 'An saka a jerin masu yarda', ig: 'Etinyere na listi' },
  'ipWhitelist.notWhitelisted': { en: 'Not in whitelist', pcm: 'E no dey whitelist', yo: 'Kò sí ní àkójọ', ha: 'Ba a cikin jerin masu yarda ba', ig: 'Ọ nọghị na listi' },
  'ipWhitelist.noEntriesYet': { en: 'No IP addresses whitelisted yet', pcm: 'No IP address dey whitelist yet', yo: 'Kò sí àdírẹ́sì IP tí a ti fi sí àkójọ', ha: 'Babu adireshin IP da aka saka a jerin masu yarda tukuna', ig: 'Enweghị adreesị IP etinyere na listi' },
  'ipWhitelist.addFirstIP': { en: 'Add your first IP address to enable whitelist protection', pcm: 'Add your first IP address to enable whitelist protection', yo: 'Fi àdírẹ́sì IP àkọ́kọ́ rẹ kún láti mú àbò àkójọ ṣiṣẹ́', ha: 'Ƙara adireshin IP na farko don kunna kariyar jerin masu yarda', ig: 'Tinye adreesị IP mbụ gị iji mee ka nchekwa listi rụọ ọrụ' },
  'ipWhitelist.warningTitle': { en: 'Enable IP Whitelist?', pcm: 'Enable IP Whitelist?', yo: 'Mú Àkójọ IP Ṣiṣẹ́?', ha: 'Kunna Jerin IP Masu Yarda?', ig: 'Mee ka Listi IP rụọ ọrụ?' },
  'ipWhitelist.warningMessage': { en: 'Your current IP is not in the whitelist. Enabling this may lock you out. Add your current IP first or continue at your own risk.', pcm: 'Your current IP no dey whitelist. If you enable am, you fit lock yourself out. Add your current IP first or continue at your own risk.', yo: 'Àdírẹ́sì IP rẹ lọ́wọ́lọ́wọ́ kò sí ní àkójọ. Mímu èyí ṣiṣẹ́ lè ti ọ́ sílẹ̀. Fi àdírẹ́sì IP rẹ lọ́wọ́lọ́wọ́ kún ṣáájú tàbí tẹ̀síwájú pẹ̀lú ewu ara rẹ.', ha: 'Adireshin IP ɗinka na yanzu ba ya cikin jerin masu yarda. Kunna wannan na iya kulle ku. Ƙara adireshin IP ɗinka na yanzu da farko ko ci gaba a haɗarin ku.', ig: 'IP gị ugbu a anọghị na listi. Ime ka nke a rụọ ọrụ nwere ike igbochi gị. Tinye IP gị ugbu a mbụ ma ọ bụ gaa n\'ihu na ihe ize ndụ gị.' },
  
  // Component-specific - Time Access Manager
  'timeAccess.title': { en: 'Time-Based Access', pcm: 'Time-Based Access', yo: 'Ìwọlé Tó Dá Lórí Àkókò', ha: 'Shiga Bisa Lokaci', ig: 'Ịbanye Dabere na Oge' },
  'timeAccess.description': { en: 'Restrict logins to specific hours and days', pcm: 'Restrict login to specific hours and days', yo: 'Dènà wíwọlé sí àwọn wákàtí àti ọjọ́ pàtó', ha: 'Iyakance shiga zuwa takamaiman sa\'o\'i da kwanaki', ig: 'Gbochie ịbanye n\'awa na ụbọchị akọwapụtara' },
  'timeAccess.canCurrentlyLogin': { en: 'You can currently log in based on your time restrictions', pcm: 'You fit login now based on your time restrictions', yo: 'O lè wọlé lọ́wọ́lọ́wọ́ dá lórí àwọn ìdènà àkókò rẹ', ha: 'Kuna iya shiga yanzu bisa iyakokin lokacinku', ig: 'I nwere ike ịbanye ugbu a dabere na mmachi oge gị' },
  'timeAccess.outsideAllowedHours': { en: 'Outside allowed login hours - logins would be blocked', pcm: 'Outside allowed login hours - login go block', yo: 'Ní ìta àwọn wákàtí wíwọlé tí a fàyègbà - a óò dènà wíwọlé', ha: 'A wajen sa\'o\'in shiga da aka yarda - za a toshe shiga', ig: 'N\'èzí awa ịbanye enyere - a ga-egbochi ịbanye' },
  'timeAccess.allowedDays': { en: 'Allowed Days', pcm: 'Allowed Days', yo: 'Àwọn Ọjọ́ Tí A Fàyègbà', ha: 'Kwanakin da Aka Yarda', ig: 'Ụbọchị Enyere' },
  'timeAccess.selectAtLeastOneDay': { en: 'Select at least one day', pcm: 'Choose at least one day', yo: 'Yan o kéré jù lọ ọjọ́ kan', ha: 'Zaɓi aƙalla rana ɗaya', ig: 'Họrọ opekata mpe otu ụbọchị' },
  'timeAccess.whenEnabled': { en: 'When enabled, you can only log in during the specified hours and days.', pcm: 'When you enable am, you fit only login during the hours and days wey you set.', yo: 'Nígbà tí a bá mú ṣiṣẹ́, o lè wọlé nígbà àwọn wákàtí àti ọjọ́ pàtó nìkan.', ha: 'Lokacin da aka kunna, za ku iya shiga ne kawai a lokutan sa\'o\'i da kwanakin da aka ƙayyade.', ig: 'Mgbe emere ka ọ rụọ ọrụ, ị nwere ike ịbanye naanị n\'awa na ụbọchị akọwapụtara.' },
  'timeAccess.existingSessionsNote': { en: "Existing sessions won't be affected until they expire.", pcm: 'Sessions wey dey already no go change until dem expire.', yo: 'Àwọn àkókò tó wà kò ní kan títí tí wọ́n á fi parí.', ha: "Sessions ɗin da ke akwai ba za su shafa ba har sai sun ƙare.", ig: 'Ọgbakọ dị adịghị emerụta ruo mgbe ha gwụchara.' },
  
  // Component-specific - TaxBot/Tax Assistant
  'taxbot.title': { en: 'TaxBot', pcm: 'TaxBot', yo: 'TaxBot', ha: 'TaxBot', ig: 'TaxBot' },
  'taxbot.subtitle': { en: 'Nigerian Tax Assistant', pcm: 'Nigerian Tax Assistant', yo: 'Olùrànlọ́wọ́ Owó-orí Nàìjíríà', ha: 'Mai Taimakon Harajin Najeriya', ig: 'Onye Enyemaka Ụtụ Naịjirịa' },
  'taxbot.greeting': { en: "Hi! I'm TaxBot. Ask me anything about Nigerian taxes!", pcm: "Hi! I be TaxBot. Ask me anything about Nigeria taxes!", yo: "Ẹ kú! Èmi ni TaxBot. Béèrè lọ́wọ́ mi nípa owó-orí Nàìjíríà!", ha: "Sannu! Ni ne TaxBot. Tambaye ni komai game da harajin Najeriya!", ig: "Nnọọ! Abụ m TaxBot. Jụọ m ihe ọ bụla gbasara ụtụ Naịjirịa!" },
  'taxbot.personalizedFor': { en: 'Personalized for {businessName}', pcm: 'Personalized for {businessName}', yo: 'Ti ṣe àpèjúwe fún {businessName}', ha: 'An keɓance don {businessName}', ig: 'Emebere maka {businessName}' },
  'taxbot.tryAsking': { en: 'Try asking:', pcm: 'Try asking:', yo: 'Gbìyànjú láti béèrè:', ha: 'Gwada tambaya:', ig: 'Nwaa ịjụ:' },
  'taxbot.context': { en: 'Context', pcm: 'Context', yo: 'Àyíká', ha: 'Mahallin', ig: 'Ọnọdụ' },
  'taxbot.personalize': { en: 'Personalize', pcm: 'Personalize', yo: 'Ṣe Àpèjúwe', ha: 'Keɓance', ig: 'Mee Onwe' },
  'taxbot.vatRateQuestion': { en: "What's the VAT rate in Nigeria?", pcm: 'How much be VAT rate for Nigeria?', yo: 'Kí ni ìdíyelé VAT ní Nàìjíríà?', ha: 'Menene ƙimar VAT a Najeriya?', ig: 'Kedu ọnụego VAT na Naịjirịa?' },
  'taxbot.citDueQuestion': { en: 'When is CIT due for companies?', pcm: 'When company suppose pay CIT?', yo: 'Nígbà wo ni CIT tí ilé-iṣẹ́ gbọ́dọ̀ sanwó?', ha: 'Yaushe ne lokacin biyan CIT na kamfanoni?', ig: 'Kedu mgbe a ga-akwụ CIT maka ụlọ ọrụ?' },
  'taxbot.payeQuestion': { en: 'How do I calculate PAYE?', pcm: 'How I go calculate PAYE?', yo: 'Báwo ni mo ṣe lè ṣe ìṣirò PAYE?', ha: 'Ta yaya zan ƙididdige PAYE?', ig: 'Kedu ka m ga-esi gbakọọ PAYE?' },
  'taxbot.vatExemptQuestion': { en: 'What items are VAT exempt?', pcm: 'Which items no get VAT?', yo: 'Àwọn ohun wo ni kò ní VAT?', ha: 'Waɗanne kayayyaki ne aka keɓe daga VAT?', ig: 'Kedu ihe ndị a napụrụ VAT?' },

  // Results Page
  'results.noResults': { en: 'No Results', pcm: 'No Result', yo: 'Kò sí Èsì', ha: 'Babu Sakamako', ig: 'Enweghị Nsoputọ' },
  'results.useCalculatorFirst': { en: 'Please use the calculator first', pcm: 'Use the calculator first', yo: 'Jọ̀wọ́ lo ẹ̀rọ ìṣirò kọ́kọ́', ha: 'Da fatan za a yi amfani da na\'urar ƙididdiga da farko', ig: 'Biko jiri ngwa mgbako mbụ' },
  'results.goToCalculator': { en: 'Go to Calculator', pcm: 'Go Calculator', yo: 'Lọ sí Ẹ̀rọ Ìṣirò', ha: 'Je zuwa Na\'urar Ƙididdiga', ig: 'Gaa Ngwa Mgbako' },
  'results.backToCalculator': { en: 'Back to Calculator', pcm: 'Go Back Calculator', yo: 'Padà sí Ẹ̀rọ Ìṣirò', ha: 'Koma zuwa Na\'urar Ƙididdiga', ig: 'Laghachi na Ngwa Mgbako' },
  'results.title': { en: 'Tax Calculation Results', pcm: 'Tax Calculation Results', yo: 'Àwọn Èsì Ìṣirò Owó-orí', ha: 'Sakamakon Ƙididdigan Haraji', ig: 'Nsoputọ Mgbako Ụtụ' },
  'results.viewBreakdown': { en: 'View Breakdown', pcm: 'See Breakdown', yo: 'Wo Ìpínpín', ha: 'Duba Rarraba', ig: 'Lee Nkewa' },
  'results.showComparison': { en: 'Show Comparison', pcm: 'Show Compare', yo: 'Fi Ìfiwéra Hàn', ha: 'Nuna Kwatanci', ig: 'Gosi Ntụnyere' },
  'results.hideComparison': { en: 'Hide Comparison', pcm: 'Hide Compare', yo: 'Pa Ìfiwéra Mọ́', ha: 'Ɓoye Kwatanci', ig: 'Zoo Ntụnyere' },
  'results.entityComparison': { en: 'Entity Comparison Dashboard', pcm: 'Entity Compare Dashboard', yo: 'Pánẹ́ẹ̀lì Ìfiwéra Ilé-iṣẹ́', ha: 'Taswirar Kwatancin Kamfani', ig: 'Dashboard Ntụnyere Ụlọ Ọrụ' },
  'results.current': { en: 'Current', pcm: 'Current', yo: 'Lọ́wọ́lọ́wọ́', ha: 'Na yanzu', ig: 'Ugbu a' },
  'results.optimalStructure': { en: 'You selected the optimal structure!', pcm: 'You choose the best structure!', yo: 'O ti yan ètò tó dára jù!', ha: 'Kun zaɓi mafi kyawun tsari!', ig: 'Ị họọrọ ọdịdị kacha mma!' },
  'results.switchingCouldSave': { en: 'Switching to {type} could save you {amount}/year', pcm: 'If you change to {type}, you go save {amount}/year', yo: 'Yípadà sí {type} lè fi {amount}/ọdún pamọ́ fún ọ', ha: 'Canjawa zuwa {type} zai iya tanatar muku {amount}/shekara', ig: 'Ịgbanwe na {type} nwere ike ịchekwa {amount}/afọ' },
  'results.taxPayable': { en: 'Tax Payable', pcm: 'Tax Wey You Go Pay', yo: 'Owó-orí tí Yóò Sanwó', ha: 'Haraji da za a biya', ig: 'Ụtụ A Ga-akwụ' },
  'results.rules2026': { en: '2026 Rules', pcm: '2026 Rules', yo: 'Àwọn Òfin 2026', ha: 'Dokokin 2026', ig: 'Iwu 2026' },
  'results.pre2026Rules': { en: 'Pre-2026 Rules', pcm: 'Before 2026 Rules', yo: 'Àwọn Òfin Ṣáájú 2026', ha: 'Dokokin Kafin 2026', ig: 'Iwu Tupu 2026' },
  'results.businessName': { en: 'Business Name', pcm: 'Business Name', yo: 'Orúkọ Iṣẹ́', ha: 'Sunan Kasuwanci', ig: 'Aha Azụmahịa' },
  'results.limitedCompany': { en: 'Limited Company', pcm: 'Limited Company', yo: 'Ilé-iṣẹ́ Tó Ní Ìwọ̀n', ha: 'Kamfanin da ke da Iyaka', ig: 'Ụlọ Ọrụ Nwere Oke' },
  'results.cit': { en: 'CIT', pcm: 'CIT', yo: 'CIT', ha: 'CIT', ig: 'CIT' },
  'results.devLevy': { en: 'Dev Levy', pcm: 'Dev Levy', yo: 'Owó Ìdàgbàsókè', ha: 'Harajin Ci Gaba', ig: 'Ụtụ Mmepe' },
  'results.incomeTax': { en: 'Income Tax', pcm: 'Income Tax', yo: 'Owó-orí Owó-wíwọlé', ha: 'Harajin Kuɗin Shiga', ig: 'Ụtụ Ego Nnata' },
  'results.pitDescription': { en: 'Personal Income Tax via State IRS. Simpler compliance, unlimited liability.', pcm: 'Personal Tax through State IRS. E dey simple, but you go carry all the wahala.', yo: 'Owó-orí Ènìyàn nípasẹ̀ IRS Ìpínlẹ̀. Ìbọ́wọ̀ rọrùn, gbèsè àìlópin.', ha: 'Harajin Mutum ta State IRS. Biyayya mai sauƙi, alhaki maras iyaka.', ig: 'Ụtụ Ego Onwe site na Steeti IRS. Nkwekọrịta dị mfe, ọrụ enweghị oke.' },
  'results.citDescription': { en: 'CIT via FIRS. Limited liability, better for scaling.', pcm: 'CIT through FIRS. Limited liability, e better for growth.', yo: 'CIT nípasẹ̀ FIRS. Gbèsè tó ní ìwọ̀n, ó dára fún ìdàgbà.', ha: 'CIT ta FIRS. Iyakantaccen alhaki, mafi kyau don girma.', ig: 'CIT site na FIRS. Ọrụ nwere oke, ka mma maka ịba ụba.' },
  'results.smallCompanyCIT': { en: '0% CIT (Small Company). Limited liability protection.', pcm: '0% CIT (Small Company). Limited liability protection.', yo: '0% CIT (Ilé-iṣẹ́ Kékeré). Ààbò gbèsè tó ní ìwọ̀n.', ha: '0% CIT (Ƙaramin Kamfani). Kariya alhaki da iyaka.', ig: '0% CIT (Obere Ụlọ Ọrụ). Nchekwa ọrụ nwere oke.' },

  // Individual Calculator Page
  'individual.pageTitle': { en: 'Individual Tax Calculator', pcm: 'Personal Tax Calculator', yo: 'Ẹ̀rọ Ìṣirò Owó-orí Ènìyàn', ha: 'Na\'urar Ƙididdigan Harajin Mutum', ig: 'Ngwa Mgbako Ụtụ Onwe' },
  'individual.title': { en: 'Personal Tax Calculator', pcm: 'Personal Tax Calculator', yo: 'Ẹ̀rọ Ìṣirò Owó-orí Ara Ẹni', ha: 'Na\'urar Ƙididdigan Harajin Kai', ig: 'Ngwa Mgbako Ụtụ Nkeonwe' },
  'individual.subtitle': { en: 'Calculate your personal taxes without a registered business', pcm: 'Calculate your personal tax without registered business', yo: 'Ṣe ìṣirò owó-orí ara rẹ láìní iṣẹ́ tí a forúkọsílẹ̀', ha: 'Ƙididdige harajin ku na sirri ba tare da kasuwanci da aka yi rajista ba', ig: 'Gbakọọ ụtụ onwe gị na-enweghị azụmahịa edebanyere aha' },
  'individual.nigeriaRules': { en: '2026 Tax Rules (NTA 2025)', pcm: '2026 Tax Rules (NTA 2025)', yo: 'Àwọn Òfin Owó-orí 2026 (NTA 2025)', ha: 'Dokokin Haraji 2026 (NTA 2025)', ig: 'Iwu Ụtụ 2026 (NTA 2025)' },
  'individual.currentRules': { en: 'Current (Pre-2026) Rules', pcm: 'Current (Before 2026) Rules', yo: 'Àwọn Òfin Lọ́wọ́lọ́wọ́ (Ṣáájú 2026)', ha: 'Dokokin Yanzu (Kafin 2026)', ig: 'Iwu Ugbu a (Tupu 2026)' },
  'individual.tabEmployment': { en: 'Employment', pcm: 'Employment', yo: 'Iṣẹ́', ha: 'Aiki', ig: 'Ọrụ' },
  'individual.tabForeign': { en: 'Foreign', pcm: 'Foreign', yo: 'Ilẹ̀ Òkèèrè', ha: 'Ƙasashen Waje', ig: 'Mba Ọzọ' },
  'individual.tabCrypto': { en: 'Crypto', pcm: 'Crypto', yo: 'Crypto', ha: 'Crypto', ig: 'Crypto' },
  'individual.tabInvestment': { en: 'Investment', pcm: 'Investment', yo: 'Ìdókòwò', ha: 'Saka Jari', ig: 'Itinye Ego' },
  'individual.tabInformal': { en: 'Informal', pcm: 'Informal', yo: 'Aláìfọ̀ọ́mù', ha: 'Maras Tsari', ig: 'Enweghị Usoro' },
  'individual.employmentTitle': { en: 'Employment Income Tax', pcm: 'Employment Income Tax', yo: 'Owó-orí Owó-wíwọlé Iṣẹ́', ha: 'Harajin Kuɗin Shiga na Aiki', ig: 'Ụtụ Ego Nnata Ọrụ' },
  'individual.employmentDesc': { en: 'Calculate PAYE for salaried employees', pcm: 'Calculate PAYE for salary workers', yo: 'Ṣe ìṣirò PAYE fún àwọn òṣìṣẹ́ oníṣẹ́-oṣù', ha: 'Ƙididdige PAYE don ma\'aikata masu karɓar albashi', ig: 'Gbakọọ PAYE maka ndị ọrụ na-anata ụgwọ ọnwa' },
  'individual.annualGrossIncome': { en: 'Annual Gross Income', pcm: 'Yearly Gross Income', yo: 'Owó-wíwọlé Gbòógì Ọdún', ha: 'Jimlar Kuɗin Shiga na Shekara', ig: 'Ego Nnata Afọ Niile' },
  'individual.pensionContribution': { en: 'Pension Contribution', pcm: 'Pension Contribution', yo: 'Ìfikún Àgbà-owó', ha: 'Gudunmawar Fansho', ig: 'Ntinye Penshọn' },
  'individual.nhfContribution': { en: 'NHF Contribution', pcm: 'NHF Contribution', yo: 'Ìfikún NHF', ha: 'Gudunmawar NHF', ig: 'Ntinye NHF' },
  'individual.lifeInsurance': { en: 'Life Insurance Premium', pcm: 'Life Insurance Premium', yo: 'Ìsanwó Ìdáàbòbò Ìgbésí-ayé', ha: 'Kuɗin Inshorar Rai', ig: 'Ego Mkpuchi Ndụ' },
  'individual.benefitsActive': { en: '2026 Benefits Active', pcm: '2026 Benefits Active', yo: 'Àwọn Àǹfààní 2026 Ń Ṣiṣẹ́', ha: 'Amfanin 2026 Yana Aiki', ig: 'Uru 2026 Na-arụ Ọrụ' },
  'individual.exemptionNote': { en: 'First ₦800,000 is tax-exempt. Consolidated Relief Allowance applies.', pcm: 'First ₦800,000 no get tax. Consolidated Relief Allowance dey apply.', yo: 'Àkọ́kọ́ ₦800,000 kò ní owó-orí. Ìdínkù Ìtù Pọ̀ ń kan.', ha: 'Farkon ₦800,000 an keɓe daga haraji. Ana amfani da Taimako na Taimakon Haɗin Kai.', ig: 'Mbụ ₦800,000 enweghị ụtụ. Nkwụnye aka Nkwụsịtụ na-emetụta.' },
  'individual.cryptoTitle': { en: 'Cryptocurrency Tax', pcm: 'Crypto Tax', yo: 'Owó-orí Owó Kíríptò', ha: 'Harajin Kuɗin Crypto', ig: 'Ụtụ Ego Crypto' },
  'individual.cryptoDesc': { en: 'Calculate tax on crypto income and capital gains', pcm: 'Calculate tax for crypto income and capital gains', yo: 'Ṣe ìṣirò owó-orí lórí owó-wíwọlé kíríptò àti èrè olú-owó', ha: 'Ƙididdige haraji kan kuɗin shigar crypto da ribar jari', ig: 'Gbakọọ ụtụ maka ego nnata crypto na uru isi ego' },
  'individual.investmentTitle': { en: 'Investment Income Tax', pcm: 'Investment Income Tax', yo: 'Owó-orí Owó-wíwọlé Ìdókòwò', ha: 'Harajin Kuɗin Shigar Saka Jari', ig: 'Ụtụ Ego Nnata Itinye Ego' },
  'individual.investmentDesc': { en: 'Calculate tax on dividends, interest, and capital gains', pcm: 'Calculate tax for dividends, interest, and capital gains', yo: 'Ṣe ìṣirò owó-orí lórí àwọn ìpín, èrè, àti èrè olú-owó', ha: 'Ƙididdige haraji kan rabon riba, riba, da ribar jari', ig: 'Gbakọọ ụtụ maka oke ruru, ọmụrụnwa, na uru isi ego' },
  'individual.informalTitle': { en: 'Informal Business Tax', pcm: 'Informal Business Tax', yo: 'Owó-orí Iṣẹ́ Aláìfọ̀ọ́mù', ha: 'Harajin Kasuwanci Mara Tsari', ig: 'Ụtụ Azụmahịa Enweghị Usoro' },
  'individual.informalDesc': { en: 'Presumptive tax for unregistered traders and micro-enterprises', pcm: 'Presumptive tax for traders wey never register and small small business', yo: 'Owó-orí àròjú fún àwọn oníṣòwò tí a kò forúkọsílẹ̀ àti àwọn iṣẹ́ kékeré', ha: 'Harajin zato don yan kasuwa marasa rijista da ƙananan kasuwanci', ig: 'Ụtụ nkwenye maka ndị ahịa anaghị edebe aha na obere azụmahịa' },
  
  // Individual Calculator - Additional keys
  'individual.employmentIncomeTax': { en: 'Employment Income Tax', pcm: 'Employment Income Tax', yo: 'Owó-orí Owó-wíwọlé Iṣẹ́', ha: 'Harajin Kuɗin Shiga na Aiki', ig: 'Ụtụ Ego Nnata Ọrụ' },
  'individual.calculatePAYE': { en: 'Calculate PAYE for salaried employees', pcm: 'Calculate PAYE for salary workers', yo: 'Ṣe ìṣirò PAYE fún àwọn òṣìṣẹ́ oníṣẹ́-oṣù', ha: 'Ƙididdige PAYE don ma\'aikata masu karɓar albashi', ig: 'Gbakọọ PAYE maka ndị ọrụ na-anata ụgwọ ọnwa' },
  'individual.annualGrossIncomeTooltip': { en: 'Total annual salary including allowances', pcm: 'Total yearly salary including allowances', yo: 'Àpapọ̀ owó-oṣù ọdún pẹ̀lú àwọn àfikún', ha: 'Jimlar albashi na shekara gami da ƙarawa', ig: 'Mkpokọta ụgwọ ọrụ afọ gụnyere ntinye' },
  'individual.pensionTooltip': { en: '8% employee contribution to RSA', pcm: '8% wey worker contribute to RSA', yo: '8% tí òṣìṣẹ́ ń fi kún RSA', ha: '8% da ma\'aikaci ke bayarwa zuwa RSA', ig: '8% onye ọrụ na-etinye na RSA' },
  'individual.nhfTooltip': { en: '2.5% National Housing Fund', pcm: '2.5% National Housing Fund', yo: '2.5% Owó Ilé Orílẹ̀-èdè', ha: '2.5% Asusun Gidaje na Ƙasa', ig: '2.5% Ego Ụlọ Mba' },
  'individual.lifeInsuranceTooltip': { en: 'Premium on policy for own life', pcm: 'Money wey you pay for your own life insurance', yo: 'Owó tí a ń san fún ìdáàbòbò ìgbésí-ayé ara ẹni', ha: 'Kuɗin da ake biya don inshorar rayuwar kai', ig: 'Ego a na-akwụ maka mkpuchi ndụ onwe' },
  'individual.2026BenefitsActive': { en: '2026 Benefits Active', pcm: '2026 Benefits Active', yo: 'Àwọn Àǹfààní 2026 Ń Ṣiṣẹ́', ha: 'Amfanin 2026 Yana Aiki', ig: 'Uru 2026 Na-arụ Ọrụ' },
  'individual.2026BenefitsInfo': { en: 'First ₦800,000 is tax-exempt. Consolidated Relief Allowance applies.', pcm: 'First ₦800,000 no get tax. Consolidated Relief Allowance dey apply.', yo: 'Àkọ́kọ́ ₦800,000 kò ní owó-orí. Ìdínkù Ìtù Pọ̀ ń kan.', ha: 'Farkon ₦800,000 an keɓe daga haraji. Ana amfani da Taimako na Taimakon Haɗin Kai.', ig: 'Mbụ ₦800,000 enweghị ụtụ. Nkwụnye aka Nkwụsịtụ na-emetụta.' },
  'individual.cryptoTax': { en: 'Cryptocurrency Tax', pcm: 'Crypto Tax', yo: 'Owó-orí Owó Kíríptò', ha: 'Harajin Kuɗin Crypto', ig: 'Ụtụ Ego Crypto' },
  'individual.cryptoTaxDescription': { en: 'Calculate tax on crypto income and capital gains', pcm: 'Calculate tax for crypto income and capital gains', yo: 'Ṣe ìṣirò owó-orí lórí owó-wíwọlé kíríptò àti èrè olú-owó', ha: 'Ƙididdige haraji kan kuɗin shigar crypto da ribar jari', ig: 'Gbakọọ ụtụ maka ego nnata crypto na uru isi ego' },
  'individual.cryptoIncome': { en: 'Crypto Income (Mining, Staking)', pcm: 'Crypto Income (Mining, Staking)', yo: 'Owó-wíwọlé Crypto (Mímì, Sísùn)', ha: 'Kuɗin Crypto (Mining, Staking)', ig: 'Ego Nnata Crypto (Mining, Staking)' },
  'individual.cryptoIncomeTooltip': { en: 'Income from mining, staking, airdrops', pcm: 'Money from mining, staking, airdrops', yo: 'Owó láti mímì, sísùn, àwọn airdrop', ha: 'Kuɗi daga hakar ma\'adinai, staking, airdrops', ig: 'Ego site na mining, staking, airdrops' },
  'individual.capitalGainsTrading': { en: 'Capital Gains from Trading', pcm: 'Capital Gains from Trading', yo: 'Èrè Olú-owó láti Òwò', ha: 'Ribar Jari daga Kasuwanci', ig: 'Uru Isi Ego site na Ahịa' },
  'individual.capitalGainsTradingTooltip': { en: 'Profits from buying/selling crypto', pcm: 'Profit from buying and selling crypto', yo: 'Èrè láti ríra/títà crypto', ha: 'Riba daga saye/sayar da crypto', ig: 'Uru site na ịzụ/ire crypto' },
  'individual.capitalLosses': { en: 'Capital Losses', pcm: 'Capital Losses', yo: 'Àdánù Olú-owó', ha: 'Asarar Jari', ig: 'Ofu Isi Ego' },
  'individual.capitalLossesTooltip': { en: 'Losses can offset gains', pcm: 'Losses fit reduce your gains', yo: 'Àdánù lè dín èrè kù', ha: 'Asara na iya rage riba', ig: 'Ofu nwere ike belata uru' },
  'individual.2026CryptoRules': { en: '2026 Crypto Rules', pcm: '2026 Crypto Rules', yo: 'Àwọn Òfin Crypto 2026', ha: 'Dokokin Crypto 2026', ig: 'Iwu Crypto 2026' },
  'individual.cryptoRule1': { en: 'Gains under ₦10M: Exempt from CGT', pcm: 'Gains under ₦10M: No CGT', yo: 'Èrè tí ó kéré ju ₦10M: Kò sí CGT', ha: 'Riba ƙasa da ₦10M: Babu CGT', ig: 'Uru n\'okpuru ₦10M: Enweghị CGT' },
  'individual.cryptoRule2': { en: '₦10M - ₦50M: 10% CGT', pcm: '₦10M - ₦50M: 10% CGT', yo: '₦10M - ₦50M: 10% CGT', ha: '₦10M - ₦50M: 10% CGT', ig: '₦10M - ₦50M: 10% CGT' },
  'individual.cryptoRule3': { en: '₦50M - ₦150M: 15% CGT', pcm: '₦50M - ₦150M: 15% CGT', yo: '₦50M - ₦150M: 15% CGT', ha: '₦50M - ₦150M: 15% CGT', ig: '₦50M - ₦150M: 15% CGT' },
  'individual.cryptoRule4': { en: 'Above ₦150M: 25% CGT', pcm: 'Above ₦150M: 25% CGT', yo: 'Ju ₦150M lọ: 25% CGT', ha: 'Sama da ₦150M: 25% CGT', ig: 'Karịrị ₦150M: 25% CGT' },
  'individual.cryptoRule5': { en: 'Losses carry forward for 4 years', pcm: 'Losses fit carry forward for 4 years', yo: 'Àdánù lè gbé lọ fún ọdún 4', ha: 'Asara za a iya ɗaukawa zuwa shekaru 4', ig: 'Ofu nwere ike ịga n\'ihu afọ 4' },
  'individual.investmentTax': { en: 'Investment Income Tax', pcm: 'Investment Income Tax', yo: 'Owó-orí Owó-wíwọlé Ìdókòwò', ha: 'Harajin Kuɗin Shigar Saka Jari', ig: 'Ụtụ Ego Nnata Itinye Ego' },
  'individual.investmentTaxDescription': { en: 'Calculate tax on dividends, interest, and capital gains', pcm: 'Calculate tax for dividends, interest, and capital gains', yo: 'Ṣe ìṣirò owó-orí lórí àwọn ìpín, èrè, àti èrè olú-owó', ha: 'Ƙididdige haraji kan rabon riba, riba, da ribar jari', ig: 'Gbakọọ ụtụ maka oke ruru, ọmụrụnwa, na uru isi ego' },
  'individual.dividendIncome': { en: 'Dividend Income', pcm: 'Dividend Income', yo: 'Owó-wíwọlé Ìpín', ha: 'Kuɗin Rabon Riba', ig: 'Ego Nnata Oke' },
  'individual.dividendIncomeTooltip': { en: 'Dividends from Nigerian companies (often exempt)', pcm: 'Dividends from Nigerian companies (often no tax)', yo: 'Àwọn ìpín láti àwọn ilé-iṣẹ́ Nàìjíríà (sábà kò ní owó-orí)', ha: 'Rabon riba daga kamfanonin Najeriya (sau da yawa an keɓe)', ig: 'Oke site na ụlọ ọrụ Naịjirịa (ọtụtụ oge enweghị ụtụ)' },
  'individual.interestIncome': { en: 'Interest Income', pcm: 'Interest Income', yo: 'Owó-wíwọlé Èrè', ha: 'Kuɗin Riba', ig: 'Ego Nnata Ọmụrụnwa' },
  'individual.interestIncomeTooltip': { en: 'Bank interest, bonds, fixed deposits', pcm: 'Bank interest, bonds, fixed deposits', yo: 'Èrè bánkì, àwọn ìwé-ẹ̀rí, àwọn ìfipamọ́ pàtó', ha: 'Ribar banki, shaidu, ajiyar tsayayye', ig: 'Ọmụrụnwa ụlọ akụ, bonds, ntinye ego kwụsịrị' },
  'individual.capitalGains': { en: 'Capital Gains', pcm: 'Capital Gains', yo: 'Èrè Olú-owó', ha: 'Ribar Jari', ig: 'Uru Isi Ego' },
  'individual.capitalGainsTooltip': { en: 'Gains from selling assets, shares, property', pcm: 'Gains from selling assets, shares, property', yo: 'Èrè láti títà ohun-ìní, àwọn ìpín, ohun-ìní', ha: 'Riba daga sayar da kadarori, hannun jari, kadarori', ig: 'Uru site n\'ire akụ, shares, akụ' },
  'individual.taxEfficientInvestments': { en: 'Tax-Efficient Investments', pcm: 'Tax-Efficient Investments', yo: 'Àwọn Ìdókòwò Tí Owó-orí Rọrùn', ha: 'Saka Jari Mai Ingancin Haraji', ig: 'Itinye Ego Nwere Ụtụ Dị Mma' },
  'individual.investmentRule1': { en: 'Franked dividends from Nigerian companies: Exempt', pcm: 'Franked dividends from Nigerian companies: No tax', yo: 'Àwọn ìpín franked láti àwọn ilé-iṣẹ́ Nàìjíríà: Kò sí owó-orí', ha: 'Rabon riba na franked daga kamfanonin Najeriya: An keɓe', ig: 'Oke franked site na ụlọ ọrụ Naịjirịa: Enweghị ụtụ' },
  'individual.investmentRule2': { en: 'FGN Bonds interest: Exempt', pcm: 'FGN Bonds interest: No tax', yo: 'Èrè àwọn ìwé-ẹ̀rí FGN: Kò sí owó-orí', ha: 'Ribar shaidu FGN: An keɓe', ig: 'Ọmụrụnwa FGN Bonds: Enweghị ụtụ' },
  'individual.investmentRule3': { en: 'Treasury Bills: 10% WHT (final)', pcm: 'Treasury Bills: 10% WHT (final)', yo: 'Àwọn Treasury Bills: 10% WHT (ìparí)', ha: 'Treasury Bills: 10% WHT (ƙarshe)', ig: 'Treasury Bills: 10% WHT (ikpeazụ)' },
  'individual.informalTax': { en: 'Informal Business Tax', pcm: 'Informal Business Tax', yo: 'Owó-orí Iṣẹ́ Aláìfọ̀ọ́mù', ha: 'Harajin Kasuwanci Mara Tsari', ig: 'Ụtụ Azụmahịa Enweghị Usoro' },
  'individual.informalTaxDescription': { en: 'Presumptive tax for unregistered traders and micro-enterprises', pcm: 'Presumptive tax for traders wey never register and small small business', yo: 'Owó-orí àròjú fún àwọn oníṣòwò tí a kò forúkọsílẹ̀ àti àwọn iṣẹ́ kékeré', ha: 'Harajin zato don yan kasuwa marasa rijista da ƙananan kasuwanci', ig: 'Ụtụ nkwenye maka ndị ahịa anaghị edebe aha na obere azụmahịa' },

  // Scenario Modeling - Additional keys
  'scenario.tabWhatIf': { en: 'What-If', pcm: 'What-If', yo: 'Kí Ló Bá', ha: 'Menene Idan', ig: 'Gịnị ma ọ bụrụ' },
  'scenario.tabMultiYear': { en: 'Multi-Year', pcm: 'Multi-Year', yo: 'Ọ̀pọ̀ Ọdún', ha: 'Shekaru Masu Yawa', ig: 'Ọtụtụ Afọ' },
  'scenario.tabPenalties': { en: 'Penalties', pcm: 'Penalties', yo: 'Àwọn Ìjìyà', ha: 'Hukunci', ig: 'Ntaramahụhụ' },
  'scenario.tabForeign': { en: 'Foreign', pcm: 'Foreign', yo: 'Àjèjì', ha: 'Na Waje', ig: 'Mba Ọzọ' },
  'scenario.insightVAT': { en: 'With {percent}% growth, consider registering for VAT if not already.', pcm: 'With {percent}% growth, consider registering for VAT if you never register.', yo: 'Pẹ̀lú ìdàgbà {percent}%, rò nípa forúkọsílẹ̀ fún VAT tí o kò bá tíì ṣe.', ha: 'Tare da haɓakar {percent}%, ku yi la\'akari da yin rajista don VAT idan ba ku yi ba.', ig: 'Site na uto {percent}%, tụlee ịdebanye aha maka VAT ma ọ bụrụ na ịdebanyelarịla.' },
  'scenario.insightRent': { en: 'Additional rent of {amount} increases your relief (up to ₦500k max).', pcm: 'Additional rent of {amount} go increase your relief (up to ₦500k max).', yo: 'Owó iyálé àfikún {amount} ń mú ìtùnú rẹ pọ̀ sí (títí dé ₦500k ọ̀pọ̀lọpọ̀).', ha: 'Ƙarin kuɗin haya na {amount} yana ƙara sauƙin ku (har zuwa ₦500k).', ig: 'Ụgwọ ụlọ ọzọ nke {amount} na-abawanye nkwụsịtụ gị (ruo ₦500k kacha).' },
  'scenario.insightCrypto': { en: 'Crypto gains of {gains} attract 10% CGT = {tax}', pcm: 'Crypto gains of {gains} go attract 10% CGT = {tax}', yo: 'Èrè crypto ti {gains} ń fa 10% CGT = {tax}', ha: 'Ribar crypto na {gains} yana jan hankali 10% CGT = {tax}', ig: 'Uru crypto nke {gains} na-adọta 10% CGT = {tax}' },
  'scenario.insightForeign': { en: 'Foreign income is taxable. Consider forex timing for conversion.', pcm: 'Foreign income get tax. Consider forex timing for conversion.', yo: 'Owó àjèjì ní owó-orí. Rò nípa àkókò forex fún ìyípadà.', ha: 'Kuɗin waje yana da haraji. Yi la\'akari da lokacin forex don canzawa.', ig: 'Ego mba ọzọ nwere ụtụ. Tụlee oge forex maka mgbanwe.' },
  'scenario.adjustSliders': { en: 'Adjust the sliders and inputs to see how changes affect your tax.', pcm: 'Adjust the sliders and inputs to see how changes affect your tax.', yo: 'Ṣàtúnṣe àwọn slider àti àwọn ìnípùtù láti rí bí àwọn ìyípadà ṣe ń kan owó-orí rẹ.', ha: 'Daidaita masu zamewa da shigarwa don ganin yadda canje-canje ke shafar haraji.', ig: 'Mezigharịa sliders na ntinye iji hụ ka mgbanwe si emetụta ụtụ gị.' },

  // Results Page - Additional keys
  'results.pleaseEnterBusinessName': { en: 'Please enter a business name', pcm: 'Abeg enter business name', yo: 'Jọ̀wọ́ tẹ orúkọ iṣẹ́ sílẹ̀', ha: 'Da fatan za a shigar da sunan kasuwanci', ig: 'Biko tinye aha azụmahịa' },
  'results.upgradeToSave': { en: 'Upgrade to Basic or higher to save businesses', pcm: 'Upgrade to Basic or higher to save business', yo: 'Gbéga sí Basic tàbí tí ó ga jù láti fi iṣẹ́ pamọ́', ha: 'Haɓaka zuwa Basic ko sama don ajiye kasuwanci', ig: 'Kwalite na Basic ma ọ bụ karịa iji chekwaa azụmahịa' },
  'results.businessLimitReached': { en: "You've reached your business limit", pcm: 'You don reach your business limit', yo: 'O ti dé ìwọ̀n iṣẹ́ rẹ', ha: 'Kun kai iyakar kasuwanci', ig: 'Ị rụzuola oke azụmahịa gị' },
  'results.businessSaved': { en: '"{name}" saved successfully!', pcm: '"{name}" don save successfully!', yo: 'A ti fi "{name}" pamọ́ dáadáa!', ha: 'An ajiye "{name}" nasara!', ig: 'Echekwara "{name}" nke ọma!' },
  'results.failedToSave': { en: 'Failed to save business', pcm: 'E no gree save business', yo: 'Fífi iṣẹ́ pamọ́ kùnà', ha: 'Ajiye kasuwanci ya kasa', ig: 'Ọ dara ichekwa azụmahịa' },
  'results.upgradeToExport': { en: 'Upgrade to Basic or higher to export', pcm: 'Upgrade to Basic or higher to export', yo: 'Gbéga sí Basic tàbí tí ó ga jù láti gbé jáde', ha: 'Haɓaka zuwa Basic ko sama don fitarwa', ig: 'Kwalite na Basic ma ọ bụ karịa iji bupụ' },

  // Expense Categories - Additional keys
  'category.income': { en: 'Income', pcm: 'Income', yo: 'Owó-wíwọlé', ha: 'Kuɗin Shiga', ig: 'Ego Nnata' },
  'category.rentOffice': { en: 'Rent & Office', pcm: 'Rent & Office', yo: 'Owo Ilé àti Ọ́fíìsì', ha: 'Haya da Ofis', ig: 'Ụgwọ Ụlọ na Ọfịs' },
  'category.transportTravel': { en: 'Transport & Travel', pcm: 'Transport & Travel', yo: 'Gbígbé àti Ìrìnàjò', ha: 'Sufuri da Tafiya', ig: 'Njem na Njem' },
  'category.marketingAds': { en: 'Marketing & Ads', pcm: 'Marketing & Ads', yo: 'Títajà àti Ìpolówó', ha: 'Talla da Tallan', ig: 'Ahịa na Mgbasa Ozi' },
  'category.salariesWages': { en: 'Salaries & Wages', pcm: 'Salaries & Wages', yo: 'Owó-oṣù àti Àwọn Owó Iṣẹ́', ha: 'Albashi da Alawus', ig: 'Ụgwọ Ọrụ na Ụgwọ' },
  'category.suppliesEquipment': { en: 'Supplies & Equipment', pcm: 'Supplies & Equipment', yo: 'Àwọn Ohun Èlò àti Ẹ̀rọ', ha: 'Kayayyaki da Kayan Aiki', ig: 'Ihe Ndị A na Ngwa' },
  'category.otherExpenses': { en: 'Other Expenses', pcm: 'Other Expenses', yo: 'Àwọn Inawo Mìíràn', ha: 'Sauran Kashewa', ig: 'Mmefu Ndị Ọzọ' },

  // Toast Messages - Additional keys
  'toast.pleaseSignIn': { en: 'Please sign in to add expenses', pcm: 'Abeg sign in to add expenses', yo: 'Jọ̀wọ́ wọlé láti fi inawo kún', ha: 'Da fatan za a shiga don ƙara kashewa', ig: 'Biko banye iji tinye mmefu' },
  'toast.pleaseFillAllFields': { en: 'Please fill all fields', pcm: 'Abeg fill all the fields', yo: 'Jọ̀wọ́ kún gbogbo ààyè', ha: 'Da fatan za a cika duk filaye', ig: 'Biko dejupụta mpaghara niile' },
  'toast.failedToAddExpense': { en: 'Failed to add expense', pcm: 'E no gree add expense', yo: 'Fífi inawo kún kùnà', ha: 'Ƙara kashewa ya kasa', ig: 'Ọ dara itinye mmefu' },

  // Tax Breakdown Page
  'breakdown.noResults': { en: 'No Results', pcm: 'No Results', yo: 'Kò sí Èsì', ha: 'Babu Sakamako', ig: 'Enweghị Nsoputọ' },
  'breakdown.backToResults': { en: 'Back to Results', pcm: 'Go Back to Results', yo: 'Padà sí Àwọn Èsì', ha: 'Koma zuwa Sakamako', ig: 'Laghachi na Nsoputọ' },
  'breakdown.title': { en: 'Step-by-Step Breakdown', pcm: 'Step by Step Breakdown', yo: 'Ìpínpín Ìgbésẹ̀-sí-Ìgbésẹ̀', ha: 'Rarraba Mataki-zuwa-Mataki', ig: 'Nkewa Nzọụkwụ-ka-Nzọụkwụ' },
  'breakdown.understanding': { en: 'Understanding exactly how your {amount} tax was calculated', pcm: 'Understanding how we calculate your {amount} tax', yo: 'Mọ̀ gangan bí a ṣe ṣe ìṣirò owó-orí {amount} rẹ', ha: 'Fahimtar yadda aka ƙididdige haraji {amount}', ig: 'Ịghọta nke ọma etu esi gbakọọ ụtụ {amount} gị' },
  'breakdown.grossIncome': { en: 'Gross Income', pcm: 'Total Income', yo: 'Owó-wíwọlé Gbòógì', ha: 'Jimlar Kuɗin Shiga', ig: 'Ego Nnata Niile' },
  'breakdown.totalTax': { en: 'Total Tax', pcm: 'Total Tax', yo: 'Àpapọ̀ Owó-orí', ha: 'Jimlar Haraji', ig: 'Mkpokọta Ụtụ' },
  'breakdown.learnMore': { en: 'Learn More', pcm: 'Learn More', yo: 'Mọ̀ Síi', ha: 'Ƙara Koyo', ig: 'Mụtakwuo' },
  'breakdown.understandingRates': { en: 'Understanding Nigerian Tax Rates', pcm: 'Understanding Nigeria Tax Rates', yo: 'Mọ̀ Àwọn Ìdíyelé Owó-orí Nàìjíríà', ha: 'Fahimtar Ƙimar Harajin Najeriya', ig: 'Ịghọta Ọnụego Ụtụ Naịjirịa' },
  'breakdown.reformExplained': { en: '2026 Tax Reform Explained', pcm: '2026 Tax Reform Explained', yo: 'Àtúnṣe Owó-orí 2026 Ti Ṣàlàyé', ha: 'An Bayyana Gyaran Haraji na 2026', ig: 'Akọwapụtara Mgbanwe Ụtụ 2026' },
  'breakdown.vatGuide': { en: 'VAT Registration Guide', pcm: 'VAT Registration Guide', yo: 'Ìtọ́sọ́nà Ìforúkọsílẹ̀ VAT', ha: 'Jagorar Rijista na VAT', ig: 'Nduzi Ndebanye Aha VAT' },
  'breakdown.maximizingReliefs': { en: 'Maximizing Tax Reliefs', pcm: 'Maximizing Tax Reliefs', yo: 'Mú Àwọn Ìdínkù Owó-orí Pọ̀ Sí i', ha: 'Haɓaka Taimakon Haraji', ig: 'Ịmekwu Nkwụsịtụ Ụtụ' },
  'breakdown.disclaimer': { en: 'This breakdown is for educational purposes. Consult a tax professional for official advice.', pcm: 'This breakdown na for learning. Talk to tax professional for real advice.', yo: 'Ìpínpín yìí jẹ́ fún ẹ̀kọ́. Bá ògbóntarìgì owó-orí sọ̀rọ̀ fún ìmọ̀ràn gidi.', ha: 'Wannan rarraba don ilimantarwa ne. Tuntubi ƙwararren haraji don shawarar hukuma.', ig: 'Nkewa a bụ maka mmụta. Gbakwunyere ọkachamara ụtụ maka ndụmọdụ gọọmentị.' },

  // Calculator Page - Expense Categories
  'category.officeSupplies': { en: 'Office Supplies', pcm: 'Office Supplies', yo: 'Àwọn Ohun Ọ́fíìsì', ha: 'Kayan Ofis', ig: 'Ihe Ọfịs' },
  'category.travel': { en: 'Travel', pcm: 'Travel', yo: 'Ìrìnàjò', ha: 'Tafiya', ig: 'Njem' },
  'category.utilities': { en: 'Utilities', pcm: 'Utilities', yo: 'Àwọn Iṣẹ́ Àkànṣe', ha: 'Abubuwan Amfani', ig: 'Ihe Ọrụ' },
  'category.meals': { en: 'Meals & Entertainment', pcm: 'Food & Entertainment', yo: 'Oúnjẹ àti Eré', ha: 'Abinci da Nishaɗi', ig: 'Nri na Egwuregwu' },
  'category.rent': { en: 'Rent', pcm: 'Rent', yo: 'Owo Ilé', ha: 'Haya', ig: 'Ụgwọ Ụlọ' },
  'category.equipment': { en: 'Equipment', pcm: 'Equipment', yo: 'Ohun Èlò', ha: 'Kayan Aiki', ig: 'Ngwa' },
  'category.other': { en: 'Other', pcm: 'Other', yo: 'Mìíràn', ha: 'Sauran', ig: 'Ọzọ' },

  // Disclaimer Modal
  'disclaimer.title': { en: 'Important Disclaimer', pcm: 'Important Disclaimer', yo: 'Ìkìlọ̀ Pàtàkì', ha: 'Muhimmin Sanarwa', ig: 'Ọkwa Dị Mkpa' },
  'disclaimer.readAcknowledge': { en: 'Please read and acknowledge before using TaxForge NG', pcm: 'Please read and agree before you use TaxForge NG', yo: 'Jọ̀wọ́ ka kí o sì gbà ṣáájú kí o tó lo TaxForge NG', ha: 'Da fatan za a karanta ku amince kafin ku yi amfani da TaxForge NG', ig: 'Biko gụọ ma kwenye tupu iji TaxForge NG' },
  'disclaimer.educationalTitle': { en: 'Educational Purposes Only', pcm: 'For Learning Only', yo: 'Fún Ẹ̀kọ́ Nìkan', ha: 'Don Ilimi Kawai', ig: 'Maka Mmụta Naanị' },
  'disclaimer.educationalDesc': { en: 'This app provides tax estimates based on the Nigeria Tax Act 2025 for educational and planning purposes.', pcm: 'This app give you tax estimate based on Nigeria Tax Act 2025 for learning and planning.', yo: 'Àpp yìí pèsè àmúdájú owó-orí tó dá lórí Ìṣe Owó-orí Nàìjíríà 2025 fún ẹ̀kọ́ àti ètò.', ha: 'Wannan app yana ba da ƙiyasin haraji bisa Dokar Haraji ta Najeriya 2025 don ilimi da tsarawa.', ig: 'Ngwa a na-enye atụmatụ ụtụ dabere na Iwu Ụtụ Naịjirịa 2025 maka mmụta na atụmatụ.' },
  'disclaimer.notOfficialTitle': { en: 'Not Official Tax Advice', pcm: 'No Be Official Tax Advice', yo: 'Kìí Ṣe Ìmọ̀ràn Owó-orí Gidi', ha: 'Ba Shawarar Haraji ta Hukuma Ba', ig: 'Ọ Bụghị Ndụmọdụ Ụtụ Gọọmentị' },
  'disclaimer.notOfficialDesc': { en: 'Always consult FIRS, your state IRS, or certified tax professionals for official guidance.', pcm: 'Always talk to FIRS, your state IRS, or certified tax people for real advice.', yo: 'Máa bá FIRS, IRS ìpínlẹ̀ rẹ, tàbí àwọn ògbóntarìgì owó-orí tí a fọwọ́sí sọ̀rọ̀ fún ìtọ́sọ́nà gidi.', ha: 'Koyaushe tuntubi FIRS, IRS na jiharku, ko ƙwararrun haraji don jagorancin hukuma.', ig: 'Mgbe niile gbakwunyere FIRS, IRS steeti gị, ma ọ bụ ndị ọkachamara ụtụ maka nduzi gọọmentị.' },
  'disclaimer.noLiabilityTitle': { en: 'No Liability', pcm: 'No Liability', yo: 'Kò Sí Gbèsè', ha: 'Babu Alhaki', ig: 'Enweghị Ọrụ' },
  'disclaimer.noLiabilityDesc': { en: 'TaxForge NG is not liable for any errors, omissions, or decisions made based on this platform.', pcm: 'TaxForge NG no go carry wahala for any error, wetin we miss, or decision wey you make based on this platform.', yo: 'TaxForge NG kò gbà gbèsè fún àṣìṣe, àìsíkùn, tàbí ìpinnu tí a ṣe dá lórí pẹpẹ yìí.', ha: 'TaxForge NG ba za ta dauki alhakin duk wani kuskure, abin da aka manta, ko yanke shawara da aka yi dangane da wannan dandali ba.', ig: 'TaxForge NG anaghị aza ọrụ maka njehie ọ bụla, ihe a hapụrụ, ma ọ bụ mkpebi emere dabere na ikpo okwu a.' },
  'disclaimer.agreeTerms': { en: 'I understand this is not official tax advice. I agree to the Terms of Service & Privacy Policy.', pcm: 'I understand say this no be official tax advice. I agree to Terms of Service & Privacy Policy.', yo: 'Mo mọ̀ pé èyí kìí ṣe ìmọ̀ràn owó-orí gidi. Mo gbà Àwọn Òfin Iṣẹ́ & Ìlànà Àṣírí.', ha: 'Na fahimci cewa wannan ba shawarar haraji ta hukuma ba ce. Na amince da Sharuɗɗan Sabis & Manufar Sirri.', ig: 'Aghọtara m na nke a abụghị ndụmọdụ ụtụ gọọmentị. Ekwenyere m Usoro Ọrụ & Amụma Nzuzo.' },
  'disclaimer.continue': { en: 'I Understand, Continue', pcm: 'I Understand, Continue', yo: 'Mo Mọ̀, Tẹ̀síwájú', ha: 'Na Fahimta, Ci Gaba', ig: 'Aghọtara M, Gaa N\'ihu' },

  // Welcome Splash
  'welcome.title': { en: 'Welcome to TaxForge NG', pcm: 'Welcome to TaxForge NG', yo: 'Ẹ Káàbọ̀ Sí TaxForge NG', ha: 'Barka da zuwa TaxForge NG', ig: 'Nnọọ na TaxForge NG' },
  'welcome.subtitle': { en: 'Navigate the 2026 Nigeria Tax Act reforms with confidence. Let\'s take a quick tour of your tax toolkit.', pcm: 'Navigate the 2026 Nigeria Tax Act reforms with confidence. Make we take quick tour of your tax toolkit.', yo: 'Rin ìrìn àjò àwọn àtúnṣe Ìṣe Owó-orí Nàìjíríà 2026 pẹ̀lú ìgbóyà. Jẹ́ kí a wo àwọn ohun èlò owó-orí rẹ ní kíá kíá.', ha: 'Yi tafiye ta gyaran Dokar Haraji ta Najeriya 2026 da aminci. Bari mu yi wata gajeriyar yawon shakatawa na kayan aikin haraji.', ig: 'Jee nje mgbanwe Iwu Ụtụ Naịjirịa 2026 na-enwe ntụkwasị obi. Ka anyị lee ngwa ngwa ngwa ọrụ ụtụ gị.' },
  'welcome.accurateCalc': { en: 'Accurate 2026 tax calculations', pcm: 'Correct 2026 tax calculations', yo: 'Àwọn ìṣirò owó-orí 2026 tó péye', ha: 'Daidaitattun ƙididdigan haraji na 2026', ig: 'Mgbako ụtụ 2026 ziri ezi' },
  'welcome.multiBusinessExpense': { en: 'Multi-business expense tracking', pcm: 'Track expense for many business', yo: 'Ìtọpinpin inawo oríṣiríṣi iṣẹ́', ha: 'Bin diddigin kashe kuɗin kasuwanci da yawa', ig: 'Ịsọpụrụ mmefu ọtụtụ azụmahịa' },
  'welcome.demoData': { en: 'Demo data pre-loaded for you', pcm: 'Demo data don load for you', yo: 'Dátà àfihàn ti fi pamọ́ sílẹ̀ fún ọ', ha: 'An riga an ɗora bayanan demo muku', ig: 'Eburuola data nkwurịta maka gị' },
  'welcome.skipTour': { en: 'Skip Tour', pcm: 'Skip Tour', yo: 'Fò Ìrìn-àjò', ha: 'Tsallake Rangadin', ig: 'Mafere Njem' },
  'welcome.startTour': { en: 'Start Tour', pcm: 'Start Tour', yo: 'Bẹ̀rẹ̀ Ìrìn-àjò', ha: 'Fara Rangadin', ig: 'Malite Njem' },
  'welcome.skip': { en: 'Skip', pcm: 'Skip', yo: 'Fò', ha: 'Tsallake', ig: 'Mafere' },
  'welcome.getStarted': { en: 'Get Started', pcm: 'Start', yo: 'Bẹ̀rẹ̀', ha: 'Fara', ig: 'Malite' },
  'welcome.tourCalculator': { en: 'Smart Tax Calculator', pcm: 'Smart Tax Calculator', yo: 'Ẹ̀rọ Ìṣirò Owó-orí Ọlọ́gbọ́n', ha: 'Mai Ƙididdigan Haraji Mai Wayo', ig: 'Ngwa Mgbako Ụtụ Nwere Uche' },
  'welcome.tourCalculatorDesc': { en: 'Calculate CIT, PIT, VAT, and more with Nigeria Tax Act 2026 rules built-in. Get accurate estimates in seconds.', pcm: 'Calculate CIT, PIT, VAT, and more with Nigeria Tax Act 2026 rules wey dey inside. Get correct estimate in seconds.', yo: 'Ṣe ìṣirò CIT, PIT, VAT, àti púpọ̀ síi pẹ̀lú àwọn òfin Ìṣe Owó-orí Nàìjíríà 2026 tí a kọ́ sínú. Gba àwọn àmúdájú tó péye ní ìṣẹ́jú-àáyá.', ha: 'Ƙididdige CIT, PIT, VAT, da ƙari tare da dokokin Dokar Haraji ta Najeriya 2026 da aka gina. Sami daidaitattun ƙididdiga cikin daƙiƙa.', ig: 'Gbakọọ CIT, PIT, VAT, na ọzọ ya na iwu Iwu Ụtụ Naịjirịa 2026 arụnyere. Nweta atụmatụ ziri ezi n\'sekọnd.' },
  'welcome.tourMultiBusiness': { en: 'Multi-Business Support', pcm: 'Support for Many Business', yo: 'Àtìlẹ́yìn Oríṣiríṣi Iṣẹ́', ha: 'Tallafin Kasuwanci da Yawa', ig: 'Nkwado Ọtụtụ Azụmahịa' },
  'welcome.tourMultiBusinessDesc': { en: 'Save and manage multiple businesses. Track LLCs and Business Names separately with proper tax treatment.', pcm: 'Save and manage plenty business. Track LLC and Business Name separately with correct tax treatment.', yo: 'Fi pamọ́ kí o sì ṣàkóso oríṣiríṣi iṣẹ́. Tọpinpin àwọn LLC àti Orúkọ Iṣẹ́ lọ́tọ̀ọ̀tọ̀ pẹ̀lú ìtọ́jú owó-orí tó tọ́.', ha: 'Ajiye da sarrafa kasuwanci da yawa. Bin diddigin LLCs da Sunayen Kasuwanci daban-daban tare da ingantaccen kula da haraji.', ig: 'Chekwaa ma jikwaa ọtụtụ azụmahịa. Sọpụrụ LLCs na Aha Azụmahịa iche iche ya na nlekọta ụtụ kwesịrị ekwesị.' },
  'welcome.tourExpense': { en: 'Expense Tracking', pcm: 'Track Your Expense', yo: 'Ìtọpinpin Inawo', ha: 'Bin Diddigin Kashe Kuɗi', ig: 'Ịsọpụrụ Mmefu' },
  'welcome.tourExpenseDesc': { en: 'Log income and expenses, categorize deductibles, and see real-time tax impact visualizations.', pcm: 'Record income and expense, categorize deductibles, and see real-time tax impact for your eye.', yo: 'Forúkọ owó-wíwọlé àti inawo sílẹ̀, ṣàkójọ àwọn tí a lè yọkúrò, kí o sì ríi àwọn àfihàn ipa owó-orí ní àkókò gidi.', ha: 'Yin rikodin kudin shiga da kashewa, rarraba abin da za a cire, kuma duba tasirin haraji na gaske.', ig: 'Debanye ego nnata na mmefu, kee ụdị ihe a nwere ike iwepụ, wee hụ ihe ngosi mmetụta ụtụ ozugbo.' },
  'welcome.tourReminders': { en: 'Filing Reminders', pcm: 'Filing Reminders', yo: 'Ìránṣọ́ Fíránṣẹ́', ha: 'Tunatarwar Shigarwa', ig: 'Ncheta Itinye' },
  'welcome.tourRemindersDesc': { en: 'Never miss a deadline. Set reminders for VAT, PAYE, CIT, and other tax filing dates.', pcm: 'You no go miss deadline again. Set reminder for VAT, PAYE, CIT, and other tax filing dates.', yo: 'Má ṣe padà sẹ́yìn. Ṣètò àwọn ìránṣọ́ fún VAT, PAYE, CIT, àti àwọn ọjọ́ fíránṣẹ́ owó-orí mìíràn.', ha: 'Kada ku rasa ƙarshen lokaci. Saita tunatarwa don VAT, PAYE, CIT, da sauran kwanakin shigar haraji.', ig: 'Agaghị atụfu oge njedebe. Tọọ ncheta maka VAT, PAYE, CIT, na ụbọchị itinye ụtụ ndị ọzọ.' },
  'welcome.tourAcademy': { en: 'Tax Academy', pcm: 'Tax Academy', yo: 'Ilé-ìwé Owó-orí', ha: 'Makarantar Haraji', ig: 'Ụlọ Akwụkwọ Ụtụ' },
  'welcome.tourAcademyDesc': { en: 'Learn about Nigerian tax laws, exemptions, and compliance requirements. Stay informed.', pcm: 'Learn about Nigeria tax laws, exemptions, and compliance requirements. Stay informed.', yo: 'Kọ́ ẹ̀kọ́ nípa àwọn òfin owó-orí Nàìjíríà, àwọn àyọkúrò, àti àwọn ìbéèrè ìbọ̀wọ̀. Wà ní mọ̀.', ha: 'Koyi game da dokokin haraji na Najeriya, keɓewa, da buƙatun biyayya. Kasance cikin sani.', ig: 'Mụta gbasara iwu ụtụ Naịjirịa, mpụnarị, na ihe achọrọ mmekọrịta. Nọrọ mara ozi.' },

  // Achievements Page
  'achievements.title': { en: 'Achievements', pcm: 'Achievements', yo: 'Àṣeyọrí', ha: 'Nasarori', ig: 'Ihe Emere' },
  'achievements.subtitle': { en: 'Track your tax compliance journey', pcm: 'Track your tax compliance journey', yo: 'Tọpinpin ìrìn-àjò ìbọ̀wọ̀ owó-orí rẹ', ha: 'Bin diddigin tafiyar biyar haraji', ig: 'Sọpụrụ njem nkwekọrịta ụtụ gị' },
  'achievements.level': { en: 'Level', pcm: 'Level', yo: 'Ìpele', ha: 'Matsayi', ig: 'Ọkwa' },
  'achievements.totalPoints': { en: 'total points', pcm: 'total points', yo: 'àpapọ̀ àmì', ha: 'jimlar maki', ig: 'mkpokọta akara' },
  'achievements.dayStreak': { en: 'day streak', pcm: 'day streak', yo: 'ìtẹ̀síwájú ọjọ́', ha: 'ci gaban kwana', ig: 'nzọụkwụ ụbọchị' },
  'achievements.keepGoing': { en: 'Keep it going!', pcm: 'Keep going!', yo: 'Máa tẹ̀síwájú!', ha: 'Ci gaba!', ig: 'Gaa n\'ihu!' },
  'achievements.progressToLevel': { en: 'Progress to Level', pcm: 'Progress to Level', yo: 'Ìlọsíwájú sí Ìpele', ha: 'Ci gaba zuwa Matsayi', ig: 'Ọganihu na Ọkwa' },
  'achievements.calculations': { en: 'Calculations', pcm: 'Calculations', yo: 'Àwọn Ìṣirò', ha: 'Ƙididdiga', ig: 'Mgbako' },
  'achievements.businesses': { en: 'Businesses', pcm: 'Businesses', yo: 'Àwọn Iṣẹ́', ha: 'Kasuwanci', ig: 'Azụmahịa' },
  'achievements.badges': { en: 'Badges', pcm: 'Badges', yo: 'Àwọn Àmì', ha: 'Tambari', ig: 'Akara' },
  'achievements.pointsEarned': { en: 'Points Earned', pcm: 'Points Earned', yo: 'Àwọn Àmì Tí A Jèrè', ha: 'Maki da Aka Samu', ig: 'Akara Enwetara' },
  'achievements.unlocked': { en: 'Unlocked', pcm: 'Unlocked', yo: 'Ti Ṣí', ha: 'An Buɗe', ig: 'Emepere' },
  'achievements.locked': { en: 'Locked', pcm: 'Locked', yo: 'Ti Tì', ha: 'An Kulle', ig: 'Akpọchiri' },
  'achievements.startUsing': { en: 'Start using TaxForge NG to unlock achievements!', pcm: 'Start using TaxForge NG to unlock achievements!', yo: 'Bẹ̀rẹ̀ lílo TaxForge NG láti ṣí àṣeyọrí!', ha: 'Fara amfani da TaxForge NG don buɗe nasarori!', ig: 'Malite iji TaxForge NG mepee ihe emere!' },
  'achievements.beginner': { en: 'Beginner', pcm: 'Beginner', yo: 'Ọmọ Tuntun', ha: 'Mai Farawa', ig: 'Onye Mmalite' },
  'achievements.complianceStarter': { en: 'Compliance Starter', pcm: 'Compliance Starter', yo: 'Olùbẹ̀rẹ̀ Ìbọ̀wọ̀', ha: 'Mai Fara Biyayya', ig: 'Onye Mmalite Nkwekọrịta' },
  'achievements.taxPro': { en: 'Tax Pro', pcm: 'Tax Pro', yo: 'Ògbóntarìgì Owó-orí', ha: 'Ƙwararre Haraji', ig: 'Ọkachamara Ụtụ' },
  'achievements.taxExpert': { en: 'Tax Expert', pcm: 'Tax Expert', yo: 'Àmọ̀fìn Owó-orí', ha: 'Gwani kan Haraji', ig: 'Ọkammụta Ụtụ' },
  'achievements.taxMaster': { en: 'Tax Master', pcm: 'Tax Master', yo: 'Olùṣàkóso Owó-orí', ha: 'Masanin Haraji', ig: 'Nna Ukwu Ụtụ' },

  // Reminders Page
  'reminders.title': { en: 'Tax Deadline Reminders', pcm: 'Tax Deadline Reminders', yo: 'Àwọn Ìránṣọ́ Àkókò Ìparí Owó-orí', ha: 'Tunatarwar Ƙarshen Lokacin Haraji', ig: 'Ncheta Oge Njedebe Ụtụ' },
  'reminders.subtitle': { en: 'Set up automated reminders for your tax filing deadlines', pcm: 'Set up automatic reminder for your tax filing deadline', yo: 'Ṣètò àwọn ìránṣọ́ aládàáṣiṣẹ́ fún àwọn àkókò ìparí fíránṣẹ́ owó-orí rẹ', ha: 'Saita tunatarwar atomatik don ƙarshen lokutan shigar haraji', ig: 'Tọọ ncheta akpaaka maka oge njedebe itinye ụtụ gị' },
  'reminders.automatedReminders': { en: 'Automated Reminders', pcm: 'Automatic Reminders', yo: 'Àwọn Ìránṣọ́ Aládàáṣiṣẹ́', ha: 'Tunatarwar Atomatik', ig: 'Ncheta Akpaaka' },
  'reminders.neverMiss': { en: 'Never miss a tax deadline!', pcm: 'You no go miss tax deadline!', yo: 'Má ṣe pàdánù àkókò ìparí owó-orí!', ha: 'Kada ku rasa ƙarshen lokacin haraji!', ig: 'Atụfughị oge njedebe ụtụ!' },
  'reminders.vatFiling': { en: 'Monthly VAT filing reminders', pcm: 'Monthly VAT filing reminder', yo: 'Àwọn ìránṣọ́ fíránṣẹ́ VAT oṣooṣù', ha: 'Tunatarwar shigar VAT ta wata-wata', ig: 'Ncheta itinye VAT ọnwa niile' },
  'reminders.citDeadline': { en: 'Annual CIT return deadline alerts', pcm: 'Yearly CIT return deadline alert', yo: 'Àwọn ìkìlọ̀ àkókò ìparí ìpadàbọ̀ CIT ọdọọdún', ha: 'Faɗakarwar ƙarshen lokacin komawa CIT na shekara-shekara', ig: 'Mkpọsa oge njedebe nloghachi CIT kwa afọ' },
  'reminders.emailNotifications': { en: 'Email notifications (Basic+)', pcm: 'Email notification (Basic+)', yo: 'Àwọn ìfitọ́nilétí ímeèlì (Basic+)', ha: 'Sanarwar imel (Basic+)', ig: 'Ọkwa email (Basic+)' },
  'reminders.customReminders': { en: 'Custom reminders (Business+)', pcm: 'Custom reminder (Business+)', yo: 'Àwọn ìránṣọ́ àkànṣe (Business+)', ha: 'Tunatarwa na musamman (Business+)', ig: 'Ncheta omenala (Business+)' },
  'reminders.upgradeToBasic': { en: 'Upgrade to Basic for Reminders', pcm: 'Upgrade to Basic for Reminders', yo: 'Gbéga sí Basic fún Àwọn Ìránṣọ́', ha: 'Haɓaka zuwa Basic don Tunatarwa', ig: 'Kwalite na Basic maka Ncheta' },
  'reminders.loadingReminders': { en: 'Loading reminders...', pcm: 'Loading reminders...', yo: 'Ń gbéwọlé àwọn ìránṣọ́...', ha: 'Ana loda tunatarwa...', ig: 'Na-ebu ncheta...' },
  'reminders.enablePush': { en: 'Enable Push Notifications', pcm: 'Enable Push Notifications', yo: 'Mú Àwọn Ìfitọ́nilétí Títì Ṣiṣẹ́', ha: 'Kunna Sanarwar Turawa', ig: 'Mee ka Ọkwa Ntị rụọ ọrụ' },
  'reminders.pushEnabled': { en: 'Push Notifications Enabled', pcm: 'Push Notifications Enabled', yo: 'Àwọn Ìfitọ́nilétí Títì Ń Ṣiṣẹ́', ha: 'An Kunna Sanarwar Turawa', ig: 'Ọkwa Ntị Na-arụ Ọrụ' },
  'reminders.enableNotifications': { en: 'Enable Notifications', pcm: 'Enable Notifications', yo: 'Mú Àwọn Ìfitọ́nilétí Ṣiṣẹ́', ha: 'Kunna Sanarwa', ig: 'Mee ka Ọkwa rụọ ọrụ' },

  // Pricing Page
  'pricing.fullComparison': { en: 'Full Feature Comparison', pcm: 'Full Feature Comparison', yo: 'Ìfiwéra Ẹ̀yà Kíkún', ha: 'Cikakken Kwatancin Siffa', ig: 'Ntụnyere Atụmatụ Zuru Oke' },
  'pricing.feature': { en: 'Feature', pcm: 'Feature', yo: 'Ẹ̀yà', ha: 'Siffa', ig: 'Atụmatụ' },
  'pricing.individual': { en: 'Individual', pcm: 'Individual', yo: 'Ènìyàn', ha: 'Mutum', ig: 'Onye' },
  'pricing.freelancer': { en: 'Freelancer', pcm: 'Freelancer', yo: 'Aláṣiṣẹ́-ṣọ́ọ̀ṣì', ha: 'Mai Aiki Kai', ig: 'Onye Ọrụ Onwe Ya' },
  'pricing.corporate': { en: 'Corporate', pcm: 'Big Company', yo: 'Ilé-iṣẹ́ Ńlá', ha: 'Kamfani', ig: 'Ụlọ Ọrụ' },
  'pricing.securePayments': { en: 'Secure payments via Paystack. Pay with Card, Bank Transfer, or USSD.', pcm: 'Secure payment through Paystack. Pay with Card, Bank Transfer, or USSD.', yo: 'Àwọn ìsanwó aláàbò nípasẹ̀ Paystack. Sanwó pẹ̀lú Káàdì, Gbígbé Owó Bánkì, tàbí USSD.', ha: 'Biya mai tsaro ta Paystack. Biya da Kati, Canja wurin Banki, ko USSD.', ig: 'Ịkwụ ụgwọ echekwara site na Paystack. Kwụọ ụgwọ site na Kaadị, Mbufe Ụlọ Akụ, ma ọ bụ USSD.' },
  'pricing.needHelp': { en: 'Need Help Choosing?', pcm: 'You Need Help Choosing?', yo: 'Ṣé O Nílò Ìrànlọ́wọ́ Láti Yan?', ha: 'Kuna Buƙatar Taimako don Zaɓa?', ig: 'Ịchọrọ Enyemaka Ịhọrọ?' },
  'pricing.helpDescription': { en: 'Our team is here to help you find the perfect plan for your business needs.', pcm: 'Our team dey here to help you find the correct plan for your business.', yo: 'Ẹgbẹ́ wa wà níbí láti ran ọ́ lọ́wọ́ láti wá ètò tó dára jù fún àwọn àìní iṣẹ́ rẹ.', ha: 'Tawagarmu na nan don taimaka muku samun ingantaccen tsari don buƙatun kasuwancinku.', ig: 'Ndị otu anyị nọ ebe a inyere gị aka ịchọta atụmatụ zuru oke maka mkpa azụmahịa gị.' },
  'pricing.contactSales': { en: 'Contact Sales', pcm: 'Contact Sales', yo: 'Kàn sí Àwọn Olùtajà', ha: 'Tuntuɓi Sayarwa', ig: 'Kpọtụrụ Ndị Ahịa' },
  'pricing.startFreeTrial': { en: 'Start Free Trial', pcm: 'Start Free Trial', yo: 'Bẹ̀rẹ̀ Ìdánwò Ọ̀fẹ́', ha: 'Fara Gwajin Kyauta', ig: 'Malite Nnwale N\'efu' },
  'pricing.freeForever': { en: 'Free Forever', pcm: 'Free Forever', yo: 'Ọ̀fẹ́ Láéláé', ha: 'Kyauta Har Abada', ig: 'N\'efu Ruo Mgbe Ebighị Ebi' },
  'pricing.availableBasic': { en: 'Available on Basic+ plans', pcm: 'Available for Basic+ plans', yo: 'Wà fún àwọn ètò Basic+', ha: 'Ana samun shi akan tsare-tsare na Basic+', ig: 'Dị maka atụmatụ Basic+' },

  // Scenario Modeling Page
  'scenario.title': { en: 'Scenario Modeling', pcm: 'Scenario Modeling', yo: 'Ìṣètò Àwọn Ìṣẹ̀lẹ̀', ha: 'Yanayin Tsarawa', ig: 'Nhazi Ọnọdụ' },
  'scenario.subtitle': { en: 'Model scenarios and project your tax over time', pcm: 'Model scenarios and project your tax over time', yo: 'Ṣètò àwọn ìṣẹ̀lẹ̀ kí o sì ṣe ìkéde owó-orí rẹ lórí àkókò', ha: 'Tsara yanayi kuma ku yi hasashen haraji a kan lokaci', ig: 'Kekọọ ọnọdụ ma kọwaa ụtụ gị n\'oge' },
  'scenario.whatIf': { en: 'What-If', pcm: 'What-If', yo: 'Kí Ló Bá', ha: 'Menene Idan', ig: 'Gịnị ma ọ bụrụ' },
  'scenario.multiYear': { en: 'Multi-Year', pcm: 'Multi-Year', yo: 'Ọ̀pọ̀ Ọdún', ha: 'Shekaru Masu Yawa', ig: 'Ọtụtụ Afọ' },
  'scenario.penalties': { en: 'Penalties', pcm: 'Penalties', yo: 'Àwọn Ìjìyà', ha: 'Hukunci', ig: 'Ntaramahụhụ' },
  'scenario.foreign': { en: 'Foreign', pcm: 'Foreign', yo: 'Àjèjì', ha: 'Na Waje', ig: 'Mba Ọzọ' },
  'scenario.adjustVariables': { en: 'Adjust Variables', pcm: 'Adjust Variables', yo: 'Ṣàtúnṣe Àwọn Oníyàtọ̀', ha: 'Daidaita Masu Canji', ig: 'Mezigharịa Agbanwe' },
  'scenario.baseTurnover': { en: 'Base Annual Turnover', pcm: 'Base Annual Turnover', yo: 'Owó Ìpìlẹ̀ Tí Ó Wọlé Lọ́dún', ha: 'Tushen Kuɗin Shekara', ig: 'Ntọala Ego Afọ' },
  'scenario.turnoverChange': { en: 'Turnover Change', pcm: 'Turnover Change', yo: 'Ìyípadà Owó Tí Ó Wọlé', ha: 'Canjin Kudaden Shiga', ig: 'Mgbanwe Ego' },
  'scenario.expenseChange': { en: 'Expense Change', pcm: 'Expense Change', yo: 'Ìyípadà Inawo', ha: 'Canjin Kashe Kuɗi', ig: 'Mgbanwe Mmefu' },
  'scenario.bonusIncome': { en: 'Additional Bonus/Income (₦)', pcm: 'Additional Bonus/Income (₦)', yo: 'Owó Àfikún/Owó Wíwọlé (₦)', ha: 'Ƙarin Bonus/Kuɗi (₦)', ig: 'Ego Ọzọ/Ego Nnweta (₦)' },
  'scenario.additionalRent': { en: 'Additional Rent Paid (₦)', pcm: 'Additional Rent Paid (₦)', yo: 'Owó Iyálé Àfikún (₦)', ha: 'Ƙarin Kuɗin Haya (₦)', ig: 'Ụgwọ Ụlọ Ọzọ (₦)' },
  'scenario.foreignIncome': { en: 'Foreign Income (₦)', pcm: 'Foreign Income (₦)', yo: 'Owó Àjèjì (₦)', ha: 'Kuɗin Waje (₦)', ig: 'Ego Mba Ọzọ (₦)' },
  'scenario.cryptoGains': { en: 'Crypto/Capital Gains (₦)', pcm: 'Crypto/Capital Gains (₦)', yo: 'Èrè Crypto/Olu (₦)', ha: 'Ribar Crypto/Jari (₦)', ig: 'Uru Crypto/Capital (₦)' },
  'scenario.resetAll': { en: 'Reset All', pcm: 'Reset All', yo: 'Tún Gbogbo Ṣe', ha: 'Sake Duka', ig: 'Tọgharia Niile' },
  'scenario.currentTax': { en: 'Current Tax', pcm: 'Current Tax', yo: 'Owó-orí Lọ́wọ́lọ́wọ́', ha: 'Harajin Yanzu', ig: 'Ụtụ Ugbu a' },
  'scenario.scenarioTax': { en: 'Scenario Tax', pcm: 'Scenario Tax', yo: 'Owó-orí Ìṣẹ̀lẹ̀', ha: 'Harajin Yanayi', ig: 'Ụtụ Ọnọdụ' },
  'scenario.payMore': { en: 'You would pay MORE in taxes', pcm: 'You go pay MORE tax', yo: 'O máa san PÚPỌ̀ sí owó-orí', ha: 'Za ku biya FIYE a haraji', ig: 'Ị ga-akwụ OTU na ụtụ' },
  'scenario.saveMore': { en: 'You would SAVE on taxes', pcm: 'You go SAVE tax', yo: 'O máa FÌ PAMỌ́ lórí owó-orí', ha: 'Za ku AJIYE a kan haraji', ig: 'Ị ga-ECHEKWA ụtụ' },
  'scenario.noChange': { en: 'No change in tax liability', pcm: 'No change in tax', yo: 'Kò sí ìyípadà nínú owó-orí', ha: 'Babu canji a haraji', ig: 'Enweghị mgbanwe na ụtụ' },
  'scenario.insights': { en: 'Insights', pcm: 'Insights', yo: 'Òye', ha: 'Fahimta', ig: 'Nghọta' },
  'scenario.useInCalculator': { en: 'Use This Scenario in Calculator', pcm: 'Use This Scenario in Calculator', yo: 'Lo Ìṣẹ̀lẹ̀ Yìí Nínú Ẹ̀rọ Ìṣirò', ha: 'Yi amfani da wannan Yanayi a Ƙididdiga', ig: 'Jiri Ọnọdụ a na Ngwa Mgbako' },
  'scenario.upgradeToFreelancer': { en: 'Upgrade to Freelancer', pcm: 'Upgrade to Freelancer', yo: 'Gbéga sí Aláṣiṣẹ́-ṣọ́ọ̀ṣì', ha: 'Haɓaka zuwa Freelancer', ig: 'Kwalite na Freelancer' },
  'scenario.availableFreelancer': { en: 'Model "what-if" scenarios and multi-year projections. Available on Freelancer+ plans.', pcm: 'Model "what-if" scenarios and multi-year projections. Available for Freelancer+ plans.', yo: 'Ṣètò àwọn ìṣẹ̀lẹ̀ "kí ló bá" àti àwọn ìkéde ọ̀pọ̀ ọdún. Wà fún àwọn ètò Freelancer+.', ha: 'Tsara yanayin "menene idan" da hasashen shekaru masu yawa. Ana samun shi akan tsare-tsaren Freelancer+.', ig: 'Kekọọ ọnọdụ "gịnị ma ọ bụrụ" na nkọwa ọtụtụ afọ. Dị maka atụmatụ Freelancer+.' },
  'scenario.increasesRentRelief': { en: 'Increases rent relief', pcm: 'Increases rent relief', yo: 'Ń mú ìtùnú iyálé pọ̀ sí', ha: 'Yana ƙara sauƙin haya', ig: 'Na-abawanye nkwụsịtụ ụgwọ ụlọ' },
  'scenario.convertCBN': { en: 'Convert at CBN rate', pcm: 'Convert at CBN rate', yo: 'Yí padà ní ìwọ̀n CBN', ha: 'Canza a farashin CBN', ig: 'Gbanwee na ọnụego CBN' },
  'scenario.cgtApplies': { en: '10% CGT applies', pcm: '10% CGT applies', yo: '10% CGT máa lò', ha: '10% CGT ya shafi', ig: '10% CGT na-emetụta' },
  'scenario.rate': { en: 'Rate', pcm: 'Rate', yo: 'Ìwọ̀n', ha: 'Farashin', ig: 'Ọnụego' },
  'scenario.disclaimer': { en: 'All scenarios are estimates based on current tax laws and may change.', pcm: 'All scenarios na estimate based on current tax law and fit change.', yo: 'Gbogbo àwọn ìṣẹ̀lẹ̀ jẹ́ àpẹẹrẹ tí ó dá lórí àwọn òfin owó-orí lọ́wọ́lọ́wọ́ àti pé ó lè yípadà.', ha: 'Duk yanayin kiyasi ne dangane da dokokin haraji na yanzu kuma na iya canzawa.', ig: 'Ọnọdụ niile bụ nkwurịta dabere na iwu ụtụ ugbu a ma nwere ike ịgbanwe.' },

  // Phase 1: Security Components - IP Whitelist Manager
  'security.whitelist.title': { en: 'IP Address Whitelist', pcm: 'IP Address Whitelist', yo: 'Àtòjọ IP Tí A Fọwọ́sí', ha: 'Jerin Adireshin IP', ig: 'Ndepụta Adreesị IP' },
  'security.whitelist.description': { en: 'Restrict logins to specific IP addresses or ranges', pcm: 'Restrict login to specific IP address or ranges', yo: 'Dènà wíwọlé sí àwọn àdírẹ́sì IP pàtàkì tàbí àwọn ìwọ̀n', ha: 'Taƙaita shiga zuwa takamaiman adiresoshin IP ko jeri', ig: 'Gbochie ịbanye na adreesị IP a kapịrị maọbụ oke' },
  'security.whitelist.enabled': { en: 'Enabled', pcm: 'Enabled', yo: 'Ti Mú Ṣiṣẹ́', ha: 'An Kunna', ig: 'Emepere' },
  'security.whitelist.disabled': { en: 'Disabled', pcm: 'Disabled', yo: 'Ti Dá Dúró', ha: 'An Kashe', ig: 'Akwụsịrị' },
  'security.whitelist.yourIp': { en: 'Your IP:', pcm: 'Your IP:', yo: 'IP Rẹ:', ha: 'IP ɗinka:', ig: 'IP gị:' },
  'security.whitelist.whitelisted': { en: 'Whitelisted', pcm: 'Whitelisted', yo: 'Ti Fọwọ́sí', ha: 'An Yarda', ig: 'Edebanyere' },
  'security.whitelist.notWhitelisted': { en: 'Not whitelisted', pcm: 'Not whitelisted', yo: 'Kò Tí Fọwọ́sí', ha: 'Ba a yarda ba', ig: 'Edebanyeghị' },
  'security.whitelist.addThisIp': { en: 'Add This IP', pcm: 'Add This IP', yo: 'Fi IP Yìí Kún', ha: 'Ƙara Wannan IP', ig: 'Tinye IP A' },
  'security.whitelist.noActiveIps': { en: 'No active IP addresses whitelisted', pcm: 'No active IP address whitelisted', yo: 'Kò sí àwọn àdírẹ́sì IP tí ń ṣiṣẹ́ tí a fọwọ́sí', ha: 'Babu adiresoshin IP masu aiki da aka yarda', ig: 'Enweghị adreesị IP na-arụ ọrụ edebanyere' },
  'security.whitelist.lockoutWarning': { en: "You won't be able to log in from any IP address. Add at least one IP to avoid being locked out.", pcm: "You no go fit login from any IP address. Add at least one IP so you no go lock out.", yo: "Ìwọ kò ní lè wọlé láti àdírẹ́sì IP kankan. Fi ó kéré jù IP kan kún láti yẹra fún títì.", ha: "Ba za ku iya shiga daga kowane adireshin IP ba. Ƙara aƙalla IP ɗaya don guje wa kulle.", ig: "Ị gaghị enwe ike ịbanye site na adreesị IP ọ bụla. Tinye opekata mpe IP otu iji zere ịkpọchi." },
  'security.whitelist.addIpAddress': { en: 'Add IP Address', pcm: 'Add IP Address', yo: 'Fi Àdírẹ́sì IP Kún', ha: 'Ƙara Adireshin IP', ig: 'Tinye Adreesị IP' },
  'security.whitelist.export': { en: 'Export', pcm: 'Export', yo: 'Gbé Jáde', ha: 'Fitar', ig: 'Bupụ' },
  'security.whitelist.import': { en: 'Import', pcm: 'Import', yo: 'Gbé Wọlé', ha: 'Shigowa', ig: 'Bubata' },
  'security.whitelist.noIps': { en: 'No IP addresses whitelisted', pcm: 'No IP address whitelisted', yo: 'Kò sí àdírẹ́sì IP tí a fọwọ́sí', ha: 'Babu adireshin IP da aka yarda', ig: 'Enweghị adreesị IP edebanyere' },
  'security.whitelist.addIpsToRestrict': { en: 'Add IP addresses to restrict login access', pcm: 'Add IP address to restrict login access', yo: 'Fi àwọn àdírẹ́sì IP kún láti dènà àǹfààní wíwọlé', ha: 'Ƙara adiresoshin IP don taƙaita damar shiga', ig: 'Tinye adreesị IP iji gbochie ohere ịbanye' },
  'security.whitelist.supportedFormats': { en: 'Supported formats:', pcm: 'Supported formats:', yo: 'Àwọn ọ̀nà tí a ṣe àtìlẹ́yìn:', ha: 'Tsarin da aka goyan baya:', ig: 'Usoro a na-akwado:' },
  'security.whitelist.exactIp': { en: 'Exact IP:', pcm: 'Exact IP:', yo: 'IP Gangan:', ha: 'Ainihin IP:', ig: 'IP kpọmkwem:' },
  'security.whitelist.cidrRange': { en: 'CIDR range:', pcm: 'CIDR range:', yo: 'Ìwọ̀n CIDR:', ha: 'Jerin CIDR:', ig: 'Oke CIDR:' },
  'security.whitelist.wildcard': { en: 'Wildcard:', pcm: 'Wildcard:', yo: 'Wildcard:', ha: 'Wildcard:', ig: 'Wildcard:' },
  'security.whitelist.addIpTitle': { en: 'Add IP Address', pcm: 'Add IP Address', yo: 'Fi Àdírẹ́sì IP Kún', ha: 'Ƙara Adireshin IP', ig: 'Tinye Adreesị IP' },
  'security.whitelist.addIpDescription': { en: 'Add an IP address or range to your whitelist', pcm: 'Add IP address or range to your whitelist', yo: 'Fi àdírẹ́sì IP tàbí ìwọ̀n kún sí àtòjọ rẹ tí a fọwọ́sí', ha: 'Ƙara adireshin IP ko jeri zuwa jerin yardarka', ig: 'Tinye adreesị IP maọbụ oke na ndepụta gị' },
  'security.whitelist.ipRangeLabel': { en: 'IP Address or Range', pcm: 'IP Address or Range', yo: 'Àdírẹ́sì IP tàbí Ìwọ̀n', ha: 'Adireshin IP ko Jeri', ig: 'Adreesị IP maọbụ Oke' },
  'security.whitelist.ipRangePlaceholder': { en: 'e.g., 192.168.1.100 or 192.168.1.0/24', pcm: 'e.g., 192.168.1.100 or 192.168.1.0/24', yo: 'bí àpẹẹrẹ, 192.168.1.100 tàbí 192.168.1.0/24', ha: 'misali, 192.168.1.100 ko 192.168.1.0/24', ig: 'dịka, 192.168.1.100 maọbụ 192.168.1.0/24' },
  'security.whitelist.descriptionLabel': { en: 'Description (optional)', pcm: 'Description (optional)', yo: 'Àpèjúwe (yàn)', ha: 'Bayani (zaɓi)', ig: 'Nkọwa (nhọrọ)' },
  'security.whitelist.descriptionPlaceholder': { en: 'e.g., Home network, Office IP', pcm: 'e.g., Home network, Office IP', yo: 'bí àpẹẹrẹ, Nẹ́tíwọ́kì ilé, IP Ọ́fíìsì', ha: 'misali, Hanyar gida, IP Ofis', ig: 'dịka, Netwọkụ ụlọ, IP Ọfịs' },
  'security.whitelist.addToWhitelist': { en: 'Add to Whitelist', pcm: 'Add to Whitelist', yo: 'Fi Kún Sí Àtòjọ Tí A Fọwọ́sí', ha: 'Ƙara zuwa Jerin Yarda', ig: 'Tinye na Ndepụta' },
  'security.whitelist.adding': { en: 'Adding...', pcm: 'Adding...', yo: 'Ń fikún...', ha: 'Ana ƙarawa...', ig: 'Na-etinye...' },
  'security.whitelist.enableTitle': { en: 'Enable IP Whitelist?', pcm: 'Enable IP Whitelist?', yo: 'Ṣe Mú Àtòjọ IP Ṣiṣẹ́?', ha: 'Kunna Jerin IP?', ig: 'Mee ka Ndepụta IP rụọ ọrụ?' },
  'security.whitelist.enableWarning': { en: "You're about to enable IP whitelisting without adding your current IP address.", pcm: "You wan enable IP whitelisting without adding your current IP address.", yo: "O fẹ́ mú àtòjọ IP ṣiṣẹ́ láìsí fífi àdírẹ́sì IP lọ́wọ́lọ́wọ́ rẹ kún.", ha: "Kuna shirin kunna jerin IP ba tare da ƙara adireshin IP na yanzu ba.", ig: "Ị na-achọ ime ka ndepụta IP rụọ ọrụ na-etinyeghị adreesị IP gị ugbu a." },
  'security.whitelist.lockoutRisk': { en: 'Warning: You may lock yourself out', pcm: 'Warning: You fit lock yourself out', yo: 'Ìkìlọ̀: O lè tì ara rẹ sílẹ̀', ha: 'Gargaɗi: Kuna iya kulle kanku', ig: 'Ịdọ aka ná ntị: Ị nwere ike kpọchie onwe gị' },
  'security.whitelist.lockoutExplanation': { en: "If you enable the whitelist without adding any IP addresses, you won't be able to log in from any location.", pcm: "If you enable whitelist without adding any IP address, you no go fit login from anywhere.", yo: "Tí o bá mú àtòjọ ṣiṣẹ́ láìsí fífi àdírẹ́sì IP kankan kún, ìwọ kò ní lè wọlé láti ibikíbi.", ha: "Idan kun kunna jerin ba tare da ƙara kowane adireshin IP ba, ba za ku iya shiga daga ko'ina ba.", ig: "Ọ bụrụ na ịmekwuo ndepụta na-etinyeghị adreesị IP ọ bụla, ị gaghị enwe ike ịbanye site n'ebe ọ bụla." },
  'security.whitelist.addMyIpAndEnable': { en: 'Add my IP ({ip}) and enable', pcm: 'Add my IP ({ip}) and enable', yo: 'Fi IP mi ({ip}) kún kí o sì mú ṣiṣẹ́', ha: 'Ƙara IP na ({ip}) sannan kunna', ig: 'Tinye IP m ({ip}) ma mee ka ọ rụọ ọrụ' },
  'security.whitelist.enableAnyway': { en: 'Enable anyway', pcm: 'Enable anyway', yo: 'Mú ṣiṣẹ́ bó tilẹ̀ jẹ́', ha: 'Kunna duk da haka', ig: 'Mee ka ọ rụọ ọrụ n\'agbanyeghị' },

  // Phase 1: Security Score Widget
  'security.score.points': { en: 'points', pcm: 'points', yo: 'àmì', ha: 'maki', ig: 'akara' },
  'security.score.excellent': { en: 'Excellent', pcm: 'Excellent', yo: 'Ó Dára Púpọ̀', ha: 'Kyakkyawa', ig: 'Ọ dị mma nke ukwuu' },
  'security.score.veryGood': { en: 'Very Good', pcm: 'Very Good', yo: 'Ó Dára Gan-an', ha: 'Da Kyau Sosai', ig: 'Ọ dị mma nke ukwuu' },
  'security.score.good': { en: 'Good', pcm: 'Good', yo: 'Ó Dára', ha: 'Da Kyau', ig: 'Ọ dị mma' },
  'security.score.fair': { en: 'Fair', pcm: 'Fair', yo: 'Ó Ṣe Déédéé', ha: 'Mai Kyau', ig: 'Ọ dị mma nwantịntị' },
  'security.score.needsImprovement': { en: 'Needs Improvement', pcm: 'Needs Improvement', yo: 'Ó Nílò Ìlọsíwájú', ha: 'Yana Buƙatar Ingantawa', ig: 'Ọ chọrọ Mmezigharị' },
  'security.score.title': { en: 'Security Score', pcm: 'Security Score', yo: 'Àmì Ààbò', ha: 'Maki Tsaro', ig: 'Akara Nchekwa' },
  'security.score.description': { en: 'Your overall account security health', pcm: 'Your overall account security health', yo: 'Ìlera ààbò àkọsílẹ̀ rẹ lápapọ̀', ha: 'Lafiyar tsaron asusu ku gabaɗaya', ig: 'Ahụike nchekwa akaụntụ gị n\'ozuzu' },
  'security.score.emailVerified': { en: 'Email Verified', pcm: 'Email Verified', yo: 'Ímeèlì Ti Ṣàyẹ̀wò', ha: 'An Tabbatar da Imel', ig: 'Egosiri Email' },
  'security.score.emailVerifiedDesc': { en: 'Your email is verified', pcm: 'Your email don verify', yo: 'Ímeèlì rẹ ti ṣàyẹ̀wò', ha: 'An tabbatar da imel ɗinku', ig: 'Egosiri email gị' },
  'security.score.emailNotVerifiedDesc': { en: 'Verify your email for account recovery', pcm: 'Verify your email for account recovery', yo: 'Ṣàyẹ̀wò ímeèlì rẹ fún gbígba àkọsílẹ̀ padà', ha: 'Tabbatar da imel ɗinku don dawo da asusu', ig: 'Nyochaa email gị maka ịnwetaghachi akaụntụ' },
  'security.score.twoFactor': { en: 'Two-Factor Authentication', pcm: 'Two-Factor Authentication', yo: 'Ìṣàyẹ̀wò Oríṣi Méjì', ha: 'Tabbatarwa ta Sau Biyu', ig: 'Nyocha Usoro Abụọ' },
  'security.score.twoFactorEnabledDesc': { en: '2FA is protecting your account', pcm: '2FA dey protect your account', yo: '2FA ń dáàbò bo àkọsílẹ̀ rẹ', ha: '2FA yana kare asusunku', ig: '2FA na-echekwa akaụntụ gị' },
  'security.score.twoFactorDisabledDesc': { en: 'Enable 2FA for stronger security', pcm: 'Enable 2FA for stronger security', yo: 'Mú 2FA ṣiṣẹ́ fún ààbò tí ó lágbára jù', ha: 'Kunna 2FA don ƙarin tsaro', ig: 'Mee ka 2FA rụọ ọrụ maka nchekwa siri ike' },
  'security.score.backupCodes': { en: 'Backup Codes', pcm: 'Backup Codes', yo: 'Àwọn Kóòdù Àfipamọ́', ha: 'Lambobin Ajiya', ig: 'Koodu Nchekwa' },
  'security.score.backupCodesRemaining': { en: '{count} backup codes remaining', pcm: '{count} backup codes remaining', yo: 'Àwọn kóòdù àfipamọ́ {count} kù', ha: 'Lambobin ajiya {count} ya rage', ig: 'Koodu nchekwa {count} fọdụrụ' },
  'security.score.generateBackupCodes': { en: 'Generate backup codes for account recovery', pcm: 'Generate backup codes for account recovery', yo: 'Ṣẹ̀dá àwọn kóòdù àfipamọ́ fún gbígba àkọsílẹ̀ padà', ha: 'Ƙirƙiri lambobin ajiya don dawo da asusu', ig: 'Mepụta koodu nchekwa maka ịnwetaghachi akaụntụ' },
  'security.score.passwordHealth': { en: 'Password Health', pcm: 'Password Health', yo: 'Ìlera Ọ̀rọ̀ Aṣínà', ha: 'Lafiyar Kalmar Sirri', ig: 'Ahụike Okwuntụghe' },
  'security.score.passwordRecent': { en: 'Password recently updated', pcm: 'Password recently updated', yo: 'A ti ṣe àtúnṣe ọ̀rọ̀ aṣínà láìpẹ́', ha: 'An sabunta kalmar sirri kwanan nan', ig: 'Emelitere okwuntụghe n\'oge na-adịbeghị anya' },
  'security.score.passwordUpToDate': { en: 'Password is up to date', pcm: 'Password is up to date', yo: 'Ọ̀rọ̀ aṣínà wà ní tuntun', ha: 'Kalmar sirri tana da sabuntawa', ig: 'Okwuntụghe dị ọhụrụ' },
  'security.score.passwordOldWarning': { en: 'Consider updating your password soon', pcm: 'Consider updating your password soon', yo: 'Rò nípa ṣíṣe àtúnṣe ọ̀rọ̀ aṣínà rẹ láìpẹ́', ha: "Yi la'akari da sabunta kalmar sirrinka nan ba da jimawa ba", ig: "Chee banyere ịmelite okwuntụghe gị n'oge na-adịghị anya" },
  'security.score.passwordVeryOld': { en: "Password hasn't been changed in over a year", pcm: "Password never change pass one year", yo: "A kò tí yí ọ̀rọ̀ aṣínà padà ní ọdún kan síi", ha: "Ba a canza kalmar sirri ba fiye da shekara guda", ig: "A gbanwebeghị okwuntụghe karịa afọ otu" },
  'security.score.passwordGeneral': { en: 'Consider updating your password periodically', pcm: 'Consider updating your password from time to time', yo: 'Rò nípa ṣíṣe àtúnṣe ọ̀rọ̀ aṣínà rẹ ní gbogbo ìgbà', ha: 'Yi la\'akari da sabunta kalmar sirrinka lokaci-lokaci', ig: 'Chee banyere ịmelite okwuntụghe gị oge ụfọdụ' },
  'security.score.deviceRecognition': { en: 'Device Recognition', pcm: 'Device Recognition', yo: 'Ìdámọ̀ Ẹ̀rọ', ha: 'Gane Na\'ura', ig: 'Ịmata Ngwaọrụ' },
  'security.score.deviceTrackingEnabled': { en: 'Your devices are being tracked', pcm: 'Your devices dey tracked', yo: 'A ń tọpinpin àwọn ẹ̀rọ rẹ', ha: 'Ana bin diddigin na\'urorinka', ig: 'A na-esochi ngwaọrụ gị' },
  'security.score.deviceTrackingDisabled': { en: 'Enable device tracking for security alerts', pcm: 'Enable device tracking for security alert', yo: 'Mú ìtọpinpin ẹ̀rọ ṣiṣẹ́ fún àwọn ìkìlọ̀ ààbò', ha: 'Kunna bin diddigin na\'ura don faɗakarwar tsaro', ig: 'Mee ka ịsọpụrụ ngwaọrụ rụọ ọrụ maka mkpọsa nchekwa' },
  'security.score.quickImprovements': { en: 'Quick improvements:', pcm: 'Quick improvements:', yo: 'Àwọn àtúnṣe kíákíá:', ha: 'Inganta mai sauri:', ig: 'Imeziwanye ngwa ngwa:' },

  // Phase 1: Security Analytics
  'security.analytics.totalLogins': { en: 'Total Logins', pcm: 'Total Logins', yo: 'Àpapọ̀ Wíwọlé', ha: 'Jimlar Shiga', ig: 'Mkpokọta Ịbanye' },
  'security.analytics.failedAttempts': { en: 'Failed Attempts', pcm: 'Failed Attempts', yo: 'Àwọn Ìgbìyànjú Tí Ó Kùnà', ha: 'Ƙoƙari da Bai Yi Nasara Ba', ig: 'Ọgbụgba Dara' },
  'security.analytics.successRate': { en: 'Success Rate', pcm: 'Success Rate', yo: 'Ìwọ̀n Àṣeyọrí', ha: 'Adadin Nasara', ig: 'Ọnụọgụ Ịga Nke Ọma' },
  'security.analytics.uniqueIps': { en: 'Unique IPs', pcm: 'Unique IPs', yo: 'Àwọn IP Àkànṣe', ha: 'IP na Musamman', ig: 'IP Pụrụ Iche' },
  'security.analytics.loginActivity': { en: 'Login Activity (Last 14 Days)', pcm: 'Login Activity (Last 14 Days)', yo: 'Ìṣẹ̀lẹ̀ Wíwọlé (Ọjọ́ 14 Tó Kọjá)', ha: 'Ayyukan Shiga (Kwanaki 14 da suka gabata)', ig: 'Ọrụ Ịbanye (Ụbọchị 14 Gara Aga)' },
  'security.analytics.loginActivityDesc': { en: 'Successful and failed login attempts over time', pcm: 'Successful and failed login attempt over time', yo: 'Àwọn ìgbìyànjú wíwọlé tí ó ṣàṣeyọrí àti tí ó kùnà ní àkókò', ha: 'Ƙoƙarin shiga da nasara da rashin nasara cikin lokaci', ig: 'Ọgbụgba ịbanye gara nke ọma na nke dara n\'oge' },
  'security.analytics.successful': { en: 'Successful', pcm: 'Successful', yo: 'Àṣeyọrí', ha: 'Nasara', ig: 'Ọ gara nke ọma' },
  'security.analytics.failed': { en: 'Failed', pcm: 'Failed', yo: 'Ó Kùnà', ha: 'Bai Yi Nasara Ba', ig: 'Ọ dara' },
  'security.analytics.eventTypes': { en: 'Event Types', pcm: 'Event Types', yo: 'Oríṣi Ìṣẹ̀lẹ̀', ha: 'Nau\'in Abubuwa', ig: 'Ụdị Ihe Omume' },
  'security.analytics.eventTypesDesc': { en: 'Distribution of security events', pcm: 'Distribution of security event', yo: 'Ìpínkáàkiri àwọn ìṣẹ̀lẹ̀ ààbò', ha: 'Rarraba abubuwan tsaro', ig: 'Nkesa ihe omume nchekwa' },
  'security.analytics.loginTimes': { en: 'Login Times', pcm: 'Login Times', yo: 'Àwọn Àkókò Wíwọlé', ha: 'Lokutan Shiga', ig: 'Oge Ịbanye' },
  'security.analytics.loginTimesDesc': { en: 'When you typically log in', pcm: 'When you usually log in', yo: 'Ìgbà tí o sábà máa ń wọlé', ha: 'Lokacin da kuka saba shiga', ig: 'Mgbe ị na-ebanye oge niile' },
  'security.analytics.loginLocations': { en: 'Login Locations', pcm: 'Login Locations', yo: 'Àwọn Ibì Wíwọlé', ha: 'Wuraren Shiga', ig: 'Ebe Ịbanye' },
  'security.analytics.loginLocationsDesc': { en: "Countries you've logged in from", pcm: "Countries where you don login from", yo: 'Àwọn orílẹ̀-èdè tí o ti wọlé láti', ha: 'Ƙasashen da kuka shiga daga', ig: 'Mba ị banyere site na' },
  'security.analytics.logins': { en: 'logins', pcm: 'logins', yo: 'wíwọlé', ha: 'shiga', ig: 'ịbanye' },

  // Phase 1: Blocked Login Attempts Log
  'security.blocked.title': { en: 'Blocked Login Attempts', pcm: 'Blocked Login Attempts', yo: 'Àwọn Ìgbìyànjú Wíwọlé Tí A Dínà', ha: 'Ƙoƙarin Shiga da Aka Toshe', ig: 'Ọgbụgba Ịbanye Egbochiri' },
  'security.blocked.description': { en: 'Recent login attempts that were blocked by your security rules', pcm: 'Recent login attempt wey your security rules block', yo: 'Àwọn ìgbìyànjú wíwọlé láìpẹ́ tí àwọn òfin ààbò rẹ dínà', ha: 'Ƙoƙarin shiga na baya-bayan nan waɗanda dokokin tsaro sun toshe', ig: 'Ọgbụgba ịbanye na-adịbeghị anya nke iwu nchekwa gị gbochiri' },
  'security.blocked.refresh': { en: 'Refresh', pcm: 'Refresh', yo: 'Ṣe Tuntun', ha: 'Sabunta', ig: 'Kpọgharia' },
  'security.blocked.noAttempts': { en: 'No blocked attempts', pcm: 'No blocked attempt', yo: 'Kò sí ìgbìyànjú tí a dínà', ha: 'Babu ƙoƙarin da aka toshe', ig: 'Enweghị ọgbụgba egbochiri' },
  'security.blocked.noAttemptsDesc': { en: "When login attempts are blocked, they'll appear here", pcm: "When login attempt dey blocked, e go show here", yo: "Nígbà tí a bá dínà àwọn ìgbìyànjú wíwọlé, wọn yóò hàn níbí", ha: "Lokacin da ƙoƙarin shiga aka toshe, za su bayyana a nan", ig: "Mgbe egbochiri ọgbụgba ịbanye, ha ga-apụta ebe a" },
  'security.blocked.ipNotWhitelisted': { en: 'IP Not Whitelisted', pcm: 'IP Not Whitelisted', yo: 'IP Kò Wà Nínú Àtòjọ Tí A Fọwọ́sí', ha: 'Ba a yarda da IP ba', ig: 'Edebanyeghị IP' },
  'security.blocked.outsideAllowedHours': { en: 'Outside Allowed Hours', pcm: 'Outside Allowed Hours', yo: 'Léyìí Àwọn Wákàtí Tí A Gbà Láàyè', ha: 'Bayan Lokutan da Aka Yarda', ig: 'N\'èzí Oge A Kwadoro' },
  'security.blocked.blocked': { en: 'Blocked', pcm: 'Blocked', yo: 'Dínà', ha: 'An Toshe', ig: 'Egbochiri' },
  'security.blocked.alertVia': { en: 'Alert via', pcm: 'Alert via', yo: 'Ìkìlọ̀ nípasẹ̀', ha: 'Faɗakarwa ta', ig: 'Mkpọsa site na' },

  // Phase 1: Notification Delivery Log
  'security.notifications.title': { en: 'Notification Delivery Log', pcm: 'Notification Delivery Log', yo: 'Àkọsílẹ̀ Ìfiránṣẹ́ Ìfitọ́nilétí', ha: 'Bayanan Isar da Sanarwa', ig: 'Ndekọ Nnyefe Ọkwa' },
  'security.notifications.description': { en: 'Track which notifications were sent via WhatsApp, SMS, or Email', pcm: 'Track which notification dem send through WhatsApp, SMS, or Email', yo: 'Tọpinpin àwọn ìfitọ́nilétí tí a fi ránṣẹ́ nípasẹ̀ WhatsApp, SMS, tàbí Ímeèlì', ha: 'Bin diddigin wanne sanarwa aka aika ta WhatsApp, SMS, ko Imel', ig: 'Sọpụrụ ọkwa nke ezitere site na WhatsApp, SMS, maọbụ Email' },
  'security.notifications.refresh': { en: 'Refresh', pcm: 'Refresh', yo: 'Ṣe Tuntun', ha: 'Sabunta', ig: 'Kpọgharia' },
  'security.notifications.total': { en: 'Total', pcm: 'Total', yo: 'Àpapọ̀', ha: 'Jimla', ig: 'Mkpokọta' },
  'security.notifications.allMethods': { en: 'All Methods', pcm: 'All Methods', yo: 'Gbogbo Ọ̀nà', ha: 'Duk Hanyoyi', ig: 'Usoro Niile' },
  'security.notifications.allStatus': { en: 'All Status', pcm: 'All Status', yo: 'Gbogbo Ipò', ha: 'Duk Matsayi', ig: 'Ọnọdụ Niile' },
  'security.notifications.allAlerts': { en: 'All Alerts', pcm: 'All Alerts', yo: 'Gbogbo Ìkìlọ̀', ha: 'Duk Faɗakarwa', ig: 'Mkpọsa Niile' },
  'security.notifications.sent': { en: 'Sent', pcm: 'Sent', yo: 'Firánṣẹ́', ha: 'An Aika', ig: 'Ezitere' },
  'security.notifications.delivered': { en: 'Delivered', pcm: 'Delivered', yo: 'Ti Dé', ha: 'An Isar', ig: 'Enyefere' },
  'security.notifications.pending': { en: 'Pending', pcm: 'Pending', yo: 'Ń Dúró', ha: 'Ana Jira', ig: 'Na-echere' },
  'security.notifications.noDeliveries': { en: 'No notification deliveries found', pcm: 'No notification delivery dey', yo: 'Kò rí ìfiránṣẹ́ ìfitọ́nilétí kankan', ha: 'Ba a sami isar da sanarwa ba', ig: 'Ahụghị nnyefe ọkwa ọ bụla' },
  'security.notifications.noDeliveriesDesc': { en: 'Deliveries will appear here when security alerts are sent', pcm: 'Delivery go show here when security alert send', yo: 'Àwọn ìfiránṣẹ́ yóò hàn níbí nígbà tí a bá fi àwọn ìkìlọ̀ ààbò ránṣẹ́', ha: 'Isar za ta bayyana a nan lokacin da aka aika faɗakarwar tsaro', ig: 'Nnyefe ga-apụta ebe a mgbe ezitere mkpọsa nchekwa' },
  'security.notifications.to': { en: 'To:', pcm: 'To:', yo: 'Sí:', ha: 'Zuwa:', ig: 'Nye:' },
  'security.notifications.error': { en: 'Error:', pcm: 'Error:', yo: 'Àṣìṣe:', ha: 'Kuskure:', ig: 'Njehie:' },
  'security.notifications.accountLocked': { en: 'Account Locked', pcm: 'Account Locked', yo: 'Àkọsílẹ̀ Ti Tì', ha: 'An Kulle Asusu', ig: 'Akpọchiri Akaụntụ' },
  'security.notifications.failedBackupCodes': { en: 'Failed Backup Codes', pcm: 'Failed Backup Codes', yo: 'Àwọn Kóòdù Àfipamọ́ Tí Ó Kùnà', ha: 'Lambobin Ajiya da Bai Yi Nasara Ba', ig: 'Koodu Nchekwa Dara' },
  'security.notifications.newDevice': { en: 'New Device', pcm: 'New Device', yo: 'Ẹ̀rọ Tuntun', ha: 'Sabuwar Na\'ura', ig: 'Ngwaọrụ Ọhụrụ' },
  'security.notifications.deviceRemoved': { en: 'Device Removed', pcm: 'Device Removed', yo: 'A Ti Yọ Ẹ̀rọ Kúrò', ha: 'An Cire Na\'ura', ig: 'Ewepụrụ Ngwaọrụ' },
  'security.notifications.sessionsRevoked': { en: 'Sessions Revoked', pcm: 'Sessions Revoked', yo: 'A Ti Fagilee Àwọn Àkókò', ha: 'An Soke Zaman', ig: 'Akagburu Oge' },
  'security.notifications.newLocation': { en: 'New Location', pcm: 'New Location', yo: 'Ibì Tuntun', ha: 'Sabuwar Wuri', ig: 'Ebe Ọhụrụ' },
  'security.notifications.deviceBlocked': { en: 'Device Blocked', pcm: 'Device Blocked', yo: 'A Ti Dínà Ẹ̀rọ', ha: 'An Toshe Na\'ura', ig: 'Egbochiri Ngwaọrụ' },
  'security.notifications.passwordChanged': { en: 'Password Changed', pcm: 'Password Changed', yo: 'A Ti Yí Ọ̀rọ̀ Aṣínà Padà', ha: 'An Canza Kalmar Sirri', ig: 'Agbanwere Okwuntụghe' },
  'security.notifications.twoFaEnabled': { en: '2FA Enabled', pcm: '2FA Enabled', yo: '2FA Ti Mú Ṣiṣẹ́', ha: 'An Kunna 2FA', ig: 'Emepere 2FA' },
  'security.notifications.twoFaDisabled': { en: '2FA Disabled', pcm: '2FA Disabled', yo: '2FA Ti Dá Dúró', ha: 'An Kashe 2FA', ig: 'Akwụsịrị 2FA' },
  'security.notifications.backupCodesGenerated': { en: 'Backup Codes Generated', pcm: 'Backup Codes Generated', yo: 'A Ti Ṣẹ̀dá Àwọn Kóòdù Àfipamọ́', ha: 'An Ƙirƙiri Lambobin Ajiya', ig: 'Emepụtara Koodu Nchekwa' },
  'security.notifications.emailChanged': { en: 'Email Changed', pcm: 'Email Changed', yo: 'A Ti Yí Ímeèlì Padà', ha: 'An Canza Imel', ig: 'Agbanwere Email' },
  'security.notifications.unusualTime': { en: 'Unusual Time', pcm: 'Unusual Time', yo: 'Àkókò Àjèjì', ha: 'Lokaci Mara Magana', ig: 'Oge Ọ Dịghị Ahụ' },
  'security.notifications.ipBlocked': { en: 'IP Blocked', pcm: 'IP Blocked', yo: 'A Ti Dínà IP', ha: 'An Toshe IP', ig: 'Egbochiri IP' },
  'security.notifications.timeRestricted': { en: 'Time Restricted', pcm: 'Time Restricted', yo: 'A Ti Dènà Àkókò', ha: 'An Taƙaita Lokaci', ig: 'Egbochiri Oge' },

  // Phase 2: Transactions Page
  'transactions.title': { en: 'Import Transactions', pcm: 'Import Transactions', yo: 'Gbé Àwọn Ìdúnàádúrà Wọlé', ha: 'Shigo da Ma\'amaloli', ig: 'Bubata Azụmahịa' },
  'transactions.subtitle': { en: 'Upload bank statements to auto-populate calculator', pcm: 'Upload bank statement to auto-populate calculator', yo: 'Gbé ìwé ìròyìn bánkì wọlé láti fi kún èrọ ìṣirò láìfọwọ́yí', ha: 'Ɗora bayanin banki don cika lissafin atomatik', ig: 'Bulite akwụkwọ ụlọ akụ iji tinye ngwa mgbako n\'akpaaka' },
  'transactions.bankImport': { en: 'Bank Transaction Import', pcm: 'Bank Transaction Import', yo: 'Ìgbéwọlé Ìdúnàádúrà Bánkì', ha: 'Shigo da Ma\'amalar Banki', ig: 'Ịbubata Azụmahịa Ụlọ Akụ' },
  'transactions.bankImportDesc': { en: 'Import bank statements to auto-populate your tax calculations', pcm: 'Import bank statement to auto-fill your tax calculation', yo: 'Gbé àwọn ìwé ìròyìn bánkì wọlé láti fi kún àwọn ìṣirò owó-orí rẹ láìfọwọ́yí', ha: 'Shigo da bayanin banki don cika ƙididdigan haraji na atomatik', ig: 'Bubata akwụkwọ ụlọ akụ iji tinye mgbako ụtụ gị n\'akpaaka' },
  'transactions.uploadCsv': { en: 'Upload CSV bank statements', pcm: 'Upload CSV bank statement', yo: 'Gbé àwọn ìwé ìròyìn bánkì CSV wọlé', ha: 'Ɗora bayanin banki CSV', ig: 'Bulite akwụkwọ ụlọ akụ CSV' },
  'transactions.autoCategorize': { en: 'Auto-categorize income & expenses', pcm: 'Auto-categorize income and expense', yo: 'Ṣàkójọ owó-wíwọlé àti inawo láìfọwọ́yí', ha: 'Rarraba kudin shiga da kashewa ta atomatik', ig: 'Kee ụdị ego nnata na mmefu n\'akpaaka' },
  'transactions.autoPopulate': { en: 'Auto-populate calculator inputs', pcm: 'Auto-fill calculator inputs', yo: 'Fi kún àwọn ìfọwọ́sí èrọ ìṣirò láìfọwọ́yí', ha: 'Cika abubuwan shigar lissafi ta atomatik', ig: 'Tinye ihe ntinye ngwa mgbako n\'akpaaka' },
  'transactions.mockNotice': { en: 'Mock for prototype – Live Mono/Okra API integration coming soon!', pcm: 'Mock for prototype – Live Mono/Okra API integration go come soon!', yo: 'Àfihàn fún àpẹrẹ – Ìsopọ̀ API Mono/Okra aláàyè ń bọ̀ láìpẹ́!', ha: 'Misali don samfuri – Haɗin API na Mono/Okra na zuwa nan ba da jimawa ba!', ig: 'Nkwurịta maka nchọpụta – Njikọ API Mono/Okra na-abịa n\'oge na-adịghị anya!' },
  'transactions.upgradeForImport': { en: 'Upgrade to Business for Import', pcm: 'Upgrade to Business for Import', yo: 'Gbéga sí Business fún Ìgbéwọlé', ha: 'Haɓaka zuwa Business don Shigowa', ig: 'Kwalite na Business maka Ịbubata' },
  'transactions.uploadBankStatement': { en: 'Upload Bank Statement', pcm: 'Upload Bank Statement', yo: 'Gbé Ìwé Ìròyìn Bánkì Wọlé', ha: 'Ɗora Bayanin Banki', ig: 'Bulite Akwụkwọ Ụlọ Akụ' },
  'transactions.uploadDescription': { en: 'Upload a CSV file with columns: Date, Description, Amount', pcm: 'Upload CSV file with columns: Date, Description, Amount', yo: 'Gbé fáìlì CSV wọlé pẹ̀lú àwọn ìwé: Ọjọ́, Àpèjúwe, Iye', ha: 'Ɗora fayil CSV tare da shafuka: Kwanan wata, Bayani, Adadi', ig: 'Bulite faịlụ CSV nwere kọlụm: Ụbọchị, Nkọwa, Ego' },
  'transactions.selectBusiness': { en: 'Select Business', pcm: 'Select Business', yo: 'Yan Iṣẹ́', ha: 'Zaɓi Kasuwanci', ig: 'Họrọ Azụmahịa' },
  'transactions.chooseBusiness': { en: 'Choose a business', pcm: 'Choose a business', yo: 'Yan iṣẹ́ kan', ha: 'Zaɓi kasuwanci', ig: 'Họrọ azụmahịa' },
  'transactions.processing': { en: 'Processing...', pcm: 'Processing...', yo: 'Ń ṣe iṣẹ́...', ha: 'Ana aiwatarwa...', ig: 'Na-arụ ọrụ...' },
  'transactions.uploadCsvBtn': { en: 'Upload CSV', pcm: 'Upload CSV', yo: 'Gbé CSV Wọlé', ha: 'Ɗora CSV', ig: 'Bulite CSV' },
  'transactions.importedTransactions': { en: 'Imported Transactions', pcm: 'Imported Transactions', yo: 'Àwọn Ìdúnàádúrà Tí A Gbéwọlé', ha: "Ma'amalolin da Aka Shigo", ig: 'Azụmahịa Ebutere' },
  'transactions.transactionsFound': { en: '{count} transactions found', pcm: '{count} transactions found', yo: 'A rí àwọn ìdúnàádúrà {count}', ha: "An sami ma'amaloli {count}", ig: 'Achọtara azụmahịa {count}' },
  'transactions.autoCategorized': { en: 'auto-categorized', pcm: 'auto-categorized', yo: 'tí a ṣàkójọ láìfọwọ́yí', ha: 'rarraba atomatik', ig: 'ekewara ụdị n\'akpaaka' },
  'transactions.date': { en: 'Date', pcm: 'Date', yo: 'Ọjọ́', ha: 'Kwanan wata', ig: 'Ụbọchị' },
  'transactions.description': { en: 'Description', pcm: 'Description', yo: 'Àpèjúwe', ha: 'Bayani', ig: 'Nkọwa' },
  'transactions.amount': { en: 'Amount', pcm: 'Amount', yo: 'Iye', ha: 'Adadi', ig: 'Ego' },
  'transactions.category': { en: 'Category', pcm: 'Category', yo: 'Ẹ̀ka', ha: 'Rukuni', ig: 'Ụdị' },
  'transactions.auto': { en: 'Auto', pcm: 'Auto', yo: 'Aláìfọwọ́yí', ha: 'Atomatik', ig: 'Akpaaka' },
  'transactions.income': { en: 'Income', pcm: 'Income', yo: 'Owó-wíwọlé', ha: 'Kudin Shiga', ig: 'Ego Nnata' },
  'transactions.expense': { en: 'Expense', pcm: 'Expense', yo: 'Inawo', ha: 'Kashewa', ig: 'Mmefu' },
  'transactions.vatableIncome': { en: 'VATable Income', pcm: 'VATable Income', yo: 'Owó-wíwọlé VAT', ha: 'Kudin Shiga na VAT', ig: 'Ego Nnata VAT' },
  'transactions.vatableExpense': { en: 'VATable Expense', pcm: 'VATable Expense', yo: 'Inawo VAT', ha: 'Kashewa na VAT', ig: 'Mmefu VAT' },
  'transactions.summary': { en: 'Summary', pcm: 'Summary', yo: 'Àkópọ̀', ha: 'Taƙaitawa', ig: 'Nchịkọta' },
  'transactions.totalIncome': { en: 'Total Income', pcm: 'Total Income', yo: 'Àpapọ̀ Owó-wíwọlé', ha: 'Jimlar Kudin Shiga', ig: 'Mkpokọta Ego Nnata' },
  'transactions.totalExpenses': { en: 'Total Expenses', pcm: 'Total Expenses', yo: 'Àpapọ̀ Inawo', ha: 'Jimlar Kashewa', ig: 'Mkpokọta Mmefu' },
  'transactions.vatableIncomeTotal': { en: 'VATable Income', pcm: 'VATable Income', yo: 'Owó-wíwọlé VAT', ha: 'Kudin Shiga na VAT', ig: 'Ego Nnata VAT' },
  'transactions.vatableExpenseTotal': { en: 'VATable Expenses', pcm: 'VATable Expenses', yo: 'Inawo VAT', ha: 'Kashewa na VAT', ig: 'Mmefu VAT' },
  'transactions.readyToCalculate': { en: 'Ready to calculate?', pcm: 'Ready to calculate?', yo: 'Ṣe o ti ṣetán láti ṣe ìṣirò?', ha: 'Shirye don ƙididdiga?', ig: 'Ị dị njikere ịgbakọ?' },
  'transactions.applyTotals': { en: 'Apply these totals to the tax calculator', pcm: 'Apply these totals to the tax calculator', yo: 'Lo àwọn àpapọ̀ wọ̀nyí sí èrọ ìṣirò owó-orí', ha: 'Amfani da waɗannan jimla zuwa lissafin haraji', ig: 'Tinye mkpokọta ndị a na ngwa mgbako ụtụ' },
  'transactions.applyToCalculator': { en: 'Apply to Calculator', pcm: 'Apply to Calculator', yo: 'Lo Sí Èrọ Ìṣirò', ha: 'Amfani zuwa Lissafi', ig: 'Tinye na Ngwa Mgbako' },
  'transactions.noSavedBusinesses': { en: 'No Saved Businesses', pcm: 'No Saved Business', yo: 'Kò Sí Iṣẹ́ Tí A Fipamọ́', ha: 'Babu Kasuwancin da Aka Ajiye', ig: 'Enweghị Azụmahịa Echekwara' },
  'transactions.saveBusinessFirst': { en: 'Save a business first to import transactions', pcm: 'Save a business first to import transactions', yo: 'Fi iṣẹ́ pamọ́ ṣáájú láti gbé àwọn ìdúnàádúrà wọlé', ha: 'Ajiye kasuwanci da farko don shigo da ma\'amaloli', ig: 'Chekwaa azụmahịa mbụ iji bubata azụmahịa' },
  'transactions.goToCalculator': { en: 'Go to Calculator', pcm: 'Go to Calculator', yo: 'Lọ Sí Èrọ Ìṣirò', ha: 'Je zuwa Lissafi', ig: 'Gaa na Ngwa Mgbako' },

  // Phase 2: Business Report Page
  'businessReport.title': { en: 'Business Report', pcm: 'Business Report', yo: 'Ìròyìn Iṣẹ́', ha: 'Rahoto Kasuwanci', ig: 'Akụkọ Azụmahịa' },
  'businessReport.subtitle': { en: 'Income, expenses & tax estimates', pcm: 'Income, expenses & tax estimates', yo: 'Owó-wíwọlé, inawo àti àwọn àmúdájú owó-orí', ha: 'Kudin shiga, kashewa & ƙiyasin haraji', ig: 'Ego nnata, mmefu & atụmatụ ụtụ' },
  'businessReport.signIn': { en: 'Please sign in to view reports.', pcm: 'Please sign in to view reports.', yo: 'Jọ̀wọ́ wọlé láti wo àwọn ìròyìn.', ha: 'Da fatan za a shiga don duba rahotanni.', ig: 'Biko banye ịhụ akụkọ.' },
  'businessReport.loadingReport': { en: 'Loading report...', pcm: 'Loading report...', yo: 'Ń gbéwọlé ìròyìn...', ha: 'Ana loda rahoto...', ig: 'Na-ebu akụkọ...' },
  'businessReport.noBusinesses': { en: 'No Businesses', pcm: 'No Businesses', yo: 'Kò Sí Iṣẹ́', ha: 'Babu Kasuwanci', ig: 'Enweghị Azụmahịa' },
  'businessReport.addBusinessFirst': { en: 'Add a business first to generate expense reports.', pcm: 'Add a business first to generate expense reports.', yo: 'Fi iṣẹ́ kan kún ṣáájú láti ṣẹ̀dá àwọn ìròyìn inawo.', ha: 'Ƙara kasuwanci da farko don samar da rahotannin kashewa.', ig: 'Tinye azụmahịa mbụ iji mepụta akụkọ mmefu.' },
  'businessReport.addBusiness': { en: 'Add Business', pcm: 'Add Business', yo: 'Fi Iṣẹ́ Kún', ha: 'Ƙara Kasuwanci', ig: 'Tinye Azụmahịa' },
  'businessReport.selectBusiness': { en: 'Select business', pcm: 'Select business', yo: 'Yan iṣẹ́', ha: 'Zaɓi kasuwanci', ig: 'Họrọ azụmahịa' },
  'businessReport.exportPdf': { en: 'Export PDF', pcm: 'Export PDF', yo: 'Gbé PDF Jáde', ha: 'Fitar PDF', ig: 'Bupụ PDF' },
  'businessReport.type': { en: 'Type:', pcm: 'Type:', yo: 'Irú:', ha: 'Iri:', ig: 'Ụdị:' },
  'businessReport.registeredTurnover': { en: 'Registered Turnover:', pcm: 'Registered Turnover:', yo: 'Owó Tí A Forúkọsílẹ̀:', ha: 'Kuɗin da Aka Yiwa Rajista:', ig: 'Ego Edebanye Aha:' },
  'businessReport.transactionsCount': { en: 'Transactions:', pcm: 'Transactions:', yo: 'Àwọn Ìdúnàádúrà:', ha: "Ma'amaloli:", ig: 'Azụmahịa:' },
  'businessReport.llcCit': { en: 'LLC (CIT)', pcm: 'LLC (CIT)', yo: 'LLC (CIT)', ha: 'LLC (CIT)', ig: 'LLC (CIT)' },
  'businessReport.bnPit': { en: 'Business Name (PIT)', pcm: 'Business Name (PIT)', yo: 'Orúkọ Iṣẹ́ (PIT)', ha: 'Sunan Kasuwanci (PIT)', ig: 'Aha Azụmahịa (PIT)' },
  'businessReport.incomeLabel': { en: 'Income', pcm: 'Income', yo: 'Owó-wíwọlé', ha: 'Kudin Shiga', ig: 'Ego Nnata' },
  'businessReport.expensesLabel': { en: 'Expenses', pcm: 'Expenses', yo: 'Inawo', ha: 'Kashewa', ig: 'Mmefu' },
  'businessReport.deductible': { en: 'Deductible', pcm: 'Deductible', yo: 'Tí A Lè Yọkúrò', ha: 'Abin Cirewa', ig: 'Nke A Nwere Ike Iwepu' },
  'businessReport.netIncome': { en: 'Net Income', pcm: 'Net Income', yo: 'Èrè Àlùmọ́nì', ha: 'Riba Tsafta', ig: 'Ego Nnata Nkwụsịtụ' },
  'businessReport.estTax': { en: 'Est. Tax', pcm: 'Est. Tax', yo: 'Owó-orí Ìrò', ha: 'Kiyasin Haraji', ig: 'Atụmatụ Ụtụ' },
  'businessReport.expenseBreakdown': { en: 'Expense Breakdown', pcm: 'Expense Breakdown', yo: 'Ìpínpín Inawo', ha: 'Rarraba Kashewa', ig: 'Nkewa Mmefu' },
  'businessReport.noExpenses': { en: 'No expenses recorded for this business', pcm: 'No expenses recorded for this business', yo: 'Kò sí inawo tí a kọ sílẹ̀ fún iṣẹ́ yìí', ha: 'Babu kashewa da aka yi wa rajista don wannan kasuwanci', ig: 'Enweghị mmefu edekọrọ maka azụmahịa a' },
  'businessReport.taxSummary': { en: 'Tax Summary', pcm: 'Tax Summary', yo: 'Àkópọ̀ Owó-orí', ha: 'Taƙaitawar Haraji', ig: 'Nchịkọta Ụtụ' },
  'businessReport.totalIncomeLabel': { en: 'Total Income', pcm: 'Total Income', yo: 'Àpapọ̀ Owó-wíwọlé', ha: 'Jimlar Kudin Shiga', ig: 'Mkpokọta Ego Nnata' },
  'businessReport.deductibleExpenses': { en: 'Deductible Expenses', pcm: 'Deductible Expenses', yo: 'Inawo Tí A Lè Yọkúrò', ha: 'Kashewa da Za A Cire', ig: 'Mmefu Nke A Nwere Ike Iwepu' },
  'businessReport.taxableIncome': { en: 'Taxable Income', pcm: 'Taxable Income', yo: 'Owó-wíwọlé Tí A Lè Gba Owó-orí Lé', ha: 'Kudin Shiga da Za A Iya Haraji', ig: 'Ego Nnata Nke A Ga-Atụ Ụtụ' },
  'businessReport.taxType': { en: 'Tax Type', pcm: 'Tax Type', yo: 'Irú Owó-orí', ha: 'Nau\'in Haraji', ig: 'Ụdị Ụtụ' },
  'businessReport.citRate': { en: 'CIT (25% + 4% Levy)', pcm: 'CIT (25% + 4% Levy)', yo: 'CIT (25% + 4% Owó)', ha: 'CIT (25% + 4% Haraji)', ig: 'CIT (25% + 4% Ụtụ)' },
  'businessReport.pitProgressive': { en: 'PIT (Progressive)', pcm: 'PIT (Progressive)', yo: 'PIT (Ìtẹ̀síwájú)', ha: 'PIT (Ci gaba)', ig: 'PIT (Ọganihu)' },
  'businessReport.smallCompanyExemption': { en: 'Small Company Exemption Applied', pcm: 'Small Company Exemption Applied', yo: 'A Ti Lo Ìyọ̀kúrò Ilé-iṣẹ́ Kékeré', ha: 'An Yi Amfani da Keɓewar Ƙaramin Kamfani', ig: 'Etinyela Mpụnarị Ụlọ Ọrụ Obere' },
  'businessReport.smallCompanyDesc': { en: 'Companies with ≤₦50M turnover pay 0% CIT under 2026 rules.', pcm: 'Companies with ≤₦50M turnover pay 0% CIT under 2026 rules.', yo: 'Àwọn ilé-iṣẹ́ pẹ̀lú ≤₦50M owó wọlé san 0% CIT lábẹ́ àwọn òfin 2026.', ha: 'Kamfanoni da ≤₦50M jujjuyawa suna biyan 0% CIT ƙarƙashin dokokin 2026.', ig: 'Ụlọ ọrụ nwere ≤₦50M mmegharị na-akwụ 0% CIT n\'okpuru iwu 2026.' },
  'businessReport.estimatedTaxDue': { en: 'Estimated Tax Due', pcm: 'Estimated Tax Due', yo: 'Owó-orí Ìrò Tí Ó Yẹ', ha: 'Kiyasin Harajin da Ake Bi', ig: 'Atụmatụ Ụtụ Kwesịrị' },
  'businessReport.openFullCalculator': { en: 'Open Full Calculator', pcm: 'Open Full Calculator', yo: 'Ṣí Èrọ Ìṣirò Ní Kíkún', ha: 'Buɗe Cikakken Lissafi', ig: 'Mepee Ngwa Mgbako Zuru Oke' },
  'businessReport.recentTransactions': { en: 'Recent Transactions', pcm: 'Recent Transactions', yo: 'Àwọn Ìdúnàádúrà Láìpẹ́', ha: "Ma'amaloli na Baya-bayan Nan", ig: 'Azụmahịa Na-adịbeghị Anya' },
  'businessReport.noTransactions': { en: 'No transactions linked to this business', pcm: 'No transaction linked to this business', yo: 'Kò sí ìdúnàádúrà tí a so mọ́ iṣẹ́ yìí', ha: "Babu ma'amala da aka haɗa da wannan kasuwanci", ig: 'Enweghị azụmahịa ejikọtara na azụmahịa a' },
  'businessReport.addExpenses': { en: 'Add Expenses', pcm: 'Add Expenses', yo: 'Fi Inawo Kún', ha: 'Ƙara Kashewa', ig: 'Tinye Mmefu' },
  'businessReport.disclaimer': { en: 'Disclaimer: This report provides educational estimates based on the Nigeria Tax Act 2025. Always consult FIRS/state IRS or tax professionals for official advice.', pcm: 'Disclaimer: This report provide educational estimate based on Nigeria Tax Act 2025. Always consult FIRS/state IRS or tax professionals for official advice.', yo: 'Ìkìlọ̀: Ìròyìn yìí pèsè àwọn àmúdájú fún ẹ̀kọ́ tí ó dá lórí Ìṣe Owó-orí Nàìjíríà 2025. Máa bá FIRS/IRS ìpínlẹ̀ tàbí àwọn ògbóntarìgì owó-orí sọ̀rọ̀ fún ìmọ̀ràn gidi.', ha: 'Sanarwa: Wannan rahoto yana ba da ƙididdigar ilimi bisa Dokar Haraji ta Najeriya 2025. Koyaushe tuntubi FIRS/IRS na jiha ko ƙwararrun haraji don shawarar hukuma.', ig: 'Ọkwa: Akụkọ a na-enye atụmatụ mmụta dabere na Iwu Ụtụ Naịjirịa 2025. Mgbe niile gbakwunyere FIRS/steeti IRS maọbụ ndị ọkachamara ụtụ maka ndụmọdụ gọọmentị.' },

  // Phase 3: Advisory Page - Additional Keys (avoiding duplicates)
  'advisory.of': { en: 'of', pcm: 'of', yo: 'nínú', ha: 'na', ig: "n'ime" },
  'advisory.ltdTitle': { en: 'Limited Liability Company (LTD)', pcm: 'Limited Liability Company (LTD)', yo: 'Ilé-iṣẹ́ Olùdáàbòbò Tó Lópin (LTD)', ha: 'Kamfanin Iyakancewar Alhakin (LTD)', ig: 'Ụlọ Ọrụ Ọrụ Nwere Oke (LTD)' },
  'advisory.ltdSummary': { en: 'Based on your responses, a Limited Liability Company offers better protection and growth potential for your business.', pcm: 'Based on your answer dem, Limited Liability Company go give your business better protection and growth.', yo: 'Dá lórí àwọn ìdáhùn rẹ, Ilé-iṣẹ́ Olùdáàbòbò Tó Lópin pèsè àbò tó dára jù àti àǹfààní ìdàgbàsókè fún iṣẹ́ rẹ.', ha: 'Dangane da amsoshinku, Kamfanin Iyakancewar Alhakin yana ba da kariya mafi kyau da damar ci gaba ga kasuwancinku.', ig: 'Dabere na azịza gị, Ụlọ Ọrụ Nwere Oke na-enye nchekwa ka mma na ohere uto maka azụmahịa gị.' },
  'advisory.bnTitle': { en: 'Business Name (Sole Proprietorship/Partnership)', pcm: 'Business Name (Sole Proprietorship/Partnership)', yo: 'Orúkọ Iṣẹ́ (Ẹni-nìkan/Àjọṣepọ̀)', ha: 'Sunan Kasuwanci (Mallakar Kai/Haɗin Gwiwa)', ig: 'Aha Azụmahịa (Onwe Nwe/Ọnụ Ọgụ)' },
  'advisory.bnSummary': { en: 'A Business Name registration is simpler and more cost-effective for your current business needs.', pcm: 'Business Name registration na simpler and cost less for your current business needs.', yo: 'Ìforúkọsílẹ̀ Orúkọ Iṣẹ́ rọrùn jù àti pé ó san owó fún àwọn àìní iṣẹ́ rẹ lọ́wọ́lọ́wọ́.', ha: 'Rajistar Sunan Kasuwanci ta fi sauƙi kuma tana da araha don buƙatun kasuwancinku na yanzu.', ig: 'Ndebanye aha Aha Azụmahịa dị mfe ma dịkwuo ọnụ ala maka mkpa azụmahịa gị ugbu a.' },
  'advisory.hasPartnersQ': { en: 'Will you have business partners or co-founders?', pcm: 'You go get business partners or co-founders?', yo: 'Ṣé o máa ní àwọn alájọṣepọ̀ iṣẹ́ tàbí àwọn alábàáṣiṣẹ́pọ̀?', ha: 'Za ku sami abokan kasuwanci ko masu haɗa hannu?', ig: 'Ị ga-enwe ndị mmekọ azụmahịa ma ọ bụ ndị guzobere ọnụ?' },
  'advisory.hasPartnersDesc': { en: 'This affects the legal structure and ownership documentation required.', pcm: "This go affect the legal structure and ownership document wey dey required.", yo: 'Èyí máa kan ètò òfin àti ìwé àṣẹ ìní tí a nílò.', ha: "Wannan yana shafar tsarin shari'a da takardar mallakar da ake buƙata.", ig: 'Nke a na-emetụta usoro iwu na akwụkwọ nwe nke achọrọ.' },
  'advisory.yesPartners': { en: "Yes, I'll have partners", pcm: "Yes, I go get partners", yo: "Bẹ́ẹ̀ni, Màá ní àwọn alájọṣepọ̀", ha: "Eh, zan sami abokan aiki", ig: "Ee, Aga m enwe ndị mmekọ" },
  'advisory.noPartners': { en: "No, I'm going solo", pcm: "No, na me alone", yo: "Rárá, Màá ṣe fúnra mi", ha: "A'a, zan yi shi ni kaɗai", ig: "Mba, Ana m aga naanị m" },
  'advisory.expectedTurnoverQ': { en: "What's your expected annual turnover?", pcm: "How much money you expect to make for year?", yo: "Owó mélòó ló yẹ kí o wọlé lọ́dún?", ha: "Menene kuɗin da kuke tsammanin shekara?", ig: "Kedu ego ị na-atụ anya afọ?" },
  'advisory.expectedTurnoverDesc': { en: 'This determines tax obligations and whether VAT registration is required.', pcm: 'This go determine tax obligation and whether VAT registration dey required.', yo: 'Èyí máa pinnu àwọn ìfaramọ́ owó-orí àti bóyá ìforúkọsílẹ̀ VAT ní a nílò.', ha: 'Wannan yana ƙayyade wajibcin haraji da ko ana buƙatar rajistar VAT.', ig: 'Nke a na-ekpebi ọrụ ụtụ ma ọ bụrụ na achọrọ ndebanye aha VAT.' },
  'advisory.under25m': { en: 'Under ₦25 million', pcm: 'Under ₦25 million', yo: 'Lábẹ́ ₦25 mílíọ̀nù', ha: 'Ƙasa da ₦25 miliyan', ig: "N'okpuru ₦25 nde" },
  'advisory.between25m50m': { en: '₦25m - ₦50 million', pcm: '₦25m - ₦50 million', yo: '₦25m - ₦50 mílíọ̀nù', ha: '₦25m - ₦50 miliyan', ig: '₦25m - ₦50 nde' },
  'advisory.over50m': { en: 'Over ₦50 million', pcm: 'Over ₦50 million', yo: 'Léyìí ₦50 mílíọ̀nù', ha: 'Fiye da ₦50 miliyan', ig: 'Karịrị ₦50 nde' },
  'advisory.assetProtectionQ': { en: 'Do you need protection for personal assets?', pcm: 'You need protection for your personal property?', yo: 'Ṣé o nílò àbò fún àwọn ohun-ìní ara ẹni rẹ?', ha: 'Kuna buƙatar kariya ga dukiya?', ig: 'Ị chọrọ nchedo maka ihe onwunwe nkeonwe?' },
  'advisory.assetProtectionDesc': { en: 'Limited liability separates personal assets from business debts and lawsuits.', pcm: 'Limited liability go separate your personal property from business debt and lawsuit.', yo: 'Ìdáàbòbò tó lópin máa yà àwọn ohun-ìní ara ẹni kúrò lọ́wọ́ gbèsè iṣẹ́ àti ẹjọ́.', ha: 'Iyakancewar alhakin tana raba dukiyar kai daga bashin kasuwanci da kararraki.', ig: 'Ọrụ nwere oke na-ekewa ihe onwunwe onwe site na ụgwọ azụmahịa na ikpe iwu.' },
  'advisory.yesImportant': { en: 'Yes, this is important', pcm: 'Yes, this one important', yo: 'Bẹ́ẹ̀ni, èyí ṣe pàtàkì', ha: 'Eh, wannan yana da mahimmanci', ig: 'Ee, nke a dị mkpa' },
  'advisory.notPriority': { en: 'Not a priority', pcm: 'No be priority', yo: 'Kìí ṣe pàtàkì', ha: 'Ba fifiko ba ne', ig: 'Ọ bụghị mkpa' },

  // Phase 5: Terms Page
  'terms.title': { en: 'Terms of Service & Privacy Policy', pcm: 'Terms of Service & Privacy Policy', yo: 'Àwọn Òfin Iṣẹ́ àti Ìlànà Àṣírí', ha: 'Sharuɗɗan Sabis da Manufar Sirri', ig: 'Usoro Ọrụ na Amụma Nzuzo' },
  'terms.lastUpdated': { en: 'Last updated:', pcm: 'Last updated:', yo: 'Ṣàtúnṣe kẹ́yìn:', ha: 'An sabunta na ƙarshe:', ig: 'Emelitere ikpeazụ:' },
  'terms.importantDisclaimer': { en: 'Important Disclaimer', pcm: 'Important Disclaimer', yo: 'Ìkìlọ̀ Pàtàkì', ha: 'Muhimmin Sanarwa', ig: 'Ọkwa Dị Mkpa' },
  'terms.disclaimerText': { en: 'TaxForge NG provides educational tax estimates based on the Nigeria Tax Act 2025. This is NOT official tax advice. Always consult FIRS, state IRS, or certified tax professionals for official guidance. We are not liable for any errors, omissions, or decisions made based on information from this platform.', pcm: 'TaxForge NG provide educational tax estimate based on Nigeria Tax Act 2025. This no be official tax advice. Always consult FIRS, state IRS, or certified tax professional for official advice. We no dey liable for any error, wetin we miss, or decision wey you make based on information from this platform.', yo: 'TaxForge NG pèsè àwọn àmúdájú owó-orí fún ẹ̀kọ́ tí ó dá lórí Ìṣe Owó-orí Nàìjíríà 2025. Èyí kìí ṣe ìmọ̀ràn owó-orí gidi. Máa bá FIRS, IRS ìpínlẹ̀, tàbí àwọn ògbóntarìgì owó-orí tí a fọwọ́sí sọ̀rọ̀ fún ìtọ́sọ́nà gidi. A kò gbà gbèsè fún àṣìṣe kankan, àìsíkùn, tàbí ìpinnu tí a ṣe dá lórí ìròyìn láti pẹpẹ yìí.', ha: 'TaxForge NG yana ba da ƙididdigan haraji na ilimi dangane da Dokar Haraji ta Najeriya 2025. Wannan BA shawarar haraji ta hukuma BA CE. Koyaushe tuntubi FIRS, IRS na jiha, ko ƙwararrun haraji masu takaddun shaida don jagorancin hukuma. Ba mu da alhakin duk wani kuskure, abin da aka manta, ko yanke shawara da aka yi dangane da bayanai daga wannan dandali.', ig: 'TaxForge NG na-enye atụmatụ ụtụ mmụta dabere na Iwu Ụtụ Naịjirịa 2025. Nke a ABỤGHỊ ndụmọdụ ụtụ gọọmentị. Mgbe niile gbakwunyere FIRS, steeti IRS, ma ọ bụ ndị ọkachamara ụtụ enwetara asambodo maka nduzi gọọmentị. Anyị anaghị aza ọrụ maka njehie ọ bụla, ihe a hapụrụ, ma ọ bụ mkpebi emere dabere na ozi sitere na ikpo okwu a.' },
  'terms.termsOfService': { en: 'Terms of Service', pcm: 'Terms of Service', yo: 'Àwọn Òfin Iṣẹ́', ha: 'Sharuɗɗan Sabis', ig: 'Usoro Ọrụ' },
  'terms.acceptanceTitle': { en: 'Acceptance of Terms', pcm: 'Acceptance of Terms', yo: 'Ìgbàwọ́lé Àwọn Òfin', ha: 'Yarda da Sharuɗɗa', ig: 'Ịnakwere Usoro' },
  'terms.acceptanceText': { en: 'By accessing or using TaxForge NG ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.', pcm: 'If you dey access or use TaxForge NG ("the Service"), you agree say these Terms of Service go bind you. If you no agree to these terms, no use the Service.', yo: 'Nípasẹ̀ ríran tàbí lílo TaxForge NG ("Iṣẹ́ náà"), o gbà láti dè mọ́ àwọn Òfin Iṣẹ́ wọ̀nyí. Tí o kò bá gbà àwọn òfin wọ̀nyí, má ṣe lo Iṣẹ́ náà.', ha: 'Ta hanyar shiga ko amfani da TaxForge NG ("Sabis ɗin"), kun amince cewa za a ɗaure ku da waɗannan Sharuɗɗan Sabis. Idan ba ku amince da waɗannan sharuɗɗa ba, kada ku yi amfani da Sabis ɗin.', ig: 'Site na ịnweta ma ọ bụ iji TaxForge NG ("Ọrụ a"), ị kwenyere ka ejiri Usoro Ọrụ ndị a kee gị. Ọ bụrụ na ị kwenyeghị na usoro ndị a, ejila Ọrụ a.' },
  'terms.privacyPolicy': { en: 'Privacy Policy', pcm: 'Privacy Policy', yo: 'Ìlànà Àṣírí', ha: 'Manufar Sirri', ig: 'Amụma Nzuzo' },
  'terms.ndprCompliance': { en: 'NDPR Compliance', pcm: 'NDPR Compliance', yo: 'Ìbọ̀wọ̀ NDPR', ha: 'Biyayya ta NDPR', ig: 'Nkwekọrịta NDPR' },
  'terms.ndprText': { en: 'TaxForge NG complies with the Nigeria Data Protection Regulation (NDPR) 2019 and related data protection laws. We are committed to protecting your personal data and respecting your privacy rights.', pcm: 'TaxForge NG dey comply with Nigeria Data Protection Regulation (NDPR) 2019 and related data protection laws. We dey committed to protecting your personal data and respecting your privacy rights.', yo: 'TaxForge NG bọ̀wọ̀ fún Òfin Ìdáàbòbò Dátà Nàìjíríà (NDPR) 2019 àti àwọn òfin ìdáàbòbò dátà tí ó jọra. A ń ṣe àdéhùn láti dáàbò bo dátà ara ẹni rẹ àti láti bọ̀wọ̀ fún àwọn ẹ̀tọ́ àṣírí rẹ.', ha: 'TaxForge NG tana bin Dokar Kare Bayanai ta Najeriya (NDPR) 2019 da dokokin kare bayanai masu alaƙa. Mun sadaukar da kai wajen kare bayananku na sirri da mutunta haƙƙin sirri.', ig: 'TaxForge NG na-emezu Iwu Nchekwa Data Naịjirịa (NDPR) 2019 na iwu nchekwa data metụtara ya. Anyị ekwenyere na ichekwa data nkeonwe gị na-asọpụrụ ikike nzuzo gị.' },
  'terms.contactUs': { en: 'Contact Us', pcm: 'Contact Us', yo: 'Kàn Sí Wa', ha: 'Tuntuɓi Mu', ig: 'Kpọtụrụ Anyị' },
  'terms.contactText': { en: 'For questions about these terms, privacy concerns, or data requests, contact us at:', pcm: 'For questions about these terms, privacy concern, or data request, contact us at:', yo: 'Fún àwọn ìbéèrè nípa àwọn òfin wọ̀nyí, àwọn àníyàn àṣírí, tàbí àwọn ìbéèrè dátà, kàn sí wa ní:', ha: 'Don tambayoyi game da waɗannan sharuɗɗa, damuwar sirri, ko buƙatun bayanai, tuntuɓe mu a:', ig: 'Maka ajụjụ gbasara usoro ndị a, nchegbu nzuzo, ma ọ bụ arịrịọ data, kpọtụrụ anyị na:' },
  'terms.footer': { en: 'By using TaxForge NG, you acknowledge that you have read, understood, and agree to these Terms of Service and Privacy Policy.', pcm: 'By using TaxForge NG, you acknowledge say you don read, understand, and agree to these Terms of Service and Privacy Policy.', yo: 'Nípasẹ̀ lílo TaxForge NG, o jẹ́rìí pé o ti ka, mọ̀, àti gbà àwọn Òfin Iṣẹ́ wọ̀nyí àti Ìlànà Àṣírí.', ha: 'Ta hanyar amfani da TaxForge NG, kun yarda cewa kun karanta, kun fahimta, kuma kun amince da waɗannan Sharuɗɗan Sabis da Manufar Sirri.', ig: 'Site na iji TaxForge NG, ị na-ekwenye na ịgụọla, ghọtara, ma kwenye na Usoro Ọrụ ndị a na Amụma Nzuzo.' },

  // Phase 6: Dashboard date range labels
  'dashboard.dateRange.week': { en: 'This Week', pcm: 'This Week', yo: 'Ọ̀sẹ̀ Yìí', ha: 'Wannan Mako', ig: 'Izu A' },
  'dashboard.dateRange.month': { en: 'This Month', pcm: 'This Month', yo: 'Oṣù Yìí', ha: 'Wannan Wata', ig: 'Ọnwa A' },
  'dashboard.dateRange.quarter': { en: 'This Quarter', pcm: 'This Quarter', yo: 'Mẹ́tà Oṣù Yìí', ha: 'Wannan Kwata', ig: 'Nkeji Afọ A' },
  'dashboard.dateRange.year': { en: 'This Year', pcm: 'This Year', yo: 'Ọdún Yìí', ha: 'Wannan Shekara', ig: 'Afọ A' },

  // Phase 6: Expenses category labels
  'expenses.category.income': { en: 'Income', pcm: 'Income', yo: 'Owó-wíwọlé', ha: 'Kudin Shiga', ig: 'Ego Nnata' },
  'expenses.category.rent': { en: 'Rent & Office', pcm: 'Rent & Office', yo: 'Owo Ilé àti Ọ́fíìsì', ha: 'Haya da Ofis', ig: 'Ụgwọ Ụlọ na Ọfịs' },
  'expenses.category.transport': { en: 'Transport & Travel', pcm: 'Transport & Travel', yo: 'Ọkọ̀ àti Ìrìnàjò', ha: 'Sufuri da Tafiya', ig: 'Ụgbọ na Njem' },
  'expenses.category.marketing': { en: 'Marketing & Ads', pcm: 'Marketing & Ads', yo: 'Títa àti Àwọn Ìpolówó', ha: 'Tallace-tallace da Talla', ig: 'Ahịa na Mgbasa Ozi' },
  'expenses.category.salary': { en: 'Salaries & Wages', pcm: 'Salaries & Wages', yo: 'Owó Oṣù àti Owó Iṣẹ́', ha: 'Albashi da Ladabtarwa', ig: 'Ụgwọ Ọnwa na Ụgwọ Ọrụ' },
  'expenses.category.utilities': { en: 'Utilities', pcm: 'Utilities', yo: 'Àwọn Iṣẹ́ Àkànṣe', ha: 'Abubuwan Amfani', ig: 'Ihe Ọrụ' },
  'expenses.category.supplies': { en: 'Supplies & Equipment', pcm: 'Supplies & Equipment', yo: 'Àwọn Ohun Èlò àti Ẹ̀rọ', ha: 'Kayayyaki da Kayan Aiki', ig: 'Ngwa na Ihe Ọrụ' },
  'expenses.category.other': { en: 'Other Expenses', pcm: 'Other Expenses', yo: 'Inawo Mìíràn', ha: 'Sauran Kashewa', ig: 'Mmefu Ndị Ọzọ' },

  // Advisory Result (for new advisory keys only)
  'advisory.result.title': { en: 'Our Recommendation', pcm: 'Our Recommendation', yo: 'Ìmọ̀ràn Wa', ha: 'Shawarar Mu', ig: 'Ndụmọdụ Anyị' },
  'advisory.result.match': { en: 'Match', pcm: 'Match', yo: 'Ìbámu', ha: 'Dacewa', ig: 'Ndakọrịta' },
  'advisory.result.advantages': { en: 'Advantages', pcm: 'Advantages', yo: 'Àwọn Àǹfààní', ha: 'Fa\'idodi', ig: 'Uru' },
  'advisory.result.considerations': { en: 'Considerations', pcm: 'Considerations', yo: 'Àwọn Àkíyèsí', ha: 'Abubuwan da Za A Yi La\'akari', ig: 'Ihe A Ga-Atụle' },
  'advisory.result.taxAuthority': { en: 'Tax Authority', pcm: 'Tax Authority', yo: 'Àṣẹ Owó-orí', ha: 'Hukumar Haraji', ig: 'Ọchịchị Ụtụ' },
  'advisory.result.registrationCost': { en: 'Registration Cost', pcm: 'Registration Cost', yo: 'Owó Ìforúkọsílẹ̀', ha: 'Kuɗin Rajista', ig: 'Ego Ndebanye Aha' },
  'advisory.result.annualCompliance': { en: 'Annual Compliance', pcm: 'Annual Compliance', yo: 'Ìbọ̀wọ̀ Ọdún', ha: 'Biyayya ta Shekara', ig: 'Nkwekọrịta Afọ' },
  'advisory.result.calculateTaxes': { en: 'Calculate Your Taxes', pcm: 'Calculate Your Taxes', yo: 'Ṣe Ìṣirò Owó-orí Rẹ', ha: 'Ƙididdige Harajinku', ig: 'Gbakọọ Ụtụ Gị' },
  'advisory.result.startOver': { en: 'Start Over', pcm: 'Start Over', yo: 'Bẹ̀rẹ̀ Láti Ìbẹ̀rẹ̀', ha: 'Sake Farawa', ig: 'Malitegharịa' },
  'advisory.result.company.title': { en: 'Limited Liability Company (LTD)', pcm: 'Limited Liability Company (LTD)', yo: 'Ilé-iṣẹ́ Olùdáàbòbò Tó Lópin (LTD)', ha: 'Kamfanin Iyakancewar Alhakin (LTD)', ig: 'Ụlọ Ọrụ Nwere Oke (LTD)' },
  'advisory.result.company.summary': { en: 'Based on your responses, a Limited Liability Company offers better protection and growth potential for your business.', pcm: 'Based on your answer dem, Limited Liability Company go give your business better protection and growth.', yo: 'Dá lórí àwọn ìdáhùn rẹ, Ilé-iṣẹ́ Olùdáàbòbò Tó Lópin pèsè àbò tó dára jù àti àǹfààní ìdàgbàsókè fún iṣẹ́ rẹ.', ha: 'Dangane da amsoshinku, Kamfanin Iyakancewar Alhakin yana ba da kariya mafi kyau da damar ci gaba ga kasuwancinku.', ig: 'Dabere na azịza gị, Ụlọ Ọrụ Nwere Oke na-enye nchekwa ka mma na ohere uto maka azụmahịa gị.' },
  'advisory.result.company.pros.liability': { en: 'Limited personal liability - your personal assets are protected', pcm: 'Limited personal liability - your personal property dey protected', yo: 'Ìdáàbòbò ara ẹni tó lópin - a dáàbò bo àwọn ohun-ìní ara ẹni rẹ', ha: 'Iyakancewar alhakin kai - an kare dukiyar ku', ig: 'Ọrụ nkeonwe nwere oke - echekwara ihe onwunwe nkeonwe gị' },
  'advisory.result.company.pros.credibility': { en: 'Better credibility with banks and potential investors', pcm: 'Better credibility with banks and potential investors', yo: 'Ìgbẹ́kẹ̀lé tó dára jù pẹ̀lú àwọn ilé-ìfowópamọ́ àti àwọn olùdókòwò tó lè ṣẹlẹ̀', ha: 'Ingantacciyar aminci tare da bankuna da masu saka jari', ig: 'Ntụkwasị obi ka mma na ụlọ akụ na ndị ga-etinye ego' },
  'advisory.result.company.pros.capital': { en: 'Easier to raise capital and bring in partners', pcm: 'E dey easier to raise capital and bring in partners', yo: 'Ó rọrùn láti gbé owó-ìṣúra sókè àti láti mú àwọn alájọṣepọ̀ wá', ha: 'Ya fi sauƙi don tara jari da kawo abokan aiki', ig: 'Ọ dị mfe ịchịkọta ego na ịkpọta ndị mmekọ' },
  'advisory.result.company.pros.citBenefit': { en: 'Can benefit from 0% CIT if qualifying as small company (2026 rules)', pcm: 'Fit benefit from 0% CIT if e qualify as small company (2026 rules)', yo: 'Lè ní àǹfààní láti 0% CIT tí ó bá yẹ gẹ́gẹ́ bí ilé-iṣẹ́ kékeré (àwọn òfin 2026)', ha: 'Za a iya amfana da 0% CIT idan ya cancanci a matsayin ƙaramin kamfani (dokokin 2026)', ig: 'Nwere ike ịnweta uru sitere na 0% CIT ma ọ bụrụ na ọ tozuru dị ka ụlọ ọrụ obere (iwu 2026)' },
  'advisory.result.company.pros.perpetual': { en: 'Perpetual succession - company continues beyond founders', pcm: 'Perpetual succession - company go continue beyond founders', yo: 'Ìtẹ̀síwájú títí láé - ilé-iṣẹ́ máa ń tẹ̀síwájú léyìí àwọn olùdásílẹ̀', ha: 'Ci gaba na har abada - kamfani yana ci gaba bayan masu kafa', ig: 'Ịnọchi ọnọdụ ebighị ebi - ụlọ ọrụ na-aga n\'ihu karịa ndị guzobere ya' },
  'advisory.result.company.cons.registration': { en: 'Higher registration costs (₦100,000 - ₦500,000+)', pcm: 'Higher registration cost (₦100,000 - ₦500,000+)', yo: 'Owó ìforúkọsílẹ̀ tó ga (₦100,000 - ₦500,000+)', ha: 'Yawan kuɗin rajista (₦100,000 - ₦500,000+)', ig: 'Ego ndebanye aha dị elu (₦100,000 - ₦500,000+)' },
  'advisory.result.company.cons.compliance': { en: 'More compliance requirements and paperwork', pcm: 'More compliance requirement and paperwork', yo: 'Àwọn ìlànà ìbọ̀wọ̀ àti iṣẹ́ ìwé púpọ̀ sí i', ha: 'Ƙarin buƙatun biyayya da takaddun aiki', ig: 'Ihe a chọrọ nkwekọrịta na akwụkwọ ọrụ karịa' },
  'advisory.result.company.cons.annualReturns': { en: 'Annual returns filing with CAC mandatory', pcm: 'Annual returns filing with CAC dey compulsory', yo: 'Fífa àwọn ìpadàbọ̀ ọdún sí CAC jẹ́ dandan', ha: 'Fayil ɗin dawowa na shekara tare da CAC tilas ne', ig: 'Ịdekọ nlọghachi afọ na CAC dị oke mkpa' },
  'advisory.result.company.cons.audit': { en: 'Audit requirements for certain companies', pcm: 'Audit requirements for some companies', yo: 'Àwọn ìlànà àyẹ̀wò fún àwọn ilé-iṣẹ́ kan', ha: 'Buƙatun bincike ga wasu kamfanoni', ig: 'Ihe achọrọ nyocha maka ụfọdụ ụlọ ọrụ' },
  'advisory.result.company.taxAuthority': { en: 'Federal Inland Revenue Service (FIRS)', pcm: 'Federal Inland Revenue Service (FIRS)', yo: 'Iṣẹ́ Owó-orí Abẹ́lé Federal (FIRS)', ha: 'Hukumar Harajin Cikin Gida ta Tarayya (FIRS)', ig: 'Ọrụ Ego Ụtụ Mba Gọọmentị Etiti (FIRS)' },
  'advisory.result.company.costs.registration': { en: '₦100,000 - ₦500,000', pcm: '₦100,000 - ₦500,000', yo: '₦100,000 - ₦500,000', ha: '₦100,000 - ₦500,000', ig: '₦100,000 - ₦500,000' },
  'advisory.result.company.costs.annual': { en: '₦50,000 - ₦200,000 (compliance)', pcm: '₦50,000 - ₦200,000 (compliance)', yo: '₦50,000 - ₦200,000 (ìbọ̀wọ̀)', ha: '₦50,000 - ₦200,000 (biyayya)', ig: '₦50,000 - ₦200,000 (nkwekọrịta)' },
  'advisory.result.businessName.title': { en: 'Business Name (Sole Proprietorship/Partnership)', pcm: 'Business Name (Sole Proprietorship/Partnership)', yo: 'Orúkọ Iṣẹ́ (Ẹni-nìkan/Àjọṣepọ̀)', ha: 'Sunan Kasuwanci (Mallakar Kai/Haɗin Gwiwa)', ig: 'Aha Azụmahịa (Onwe Nwe/Ọnụ Ọgụ)' },
  'advisory.result.businessName.summary': { en: 'A Business Name registration is simpler and more cost-effective for your current business needs.', pcm: 'Business Name registration na simpler and cost less for your current business needs.', yo: 'Ìforúkọsílẹ̀ Orúkọ Iṣẹ́ rọrùn jù àti pé ó san owó fún àwọn àìní iṣẹ́ rẹ lọ́wọ́lọ́wọ́.', ha: 'Rajistar Sunan Kasuwanci ta fi sauƙi kuma tana da araha don buƙatun kasuwancinku na yanzu.', ig: 'Ndebanye aha Aha Azụmahịa dị mfe ma dịkwuo ọnụ ala maka mkpa azụmahịa gị ugbu a.' },
  'advisory.result.businessName.pros.lowCost': { en: 'Lower registration costs (₦10,000 - ₦25,000)', pcm: 'Lower registration cost (₦10,000 - ₦25,000)', yo: 'Owó ìforúkọsílẹ̀ tó dín (₦10,000 - ₦25,000)', ha: 'Ƙarancin kuɗin rajista (₦10,000 - ₦25,000)', ig: 'Ego ndebanye aha dị ala (₦10,000 - ₦25,000)' },
  'advisory.result.businessName.pros.simpler': { en: 'Simpler compliance requirements', pcm: 'Simpler compliance requirements', yo: 'Àwọn ìlànà ìbọ̀wọ̀ tó rọrùn', ha: 'Buƙatun biyayya mafi sauƙi', ig: 'Ihe achọrọ nkwekọrịta dị mfe' },
  'advisory.result.businessName.pros.control': { en: 'Direct control over business decisions', pcm: 'Direct control over business decisions', yo: 'Ìṣàkóso tààràtà lórí àwọn ìpinnu iṣẹ́', ha: 'Iko kai tsaye akan yanke shawara na kasuwanci', ig: 'Njikwa ozugbo n\'elu mkpebi azụmahịa' },
  'advisory.result.businessName.pros.setup': { en: 'Easier to set up and maintain', pcm: 'Easier to set up and maintain', yo: 'Ó rọrùn láti ṣètò àti láti ṣe àbójútó', ha: 'Ya fi sauƙi don saita da kiyayewa', ig: 'Ọ dị mfe ịhazi na ịchekwa' },
  'advisory.result.businessName.pros.taxRates': { en: 'Income taxed at personal rates with relief options', pcm: 'Income taxed at personal rates with relief options', yo: 'A ń gba owó-orí owó-wíwọlé ní ìwọ̀n ara ẹni pẹ̀lú àwọn àṣàyàn ìrànlọ́wọ́', ha: 'Ana haraji kuɗin shiga a ƙimar mutum tare da zaɓuɓɓukan sauƙaƙe', ig: 'A na-atụ ụtụ ego nnata n\'ọnụ ego nkeonwe yana enwe nhọrọ nnapụta' },
  'advisory.result.businessName.cons.liability': { en: 'Unlimited personal liability - personal assets at risk', pcm: 'Unlimited personal liability - personal property dey at risk', yo: 'Ìdáàbòbò ara ẹni àìlópin - àwọn ohun-ìní ara ẹni wà nínú ewu', ha: 'Alhakin kai mara iyaka - dukiyar mutum tana cikin haɗari', ig: 'Ọrụ nkeonwe enweghị oke - ihe onwunwe nkeonwe nọ n\'ihe ize ndụ' },
  'advisory.result.businessName.cons.funding': { en: 'Harder to raise external funding', pcm: 'E dey harder to raise external funding', yo: 'Ó ṣòro láti gbé owó-ìṣúra láti òde', ha: 'Ya fi wahala don tara kuɗi daga waje', ig: 'Ọ sịrị ike ịchịkọta ego sitere n\'èzí' },
  'advisory.result.businessName.cons.credibility': { en: 'May not be taken as seriously by larger clients', pcm: 'Bigger clients fit no take am serious', yo: 'Àwọn oníbàárà ńlá lè má ṣe mú un ní pàtàkì', ha: 'Manyan abokan ciniki bazai ɗauki ta da muhimmanci ba', ig: 'Ndị ahịa buru ibu nwere ike ghara ịnara ya n\'ụzọ ziri ezi' },
  'advisory.result.businessName.cons.lifespan': { en: 'Business tied to owner\'s lifespan', pcm: 'Business tied to owner lifespan', yo: 'Iṣẹ́ so mọ́ ọjọ́-orí olówó', ha: 'Kasuwanci yana ɗaure da rayuwar mai shi', ig: 'Azụmahịa jikọtara na ndụ onye nwe ya' },
  'advisory.result.businessName.taxAuthority': { en: 'State Internal Revenue Service (SIRS)', pcm: 'State Internal Revenue Service (SIRS)', yo: 'Iṣẹ́ Owó-orí Abẹ́lé Ìpínlẹ̀ (SIRS)', ha: 'Hukumar Harajin Cikin Gida ta Jiha (SIRS)', ig: 'Ọrụ Ego Ụtụ N\'ime Steeti (SIRS)' },
  'advisory.result.businessName.costs.registration': { en: '₦10,000 - ₦25,000', pcm: '₦10,000 - ₦25,000', yo: '₦10,000 - ₦25,000', ha: '₦10,000 - ₦25,000', ig: '₦10,000 - ₦25,000' },
  'advisory.result.businessName.costs.annual': { en: '₦5,000 - ₦20,000 (renewal)', pcm: '₦5,000 - ₦20,000 (renewal)', yo: '₦5,000 - ₦20,000 (ìṣàtúnṣe)', ha: '₦5,000 - ₦20,000 (sabuntawa)', ig: '₦5,000 - ₦20,000 (mmegharị)' },
  'advisory.questions.hasPartners.question': { en: 'Will you have business partners or co-founders?', pcm: 'You go get business partners or co-founders?', yo: 'Ṣé o máa ní àwọn alájọṣepọ̀ iṣẹ́ tàbí àwọn alábàáṣiṣẹ́pọ̀?', ha: 'Za ku sami abokan kasuwanci ko masu haɗa hannu?', ig: 'Ị ga-enwe ndị mmekọ azụmahịa ma ọ bụ ndị guzobere ọnụ?' },
  'advisory.questions.hasPartners.description': { en: 'This affects the legal structure and ownership documentation required.', pcm: 'This go affect the legal structure and ownership document wey dey required.', yo: 'Èyí máa kan ètò òfin àti ìwé àṣẹ ìní tí a nílò.', ha: 'Wannan yana shafar tsarin shari\'a da takardar mallakar da ake buƙata.', ig: 'Nke a na-emetụta usoro iwu na akwụkwọ nwe nke achọrọ.' },
  'advisory.questions.hasPartners.yesPartners': { en: 'Yes, I\'ll have partners', pcm: 'Yes, I go get partners', yo: 'Bẹ́ẹ̀ni, Màá ní àwọn alájọṣepọ̀', ha: 'Eh, zan sami abokan aiki', ig: 'Ee, Aga m enwe ndị mmekọ' },
  'advisory.questions.hasPartners.noSolo': { en: 'No, I\'m going solo', pcm: 'No, na me alone', yo: 'Rárá, Màá ṣe fúnra mi', ha: 'A\'a, zan yi shi ni kaɗai', ig: 'Mba, Ana m aga naanị m' },
  'advisory.questions.expectedTurnover.question': { en: 'What\'s your expected annual turnover?', pcm: 'How much money you expect to make for year?', yo: 'Owó mélòó ló yẹ kí o wọlé lọ́dún?', ha: 'Menene kuɗin da kuke tsammanin shekara?', ig: 'Kedu ego ị na-atụ anya afọ?' },
  'advisory.questions.expectedTurnover.description': { en: 'This determines tax obligations and whether VAT registration is required.', pcm: 'This go determine tax obligation and whether VAT registration dey required.', yo: 'Èyí máa pinnu àwọn ìfaramọ́ owó-orí àti bóyá ìforúkọsílẹ̀ VAT ní a nílò.', ha: 'Wannan yana ƙayyade wajibcin haraji da ko ana buƙatar rajistar VAT.', ig: 'Nke a na-ekpebi ọrụ ụtụ ma ọ bụrụ na achọrọ ndebanye aha VAT.' },
  'advisory.questions.expectedTurnover.under25m': { en: 'Under ₦25 million', pcm: 'Under ₦25 million', yo: 'Lábẹ́ ₦25 mílíọ̀nù', ha: 'Ƙasa da ₦25 miliyan', ig: 'N\'okpuru ₦25 nde' },
  'advisory.questions.expectedTurnover.25mTo50m': { en: '₦25m - ₦50 million', pcm: '₦25m - ₦50 million', yo: '₦25m - ₦50 mílíọ̀nù', ha: '₦25m - ₦50 miliyan', ig: '₦25m - ₦50 nde' },
  'advisory.questions.expectedTurnover.over50m': { en: 'Over ₦50 million', pcm: 'Over ₦50 million', yo: 'Léyìí ₦50 mílíọ̀nù', ha: 'Fiye da ₦50 miliyan', ig: 'Karịrị ₦50 nde' },
  'advisory.questions.needsAssetProtection.question': { en: 'Do you need protection for personal assets?', pcm: 'You need protection for your personal property?', yo: 'Ṣé o nílò àbò fún àwọn ohun-ìní ara ẹni rẹ?', ha: 'Kuna buƙatar kariya ga dukiya?', ig: 'Ị chọrọ nchedo maka ihe onwunwe nkeonwe?' },
  'advisory.questions.needsAssetProtection.description': { en: 'Limited liability separates personal assets from business debts and lawsuits.', pcm: 'Limited liability go separate your personal property from business debt and lawsuit.', yo: 'Ìdáàbòbò tó lópin máa yà àwọn ohun-ìní ara ẹni kúrò lọ́wọ́ gbèsè iṣẹ́ àti ẹjọ́.', ha: 'Iyakancewar alhakin tana raba dukiyar kai daga bashin kasuwanci da kararraki.', ig: 'Ọrụ nwere oke na-ekewa ihe onwunwe onwe site na ụgwọ azụmahịa na ikpe iwu.' },
  'advisory.questions.needsAssetProtection.yesImportant': { en: 'Yes, this is important', pcm: 'Yes, this one important', yo: 'Bẹ́ẹ̀ni, èyí ṣe pàtàkì', ha: 'Eh, wannan yana da mahimmanci', ig: 'Ee, nke a dị mkpa' },
  'advisory.questions.needsAssetProtection.notPriority': { en: 'Not a priority', pcm: 'No be priority', yo: 'Kìí ṣe pàtàkì', ha: 'Ba fifiko ba ne', ig: 'Ọ bụghị mkpa' },
  'advisory.questions.ownsHome.question': { en: 'Do you own a home or significant personal assets?', pcm: 'You own house or significant personal property?', yo: 'Ṣé o ní ilé tàbí àwọn ohun-ìní ara ẹni pàtàkì?', ha: 'Kuna da gida ko dukiya mai muhimmanci?', ig: 'Ị nwere ụlọ ma ọ bụ ihe onwunwe nkeonwe dị oke mkpa?' },
  'advisory.questions.ownsHome.description': { en: 'Personal assets could be at risk without proper business structure.', pcm: 'Personal property fit dey at risk if you no get proper business structure.', yo: 'Àwọn ohun-ìní ara ẹni lè wà nínú ewu láìsí ètò iṣẹ́ tó tọ́.', ha: 'Dukiyar mutum na iya kasancewa cikin haɗari ba tare da tsarin kasuwanci daidai ba.', ig: 'Ihe onwunwe nkeonwe nwere ike ịnọ n\'ihe ize ndụ na-enweghị usoro azụmahịa kwesịrị ekwesị.' },
  'advisory.questions.ownsHome.yesAssets': { en: 'Yes, I have assets to protect', pcm: 'Yes, I get property to protect', yo: 'Bẹ́ẹ̀ni, Mo ní àwọn ohun-ìní láti dáàbò bò', ha: 'Eh, ina da dukiya don kariya', ig: 'Ee, Enwere m ihe onwunwe ịchekwa' },
  'advisory.questions.ownsHome.noSignificant': { en: 'No significant assets', pcm: 'No significant property', yo: 'Kò sí àwọn ohun-ìní pàtàkì', ha: 'Babu dukiya mai muhimmanci', ig: 'Enweghị ihe onwunwe dị oke mkpa' },
  'advisory.questions.isProfessionalService.question': { en: 'Is this a professional service business?', pcm: 'Na professional service business you wan do?', yo: 'Ṣé iṣẹ́ ọjọ́gbọ́n ni èyí?', ha: 'Wannan kasuwancin sabis na ƙwararru ne?', ig: 'Nke a ọ bụ azụmahịa ọrụ ọkachamara?' },
  'advisory.questions.isProfessionalService.description': { en: 'Examples: Law firm, consulting, accounting, medical practice.', pcm: 'Examples: Law firm, consulting, accounting, medical practice.', yo: 'Àpẹẹrẹ: Ilé-iṣẹ́ agbẹjọ́rò, ìgbànímọ̀ràn, ìṣirò, àdáṣe ìṣègùn.', ha: 'Misalai: Ofishin lauya, ba da shawara, lissafi, aikin likita.', ig: 'Ihe atụ: Ụlọ ọrụ iwu, ịdụ ọdụ, ịgụ ego, ọrụ ahụike.' },
  'advisory.questions.isProfessionalService.yesProfessional': { en: 'Yes, professional services', pcm: 'Yes, professional services', yo: 'Bẹ́ẹ̀ni, iṣẹ́ ọjọ́gbọ́n', ha: 'Eh, sabis na ƙwararru', ig: 'Ee, ọrụ ọkachamara' },
  'advisory.questions.isProfessionalService.noProduct': { en: 'No, product/other service', pcm: 'No, product/other service', yo: 'Rárá, ọjà/iṣẹ́ mìíràn', ha: 'A\'a, kaya/wani sabis', ig: 'Mba, ngwaahịa/ọrụ ọzọ' },
  'advisory.questions.hasSignificantAssets.question': { en: 'Will you have significant business equipment or assets?', pcm: 'You go get significant business equipment or assets?', yo: 'Ṣé o máa ní ohun èlò iṣẹ́ tàbí àwọn ohun-ìní pàtàkì?', ha: 'Za ku sami kayan aiki ko dukiyar kasuwanci masu yawa?', ig: 'Ị ga-enwe ngwa ọrụ azụmahịa ma ọ bụ akụ dị oke mkpa?' },
  'advisory.questions.hasSignificantAssets.description': { en: 'Fixed assets over ₦250m affect small company tax status.', pcm: 'Fixed assets over ₦250m go affect small company tax status.', yo: 'Àwọn ohun-ìní tó tẹ́lẹ̀ lé ní ₦250m máa kan ipò owó-orí ilé-iṣẹ́ kékeré.', ha: 'Dukiyoyin da suka wuce ₦250m suna shafar matsayin harajin ƙaramin kamfani.', ig: 'Akụ eji eme ihe karịrị ₦250m na-emetụta ọnọdụ ụtụ ụlọ ọrụ obere.' },
  'advisory.questions.hasSignificantAssets.yesSignificant': { en: 'Yes, significant assets', pcm: 'Yes, significant assets', yo: 'Bẹ́ẹ̀ni, àwọn ohun-ìní pàtàkì', ha: 'Eh, dukiya mai yawa', ig: 'Ee, akụ dị oke mkpa' },
  'advisory.questions.hasSignificantAssets.minimal': { en: 'Minimal fixed assets', pcm: 'Minimal fixed assets', yo: 'Àwọn ohun-ìní tó tẹ́lẹ̀ díẹ̀', ha: 'Ƙananan dukiya abin da aka gyara', ig: 'Akụ eji eme ihe dị ntakịrị' },
  'advisory.questions.planToSeekInvestment.question': { en: 'Do you plan to seek investors or loans?', pcm: 'You plan to look for investors or loans?', yo: 'Ṣé o gbèrò láti wá àwọn olùdókòwò tàbí àwìn?', ha: 'Kuna shirin neman masu saka jari ko lamuni?', ig: 'Ị na-eme atụmatụ ịchọ ndị ga-etinye ego ma ọ bụ ego ibinye?' },
  'advisory.questions.planToSeekInvestment.description': { en: 'LTD companies are preferred by investors and easier to raise capital.', pcm: 'Investors prefer LTD companies and e dey easier to raise capital.', yo: 'Àwọn olùdókòwò fẹ́ràn àwọn ilé-iṣẹ́ LTD àti pé ó rọrùn láti gbé owó-ìṣúra sókè.', ha: 'Masu saka jari sun fi son kamfanonin LTD kuma ya fi sauƙi don tara jari.', ig: 'Ndị na-etinye ego na-ahọrọ ụlọ ọrụ LTD ma ọ dịkwa mfe ịchịkọta ego.' },
  'advisory.questions.planToSeekInvestment.yesFunding': { en: 'Yes, will seek funding', pcm: 'Yes, go look for funding', yo: 'Bẹ́ẹ̀ni, màá wá owó-ìṣúra', ha: 'Eh, zan nemi kuɗi', ig: 'Ee, aga m achọ ego' },
  'advisory.questions.planToSeekInvestment.selfFunded': { en: 'Self-funded for now', pcm: 'Na my money I go use for now', yo: 'Owó ara mi fún ìsinsin yìí', ha: 'Kai na biyan kuɗi a yanzu', ig: 'Ego nke m maka ugbu a' },

  // IP Whitelist Manager
  'security.ipWhitelist.title': { en: 'IP Address Whitelist', pcm: 'IP Address Whitelist', yo: 'Àtòjọ IP Tí A Fọwọ́sí', ha: 'Jerin IP da aka Yarda', ig: 'Ndepụta IP Akwadoro' },
  'security.ipWhitelist.description': { en: 'Restrict logins to specific IP addresses or ranges', pcm: 'Restrict login to specific IP address or range', yo: 'Dènà ìwọlé sí àwọn àdírẹ́sì IP tàbí ẹ̀ka kan pàtó', ha: 'Taƙaita shiga zuwa adireshin IP ko kewayon musamman', ig: 'Gbochie ịbanye na adreesị IP maọbụ oke akọwapụtara' },
  'security.ipWhitelist.enabled': { en: 'Enabled', pcm: 'Enabled', yo: 'Ti Mú Ṣiṣẹ́', ha: 'An Kunna', ig: 'Emepere' },
  'security.ipWhitelist.disabled': { en: 'Disabled', pcm: 'Disabled', yo: 'Ti Dá Dúró', ha: 'An Kashe', ig: 'Emechiri' },
  'security.ipWhitelist.yourIp': { en: 'Your IP:', pcm: 'Your IP:', yo: 'IP Rẹ:', ha: 'IP Dinka:', ig: 'IP Gị:' },
  'security.ipWhitelist.whitelisted': { en: 'Whitelisted', pcm: 'Whitelisted', yo: 'Ti Wà Nínú Àtòjọ', ha: 'An Yarda', ig: 'E debanyere' },
  'security.ipWhitelist.notWhitelisted': { en: 'Not whitelisted', pcm: 'Not whitelisted', yo: 'Kò Wà Nínú Àtòjọ', ha: 'Ba a Yarda Ba', ig: 'E debanyeghị' },
  'security.ipWhitelist.addThisIp': { en: 'Add This IP', pcm: 'Add This IP', yo: 'Fi IP Yìí Kún', ha: 'Ƙara Wannan IP', ig: 'Tinye IP A' },
  'security.ipWhitelist.noActiveIps': { en: 'No active IP addresses whitelisted', pcm: 'No active IP address whitelisted', yo: 'Kò sí àdírẹ́sì IP tó ń ṣiṣẹ́ nínú àtòjọ', ha: 'Babu adireshin IP masu aiki a cikin jerin', ig: 'Enweghị adreesị IP na-arụ ọrụ e debanyere' },
  'security.ipWhitelist.lockoutWarning': { en: "You won't be able to log in from any IP address. Add at least one IP to avoid being locked out.", pcm: "You no go fit login from any IP address. Add at least one IP to avoid lockout.", yo: 'O kò lè wọlé láti àdírẹ́sì IP eyíkéyìí. Fi ó kéré jù IP kan kún láti yẹra fún títìí.', ha: "Ba za ku iya shiga daga kowane adireshin IP ba. Ƙara aƙalla IP ɗaya don guje wa kullewa.", ig: "Ị gaghị enwe ike ịbanye site na adreesị IP ọ bụla. Tinye opekata mpe IP otu iji zere ikpọchi." },
  'security.ipWhitelist.addIpAddress': { en: 'Add IP Address', pcm: 'Add IP Address', yo: 'Fi Àdírẹ́sì IP Kún', ha: 'Ƙara Adireshin IP', ig: 'Tinye Adreesị IP' },
  'security.ipWhitelist.export': { en: 'Export', pcm: 'Export', yo: 'Gbé Jáde', ha: 'Fitar', ig: 'Mbupụ' },
  'security.ipWhitelist.import': { en: 'Import', pcm: 'Import', yo: 'Gbé Wọlé', ha: 'Shigowa', ig: 'Ịbubata' },
  'security.ipWhitelist.importing': { en: 'Importing...', pcm: 'Importing...', yo: 'Ń Gbé Wọlé...', ha: 'Ana Shigowa...', ig: 'Na-ebubata...' },
  'security.ipWhitelist.whitelistedIps': { en: 'Whitelisted IP Addresses', pcm: 'Whitelisted IP Addresses', yo: 'Àwọn Àdírẹ́sì IP Tí A Fọwọ́sí', ha: 'Adiresoshin IP da aka Yarda', ig: 'Adreesị IP E debanyere' },
  'security.ipWhitelist.noEntries': { en: 'No IP addresses whitelisted', pcm: 'No IP address whitelisted', yo: 'Kò sí àdírẹ́sì IP tí a fi sínú àtòjọ', ha: 'Babu adireshin IP da aka yarda', ig: 'Enweghị adreesị IP e debanyere' },
  'security.ipWhitelist.noEntriesDesc': { en: 'Add IP addresses above to restrict access to your account', pcm: 'Add IP address above to restrict access to your account', yo: 'Fi àwọn àdírẹ́sì IP kún lókè láti dènà àsìkò sí àkọsílẹ̀ rẹ', ha: 'Ƙara adireshin IP a sama don taƙaita samun damar asusun ku', ig: 'Tinye adreesị IP n\'elu iji gbochie ohere ịnweta akaụntụ gị' },
  'security.ipWhitelist.active': { en: 'Active', pcm: 'Active', yo: 'Ń Ṣiṣẹ́', ha: 'Yana Aiki', ig: 'Na-arụ Ọrụ' },
  'security.ipWhitelist.inactive': { en: 'Inactive', pcm: 'Inactive', yo: 'Kò Ń Ṣiṣẹ́', ha: 'Ba Ya Aiki', ig: 'Anaghị Arụ Ọrụ' },
  'security.ipWhitelist.confirmEnable': { en: 'Confirm Enable IP Whitelist', pcm: 'Confirm Enable IP Whitelist', yo: 'Jẹ́rìísí Mímú Àtòjọ IP Ṣiṣẹ́', ha: 'Tabbatar da Kunna Jerin IP', ig: 'Kwado Ime ka Ndepụta IP Rụọ Ọrụ' },
  'security.ipWhitelist.confirmEnableDesc': { en: "Your current IP is not in the whitelist. Enabling this feature may lock you out of your account.", pcm: "Your current IP no dey inside whitelist. If you enable this feature e fit lock you out of your account.", yo: 'IP rẹ lọ́wọ́lọ́wọ́ kò wà nínú àtòjọ. Mímú ẹ̀yà yìí ṣiṣẹ́ lè tìí ọ jáde kúrò nínú àkọsílẹ̀ rẹ.', ha: 'IP dinka na yanzu ba ya cikin jerin. Kunna wannan fasalin na iya kulle ku daga asusun ku.', ig: 'IP gị ugbu a anọghị na ndepụta. Ime ka atụmatụ a rụọ ọrụ nwere ike ikpọchiri gị site na akaụntụ gị.' },
  'security.ipWhitelist.addCurrentFirst': { en: 'Add your current IP first before enabling.', pcm: 'Add your current IP first before you enable.', yo: 'Fi IP rẹ lọ́wọ́lọ́wọ́ kún ṣáájú kí o tó mú u ṣiṣẹ́.', ha: 'Ƙara IP dinka na yanzu da farko kafin kunna.', ig: 'Tinye IP gị ugbu a mbụ tupu imee ka ọ rụọ ọrụ.' },
  'security.ipWhitelist.proceed': { en: 'Enable Anyway', pcm: 'Enable Anyway', yo: 'Mú Ṣiṣẹ́ Bí Ó Ti Wù Kó Rí', ha: 'Kunna Duk Da Haka', ig: 'Mee Ka Ọ Rụọ Ọrụ N\'agbanyeghị' },
  'security.ipWhitelist.addIp': { en: 'Add IP to Whitelist', pcm: 'Add IP to Whitelist', yo: 'Fi IP Kún Àtòjọ', ha: 'Ƙara IP zuwa Jerin', ig: 'Tinye IP na Ndepụta' },
  'security.ipWhitelist.addIpDesc': { en: 'Enter an IP address, CIDR range, or wildcard pattern', pcm: 'Enter IP address, CIDR range, or wildcard pattern', yo: 'Tẹ àdírẹ́sì IP, ẹ̀ka CIDR, tàbí àpẹẹrẹ wildcard', ha: 'Shigar da adireshin IP, kewayon CIDR, ko tsarin wildcard', ig: 'Tinye adreesị IP, oke CIDR, maọbụ ụdị wildcard' },
  'security.ipWhitelist.ipAddressOrRange': { en: 'IP Address or Range', pcm: 'IP Address or Range', yo: 'Àdírẹ́sì IP tàbí Ẹ̀ka', ha: 'Adireshin IP ko Kewaya', ig: 'Adreesị IP maọbụ Oke' },
  'security.ipWhitelist.ipPlaceholder': { en: 'e.g., 192.168.1.1 or 192.168.1.0/24', pcm: 'e.g., 192.168.1.1 or 192.168.1.0/24', yo: 'f.a., 192.168.1.1 tàbí 192.168.1.0/24', ha: 'm.m., 192.168.1.1 ko 192.168.1.0/24', ig: 'd.o., 192.168.1.1 maọbụ 192.168.1.0/24' },
  'security.ipWhitelist.descriptionLabel': { en: 'Description (optional)', pcm: 'Description (optional)', yo: 'Àpèjúwe (àṣàyàn)', ha: 'Bayani (zaɓi)', ig: 'Nkọwa (nhọrọ)' },
  'security.ipWhitelist.descriptionPlaceholder': { en: 'e.g., Office, Home, VPN', pcm: 'e.g., Office, Home, VPN', yo: 'f.a., Ọ́fíìsì, Ilé, VPN', ha: 'm.m., Ofis, Gida, VPN', ig: 'd.o., Ọfịs, Ụlọ, VPN' },
  'security.ipWhitelist.supportedFormats': { en: 'Supported formats', pcm: 'Supported formats', yo: 'Àwọn ọ̀nà tí a ṣètìlẹ́yìn fún', ha: 'Tsarin da ake tallafawa', ig: 'Ụdị a na-akwado' },
  'security.ipWhitelist.exactIp': { en: 'Exact IP', pcm: 'Exact IP', yo: 'IP Gangan', ha: 'IP Daidai', ig: 'IP Kpọmkwem' },
  'security.ipWhitelist.cidrRange': { en: 'CIDR range', pcm: 'CIDR range', yo: 'Ẹ̀ka CIDR', ha: 'Kewayon CIDR', ig: 'Oke CIDR' },
  'security.ipWhitelist.wildcard': { en: 'Wildcard', pcm: 'Wildcard', yo: 'Àmì Ìdáwọ́lé', ha: 'Wildcard', ig: 'Wildcard' },
  'security.ipWhitelist.addToWhitelist': { en: 'Add to Whitelist', pcm: 'Add to Whitelist', yo: 'Fi Kún Àtòjọ', ha: 'Ƙara zuwa Jeri', ig: 'Tinye na Ndepụta' },
  'security.ipWhitelist.enableTitle': { en: 'Enable IP Whitelist?', pcm: 'Enable IP Whitelist?', yo: 'Ṣé O Fẹ́ Mú Àtòjọ IP Ṣiṣẹ́?', ha: 'Kunna Jerin IP?', ig: 'Mee Ka Ndepụta IP Rụọ Ọrụ?' },
  'security.ipWhitelist.enableDesc': { en: "You're about to enable IP whitelisting without adding your current IP address.", pcm: "You wan enable IP whitelisting without adding your current IP address.", yo: "O fẹ́ mú àtòjọ IP ṣiṣẹ́ láìsí fífi àdírẹ́sì IP rẹ lọ́wọ́lọ́wọ́ kún.", ha: "Kuna shirin kunna jerin IP ba tare da ƙara adireshin IP ɗinku na yanzu ba.", ig: "Ị chọrọ ịkwanye ndepụta IP na-etinyeghị adreesị IP gị ugbu a." },
  'security.ipWhitelist.warningTitle': { en: 'Warning: You may lock yourself out', pcm: 'Warning: You fit lock yourself out', yo: 'Ìkìlọ̀: O lè tì ara rẹ sílẹ̀', ha: 'Gargaɗi: Kuna iya kulle kanku', ig: 'Ịdọ Aka Ná Ntị: Ị nwere ike kpọchie onwe gị' },
  'security.ipWhitelist.warningText': { en: "If you enable the whitelist without adding any IP addresses, you won't be able to log in from any location.", pcm: "If you enable the whitelist without adding any IP address, you no go fit login from anywhere.", yo: "Tí o bá mú àtòjọ náà ṣiṣẹ́ láìsí fífi àdírẹ́sì IP kankan kún, o kò ní lè wọlé láti ibì kankan.", ha: "Idan kun kunna jerin ba tare da ƙara kowane adireshin IP ba, ba za ku iya shiga daga ko'ina ba.", ig: "Ọ bụrụ na ị mee ka ndepụta rụọ ọrụ na-etinyeghị adreesị IP ọ bụla, ị gaghị enwe ike ịbanye site n'ebe ọ bụla." },
  'security.ipWhitelist.addMyIpAndEnable': { en: 'Add my IP and enable', pcm: 'Add my IP and enable', yo: 'Fi IP mi kún kí o sì mú u ṣiṣẹ́', ha: 'Ƙara IP na kuma kunna', ig: 'Tinye IP m wee mee ka ọ rụọ ọrụ' },
  'security.ipWhitelist.noActiveWarning': { en: 'No active IP addresses whitelisted', pcm: 'No active IP address whitelisted', yo: 'Kò Sí Àdírẹ́sì IP Tí Ó Ṣiṣẹ́ Nínú Àtòjọ', ha: 'Babu Adireshin IP masu aiki a cikin jeri', ig: 'Enweghị Adreesị IP Na-arụ Ọrụ na Ndepụta' },
  'security.ipWhitelist.addToRestrict': { en: 'Add IP addresses to restrict login access', pcm: 'Add IP address to restrict login access', yo: 'Fi àwọn àdírẹ́sì IP kún láti dín ìwọlé kù', ha: 'Ƙara adireshin IP don taƙaita samun shiga', ig: 'Tinye adreesị IP iji gbochie ohere ịbanye' },
  'common.adding': { en: 'Adding...', pcm: 'Adding...', yo: 'Ń Ṣàfikún...', ha: 'Ana ƙarawa...', ig: 'Na-etinye...' },

  // Security Dashboard
  'security.dashboard.title': { en: 'Security Dashboard', pcm: 'Security Dashboard', yo: 'Pánẹ́ẹ̀lì Ààbò', ha: 'Dandalin Tsaro', ig: 'Dashboard Nchekwa' },
  'security.dashboard.subtitle': { en: 'Monitor your account security and activity', pcm: 'Monitor your account security and activity', yo: 'Tẹ́lé ààbò àti ìṣe àkọsílẹ̀ rẹ', ha: 'Kula da tsaron asusunka da ayyuka', ig: 'Nyochaa nchekwa akaụntụ gị na ihe omume' },
  'security.dashboard.refresh': { en: 'Refresh', pcm: 'Refresh', yo: 'Ṣe Tuntun', ha: 'Sabunta', ig: 'Mee Ọhụrụ' },
  'security.dashboard.suspiciousActivity': { en: 'Suspicious Activity Detected', pcm: 'Suspicious Activity Detected', yo: 'A Ti Rí Ìṣe Tí Ó Fura', ha: 'An Gano Aiki Mai Shakka', ig: 'A Chọpụtara Ihe Omume Na-enye Obi Mmekpa' },
  'security.dashboard.suspiciousDesc': { en: 'Multiple failed backup code attempts were detected in the last 24 hours. If this wasn\'t you, please change your password and generate new backup codes.', pcm: 'Many failed backup code attempts detected for the last 24 hours. If e no be you, change your password and generate new backup codes.', yo: 'A rí àwọn ìgbìyànjú kóòdù ìpamọ́ tí kò yọrí sí nǹkan púpọ̀ láàárín wákàtí 24 sẹ́yìn. Tí kìí ṣe ìwọ, jọ̀wọ́ yí àwọn ọ̀rọ̀ aṣínà rẹ padà kí o sì ṣẹ̀dá àwọn kóòdù ìpamọ́ tuntun.', ha: 'An sami yunkurin lambobin adana da yawa da suka kasa a cikin awanni 24 da suka gabata. Idan ba kai ba, da fatan za a canza kalmar sirrinka ka samar da sabbin lambobin adana.', ig: 'A chọpụtara ọtụtụ nnwale koodu ndabere dara ada n\'ime awa 24 gara aga. Ọ bụrụ na ọ bụghị gị, biko gbanwee okwuntụghe gị wee mepụta koodu ndabere ọhụrụ.' },
  'security.dashboard.totalLogins': { en: 'Total Logins', pcm: 'Total Logins', yo: 'Àpapọ̀ Ìwọlé', ha: 'Jimlar Shiga', ig: 'Nchịkọta Ịbanye' },
  'security.dashboard.failedAttempts': { en: 'Failed Attempts', pcm: 'Failed Attempts', yo: 'Àwọn Ìgbìyànjú Tó Kùnà', ha: 'Ƙoƙarin da Suka Kasa', ig: 'Nnwale Dara Ada' },
  'security.dashboard.mfaStatus': { en: '2FA Status', pcm: '2FA Status', yo: 'Ipò 2FA', ha: 'Matsayin 2FA', ig: 'Ọnọdụ 2FA' },
  'security.dashboard.enabled': { en: 'Enabled', pcm: 'Enabled', yo: 'Ti Mú Ṣiṣẹ́', ha: 'An Kunna', ig: 'Emepere' },
  'security.dashboard.disabled': { en: 'Disabled', pcm: 'Disabled', yo: 'Ti Dá Dúró', ha: 'An Kashe', ig: 'Emechiri' },
  'security.dashboard.backupCodes': { en: 'Backup Codes', pcm: 'Backup Codes', yo: 'Àwọn Kóòdù Ìpamọ́', ha: 'Lambobin Adana', ig: 'Koodu Ndabere' },
  'security.dashboard.analytics': { en: 'Analytics', pcm: 'Analytics', yo: 'Ìṣirò', ha: 'Nazari', ig: 'Nyocha' },
  'security.dashboard.accessRules': { en: 'Access Rules', pcm: 'Access Rules', yo: 'Àwọn Òfin Àsìkò', ha: 'Dokokin Shiga', ig: 'Iwu Ohere' },
  'security.dashboard.devices': { en: 'Devices', pcm: 'Devices', yo: 'Àwọn Ẹ̀rọ', ha: 'Na\'urori', ig: 'Ngwaọrụ' },
  'security.dashboard.sessions': { en: 'Sessions', pcm: 'Sessions', yo: 'Àwọn Ìgbà', ha: 'Zama', ig: 'Oge' },
  'security.dashboard.loginHistory': { en: 'Login History', pcm: 'Login History', yo: 'Ìtàn Ìwọlé', ha: 'Tarihin Shiga', ig: 'Akụkọ Ịbanye' },
  'security.dashboard.securityEvents': { en: 'Security Events', pcm: 'Security Events', yo: 'Àwọn Ìṣẹ̀lẹ̀ Ààbò', ha: 'Abubuwan Tsaro', ig: 'Ihe Omume Nchekwa' },
  'security.dashboard.notifications': { en: 'Notifications', pcm: 'Notifications', yo: 'Àwọn Ìfitónilétí', ha: 'Sanarwa', ig: 'Ọkwa' },
  'security.dashboard.blockedLogins': { en: 'Blocked Logins', pcm: 'Blocked Logins', yo: 'Àwọn Ìwọlé Tí A Dènà', ha: 'Shiga da Aka Toshe', ig: 'Ịbanye E gbochiri' },
  'security.dashboard.failedAttemptsTab': { en: 'Failed Attempts', pcm: 'Failed Attempts', yo: 'Àwọn Ìgbìyànjú Tó Kùnà', ha: 'Ƙoƙarin da Suka Kasa', ig: 'Nnwale Dara Ada' },
  'security.dashboard.knownDevices': { en: 'Known Devices', pcm: 'Known Devices', yo: 'Àwọn Ẹ̀rọ Tí A Mọ̀', ha: 'Na\'urori da Aka Sani', ig: 'Ngwaọrụ A Maara' },
  'security.dashboard.knownDevicesDesc': { en: 'Devices that have logged into your account', pcm: 'Devices wey don login to your account', yo: 'Àwọn ẹ̀rọ tí wọ́n ti wọlé sí àkọsílẹ̀ rẹ', ha: 'Na\'urori da suka shiga asusunka', ig: 'Ngwaọrụ banyere na akaụntụ gị' },
  'security.dashboard.noDevices': { en: 'No devices recorded yet', pcm: 'No device recorded yet', yo: 'Kò sí ẹ̀rọ tí a ti ṣàkọsílẹ̀', ha: 'Babu na\'ura da aka yi rijista tukuna', ig: 'Enweghị ngwaọrụ edekọrọ' },
  'security.dashboard.blocked': { en: 'Blocked', pcm: 'Blocked', yo: 'Dènà', ha: 'An Toshe', ig: 'Gbochiri' },
  'security.dashboard.trusted': { en: 'Trusted', pcm: 'Trusted', yo: 'Igbẹ́kẹ̀lé', ha: 'Amintacce', ig: 'Ntụkwasị Obi' },
  'security.dashboard.activeSessions': { en: 'Active Sessions', pcm: 'Active Sessions', yo: 'Àwọn Ìgbà Tó Ń Ṣiṣẹ́', ha: 'Zama Masu Aiki', ig: 'Oge Na-arụ Ọrụ' },
  'security.dashboard.activeSessionsDesc': { en: 'Devices currently logged into your account', pcm: 'Devices wey currently logged into your account', yo: 'Àwọn ẹ̀rọ tí wọ́n wà nínú àkọsílẹ̀ rẹ lọ́wọ́lọ́wọ́', ha: 'Na\'urorin da ke shiga asusunka a yanzu', ig: 'Ngwaọrụ banyere na akaụntụ gị ugbu a' },
  'security.dashboard.currentlyOnline': { en: 'Currently Online', pcm: 'Currently Online', yo: 'Lórí Ẹ̀rọ Lọ́wọ́lọ́wọ́', ha: 'A Kan Layi Yanzu', ig: 'Nọ N\'ịntanetị Ugbu A' },
  'security.dashboard.noActiveSessions': { en: 'No active sessions detected', pcm: 'No active session detected', yo: 'Kò sí ìgbà tó ń ṣiṣẹ́ tí a rí', ha: 'Ba a gano zama mai aiki ba', ig: 'Achọtabeghị oge na-arụ ọrụ' },
  'security.dashboard.online': { en: 'Online', pcm: 'Online', yo: 'Lórí Ẹ̀rọ', ha: 'A Kan Layi', ig: 'N\'ịntanetị' },
  'security.dashboard.thisDevice': { en: 'This device', pcm: 'This device', yo: 'Ẹ̀rọ yìí', ha: 'Wannan na\'ura', ig: 'Ngwaọrụ a' },
  'security.dashboard.sessionManagement': { en: 'Session Management', pcm: 'Session Management', yo: 'Ìṣàkóso Ìgbà', ha: 'Sarrafa Zama', ig: 'Njikwa Oge' },
  'security.dashboard.sessionManagementDesc': { en: 'Sign out of all other devices to secure your account. This will require re-authentication on those devices.', pcm: 'Sign out of all other devices to secure your account. E go require re-authentication on those devices.', yo: 'Bọ́ sílẹ̀ láti gbogbo àwọn ẹ̀rọ mìíràn láti dáàbò bo àkọsílẹ̀ rẹ. Èyí yóò nílò ìdánimọ̀ mìíràn lórí àwọn ẹ̀rọ wọ̀nyẹn.', ha: 'Fita daga duk wasu na\'urori don tsare asusunka. Wannan zai buƙaci sake tabbatarwa akan waɗannan na\'urori.', ig: 'Pụọ n\'ime ngwaọrụ ndị ọzọ niile iji chekwaa akaụntụ gị. Nke a ga-achọ ịkwụpụta ọzọ na ngwaọrụ ndị ahụ.' },
  'security.dashboard.signOutAllOtherDevices': { en: 'Sign Out All Other Devices', pcm: 'Sign Out All Other Devices', yo: 'Bọ́ Sílẹ̀ Láti Gbogbo Àwọn Ẹ̀rọ Mìíràn', ha: 'Fita Daga Duk Sauran Na\'urori', ig: 'Pụọ N\'ime Ngwaọrụ Ndị Ọzọ Niile' },
  'security.dashboard.lastLogin': { en: 'Last login', pcm: 'Last login', yo: 'Ìwọlé tó kẹ́yìn', ha: 'Shiga na ƙarshe', ig: 'Ịbanye ikpeazụ' },
  'security.dashboard.loginHistoryDesc': { en: 'Recent login activity with approximate locations', pcm: 'Recent login activity with approximate locations', yo: 'Ìṣe ìwọlé àìpẹ́ pẹ̀lú àwọn ibi tí ó súnmọ́', ha: 'Ayyukan shiga na kwanan nan tare da wuraren da suka kusanta', ig: 'Ihe omume ịbanye dị nso na ebe dị nso' },
  'security.dashboard.clearHistory': { en: 'Clear History', pcm: 'Clear History', yo: 'Pa Ìtàn Rẹ́', ha: 'Share Tarihi', ig: 'Hichaa Akụkọ' },
  'security.dashboard.noLoginHistory': { en: 'No login history recorded yet', pcm: 'No login history recorded yet', yo: 'Kò sí ìtàn ìwọlé tí a ti ṣàkọsílẹ̀', ha: 'Babu tarihin shiga da aka yi rijista tukuna', ig: 'Enweghị akụkọ ịbanye edekọrọ' },
  'security.dashboard.signedInSuccessfully': { en: 'Signed in successfully', pcm: 'Signed in successfully', yo: 'Wọlé Lásìkò', ha: 'An Shiga Cikin Nasara', ig: 'Ịbanye Nke Ọma' },
  'security.dashboard.recentSecurityEvents': { en: 'Recent Security Events', pcm: 'Recent Security Events', yo: 'Àwọn Ìṣẹ̀lẹ̀ Ààbò Àìpẹ́', ha: 'Abubuwan Tsaro Na Kwanan Nan', ig: 'Ihe Omume Nchekwa Dị Nso' },
  'security.dashboard.recentSecurityEventsDesc': { en: 'Login activity, password changes, and 2FA updates', pcm: 'Login activity, password changes, and 2FA updates', yo: 'Ìṣe ìwọlé, àwọn ìyípadà ọ̀rọ̀ aṣínà, àti àwọn ìmúdójúìwọ̀n 2FA', ha: 'Ayyukan shiga, canjin kalmar sirri, da sabuntawar 2FA', ig: 'Ihe omume ịbanye, mgbanwe okwuntụghe, na mmelite 2FA' },
  'security.dashboard.noSecurityEvents': { en: 'No security events recorded yet', pcm: 'No security event recorded yet', yo: 'Kò sí ìṣẹ̀lẹ̀ ààbò tí a ti ṣàkọsílẹ̀', ha: 'Babu abubuwan tsaro da aka yi rijista tukuna', ig: 'Enweghị ihe omume nchekwa edekọrọ' },
  'security.dashboard.failedBackupCodeAttempts': { en: 'Failed Backup Code Attempts', pcm: 'Failed Backup Code Attempts', yo: 'Àwọn Ìgbìyànjú Kóòdù Ìpamọ́ Tó Kùnà', ha: 'Ƙoƙarin Lambobin Adana da Suka Kasa', ig: 'Nnwale Koodu Ndabere Dara Ada' },
  'security.dashboard.failedBackupCodeAttemptsDesc': { en: 'Recent failed attempts to use backup codes for login', pcm: 'Recent failed attempts to use backup codes for login', yo: 'Àwọn ìgbìyànjú àìpẹ́ láti lo àwọn kóòdù ìpamọ́ fún ìwọlé', ha: 'Ƙoƙarin kwanan nan na yin amfani da lambobin adana don shiga', ig: 'Nnwale dara ada dị nso iji jiri koodu ndabere banye' },
  'security.dashboard.noFailedAttempts': { en: 'No failed attempts', pcm: 'No failed attempts', yo: 'Kò sí ìgbìyànjú tó kùnà', ha: 'Babu ƙoƙarin da ya kasa', ig: 'Enweghị nnwale dara ada' },
  'security.dashboard.noFailedAttemptsDesc': { en: 'Your account has no recent failed backup code attempts', pcm: 'Your account no get any recent failed backup code attempts', yo: 'Àkọsílẹ̀ rẹ kò ní àwọn ìgbìyànjú kóòdù ìpamọ́ tí kò yọrísí àìpẹ́', ha: 'Asusunka ba shi da ƙoƙarin lambobin adana da suka kasa kwanan nan', ig: 'Akaụntụ gị enweghị nnwale koodu ndabere dara ada dị nso' },
  'security.dashboard.failedBackupCodeAttempt': { en: 'Failed backup code attempt', pcm: 'Failed backup code attempt', yo: 'Ìgbìyànjú kóòdù ìpamọ́ tó kùnà', ha: 'Ƙoƙarin lambar adana da ya kasa', ig: 'Nnwale koodu ndabere dara ada' },
  'security.dashboard.quickActions': { en: 'Quick Actions', pcm: 'Quick Actions', yo: 'Àwọn Ìgbésẹ̀ Kíákíá', ha: 'Ayyukan Sauri', ig: 'Ihe Omume Ngwa Ngwa' },
  'security.dashboard.quickActionsDesc': { en: 'Manage your account security settings', pcm: 'Manage your account security settings', yo: 'Ṣàkóso àwọn ètò ààbò àkọsílẹ̀ rẹ', ha: 'Sarrafa saitunan tsaron asusunka', ig: 'Jikwaa ntọala nchekwa akaụntụ gị' },
  'security.dashboard.securitySettings': { en: 'Security Settings', pcm: 'Security Settings', yo: 'Àwọn Ètò Ààbò', ha: 'Saitunan Tsaro', ig: 'Ntọala Nchekwa' },
  'security.dashboard.enable2fa': { en: 'Enable 2FA', pcm: 'Enable 2FA', yo: 'Mú 2FA Ṣiṣẹ́', ha: 'Kunna 2FA', ig: 'Mee Ka 2FA Rụọ Ọrụ' },
  'security.dashboard.generateBackupCodes': { en: 'Generate Backup Codes', pcm: 'Generate Backup Codes', yo: 'Ṣẹ̀dá Àwọn Kóòdù Ìpamọ́', ha: 'Samar da Lambobin Adana', ig: 'Mepụta Koodu Ndabere' },
  'security.dashboard.verifyIdentity': { en: 'Verify Your Identity', pcm: 'Verify Your Identity', yo: 'Jẹ́rìísí Ìdánimọ̀ Rẹ', ha: 'Tabbatar da Shaidarka', ig: 'Gosi Ị Bụ Onye Ị Bụ' },
  'security.dashboard.verifyIdentityDesc': { en: 'To unblock this device, please verify your identity using your authenticator app or a backup code.', pcm: 'To unblock this device, please verify your identity using your authenticator app or a backup code.', yo: 'Láti mú ẹ̀rọ yìí sílẹ̀, jọ̀wọ́ jẹ́rìísí ìdánimọ̀ rẹ nípa lílo àpẹẹrẹ olùfọwọ́sí rẹ tàbí kóòdù ìpamọ́ kan.', ha: 'Don ɓuɗe wannan na\'ura, da fatan za a tabbatar da shaidarka ta amfani da aikace-aikacen tabbatarwa ko lambar adana.', ig: 'Iji kpọghee ngwaọrụ a, biko gosi ị bụ onye ị bụ site n\'iji ngwa nkwenye gị ma ọ bụ koodu ndabere.' },
  'security.dashboard.securityNotice': { en: 'Security Notice', pcm: 'Security Notice', yo: 'Ìkìlọ̀ Ààbò', ha: 'Sanarwar Tsaro', ig: 'Ọkwa Nchekwa' },
  'security.dashboard.securityNoticeDesc': { en: 'Unblocking a device will allow it to log into your account again. Make sure you recognize this device.', pcm: 'Unblocking a device go allow am to login to your account again. Make sure you recognize this device.', yo: 'Mímú ẹ̀rọ kan sílẹ̀ yóò jẹ́ kí ó lè wọlé sí àkọsílẹ̀ rẹ lẹ́ẹ̀kan sí i. Rí i dájú pé o mọ̀ ẹ̀rọ yìí.', ha: 'Buɗe na\'ura zai ba ta damar shiga asusunka sake. Tabbatar kun san wannan na\'urar.', ig: 'Ịkpọghe ngwaọrụ ga-enye ya ohere ịbanye na akaụntụ gị ọzọ. Jide n\'aka na ị matara ngwaọrụ a.' },
  'security.dashboard.backupCode': { en: 'Backup Code', pcm: 'Backup Code', yo: 'Kóòdù Ìpamọ́', ha: 'Lambar Adana', ig: 'Koodu Ndabere' },
  'security.dashboard.backupCodeNote': { en: 'Enter one of your backup codes. Note: This code will be consumed after use.', pcm: 'Enter one of your backup codes. Note: This code go be consumed after use.', yo: 'Tẹ ọ̀kan nínú àwọn kóòdù ìpamọ́ rẹ. Àkíyèsí: A óò lo kóòdù yìí lẹ́yìn lílo.', ha: 'Shigar da ɗaya daga cikin lambobin adana naka. Lura: Za a cinye wannan lambar bayan amfani.', ig: 'Tinye otu n\'ime koodu ndabere gị. Mara: A ga-eji koodu a emechaa iji ya.' },
  'security.dashboard.verificationCode': { en: 'Verification Code', pcm: 'Verification Code', yo: 'Kóòdù Ìjẹ́rìísí', ha: 'Lambar Tabbatarwa', ig: 'Koodu Nkwenye' },
  'security.dashboard.verificationCodeDesc': { en: 'Enter the 6-digit code from your authenticator app', pcm: 'Enter the 6-digit code from your authenticator app', yo: 'Tẹ kóòdù ọ̀nà-mẹ́fà láti inú àpẹẹrẹ olùfọwọ́sí rẹ', ha: 'Shigar da lambar lamba 6 daga aikace-aikacen tabbatarwa naka', ig: 'Tinye koodu ọnụọgụ 6 site na ngwa nkwenye gị' },
  'security.dashboard.useAuthenticator': { en: 'Use authenticator app instead', pcm: 'Use authenticator app instead', yo: 'Lo àpẹẹrẹ olùfọwọ́sí dípò', ha: 'Yi amfani da aikace-aikacen tabbatarwa a maimakon', ig: 'Jiri ngwa nkwenye kama' },
  'security.dashboard.useBackupCode': { en: 'Can\'t access your authenticator? Use a backup code', pcm: 'Can\'t access your authenticator? Use a backup code', yo: 'Ṣe o kò lè wọlé sí olùfọwọ́sí rẹ? Lo kóòdù ìpamọ́', ha: 'Ba za ku iya shiga aikace-aikacen tabbatarwa ba? Yi amfani da lambar adana', ig: 'Enweghị ike ịnweta ngwa nkwenye gị? Jiri koodu ndabere' },
  'security.dashboard.verifyAndUnblock': { en: 'Verify & Unblock', pcm: 'Verify & Unblock', yo: 'Jẹ́rìísí & Mú Sílẹ̀', ha: 'Tabbatar & Buɗe', ig: 'Gosi & Kpọghee' },
  'security.dashboard.verifying': { en: 'Verifying...', pcm: 'Verifying...', yo: 'Ń Jẹ́rìísí...', ha: 'Ana Tabbatarwa...', ig: 'Na-agosi...' },
  'security.dashboard.firstSeen': { en: 'First', pcm: 'First', yo: 'Àkọ́kọ́', ha: 'Na Farko', ig: 'Nke Mbụ' },
  'common.unknown': { en: 'Unknown', pcm: 'Unknown', yo: 'Àìmọ̀', ha: 'Ba a Sani ba', ig: 'Amaghị' },

  // ===== DASHBOARD PAGE TRANSLATIONS =====
  'dashboard.financialSummary': { en: 'Financial Summary', pcm: 'Money Summary', yo: 'Àkópọ̀ Owó', ha: 'Taƙaitawar Kuɗi', ig: 'Nchịkọta Ego' },
  'dashboard.clickToCollapse': { en: 'Click to collapse', pcm: 'Click am to close', yo: 'Tẹ láti pa', ha: 'Danna don rufe', ig: 'Pịa iji mechie' },
  'dashboard.businesses': { en: 'businesses', pcm: 'businesses', yo: 'àwọn iṣẹ́', ha: 'kasuwanci', ig: 'azụmaahịa' },
  'dashboard.netIncome': { en: 'net income', pcm: 'net income', yo: 'èrè alábápàdé', ha: 'ribar tsarkakakke', ig: 'uru ọcha' },
  'dashboard.urgent': { en: 'urgent', pcm: 'urgent', yo: 'pálapàla', ha: 'gaggawa', ig: 'ọ dị ngwa ngwa' },
  'dashboard.showingDataFor': { en: 'Showing data for', pcm: 'Showing data for', yo: 'Ń ṣàfihàn dátà fún', ha: 'Ana nuna bayanai don', ig: 'Na-egosi data maka' },
  'dashboard.thisWeek': { en: 'This Week', pcm: 'This Week', yo: 'Ọ̀sẹ̀ Yìí', ha: 'Wannan Mako', ig: 'Izu A' },
  'dashboard.thisMonth': { en: 'This Month', pcm: 'This Month', yo: 'Oṣù Yìí', ha: 'Wannan Wata', ig: 'Ọnwa A' },
  'dashboard.thisQuarter': { en: 'This Quarter', pcm: 'This Quarter', yo: 'Mẹ́tà Oṣù Yìí', ha: 'Wannan Kwata', ig: 'Nkeji Afọ A' },
  'dashboard.thisYear': { en: 'This Year', pcm: 'This Year', yo: 'Ọdún Yìí', ha: 'Wannan Shekara', ig: 'Afọ A' },
  'dashboard.savedBusinesses': { en: 'Saved Businesses', pcm: 'Saved Businesses', yo: 'Àwọn Iṣẹ́ Tí A Fipamọ́', ha: 'Kasuwancin da aka Ajiye', ig: 'Azụmahịa Echekwara' },
  'dashboard.addBusiness': { en: 'Add Business', pcm: 'Add Business', yo: 'Fi Iṣẹ́ Kún', ha: 'Ƙara Kasuwanci', ig: 'Tinye Azụmahịa' },
  'dashboard.noBusinesses': { en: 'No businesses saved yet', pcm: 'You never save any business', yo: 'Kò sí iṣẹ́ tí a fi pamọ́', ha: 'Ba a ajiye kasuwanci ba tukuna', ig: 'Ọ dịghị azụmaahịa echekwara' },
  'dashboard.transactions': { en: 'transactions', pcm: 'transactions', yo: 'àwọn ìdúnàádúrà', ha: "ma'amaloli", ig: 'azụmahịa' },
  'dashboard.reminders': { en: 'reminders', pcm: 'reminders', yo: 'àwọn ìránṣọ́', ha: 'tunatarwa', ig: 'ncheta' },
  'dashboard.urgentDue': { en: 'urgent due', pcm: 'urgent due', yo: 'ìpèsè kíákíá', ha: 'gaggawa', ig: 'oge ngwa ngwa' },
  'dashboard.deductible': { en: 'deductible', pcm: 'deductible', yo: 'tí a lè yọ kúrò', ha: 'mai cirewa', ig: 'nwere ike iwepụ' },
  'dashboard.income': { en: 'Income', pcm: 'Income', yo: 'Owó-wíwọlé', ha: 'Kudin Shiga', ig: 'Ego Nnata' },
  'dashboard.expenses': { en: 'Expenses', pcm: 'Expenses', yo: 'Inawo', ha: 'Kashe Kuɗi', ig: 'Mmefu' },
  'dashboard.exportPDF': { en: 'Export PDF', pcm: 'Download PDF', yo: 'Gbé PDF Jáde', ha: 'Fitar da PDF', ig: 'Bupụ PDF' },
  'dashboard.exportCSV': { en: 'Export CSV', pcm: 'Download CSV', yo: 'Gbé CSV Jáde', ha: 'Fitar da CSV', ig: 'Bupụ CSV' },
  'dashboard.calculateTax': { en: 'Calculate Tax', pcm: 'Calculate Tax', yo: 'Ṣe Ìṣirò Owó-orí', ha: 'Ƙididdige Haraji', ig: 'Gbakọọ Ụtụ' },
  'dashboard.addExpense': { en: 'Add Expense', pcm: 'Add Expense', yo: 'Fi Inawo Kún', ha: 'Ƙara Kashewa', ig: 'Tinye Mmefu' },
  'dashboard.setReminder': { en: 'Set Reminder', pcm: 'Set Reminder', yo: 'Ṣètò Ìránṣọ́', ha: 'Saita Tunatarwa', ig: 'Tọọ Ncheta' },
  'dashboard.businessTurnover': { en: 'Business Turnover', pcm: 'Business Money', yo: 'Owó Iṣẹ́ Tí Ó Wọlé', ha: 'Kudin Shiga Kasuwanci', ig: 'Ego Azụmahịa' },
  'dashboard.upcomingReminders': { en: 'Upcoming Reminders', pcm: 'Reminders Wey Dey Come', yo: 'Àwọn Ìránṣọ́ Tó Ń Bọ̀', ha: 'Tunatarwar da za ta zo', ig: 'Ncheta na-abịa' },
  'dashboard.noReminders': { en: 'No upcoming reminders', pcm: 'No reminder dey come', yo: 'Kò sí ìránṣọ́ tó ń bọ̀', ha: 'Babu tunatarwa masu zuwa', ig: 'Ọ dịghị ncheta na-abịa' },
  'dashboard.dueIn': { en: 'Due in', pcm: 'Due in', yo: 'Yóò parí ní', ha: 'Ya kamata a cikin', ig: 'A ga-akwụ n' },
  'dashboard.days': { en: 'days', pcm: 'days', yo: 'ọjọ́', ha: 'kwanaki', ig: 'ụbọchị' },
  'dashboard.expenseBreakdown': { en: 'Expense Breakdown', pcm: 'Expense Breakdown', yo: 'Àlàyé Inawo', ha: 'Rarraba Kashewa', ig: 'Nkewa Mmefu' },
  'dashboard.viewCharts': { en: 'View Charts', pcm: 'See Charts', yo: 'Wo Àwọn Àpẹẹrẹ', ha: 'Duba Jadawali', ig: 'Lee Chaatị' },

  // ===== CALCULATOR PAGE TRANSLATIONS =====
  'calculator.businessName': { en: 'Business Name (Sole Prop)', pcm: 'Business Name (Sole Prop)', yo: 'Orúkọ Iṣẹ́ (Ẹni-nìkan)', ha: 'Sunan Kasuwanci', ig: 'Aha Azụmaahịa' },
  'calculator.company': { en: 'Company (LTD)', pcm: 'Company (LTD)', yo: 'Ilé-iṣẹ́ (LTD)', ha: 'Kamfani (LTD)', ig: 'Ụlọ Ọrụ (LTD)' },
  'calculator.primaryIncome': { en: 'Primary Income', pcm: 'Main Income', yo: 'Owó Tó Ṣe Pàtàkì', ha: 'Babban Kuɗi', ig: 'Ego Izizi' },
  'calculator.expenses': { en: 'Expenses', pcm: 'Expenses', yo: 'Inawo', ha: 'Kashe Kuɗi', ig: 'Mmefu' },
  'calculator.vatDetails': { en: 'VAT Details', pcm: 'VAT Details', yo: 'Àlàyé VAT', ha: 'Bayanan VAT', ig: 'Nkọwa VAT' },
  'calculator.vatableSales': { en: 'VATable Sales', pcm: 'VATable Sales', yo: 'Àwọn Títà VAT', ha: 'Tallace-tallace VAT', ig: 'Ire ere VAT' },
  'calculator.vatablePurchases': { en: 'VATable Purchases', pcm: 'VATable Purchases', yo: 'Àwọn Ríra VAT', ha: 'Sayayya VAT', ig: 'Ịzụta VAT' },
  'calculator.additionalIncome': { en: 'Additional Income', pcm: 'Extra Income', yo: 'Owó Mìíràn', ha: 'Ƙarin Kuɗi', ig: 'Ego Ọzọ' },
  'calculator.quickAddExpense': { en: 'Quick Add Expense', pcm: 'Add Expense Quick', yo: 'Ṣàfikún Inawo Kíákíá', ha: 'Ƙara Kashewa da Sauri', ig: 'Tinye Mmefu Ngwa Ngwa' },
  'calculator.fixedAssets': { en: 'Fixed Assets', pcm: 'Fixed Assets', yo: 'Àwọn Ohun-ìní Títọ́', ha: 'Kadarori Tsayayye', ig: 'Akụ Rụrụ Ala' },
  'calculator.rentPaid': { en: 'Rent Paid', pcm: 'Rent Wey You Pay', yo: 'Owó Ilé Tí A Sanwó', ha: 'Haujin Gida da Aka Biya', ig: 'Ụgwọ Ụlọ E Kwụrụ' },
  'calculator.2026Rules': { en: '2026 Tax Rules', pcm: '2026 Tax Rules', yo: 'Àwọn Òfin Owó-orí 2026', ha: 'Dokokin Haraji 2026', ig: 'Iwu Ụtụ 2026' },
  'calculator.pre2026Rules': { en: 'Current (Pre-2026) Rules', pcm: 'Old Rules (Before 2026)', yo: 'Àwọn Òfin Lọ́wọ́lọ́wọ́', ha: 'Dokokin Yanzu', ig: 'Iwu Ugbu A' },
  'calculator.rentalIncome': { en: 'Rental Income', pcm: 'Rent Money', yo: 'Owó Ìyálé', ha: 'Kudin Haya', ig: 'Ego Ụlọ' },
  'calculator.consultancyIncome': { en: 'Consultancy Income', pcm: 'Consultancy Money', yo: 'Owó Ìmọ̀ràn', ha: 'Kudin Shawara', ig: 'Ego Ndụmọdụ' },
  'calculator.dividendIncome': { en: 'Dividend Income', pcm: 'Dividend Money', yo: 'Owó Ìpín', ha: 'Kudin Rabo', ig: 'Ego Oke' },
  'calculator.capitalGains': { en: 'Capital Gains', pcm: 'Capital Gains', yo: 'Èrè Owó-ìṣúra', ha: 'Riba ta Jari', ig: 'Uru Ego' },
  'calculator.calculateTax': { en: 'Calculate Tax', pcm: 'Calculate Tax', yo: 'Ṣe Ìṣirò Owó-orí', ha: 'Ƙididdige Haraji', ig: 'Gbakọọ Ụtụ' },
  'calculator.companyAssets': { en: 'Company Assets', pcm: 'Company Property', yo: 'Ohun-ìní Ilé-iṣẹ́', ha: 'Dukiyar Kamfani', ig: 'Akụ Ụlọ Ọrụ' },
  'calculator.rentRelief': { en: 'Rent Relief', pcm: 'Rent Relief', yo: 'Ìrànlọ́wọ́ Owó Ilé', ha: 'Sauƙin Haya', ig: 'Nnapụta Ụgwọ Ụlọ' },
  'calculator.expenseBreakdown': { en: 'Expense Breakdown', pcm: 'Expense Breakdown', yo: 'Àlàyé Inawo', ha: 'Rarraba Kashewa', ig: 'Nkewa Mmefu' },
  'calculator.foreignIncome': { en: 'Foreign Income', pcm: 'Foreign Money', yo: 'Owó Láti Òkèèrè', ha: 'Kudin Ƙasashen Waje', ig: 'Ego Mba Ọzọ' },
  'calculator.addExpense': { en: 'Add Expense', pcm: 'Add Expense', yo: 'Fi Inawo Kún', ha: 'Ƙara Kashewa', ig: 'Tinye Mmefu' },

  // ===== EXPENSES PAGE TRANSLATIONS =====
  'expense.pageTitle': { en: 'Expense Tracker', pcm: 'Expense Tracker', yo: 'Olùtọpinpin Inawo', ha: 'Mai Bibiyar Kashewa', ig: 'Onye Na-eso Ụzọ Mmefu' },
  'expense.scanReceipt': { en: 'Scan Receipt', pcm: 'Scan Receipt', yo: 'Ṣàyẹ̀wò Ìwé Ẹrí', ha: 'Duba Rasiti', ig: 'Nyochaa Nnata' },
  'expense.importCSV': { en: 'Import CSV', pcm: 'Import CSV', yo: 'Gbé CSV Wọlé', ha: 'Shigo da CSV', ig: 'Bubata CSV' },
  'expense.charts': { en: 'Charts', pcm: 'Charts', yo: 'Àwọn Àpẹẹrẹ', ha: 'Jadawali', ig: 'Chaatị' },
  'expense.analytics': { en: 'Analytics', pcm: 'Analytics', yo: 'Ìtúpalẹ̀', ha: 'Nazari', ig: 'Nyocha' },
  'expense.filter': { en: 'Filter', pcm: 'Filter', yo: 'Yọ̀', ha: 'Tace', ig: 'Nyocha' },
  'expense.budget': { en: 'Budget', pcm: 'Budget', yo: 'Ètò Owó', ha: 'Kasafin Kuɗi', ig: 'Mmefu Ego' },
  'expense.recurring': { en: 'Recurring', pcm: 'Recurring', yo: 'Àtúnwáyé', ha: 'Mai Maimaituwa', ig: 'Na-emegharị' },
  'expense.goals': { en: 'Goals', pcm: 'Goals', yo: 'Àwọn Ìfọkànsí', ha: 'Manufofi', ig: 'Ebumnuche' },
  'expense.setBudget': { en: 'Set Budget', pcm: 'Set Budget', yo: 'Ṣètò Ètò Owó', ha: 'Saita Kasafin', ig: 'Tọọ Mmefu Ego' },
  'expense.monthlyBudget': { en: 'Monthly Budget', pcm: 'Monthly Budget', yo: 'Ètò Owó Oṣù', ha: 'Kasafin Wata', ig: 'Mmefu Ego Ọnwa' },
  'expense.budgetRemaining': { en: 'Budget Remaining', pcm: 'Budget Remaining', yo: 'Ètò Owó Tó Kù', ha: 'Kasafin da ya Rage', ig: 'Mmefu Ego Fọdụrụ' },
  'expense.overBudget': { en: 'Over Budget', pcm: 'Over Budget', yo: 'O Kọjá Ètò Owó', ha: 'Ya Wuce Kasafin', ig: 'Karịrị Mmefu Ego' },
  'expense.underBudget': { en: 'Under Budget', pcm: 'Under Budget', yo: 'Lábẹ́ Ètò Owó', ha: 'Ƙasa da Kasafin', ig: 'N\'okpuru Mmefu Ego' },
  'expense.notifications': { en: 'Notifications', pcm: 'Notifications', yo: 'Ìfitọ́nilétí', ha: 'Sanarwa', ig: 'Ọkwa' },
  'expense.exportPDF': { en: 'Export PDF', pcm: 'Download PDF', yo: 'Gbé PDF Jáde', ha: 'Fitar da PDF', ig: 'Bupụ PDF' },
  'expense.deleteExpense': { en: 'Delete Expense', pcm: 'Delete Expense', yo: 'Pa Inawo Rẹ́', ha: 'Share Kashewa', ig: 'Hichapụ Mmefu' },
  'expense.editExpense': { en: 'Edit Expense', pcm: 'Edit Expense', yo: 'Ṣàtúnṣe Inawo', ha: 'Gyara Kashewa', ig: 'Dezie Mmefu' },
  'expense.selectBusiness': { en: 'Select Business', pcm: 'Select Business', yo: 'Yan Iṣẹ́', ha: 'Zaɓi Kasuwanci', ig: 'Họrọ Azụmahịa' },
  'expense.allBusinesses': { en: 'All Businesses', pcm: 'All Businesses', yo: 'Gbogbo Iṣẹ́', ha: 'Duk Kasuwanci', ig: 'Azụmahịa Niile' },
  'expense.personal': { en: 'Personal', pcm: 'Personal', yo: 'Ti Ara Ẹni', ha: 'Na Kai', ig: 'Nke Onwe' },
  'expense.netIncome': { en: 'Net Income', pcm: 'Net Income', yo: 'Èrè Alábápàdé', ha: 'Ribar Tsarkakakke', ig: 'Uru Ọcha' },
  'expense.taxSavings': { en: 'Tax Savings', pcm: 'Tax Wey You Save', yo: 'Owó-orí Tí O Fipamọ́', ha: 'Ajiyar Haraji', ig: 'Nchekwa Ụtụ' },
  'expense.recentTransactions': { en: 'Recent Transactions', pcm: 'Recent Transactions', yo: 'Àwọn Ìdúnàádúrà Láìpẹ́', ha: "Ma'amaloli na Baya-bayan nan", ig: 'Azụmahịa N\'oge Na-adịghị Anya' },

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
            .maybeSingle();
          
          if (data?.language_preference) {
            setLanguageState(data.language_preference as Language);
          }
        } catch {
          // Silent fail - use default language
        }
      }
      setIsLoading(false);
    };

    fetchLanguage();
  }, [user]);

  // Also check localStorage for non-logged-in users
  useEffect(() => {
    if (!user) {
      const saved = safeLocalStorage.getItem('taxforge-language');
      if (saved === 'en' || saved === 'pcm' || saved === 'yo' || saved === 'ha' || saved === 'ig') {
        setLanguageState(saved);
      }
      setIsLoading(false);
    }
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    safeLocalStorage.setItem('taxforge-language', lang);

    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ language_preference: lang })
          .eq('id', user.id);
      } catch {
        // Silent fail - language will still work from localStorage
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
