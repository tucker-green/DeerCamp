import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMyBookings } from '../hooks/useBookings';
import WhosHuntingDashboard from '../components/WhosHuntingDashboard';
import { formatTimeRange } from '../utils/bookingHelpers';

export default function CheckInOutPage() {
  const { user } = useAuth();
  const { bookings, loading, checkIn, checkOut } = useMyBookings(user?.uid || '');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  // Get today's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    return bookingDate >= today && bookingDate < tomorrow && booking.status !== 'cancelled' && booking.status !== 'completed';
  });

  const confirmedBookings = todaysBookings.filter(b => b.status === 'confirmed');
  const checkedInBookings = todaysBookings.filter(b => b.status === 'checked-in');

  const handleCheckIn = async (bookingId: string) => {
    setCheckingIn(bookingId);
    await checkIn(bookingId);
    setCheckingIn(null);
  };

  const handleCheckOut = async (bookingId: string) => {
    setCheckingOut(bookingId);
    await checkOut(bookingId);
    setCheckingOut(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f0a] via-[#1a1d1a] to-[#0a0f0a] flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-white">Please log in to check in/out</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f0a] via-[#1a1d1a] to-[#0a0f0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f0a] via-[#1a1d1a] to-[#0a0f0a] p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-transparent bg-clip-text">
            Check In / Check Out
          </h1>
          <p className="text-gray-400">Quick access to sign in and out when hunting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Check In Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <LogIn className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Check In</h2>
                <p className="text-sm text-gray-400">Start your hunt</p>
              </div>
            </div>

            {confirmedBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto text-gray-500 mb-3" size={48} />
                <p className="text-gray-400">No bookings to check in today</p>
                <p className="text-sm text-gray-500 mt-2">
                  You must have a booking to check in
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {confirmedBookings.map(booking => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg mb-2">{booking.standName}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock size={14} />
                            <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                          </div>
                          {booking.notes && (
                            <p className="text-xs text-gray-500 italic mt-2">"{booking.notes}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCheckIn(booking.id)}
                      disabled={checkingIn === booking.id}
                      className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {checkingIn === booking.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Checking In...
                        </>
                      ) : (
                        <>
                          <LogIn size={18} />
                          Check In Now
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Check Out Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <LogOut className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Check Out</h2>
                <p className="text-sm text-gray-400">End your hunt</p>
              </div>
            </div>

            {checkedInBookings.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto text-gray-500 mb-3" size={48} />
                <p className="text-gray-400">You're not checked in</p>
                <p className="text-sm text-gray-500 mt-2">
                  Check in to a booking first
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkedInBookings.map(booking => {
                  const checkedInTime = new Date(booking.checkInTime || booking.startTime);
                  const duration = Math.floor((Date.now() - checkedInTime.getTime()) / (1000 * 60));
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg mb-2">{booking.standName}</h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-blue-400">
                              <MapPin size={14} />
                              <span>Currently Hunting</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock size={14} />
                              <span>
                                {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} on property
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Checked in at {checkedInTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        disabled={checkingOut === booking.id}
                        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {checkingOut === booking.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Checking Out...
                          </>
                        ) : (
                          <>
                            <LogOut size={18} />
                            Check Out Now
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Who's Hunting Dashboard */}
        <div className="mb-6">
          <WhosHuntingDashboard />
        </div>

        {/* Info Card */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-yellow-200">
              <p className="font-semibold mb-1">Safety Reminder</p>
              <p>Always check in when arriving and check out when leaving the property. This helps us ensure everyone's safety.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
