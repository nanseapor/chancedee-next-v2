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

// Team management hooks (COMP-R02)
export {
  useCompanyTeam,
  type UseCompanyTeamOptions,
  type UseCompanyTeamReturn,
} from "./use-company-team";

export {
  useTeamActions,
  type UseTeamActionsOptions,
  type UseTeamActionsReturn,
} from "./use-team-actions";

// Settings hooks (COMP-R03)
export { useCompanySettings } from "./use-company-settings";
export { useCompanyImageUpload } from "./use-company-image-upload";
