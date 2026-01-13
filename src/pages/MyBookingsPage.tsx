import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyBookings } from '../hooks/useBookings';
import { formatBookingDate, formatTimeRange, canModifyBooking } from '../utils/bookingHelpers';
import { Calendar, Clock, StickyNote, X, CheckCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const { bookings, loading, cancelBooking, checkIn, checkOut } = useMyBookings(user?.uid || '');
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="glass-panel p-8 text-center">
          <p className="text-white">Please log in to view your bookings</p>
        </div>
      </div>
    );
  }

  // Filter bookings
  const now = new Date();
  const filteredBookings = bookings.filter(booking => {
    const startTime = new Date(booking.startTime);

    if (filter === 'upcoming') {
      return startTime >= now && booking.status !== 'cancelled' && booking.status !== 'completed';
    } else if (filter === 'past') {
      return startTime < now || booking.status === 'completed';
    } else {
      return booking.status === 'cancelled';
    }
  });

  const handleCancelBooking = async (bookingId: string) => {
    const result = await cancelBooking(bookingId, cancelReason || 'Cancelled by user');
    if (result.success) {
      setCancellingId(null);
      setCancelReason('');
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    await checkIn(bookingId);
  };

  const handleCheckOut = async (bookingId: string) => {
    await checkOut(bookingId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Calendar className="text-green-400" size={36} />
              My Bookings
            </h1>
            <Link to="/bookings/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                New Booking
              </motion.button>
            </Link>
          </div>
          <p className="text-gray-400">Manage your upcoming and past hunts</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'upcoming'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Upcoming ({bookings.filter(b => new Date(b.startTime) >= now && b.status !== 'cancelled' && b.status !== 'completed').length})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'past'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Past ({bookings.filter(b => new Date(b.startTime) < now || b.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'cancelled'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Calendar className="text-gray-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">
              {filter === 'upcoming' && 'No Upcoming Bookings'}
              {filter === 'past' && 'No Past Bookings'}
              {filter === 'cancelled' && 'No Cancelled Bookings'}
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'upcoming' && 'You don\'t have any upcoming hunts scheduled'}
              {filter === 'past' && 'You haven\'t completed any hunts yet'}
              {filter === 'cancelled' && 'You don\'t have any cancelled bookings'}
            </p>
            {filter === 'upcoming' && (
              <Link to="/bookings/new">
                <button className="btn btn-primary">
                  Book Your First Hunt
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredBookings.map(booking => {
                const canModify = canModifyBooking(booking, user.uid);
                const isPast = new Date(booking.startTime) < now;

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`glass-panel p-6 border-2 ${
                      booking.status === 'cancelled'
                        ? 'border-red-500/30'
                        : booking.status === 'checked-in'
                        ? 'border-blue-500/50'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">{booking.standName}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'confirmed'
                                ? 'bg-green-500/20 text-green-400'
                                : booking.status === 'checked-in'
                                ? 'bg-blue-500/20 text-blue-400'
                                : booking.status === 'completed'
                                ? 'bg-gray-500/20 text-gray-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {booking.status.toUpperCase().replace('-', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar size={16} className="text-green-400" />
                            <span>{formatBookingDate(booking.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock size={16} className="text-green-400" />
                            <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                          </div>
                          {booking.huntType && (
                            <div className="flex items-center gap-2 text-gray-300 capitalize">
                              {booking.huntType === 'morning' && '🌅'}
                              {booking.huntType === 'evening' && '🌄'}
                              {booking.huntType === 'all-day' && '☀️'}
                              <span>{booking.huntType} Hunt</span>
                            </div>
                          )}
                        </div>

                        {booking.notes && (
                          <div className="mt-3 flex items-start gap-2 text-sm">
                            <StickyNote size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-400 italic">"{booking.notes}"</span>
                          </div>
                        )}

                        {booking.checkInTime && (
                          <div className="mt-3 text-sm text-blue-400">
                            Checked in at {new Date(booking.checkInTime).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isPast && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCheckIn(booking.id)}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Check In
                          </button>
                        )}

                        {booking.status === 'checked-in' && (
                          <button
                            onClick={() => handleCheckOut(booking.id)}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Check Out
                          </button>
                        )}

                        {canModify && (
                          <button
                            onClick={() => setCancellingId(booking.id)}
                            className="btn btn-secondary flex items-center gap-2"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        )}
                      </div>
                    )}

                    {/* Cancel Modal */}
                    {cancellingId === booking.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        <h4 className="text-white font-bold mb-2">Cancel this booking?</h4>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Reason for cancellation (optional)"
                          rows={2}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setCancellingId(null);
                              setCancelReason('');
                            }}
                            className="flex-1 btn btn-secondary"
                          >
                            Nevermind
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            Confirm Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBookingsPage;
