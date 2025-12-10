/**
 * Central export for all database schemas
 * Schema-first approach using zod-to-ts pattern
 */

// Base schemas
export * from './base.schema';

// Core domain schemas - explicit exports to avoid naming conflicts
export {
  JobApplicationSchema,
  FirebaseJobApplicationSchema,
  JobApplicationCriticalSchema,
  FirebaseJobApplicationCriticalSchema,
  JobApplicationStatusSchema,
  convertStatusToEnum,
  convertToLegacyJobApplicationData,
  type JobApplicationData,
  type FirebaseJobApplicationType,
  type JobApplicationStatus,
} from './job-applications.schema';

export {
  FirebaseUserAccountSchema,
  UserDataPropsSchema,
  FirebaseUserDataPropsSchema,
  UserAccountCriticalSchema,
  UserDataPropsCriticalSchema,
  UserInfoPropsSchema,
  UserStatusSchema,
  UserRolesSchema,
  type UserDataProps,
  type FirebaseUserAccountType,
  type UserInfoProps,
  type UserStatus,
  type UserRoles,
} from './user-accounts.schema';

export {
  FirebaseCompanyInformationSchema,
  FirebaseCompanyDataSchema,
  CompanyInformationCriticalSchema,
  CompanyDataCriticalSchema,
  CompanyStatusSchema,
  type CompanyDataProps,
  type FirebaseCompanyInformationType,
  type FirebaseCompanyData,
  type CompanyStatus,
} from './company-information.schema';

export {
  FirebaseJobSchema,
  FirebaseJobDataSchema,
  JobCriticalSchema,
  JobDataCriticalSchema,
  JobStatusSchema,
  type FirebaseJobType,
  type FirebaseJobData,
  type JobStatus,
} from './jobs.schema';

export {
  FirebaseCandidateInformationSchema,
  CandidateInformationDataSchema,
  CandidateInformationCriticalSchema,
  type CandidateInformationData,
  type FirebaseCandidateInformationType,
  type CandidateStatus,
} from './candidate-information.schema';

export {
  FirebaseMessageSchema,
  MessageDataSchema,
  MessageCriticalSchema,
  MessageTypeSchema,
  type MessageData,
  type FirebaseMessagesType,
  type MessageType,
} from './messages.schema';

export {
  FirebaseWalletTransactionSchema,
  WalletTransactionDataSchema,
  FirebasePocketsSchema,
  PocketsDataSchema,
  WalletTransactionCriticalSchema,
  PocketsCriticalSchema,
  TransactionCurrencySchema,
  TransactionTypeSchema,
  type WalletTransactionData,
  type FirebaseWalletTransactionType,
  type PocketsData,
  type FirebasePocketsType,
  type TransactionCurrency,
  type TransactionType,
  type FirebaseCurrencyType,
} from './wallet-transactions.schema';

// Core business schemas
export {
  FirebaseAddressSchema,
  AddressDataSchema,
  AddressCriticalSchema,
  type FirebaseAddressType,
  type AddressData,
} from './address.schema';

export {
  FirebaseContactSchema,
  ContactDataSchema,
  ContactCriticalSchema,
  type FirebaseContactType,
  type ContactData,
} from './contact.schema';

export {
  FirebaseChatSchema,
  ChatDataSchema,
  ChatCriticalSchema,
  type FirebaseChatType,
  type ChatData,
} from './chat.schema';

export {
  FirebaseJobInterviewSchema,
  JobInterviewDataSchema,
  JobInterviewCriticalSchema,
  type FirebaseJobInterviewType,
  type JobInterviewData,
} from './job-interviews.schema';

export {
  FirebaseJobOfferSchema,
  JobOfferDataSchema,
  JobOfferCriticalSchema,
  type FirebaseJobOfferType,
  type JobOfferData,
} from './job-offers.schema';

// User management schemas
export {
  FirebaseAdminInvitationSchema,
  AdminInvitationDataSchema,
  AdminInvitationCriticalSchema,
  type FirebaseAdminInvitationType,
  type AdminInvitationData,
} from './admin-invitation.schema';

export {
  FirebaseCandidatePreferenceSchema,
  CandidatePreferenceDataSchema,
  CandidatePreferenceCriticalSchema,
  type FirebaseCandidatePreferenceType,
  type CandidatePreferenceData,
} from './candidate-preference.schema';

export {
  FirebaseUserInfoSchema,
  UserInfoDataSchema,
  UserInfoCriticalSchema,
  type FirebaseUserInfoType,
  type UserInfoData,
} from './user-info.schema';

export {
  FirebaseCompanyRequestsSchema,
  CompanyRequestsDataSchema,
  CompanyRequestsCriticalSchema,
  type FirebaseCompanyRequestsType,
  type CompanyRequestsData,
} from './company-requests.schema';

// System infrastructure schemas
export {
  FirebaseFCMTokenSchema,
  FCMTokenDataSchema,
  FCMTokenCriticalSchema,
  type FirebaseFCMTokenType,
  type FCMTokenData,
} from './fcm-token.schema';

export {
  FirebaseOTPCodesSchema,
  OTPCodesDataSchema,
  OTPCodesCriticalSchema,
  type FirebaseOTPCodesType,
  type OTPCodesData,
} from './otp-codes.schema';

