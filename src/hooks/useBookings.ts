import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Booking } from '../types';
import { checkBookingConflict, validateBookingTime } from '../utils/bookingHelpers';

interface UseBookingsOptions {
  standId?: string;
  userId?: string;
  date?: Date;
  status?: string;
}

export function useBookings(options: UseBookingsOptions = {}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Build query
    let q = query(collection(db, 'bookings'), orderBy('startTime', 'asc'));

    // Apply filters
    if (options.standId) {
      q = query(q, where('standId', '==', options.standId));
    }
    if (options.userId) {
      q = query(q, where('userId', '==', options.userId));
    }
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    // Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let bookingData = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Booking));

        // Filter by date if provided
        if (options.date) {
          const dateStr = options.date.toISOString().split('T')[0];
          bookingData = bookingData.filter(b =>
            b.startTime.startsWith(dateStr)
          );
        }

        setBookings(bookingData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching bookings:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [options.standId, options.userId, options.date, options.status]);

  /**
   * Create a new booking
   */
  const createBooking = async (bookingData: {
    standId: string;
    standName: string;
    userId: string;
    userName: string;
    startTime: Date;
    endTime: Date;
    huntType?: 'morning' | 'evening' | 'all-day';
    notes?: string;
  }) => {
    try {
      // Validate times
      const validation = validateBookingTime(bookingData.startTime, bookingData.endTime);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Check for conflicts
      const conflict = await checkBookingConflict(
        bookingData.standId,
        bookingData.startTime,
        bookingData.endTime
      );

      if (conflict.hasConflict) {
        throw new Error(
          `This stand is already booked by ${conflict.conflictingBooking?.userName} during this time`
        );
      }

      // Create booking
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'bookings'), {
        standId: bookingData.standId,
        standName: bookingData.standName,
        userId: bookingData.userId,
        userName: bookingData.userName,
        startTime: bookingData.startTime.toISOString(),
        endTime: bookingData.endTime.toISOString(),
        status: 'confirmed',
        huntType: bookingData.huntType,
        notes: bookingData.notes || '',
        createdAt: now,
        updatedAt: now
      });

      return { success: true, bookingId: docRef.id };
    } catch (err: any) {
      console.error('Error creating booking:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Update a booking
   */
  const updateBooking = async (
    bookingId: string,
    updates: Partial<Booking>
  ) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      console.error('Error updating booking:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Cancel a booking
   */
  const cancelBooking = async (
    bookingId: string,
    reason?: string
  ) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason || 'Cancelled by user',
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Check in to a booking
   */
  const checkIn = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'checked-in',
        checkInTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      console.error('Error checking in:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Check out from a booking
   */
  const checkOut = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'completed',
        checkOutTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      console.error('Error checking out:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Delete a booking (hard delete - use sparingly)
   */
  const deleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting booking:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    cancelBooking,
    checkIn,
    checkOut,
    deleteBooking
  };
}

/**
 * Hook to get bookings for a specific date
 */
export function useBookingsByDate(date: Date) {
  return useBookings({ date });
}

/**
 * Hook to get bookings for a specific user
 */
export function useMyBookings(userId: string) {
  return useBookings({ userId, status: undefined });
}

/**
 * Hook to get bookings for a specific stand
 */
export function useStandBookings(standId: string) {
  return useBookings({ standId });
}
