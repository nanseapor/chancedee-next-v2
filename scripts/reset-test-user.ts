/**
 * Reset Test User Script
 *
 * This script:
 * 1. Deletes existing test user from Firebase Auth
 * 2. Deletes user data from Firestore
 * 3. Allows fresh registration for testing
 *
 * Usage: npx tsx scripts/reset-test-user.ts <email>
 */

import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '../src/lib/firebase/admin';

const auth = getFirebaseAdminAuth();
const db = getFirebaseAdminFirestore();

async function resetTestUser(email: string) {
  console.log(`🔄 Resetting test user: ${email}`);

  try {
    // Step 1: Get user by email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`✓ Found user: ${userRecord.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`ℹ User not found in Firebase Auth. Nothing to delete.`);
        return;
      }
      throw error;
    }

    const uid = userRecord.uid;

    // Step 2: Delete Firestore data
    console.log(`🗑️  Deleting Firestore documents for UID: ${uid}`);

    const collections = [
      'user_accounts',
      'user_info',
      'candidate_information',
      'candidate_preference',
      'pockets',
      'wallet_transactions',
      'candidate_referral',
      'consent_records',
    ];

    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).doc(uid).delete();
        console.log(`  ✓ Deleted ${collectionName}/${uid}`);
      } catch (error) {
        console.log(`  ⚠ Could not delete ${collectionName}/${uid} (may not exist)`);
      }
    }

    // Step 3: Delete OTP codes for this email
    const otpSnapshot = await db.collection('otp_codes')
      .where('email', '==', email)
      .get();

    for (const doc of otpSnapshot.docs) {
      await doc.ref.delete();
      console.log(`  ✓ Deleted otp_codes/${doc.id}`);
    }

    // Step 4: Delete from Firebase Auth
    await auth.deleteUser(uid);
    console.log(`✓ Deleted user from Firebase Auth`);

    console.log(`✅ Successfully reset test user: ${email}`);
    console.log(`You can now register this user fresh.`);

  } catch (error) {
    console.error(`❌ Error resetting user:`, error);
    throw error;
  }
}

// Main execution
const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/reset-test-user.ts <email>');
  process.exit(1);
}

resetTestUser(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
