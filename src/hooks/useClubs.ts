import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    setDoc,
    updateDoc,
    doc,
    getDocs,
    orderBy,
    limit,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Club } from '../types';

interface UseClubsOptions {
    userId?: string;      // Fetch clubs for a specific user
    isPublic?: boolean;   // Fetch only public/private clubs
    limit?: number;       // Limit results
}

export function useClubs(options: UseClubsOptions = {}) {
    const { user } = useAuth();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        try {
            let q = query(collection(db, 'clubs'));

            // Filter by user's clubs if userId provided
            if (options.userId) {
                // Will query clubMemberships to get club IDs
                const loadUserClubs = async () => {
                    const membershipsQuery = query(
                        collection(db, 'clubMemberships'),
                        where('userId', '==', options.userId),
                        where('membershipStatus', 'in', ['active', 'pending'])
                    );
                    const snapshot = await getDocs(membershipsQuery);
                    const clubIds = snapshot.docs.map(doc => doc.data().clubId);

                    if (clubIds.length === 0) {
                        setClubs([]);
                        setLoading(false);
                        return;
                    }

                    // Fetch clubs
                    const clubsQuery = query(
                        collection(db, 'clubs'),
                        where('__name__', 'in', clubIds)
                    );

                    const unsubscribe = onSnapshot(
                        clubsQuery,
                        (snapshot) => {
                            const clubData = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            } as Club));
                            setClubs(clubData);
                            setLoading(false);
                        },
                        (err) => {
                            console.error('Error fetching user clubs:', err);
                            setError(err.message);
                            setLoading(false);
                        }
                    );

                    return unsubscribe;
                };

                loadUserClubs();
                return;
            }

            // Filter by public/private
            if (typeof options.isPublic !== 'undefined') {
                q = query(q, where('isPublic', '==', options.isPublic));
            }

            // Sort by member count for discovery
            if (typeof options.isPublic !== 'undefined' && options.isPublic) {
                q = query(q, orderBy('memberCount', 'desc'));
            }

            // Apply limit
            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const clubData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Club));
                    setClubs(clubData);
                    setLoading(false);
                },
                (err) => {
                    console.error('Error fetching clubs:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err: any) {
            console.error('Error setting up clubs listener:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [options.userId, options.isPublic, options.limit]);

    /**
     * Create a new club
     */
    const createClub = async (clubData: {
        name: string;
        description?: string;
        isPublic: boolean;
        requiresApproval: boolean;
        location?: {
            city?: string;
            state?: string;
            lat?: number;
            lng?: number;
        };
        tags?: string[];
        propertyAcres?: number;
        allowGuests: boolean;
        guestPolicy?: string;
        maxMembers?: number;
    }) => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const now = new Date().toISOString();

            // Create club document
            const clubRef = await addDoc(collection(db, 'clubs'), {
                ...clubData,
                ownerId: user.uid,
                memberCount: 1,
                createdAt: now,
                updatedAt: now
            });

            // Create ClubMembership for owner
            // CRITICAL: ID must be {clubId}_{userId} to match security rules
            const membershipId = `${clubRef.id}_${user.uid}`;
            await setDoc(doc(db, 'clubMemberships', membershipId), {
                userId: user.uid,
                clubId: clubRef.id,
                role: 'owner',
                membershipTier: 'full',
                membershipStatus: 'active',
                approvalStatus: 'approved',
                joinDate: now,
                createdAt: now
            });

            // Update user's clubIds array
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();
            const clubIds = userData?.clubIds || [];

            await updateDoc(userRef, {
                clubIds: [...clubIds, clubRef.id],
                // Set as active club if this is the user's first club
                ...(clubIds.length === 0 ? { activeClubId: clubRef.id } : {}),
                updatedAt: now
            });

            return { success: true, clubId: clubRef.id };
        } catch (err: any) {
            console.error('Error creating club:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * Update club details
     */
    const updateClub = async (
        clubId: string,
        updates: Partial<Club>
    ) => {
        try {
            await updateDoc(doc(db, 'clubs', clubId), {
                ...updates,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (err: any) {
            console.error('Error updating club:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * Search public clubs
     */
    const searchPublicClubs = async (searchTerm: string) => {
        try {
            // Simple text search - in production, use a search service like Algolia
            const q = query(
                collection(db, 'clubs'),
                where('isPublic', '==', true)
            );

            const snapshot = await getDocs(q);
            const results = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Club))
                .filter(club =>
                    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    club.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                );

            return { success: true, clubs: results };
        } catch (err: any) {
            console.error('Error searching clubs:', err);
            return { success: false, error: err.message, clubs: [] };
        }
    };

    return {
        clubs,
        loading,
        error,
        createClub,
        updateClub,
        searchPublicClubs
    };
}

// Convenience hooks

/**
 * Get all clubs for the current user
 */
export function useMyClubs() {
    const { user } = useAuth();
    return useClubs({ userId: user?.uid });
}

/**
 * Get public clubs for discovery
 */
export function usePublicClubs(limitResults?: number) {
    return useClubs({ isPublic: true, limit: limitResults });
}

/**
 * Get a single club by ID
 */
export async function getClubById(clubId: string): Promise<Club | null> {
    try {
        const clubDoc = await getDoc(doc(db, 'clubs', clubId));
        if (!clubDoc.exists()) return null;

        return {
            id: clubDoc.id,
            ...clubDoc.data()
        } as Club;
    } catch (err: any) {
        console.error('Error fetching club:', err);
        return null;
    }
}
