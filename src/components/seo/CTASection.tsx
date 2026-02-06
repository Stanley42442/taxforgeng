import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, FileText } from 'lucide-react';

interface CTASectionProps {
  headline?: string;
  subtext?: string;
  primaryText?: string;
  primaryLink?: string;
  secondaryText?: string;
  secondaryLink?: string;
  variant?: 'default' | 'gradient' | 'minimal';
  dataTestId?: string;
}

/**
 * Conversion-Optimized CTA Section
 * Reusable call-to-action block with multiple variants
 */
export const CTASection = ({
  headline = 'Ready to Calculate Your Tax?',
  subtext = 'Get accurate, FIRS-compliant results in seconds.',
  primaryText = 'Calculate Now',
  primaryLink = '/individual-calculator',
  secondaryText = 'Learn More',
  secondaryLink = '/documentation',
  variant = 'default',
  dataTestId = 'cta-section',
}: CTASectionProps) => {
  if (variant === 'gradient') {
    return (
      <section className="relative py-12 md:py-16 overflow-hidden rounded-3xl my-10" data-testid={dataTestId}>
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-primary-foreground/10 blur-3xl" />

        <div className="relative z-10 text-center px-6">
          <h2 className="mb-4 text-2xl md:text-3xl font-bold text-primary-foreground">
            {headline}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/90 text-lg">
            {subtext}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={primaryLink}>
              <Button
                variant="glowAccent"
                size="lg"
                className="shadow-2xl group"
                data-testid="cta-primary"
              >
                <Calculator className="h-5 w-5" />
                <span>{primaryText}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            {secondaryText && (
              <Link to={secondaryLink}>
                <Button variant="outline-light" size="lg">
                  <FileText className="h-5 w-5" />
                  <span>{secondaryText}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="text-center py-8" data-testid={dataTestId}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={primaryLink}>
            <Button variant="glow" size="lg" className="group" data-testid="cta-primary">
              <Calculator className="h-5 w-5" />
              <span>{primaryText}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          {secondaryText && (
            <Link to={secondaryLink}>
              <Button variant="outline" size="lg">
                <span>{secondaryText}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <section
      className="glass-frosted rounded-3xl p-8 md:p-10 text-center my-10 hover-glow-primary transition-all"
      data-testid={dataTestId}
    >
      <h2 className="mb-3 text-2xl md:text-3xl font-bold text-foreground">
        {headline}
      </h2>
      <p className="mx-auto mb-8 max-w-xl text-muted-foreground text-lg">
        {subtext}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to={primaryLink}>
          <Button variant="glow" size="lg" className="group" data-testid="cta-primary">
            <Calculator className="h-5 w-5" />
            <span>{primaryText}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        {secondaryText && (
          <Link to={secondaryLink}>
            <Button variant="outline" size="lg">
              <FileText className="h-5 w-5" />
              <span>{secondaryText}</span>
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};
