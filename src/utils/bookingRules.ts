import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Booking } from '../types';

/**
 * Booking Rules Configuration
 * These can be customized per club in the future
 */
export interface BookingRulesConfig {
  maxDaysInAdvance?: number; // Max days ahead you can book (default: 30)
  maxConsecutiveDays?: number; // Max consecutive days per member (default: 3)
  minAdvanceHours?: number; // Minimum hours in advance to book (default: 24)
  blackoutDates?: Date[]; // Dates when booking is not allowed
  guestBookingRestrictions?: {
    allowGuests: boolean;
    requiresApproval: boolean;
    maxGuestDays?: number;
  };
}

/**
 * Default booking rules
 * Note: minAdvanceHours of 0 allows same-day bookings (but still validates against start time)
 */
const DEFAULT_RULES: BookingRulesConfig = {
  maxDaysInAdvance: 30,
  maxConsecutiveDays: 3,
  minAdvanceHours: 0, // Allow same-day bookings - validateBookingTime handles past-time check
  blackoutDates: [],
  guestBookingRestrictions: {
    allowGuests: true,
    requiresApproval: true,
    maxGuestDays: 2
  }
};

/**
 * Validate booking against club rules
 */
export async function validateBookingRules(
  bookingData: {
    userId: string;
    standId: string;
    startTime: Date;
    endTime: Date;
    clubId: string;
    isGuest?: boolean;
  },
  rulesConfig: BookingRulesConfig = DEFAULT_RULES
): Promise<{ valid: boolean; error?: string }> {

  const now = new Date();
  const { startTime, userId, standId, clubId, isGuest } = bookingData;

  // Rule 1: Check max days in advance
  if (rulesConfig.maxDaysInAdvance) {
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + rulesConfig.maxDaysInAdvance);

    if (startTime > maxDate) {
      return {
        valid: false,
        error: `Bookings can only be made ${rulesConfig.maxDaysInAdvance} days in advance`
      };
    }
  }

  // Rule 2: Check minimum advance hours
  if (rulesConfig.minAdvanceHours) {
    const minDate = new Date(now);
    minDate.setHours(minDate.getHours() + rulesConfig.minAdvanceHours);

    if (startTime < minDate) {
      return {
        valid: false,
        error: `Bookings must be made at least ${rulesConfig.minAdvanceHours} hours in advance`
      };
    }
  }

  // Rule 3: Check blackout dates (use local date comparison)
  if (rulesConfig.blackoutDates && rulesConfig.blackoutDates.length > 0) {
    const isBlackedOut = rulesConfig.blackoutDates.some(blackoutDate => {
      return blackoutDate.getFullYear() === startTime.getFullYear() &&
        blackoutDate.getMonth() === startTime.getMonth() &&
        blackoutDate.getDate() === startTime.getDate();
    });

    if (isBlackedOut) {
      return {
        valid: false,
        error: 'This date is not available for booking (work day, special event, etc.)'
      };
    }
  }

  // Rule 4: Check consecutive days limit
  if (rulesConfig.maxConsecutiveDays) {
    const consecutiveCheck = await checkConsecutiveDays(
      userId,
      standId,
      clubId,
      startTime,
      rulesConfig.maxConsecutiveDays
    );

    if (!consecutiveCheck.valid) {
      return consecutiveCheck;
    }
  }

  // Rule 5: Guest booking restrictions
  if (isGuest && rulesConfig.guestBookingRestrictions) {
    const guestRules = rulesConfig.guestBookingRestrictions;

    if (!guestRules.allowGuests) {
      return {
        valid: false,
        error: 'Guest bookings are not allowed'
      };
    }

    // Check if guest has exceeded max days
    if (guestRules.maxGuestDays) {
      const guestDaysCheck = await checkGuestBookingLimit(
        userId,
        clubId,
        guestRules.maxGuestDays
      );

      if (!guestDaysCheck.valid) {
        return guestDaysCheck;
      }
    }
  }

  return { valid: true };
}

/**
 * Check if user has exceeded consecutive days limit
 */
