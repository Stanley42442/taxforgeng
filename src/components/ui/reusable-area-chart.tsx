import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface AreaChartSeries {
  dataKey: string;
  name: string;
  color: string;
  gradientId?: string;
  fillOpacity?: number;
  stackId?: string;
}

export interface ReusableAreaChartProps {
  data: Record<string, any>[];
  series: AreaChartSeries[];
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showYAxis?: boolean;
  animated?: boolean;
  strokeWidth?: number;
  curveType?: "monotone" | "linear" | "step" | "basis" | "natural";
  emptyMessage?: string;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
}

export const ReusableAreaChart = ({
  data,
  series,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showYAxis = true,
  animated = true,
  strokeWidth = 2,
  curveType = "monotone",
  emptyMessage = "No data available",
  yAxisFormatter,
  xAxisFormatter,
}: ReusableAreaChartProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

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
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            {series.map((s) => {
              const gradientId = s.gradientId || `gradient-${s.dataKey}`;
              return (
                <linearGradient
                  key={gradientId}
                  id={gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>

          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          )}

          <XAxis
            dataKey={xAxisKey}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={xAxisFormatter}
          />

          {showYAxis && (
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={yAxisFormatter}
            />
          )}

          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: "1rem" }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          )}

          {series.map((s) => {
            const gradientId = s.gradientId || `gradient-${s.dataKey}`;
            return (
              <Area
                key={s.dataKey}
                type={curveType}
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={strokeWidth}
                fill={`url(#${gradientId})`}
                fillOpacity={s.fillOpacity ?? 1}
                stackId={s.stackId}
                animationBegin={animated ? 200 : 0}
                animationDuration={animated ? 1000 : 0}
                animationEasing="ease-out"
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
