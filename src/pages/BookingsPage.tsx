import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookingsByDate } from '../hooks/useBookings';
import { useStands } from '../hooks/useStands';
import { formatBookingDate, getSunTimes } from '../utils/bookingHelpers';
import { Calendar, Plus, ChevronLeft, ChevronRight, Sun, Moon, MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import NoClubSelected from '../components/NoClubSelected';
import AddStandModal from '../components/AddStandModal';
import MyBookingsPreview from '../components/dashboard/MyBookingsPreview';

const BookingsPage = () => {
  const { user, activeClubId, activeMembership } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddStandOpen, setIsAddStandOpen] = useState(false);
  const [selectedStandId, setSelectedStandId] = useState<string | null>(null);
  const [isStandsExpanded, setIsStandsExpanded] = useState(true);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);

  const { bookings } = useBookingsByDate(selectedDate);
  const { stands, loading: standsLoading } = useStands();

  const isAdmin = activeMembership?.role === 'owner' || activeMembership?.role === 'manager';

  // Get booking for a specific stand and time slot
  const getBookingForStand = (standId: string, timeSlot: 'morning' | 'evening') => {
    return bookings.find(b => {
      if (b.standId !== standId) return false;
      if (b.status === 'cancelled') return false;

      const startHour = new Date(b.startTime).getHours();
      if (timeSlot === 'morning' && startHour >= 4 && startHour < 11) return true;
      if (timeSlot === 'evening' && startHour >= 14 && startHour < 20) return true;
      return false;
    });
  };

  // Navigate dates
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const end = new Date(endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${start} - ${end}`;
  };

  const sunTimes = getSunTimes(selectedDate);
  const selectedStand = useMemo(
    () => stands.find(stand => stand.id === selectedStandId) || null,
    [stands, selectedStandId]
  );

  const bookedStands = useMemo(
    () =>
      bookings
        .filter(booking => booking.status !== 'cancelled' && booking.status !== 'no-show')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [bookings]
  );

  // Show empty state if no club selected
  if (!activeClubId) {
    return <NoClubSelected title="No Club Selected" message="Select or join a club to view and create bookings." />;
  }

  if (standsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading stands...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 sm:p-6 pb-32 sm:pb-20 safe-bottom">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                <Calendar className="text-green-400" size={36} />
                Stand Board
              </h1>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">
                See what's available and who's hunting where
              </p>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddStandOpen(true)}
                  className="btn bg-white/10 hover:bg-white/20 text-white border-white/5 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <MapPin size={20} className="text-green-400" />
                  Add Stand
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsQuickBookOpen(true)}
                className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus size={20} />
                Book a Stand
              </motion.button>
            </div>
          </div>
        </div>

        <AddStandModal
          isOpen={isAddStandOpen}
          onClose={() => setIsAddStandOpen(false)}
        />

        <div className="mb-6 sm:mb-8">
          <MyBookingsPreview maxBookings={3} />
        </div>

        {/* Date Navigator */}
        <div className="glass-panel p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-3 items-center gap-2 sm:flex sm:items-center sm:justify-between sm:gap-4 mb-3 sm:mb-4">
            <button
              onClick={goToPreviousDay}
              className="btn btn-secondary flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm w-full sm:w-auto"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous Day</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <div className="text-center">
              <h2 className="text-base sm:text-2xl font-bold text-white leading-tight">
                {formatBookingDate(selectedDate.toISOString())}
              </h2>
              <p className="text-[10px] sm:text-sm text-gray-400">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <button
              onClick={goToNextDay}
              className="btn btn-secondary flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Next Day</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={goToToday}
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              Jump to Today
            </button>
            <div className="flex items-center justify-center gap-3 sm:gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Sun size={16} />
                <span>Sunrise: {sunTimes.sunrise}</span>
              </div>
              <div className="flex items-center gap-2">
                <Moon size={16} />
                <span>Sunset: {sunTimes.sunset}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booked Stands */}
        <div className="glass-panel p-4 sm:p-5 mt-6 sm:mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-green-400" size={18} />
            <h3 className="text-base sm:text-lg font-bold text-white">Booked Stands</h3>
          </div>
          {bookedStands.length === 0 ? (
            <p className="text-sm text-gray-400">No stands booked for this day.</p>
          ) : (
            <div className="space-y-2">
              {bookedStands.map(booking => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 bg-white/5 rounded-xl px-3 py-2 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-green-400" />
                    <span className="text-sm text-white font-medium">{booking.standName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span>{booking.userName}</span>
                    <span className="text-gray-600">•</span>
                    <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Book Modal */}
        {isQuickBookOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1d16] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div>
                  <h3 className="text-lg font-bold text-white">Book a Stand</h3>
                  <p className="text-xs text-gray-400">Pick a time slot</p>
                </div>
                <button
                  onClick={() => setIsQuickBookOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{formatBookingDate(selectedDate.toISOString())}</span>
                  <span className="text-xs text-gray-500">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-2">
                  <Link
                    to={`/bookings/new?date=${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}&time=morning`}
                    className="w-full btn btn-primary flex items-center justify-between px-4 py-3 rounded-xl"
                    onClick={() => setIsQuickBookOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Sun size={16} className="text-yellow-400" />
                      <span>Morning</span>
                    </div>
                    <span className="text-xs text-gray-300">5:00am - 11:00am</span>
                  </Link>

                  <Link
                    to={`/bookings/new?date=${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}&time=evening`}
                    className="w-full btn btn-primary flex items-center justify-between px-4 py-3 rounded-xl"
                    onClick={() => setIsQuickBookOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Moon size={16} className="text-orange-400" />
                      <span>Evening</span>
                    </div>
                    <span className="text-xs text-gray-300">3:00pm - 8:00pm</span>
                  </Link>

                  <Link
                    to={`/bookings/new?date=${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}&time=all-day`}
                    className="w-full btn btn-secondary flex items-center justify-between px-4 py-3 rounded-xl"
                    onClick={() => setIsQuickBookOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Sun size={16} className="text-yellow-400" />
                      <span>All Day</span>
                    </div>
                    <span className="text-xs text-gray-300">5:00am - 8:00pm</span>
                  </Link>
                </div>

                <button
                  onClick={() => setIsQuickBookOpen(false)}
                  className="w-full btn btn-secondary py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stands */}
        <div className="mb-6 sm:mb-8 mt-6 sm:mt-8">
          <button
            type="button"
            onClick={() => setIsStandsExpanded(prev => !prev)}
            className="w-full flex items-center justify-between gap-3 glass-panel px-4 py-3 sm:px-5 sm:py-4 mb-3 sm:mb-4"
          >
            <div className="flex items-center gap-2">
              <MapPin className="text-green-400" size={22} />
              <span className="text-lg sm:text-xl font-bold text-white">Stands</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <span>{stands.length} total</span>
              <ChevronRight
                size={18}
                className={`transition-transform ${isStandsExpanded ? 'rotate-90' : ''}`}
              />
            </div>
          </button>

          {isStandsExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {stands.map(stand => {
              const morningBooking = getBookingForStand(stand.id, 'morning');
              const eveningBooking = getBookingForStand(stand.id, 'evening');
              const isMorningAvailable = !morningBooking;
              const isEveningAvailable = !eveningBooking;

              return (
                <motion.div
                  key={stand.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel p-3 border border-white/10 transition-all hover:border-white/20 flex flex-col"
                >
                  <div className="mb-2.5">
                    <h4 className="text-base font-bold text-white truncate">{stand.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {stand.type} Stand
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {/* Morning Slot */}
                    <div
                      className={`rounded-lg p-1.5 border transition-colors flex flex-col items-center justify-center text-center ${
                        isMorningAvailable
                          ? 'bg-green-500/5 border-green-500/20 text-green-400'
                          : morningBooking?.userId === user?.uid
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : 'bg-red-500/5 border-red-500/20 text-red-400'
                      }`}
                    >
                      <span className="text-[8px] font-bold opacity-60 uppercase tracking-tighter mb-0.5">Morning</span>
                      <span className="text-[10px] font-black uppercase">
                        {isMorningAvailable ? 'Open' : morningBooking?.userId === user?.uid ? 'Yours' : 'Booked'}
                      </span>
                    </div>

                    {/* Evening Slot */}
                    <div
                      className={`rounded-lg p-1.5 border transition-colors flex flex-col items-center justify-center text-center ${
                        isEveningAvailable
                          ? 'bg-green-500/5 border-green-500/20 text-green-400'
                          : eveningBooking?.userId === user?.uid
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : 'bg-red-500/5 border-red-500/20 text-red-400'
                      }`}
                    >
                      <span className="text-[8px] font-bold opacity-60 uppercase tracking-tighter mb-0.5">Evening</span>
                      <span className="text-[10px] font-black uppercase">
                        {isEveningAvailable ? 'Open' : eveningBooking?.userId === user?.uid ? 'Yours' : 'Booked'}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full py-2 text-xs font-bold mt-auto"
                    onClick={() => setSelectedStandId(stand.id)}
                  >
                    Book This
                  </button>
                </motion.div>
              );
              })}
            </div>
          )}
        </div>

        {/* Booking Time Modal */}
        {selectedStand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1d16] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div>
                  <h3 className="text-lg font-bold text-white">Book {selectedStand.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{selectedStand.type} Stand</p>
                </div>
                <button
                  onClick={() => setSelectedStandId(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{formatBookingDate(selectedDate.toISOString())}</span>
                  <span className="text-xs text-gray-500">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {(() => {
                  const morningBooking = getBookingForStand(selectedStand.id, 'morning');
                  const eveningBooking = getBookingForStand(selectedStand.id, 'evening');
                  const isMorningAvailable = !morningBooking;
                  const isEveningAvailable = !eveningBooking;

                  return (
                    <div className="space-y-2">
                      {isMorningAvailable ? (
                        <Link
                          to={`/bookings/new?standId=${selectedStand.id}&date=${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}&time=morning`}
                          className="w-full btn btn-primary flex items-center justify-between px-4 py-3 rounded-xl"
                          onClick={() => setSelectedStandId(null)}
                        >
                          <div className="flex items-center gap-2">
                            <Sun size={16} className="text-yellow-400" />
                            <span>Morning</span>
                          </div>
                          <span className="text-xs text-gray-300">5:00am - 11:00am</span>
                        </Link>
                      ) : (
                        <button
                          className="w-full btn btn-secondary flex items-center justify-between px-4 py-3 rounded-xl opacity-70 cursor-not-allowed"
                          disabled
                        >
                          <div className="flex items-center gap-2">
                            <Sun size={16} className="text-yellow-400" />
                            <span>Morning</span>
                          </div>
                          <span className="text-xs text-gray-400">Booked</span>
                        </button>
                      )}
                      {!isMorningAvailable && (
                        <p className="text-xs text-gray-500">
                          {morningBooking?.userId === user?.uid ? 'You already booked this morning.' : 'Morning slot is booked.'}
                        </p>
                      )}

                      {isEveningAvailable ? (
                        <Link
                          to={`/bookings/new?standId=${selectedStand.id}&date=${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}&time=evening`}
                          className="w-full btn btn-primary flex items-center justify-between px-4 py-3 rounded-xl"
                          onClick={() => setSelectedStandId(null)}
                        >
                          <div className="flex items-center gap-2">
                            <Moon size={16} className="text-orange-400" />
                            <span>Evening</span>
                          </div>
                          <span className="text-xs text-gray-300">3:00pm - 8:00pm</span>
                        </Link>
                      ) : (
                        <button
                          className="w-full btn btn-secondary flex items-center justify-between px-4 py-3 rounded-xl opacity-70 cursor-not-allowed"
                          disabled
                        >
                          <div className="flex items-center gap-2">
                            <Moon size={16} className="text-orange-400" />
                            <span>Evening</span>
                          </div>
                          <span className="text-xs text-gray-400">Booked</span>
                        </button>
                      )}
                      {!isEveningAvailable && (
                        <p className="text-xs text-gray-500">
                          {eveningBooking?.userId === user?.uid ? 'You already booked this evening.' : 'Evening slot is booked.'}
                        </p>
                      )}
                    </div>
                  );
                })()}

                <button
                  onClick={() => setSelectedStandId(null)}
                  className="w-full btn btn-secondary py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingsPage;
