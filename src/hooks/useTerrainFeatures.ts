import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { TerrainFeature } from '../types';

export function useTerrainFeatures(clubId?: string) {
  const { activeClubId } = useAuth();
  const [features, setFeatures] = useState<TerrainFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetClubId = clubId || activeClubId;

  useEffect(() => {
    if (!targetClubId) {
      setFeatures([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'terrainFeatures'),
        where('clubId', '==', targetClubId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as TerrainFeature));
          setFeatures(data);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching terrain features:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up terrain feature listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [targetClubId]);

  const createFeature = async (
    feature: Omit<TerrainFeature, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const docRef = await addDoc(collection(db, 'terrainFeatures'), {
        ...feature,
        createdAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating terrain feature:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateFeature = async (
    featureId: string,
    updates: Partial<Omit<TerrainFeature, 'id' | 'createdAt' | 'createdBy'>>
  ) => {
    try {
      await updateDoc(doc(db, 'terrainFeatures', featureId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      console.error('Error updating terrain feature:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const deleteFeature = async (featureId: string) => {
    try {
      await deleteDoc(doc(db, 'terrainFeatures', featureId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting terrain feature:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return {
    features,
    loading,
    error,
    createFeature,
    updateFeature,
    deleteFeature,
  };
}
