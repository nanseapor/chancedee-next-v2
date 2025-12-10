import { z } from 'zod';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';
import { FirebaseCurrencyType } from './wallet-transactions.schema';

/**
 * Firebase pockets schema
 * Wallet pocket management for different currencies
 */
export const FirebasePocketsSchema = BaseFirebaseSchema.extend({
  /** The currency type of the pocket */
  currency: z.custom<FirebaseCurrencyType>(),
  
  /** The current balance of the pocket */
  balance: z.number(),
  
  /** An array of the latest transaction identifiers */
  latest: z.array(z.string()),
});

/**
 * App model pockets schema (repository transformation output)
 */
export const PocketsDataSchema = BaseAppSchema.extend({
  /** The currency type of the pocket */
  currency: z.custom<FirebaseCurrencyType>(),
  
  /** The current balance of the pocket */
  balance: z.number(),
  
  /** An array of the latest transaction identifiers */
  latest: z.array(z.string()),
});

/**
 * Critical fields schemas for selective validation
 */
export const PocketsCriticalSchema = FirebasePocketsSchema.pick({
  currency: true,
  balance: true,
});

export const PocketsDataCriticalSchema = PocketsDataSchema.pick({
  currency: true,
  balance: true,
});

// Export inferred types
export type FirebasePocketsType = z.infer<typeof FirebasePocketsSchema>;
export type PocketsData = z.infer<typeof PocketsDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebasePocketsSchema,
    critical: PocketsCriticalSchema,
  },
  app: {
    full: PocketsDataSchema,
    critical: PocketsDataCriticalSchema,
  },
};