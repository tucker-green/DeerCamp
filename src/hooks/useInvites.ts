import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Invite, InviteStatus, UserRole, MembershipTier } from '../types';
import { generateInviteCode, getInviteExpirationDate, isInviteExpired } from '../utils/memberHelpers';

interface UseInvitesOptions {
    clubId?: string;
    status?: InviteStatus;
}

export function useInvites(options: UseInvitesOptions = {}) {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!options.clubId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Build query
            let q = query(
                collection(db, 'invites'),
                where('clubId', '==', options.clubId),
                orderBy('createdAt', 'desc')
            );

            if (options.status) {
                q = query(q, where('status', '==', options.status));
            }

            // Real-time listener
            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const inviteData = snapshot.docs.map(docSnap => ({
                        id: docSnap.id,
                        ...docSnap.data()
                    } as Invite));

                    setInvites(inviteData);
                    setLoading(false);
                },
                (err) => {
                    console.error('Error fetching invites:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err: any) {
            console.error('Error setting up invites listener:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [options.clubId, options.status]);

    // Create invite
    const createInvite = async (inviteData: {
        email: string;
        role: UserRole;
        membershipTier: MembershipTier;
        clubId: string;
        invitedBy: string;
        invitedByName: string;
        message?: string;
    }): Promise<{ success: boolean; inviteId?: string; inviteCode?: string; error?: string }> => {
        try {
            // Check if email already has a pending invite
            const existingInvites = await getDocs(
                query(
                    collection(db, 'invites'),
                    where('email', '==', inviteData.email),
                    where('clubId', '==', inviteData.clubId),
                    where('status', '==', 'pending')
                )
            );

            if (!existingInvites.empty) {
                return { success: false, error: 'This email already has a pending invite' };
            }

            // Generate unique invite code
            let inviteCode = generateInviteCode();

            // Ensure code is unique
            let codeExists = true;
            while (codeExists) {
                const codeCheck = await getDocs(
                    query(collection(db, 'invites'), where('inviteCode', '==', inviteCode))
                );
                if (codeCheck.empty) {
                    codeExists = false;
                } else {
                    inviteCode = generateInviteCode();
                }
            }

            const newInvite: Omit<Invite, 'id'> = {
                ...inviteData,
                inviteCode,
                status: 'pending',
                createdAt: new Date().toISOString(),
                expiresAt: getInviteExpirationDate()
            };

            const docRef = await addDoc(collection(db, 'invites'), newInvite);

            return { success: true, inviteId: docRef.id, inviteCode };
        } catch (err: any) {
            console.error('Error creating invite:', err);
            return { success: false, error: err.message };
        }
    };

    // Cancel invite
    const cancelInvite = async (inviteId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, 'invites', inviteId), {
                status: 'cancelled',
                cancelledAt: new Date().toISOString()
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error cancelling invite:', err);
            return { success: false, error: err.message };
        }
    };

    // Resend invite (extends expiration date)
    const resendInvite = async (inviteId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, 'invites', inviteId), {
                expiresAt: getInviteExpirationDate(),
                status: 'pending' // Reset to pending if it was expired
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error resending invite:', err);
            return { success: false, error: err.message };
        }
    };

    // Accept invite
    const acceptInvite = async (
        inviteCode: string,
        userId: string
    ): Promise<{ success: boolean; invite?: Invite; error?: string }> => {
        try {
            // Find invite by code
            const inviteQuery = await getDocs(
                query(collection(db, 'invites'), where('inviteCode', '==', inviteCode))
            );

            if (inviteQuery.empty) {
                return { success: false, error: 'Invalid invite code' };
            }

            const inviteDoc = inviteQuery.docs[0];
            const invite = { id: inviteDoc.id, ...inviteDoc.data() } as Invite;

            // Check if invite is pending
            if (invite.status !== 'pending') {
                return { success: false, error: 'This invite is no longer valid' };
            }

            // Check if expired
            if (isInviteExpired(invite.expiresAt)) {
                // Mark as expired
                await updateDoc(doc(db, 'invites', invite.id), {
                    status: 'expired'
                });
                return { success: false, error: 'This invite has expired' };
            }

            // Mark invite as accepted
            await updateDoc(doc(db, 'invites', invite.id), {
                status: 'accepted',
                acceptedAt: new Date().toISOString()
            });

            // Update user profile with invite data
            await updateDoc(doc(db, 'users', userId), {
                role: invite.role,
                membershipTier: invite.membershipTier,
                clubId: invite.clubId,
                invitedBy: invite.invitedBy,
                approvalStatus: 'approved', // Auto-approve invited members
                membershipStatus: 'active',
                updatedAt: new Date().toISOString()
            });

            return { success: true, invite };
        } catch (err: any) {
            console.error('Error accepting invite:', err);
            return { success: false, error: err.message };
        }
    };

    // Delete invite
    const deleteInvite = async (inviteId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, 'invites', inviteId));
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting invite:', err);
            return { success: false, error: err.message };
        }
    };

    return {
        invites,
        loading,
        error,
        createInvite,
        cancelInvite,
        resendInvite,
        acceptInvite,
        deleteInvite
    };
}

// Convenience hooks

export function usePendingInvites(clubId: string) {
    return useInvites({ clubId, status: 'pending' });
}

export function useAcceptedInvites(clubId: string) {
    return useInvites({ clubId, status: 'accepted' });
}

export function useExpiredInvites(clubId: string) {
    return useInvites({ clubId, status: 'expired' });
}

// Get invite by code
export async function getInviteByCode(inviteCode: string): Promise<Invite | null> {
    try {
        const q = query(collection(db, 'invites'), where('inviteCode', '==', inviteCode));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        } as Invite;
    } catch (err: any) {
        console.error('Error fetching invite:', err);
        return null;
    }
}
