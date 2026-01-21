import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { WeatherData } from '../../hooks/useWeather';

interface TacticalInsightCardProps {
  weather: WeatherData | null;
  loading?: boolean;
}

// Generate tactical hunting advice based on conditions
const generateInsight = (weather: WeatherData | null): string => {
  if (!weather) {
    return "Set your club location to receive personalized hunting insights based on current weather conditions.";
  }

  const { temp, windSpeed, windDirection, condition, isDay } = weather;
  const insights: string[] = [];

  // Time-based advice
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 10;
  const isEvening = hour >= 16 && hour < 20;
  const isPrimeTime = isMorning || isEvening;

  // Temperature-based advice
  if (temp < 40) {
    insights.push("Cold temperatures will have deer moving to feed earlier.");
  } else if (temp > 70) {
    insights.push("Warm conditions mean deer will be less active during daylight.");
  } else {
    insights.push("Moderate temperatures are ideal for deer movement.");
  }

  // Wind-based advice
  if (windSpeed < 5) {
    insights.push(`Calm winds - approach stands quietly and use the ${windDirection} breeze to your advantage.`);
  } else if (windSpeed < 15) {
    insights.push(`Use the steady ${windDirection} wind to your advantage by approaching from the downwind side, ensuring your scent stream blows away from the field and into non-essential cover.`);
  } else {
    insights.push(`Strong ${windDirection} winds may suppress deer movement. Consider ground blinds or sheltered stands.`);
  }

  // Food source advice based on time of day
  if (isPrimeTime) {
    insights.push("Position yourself on the south-southeast edge of a high-calorie food source to intercept deer moving from bedding as the afternoon temperature drops.");
  }

  // Combine insights into a coherent recommendation
  return `"${insights.join(' ')}"`;
};

const TacticalInsightCard = ({ weather, loading }: TacticalInsightCardProps) => {
  const navigate = useNavigate();
  const { activeClub } = useAuth();
  const hour = new Date().getHours();
  const isEvening = hour >= 16 || hour < 6;
  const [collapsed, setCollapsed] = useState(false);
  const hasLocation = Boolean(activeClub?.location?.lat && activeClub?.location?.lng);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10 relative overflow-hidden"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-emerald-500/20 relative overflow-hidden group"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
      
      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Zap size={20} className="text-emerald-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">
              AI Tactical Insight
            </h3>
            {/* Time indicator */}
            <div className="flex items-center gap-2">
              <div className="text-gray-400">
                {isEvening ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(prev => !prev)}
                className="text-[10px] sm:text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                aria-expanded={!collapsed}
              >
                {collapsed ? 'Show' : 'Hide'}
              </button>
            </div>
          </div>
          
          {!collapsed && (
            <p className="text-sm sm:text-base text-gray-300 italic leading-relaxed">
              {generateInsight(weather)}
              {!weather && !hasLocation && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => navigate('/club')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
                  >
                    Here
                  </button>
                  .
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TacticalInsightCard;
