import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Stand } from '../types';
import { useBookings } from '../hooks/useBookings';
import { getSunTimes } from '../utils/bookingHelpers';
import { Calendar, StickyNote, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NewBookingPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const { createBooking } = useBookings();

  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedStandId, setSelectedStandId] = useState(searchParams.get('standId') || '');
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') ? new Date(searchParams.get('date')!).toISOString().split('T')[0] : ''
  );
  const [timeSlot, setTimeSlot] = useState(searchParams.get('time') || 'morning');
  const [notes, setNotes] = useState('');

  // Fetch stands
  useEffect(() => {
    const fetchStands = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'stands'));
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user || !profile) {
      setError('You must be logged in to create a booking');
      setLoading(false);
      return;
    }

    if (!selectedStandId || !selectedDate) {
      setError('Please select a stand and date');
      setLoading(false);
      return;
    }

    const stand = stands.find(s => s.id === selectedStandId);
    if (!stand) {
      setError('Invalid stand selected');
      setLoading(false);
      return;
    }

    try {
      // Create start and end times based on time slot
      const date = new Date(selectedDate);
      let startTime: Date;
      let endTime: Date;

      if (timeSlot === 'morning') {
        startTime = new Date(date);
        startTime.setHours(5, 0, 0, 0);
        endTime = new Date(date);
        endTime.setHours(11, 0, 0, 0);
      } else if (timeSlot === 'evening') {
        startTime = new Date(date);
        startTime.setHours(15, 0, 0, 0);
        endTime = new Date(date);
        endTime.setHours(20, 0, 0, 0);
      } else {
        // all-day
        startTime = new Date(date);
        startTime.setHours(5, 0, 0, 0);
        endTime = new Date(date);
        endTime.setHours(20, 0, 0, 0);
      }

      const result = await createBooking({
        standId: stand.id,
        standName: stand.name,
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
  const sunTimes = selectedDate ? getSunTimes(new Date(selectedDate)) : null;

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
            Book a Stand
          </h1>
          <p className="text-gray-400 mt-2">Reserve your spot for an upcoming hunt</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-8">

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stand Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Select Stand *
            </label>
            <select
              value={selectedStandId}
              onChange={(e) => setSelectedStandId(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
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

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Select Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
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
              <label className={`glass-panel p-4 cursor-pointer transition-all border-2 ${
                timeSlot === 'morning'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/10 hover:border-green-500/30'
              }`}>
                <input
                  type="radio"
                  name="timeSlot"
                  value="morning"
                  checked={timeSlot === 'morning'}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">🌅</div>
                  <div className="font-bold text-white mb-1">Morning</div>
                  <div className="text-sm text-gray-400">5:00am - 11:00am</div>
                </div>
              </label>

              <label className={`glass-panel p-4 cursor-pointer transition-all border-2 ${
                timeSlot === 'evening'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/10 hover:border-green-500/30'
              }`}>
                <input
                  type="radio"
                  name="timeSlot"
                  value="evening"
                  checked={timeSlot === 'evening'}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">🌄</div>
                  <div className="font-bold text-white mb-1">Evening</div>
                  <div className="text-sm text-gray-400">3:00pm - 8:00pm</div>
                </div>
              </label>

              <label className={`glass-panel p-4 cursor-pointer transition-all border-2 ${
                timeSlot === 'all-day'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/10 hover:border-green-500/30'
              }`}>
                <input
                  type="radio"
                  name="timeSlot"
                  value="all-day"
                  checked={timeSlot === 'all-day'}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="font-bold text-white mb-1">All Day</div>
                  <div className="text-sm text-gray-400">5:00am - 8:00pm</div>
                </div>
              </label>
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
                    {new Date(selectedDate).toLocaleDateString('en-US', {
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

      </div>
    </div>
  );
};

export default NewBookingPage;
