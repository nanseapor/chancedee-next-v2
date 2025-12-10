import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Transaction currency schema - flexible string for various currencies
 * Common values: coin, star - but allows other values for flexibility
 */
export const TransactionCurrencySchema = z.string();

/**
 * Transaction type schema - flexible string for various transaction types
 * Common values: deposit, withdraw - but allows other values for flexibility
 */
export const TransactionTypeSchema = z.string();

/**
 * Firebase wallet transactions schema
 * Based on FirebaseWalletTransactionType
 */
export const FirebaseWalletTransactionSchema = BaseFirebaseSchema.extend({
  /** Transaction details */
  transaction_owner: z.string(),
  transaction_receiver: z.string(),
  transaction_origin: z.string(),
  
  /** 
   * Transaction type - controls balance calculation
   * CRITICAL FIELD - Controls financial operations
   */
  transaction_type: TransactionTypeSchema,
  
  /** 
   * Transaction amount - always positive
   * CRITICAL FIELD - Controls financial calculations
   */
  transaction_amount: z.number().positive(),
  
  /** 
   * Transaction currency
   * CRITICAL FIELD - Controls wallet operations
   */
  transaction_currency: TransactionCurrencySchema,
  
  /** Transaction timing */
  transaction_time: z.custom<Timestamp>(),
  
  /** Optional remarks */
  remark: z.string().optional(),
});

/**
 * App model wallet transaction schema
 */
export const WalletTransactionDataSchema = BaseAppSchema.extend({
  transactionOwner: z.string(),
  transactionReceiver: z.string(),
  transactionOrigin: z.string(),
  
  /** CRITICAL FIELD - Controls balance calculation */
  transactionType: TransactionTypeSchema,
  
  /** CRITICAL FIELD - Controls financial calculations */
  transactionAmount: z.number().positive(),
  
  /** CRITICAL FIELD - Controls wallet operations */
  transactionCurrency: TransactionCurrencySchema,
  
  transactionTime: z.number(),
  
  remark: z.string().optional(),
});

/**
 * Pockets schema (wallet balance tracking)
 */
export const FirebasePocketsSchema = BaseFirebaseSchema.extend({
  /** 
   * Currency type
   * CRITICAL FIELD - Controls wallet operations
   */
  currency: TransactionCurrencySchema,
  
  /** 
   * Current balance
   * CRITICAL FIELD - Controls financial operations
   */
  balance: z.number(),
  
  /** Latest transaction IDs */
  latest: z.array(z.string()),
});

export const PocketsDataSchema = BaseAppSchema.extend({
  /** CRITICAL FIELD - Controls wallet operations */
  currency: TransactionCurrencySchema,
  
  /** CRITICAL FIELD - Controls financial operations */
  balance: z.number(),
  
  latest: z.array(z.string()),
});

/**
 * Critical fields schemas for selective validation
 * Include base timestamp/reference fields to catch serialization issues
 */
export const WalletTransactionCriticalSchema = FirebaseWalletTransactionSchema.pick({
  uid: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  transaction_type: true,
  transaction_amount: true,
  transaction_currency: true,
});

export const PocketsCriticalSchema = FirebasePocketsSchema.pick({
  uid: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  currency: true,
  balance: true,
});

// Export inferred types
export type FirebaseWalletTransactionType = z.infer<typeof FirebaseWalletTransactionSchema>;
export type WalletTransactionData = z.infer<typeof WalletTransactionDataSchema>;
export type FirebasePocketsType = z.infer<typeof FirebasePocketsSchema>;
export type PocketsData = z.infer<typeof PocketsDataSchema>;
export type TransactionCurrency = z.infer<typeof TransactionCurrencySchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

// Alias for backward compatibility
export type FirebaseCurrencyType = TransactionCurrency;

// Export schemas for use in repositories
export const schemas = {
  walletTransactions: {
    firebase: {
      full: FirebaseWalletTransactionSchema,
      critical: WalletTransactionCriticalSchema,
    },
    app: {
      full: WalletTransactionDataSchema,
      critical: WalletTransactionDataSchema.pick({
        transactionType: true,
        transactionAmount: true,
        transactionCurrency: true,
      }),
    },
  },
  pockets: {
    firebase: {
      full: FirebasePocketsSchema,
      critical: PocketsCriticalSchema,
    },
    app: {
      full: PocketsDataSchema,
      critical: PocketsDataSchema.pick({
        currency: true,
        balance: true,
      }),
    },
  },
};