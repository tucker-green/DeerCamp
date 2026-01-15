import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Stand } from '../types';
import { useBookings } from '../hooks/useBookings';
import { getSunTimes } from '../utils/bookingHelpers';
import { Calendar, StickyNote, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from '../components/DatePicker';

const NewBookingPage = () => {
  const navigate = useNavigate();
  const { user, profile, activeClubId } = useAuth();
  const [searchParams] = useSearchParams();
  const { createBooking } = useBookings();

  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedStandId, setSelectedStandId] = useState(searchParams.get('standId') || '');
  // Parse date param - if it's already YYYY-MM-DD format, use it directly
  // This avoids timezone issues from Date parsing
  const [selectedDate, setSelectedDate] = useState(() => {
    const dateParam = searchParams.get('date');
    if (!dateParam) return '';
    // If it looks like YYYY-MM-DD, use it directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return dateParam;
    }
    // Otherwise parse and extract local date components
    const parsed = new Date(dateParam);
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  });
  const [timeSlot, setTimeSlot] = useState(searchParams.get('time') || 'morning');
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatLocalDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Fetch stands
  useEffect(() => {
    const fetchStands = async () => {
      if (!activeClubId) return;

      try {
        const q = query(
          collection(db, 'stands'),
          where('clubId', '==', activeClubId)
        );
        const snapshot = await getDocs(q);
        const standData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Stand));
        setStands(standData);
      } catch (error) {
        console.error('Error fetching stands:', error);
      }
    };

    fetchStands();
  }, [activeClubId]);

  // Sync state with search params
  useEffect(() => {
    const standId = searchParams.get('standId');
    const dateParam = searchParams.get('date');
    const time = searchParams.get('time');

    if (standId) setSelectedStandId(standId);
    if (dateParam) {
      // If it's already YYYY-MM-DD, use it directly
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        setSelectedDate(dateParam);
      } else {
        // Parse and extract local date components
        const parsed = new Date(dateParam);
        setSelectedDate(`${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`);
      }
    }
    if (time) setTimeSlot(time);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !profile) {
      setError('You must be logged in to create a booking');
      return;
    }

    if (!selectedStandId || !selectedDate) {
      setError('Please select a stand and date');
      return;
    }

    const stand = stands.find(s => s.id === selectedStandId);
    if (!stand) {
      setError('Invalid stand selected');
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmBooking = async () => {
    setError(null);
    setLoading(true);
    setConfirmOpen(false);

    try {
      // Create start and end times based on time slot
      // Parse the date string (YYYY-MM-DD) as LOCAL date components to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      let startTime: Date;
      let endTime: Date;

      if (timeSlot === 'morning') {
        startTime = new Date(year, month - 1, day, 5, 0, 0, 0);
        endTime = new Date(year, month - 1, day, 11, 0, 0, 0);
      } else if (timeSlot === 'evening') {
        startTime = new Date(year, month - 1, day, 15, 0, 0, 0);
        endTime = new Date(year, month - 1, day, 20, 0, 0, 0);
      } else {
        // all-day
        startTime = new Date(year, month - 1, day, 5, 0, 0, 0);
        endTime = new Date(year, month - 1, day, 20, 0, 0, 0);
      }

      const stand = stands.find(s => s.id === selectedStandId);
      if (!stand) {
        setError('Invalid stand selected');
        return;
      }

      const result = await createBooking({
        standId: stand.id,
        standName: stand.name,
        clubId: stand.clubId,
        userId: user.uid,
        userName: profile.displayName,
        startTime,
        endTime,
        huntType: timeSlot as 'morning' | 'evening' | 'all-day',
        notes
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create booking');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const selectedStand = stands.find(s => s.id === selectedStandId);
  const sunTimes = selectedDate ? getSunTimes(parseLocalDate(selectedDate)) : null;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-12 text-center max-w-md"
        >
          <CheckCircle className="text-green-400 mx-auto mb-6" size={80} />
          <h2 className="text-3xl font-bold text-white mb-3">Booking Confirmed!</h2>
          <p className="text-gray-400 mb-6">
            Your hunt has been booked successfully. Redirecting...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/bookings')}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Stand Board
          </button>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Calendar className="text-green-400" size={36} />
            {searchParams.get('standId') && selectedStand
              ? `Book ${selectedStand.name}`
              : 'Book a Stand'}
          </h1>
          <p className="text-gray-400 mt-2">
            {searchParams.get('standId') && selectedStand
              ? `Reserve your time at the ${selectedStand.type} stand`
              : 'Reserve your spot for an upcoming hunt'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-8">

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stand Selection - Only show if NOT pre-selected */}
          {!searchParams.get('standId') && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Select Stand *
              </label>
              <select
                value={selectedStandId}
                onChange={(e) => setSelectedStandId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 appearance-none"
                required
              >
                <option value="">Choose a stand...</option>
                {stands.map(stand => (
                  <option key={stand.id} value={stand.id}>
                    {stand.name} ({stand.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Select Date *
            </label>
            <DatePicker
              selectedDate={selectedDate ? parseLocalDate(selectedDate) : null}
              onChange={(date) => setSelectedDate(formatLocalDate(date))}
              minDate={new Date()}
              required
            />
            {sunTimes && (
              <p className="text-sm text-gray-400 mt-2">
                Sunrise: {sunTimes.sunrise} | Sunset: {sunTimes.sunset}
              </p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-3">
              Time Slot *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setTimeSlot('morning')}
                className={`glass-panel p-4 cursor-pointer transition-all border-2 ${timeSlot === 'morning'
                  ? '!bg-green-500/20 border-green-500'
                  : 'border-white/10 hover:border-green-500/30'
                  }`}
                role="radio"
                aria-checked={timeSlot === 'morning'}
                tabIndex={0}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🌅</div>
                  <div className="font-bold text-white mb-1">Morning</div>
                  <div className="text-sm text-gray-400">5:00am - 11:00am</div>
                </div>
              </div>

              <div
                onClick={() => setTimeSlot('evening')}
                className={`glass-panel p-4 cursor-pointer transition-all border-2 ${timeSlot === 'evening'
                  ? '!bg-green-500/20 border-green-500'
                  : 'border-white/10 hover:border-green-500/30'
                  }`}
                role="radio"
                aria-checked={timeSlot === 'evening'}
                tabIndex={0}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🌄</div>
                  <div className="font-bold text-white mb-1">Evening</div>
                  <div className="text-sm text-gray-400">3:00pm - 8:00pm</div>
                </div>
              </div>

              <div
                onClick={() => setTimeSlot('all-day')}
                className={`glass-panel p-4 cursor-pointer transition-all border-2 ${timeSlot === 'all-day'
                  ? '!bg-green-500/20 border-green-500'
                  : 'border-white/10 hover:border-green-500/30'
                  }`}
                role="radio"
                aria-checked={timeSlot === 'all-day'}
                tabIndex={0}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="font-bold text-white mb-1">All Day</div>
                  <div className="text-sm text-gray-400">5:00am - 8:00pm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
              <StickyNote size={16} />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Bringing my son for his first hunt, Testing new bow, etc."
              rows={3}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
            />
          </div>

          {/* Summary */}
          {selectedStand && selectedDate && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stand:</span>
                  <span className="text-white font-medium">{selectedStand.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white font-medium">
                    {parseLocalDate(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white font-medium capitalize">{timeSlot}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="flex-1 btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={loading || !selectedStandId || !selectedDate}
            >
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </div>

        </form>

        {confirmOpen && selectedStand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="glass-panel w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Booking</h2>
              <p className="text-gray-400 mb-4">
                Please confirm these details before booking.
              </p>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stand:</span>
                  <span className="text-white font-medium">{selectedStand.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white font-medium">
                    {selectedDate
                      ? parseLocalDate(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white font-medium capitalize">{timeSlot}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 btn btn-secondary"
                  onClick={() => setConfirmOpen(false)}
                  disabled={loading}
                >
                  Go Back
                </button>
                <button
                  type="button"
                  className="flex-1 btn btn-primary"
                  onClick={handleConfirmBooking}
                  disabled={loading}
                >
                  {loading ? 'Creating Booking...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div >
    </div >
  );
};

export default NewBookingPage;
