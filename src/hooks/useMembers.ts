import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { UserProfile, UserRole, MemberStatus, DuesStatus, MembershipTier } from '../types';
import { calculateProfileCompleteness } from '../utils/memberHelpers';

interface UseMembersOptions {
    clubId?: string;
    role?: UserRole;
    status?: MemberStatus;
    duesStatus?: DuesStatus;
}

export function useMembers(options: UseMembersOptions = {}) {
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        try {
            // Build query
            let q = query(collection(db, 'users'), orderBy('joinDate', 'desc'));

            // Add filters
            if (options.clubId) {
                q = query(q, where('clubId', '==', options.clubId));
            }

            if (options.role) {
                q = query(q, where('role', '==', options.role));
            }

            if (options.status) {
                q = query(q, where('membershipStatus', '==', options.status));
            }

            if (options.duesStatus) {
                q = query(q, where('duesStatus', '==', options.duesStatus));
            }

            // Real-time listener
            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const memberData = snapshot.docs.map(docSnap => {
                        const data = docSnap.data();
                        return { ...data, uid: data.uid || docSnap.id } as UserProfile;
                    });

                    setMembers(memberData);
                    setLoading(false);
                },
                (err) => {
                    console.error('Error fetching members:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err: any) {
            console.error('Error setting up members listener:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [options.clubId, options.role, options.status, options.duesStatus]);

    // Update member role
    const updateMemberRole = async (userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                role: newRole,
                updatedAt: new Date().toISOString()
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error updating member role:', err);
            return { success: false, error: err.message };
        }
    };

    // Update member status
    const updateMemberStatus = async (
        userId: string,
        newStatus: MemberStatus
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                membershipStatus: newStatus,
                updatedAt: new Date().toISOString()
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error updating member status:', err);
            return { success: false, error: err.message };
        }
    };

    // Update member tier
    const updateMemberTier = async (
        userId: string,
        newTier: MembershipTier
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                membershipTier: newTier,
                updatedAt: new Date().toISOString()
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error updating member tier:', err);
            return { success: false, error: err.message };
        }
    };

    // Update dues status
    const updateDuesStatus = async (
        userId: string,
        duesData: {
            duesStatus: DuesStatus;
            duesPaidUntil?: string;
            lastDuesPayment?: string;
        }
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                ...duesData,
                updatedAt: new Date().toISOString()
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error updating dues status:', err);
            return { success: false, error: err.message };
        }
    };

    // Update member profile
    const updateMemberProfile = async (
        userId: string,
        updates: Partial<UserProfile>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            // Calculate profile completeness if updating profile fields
            const completeness = calculateProfileCompleteness({
                ...members.find(m => m.uid === userId),
                ...updates
            } as UserProfile);

            await updateDoc(doc(db, 'users', userId), {
                ...updates,
                profileCompleteness: completeness,
                updatedAt: new Date().toISOString()
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error updating member profile:', err);
            return { success: false, error: err.message };
        }
    };

    // Delete member
    const deleteMember = async (userId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, 'users', userId));
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting member:', err);
            return { success: false, error: err.message };
        }
    };

    return {
        members,
        loading,
        error,
        updateMemberRole,
        updateMemberStatus,
        updateMemberTier,
        updateDuesStatus,
        updateMemberProfile,
        deleteMember
    };
}

// Convenience hooks

export function useAllMembers(clubId: string) {
    return useMembers({ clubId });
}

export function useClubOwners(clubId: string) {
    return useMembers({ clubId, role: 'owner' });
}

export function useClubManagers(clubId: string) {
    return useMembers({ clubId, role: 'manager' });
}

export function useActiveMembers(clubId: string) {
    return useMembers({ clubId, status: 'active' });
}

export function useInactiveMembers(clubId: string) {
    return useMembers({ clubId, status: 'inactive' });
}

export function useUnpaidMembers(clubId: string) {
    return useMembers({ clubId, duesStatus: 'unpaid' });
}

export function useOverdueMembers(clubId: string) {
    return useMembers({ clubId, duesStatus: 'overdue' });
}

// Get single member by ID
export async function getMemberById(userId: string): Promise<UserProfile | null> {
    try {
        const q = query(collection(db, 'users'), where('uid', '==', userId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const data = snapshot.docs[0].data();
        return { ...data, uid: data.uid || snapshot.docs[0].id } as UserProfile;
    } catch (err: any) {
        console.error('Error fetching member:', err);
        return null;
    }
}
