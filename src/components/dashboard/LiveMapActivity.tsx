import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Stand, Booking } from '../../types';

interface LiveMapActivityProps {
  stands: Stand[];
  bookings: Booking[];
  loading?: boolean;
}

const LiveMapActivity = ({ stands, bookings, loading }: LiveMapActivityProps) => {
  const navigate = useNavigate();

  // Get current occupancy status for each stand
  const getStandStatus = (stand: Stand) => {
    // Check if stand is in maintenance
    if (stand.status === 'maintenance') {
      return { status: 'maintenance' as const, occupant: null };
    }

    // Check for active booking (checked-in)
    const activeBooking = bookings.find(
      b => b.standId === stand.id && b.status === 'checked-in'
    );

    if (activeBooking) {
      return { status: 'occupied' as const, occupant: activeBooking.userName };
    }

    return { status: 'available' as const, occupant: null };
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10"
      >
        <div className="h-6 w-40 bg-white/10 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-5 sm:p-6 rounded-2xl border border-white/10"
    >
      {/* Header */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-5">Live Map Activity</h3>

      {/* Stand list */}
      <div className="space-y-3">
        {stands.length === 0 ? (
          <p className="text-gray-500 text-sm">No stands configured yet</p>
        ) : (
          stands.slice(0, 6).map((stand, i) => {
            const { status, occupant } = getStandStatus(stand);
            
            return (
              <motion.div
                key={stand.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status indicator */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      status === 'occupied'
                        ? 'bg-emerald-500'
                        : status === 'maintenance'
                        ? 'bg-gray-500'
                        : 'bg-gray-600'
                    }`}
                  />
                  
                  {/* Stand info */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{stand.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {status === 'occupied' && occupant
                        ? `Occupied by ${occupant}`
                        : status === 'maintenance'
                        ? 'Under maintenance'
                        : 'Available'}
                    </p>
                  </div>
                </div>

                {/* Maintenance badge */}
                {status === 'maintenance' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    Maint
                  </span>
                )}
              </motion.div>
            );
          })
        )}
      </div>

    </motion.div>
  );
};

export default LiveMapActivity;
