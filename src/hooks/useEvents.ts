import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit as firestoreLimit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';

interface UseEventsOptions {
  limit?: number;
  includeAllDay?: boolean;
  includePast?: boolean;
}

export function useEvents(options: UseEventsOptions = {}) {
  const { activeClubId } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { limit = 10, includePast = false } = options;

  useEffect(() => {
    if (!activeClubId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get current time for filtering
    const now = new Date().toISOString();

    // Build query for upcoming events
    let q = query(
      collection(db, 'events'),
      where('clubId', '==', activeClubId),
      orderBy('startTime', 'asc')
    );

    // Apply limit
    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let eventData = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Event));

        // Filter out past events unless includePast is true
        if (!includePast) {
          eventData = eventData.filter(event => {
            const endTime = event.endTime || event.startTime;
            return endTime >= now;
          });
        }

        // Filter out cancelled events
        eventData = eventData.filter(event => !event.cancelledAt);

        setEvents(eventData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching events:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [activeClubId, limit, includePast]);

  return {
    events,
    loading,
    error
  };
}

/**
 * Get upcoming events (next 5 by default)
 */
export function useUpcomingEvents(limit: number = 5) {
  return useEvents({ limit, includePast: false });
}

/**
 * Format event date for display
 */
export function formatEventDate(startTime: string, endTime?: string, allDay?: boolean): string {
  const start = new Date(startTime);
  
  if (allDay) {
    return start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  const timeStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return `${dateStr} at ${timeStr}`;
}

/**
 * Check if an event is happening today
 */
export function isEventToday(startTime: string): boolean {
  const start = new Date(startTime);
  const today = new Date();
  return (
    start.getDate() === today.getDate() &&
    start.getMonth() === today.getMonth() &&
    start.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if an event is happening soon (within next 24 hours)
 */
export function isEventSoon(startTime: string): boolean {
  const start = new Date(startTime);
  const now = new Date();
  const diff = start.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours > 0 && hours <= 24;
}
