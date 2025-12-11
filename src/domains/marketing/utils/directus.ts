/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createDirectus,
  createItem,
  readItem,
  readItems,
  rest,
  staticToken,
  updateItem,
} from "@directus/sdk";

import { retryDirectusOperation } from "@/lib/utils/retry";

export interface ItemsQuery {
  limit?: number;
  offset?: number;
  fields?: Array<string>;
  filter?: Record<
    string,
    | {
      _eq: string | number | boolean;
    }
    | {
      _some: {
        _eq: string | number;
      };
    }
    | {
      _lt: string;
    }
    | {
      _contains: string;
    }
    | {
      _in: Array<string>;
    }
    | {
      _neq: string;
    }
    | {
      slug: {
        _eq: string;
      };
    }
  >;
  search?: string;
  sort?: string[];
}

const directusApiEndpoint = String(process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT);

if (!directusApiEndpoint) {
  throw new Error("DIRECTUS_API_ENDPOINT is not defined");
}

export const directus = createDirectus(directusApiEndpoint)
  .with(staticToken("YJW0bHq5mDaDhJWIGNxrCubVzXqAPGJM"))
  .with(
    rest({
      credentials: 'same-origin',
    })
  );

export async function getCollectionById(id: string, options?: ItemsQuery) {
  const result = await retryDirectusOperation(
    `getCollectionById(${id})`,
    async () => directus.request(readItems(id, options))
  );
  
  if (result.success && result.data) {
    return result.data;
  }
  
  // Re-throw error for collections that don't have fallback data
  throw new Error(`Failed to fetch collection ${id}: ${result.error?.message}`);
}

export async function getItemById(
  collection: string,
  id: number | string,
  options?: ItemsQuery
) {
  const result = await retryDirectusOperation(
    `getItemById(${collection}/${id})`,
    async () => directus.request(readItem(collection, id, options))
  );
  
  if (result.success && result.data) {
    return result.data;
  }
  
  // Re-throw error for items that don't have fallback data
  throw new Error(`Failed to fetch item ${collection}/${id}: ${result.error?.message}`);
}

export async function createCollectionItem(
  collection: string,
  data: Record<string, any>
) {
  const result = await retryDirectusOperation(
    `createCollectionItem(${collection})`,
    async () => directus.request(createItem(collection, data))
  );
  
  if (result.success && result.data) {
    return result.data;
  }
  
  // Re-throw error for create operations (they shouldn't have fallback)
  throw new Error(`Failed to create item in ${collection}: ${result.error?.message}`);
}

export async function updateCollectionItem(
  collection: string,
  id: number,
  data: Record<string, any>
) {
  const result = await retryDirectusOperation(
    `updateCollectionItem(${collection}/${id})`,
    async () => directus.request(updateItem(collection, id, data))
  );
  
  if (result.success && result.data) {
    return result.data;
  }
  
  // Re-throw error for update operations (they shouldn't have fallback)
  throw new Error(`Failed to update item ${collection}/${id}: ${result.error?.message}`);
}
