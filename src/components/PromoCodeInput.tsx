import { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePaystack, DiscountValidationResult } from '@/hooks/usePaystack';
import { Loader2, Check, X, Tag, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromoCodeInputProps {
  tier: string;
  billingCycle: 'monthly' | 'annually';
  onDiscountApplied: (discount: DiscountValidationResult | null, code: string | null) => void;
  className?: string;
}

export function PromoCodeInput({ 
  tier, 
  billingCycle, 
  onDiscountApplied,
  className 
}: PromoCodeInputProps) {
  const { validateDiscountCode } = usePaystack();
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidationResult | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastValidatedTier, setLastValidatedTier] = useState<string>(tier);
  const [lastValidatedCycle, setLastValidatedCycle] = useState<'monthly' | 'annually'>(billingCycle);
  
  // Re-validate when tier or billing cycle changes and we have an applied code
  useEffect(() => {
    if (appliedCode && (tier !== lastValidatedTier || billingCycle !== lastValidatedCycle)) {
      revalidateDiscount();
    }
  }, [tier, billingCycle]);

  const revalidateDiscount = useCallback(async () => {
    if (!appliedCode) return;

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateDiscountCode(appliedCode, tier, billingCycle);

      if (result.valid) {
        setAppliedDiscount(result);
        onDiscountApplied(result, appliedCode);
        setError(null);
      } else {
        // Code is no longer valid for this tier/cycle
        setError(result.message || 'Code not valid for selected plan');
        setAppliedDiscount(null);
        onDiscountApplied(null, null);
      }
      
      setLastValidatedTier(tier);
      setLastValidatedCycle(billingCycle);
    } catch (err: any) {
      setError(err.message || 'Failed to validate code');
      setAppliedDiscount(null);
      onDiscountApplied(null, null);
    } finally {
      setIsValidating(false);
    }
  }, [appliedCode, tier, billingCycle, validateDiscountCode, onDiscountApplied]);

  const handleApply = useCallback(async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setError(null);

    try {
      const upperCode = code.trim().toUpperCase();
      const result = await validateDiscountCode(upperCode, tier, billingCycle);

      if (result.valid) {
        setAppliedDiscount(result);
        setAppliedCode(upperCode);
        setLastValidatedTier(tier);
        setLastValidatedCycle(billingCycle);
        onDiscountApplied(result, upperCode);
        setError(null);
      } else {
        setError(result.message || result.error || 'Invalid code');
        setAppliedDiscount(null);
        setAppliedCode(null);
        onDiscountApplied(null, null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate code');
      setAppliedDiscount(null);
      setAppliedCode(null);
      onDiscountApplied(null, null);
    } finally {
      setIsValidating(false);
    }
  }, [code, tier, billingCycle, validateDiscountCode, onDiscountApplied]);

  const handleRemove = useCallback(() => {
    setCode('');
    setAppliedDiscount(null);
    setAppliedCode(null);
    setError(null);
    onDiscountApplied(null, null);
  }, [onDiscountApplied]);

  const formatCurrency = (kobo: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(kobo / 100);
  };

  if (appliedDiscount) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">
              {appliedDiscount.description}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isValidating && (
              <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
            )}
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              {appliedDiscount.discountType}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between text-sm px-1">
          <span className="text-muted-foreground">You save:</span>
          <span className="font-medium text-success">
            {formatCurrency(appliedDiscount.discountAmount || 0)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter promo or referral code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }}
            className={cn(
              "pl-10",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isValidating}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={!code.trim() || isValidating}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
