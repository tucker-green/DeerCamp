import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Stand } from '../types';

export function useStands() {
  const { activeClubId } = useAuth();
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeClubId) {
      setStands([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'stands'),
      where('clubId', '==', activeClubId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const standData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Stand));
        setStands(standData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching stands:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [activeClubId]);

  const updateStand = async (standId: string, updates: Partial<Stand>) => {
    try {
      await updateDoc(doc(db, 'stands', standId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      console.error('Error updating stand:', err);
      return { success: false, error: err.message };
    }
  };

  return { stands, loading, error, updateStand };
}
