import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface SEOHeroProps {
  badge?: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  children?: ReactNode;
}

/**
 * SEO Hero Section
 * Consistent hero layout for SEO landing pages with gradient styling
 */
export const SEOHero = ({
  badge = '2026 Tax Rules',
  title,
  titleHighlight,
  subtitle,
  children,
}: SEOHeroProps) => {
  return (
    <section className="text-center mb-10 md:mb-14">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium text-foreground shadow-futuristic animate-slide-up">
        <Sparkles className="h-4 w-4 text-accent animate-pulse-soft" />
        <span>{badge}</span>
      </div>

      {/* Title */}
      <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl animate-slide-up-delay-1">
        {title}
        {titleHighlight && (
          <span className="block mt-2 text-gradient bg-gradient-to-r from-primary via-success to-accent bg-clip-text">
            {titleHighlight}
          </span>
        )}
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl animate-slide-up-delay-2">
        {subtitle}
      </p>

      {/* Slot for embedded calculator or custom content */}
      {children}
    </section>
  );
};
