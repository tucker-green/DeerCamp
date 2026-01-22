/**
 * useParcelBoundaries Hook
 *
 * Fetches and manages public parcel boundary data (like OnX Maps).
 * Supports:
 * - Demo parcels for testing/development
 * - Firestore cached parcels
 * - External API integration (placeholder for services like Regrid)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { ParcelBoundary } from '../types';
import { generateDemoParcels, filterParcelsByBounds } from '../utils/parcelHelpers';

interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface UseParcelBoundariesOptions {
  enableDemo?: boolean;  // Show demo parcels when no real data
  demoCount?: number;    // Number of demo parcels to generate
  cacheToFirestore?: boolean;  // Cache fetched parcels to Firestore
}

interface UseParcelBoundariesReturn {
  parcels: ParcelBoundary[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  fetchParcelsForBounds: (bounds: MapBounds, center: [number, number]) => Promise<void>;
  clearCache: () => Promise<void>;
  setShowParcels: (show: boolean) => void;
  showParcels: boolean;
}

export function useParcelBoundaries(
  clubId?: string,
  options: UseParcelBoundariesOptions = {}
): UseParcelBoundariesReturn {
  const { activeClubId } = useAuth();
  const targetClubId = clubId || activeClubId;

  const {
    enableDemo = true,
    demoCount = 25,
  } = options;

  const [parcels, setParcels] = useState<ParcelBoundary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showParcels, setShowParcels] = useState(true);

  // Track current bounds to avoid refetching same area
  const currentBoundsRef = useRef<MapBounds | null>(null);
  const demoParcelsRef = useRef<ParcelBoundary[]>([]);

  /**
   * Fetch cached parcels from Firestore
   */
  const fetchCachedParcels = useCallback(async (bounds: MapBounds): Promise<ParcelBoundary[]> => {
    if (!targetClubId) return [];

    try {
      // Note: Firestore doesn't support geospatial queries well without GeoHash
      // For now, fetch all cached parcels and filter client-side
      const q = query(
        collection(db, 'cachedParcels'),
        where('clubId', '==', targetClubId)
      );

      const snapshot = await getDocs(q);
      const cached = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as ParcelBoundary));

      return filterParcelsByBounds(cached, bounds);
    } catch (err) {
      console.error('Error fetching cached parcels:', err);
      return [];
    }
  }, [targetClubId]);

  /**
   * Fetch parcels from external API (placeholder for Regrid or similar)
   * In production, this would call a parcel data API
   */
  const fetchFromExternalAPI = useCallback(async (
    _bounds: MapBounds,
    _center: [number, number]
  ): Promise<ParcelBoundary[]> => {
    // TODO: Integrate with Regrid API or similar service
    // Example API call would look like:
    // const response = await fetch(
    //   `https://api.regrid.com/parcels?bbox=${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
    //   { headers: { 'Authorization': `Bearer ${apiKey}` } }
    // );
    // return transformRegridResponse(await response.json());

    console.log('External parcel API not configured. Using demo data.');
    return [];
  }, []);

  /**
   * Main function to fetch parcels for current map bounds
   */
  const fetchParcelsForBounds = useCallback(async (
    bounds: MapBounds,
    center: [number, number]
  ): Promise<void> => {
    // Skip if bounds haven't changed significantly
    if (currentBoundsRef.current) {
      const prev = currentBoundsRef.current;
      const tolerance = 0.001; // About 100m
      if (
        Math.abs(prev.west - bounds.west) < tolerance &&
        Math.abs(prev.south - bounds.south) < tolerance &&
        Math.abs(prev.east - bounds.east) < tolerance &&
        Math.abs(prev.north - bounds.north) < tolerance
      ) {
        return; // Bounds haven't changed enough to refetch
      }
    }

    currentBoundsRef.current = bounds;
    setLoading(true);
    setError(null);

    try {
      // 1. Try to fetch from cached parcels first
      const cached = await fetchCachedParcels(bounds);

      if (cached.length > 0) {
        setParcels(cached);
        setIsDemo(false);
        setLoading(false);
        return;
      }

      // 2. Try external API
      const external = await fetchFromExternalAPI(bounds, center);

      if (external.length > 0) {
        setParcels(external);
        setIsDemo(false);
        setLoading(false);
        return;
      }

      // 3. Fall back to demo parcels if enabled
      if (enableDemo) {
        // Generate or reuse demo parcels
        if (demoParcelsRef.current.length === 0) {
          demoParcelsRef.current = generateDemoParcels(center[0], center[1], demoCount);
        }

        // Filter demo parcels by current bounds
        const filtered = filterParcelsByBounds(demoParcelsRef.current, bounds);
        setParcels(filtered);
        setIsDemo(true);
      } else {
        setParcels([]);
        setIsDemo(false);
      }

    } catch (err) {
      console.error('Error fetching parcels:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parcels');
    } finally {
      setLoading(false);
    }
  }, [fetchCachedParcels, fetchFromExternalAPI, enableDemo, demoCount]);

  /**
   * Clear cached parcels for this club
   */
  const clearCache = useCallback(async (): Promise<void> => {
    if (!targetClubId) return;

    try {
      const q = query(
        collection(db, 'cachedParcels'),
        where('clubId', '==', targetClubId)
      );

      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'cachedParcels', d.id)));
      await Promise.all(deletePromises);

      // Also clear demo parcels
      demoParcelsRef.current = [];
      setParcels([]);
      currentBoundsRef.current = null;
    } catch (err) {
      console.error('Error clearing parcel cache:', err);
    }
  }, [targetClubId]);

  // Generate initial demo parcels when component mounts with a center
  useEffect(() => {
    if (enableDemo && demoParcelsRef.current.length === 0) {
      // Use a default center (will be updated when map loads)
      demoParcelsRef.current = generateDemoParcels(-86.7816, 36.1627, demoCount);
    }
  }, [enableDemo, demoCount]);

  return {
    parcels: showParcels ? parcels : [],
    loading,
    error,
    isDemo,
    fetchParcelsForBounds,
    clearCache,
    setShowParcels,
    showParcels,
  };
}
