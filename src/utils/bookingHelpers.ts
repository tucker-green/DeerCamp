import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Booking } from '../types';

/**
 * Check if a proposed booking conflicts with existing bookings for a stand
 */
export async function checkBookingConflict(
  standId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBooking?: Booking }> {

  // Query for bookings that overlap with the proposed time
  const q = query(
    collection(db, 'bookings'),
    where('standId', '==', standId),
    where('status', 'in', ['confirmed', 'checked-in'])
  );

  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const booking = { id: docSnap.id, ...docSnap.data() } as Booking;

    // Skip if this is the booking we're modifying
    if (excludeBookingId && booking.id === excludeBookingId) {
      continue;
    }

    const existingStart = new Date(booking.startTime);
    const existingEnd = new Date(booking.endTime);

    // Check for overlap
    // Overlap occurs if:
    //   - existing.startTime < proposed.endTime AND
    //   - existing.endTime > proposed.startTime
    if (existingStart < endTime && existingEnd > startTime) {
      return {
        hasConflict: true,
        conflictingBooking: booking
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Validate booking time slot
 */
export function validateBookingTime(
  startTime: Date,
  endTime: Date
): { valid: boolean; error?: string } {

  const now = new Date();

  // Check if start time is in the past
  if (startTime < now) {
    return { valid: false, error: 'Cannot book in the past' };
  }

  // Check if end time is after start time
  if (endTime <= startTime) {
    return { valid: false, error: 'End time must be after start time' };
  }

  // Check if booking is too short (minimum 1 hour)
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  if (durationHours < 1) {
    return { valid: false, error: 'Booking must be at least 1 hour' };
  }

  // Check if booking is too long (maximum 12 hours)
  if (durationHours > 12) {
    return { valid: false, error: 'Booking cannot exceed 12 hours' };
  }

  return { valid: true };
}

/**
 * Format date for display
 */
export function formatBookingDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  // Otherwise return formatted date
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format time range for display
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const startStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const endStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Get hunt type from time
 */
export function getHuntType(startTime: Date): 'morning' | 'evening' | 'all-day' {
  const hour = startTime.getHours();

  if (hour >= 4 && hour < 11) {
    return 'morning';
  } else if (hour >= 14 && hour < 20) {
    return 'evening';
  } else {
    return 'all-day';
  }
}

/**
 * Get sunrise/sunset times (simplified - would use real API in production)
 */
export function getSunTimes(date: Date): { sunrise: string; sunset: string } {
  // This is simplified - in production you'd use a real sunrise/sunset API
  // For now, using approximate times for demonstration
  const sunrise = new Date(date);
  sunrise.setHours(6, 45, 0, 0);

  const sunset = new Date(date);
  sunset.setHours(17, 30, 0, 0);

  return {
    sunrise: sunrise.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    sunset: sunset.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  };
}

/**
 * Check if user can modify/cancel booking
 */
export function canModifyBooking(booking: Booking, userId: string): boolean {
  // User must own the booking
  if (booking.userId !== userId) {
    return false;
  }

  // Cannot modify completed or cancelled bookings
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return false;
  }

  // Cannot modify if already checked in (must check out first)
  if (booking.status === 'checked-in') {
    return false;
  }

  return true;
}
