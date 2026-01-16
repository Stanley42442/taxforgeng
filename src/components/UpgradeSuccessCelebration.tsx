import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Check, PartyPopper, Rocket, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionTier } from '@/contexts/SubscriptionContext';

interface UpgradeSuccessCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  newTier: SubscriptionTier;
  previousTier?: SubscriptionTier;
}

const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  basic: 'Basic',
  professional: 'Professional',
  business: 'Business',
  corporate: 'Corporate',
};

const TIER_BENEFITS: Record<SubscriptionTier, string[]> = {
  free: [],
  starter: ['Save 1 business profile', 'Basic PDF exports', '25 AI queries per month'],
  basic: ['Save up to 3 businesses', 'OCR receipt scanning', '75 AI queries per month'],
  professional: ['Save up to 10 businesses', 'Full payroll calculator', 'Professional invoicing', 'Priority support'],
  business: ['Unlimited businesses', 'CAC verification', 'Team collaboration', 'API access'],
  corporate: ['Everything in Business', 'Dedicated support', 'Custom integrations', 'SLA guarantees'],
};

const Confetti: React.FC = () => {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            opacity: [1, 1, 0],
            rotate: Math.random() * 720 - 360,
            x: Math.random() * 200 - 100,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

const FloatingIcons: React.FC = () => {
  const icons = [Star, Sparkles, Crown];
  
  return (
    <>
      {[...Array(6)].map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            className="absolute text-primary/30"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 0.6, 0.3],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.3 + i * 0.1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        );
      })}
    </>
  );
};

export const UpgradeSuccessCelebration: React.FC<UpgradeSuccessCelebrationProps> = ({
  isOpen,
  onClose,
  newTier,
  previousTier,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {showConfetti && <Confetti />}
          <FloatingIcons />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative max-w-md w-full mx-4 bg-card rounded-2xl p-8 shadow-2xl border border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, damping: 10 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative p-4 rounded-full bg-gradient-to-br from-primary to-primary/80">
                  <motion.div
                    initial={{ rotate: -180 }}
                    animate={{ rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.4 }}
                  >
                    <PartyPopper className="h-10 w-10 text-primary-foreground" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-2">
                Welcome to {TIER_DISPLAY_NAMES[newTier]}! 🎉
              </h2>
              <p className="text-muted-foreground">
                Your account has been successfully upgraded
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              className="space-y-3 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm font-medium text-muted-foreground mb-3">
                You now have access to:
              </p>
              {TIER_BENEFITS[newTier].map((benefit, index) => (
                <motion.div
                  key={benefit}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex-shrink-0 p-1 rounded-full bg-green-500/10">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button 
                onClick={onClose} 
                className="w-full gap-2 group"
                size="lg"
              >
                <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
                Start Exploring
              </Button>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-3 -right-3 p-2 rounded-full bg-primary"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.4 }}
            >
              <Crown className="h-5 w-5 text-primary-foreground" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeSuccessCelebration;
