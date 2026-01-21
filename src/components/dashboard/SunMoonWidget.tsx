import { motion } from 'framer-motion';
import { Sunrise, Sunset, Moon } from 'lucide-react';
import { useSunMoon, getMoonPhaseName } from '../../hooks/useSunMoon';
import type { MoonPhase } from '../../hooks/useSunMoon';

interface SunMoonWidgetProps {
  lat?: number;
  lng?: number;
}

// Moon phase icons using simple SVG shapes
const MoonIcon = ({ phase, className = '' }: { phase: MoonPhase; className?: string }) => {
  const size = 24;
  
  // Different fills based on phase
  const renderMoon = () => {
    switch (phase) {
      case 'new':
        return (
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        );
      case 'full':
        return (
          <circle cx="12" cy="12" r="10" fill="currentColor" />
        );
      case 'first-quarter':
        return (
          <>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
          </>
        );
      case 'last-quarter':
        return (
          <>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2a10 10 0 0 0 0 20" fill="currentColor" />
          </>
        );
      case 'waxing-crescent':
        return (
          <>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2a10 10 0 0 1 0 20 7 7 0 0 0 0-20" fill="currentColor" />
          </>
        );
      case 'waning-crescent':
        return (
          <>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2a10 10 0 0 0 0 20 7 7 0 0 1 0-20" fill="currentColor" />
          </>
        );
      case 'waxing-gibbous':
        return (
          <>
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <path d="M12 2a10 10 0 0 0 0 20 5 5 0 0 1 0-20" fill="rgb(10, 12, 8)" />
          </>
        );
      case 'waning-gibbous':
        return (
          <>
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <path d="M12 2a10 10 0 0 1 0 20 5 5 0 0 0 0-20" fill="rgb(10, 12, 8)" />
          </>
        );
      default:
        return <circle cx="12" cy="12" r="10" fill="currentColor" />;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      {renderMoon()}
    </svg>
  );
};

const SunMoonWidget = ({ lat, lng }: SunMoonWidgetProps) => {
  const sunMoonData = useSunMoon(lat, lng);

  if (!sunMoonData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-4 rounded-2xl border border-white/10"
      >
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-white/10 rounded mb-3" />
          <div className="h-6 w-32 bg-white/10 rounded" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-4 sm:p-5 rounded-2xl border border-white/10"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Sunrise */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Sunrise size={20} className="text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Sunrise</p>
            <p className="text-sm sm:text-base font-bold text-white">{sunMoonData.sunrise}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-white/10 hidden sm:block" />

        {/* Sunset */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Sunset size={20} className="text-orange-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Sunset</p>
            <p className="text-sm sm:text-base font-bold text-white">{sunMoonData.sunset}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-white/10 hidden sm:block" />

        {/* Moon Phase */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <MoonIcon phase={sunMoonData.moonPhase} className="text-blue-300" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Moon</p>
            <p className="text-sm sm:text-base font-bold text-white">
              {getMoonPhaseName(sunMoonData.moonPhase).split(' ')[0]}
            </p>
            <p className="text-[10px] text-gray-500">{sunMoonData.moonIllumination}% lit</p>
          </div>
        </div>

        {/* Day Length - hidden on small screens */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Moon size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Day Length</p>
            <p className="text-sm sm:text-base font-bold text-white">{sunMoonData.dayLength}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SunMoonWidget;
