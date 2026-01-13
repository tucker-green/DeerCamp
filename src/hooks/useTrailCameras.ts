import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { TrailCamera } from '../types';

export function useTrailCameras(clubId?: string) {
  const { activeClubId } = useAuth();
  const [cameras, setCameras] = useState<TrailCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetClubId = clubId || activeClubId;

  useEffect(() => {
    if (!targetClubId) {
      setCameras([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'trailCameras'),
        where('clubId', '==', targetClubId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as TrailCamera));
          setCameras(data);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching trail cameras:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up trail camera listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [targetClubId]);

  const createCamera = async (
    camera: Omit<TrailCamera, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const docRef = await addDoc(collection(db, 'trailCameras'), {
        ...camera,
        createdAt: new Date().toISOString(),
      });
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error creating trail camera:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateCamera = async (
    cameraId: string,
    updates: Partial<Omit<TrailCamera, 'id' | 'createdAt' | 'createdBy'>>
  ) => {
    try {
      await updateDoc(doc(db, 'trailCameras', cameraId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      console.error('Error updating trail camera:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const deleteCamera = async (cameraId: string) => {
    try {
      await deleteDoc(doc(db, 'trailCameras', cameraId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting trail camera:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return {
    cameras,
    loading,
    error,
    createCamera,
    updateCamera,
    deleteCamera,
  };
}
