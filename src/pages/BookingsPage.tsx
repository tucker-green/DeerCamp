import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Stand, Booking } from '../types';
import { useBookingsByDate } from '../hooks/useBookings';
import { formatBookingDate, getSunTimes } from '../utils/bookingHelpers';
import { Calendar, Plus, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const BookingsPage = () => {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);

  const { bookings } = useBookingsByDate(selectedDate);

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stands:', error);
        setLoading(false);
      }
    };

    fetchStands();
  }, []);

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

  const sunTimes = getSunTimes(selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading stands...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Calendar className="text-green-400" size={36} />
              Stand Board
            </h1>
            <Link to="/bookings/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Book a Stand
              </motion.button>
            </Link>
          </div>
          <p className="text-gray-400">See what's available and who's hunting where</p>
        </div>

        {/* Date Navigator */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousDay}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Previous Day
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">
                {formatBookingDate(selectedDate.toISOString())}
              </h2>
              <p className="text-sm text-gray-400">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <button
              onClick={goToNextDay}
              className="btn btn-secondary flex items-center gap-2"
            >
              Next Day
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm">
            <button
              onClick={goToToday}
              className="text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              Jump to Today
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <Sun size={16} />
              <span>Sunrise: {sunTimes.sunrise}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Moon size={16} />
              <span>Sunset: {sunTimes.sunset}</span>
            </div>
          </div>
        </div>

        {/* Morning Hunts */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sun className="text-yellow-400" size={24} />
            Morning Hunts (5:00am - 11:00am)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stands.map(stand => {
              const booking = getBookingForStand(stand.id, 'morning');
              const isAvailable = !booking;
              const isYourBooking = booking?.userId === user?.uid;

              return (
                <motion.div
                  key={`${stand.id}-morning`}
                  whileHover={{ scale: 1.02 }}
                  className={`glass-panel p-5 border-2 transition-all ${
                    isAvailable
                      ? 'border-green-500/30 hover:border-green-500/50'
                      : isYourBooking
                      ? 'border-blue-500/50'
                      : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-bold text-white">{stand.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isAvailable
                          ? 'bg-green-500/20 text-green-400'
                          : isYourBooking
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {isAvailable ? 'AVAILABLE' : isYourBooking ? 'YOUR BOOKING' : 'BOOKED'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 capitalize">
                    {stand.type} Stand
                  </p>

                  {booking ? (
                    <div className="space-y-2">
                      <p className="text-white font-medium">{booking.userName}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(booking.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}{' '}
                        -{' '}
                        {new Date(booking.endTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-gray-500 italic">"{booking.notes}"</p>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={`/bookings/new?standId=${stand.id}&date=${selectedDate.toISOString()}&time=morning`}
                    >
                      <button className="btn btn-primary w-full mt-2">Book This</button>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Evening Hunts */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Moon className="text-orange-400" size={24} />
            Evening Hunts (3:00pm - 8:00pm)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stands.map(stand => {
              const booking = getBookingForStand(stand.id, 'evening');
              const isAvailable = !booking;
              const isYourBooking = booking?.userId === user?.uid;

              return (
                <motion.div
                  key={`${stand.id}-evening`}
                  whileHover={{ scale: 1.02 }}
                  className={`glass-panel p-5 border-2 transition-all ${
                    isAvailable
                      ? 'border-green-500/30 hover:border-green-500/50'
                      : isYourBooking
                      ? 'border-blue-500/50'
                      : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-bold text-white">{stand.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isAvailable
                          ? 'bg-green-500/20 text-green-400'
                          : isYourBooking
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {isAvailable ? 'AVAILABLE' : isYourBooking ? 'YOUR BOOKING' : 'BOOKED'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 capitalize">
                    {stand.type} Stand
                  </p>

                  {booking ? (
                    <div className="space-y-2">
                      <p className="text-white font-medium">{booking.userName}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(booking.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}{' '}
                        -{' '}
                        {new Date(booking.endTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-gray-500 italic">"{booking.notes}"</p>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={`/bookings/new?standId=${stand.id}&date=${selectedDate.toISOString()}&time=evening`}
                    >
                      <button className="btn btn-primary w-full mt-2">Book This</button>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="glass-panel p-4 mt-8">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">Your Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-300">Booked</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingsPage;
