import { useState, useEffect, useMemo } from 'react';
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
import type { Harvest } from '../types';

interface UseHarvestsOptions {
  userId?: string;
  species?: Harvest['species'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface HarvestStats {
  totalCount: number;
  totalWeight: number;
  bySpecies: Record<string, number>;
  byMonth: Record<string, number>;
}

export function useHarvests(options: UseHarvestsOptions = {}) {
  const { activeClubId } = useAuth();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeClubId) {
      setHarvests([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Build base query
    let q = query(
      collection(db, 'harvests'),
      where('clubId', '==', activeClubId),
      orderBy('date', 'desc')
    );

    // Apply limit if provided
    if (options.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let harvestData = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Harvest));

        // Filter by userId if provided
        if (options.userId) {
          harvestData = harvestData.filter(h => h.userId === options.userId);
        }

        // Filter by species if provided
        if (options.species) {
          harvestData = harvestData.filter(h => h.species === options.species);
        }

        // Filter by date range if provided
        if (options.startDate) {
          const startStr = options.startDate.toISOString().split('T')[0];
          harvestData = harvestData.filter(h => h.date >= startStr);
        }
        if (options.endDate) {
          const endStr = options.endDate.toISOString().split('T')[0];
          harvestData = harvestData.filter(h => h.date <= endStr);
        }

        setHarvests(harvestData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching harvests:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [activeClubId, options.userId, options.species, options.startDate?.getTime(), options.endDate?.getTime(), options.limit]);

  // Compute statistics from harvests
  const stats = useMemo((): HarvestStats => {
    const totalCount = harvests.length;
    const totalWeight = harvests.reduce((sum, h) => sum + (h.weight || 0), 0);
    
    const bySpecies: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    harvests.forEach(h => {
      // Count by species
      bySpecies[h.species] = (bySpecies[h.species] || 0) + 1;

      // Count by month (format: "2024-01" for Jan 2024)
      if (h.date) {
        const monthKey = h.date.substring(0, 7);
        byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
      }
    });

    return { totalCount, totalWeight, bySpecies, byMonth };
  }, [harvests]);

  return {
    harvests,
    loading,
    error,
    stats
  };
}

/**
 * Hook to get harvests for the current hunting season
 * Hunting season typically runs Sep 1 - Jan 31
 */
export function useSeasonHarvests() {
  // Memoize dates to prevent infinite re-renders
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // If we're in Jan-Aug, the season started last year
    // If we're in Sep-Dec, the season started this year
    const seasonStartYear = currentMonth < 8 ? currentYear - 1 : currentYear;
    const seasonEndYear = seasonStartYear + 1;

    return {
      startDate: new Date(seasonStartYear, 8, 1), // Sep 1
      endDate: new Date(seasonEndYear, 0, 31) // Jan 31
    };
  }, []); // Empty deps - season dates don't change during session

  return useHarvests({ startDate, endDate });
}

/**
 * Hook to get recent harvests with a limit
 */
export function useRecentHarvests(limit: number = 5) {
  return useHarvests({ limit });
}

/**
 * Hook to get a user's harvests
 */
export function useMyHarvests(userId: string) {
  return useHarvests({ userId });
}

/**
 * Get harvest trend data for charts
 * Returns array of { month, count, weight } for the hunting season
 */
export function useHarvestTrend() {
  const { harvests, loading, error } = useSeasonHarvests();

  // Memoize season start year to avoid recalculating
  const seasonStartYear = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    return currentMonth < 8 ? currentYear - 1 : currentYear;
  }, []);

  const trendData = useMemo(() => {
    // Generate month labels for hunting season (Sep - Jan)
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

    return months.map((month, index) => {
      // Sep=8, Oct=9, Nov=10, Dec=11, Jan=0
      const monthNum = index < 4 ? 8 + index : 0;
      const year = index < 4 ? seasonStartYear : seasonStartYear + 1;
      const monthKey = `${year}-${String(monthNum + 1).padStart(2, '0')}`;

      const monthHarvests = harvests.filter(h => h.date?.startsWith(monthKey));
      const count = monthHarvests.length;
      const weight = monthHarvests.reduce((sum, h) => sum + (h.weight || 0), 0);

      return { month, count, weight };
    });
  }, [harvests, seasonStartYear]);

  const totalWeight = useMemo(() => {
    return harvests.reduce((sum, h) => sum + (h.weight || 0), 0);
  }, [harvests]);

  return { trendData, totalWeight, loading, error };
}

/**
 * Leaderboard entry for top harvesters
 */
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  harvestCount: number;
  totalWeight: number;
}

/**
 * Club record entry
 */
export interface ClubRecord {
  type: 'heaviest' | 'most-points' | 'biggest-spread';
  harvest: Harvest;
  label: string;
  value: string;
}

/**
 * Get leaderboard and records for the current season
 */
export function useClubLeaderboard() {
  const { harvests, loading, error } = useSeasonHarvests();

  const leaderboard = useMemo((): LeaderboardEntry[] => {
    // Group harvests by user
    const byUser: Record<string, { userName: string; count: number; weight: number }> = {};

    harvests.forEach(h => {
      if (!byUser[h.userId]) {
        byUser[h.userId] = { userName: h.userName, count: 0, weight: 0 };
      }
      byUser[h.userId].count += 1;
      byUser[h.userId].weight += h.weight || 0;
    });

    // Convert to array and sort by count
    return Object.entries(byUser)
      .map(([userId, data]) => ({
        userId,
        userName: data.userName,
        harvestCount: data.count,
        totalWeight: data.weight
      }))
      .sort((a, b) => b.harvestCount - a.harvestCount)
      .slice(0, 5); // Top 5
  }, [harvests]);

  const records = useMemo((): ClubRecord[] => {
    const result: ClubRecord[] = [];

    // Find heaviest deer
    const deerHarvests = harvests.filter(h => h.species === 'deer' && h.weight);
    if (deerHarvests.length > 0) {
      const heaviest = deerHarvests.reduce((max, h) => 
        (h.weight || 0) > (max.weight || 0) ? h : max
      );
      result.push({
        type: 'heaviest',
        harvest: heaviest,
        label: 'Heaviest Deer',
        value: `${heaviest.weight} lbs`
      });
    }

    // Find most points (for bucks)
    const buckHarvests = harvests.filter(h => 
      h.species === 'deer' && h.sex === 'male' && h.deerData?.points
    );
    if (buckHarvests.length > 0) {
      const mostPoints = buckHarvests.reduce((max, h) => 
        (h.deerData?.points || 0) > (max.deerData?.points || 0) ? h : max
      );
      result.push({
        type: 'most-points',
        harvest: mostPoints,
        label: 'Most Points',
        value: `${mostPoints.deerData?.points} pt buck`
      });
    }

    // Find biggest spread
    const spreadHarvests = harvests.filter(h => 
      h.species === 'deer' && h.deerData?.spread
    );
    if (spreadHarvests.length > 0) {
      const biggestSpread = spreadHarvests.reduce((max, h) => 
        (h.deerData?.spread || 0) > (max.deerData?.spread || 0) ? h : max
      );
      result.push({
        type: 'biggest-spread',
        harvest: biggestSpread,
        label: 'Biggest Spread',
        value: `${biggestSpread.deerData?.spread}" spread`
      });
    }

    return result;
  }, [harvests]);

  return { leaderboard, records, loading, error };
}
