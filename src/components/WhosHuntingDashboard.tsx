import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, User, AlertTriangle } from 'lucide-react';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import type { Booking } from '../types';

interface ActiveHunter {
  booking: Booking;
  duration: string;
  isOverdue: boolean;
}

export default function WhosHuntingDashboard() {
  const { user } = useAuth();
  const { bookings, loading } = useBookings({ status: 'checked-in' });
  const [activeHunters, setActiveHunters] = useState<ActiveHunter[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Process bookings to get active hunters with duration and overdue status
  useEffect(() => {
    const hunters: ActiveHunter[] = bookings.map(booking => {
      const checkInTime = new Date(booking.checkInTime || booking.startTime);
      const expectedEndTime = new Date(booking.endTime);
      const durationMs = currentTime.getTime() - checkInTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      let duration = '';
      if (durationHours > 0) {
        duration = `${durationHours}h ${durationMinutes}m`;
      } else {
        duration = `${durationMinutes}m`;
      }

      // Check if overdue (1 hour past expected end time)
      const overdueThreshold = new Date(expectedEndTime);
      overdueThreshold.setHours(overdueThreshold.getHours() + 1);
      const isOverdue = currentTime > overdueThreshold;

      return {
        booking,
        duration,
        isOverdue
      };
    });

    setActiveHunters(hunters);
  }, [bookings, currentTime]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        </div>
      </div>
    );
  }

  if (activeHunters.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="text-green-400" size={24} />
          <h2 className="text-xl font-bold text-white">Who's Hunting</h2>
        </div>
        <div className="text-center py-8">
          <User className="mx-auto text-gray-500 mb-3" size={48} />
          <p className="text-gray-400">No one is currently checked in</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="text-green-400" size={24} />
          <h2 className="text-xl font-bold text-white">Who's Hunting</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={16} />
          <span>{activeHunters.length} active</span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {activeHunters.map(({ booking, duration, isOverdue }) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                p-4 rounded-xl border transition-all
                ${isOverdue
                  ? 'bg-red-500/10 border-red-500/30'
                  : booking.userId === user?.uid
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">
                      {booking.userName}
                      {booking.userId === user?.uid && (
                        <span className="ml-2 text-xs text-green-400">(You)</span>
                      )}
                    </h3>
                    {isOverdue && (
                      <div className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertTriangle size={14} />
                        <span>Overdue</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <MapPin size={14} />
                    <span>{booking.standName}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Hunting for {duration}</span>
                    </div>
                    <div>
                      <span>
                        Checked in: {new Date(booking.checkInTime || booking.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {isOverdue && (
                  <button className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors">
                    Contact
                  </button>
                )}
              </div>

              {booking.notes && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 italic">"{booking.notes}"</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Safety Warning for Overdue Hunters */}
      {activeHunters.some(h => h.isOverdue) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-red-400 mb-1">Safety Alert</h4>
              <p className="text-sm text-red-300">
                {activeHunters.filter(h => h.isOverdue).length} hunter(s) are overdue for checkout.
                Please verify their safety.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Update Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span>Live updates</span>
      </div>
    </div>
  );
}
