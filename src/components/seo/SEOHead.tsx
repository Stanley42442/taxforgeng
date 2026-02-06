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
  dateModified: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  datePublished,
  dateModified,
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
