import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendColor?: 'green' | 'red' | 'gray';
  onClick?: () => void;
}

const StatsCard = ({ 
  icon, 
  label, 
  value, 
  subValue,
  trend, 
  trendColor = 'green',
  onClick 
}: StatsCardProps) => {
  const trendColors = {
    green: 'text-emerald-400',
    red: 'text-red-400',
    gray: 'text-gray-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`glass-panel-strong p-4 sm:p-5 rounded-2xl border border-white/10 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {/* Header with label and icon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-xs sm:text-sm font-medium">{label}</span>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <h4 className="text-2xl sm:text-3xl font-bold text-white">{value}</h4>
          {subValue && (
            <span className="text-lg sm:text-xl text-gray-500">{subValue}</span>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <p className={`text-xs sm:text-sm mt-2 ${trendColors[trendColor]}`}>
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