export {
  FirebaseDeleteRequestSchema,
  DeleteRequestDataSchema,
  DeleteRequestCriticalSchema,
  type FirebaseDeleteRequestType,
  type DeleteRequestData,
} from './delete.schema';

export {
  FirebaseUserTransferSchema,
  UserTransferDataSchema,
  UserTransferCriticalSchema,
  type FirebaseUserTransferType,
  type UserTransferData,
} from './user-transfer.schema';

export {
  FirebaseCandidateScreeningSchema,
  CandidateScreeningDataSchema,
  FirebaseSuspensionRecordsSchema,
  SuspensionRecordsDataSchema,
  FirebaseActivityLogsSchema,
  ActivityLogsDataSchema,
  FirebaseContentFlagsSchema,
  ContentFlagsDataSchema,
  type FirebaseCandidateScreeningType,
  type CandidateScreeningData,
  type FirebaseSuspensionRecords,
  type SuspensionRecordsData,
  type FirebaseActivityLogs,
  type ActivityLogsData,
  type FirebaseContentFlags,
  type ContentFlagsData,
} from './candidate-screening.schema';

export {
  FirebaseCandidateReferralSchema,
  CandidateReferralDataSchema,
  CandidateReferralCriticalSchema,
  type FirebaseCandidateReferralType,
  type CandidateReferralData,
} from './candidate-referral.schema';

// Re-export zod for convenience
export { z } from 'zod';

/**
 * Schema registry for easy access to all schemas
 */
export const schemaRegistry = {
  // Core existing schemas
  jobApplications: () => import('./job-applications.schema'),
  userAccounts: () => import('./user-accounts.schema'),
  companyInformation: () => import('./company-information.schema'),
  jobs: () => import('./jobs.schema'),
  candidateInformation: () => import('./candidate-information.schema'),
  messages: () => import('./messages.schema'),
  walletTransactions: () => import('./wallet-transactions.schema'),
  
  // Core business schemas
  address: () => import('./address.schema'),
  contact: () => import('./contact.schema'),
  chat: () => import('./chat.schema'),
  jobInterviews: () => import('./job-interviews.schema'),
  jobOffers: () => import('./job-offers.schema'),
  
  // User management schemas
  adminInvitation: () => import('./admin-invitation.schema'),
  candidatePreference: () => import('./candidate-preference.schema'),
  userInfo: () => import('./user-info.schema'),
  companyRequests: () => import('./company-requests.schema'),
  
  // System infrastructure schemas
  fcmToken: () => import('./fcm-token.schema'),
  otpCodes: () => import('./otp-codes.schema'),
  delete: () => import('./delete.schema'),
  userTransfer: () => import('./user-transfer.schema'),
  candidateScreening: () => import('./candidate-screening.schema'),
  candidateReferral: () => import('./candidate-referral.schema'),
};

/**
 * Critical fields registry for selective validation
 * Maps collection names to their critical field schemas
 */
export const criticalFieldsRegistry = {
  job_applications: {
    firebase: () => import('./job-applications.schema').then(m => m.FirebaseJobApplicationCriticalSchema),
    app: () => import('./job-applications.schema').then(m => m.JobApplicationCriticalSchema),
  },
  user_accounts: {
    firebase: () => import('./user-accounts.schema').then(m => m.UserAccountCriticalSchema),
    app: () => import('./user-accounts.schema').then(m => m.UserDataPropsCriticalSchema),
  },
  company_information: {
    firebase: () => import('./company-information.schema').then(m => m.CompanyInformationCriticalSchema),
    app: () => import('./company-information.schema').then(m => m.CompanyDataCriticalSchema),
  },
  jobs: {
    firebase: () => import('./jobs.schema').then(m => m.JobCriticalSchema),
    app: () => import('./jobs.schema').then(m => m.JobDataCriticalSchema),
  },
  candidate_information: {
    firebase: () => import('./candidate-information.schema').then(m => m.CandidateInformationCriticalSchema),
    app: () => import('./candidate-information.schema').then(m => m.CandidateDataCriticalSchema),
  },
  messages: {
    firebase: () => import('./messages.schema').then(m => m.MessageCriticalSchema),
    app: () => import('./messages.schema').then(m => m.MessageDataCriticalSchema),
  },
  wallet_transactions: {
    firebase: () => import('./wallet-transactions.schema').then(m => m.WalletTransactionCriticalSchema),
    app: () => import('./wallet-transactions.schema').then(m => m.WalletTransactionDataSchema.pick({
      uid: true,
      createdBy: true,
      updatedBy: true,
      createdAt: true,
      updatedAt: true,
      transactionType: true,
      transactionAmount: true,
      transactionCurrency: true,
    })),
  },
  pockets: {
    firebase: () => import('./wallet-transactions.schema').then(m => m.PocketsCriticalSchema),
    app: () => import('./wallet-transactions.schema').then(m => m.PocketsDataSchema.pick({
      uid: true,
      createdBy: true,
      updatedBy: true,
      createdAt: true,
      updatedAt: true,
      currency: true,
      balance: true,
    })),
  },
};