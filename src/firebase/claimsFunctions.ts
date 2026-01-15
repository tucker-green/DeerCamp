/**
 * Cloud Functions utilities for managing custom claims
 *
 * These functions call the backend Cloud Functions to sync user's club
 * membership claims. The claims are used by Storage security rules to
 * restrict file access to club members only.
 */

import { httpsCallable } from "firebase/functions";
import { functions, auth } from "./config";

interface SyncClaimsResult {
  success: boolean;
  userId: string;
  clubCount: number;
  message: string;
}

interface SyncAllClaimsResult {
  success: boolean;
  totalUsers: number;
  successCount: number;
  errorCount: number;
  message: string;
  results: Array<{ userId: string; clubCount: number; error?: string }>;
}

/**
 * Sync the current user's club claims
 * Call this after login to ensure the user has the latest claims
 *
 * @returns Result with club count
 */
export async function syncMyClubClaims(): Promise<SyncClaimsResult> {
  const syncClaims = httpsCallable<{ userId?: string }, SyncClaimsResult>(
    functions,
    "syncUserClubClaims"
  );

  const result = await syncClaims({});
  return result.data;
}

/**
 * Sync a specific user's club claims (super admin only)
 *
 * @param userId - The user ID to sync claims for
 * @returns Result with club count
 */
export async function syncUserClubClaims(
  userId: string
): Promise<SyncClaimsResult> {
  const syncClaims = httpsCallable<{ userId?: string }, SyncClaimsResult>(
    functions,
    "syncUserClubClaims"
  );

  const result = await syncClaims({ userId });
  return result.data;
}

/**
 * Sync all users' club claims (super admin only)
 * Use this for initial migration or bulk fixes
 *
 * @returns Result with success/error counts
 */
export async function syncAllUsersClubClaims(): Promise<SyncAllClaimsResult> {
  const syncAllClaims = httpsCallable<unknown, SyncAllClaimsResult>(
    functions,
    "syncAllUserClubClaims"
  );

  const result = await syncAllClaims({});
  return result.data;
}

/**
 * Force refresh the current user's ID token to get updated claims
 * Call this after syncing claims to ensure the token has the new values
 *
 * @returns The refreshed ID token
 */
export async function refreshTokenWithClaims(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  // Force refresh to get new claims
  const token = await user.getIdToken(true);
  return token;
}

/**
 * Get the current user's club IDs from their token claims
 * Note: Claims are only updated after token refresh
 *
 * @returns Array of club IDs or empty array
 */
export async function getMyClubIdsFromClaims(): Promise<string[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const tokenResult = await user.getIdTokenResult();
  const clubIds = tokenResult.claims.clubIds;

  if (Array.isArray(clubIds)) {
    return clubIds as string[];
  }

  return [];
}

/**
 * Sync claims and refresh token in one call
 * Convenience function to ensure user has latest claims in their token
 *
 * @returns The synced club IDs
 */
export async function syncAndRefreshClaims(): Promise<string[]> {
  // Sync claims on the backend
  await syncMyClubClaims();

  // Refresh token to get new claims
  await refreshTokenWithClaims();

  // Return the updated club IDs
  return getMyClubIdsFromClaims();
}
