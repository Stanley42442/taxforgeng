import React, { memo, useCallback } from 'react';
import { Building2, Briefcase, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/taxCalculations';
import { SharedElement } from '@/components/PageTransition';
import type { SavedBusiness } from '@/contexts/SubscriptionContext';

interface BusinessCardProps {
  business: SavedBusiness;
  index: number;
  onVerify: (business: SavedBusiness) => void;
  onDelete: (business: SavedBusiness) => void;
  style?: React.CSSProperties;
}

export const BusinessCard = memo(function BusinessCard({
  business,
  index,
  onVerify,
  onDelete,
  style,
}: BusinessCardProps) {
  const handleVerify = useCallback(() => {
    onVerify(business);
  }, [business, onVerify]);

  const handleDelete = useCallback(() => {
    onDelete(business);
  }, [business, onDelete]);

  return (
    <SharedElement id={`business-card-${business.id}`}>
      <motion.div
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
      >
        <Card 
          className={`shadow-card glass-frosted card-interactive h-full ${
            business.verificationStatus === 'verified' ? 'border-success/30 glow-sm' : ''
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <SharedElement id={`business-icon-${business.id}`}>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    business.entityType === 'company' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                  }`}>
                    {business.entityType === 'company' ? <Building2 className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                  </div>
                </SharedElement>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <SharedElement id={`business-name-${business.id}`}>
                      <h3 className="font-semibold text-foreground truncate">{business.name}</h3>
                    </SharedElement>
                    {business.verificationStatus === 'verified' && (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {business.entityType === 'company' ? 'Limited Company' : 'Business Name'}
                    {business.rcBnNumber && ` • ${business.rcBnNumber}`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Turnover: <span className="font-medium text-foreground">{formatCurrency(business.turnover)}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleVerify}>
              <Shield className="h-4 w-4" />
              {business.verificationStatus === 'verified' ? 'View Verification' : 'Verify CAC'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </SharedElement>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if relevant business data changed
  return (
    prevProps.business.id === nextProps.business.id &&
    prevProps.business.name === nextProps.business.name &&
    prevProps.business.turnover === nextProps.business.turnover &&
    prevProps.business.entityType === nextProps.business.entityType &&
    prevProps.business.verificationStatus === nextProps.business.verificationStatus &&
    prevProps.business.rcBnNumber === nextProps.business.rcBnNumber &&
    prevProps.index === nextProps.index
  );
});

export default BusinessCard;
