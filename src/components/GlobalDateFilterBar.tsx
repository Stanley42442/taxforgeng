import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDateRange, DatePreset, DateRange } from '@/contexts/DateRangeContext';
import { cn } from '@/lib/utils';

const presets: { value: DatePreset; label: string }[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
];

export const GlobalDateFilterBar: React.FC = () => {
  const { preset, customRange, computedRange, setPreset, setCustomRange } = useDateRange();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | null>(null);

  const handlePresetClick = (value: DatePreset) => {
    setPreset(value);
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setTempRange({ start: range.from, end: range.to });
    } else if (range?.from) {
      setTempRange({ start: range.from, end: range.from });
    }
  };

  const applyCustomRange = () => {
    if (tempRange) {
      setCustomRange(tempRange);
      setIsCalendarOpen(false);
      setTempRange(null);
    }
  };

  const formatRangeDisplay = () => {
    if (preset === 'custom' && customRange) {
      return `${format(customRange.start, 'MMM d')} - ${format(customRange.end, 'MMM d, yyyy')}`;
    }
    return `${format(computedRange.start, 'MMM d')} - ${format(computedRange.end, 'MMM d, yyyy')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <CalendarIcon className="h-4 w-4" />
        <span className="font-medium">Filter by Date</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Preset buttons */}
        {presets.map((p) => (
          <Button
            key={p.value}
            variant={preset === p.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(p.value)}
            className={cn(
              'transition-all',
              preset === p.value && 'shadow-sm'
            )}
          >
            {p.label}
          </Button>
        ))}

        {/* Custom range picker */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={preset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'gap-1.5 transition-all',
                preset === 'custom' && 'shadow-sm'
              )}
            >
              <span className="hidden xs:inline">Custom</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium">Select date range</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pick start and end dates
              </p>
            </div>
            <Calendar
              mode="range"
              selected={
                tempRange
                  ? { from: tempRange.start, to: tempRange.end }
                  : preset === 'custom' && customRange
                  ? { from: customRange.start, to: customRange.end }
                  : undefined
              }
              onSelect={handleDateSelect}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="flex justify-end gap-2 p-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempRange(null);
                  setIsCalendarOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={applyCustomRange}
                disabled={!tempRange}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Current range display */}
      <div className="flex items-center gap-2 ml-auto text-sm">
        <span className="text-muted-foreground">Showing:</span>
        <span className="font-medium text-foreground">{formatRangeDisplay()}</span>
      </div>
    </div>
  );
};

export default GlobalDateFilterBar;
