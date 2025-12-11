import "server-only";

/**
 * Transaction Utilities for Firestore
 *
 * Provides atomic operations across multiple collections.
 * All operations succeed or all fail together.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp, DocumentReference, Transaction } from "firebase-admin/firestore";

/**
 * Transaction operation types
 */
export interface TransactionOperation {
  type: 'create' | 'update' | 'delete';
  collection: string;
  id: string;
  data?: Record<string, any>;
  actorId?: string;
}

/**
 * Transaction context passed to operation functions
 */
export interface TransactionContext {
  transaction: Transaction;
  db: FirebaseFirestore.Firestore;

  // Helper methods
  getRef(collection: string, id: string): DocumentReference;
  getUserRef(userId: string): DocumentReference;
}

/**
 * Run multiple operations in a single atomic transaction
 *
 * @example
 * ```typescript
 * await runTransaction(async (ctx) => {
 *   // All these operations are atomic
 *   await ctx.transaction.set(ctx.getRef('users', 'user1'), userData);
 *   await ctx.transaction.set(ctx.getRef('user_info', 'user1'), infoData);
 *   await ctx.transaction.set(ctx.getRef('user_transfer', 'user1'), transferData);
 *   return 'user1';
 * });
 * ```
 */
export async function runTransaction<T>(
  operations: (ctx: TransactionContext) => Promise<T>
): Promise<T> {
  const db = getFirebaseAdminFirestore();

  return db.runTransaction(async (transaction) => {
    const ctx: TransactionContext = {
      transaction,
      db,
      getRef: (collection: string, id: string) => db.collection(collection).doc(id),
      getUserRef: (userId: string) => db.collection('user_accounts').doc(userId),
    };

    return operations(ctx);
  });
}

/**
 * Execute a batch of predefined operations atomically
 *
 * @example
 * ```typescript
 * await executeTransactionBatch([
 *   { type: 'create', collection: 'users', id: 'user1', data: userData, actorId: 'admin1' },
 *   { type: 'create', collection: 'user_info', id: 'user1', data: infoData, actorId: 'admin1' },
 * ]);
 * ```
 */
export async function executeTransactionBatch(
  operations: TransactionOperation[]
): Promise<void> {
  const db = getFirebaseAdminFirestore();

  await db.runTransaction(async (transaction) => {
    for (const op of operations) {
      const docRef = db.collection(op.collection).doc(op.id);

      switch (op.type) {
        case 'create': {
          const actorRef = op.actorId
            ? (op.collection === 'user_accounts' ? op.actorId : db.collection('user_accounts').doc(op.actorId))
            : null;

          const dataToWrite = {
            ...op.data,
            uid: op.id,
            created_by: actorRef,
            created_at: Timestamp.now(),
            updated_by: actorRef,
            updated_at: Timestamp.now(),
          };
          transaction.set(docRef, dataToWrite);
          break;
        }

        case 'update': {
          const actorRef = op.actorId
            ? (op.collection === 'user_accounts' ? op.actorId : db.collection('user_accounts').doc(op.actorId))
            : null;

          const dataToWrite = {
            ...op.data,
            updated_by: actorRef,
            updated_at: Timestamp.now(),
          };
          transaction.update(docRef, dataToWrite);
          break;
        }

        case 'delete':
          transaction.delete(docRef);
          break;
      }
    }
  });
}

/**
 * Transactional repository operations wrapper
 *
 * Use this when you need to perform repository-style operations
 * that must be atomic.
 */
export function createTransactionalOperations(ctx: TransactionContext, actorId: string) {
  return {
    create: <T extends Record<string, any>>(
      collection: string,
      id: string,
      data: T
    ) => {
      const docRef = ctx.getRef(collection, id);
      const actorRef = collection === 'user_accounts'
        ? actorId
        : ctx.getUserRef(actorId);

      ctx.transaction.set(docRef, {
        ...data,
        uid: id,
        created_by: actorRef,
        created_at: Timestamp.now(),
        updated_by: actorRef,
        updated_at: Timestamp.now(),
      });

      return id;
    },

    update: <T extends Record<string, any>>(
      collection: string,
      id: string,
      data: T
    ) => {
      const docRef = ctx.getRef(collection, id);
      const actorRef = collection === 'user_accounts'
        ? actorId
        : ctx.getUserRef(actorId);

      ctx.transaction.update(docRef, {
        ...data,
        updated_by: actorRef,
        updated_at: Timestamp.now(),
      });

      return id;
    },

    delete: (collection: string, id: string) => {
      const docRef = ctx.getRef(collection, id);
      ctx.transaction.delete(docRef);
    },

    get: async <T>(collection: string, id: string): Promise<T | null> => {
      const docRef = ctx.getRef(collection, id);
      const snapshot = await ctx.transaction.get(docRef);

      if (!snapshot.exists) {
        return null;
      }

      return {
        ...snapshot.data(),
        uid: snapshot.id,
      } as T;
    },
  };
}
