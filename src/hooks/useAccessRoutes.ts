import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { AccessRoute } from '../types';

export function useAccessRoutes(clubId?: string) {
  const [routes, setRoutes] = useState<AccessRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) {
      setRoutes([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'accessRoutes'),
        where('clubId', '==', clubId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as AccessRoute));
          setRoutes(data);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching access routes:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up access route listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [clubId]);

  const createRoute = async (
    route: Omit<AccessRoute, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const docRef = await addDoc(collection(db, 'accessRoutes'), {
        ...route,
        createdAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating access route:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateRoute = async (
    routeId: string,
    updates: Partial<Omit<AccessRoute, 'id' | 'createdAt' | 'createdBy'>>
  ) => {
    try {
      await updateDoc(doc(db, 'accessRoutes', routeId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      console.error('Error updating access route:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const deleteRoute = async (routeId: string) => {
    try {
      await deleteDoc(doc(db, 'accessRoutes', routeId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting access route:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return {
    routes,
    loading,
    error,
    createRoute,
    updateRoute,
    deleteRoute,
  };
}
