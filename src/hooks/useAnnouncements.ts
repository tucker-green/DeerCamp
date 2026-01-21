import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';

interface UseAnnouncementsOptions {
  pinnedOnly?: boolean;
  limit?: number;
}

export function useAnnouncements(options: UseAnnouncementsOptions = {}) {
  const { activeClubId } = useAuth();
  const [announcements, setAnnouncements] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { pinnedOnly = true, limit = 5 } = options;

  useEffect(() => {
    if (!activeClubId) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Build query for announcements
    let q = query(
      collection(db, 'posts'),
      where('clubId', '==', activeClubId),
      where('type', '==', 'announcement'),
      orderBy('createdAt', 'desc')
    );

    // Apply limit
    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let announcementData = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Post));

        // Filter to only pinned if requested
        if (pinnedOnly) {
          const now = new Date().toISOString();
          announcementData = announcementData.filter(a => {
            if (!a.isPinned) return false;
            // Check if pin has expired
            if (a.pinnedUntil && a.pinnedUntil < now) return false;
            return true;
          });
        }

        setAnnouncements(announcementData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching announcements:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [activeClubId, pinnedOnly, limit]);

  return {
    announcements,
    loading,
    error
  };
}

/**
 * Get pinned announcements for dashboard
 */
export function usePinnedAnnouncements(limit: number = 3) {
  return useAnnouncements({ pinnedOnly: true, limit });
}
