import "server-only";

import { Filter, Query } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";

import {
  createDocument,
  deleteDocument,
  deleteDocumentsByFilter,
  generateDocumentId,
  getDocumentById,
  getDocumentsByFilter,
  updateDocument
} from "../utils/firebase-utils";
import {
  IRepository,
  QueryOptions,
  PaginatedResult,
} from "./interfaces/repository.interface";

// Default pagination limit
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Create a repository for a specific entity type
export function createRepository<T, F>(
  collectionName: string,
  toAppModel: (firebaseModel: F, createTime?: number, updateTime?: number) => T,
  toFirebaseModel: (appModel: T, actorId: string, isUpdate?: boolean) => F
): IRepository<T> {
  return {
    // Get by ID
    async getById(id: string): Promise<T | null> {
      const firebaseModel = await getDocumentById<F>(collectionName, id);

      if (!firebaseModel) {
        return null;
      }

      return toAppModel(
        firebaseModel,
        (firebaseModel as any)._createTime,
        (firebaseModel as any)._updateTime
      );
    },

    // Get by filter
    async getByFilter(filter?: Filter): Promise<T[] | null> {
      const firebaseModels = await getDocumentsByFilter<F>(collectionName, filter);

      if (!firebaseModels) {
        return null;
      }

      return firebaseModels.map(model =>
        toAppModel(
          model,
          (model as any)._createTime,
          (model as any)._updateTime
        )
      );
    },

    // Get by filter with pagination
    async getByFilterPaginated(options?: QueryOptions): Promise<PaginatedResult<T>> {
      const db = getFirebaseAdminFirestore();
      const { filter, pagination } = options || {};
      const {
        limit = DEFAULT_PAGE_SIZE,
        cursor,
        orderBy = 'created_at',
        orderDirection = 'desc'
      } = pagination || {};

      // Clamp limit to max
      const effectiveLimit = Math.min(limit, MAX_PAGE_SIZE);

      // Build query
      let query: Query = db.collection(collectionName);

      if (filter) {
        query = query.where(filter);
      }

      // Order by specified field
      query = query.orderBy(orderBy, orderDirection);

      // Apply cursor if provided
      if (cursor) {
        const cursorDoc = await db.collection(collectionName).doc(cursor).get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }

      // Fetch one extra to check if there are more pages
      query = query.limit(effectiveLimit + 1);

      const snapshot = await query.get();
      const docs = snapshot.docs;

      // Check if there are more results
      const hasMore = docs.length > effectiveLimit;
      const resultDocs = hasMore ? docs.slice(0, effectiveLimit) : docs;

      // Transform documents
      const data = resultDocs.map(doc => toAppModel(
        {
          ...doc.data(),
          uid: doc.id,
        } as F,
        doc.createTime?.toMillis() || 0,
        doc.updateTime?.toMillis() || 0
      ));

      // Get next cursor
      const nextCursor = hasMore && resultDocs.length > 0
        ? resultDocs[resultDocs.length - 1].id
        : null;

      return {
        data,
        nextCursor,
        hasMore,
      };
    },

    // Count documents matching filter
    async count(filter?: Filter): Promise<number> {
      const db = getFirebaseAdminFirestore();
      let query: Query = db.collection(collectionName);

      if (filter) {
        query = query.where(filter);
      }

      const countSnapshot = await query.count().get();
      return countSnapshot.data().count;
    },

    // Create
    async create(model: T, actorId: string, id?: string): Promise<string> {
      const firebaseModel = toFirebaseModel(model, actorId);
      const extendedModel = {
        ...firebaseModel,
        uid: id,
      }
      return createDocument(collectionName, extendedModel, actorId, id);
    },

    // Update
    async update(id: string, model: T, actorId: string): Promise<string> {
      const firebaseModel = toFirebaseModel(model, actorId, true);
      return updateDocument(collectionName, id, firebaseModel, actorId);
    },

    // Delete
    async delete(id: string): Promise<void> {
      return deleteDocument(collectionName, id);
    },

    // Delete by filter
    async deleteByFilter(field: string, value: string): Promise<boolean> {
      return deleteDocumentsByFilter(collectionName, field, value);
    },

    // Generate ID
    generateId(): string {
      return generateDocumentId(collectionName);
    }
  };
}