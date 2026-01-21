import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface TrendDataPoint {
  month: string;
  count: number;
  weight: number;
}

interface HarvestTrendChartProps {
  data: TrendDataPoint[];
  totalWeight: number;
  loading?: boolean;
}

const HarvestTrendChart = ({ data, totalWeight, loading }: HarvestTrendChartProps) => {
  // Calculate chart dimensions and scale
  const chartData = useMemo(() => {
    // Handle empty or invalid data
    if (!data || data.length === 0) {
      return { 
        points: [], 
        pathData: '', 
        areaPath: '', 
        maxCount: 12, 
        chartHeight: 200 
      };
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const chartHeight = 200;
    const chartWidth = 100; // percentage
    const padding = 20;

    // Generate points for the line
    const points = data.map((d, i) => {
      // Avoid division by zero when only one data point
      const x = data.length === 1 
        ? 50 
        : (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;
      const y = chartHeight - (d.count / maxCount) * (chartHeight - padding * 2) - padding;
      return { x, y, ...d };
    });

    // Generate SVG path
    const pathData = points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      
      // Use quadratic curves for smooth lines
      const prev = points[i - 1];
      const cpX = (prev.x + point.x) / 2;
      return `${path} Q ${cpX} ${prev.y}, ${point.x} ${point.y}`;
    }, '');

    // Area path (for gradient fill) - only if we have points
    const areaPath = points.length > 0 
      ? `${pathData} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
      : '';

    return { points, pathData, areaPath, maxCount, chartHeight };
  }, [data]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10 h-[300px] sm:h-[350px]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="h-[200px] bg-white/5 rounded animate-pulse" />
      </motion.div>
    );
  }

  // Format weight for display
  const formatWeight = (w: number) => {
    if (w >= 1000) {
      return `${(w / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return w.toLocaleString();
  };

  // Check if we have any data to show
  const hasData = data && data.length > 0 && data.some(d => d.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white">Harvest Trend</h3>
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="text-xs sm:text-sm text-gray-300">
            Total Weight: <span className="text-white font-semibold">{formatWeight(totalWeight)} lbs</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[200px] sm:h-[220px]">
        {!hasData ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            No harvest data for this season yet
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 100 ${chartData.chartHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* Gradient definition */}
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-axis grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = chartData.chartHeight - ratio * (chartData.chartHeight - 40) - 20;
                return (
                  <line
                    key={i}
                    x1="15"
                    y1={y}
                    x2="95"
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.5"
                  />
                );
              })}

              {/* Area fill */}
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                d={chartData.areaPath}
                fill="url(#chartGradient)"
              />

              {/* Line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                d={chartData.pathData}
                fill="none"
                stroke="rgb(16, 185, 129)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.points.map((point, i) => (
                <motion.circle
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill="rgb(16, 185, 129)"
                  className="drop-shadow-lg"
                />
              ))}
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] sm:text-xs text-gray-500">
              <span>{chartData.maxCount > 0 ? Math.ceil(chartData.maxCount) : 12}</span>
              <span>{chartData.maxCount > 0 ? Math.ceil(chartData.maxCount * 0.75) : 9}</span>
              <span>{chartData.maxCount > 0 ? Math.ceil(chartData.maxCount * 0.5) : 6}</span>
              <span>{chartData.maxCount > 0 ? Math.ceil(chartData.maxCount * 0.25) : 3}</span>
              <span>0</span>
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-4 right-0 flex justify-between text-[10px] sm:text-xs text-gray-500 px-2">
              {data.map((d, i) => (
                <span key={i}>{d.month}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default HarvestTrendChart;
