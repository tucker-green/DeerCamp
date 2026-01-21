import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { useHuntingActivity } from '../../hooks/useHuntingActivity';

const HuntingActivityChart = () => {
  const { activityData, stats, loading } = useHuntingActivity();

  // Calculate chart data
  const chartData = useMemo(() => {
    if (!activityData || activityData.length === 0) {
      return { maxCount: 10, bars: [] };
    }

    const maxCount = Math.max(...activityData.map(d => d.checkIns), 1);
    
    const bars = activityData.map((d, i) => ({
      ...d,
      height: maxCount > 0 ? (d.checkIns / maxCount) * 100 : 0
    }));

    return { maxCount, bars };
  }, [activityData]);

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

  const hasData = activityData && activityData.some(d => d.checkIns > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white">Hunting Activity</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-xs sm:text-sm text-gray-300">
              <Users size={12} className="inline mr-1" />
              <span className="text-white font-semibold">{stats.totalHunters.size}</span> hunters
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[180px] sm:h-[200px]">
        {!hasData ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            No hunting activity this week
          </div>
        ) : (
          <>
            {/* Bar chart */}
            <div className="flex items-end justify-between h-full gap-2 px-2">
              {chartData.bars.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="w-full flex-1 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.height}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 relative group cursor-pointer min-h-[4px]"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-md text-xs text-white whitespace-nowrap">
                          {bar.checkIns} check-ins
                        </div>
                      </div>
                      
                      {/* Count label on bar */}
                      {bar.checkIns > 0 && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 + 0.3 }}
                          className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-400"
                        >
                          {bar.checkIns}
                        </motion.span>
                      )}
                    </motion.div>
                  </div>
                  
                  {/* Day label */}
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Y-axis reference lines */}
            <div className="absolute inset-0 pointer-events-none">
              {[0.25, 0.5, 0.75].map((ratio, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-white/5"
                  style={{ bottom: `${ratio * 100}%` }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">This Week</p>
          <p className="text-lg font-bold text-white">{stats.totalCheckIns}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Peak Day</p>
          <p className="text-lg font-bold text-emerald-400">{stats.peakDay}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg/Day</p>
          <p className="text-lg font-bold text-white">{stats.averagePerDay}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default HuntingActivityChart;
