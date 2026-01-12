import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { PropertyBoundary } from '../types';

export function usePropertyBoundaries(clubId?: string) {
  const [boundaries, setBoundaries] = useState<PropertyBoundary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) {
      setBoundaries([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'propertyBoundaries'),
        where('clubId', '==', clubId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as PropertyBoundary));
          setBoundaries(data);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching property boundaries:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up boundary listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [clubId]);

  const createBoundary = async (
    boundary: Omit<PropertyBoundary, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const docRef = await addDoc(collection(db, 'propertyBoundaries'), {
        ...boundary,
        createdAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating boundary:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateBoundary = async (
    boundaryId: string,
    updates: Partial<Omit<PropertyBoundary, 'id' | 'createdAt' | 'createdBy'>>
  ) => {
    try {
      await updateDoc(doc(db, 'propertyBoundaries', boundaryId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      console.error('Error updating boundary:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const deleteBoundary = async (boundaryId: string) => {
    try {
      await deleteDoc(doc(db, 'propertyBoundaries', boundaryId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting boundary:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return {
    boundaries,
    loading,
    error,
    createBoundary,
    updateBoundary,
    deleteBoundary,
  };
}
