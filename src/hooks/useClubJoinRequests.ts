import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    getDoc,
    arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { ClubJoinRequest, JoinRequestStatus, MembershipTier } from '../types';

interface UseClubJoinRequestsOptions {
    clubId?: string;
    userId?: string;
    status?: JoinRequestStatus;
}

export function useClubJoinRequests(options: UseClubJoinRequestsOptions = {}) {
    const { activeClubId, user } = useAuth();
    const [requests, setRequests] = useState<ClubJoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const targetClubId = options.clubId || activeClubId;

    useEffect(() => {
        if (!targetClubId && !options.userId) {
            setRequests([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let q = query(collection(db, 'clubJoinRequests'));

            // Filter by club
            if (targetClubId) {
                q = query(q, where('clubId', '==', targetClubId));
            }

            // Filter by user
            if (options.userId) {
                q = query(q, where('userId', '==', options.userId));
            }

            // Filter by status
            if (options.status) {
                q = query(q, where('status', '==', options.status));
            }

            // Sort by creation date (newest first)
            q = query(q, orderBy('createdAt', 'desc'));

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const requestData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as ClubJoinRequest));
                    setRequests(requestData);
                    setLoading(false);
                },
                (err) => {
                    console.error('Error fetching join requests:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err: any) {
            console.error('Error setting up join requests listener:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [targetClubId, options.userId, options.status]);

    /**
     * Submit a join request to a public club
     */
    const submitJoinRequest = async (
        clubId: string,
        message?: string
    ) => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            // Check if user already has a pending request
            const existingRequests = await getDocs(
                query(
                    collection(db, 'clubJoinRequests'),
                    where('userId', '==', user.uid),
                    where('clubId', '==', clubId),
                    where('status', '==', 'pending')
                )
            );

            if (!existingRequests.empty) {
                return { success: false, error: 'You already have a pending request for this club' };
            }

            // Check if user is already a member
            const existingMemberships = await getDocs(
                query(
                    collection(db, 'clubMemberships'),
                    where('userId', '==', user.uid),
                    where('clubId', '==', clubId)
                )
            );

            if (!existingMemberships.empty) {
                return { success: false, error: 'You are already a member of this club' };
            }

            // Get club and user info
            const clubDoc = await getDoc(doc(db, 'clubs', clubId));
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!clubDoc.exists()) {
                return { success: false, error: 'Club not found' };
            }

            const clubData = clubDoc.data();
            const userData = userDoc.data();

            if (!clubData?.name) {
                return { success: false, error: 'Club data is invalid' };
            }

            // Create join request
            const requestRef = await addDoc(collection(db, 'clubJoinRequests'), {
                userId: user.uid,
                userName: userData?.displayName || user.email || 'Unknown User',
                userEmail: user.email || '',
                clubId,
                clubName: clubData.name,
                message: message || '',
                status: 'pending',
                createdAt: new Date().toISOString()
            });

            return { success: true, requestId: requestRef.id };
        } catch (err: any) {
            console.error('Error submitting join request:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * Approve a join request
     */
    const approveJoinRequest = async (
        requestId: string,
        membershipTier: MembershipTier = 'full'
    ) => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            // Get request details
            const requestDoc = await getDoc(doc(db, 'clubJoinRequests', requestId));
            if (!requestDoc.exists()) {
                return { success: false, error: 'Request not found' };
            }

            const request = requestDoc.data() as ClubJoinRequest;

            // Get reviewer info
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();

            const now = new Date().toISOString();

            // Update request status
            await updateDoc(doc(db, 'clubJoinRequests', requestId), {
                status: 'approved',
                reviewedBy: user.uid,
                reviewedByName: userData?.displayName || user.email || 'Unknown',
                reviewedAt: now
            });

            // Create ClubMembership
            // CRITICAL: ID must be {clubId}_{userId} to match security rules
            const membershipId = `${request.clubId}_${request.userId}`;
            await setDoc(doc(db, 'clubMemberships', membershipId), {
                userId: request.userId,
                clubId: request.clubId,
                role: 'member',
                membershipTier,
                membershipStatus: 'active',
                approvalStatus: 'approved',
                approvedBy: user.uid,
                joinDate: now,
                createdAt: now
            });

            // Update user's clubIds array
            const newUserDoc = await getDoc(doc(db, 'users', request.userId));
            const newUserData = newUserDoc.data();
            const clubIds = newUserData?.clubIds || [];

            await updateDoc(doc(db, 'users', request.userId), {
                clubIds: arrayUnion(request.clubId),
                // Set as active club if this is the user's first club
                ...(clubIds.length === 0 ? { activeClubId: request.clubId } : {}),
                updatedAt: now
            });

            // Increment club member count
            const clubRef = doc(db, 'clubs', request.clubId);
            const clubDoc = await getDoc(clubRef);
            const clubData = clubDoc.data();
            await updateDoc(clubRef, {
                memberCount: (clubData?.memberCount || 0) + 1,
                updatedAt: now
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error approving join request:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * Reject a join request
     */
    const rejectJoinRequest = async (
        requestId: string,
        reason?: string
    ) => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            // Get reviewer info
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();

            await updateDoc(doc(db, 'clubJoinRequests', requestId), {
                status: 'rejected',
                reviewedBy: user.uid,
                reviewedByName: userData?.displayName || user.email || 'Unknown',
                reviewedAt: new Date().toISOString(),
                rejectionReason: reason || 'Request denied'
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error rejecting join request:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * Cancel a join request (by the requester)
     */
    const cancelJoinRequest = async (requestId: string) => {
        try {
            await updateDoc(doc(db, 'clubJoinRequests', requestId), {
                status: 'cancelled'
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error cancelling join request:', err);
            return { success: false, error: err.message };
        }
    };

    /**
     * Delete a join request (hard delete)
     */
    const deleteJoinRequest = async (requestId: string) => {
        try {
            await deleteDoc(doc(db, 'clubJoinRequests', requestId));
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting join request:', err);
            return { success: false, error: err.message };
        }
    };

    return {
        requests,
        loading,
        error,
        submitJoinRequest,
        approveJoinRequest,
        rejectJoinRequest,
        cancelJoinRequest,
        deleteJoinRequest
    };
}

// Convenience hooks

/**
 * Get pending join requests for a club (for club managers)
 */
export function usePendingJoinRequests(clubId?: string) {
    return useClubJoinRequests({ clubId, status: 'pending' });
}

/**
 * Get user's own join requests
 */
export function useMyJoinRequests() {
    const { user } = useAuth();
    return useClubJoinRequests({ userId: user?.uid });
}
