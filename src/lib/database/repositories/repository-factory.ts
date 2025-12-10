import { Filter } from "firebase-admin/firestore";

import {
  createDocument,
  deleteDocument,
  deleteDocumentsByFilter,
  generateDocumentId,
  getDocumentById,
  getDocumentsByFilter,
  updateDocument
} from "../utils/firebase-utils";

// Create a repository for a specific entity type
export function createRepository<T, F>(
  collectionName: string,
  toAppModel: (firebaseModel: F, createTime?: number, updateTime?: number) => T,
  toFirebaseModel: (appModel: T, actorId: string, isUpdate?: boolean) => F
) {
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