async function checkConsecutiveDays(
  userId: string,
  standId: string,
  clubId: string,
  proposedStartTime: Date,
  maxConsecutiveDays: number
): Promise<{ valid: boolean; error?: string }> {

  // Get user's bookings for this stand in the past and future
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('standId', '==', standId),
    where('clubId', '==', clubId),
    where('status', 'in', ['confirmed', 'checked-in'])
  );

  const snapshot = await getDocs(q);
  const bookings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Booking));

  // Sort bookings by start time
  bookings.sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Check consecutive days around the proposed booking (use local date)
  const proposedTime = new Date(
    proposedStartTime.getFullYear(),
    proposedStartTime.getMonth(),
    proposedStartTime.getDate()
  );

  // Count consecutive days before proposed date
  let daysBefore = 0;
  for (let i = 1; i <= maxConsecutiveDays; i++) {
    const checkDate = new Date(proposedTime);
    checkDate.setDate(checkDate.getDate() - i);

    const hasBooking = bookings.some(b => {
      const bookingDate = new Date(b.startTime);
      return bookingDate.getFullYear() === checkDate.getFullYear() &&
        bookingDate.getMonth() === checkDate.getMonth() &&
        bookingDate.getDate() === checkDate.getDate();
    });

    if (hasBooking) {
      daysBefore++;
    } else {
      break; // Break on first gap
    }
  }

  // Count consecutive days after proposed date
  let daysAfter = 0;
  for (let i = 1; i <= maxConsecutiveDays; i++) {
    const checkDate = new Date(proposedTime);
    checkDate.setDate(checkDate.getDate() + i);

    const hasBooking = bookings.some(b => {
      const bookingDate = new Date(b.startTime);
      return bookingDate.getFullYear() === checkDate.getFullYear() &&
        bookingDate.getMonth() === checkDate.getMonth() &&
        bookingDate.getDate() === checkDate.getDate();
    });

    if (hasBooking) {
      daysAfter++;
    } else {
      break; // Break on first gap
    }
  }

  // Total consecutive days including proposed booking
  const totalConsecutiveDays = daysBefore + 1 + daysAfter;

  if (totalConsecutiveDays > maxConsecutiveDays) {
    return {
      valid: false,
      error: `You can only book this stand for ${maxConsecutiveDays} consecutive days. You already have ${daysBefore > 0 ? daysBefore + ' days before' : ''}${daysAfter > 0 ? (daysBefore > 0 ? ' and ' : '') + daysAfter + ' days after' : ''} this date.`
    };
  }

  return { valid: true };
}

/**
 * Check if guest has exceeded their booking limit
 */
async function checkGuestBookingLimit(
  userId: string,
  clubId: string,
  maxGuestDays: number
): Promise<{ valid: boolean; error?: string }> {

  // Count guest bookings in current season (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('clubId', '==', clubId),
    where('status', 'in', ['confirmed', 'checked-in', 'completed'])
  );

  const snapshot = await getDocs(q);
  const bookings = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking))
    .filter(b => new Date(b.startTime) >= ninetyDaysAgo);

  // Count unique days
  const uniqueDays = new Set(
    bookings.map(b => b.startTime.split('T')[0])
  );

  if (uniqueDays.size >= maxGuestDays) {
    return {
      valid: false,
      error: `Guest bookings are limited to ${maxGuestDays} days per season. You have used ${uniqueDays.size} days.`
    };
  }

  return { valid: true };
}

/**
 * Check if date is a blackout date (uses local date comparison)
 */
export function isBlackoutDate(
  date: Date,
  blackoutDates: Date[]
): boolean {
  return blackoutDates.some(blackoutDate => {
    return blackoutDate.getFullYear() === date.getFullYear() &&
      blackoutDate.getMonth() === date.getMonth() &&
      blackoutDate.getDate() === date.getDate();
  });
}

/**
 * Get next available booking date for a stand
 */
export async function getNextAvailableDate(
  standId: string,
  clubId: string,
  startDate: Date = new Date()
): Promise<Date> {

  const checkDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    6, 0, 0, 0
  ); // Start checking from 6 AM local time

  // Check up to 30 days ahead
  for (let i = 0; i < 30; i++) {
    const q = query(
      collection(db, 'bookings'),
      where('standId', '==', standId),
      where('clubId', '==', clubId),
      where('status', 'in', ['confirmed', 'checked-in'])
    );

    const snapshot = await getDocs(q);
    const hasBooking = snapshot.docs.some(doc => {
      const booking = doc.data() as Booking;
      const bookingDate = new Date(booking.startTime);
      return bookingDate.getFullYear() === checkDate.getFullYear() &&
        bookingDate.getMonth() === checkDate.getMonth() &&
        bookingDate.getDate() === checkDate.getDate();
    });

    if (!hasBooking) {
      return checkDate;
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  // If no available date found in 30 days, return date 30 days out
  return checkDate;
}
