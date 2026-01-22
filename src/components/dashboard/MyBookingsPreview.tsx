import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../context/AuthContext';
import type { Booking } from '../../types';

interface MyBookingsPreviewProps {
  maxBookings?: number;
}

const formatBookingTime = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const startTimeStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const endTimeStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${dateStr} · ${startTimeStr} - ${endTimeStr}`;
};

const isBookingToday = (startTime: string): boolean => {
  const start = new Date(startTime);
  const today = new Date();
  return (
    start.getDate() === today.getDate() &&
    start.getMonth() === today.getMonth() &&
    start.getFullYear() === today.getFullYear()
  );
};

const isBookingTomorrow = (startTime: string): boolean => {
  const start = new Date(startTime);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    start.getDate() === tomorrow.getDate() &&
    start.getMonth() === tomorrow.getMonth() &&
    start.getFullYear() === tomorrow.getFullYear()
  );
};

const BookingItem = ({ booking }: { booking: Booking }) => {
  const navigate = useNavigate();
  const today = isBookingToday(booking.startTime);
  const tomorrow = isBookingTomorrow(booking.startTime);

  const getStatusBadge = () => {
    if (booking.status === 'checked-in') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
          In Field
        </span>
      );
    }
    if (today) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400">
          Today
        </span>
      );
    }
    if (tomorrow) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-400">
          Tomorrow
        </span>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => navigate('/bookings')}
      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer group transition-colors ${
        today || booking.status === 'checked-in' 
          ? 'bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15' 
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      {/* Stand icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
        today || booking.status === 'checked-in' ? 'bg-emerald-500/20' : 'bg-white/5'
      }`}>
        <TreePine size={18} className={today || booking.status === 'checked-in' ? 'text-emerald-400' : 'text-gray-400'} />
      </div>

      {/* Booking details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-white truncate">{booking.standName}</h4>
          {getStatusBadge()}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} />
          {formatBookingTime(booking.startTime, booking.endTime)}
        </div>

        {booking.huntType && (
          <span className="inline-block mt-1.5 text-[10px] text-gray-500 capitalize">
            {booking.huntType} hunt
          </span>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1" />
    </motion.div>
  );
};

const MyBookingsPreview = ({ maxBookings = 2 }: MyBookingsPreviewProps) => {
  const { user } = useAuth();
  const { bookings, loading } = useBookings({ userId: user?.uid });
  const navigate = useNavigate();

  // Filter to only upcoming/active bookings
  const now = new Date().toISOString();
  const upcomingBookings = bookings
    .filter(b => b.endTime >= now && (b.status === 'confirmed' || b.status === 'checked-in'))
    .slice(0, maxBookings);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-5 rounded-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-36 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-5 rounded-2xl border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Your Hunts</h3>
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          View All
        </button>
      </div>

      {/* Bookings list */}
      {upcomingBookings.length === 0 ? (
        <div className="text-center py-6">
          <TreePine size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No upcoming hunts scheduled</p>
          <button
            onClick={() => navigate('/bookings/new')}
            className="mt-3 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors"
          >
            Book a Stand
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
            >
              <BookingItem booking={booking} />
            </motion.div>
          ))}
          
          {/* Quick book button if less than max */}
          {upcomingBookings.length < maxBookings && (
            <button
              onClick={() => navigate('/bookings/new')}
              className="w-full p-3 rounded-xl border border-dashed border-white/10 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={16} />
              Book Another Hunt
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MyBookingsPreview;
