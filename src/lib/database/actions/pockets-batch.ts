"use server";
import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { currency, pocketType } from "@/types/wallet.types";
import { FirebasePocketsType } from "../schemas/pockets.schema";
import { webWalletTransactionGetById } from "./wallet-transactions";

/**
 * Batch fetch wallet pockets for multiple users and currencies
 * Significantly reduces database calls from N*2 to 2 batch operations
 */
export const webPocketsGetBatch = async (
  userIds: string[],
  currencies: currency[] = ["coin", "star"]
): Promise<Record<string, Record<currency, pocketType | null>>> => {
  if (userIds.length === 0) return {};

  const result: Record<string, Record<currency, pocketType | null>> = {};
  
  // Initialize result structure
  userIds.forEach(userId => {
    result[userId] = {} as Record<currency, pocketType | null>;
    currencies.forEach(currency => {
      result[userId][currency] = null;
    });
  });

  try {
    // Batch fetch all pockets for all currencies in parallel
    const batchPromises = currencies.map(async (currency) => {
      const firestore = getFirebaseAdminFirestore();
      
      // Firebase batch read limit is 500, so we chunk if needed
      const chunks = chunkArray(userIds, 500);
      const currencyResults = await Promise.all(
        chunks.map(async (chunk) => {
          const promises = chunk.map(async (userId) => {
            try {
              const pocketRef = firestore.collection(currency).doc(userId);
              const pocketSnap = await pocketRef.get();
              
              if (pocketSnap.exists) {
                const firebasePockets = pocketSnap.data() as FirebasePocketsType;
                
                // Batch fetch latest transactions
                const latest = await Promise.all(
                  firebasePockets.latest.map(async (item) =>
                    webWalletTransactionGetById(item)
                  )
                );

                const pocketData: pocketType = {
                  uid: firebasePockets.uid,
                  currency: firebasePockets.currency,
                  balance: firebasePockets.balance,
                  latest: latest.filter((item) => item !== null) as pocketType["latest"],
                };

                return { userId, pocketData };
              }
              return { userId, pocketData: null };
            } catch (error) {
              console.error(`Error fetching ${currency} pocket for user ${userId}:`, error);
              return { userId, pocketData: null };
            }
          });

          return Promise.all(promises);
        })
      );

      // Flatten results and assign to result object
      currencyResults.flat().forEach(({ userId, pocketData }) => {
        result[userId][currency] = pocketData;
      });
    });

    await Promise.all(batchPromises);
    
    console.log(`Batch fetched wallets for ${userIds.length} users across ${currencies.length} currencies`);
    return result;
    
  } catch (error) {
    console.error("Error in batch wallet fetch:", error);
    // Return empty result structure on error
    return result;
  }
};

/**
 * Optimized function to get both coin and star pockets for a single user
 */
export const webPocketsGetBothById = async (
  userId: string
): Promise<{ coin: pocketType | null; star: pocketType | null }> => {
  const batchResult = await webPocketsGetBatch([userId], ["coin", "star"]);
  return {
    coin: batchResult[userId]?.coin || null,
    star: batchResult[userId]?.star || null,
  };
};

/**
 * Utility function to chunk arrays for batch operations
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}