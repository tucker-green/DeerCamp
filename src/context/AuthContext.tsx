import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import type { UserProfile, ClubMembership, Club } from '../types';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isBanned: boolean;
    banReason?: string;

    // Multi-Club Support
    memberships: ClubMembership[];
    activeClubId: string | null;
    activeMembership: ClubMembership | null;
    activeClub: Club | null;
    switchClub: (clubId: string) => Promise<void>;
    refreshMemberships: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isBanned: false,
    banReason: undefined,
    memberships: [],
    activeClubId: null,
    activeMembership: null,
    activeClub: null,
    switchClub: async () => {},
    refreshMemberships: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBanned, setIsBanned] = useState(false);
    const [banReason, setBanReason] = useState<string | undefined>(undefined);

    // Multi-Club State
    const [memberships, setMemberships] = useState<ClubMembership[]>([]);
    const [activeClubId, setActiveClubId] = useState<string | null>(null);
    const [activeMembership, setActiveMembership] = useState<ClubMembership | null>(null);
    const [activeClub, setActiveClub] = useState<Club | null>(null);

    // Load user's club memberships
    const loadMemberships = useCallback(async (userId: string) => {
        try {
            const membershipsQuery = query(
                collection(db, 'clubMemberships'),
                where('userId', '==', userId),
                where('membershipStatus', 'in', ['active', 'pending'])
            );
            const snapshot = await getDocs(membershipsQuery);
            const membershipData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ClubMembership));
            setMemberships(membershipData);
            return membershipData;
        } catch (error) {
            console.error('Error loading memberships:', error);
            return [];
        }
    }, []);

    // Load club details
    const loadClub = useCallback(async (clubId: string) => {
        try {
            const clubDoc = await getDoc(doc(db, 'clubs', clubId));
            if (clubDoc.exists()) {
                return { id: clubDoc.id, ...clubDoc.data() } as Club;
            }
            return null;
        } catch (error) {
            console.error('Error loading club:', error);
            return null;
        }
    }, []);

    // Switch active club
    const switchClub = useCallback(async (clubId: string) => {
        if (!user) return;

        // Find membership for this club
        const membership = memberships.find(m => m.clubId === clubId);
        if (!membership) {
            console.error('No membership found for club:', clubId);
            return;
        }

        // Load club details
        const club = await loadClub(clubId);

        // Update state
        setActiveClubId(clubId);
        setActiveMembership(membership);
        setActiveClub(club);

        // Save to user profile
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                activeClubId: clubId,
                lastActive: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving active club:', error);
        }
    }, [user, memberships, loadClub]);

    // Refresh memberships
    const refreshMemberships = useCallback(async () => {
        if (!user) return;
        await loadMemberships(user.uid);
    }, [user, loadMemberships]);

    useEffect(() => {
        let unsubscribeProfile: (() => void) | null = null;

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Clean up previous profile listener
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            setUser(firebaseUser);

            if (firebaseUser) {
                // Load user profile
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                let userProfile: UserProfile;

                if (userDoc.exists()) {
                    userProfile = userDoc.data() as UserProfile;
                    
                    // Check if user is banned
                    if (userProfile.isBanned) {
                        setIsBanned(true);
                        setBanReason(userProfile.banReason);
                        setProfile(userProfile);
                        setLoading(false);
                        // Sign them out after a delay to show the banned message
                        setTimeout(() => signOut(auth), 5000);
                        return;
                    }
                    
                    setProfile(userProfile);
                    setIsBanned(false);
                    setBanReason(undefined);
                } else {
                    // Create initial profile if it doesn't exist
                    userProfile = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        displayName: firebaseUser.displayName || 'Hunter',
                        clubIds: [],
                        joinDate: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                    };
                    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
                    setProfile(userProfile);
                    setIsBanned(false);
                    setBanReason(undefined);
                }

                // Set up real-time listener for ban status changes
                unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const updatedProfile = docSnapshot.data() as UserProfile;
                        setProfile(updatedProfile);
                        
                        // Check if user got banned while using the app
                        if (updatedProfile.isBanned && !isBanned) {
                            setIsBanned(true);
                            setBanReason(updatedProfile.banReason);
                            // Sign them out after a delay to show the banned message
                            setTimeout(() => signOut(auth), 5000);
                        }
                    }
                });

                // Load memberships
                const membershipData = await loadMemberships(firebaseUser.uid);

                // Set active club (from saved preference or first membership)
                if (membershipData.length > 0) {
                    const targetClubId = userProfile.activeClubId || membershipData[0].clubId;
                    const targetMembership = membershipData.find(m => m.clubId === targetClubId) || membershipData[0];
                    const club = await loadClub(targetMembership.clubId);

                    setActiveClubId(targetMembership.clubId);
                    setActiveMembership(targetMembership);
                    setActiveClub(club);
                }
            } else {
                setProfile(null);
                setMemberships([]);
                setActiveClubId(null);
                setActiveMembership(null);
                setActiveClub(null);
                setIsBanned(false);
                setBanReason(undefined);
            }

            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (unsubscribeProfile) {
                unsubscribeProfile();
            }
        };
    }, [loadMemberships, loadClub, isBanned]);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                isBanned,
                banReason,
                memberships,
                activeClubId,
                activeMembership,
                activeClub,
                switchClub,
                refreshMemberships,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
