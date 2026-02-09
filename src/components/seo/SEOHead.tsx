import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  schema?: object;
  ogImage?: string;
}

/**
 * SEO Head Component
 * Dynamically injects meta tags and JSON-LD structured data for SEO landing pages
 */
export const SEOHead = ({
  title,
  description,
  canonicalPath,
  keywords,
  schema,
  ogImage = 'https://taxforgeng.com/og-image.png',
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update/create meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Core meta tags
    updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);

    // Open Graph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:url', `https://taxforgeng.com${canonicalPath}`, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:site_name', 'TaxForge NG', true);
    updateMeta('og:locale', 'en_NG', true);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://taxforgeng.com${canonicalPath}`);

    // JSON-LD Schema
    if (schema) {
      const existingSchema = document.querySelector('script[data-seo-schema]');
      if (existingSchema) {
        existingSchema.remove();
      }
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.setAttribute('data-seo-schema', 'true');
      schemaScript.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }

    // Cleanup on unmount
    return () => {
      const schemaScript = document.querySelector('script[data-seo-schema]');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [title, description, canonicalPath, keywords, schema, ogImage]);

  return null;
};

// Pre-built schema generators for common page types
export const createWebApplicationSchema = (name: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name,
  description,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NGN',
  },
  provider: {
    '@type': 'Organization',
    name: 'TaxForge NG',
    url: 'https://taxforgeng.com',
  },
});

// SoftwareApplication schema with full feature list and pricing tiers for AI discoverability
export const createSoftwareApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TaxForge NG',
  description: 'Nigeria tax calculator with 2026 rules. Free PIT, PAYE, CIT, VAT calculations. FIRS-compliant.',
  url: 'https://taxforgeng.com',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript. Works on Chrome, Safari, Firefox, Edge.',
  
  featureList: [
    'Personal Income Tax (PIT) Calculator with 2026 Nigeria Tax Act rules',
    'PAYE Calculator for employed individuals',
    'Company Income Tax (CIT) Calculator',
    'VAT Calculator (7.5%)',
    'Withholding Tax (WHT) Calculator',
    'Small Company Exemption Checker (₦0 CIT eligibility)',
    'Rent Relief Calculator (20% up to ₦500,000)',
    'PDF Report Generation',
    'Multi-year Tax Projections',
    'Payroll Calculator for multiple employees',
    'Expense Tracking with OCR Receipt Scanning',
    'Tax Calendar with Deadline Reminders'
  ],
  
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'NGN',
      description: 'Basic tax calculations, no PDF export'
    },
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '500',
      priceCurrency: 'NGN',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '500',
        priceCurrency: 'NGN',
        billingDuration: 'P1M'
      },
      description: 'PDF reports, business calculator, expense tracking'
    },
    {
      '@type': 'Offer',
      name: 'Business',
      price: '2000',
      priceCurrency: 'NGN',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '2000',
        priceCurrency: 'NGN',
        billingDuration: 'P1M'
      },
      description: 'Full features, payroll, analytics, priority support'
    }
  ],
  
  // Note: aggregateRating removed - only add when real reviews exist
  
  provider: {
    '@type': 'Organization',
    name: 'TaxForge NG',
    url: 'https://taxforgeng.com',
    logo: 'https://taxforgeng.com/icon-512.png',
  },
  
  screenshot: 'https://taxforgeng.com/og-image.png',
  softwareVersion: '2.0',
  datePublished: '2025-01-01',
  dateModified: new Date().toISOString().split('T')[0],
  inLanguage: 'en-NG',
  
  areaServed: {
    '@type': 'Country',
    name: 'Nigeria'
  }
});

// Organization schema for brand recognition by AI systems
export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TaxForge NG',
  alternateName: 'TaxForge Nigeria',
  url: 'https://taxforgeng.com',
  logo: 'https://taxforgeng.com/icon-512.png',
  description: 'Nigerian tax calculation and compliance platform operated by Gillespie Benjamin Mclee (OptiSolve Labs)',
  foundingDate: '2025',
  areaServed: 'Nigeria',
  serviceType: [
    'Tax Calculator',
    'Tax Compliance Software',
    'Payroll Calculator',
    'Business Tax Advisory'
  ],
  knowsAbout: [
    'Nigerian Personal Income Tax',
    'Nigeria Tax Act 2025',
    'PAYE Nigeria',
    'Company Income Tax Nigeria',
    'VAT Nigeria',
    'FIRS Compliance',
    'Small Company Exemption',
    'Rent Relief Nigeria',
    'Development Levy'
  ]
});

// LocalBusiness schema for Port Harcourt local SEO
export const createLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'TaxForge NG',
  description: 'Nigerian tax calculator with 2026 rules. Free PIT, PAYE, CIT, VAT calculations.',
  url: 'https://taxforgeng.com',
  logo: 'https://taxforgeng.com/icon-512.png',
  image: 'https://taxforgeng.com/og-image.png',
  email: 'hello@taxforgeng.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Port Harcourt',
    addressRegion: 'Rivers State',
    addressCountry: 'NG'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '4.8156',
    longitude: '7.0498'
  },
  areaServed: {
    '@type': 'Country',
    name: 'Nigeria'
  },
  priceRange: '₦0 - ₦8,999',
  openingHours: 'Mo-Su 00:00-24:00',
});

export const createFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const createArticleSchema = (
  title: string,
  description: string,
  datePublished: string,
  dateModified: string,
  pageUrl?: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  datePublished,
  dateModified,
  inLanguage: 'en-NG',
  ...(pageUrl && {
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }),
  author: {
    '@type': 'Organization',
    name: 'TaxForge NG',
  },
  publisher: {
    '@type': 'Organization',
    name: 'TaxForge NG',
    logo: {
      '@type': 'ImageObject',
      url: 'https://taxforgeng.com/icon-512.png',
    },
  },
});

export const createHowToSchema = (
  name: string,
  description: string,
  steps: { name: string; text: string }[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name,
  description,
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
});

// BreadcrumbList schema for site hierarchy (SEO + AI discoverability)
export const createBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Speakable schema for voice search and AI summaries (AEO optimization)
export const createSpeakableSchema = (
  pageName: string,
  pageUrl: string,
  cssSelectors: string[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: pageName,
  url: pageUrl,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: cssSelectors,
  },
});
