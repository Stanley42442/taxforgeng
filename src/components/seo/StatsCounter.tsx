import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { Calculator, Users, FileText, TrendingUp } from 'lucide-react';

interface StatItem {
  icon: 'calculator' | 'users' | 'file' | 'trend';
  value: number;
  suffix?: string;
  label: string;
}

interface StatsCounterProps {
  stats?: StatItem[];
  className?: string;
}

const iconMap = {
  calculator: Calculator,
  users: Users,
  file: FileText,
  trend: TrendingUp,
};

const defaultStats: StatItem[] = [
  { icon: 'calculator', value: 12847, suffix: '+', label: 'Calculations this month' },
  { icon: 'users', value: 1200, suffix: '+', label: 'Businesses trust us' },
  { icon: 'file', value: 5000, suffix: '+', label: 'Reports generated' },
];

/**
 * Animated Stats Counter Component
 * Displays real-time or static stats with animated number counting
 */
export const StatsCounter = ({
  stats = defaultStats,
  className = '',
}: StatsCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 sm:grid-cols-3 gap-6 ${className}`}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          stat={stat}
          isInView={isInView}
          delay={index * 200}
        />
      ))}
    </div>
  );
};

const StatCard = ({
  stat,
  isInView,
  delay,
}: {
  stat: StatItem;
  isInView: boolean;
  delay: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const IconComponent = iconMap[stat.icon];

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      let frame = 0;

      const counter = setInterval(() => {
        frame++;
        current = Math.min(current + increment, stat.value);
        setDisplayValue(Math.floor(current));

        if (frame >= steps) {
          setDisplayValue(stat.value);
          clearInterval(counter);
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, stat.value, delay]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  return (
    <div className="glass-frosted rounded-2xl p-6 text-center hover-lift transition-all">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground mb-4 shadow-lg">
        <IconComponent className="h-6 w-6" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
        {formatNumber(displayValue)}
        {stat.suffix && <span className="text-primary">{stat.suffix}</span>}
      </div>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </div>
  );
};
