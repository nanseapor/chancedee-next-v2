import "server-only";

/**
 * Firestore Batch Read Utilities
 *
 * Provides efficient batch read operations for Firestore, eliminating N+1 query patterns.
 * Firestore allows up to 500 document IDs per getAll() call, so we chunk appropriately.
 *
 * Problem: Reading 100 documents = 100 individual reads
 * Solution: Batch into chunks of 500, reducing to ceiling(N/500) reads
 *
 * @module lib/database/batch-reads
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { DocumentData } from "firebase-admin/firestore";

// Get Firestore instance (lazily initialized)
const getDb = () => getFirebaseAdminFirestore();

/**
 * Firestore has a limit of 500 document IDs per batch read
 * We use 200 to be conservative and leave headroom
 */
const FIRESTORE_BATCH_LIMIT = 200;

/**
 * Batch Read Result with metadata
 */
export interface BatchReadResult<T> {
  /** Successfully read documents mapped by ID */
  documents: Map<string, T>;
  /** IDs that failed to read */
  failed: string[];
  /** IDs that don't exist */
  notFound: string[];
  /** Total read operations performed */
  readsPerformed: number;
}

/**
 * Read multiple documents by ID in batches
 *
 * Automatically chunks large ID lists to stay within Firestore limits.
 * Returns a Map for O(1) lookup by ID.
 *
 * @example
 * ```typescript
 * // Instead of 100 individual reads:
 * const companies = await Promise.all(
 *   companyIds.map(id => getCompanyById(id))
 * );
 *
 * // Use batch read for 1 read operation:
 * const result = await batchReadByIds('companies', companyIds);
 * const companies = Array.from(result.documents.values());
 * ```
 *
 * @param collectionName - Firestore collection name
 * @param ids - Array of document IDs to read
 * @returns BatchReadResult with documents, errors, and metadata
 */
export async function batchReadByIds<T = DocumentData>(
  collectionName: string,
  ids: string[]
): Promise<BatchReadResult<T>> {
  // Remove duplicates and filter out empty IDs
  const uniqueIds = Array.from(new Set(ids.filter((id) => id && id.trim())));

  if (uniqueIds.length === 0) {
    return {
      documents: new Map(),
      failed: [],
      notFound: [],
      readsPerformed: 0,
    };
  }

  console.log(`📚 Batch reading ${uniqueIds.length} documents from ${collectionName}`);

  const documents = new Map<string, T>();
  const failed: string[] = [];
  const notFound: string[] = [];
  let readsPerformed = 0;

  // Split into chunks to respect Firestore limits
  const chunks = chunkArray(uniqueIds, FIRESTORE_BATCH_LIMIT);
  console.log(`📦 Split into ${chunks.length} chunks (max ${FIRESTORE_BATCH_LIMIT} per chunk)`);

  // Process all chunks in parallel
  const chunkResults = await Promise.allSettled(
    chunks.map(async (chunk) => {
      readsPerformed++;
      return await readChunk<T>(collectionName, chunk);
    })
  );

  // Aggregate results from all chunks
  chunkResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const chunkResult = result.value;

      // Merge successful reads
      chunkResult.documents.forEach((doc, id) => {
        documents.set(id, doc);
      });

      // Collect not found IDs
      notFound.push(...chunkResult.notFound);
    } else {
      // Entire chunk failed - mark all IDs in chunk as failed
      console.error(`❌ Chunk ${index + 1} failed:`, result.reason);
      const chunk = chunks[index];
      if (chunk) failed.push(...chunk);
    }
  });

  console.log(
    `✅ Batch read complete: ${documents.size} found, ${notFound.length} not found, ${failed.length} failed (${readsPerformed} reads)`
  );

  return {
    documents,
    failed,
    notFound,
    readsPerformed,
  };
}

/**
 * Read a single chunk of document IDs
 *
 * Internal helper function for batchReadByIds
 */
async function readChunk<T>(
  collectionName: string,
  ids: string[]
): Promise<Omit<BatchReadResult<T>, 'readsPerformed'>> {
  const documents = new Map<string, T>();
  const notFound: string[] = [];
  const failed: string[] = [];

  try {
    const db = getDb();

    // Create document references for Firebase Admin SDK
    const docRefs = ids.map((id) => db.collection(collectionName).doc(id));

    // Use getAll for efficient batch read (Firebase Admin SDK)
    const snapshots = await db.getAll(...docRefs);

    // Process results
    snapshots.forEach((snapshot, index) => {
      const id = ids[index];
      if (!id) return;

      if (snapshot.exists) {
        documents.set(id, snapshot.data() as T);
      } else {
        notFound.push(id);
      }
    });
  } catch (error) {
    console.error(`❌ Failed to read chunk from ${collectionName}:`, error);
    // Mark all IDs in this chunk as failed
    failed.push(...ids);
  }

  return { documents, notFound, failed };
}

