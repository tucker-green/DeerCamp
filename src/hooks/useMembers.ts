import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, MemberWithClubData, UserRole, MemberStatus, DuesStatus, MembershipTier, ClubMembership } from '../types';
import { calculateProfileCompleteness } from '../utils/memberHelpers';

interface UseMembersOptions {
    clubId?: string;
    role?: UserRole;
    status?: MemberStatus;
    duesStatus?: DuesStatus;
}

export function useMembers(options: UseMembersOptions = {}) {
    const { activeClubId } = useAuth();
    const [members, setMembers] = useState<MemberWithClubData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const targetClubId = options.clubId || activeClubId;

    useEffect(() => {
        if (!targetClubId) {
            setMembers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Query clubMemberships for this club
            const membershipsQuery = query(
                collection(db, 'clubMemberships'),
                where('clubId', '==', targetClubId),
                orderBy('joinDate', 'desc')
            );

            // Real-time listener on memberships
            const unsubscribe = onSnapshot(
                membershipsQuery,
                async (snapshot) => {
                    const memberships = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as ClubMembership));

                    // Filter by role/status if provided
                    let filteredMemberships = memberships;
                    if (options.role) {
                        filteredMemberships = filteredMemberships.filter(m => m.role === options.role);
                    }
                    if (options.status) {
                        filteredMemberships = filteredMemberships.filter(m => m.membershipStatus === options.status);
                    }
                    if (options.duesStatus) {
                        filteredMemberships = filteredMemberships.filter(m => m.duesStatus === options.duesStatus);
                    }

                    // Fetch user profiles for each membership
                    const memberProfiles: MemberWithClubData[] = [];
                    for (const membership of filteredMemberships) {
                        const userDoc = await getDoc(doc(db, 'users', membership.userId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data() as UserProfile;
                            // Merge membership data into profile for display
                            memberProfiles.push({
                                ...userData,
                                role: membership.role,
                                membershipTier: membership.membershipTier,
                                membershipStatus: membership.membershipStatus,
                                approvalStatus: membership.approvalStatus,
                                duesStatus: membership.duesStatus,
                                duesPaidUntil: membership.duesPaidUntil,
                                lastDuesPayment: membership.lastDuesPayment,
                                invitedBy: membership.invitedBy,
                                approvedBy: membership.approvedBy,
                            });
                        }
                    }

                    setMembers(memberProfiles);
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
    }, [targetClubId, options.role, options.status, options.duesStatus]);

    // Helper to find membership document
    const findMembership = async (userId: string): Promise<string | null> => {
        if (!targetClubId) return null;
        try {
            const q = query(
                collection(db, 'clubMemberships'),
                where('userId', '==', userId),
                where('clubId', '==', targetClubId)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            return snapshot.docs[0].id;
        } catch (err) {
            console.error('Error finding membership:', err);
            return null;
        }
    };

    // Update member role
    const updateMemberRole = async (userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> => {
        try {
            const membershipId = await findMembership(userId);
            if (!membershipId) {
                return { success: false, error: 'Membership not found' };
            }

            await updateDoc(doc(db, 'clubMemberships', membershipId), {
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
            const membershipId = await findMembership(userId);
            if (!membershipId) {
                return { success: false, error: 'Membership not found' };
            }

            await updateDoc(doc(db, 'clubMemberships', membershipId), {
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
            const membershipId = await findMembership(userId);
            if (!membershipId) {
                return { success: false, error: 'Membership not found' };
            }

            await updateDoc(doc(db, 'clubMemberships', membershipId), {
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
            const membershipId = await findMembership(userId);
            if (!membershipId) {
                return { success: false, error: 'Membership not found' };
            }

            await updateDoc(doc(db, 'clubMemberships', membershipId), {
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

    // Remove member from club (delete membership)
    const deleteMember = async (userId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const membershipId = await findMembership(userId);
            if (!membershipId) {
                return { success: false, error: 'Membership not found' };
            }

            await deleteDoc(doc(db, 'clubMemberships', membershipId));
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
