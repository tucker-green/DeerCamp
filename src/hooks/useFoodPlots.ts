import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { FoodPlot } from '../types';

export function useFoodPlots(clubId?: string) {
  const { activeClubId } = useAuth();
  const [foodPlots, setFoodPlots] = useState<FoodPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetClubId = clubId || activeClubId;

  useEffect(() => {
    if (!targetClubId) {
      setFoodPlots([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'foodPlots'),
        where('clubId', '==', targetClubId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as FoodPlot));
          setFoodPlots(data);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching food plots:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up food plot listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [targetClubId]);

  const createFoodPlot = async (
    plot: Omit<FoodPlot, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const docRef = await addDoc(collection(db, 'foodPlots'), {
        ...plot,
        createdAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating food plot:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateFoodPlot = async (
    plotId: string,
    updates: Partial<Omit<FoodPlot, 'id' | 'createdAt' | 'createdBy'>>
  ) => {
    try {
      await updateDoc(doc(db, 'foodPlots', plotId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      console.error('Error updating food plot:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const deleteFoodPlot = async (plotId: string) => {
    try {
      await deleteDoc(doc(db, 'foodPlots', plotId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting food plot:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return {
    foodPlots,
    loading,
    error,
    createFoodPlot,
    updateFoodPlot,
    deleteFoodPlot,
  };
}