/**
 * Batch read with type transformation
 *
 * Useful when you need to transform Firestore data to application models
 *
 * @example
 * ```typescript
 * const result = await batchReadAndTransform(
 *   'users',
 *   userIds,
 *   (data) => ({
 *     uid: data.uid,
 *     name: data.displayName,
 *     email: data.email,
 *   })
 * );
 * ```
 */
export async function batchReadAndTransform<TFirestore, TApp>(
  collectionName: string,
  ids: string[],
  transform: (data: TFirestore, id: string) => TApp
): Promise<BatchReadResult<TApp>> {
  const result = await batchReadByIds<TFirestore>(collectionName, ids);

  const transformedDocs = new Map<string, TApp>();

  result.documents.forEach((doc, id) => {
    try {
      const transformed = transform(doc, id);
      transformedDocs.set(id, transformed);
    } catch (error) {
      console.error(`❌ Failed to transform document ${id}:`, error);
      result.failed.push(id);
    }
  });

  return {
    documents: transformedDocs,
    failed: result.failed,
    notFound: result.notFound,
    readsPerformed: result.readsPerformed,
  };
}

/**
 * Batch read with default fallback values
 *
 * Useful when you want to return a default value for missing documents
 *
 * @example
 * ```typescript
 * const companies = await batchReadWithDefaults(
 *   'companies',
 *   companyIds,
 *   { name: 'Unknown Company', verified: false }
 * );
 * ```
 */
export async function batchReadWithDefaults<T>(
  collectionName: string,
  ids: string[],
  defaultValue: T
): Promise<Map<string, T>> {
  const result = await batchReadByIds<T>(collectionName, ids);

  // Fill in defaults for not found IDs
  result.notFound.forEach((id) => {
    result.documents.set(id, defaultValue);
  });

  return result.documents;
}

/**
 * Batch read from multiple collections
 *
 * Useful when you need to fetch related data from different collections
 *
 * @example
 * ```typescript
 * const results = await batchReadMultipleCollections([
 *   { collection: 'users', ids: userIds },
 *   { collection: 'companies', ids: companyIds },
 *   { collection: 'jobs', ids: jobIds },
 * ]);
 *
 * const users = results[0].documents;
 * const companies = results[1].documents;
 * const jobs = results[2].documents;
 * ```
 */
export interface CollectionReadRequest {
  collection: string;
  ids: string[];
}

export async function batchReadMultipleCollections<T = DocumentData>(
  requests: CollectionReadRequest[]
): Promise<BatchReadResult<T>[]> {
  console.log(`📚 Batch reading from ${requests.length} collections`);

  const results = await Promise.all(
    requests.map(({ collection, ids }) =>
      batchReadByIds<T>(collection, ids)
    )
  );

  const totalReads = results.reduce((sum, r) => sum + r.readsPerformed, 0);
  const totalDocs = results.reduce((sum, r) => sum + r.documents.size, 0);

  console.log(
    `✅ Multi-collection read complete: ${totalDocs} documents from ${totalReads} reads`
  );

  return results;
}

/**
 * Chunk array into smaller arrays of specified size
 *
 * Internal helper function
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * Get read count estimate for a batch operation
 *
 * Useful for cost estimation and performance planning
 *
 * @example
 * ```typescript
 * const estimate = estimateReadCount(500);
 * console.log(`This will perform ${estimate} read operations`);
 * // Output: "This will perform 3 read operations"
 * ```
 */
export function estimateReadCount(documentCount: number): number {
  return Math.ceil(documentCount / FIRESTORE_BATCH_LIMIT);
}

/**
 * Performance comparison helper
 *
 * Compare batch vs individual reads to demonstrate improvement
 */
export interface ReadPerformanceComparison {
  individualReads: number;
  batchReads: number;
  improvement: string;
  costSavings: string;
}

export function compareReadPerformance(
  documentCount: number
): ReadPerformanceComparison {
  const individualReads = documentCount;
  const batchReads = estimateReadCount(documentCount);
  const improvement = (
    ((individualReads - batchReads) / individualReads) *
    100
  ).toFixed(1);

  return {
    individualReads,
    batchReads,
    improvement: `${improvement}%`,
    costSavings: `${individualReads - batchReads} fewer reads`,
  };
}
