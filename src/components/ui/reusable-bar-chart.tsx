import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
  stackId?: string;
  radius?: [number, number, number, number];
}

interface ReusableBarChartProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  bars: BarConfig[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  animated?: boolean;
  stacked?: boolean;
  formatXAxis?: (value: string) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  emptyMessage?: string;
  className?: string;
}

export const ReusableBarChart = ({
  data,
  xAxisKey,
  bars,
  height = 300,
  showGrid = true,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  animated = true,
  stacked = false,
  formatXAxis,
  formatYAxis,
  formatTooltip,
  emptyMessage = "No data available",
  className,
}: ReusableBarChartProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
    setIsVisible(true);
  }, [animated]);

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-muted-foreground ${className}`}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        animated ? (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8") : ""
      } ${className}`}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatXAxis}
            />
          )}
          {showYAxis && (
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
          )}
          <Tooltip
            formatter={formatTooltip ? (value: number) => formatTooltip(value) : undefined}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={stacked ? "stack" : bar.stackId}
              radius={bar.radius || [4, 4, 0, 0]}
              animationBegin={animated ? 200 + index * 100 : 0}
              animationDuration={animated ? 1000 : 0}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export type { BarConfig, ReusableBarChartProps };
