import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface ReusablePieChartProps {
  data: PieChartDataItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  showLegend?: boolean;
  showCenterLabel?: boolean;
  centerLabelFormatter?: (item: PieChartDataItem, total: number) => React.ReactNode;
  onSliceClick?: (item: PieChartDataItem, index: number) => void;
  selectedIndex?: number | null;
  animated?: boolean;
  interactive?: boolean;
  legendClassName?: string;
  emptyMessage?: string;
}

export const ReusablePieChart = ({
  data,
  height = 250,
  innerRadius = 50,
  outerRadius = 85,
  paddingAngle = 2,
  showLegend = true,
  showCenterLabel = false,
  centerLabelFormatter,
  onSliceClick,
  selectedIndex: controlledSelectedIndex,
  animated = true,
  interactive = true,
  legendClassName = "",
  emptyMessage = "No data available"
}: ReusablePieChartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use controlled or internal state
  const selectedIndex = controlledSelectedIndex !== undefined ? controlledSelectedIndex : internalSelectedIndex;
  const setSelectedIndex = onSliceClick ? undefined : setInternalSelectedIndex;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  // Handle click outside to deselect
  useEffect(() => {
    if (!interactive) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedIndex?.(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [interactive]);

  const handlePieClick = (_: any, index: number) => {
    if (!interactive) return;
    
    if (onSliceClick) {
      onSliceClick(data[index], index);
    } else {
      setSelectedIndex?.(selectedIndex === index ? null : index);
    }
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground" 
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div 
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="relative" ref={containerRef} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={paddingAngle}
              dataKey="value"
              animationBegin={animated ? 200 : 0}
              animationDuration={animated ? 1000 : 0}
              animationEasing="ease-out"
              onClick={interactive ? handlePieClick : undefined}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
            >
              {data.map((entry, index) => {
                const isActive = selectedIndex === index;
                const isInactive = selectedIndex !== null && !isActive;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={isActive ? 'hsl(var(--foreground))' : 'transparent'}
                    strokeWidth={isActive ? 3 : 0}
                    style={{
                      filter: isInactive ? 'opacity(0.4)' : 'none',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'all 0.2s ease-out'
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label when selected */}
        {showCenterLabel && selectedIndex !== null && data[selectedIndex] && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {centerLabelFormatter ? (
              centerLabelFormatter(data[selectedIndex], total)
            ) : (
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{data[selectedIndex].name}</p>
                <p className="text-sm text-muted-foreground">{data[selectedIndex].value}</p>
                <p className="text-xs text-muted-foreground">
                  {((data[selectedIndex].value / total) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className={`mt-4 flex flex-wrap justify-center gap-2 transition-all duration-500 delay-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${legendClassName}`}>
          {data.map((entry, index) => {
            const percent = ((entry.value / total) * 100).toFixed(0);
            const isActive = selectedIndex === index;
            const isInactive = selectedIndex !== null && !isActive;
            
            return (
              <div 
                key={`legend-${index}`} 
                className={`flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1 transition-all ${
                  isActive ? 'bg-muted ring-2 ring-primary' : interactive ? 'hover:bg-muted/50' : ''
                } ${isInactive ? 'opacity-40' : ''}`}
                onClick={() => {
                  if (!interactive) return;
                  if (onSliceClick) {
                    onSliceClick(entry, index);
                  } else {
                    setSelectedIndex?.(isActive ? null : index);
                  }
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground truncate">{entry.name}</span>
                <span className="font-medium text-foreground ml-auto">{percent}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
