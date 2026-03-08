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
  { icon: 'check', text: 'NRS Compliant' },
  { icon: 'shield', text: 'Nigeria Tax Act 2025' },
  { icon: 'clock', text: 'Updated Feb 2026' },
];

export const TrustBadges = ({
  badges = defaultBadges,
  className = '',
}: TrustBadgesProps) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-8 ${className}`}>
      {badges.map((badge, index) => {
        const IconComponent = iconMap[badge.icon];
        return (
          <div
            key={index}
            className="flex items-center gap-2"
          >
            <IconComponent className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
