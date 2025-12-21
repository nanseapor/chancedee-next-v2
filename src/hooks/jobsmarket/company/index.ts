/**
 * COMP-R00: Company Hooks - Barrel Export
 *
 * Centralized export for all company-related hooks
 */

// Access control hooks
export {
  useCompanyAuth,
  type UseCompanyAuthOptions,
  type UseCompanyAuthReturn,
} from "./use-company-auth";

export {
  useCompanyPermission,
  type UseCompanyPermissionOptions,
  type UseCompanyPermissionReturn,
} from "./use-company-permission";
