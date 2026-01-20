import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const CurrencyInput = ({ 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  className,
  id 
}: CurrencyInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const displayValue = isFocused 
    ? (value ? value.toString() : '') 
    : (value ? `₦${value.toLocaleString('en-NG')}` : '');
  
  return (
    <Input
      id={id}
      inputMode="numeric"
      pattern="[0-9]*"
      value={displayValue}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={(e) => {
        const num = Number(e.target.value.replace(/[^0-9]/g, ''));
        onChange(num);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
};
