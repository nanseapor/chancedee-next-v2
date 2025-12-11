/**
 * Subscription Manager for Real-time Data
 *
 * Manages Firestore onSnapshot listeners with automatic cleanup.
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { DocumentSnapshot, Filter, Query, QuerySnapshot } from "firebase-admin/firestore";

export type UnsubscribeFn = () => void;

export interface SubscriptionOptions {
  /** Optional filter for the collection */
  filter?: Filter;
  /** Optional ordering */
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  /** Limit number of results */
  limit?: number;
}

export interface DocumentSubscriptionHandler<T> {
  onNext: (data: T | null) => void;
  onError?: (error: Error) => void;
}

export interface QuerySubscriptionHandler<T> {
  onNext: (data: T[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Subscription manager for handling real-time Firestore listeners
 */
export class SubscriptionManager {
  private subscriptions = new Map<string, UnsubscribeFn>();

  /**
   * Subscribe to a single document
   */
  subscribeToDocument<T, F>(
    collectionName: string,
    documentId: string,
    transform: (firebaseModel: F, createTime?: number, updateTime?: number) => T,
    handler: DocumentSubscriptionHandler<T>
  ): UnsubscribeFn {
    const db = getFirebaseAdminFirestore();
    const docRef = db.collection(collectionName).doc(documentId);

    const subscriptionId = `doc:${collectionName}:${documentId}:${Date.now()}`;

    const unsubscribe = docRef.onSnapshot(
      (snapshot: DocumentSnapshot) => {
        if (!snapshot.exists) {
          handler.onNext(null);
          return;
        }

        try {
          const data = {
            ...snapshot.data(),
            uid: snapshot.id,
          } as F;

          const transformed = transform(
            data,
            snapshot.createTime?.toMillis() || 0,
            snapshot.updateTime?.toMillis() || 0
          );

          handler.onNext(transformed);
        } catch (error) {
          if (handler.onError) {
            handler.onError(error as Error);
          }
        }
      },
      (error: Error) => {
        if (handler.onError) {
          handler.onError(error);
        }
      }
    );

    // Store subscription for cleanup
    this.subscriptions.set(subscriptionId, unsubscribe);

    // Return cleanup function
    return () => {
      unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  /**
   * Subscribe to a collection query
   */
  subscribeToQuery<T, F>(
    collectionName: string,
    transform: (firebaseModel: F, createTime?: number, updateTime?: number) => T,
    handler: QuerySubscriptionHandler<T>,
    options?: SubscriptionOptions
  ): UnsubscribeFn {
    const db = getFirebaseAdminFirestore();
    let query: Query = db.collection(collectionName);

    // Apply filter
    if (options?.filter) {
      query = query.where(options.filter);
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction);
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const subscriptionId = `query:${collectionName}:${Date.now()}`;

    const unsubscribe = query.onSnapshot(
      (snapshot: QuerySnapshot) => {
        try {
          const data = snapshot.docs.map(doc => {
            const firebaseData = {
              ...doc.data(),
              uid: doc.id,
            } as F;

            return transform(
              firebaseData,
              doc.createTime?.toMillis() || 0,
              doc.updateTime?.toMillis() || 0
            );
          });

          handler.onNext(data);
        } catch (error) {
          if (handler.onError) {
            handler.onError(error as Error);
          }
        }
      },
      (error: Error) => {
        if (handler.onError) {
          handler.onError(error);
        }
      }
    );

    // Store subscription for cleanup
    this.subscriptions.set(subscriptionId, unsubscribe);

    // Return cleanup function
    return () => {
      unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  /**
   * Unsubscribe all active subscriptions
   */
  unsubscribeAll(): void {
    for (const unsubscribe of Array.from(this.subscriptions.values())) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }

  /**
   * Get active subscription count
   */
  getActiveCount(): number {
    return this.subscriptions.size;
  }
}

/**
 * Global subscription manager instance
 */
let globalSubscriptionManager: SubscriptionManager | null = null;

/**
 * Get the global subscription manager
 */
export function getSubscriptionManager(): SubscriptionManager {
  if (!globalSubscriptionManager) {
    globalSubscriptionManager = new SubscriptionManager();
  }
  return globalSubscriptionManager;
}

/**
 * Create a subscription-enabled repository extension
 */
export function createSubscriptionExtension<T, F>(
  collectionName: string,
  transform: (firebaseModel: F, createTime?: number, updateTime?: number) => T,
  manager?: SubscriptionManager
) {
  const subscriptionManager = manager ?? getSubscriptionManager();

  return {
    /**
     * Subscribe to a single document
     */
    subscribeById(
      id: string,
      handler: DocumentSubscriptionHandler<T>
    ): UnsubscribeFn {
      return subscriptionManager.subscribeToDocument<T, F>(
        collectionName,
        id,
        transform,
        handler
      );
    },

    /**
     * Subscribe to a collection query
     */
    subscribeToQuery(
      handler: QuerySubscriptionHandler<T>,
      options?: SubscriptionOptions
    ): UnsubscribeFn {
      return subscriptionManager.subscribeToQuery<T, F>(
        collectionName,
        transform,
        handler,
        options
      );
    },
  };
}
