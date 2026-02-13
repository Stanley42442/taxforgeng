import { AlertTriangle } from 'lucide-react';

interface SEODisclaimerProps {
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * SEO Disclaimer Component
 * Reusable disclaimer block for all SEO landing pages
 * Ensures legal compliance and builds trust through transparency
 */
export const SEODisclaimer = ({
  variant = 'default',
  className = '',
}: SEODisclaimerProps) => {
  if (variant === 'compact') {
    return (
      <p className={`text-xs text-muted-foreground text-center mt-8 ${className}`}>
        <strong>Disclaimer:</strong> Calculations are estimates based on Nigeria Tax Act 2025 (effective 2026). 
        Not official tax advice. Consult a certified tax professional.
      </p>
    );
  }

  return (
    <section className={`mt-12 ${className}`}>
      <div className="glass-frosted rounded-2xl p-6 border-l-4 border-warning/50">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Educational Tool Disclaimer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All calculations are estimates based on the Nigeria Tax Act 2025 (effective January 2026). 
              This is not official tax advice or NRS filing assistance. Results should be verified by 
              a certified tax professional before making financial decisions. TaxForge NG is operated 
              as an individual project by Gillespie / OptiSolve Labs in Port Harcourt, Nigeria.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
