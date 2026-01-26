import { useMemo } from "react";

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showArea?: boolean;
}

export const SparklineChart = ({ 
  data, 
  color = "hsl(var(--primary))", 
  height = 24, 
  width = 60,
  showArea = true 
}: SparklineChartProps) => {
  // Helper to ensure proper HSL format for SVG colors
  const resolveColor = (colorValue: string) => {
    if (colorValue.startsWith('var(--') && !colorValue.startsWith('hsl(')) {
      return `hsl(${colorValue})`;
    }
    return colorValue;
  };

  const path = useMemo(() => {
    if (!data || data.length === 0) return "";
    
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return { x, y };
    });
    
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y}`;
    }
    
    return points.map((point, i) => 
      i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    ).join(" ");
  }, [data, height, width]);
  
  const areaPath = useMemo(() => {
    if (!data || data.length === 0 || !showArea) return "";
    
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return { x, y };
    });
    
    if (points.length === 1) {
      return `M ${points[0].x} ${height} L ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y} L ${points[0].x + 1} ${height} Z`;
    }
    
    const linePath = points.map((point, i) => 
      i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    ).join(" ");
    
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  }, [data, height, width, showArea]);

  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    );
  }

  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const trendColor = trend >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const displayColor = resolveColor(color === "auto" ? trendColor : color);

  return (
    <svg width={width} height={height} className="overflow-visible">
      {showArea && (
        <path 
          d={areaPath} 
          fill={displayColor}
          fillOpacity={0.25}
          className="dark:opacity-40"
        />
      )}
      <path 
        d={path} 
        fill="none" 
        stroke={displayColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:drop-shadow-[0_0_3px_currentColor]"
      />
      {/* End dot */}
      {data.length > 0 && (
        <circle 
          cx={width} 
          cy={(() => {
            const max = Math.max(...data, 1);
            const min = Math.min(...data, 0);
            const range = max - min || 1;
            return height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
          })()}
          r={3}
          fill={displayColor}
          className="dark:drop-shadow-[0_0_4px_currentColor]"
        />
      )}
    </svg>
  );
};
