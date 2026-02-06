import { CheckCircle2, Shield, Clock, Users } from 'lucide-react';

interface TrustBadge {
  icon: 'check' | 'shield' | 'clock' | 'users';
  text: string;
}

interface TrustBadgesProps {
  badges?: TrustBadge[];
  className?: string;
}

const iconMap = {
  check: CheckCircle2,
  shield: Shield,
  clock: Clock,
  users: Users,
};

const defaultBadges: TrustBadge[] = [
  { icon: 'check', text: 'FIRS Compliant' },
  { icon: 'shield', text: 'Nigeria Tax Act 2025' },
  { icon: 'clock', text: 'Updated Feb 2026' },
];

/**
 * Trust Badges Component
 * Displays trust signals to increase conversion on SEO pages
 */
export const TrustBadges = ({
  badges = defaultBadges,
  className = '',
}: TrustBadgesProps) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 md:gap-6 ${className}`}>
      {badges.map((badge, index) => {
        const IconComponent = iconMap[badge.icon];
        return (
          <div
            key={index}
            className="flex items-center gap-2 glass-subtle px-4 py-2.5 rounded-full hover-lift cursor-default"
          >
            <IconComponent className="h-4 w-4 text-success shrink-0" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
