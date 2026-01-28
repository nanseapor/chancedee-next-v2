/**
 * Admin hooks for platform administration
 * Per ADM-R00 Cross-Cutting RIS
 */

export {
  useAdminAuth,
  type AdminAuthState,
  type AdminAuthResult,
} from "./use-admin-auth";

export {
  useAdminStats,
  type UseAdminStatsResult,
} from "./use-admin-stats";

export {
  useAdminCompanies,
  type UseAdminCompaniesOptions,
  type UseAdminCompaniesResult,
} from "./use-admin-companies";

export {
  useAdminCompanyDetail,
  type UseAdminCompanyDetailResult,
} from "./use-admin-company-detail";

export {
  useCompanyActions,
  type UseCompanyActionsOptions,
  type UseCompanyActionsResult,
} from "./use-company-actions";
