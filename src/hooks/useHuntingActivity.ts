import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Booking } from '../types';

export interface ActivityDataPoint {
  label: string;
  checkIns: number;
  hunters: number;
}

export interface HuntingActivityStats {
  totalCheckIns: number;
  totalHunters: Set<string>;
  peakDay: string;
  averagePerDay: number;
}

/**
 * Hook to get hunting activity data based on check-ins
 * Shows activity over the last 7 days
 */
export function useHuntingActivity() {
  const { activeClubId } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeClubId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get bookings from the last 30 days for trend data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const q = query(
      collection(db, 'bookings'),
      where('clubId', '==', activeClubId),
      where('status', 'in', ['checked-in', 'completed']),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingData = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Booking));

        // Filter to last 30 days
        const filteredBookings = bookingData.filter(b => 
          b.checkInTime && b.checkInTime >= thirtyDaysAgoStr
        );

        setBookings(filteredBookings);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching hunting activity:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [activeClubId]);

  // Calculate activity data for the last 7 days
  const activityData = useMemo((): ActivityDataPoint[] => {
    const days: ActivityDataPoint[] = [];
    const today = new Date();
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get day label (Mon, Tue, etc.)
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count check-ins for this day
      const dayBookings = bookings.filter(b => {
        if (!b.checkInTime) return false;
        const checkInDate = b.checkInTime.split('T')[0];
        return checkInDate === dateStr;
      });

      // Count unique hunters
      const uniqueHunters = new Set(dayBookings.map(b => b.userId));

      days.push({
        label: dayLabel,
        checkIns: dayBookings.length,
        hunters: uniqueHunters.size
      });
    }

    return days;
  }, [bookings]);

  // Calculate stats
  const stats = useMemo((): HuntingActivityStats => {
    const totalCheckIns = activityData.reduce((sum, d) => sum + d.checkIns, 0);
    const allHunters = new Set<string>();
    bookings.forEach(b => allHunters.add(b.userId));
    
    // Find peak day
    const peakDay = activityData.reduce((max, d) => 
      d.checkIns > max.checkIns ? d : max, 
      activityData[0] || { label: '-', checkIns: 0, hunters: 0 }
    );

    const averagePerDay = activityData.length > 0 
      ? Math.round(totalCheckIns / activityData.length * 10) / 10 
      : 0;

    return {
      totalCheckIns,
      totalHunters: allHunters,
      peakDay: peakDay?.label || '-',
      averagePerDay
    };
  }, [activityData, bookings]);

  return { activityData, stats, loading, error };
}
