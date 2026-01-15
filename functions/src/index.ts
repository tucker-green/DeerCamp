/**
 * Cloud Functions for DeerCamp
 *
 * Manages custom claims for club membership to enable storage-level security.
 * When a user's club membership changes, their auth token is updated with
 * the list of clubs they belong to.
 *
 * Custom claims format:
 *   { clubIds: ["clubId1", "clubId2", ...] }
 *
 * These claims are used by Storage security rules to restrict file access
 * to only club members.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// Type definitions matching the app's types
interface ClubMembership {
  userId: string;
  clubId: string;
  role: "owner" | "manager" | "member";
  membershipStatus: "active" | "inactive" | "suspended";
  approvalStatus: "pending" | "approved" | "rejected";
}

/**
 * Get all active and approved club IDs for a user
 */
async function getActiveClubIds(userId: string): Promise<string[]> {
  const membershipsSnapshot = await db
    .collection("clubMemberships")
    .where("userId", "==", userId)
    .where("membershipStatus", "==", "active")
    .where("approvalStatus", "==", "approved")
    .get();

  return membershipsSnapshot.docs.map((doc) => {
    const data = doc.data() as ClubMembership;
    return data.clubId;
  });
}

/**
 * Update custom claims for a user with their active club IDs
 */
async function updateUserClubClaims(userId: string): Promise<void> {
  try {
    // Get all active club memberships for this user
    const clubIds = await getActiveClubIds(userId);

    // Get existing custom claims to preserve other claims
    const user = await auth.getUser(userId);
    const existingClaims = user.customClaims || {};

    // Update claims with new clubIds
    await auth.setCustomUserClaims(userId, {
      ...existingClaims,
      clubIds: clubIds,
    });

    functions.logger.info(
      `Updated club claims for user ${userId}: ${clubIds.length} clubs`,
      { userId, clubIds }
    );
  } catch (error) {
    // User might not exist in Auth (e.g., deleted account)
    if ((error as { code?: string }).code === "auth/user-not-found") {
      functions.logger.warn(`User ${userId} not found in Auth, skipping claims update`);
      return;
    }
    throw error;
  }
}

/**
 * Trigger: When a club membership is created
 * Updates the user's custom claims if the membership is active and approved
 */
export const onMembershipCreated = functions.firestore
  .document("clubMemberships/{membershipId}")
  .onCreate(async (snapshot) => {
    const membership = snapshot.data() as ClubMembership;

    functions.logger.info("Membership created", {
      membershipId: snapshot.id,
      userId: membership.userId,
      clubId: membership.clubId,
      status: membership.membershipStatus,
      approval: membership.approvalStatus,
    });

    // Only update claims if membership is active and approved
    if (
      membership.membershipStatus === "active" &&
      membership.approvalStatus === "approved"
    ) {
      await updateUserClubClaims(membership.userId);
    }
  });

/**
 * Trigger: When a club membership is updated
 * Updates the user's custom claims if status or approval changed
 */
export const onMembershipUpdated = functions.firestore
  .document("clubMemberships/{membershipId}")
  .onUpdate(async (change) => {
    const before = change.before.data() as ClubMembership;
    const after = change.after.data() as ClubMembership;

    // Check if status or approval changed
    const statusChanged =
      before.membershipStatus !== after.membershipStatus ||
      before.approvalStatus !== after.approvalStatus;

    if (statusChanged) {
      functions.logger.info("Membership status changed", {
        membershipId: change.after.id,
        userId: after.userId,
        clubId: after.clubId,
        beforeStatus: before.membershipStatus,
        afterStatus: after.membershipStatus,
        beforeApproval: before.approvalStatus,
        afterApproval: after.approvalStatus,
      });

      await updateUserClubClaims(after.userId);
    }
  });

/**
 * Trigger: When a club membership is deleted
 * Updates the user's custom claims to remove the club
 */
export const onMembershipDeleted = functions.firestore
  .document("clubMemberships/{membershipId}")
  .onDelete(async (snapshot) => {
    const membership = snapshot.data() as ClubMembership;

    functions.logger.info("Membership deleted", {
      membershipId: snapshot.id,
      userId: membership.userId,
      clubId: membership.clubId,
    });

    await updateUserClubClaims(membership.userId);
  });

/**
 * Callable function: Manually sync claims for a user
 * Useful for:
 * - Fixing claims after migration
 * - Admin troubleshooting
 * - Initial setup for existing users
 *
 * Can be called by:
 * - The user themselves (syncing their own claims)
 * - Super admins (syncing any user's claims)
 */
export const syncUserClubClaims = functions.https.onCall(
  async (data: { userId?: string }, context) => {
    // Must be authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to sync claims"
      );
    }

    // Determine which user to sync
    const targetUserId = data.userId || context.auth.uid;

    // If syncing another user's claims, must be super admin
    if (targetUserId !== context.auth.uid) {
      // Check if caller is super admin
      const callerDoc = await db.collection("users").doc(context.auth.uid).get();
      const callerData = callerDoc.data();

      if (!callerData?.isSuperAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Only super admins can sync other users' claims"
        );
      }
    }

    await updateUserClubClaims(targetUserId);

    const clubIds = await getActiveClubIds(targetUserId);

    return {
      success: true,
      userId: targetUserId,
      clubCount: clubIds.length,
      message: `Synced ${clubIds.length} club(s) to user claims`,
    };
  }
);

/**
 * Callable function: Sync claims for ALL users
 * Useful for initial migration or bulk fixes
 * Only callable by super admins
 */
export const syncAllUserClubClaims = functions.https.onCall(
  async (_data, context) => {
    // Must be authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated"
      );
    }

    // Must be super admin
    const callerDoc = await db.collection("users").doc(context.auth.uid).get();
    const callerData = callerDoc.data();

    if (!callerData?.isSuperAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only super admins can sync all users' claims"
      );
    }

    // Get all unique user IDs from memberships
    const membershipsSnapshot = await db.collection("clubMemberships").get();
    const userIds = new Set<string>();

    membershipsSnapshot.docs.forEach((doc) => {
      const data = doc.data() as ClubMembership;
      userIds.add(data.userId);
    });

    functions.logger.info(`Syncing claims for ${userIds.size} users`);

    // Update claims for each user
    const results: { userId: string; clubCount: number; error?: string }[] = [];

    for (const userId of userIds) {
      try {
        await updateUserClubClaims(userId);
        const clubIds = await getActiveClubIds(userId);
        results.push({ userId, clubCount: clubIds.length });
      } catch (error) {
        results.push({
          userId,
          clubCount: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => !r.error).length;
    const errorCount = results.filter((r) => r.error).length;

    return {
      success: true,
      totalUsers: userIds.size,
      successCount,
      errorCount,
      message: `Synced ${successCount} users, ${errorCount} errors`,
      results,
    };
  }
);

/**
 * HTTP function: Health check endpoint
 * Useful for monitoring
 */
export const healthCheck = functions.https.onRequest((_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "deercamp-functions",
  });
});
