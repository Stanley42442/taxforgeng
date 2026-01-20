import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  showPrefix?: boolean; // Optional: hide ₦ for non-Naira values
  showCommasOnly?: boolean; // Optional: show commas but no currency symbol
}

export const CurrencyInput = ({ 
  value, 
  onChange, 
  placeholder = "0", 
  disabled, 
  className,
  id,
  showPrefix = true,
  showCommasOnly = false,
}: CurrencyInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  const formatWithCommas = (num: number): string => {
    if (!num) return '';
    return num.toLocaleString('en-NG');
  };
  
  // Determine prefix based on props
  const prefix = showCommasOnly ? '' : (showPrefix ? '₦' : '');
  
  // Always show formatted value with commas - no focus/blur toggling
  const displayValue = value ? `${prefix}${formatWithCommas(value)}` : '';
  
  // Restore cursor position after formatting
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [displayValue, cursorPosition]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    // Strip all non-numeric characters
    const numericValue = input.replace(/[^0-9]/g, '');
    const newValue = numericValue ? Number(numericValue) : 0;
    
    // Calculate cursor position based on digit count before cursor
    const beforeCursor = input.slice(0, cursorPos);
    const digitsBeforeCursor = beforeCursor.replace(/[^0-9]/g, '').length;
    
    // Find new cursor position in formatted string
    const formatted = newValue ? `${prefix}${formatWithCommas(newValue)}` : '';
    let newCursorPos = 0;
    let digitCount = 0;
    
    for (let i = 0; i < formatted.length && digitCount < digitsBeforeCursor; i++) {
      newCursorPos = i + 1;
      if (/[0-9]/.test(formatted[i])) {
        digitCount++;
      }
    }
    
    setCursorPosition(newCursorPos);
    onChange(newValue);
  };
  
  return (
    <Input
      ref={inputRef}
      id={id}
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
};
