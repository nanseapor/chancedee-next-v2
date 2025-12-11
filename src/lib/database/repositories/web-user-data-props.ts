import "server-only";

import { Filter } from "firebase-admin/firestore";

import { fetchDataByFilter } from "@/lib/utils/shared/utils";
import { PerformanceMonitor } from "@/lib/utils/performance-monitor";
import { userDataProps } from "@/types/auth.types";

import {
  webUserAccountCreate,
  webUserAccountGetByFilter,
  webUserAccountGetCompleteById,
  webUserAccountUpdate,
} from "../actions/user-accounts";
import {
  webUserInfoCreate,
  webUserInfoGetByFilter,
  webUserInfoUpdate,
} from "../actions/user-info";
import {
  webUserTransferCreate,
  webUserTransferGetByFilter,
  webUserTransferUpdate,
} from "../actions/user-transfer";

// !IMPORTANT
// !Cache user info here make registration sequence failed as user infor was not loaded fast enough.
// PERFORMANCE OPTIMIZED: Uses single Firestore query instead of 3 separate queries
export const getUserDataPropsById = async (uid: string) => {
  return PerformanceMonitor.measure(
    `getUserDataPropsById(${uid})`,
    async () => {
      try {
        // OPTIMIZATION: Single consolidated query (3 queries → 1 query)
        const completeData = await webUserAccountGetCompleteById(uid);

        if (!completeData) {
          return null;
        }

        const { userData, userInfo, userTransfer } = completeData;

        if (userData && userInfo && userTransfer) {
          const userdata: userDataProps = {
            ...userData,
            info: {
              ...userInfo,
            },
            transfer: {
              ...userTransfer,
            },
          };
          return userdata;
        } else {
          return null;
        }
      } catch (error) {
        console.error(`UNHANDLED: Get user data props for user ${uid} error`, error);
        return null;
      }
    }
  );
};

export const getUserDataPropsByFilter = async (props?: {
  userDataFilter?: Filter;
  userInfoFilter?: Filter;
  userTransferFilter?: Filter;
}) => {
  // Helper function to fetch data by filter
  const [
    userDataList,
    userInfoList,
    userTransferList,
  ] = await Promise.all([
    fetchDataByFilter(props?.userDataFilter, webUserAccountGetByFilter),
    fetchDataByFilter(props?.userInfoFilter, webUserInfoGetByFilter),
    fetchDataByFilter(props?.userTransferFilter, webUserTransferGetByFilter),
  ]);

  // INTERSECTION LOGIC: Only include UIDs that match ALL provided filters
  const uidSets: Set<string>[] = [];

  // CRITICAL FIX: If a filter is provided, we MUST add its result set (even if empty/null)
  // This ensures proper intersection: if any filter returns no results, final result is empty
  if (props?.userDataFilter) {
    uidSets.push(new Set(userDataList?.map(u => u.uid).filter(Boolean) as string[] || []));
  }
  if (props?.userInfoFilter) {
    uidSets.push(new Set(userInfoList?.map(u => u.uid).filter(Boolean) as string[] || []));
  }
  if (props?.userTransferFilter) {
    uidSets.push(new Set(userTransferList?.map(u => u.uid).filter(Boolean) as string[] || []));
  }

  // If no filters provided, return empty array
  if (uidSets.length === 0) {
    return [];
  }

  // Find intersection: UIDs present in ALL sets
  const userList = Array.from(uidSets[0]).filter(uid =>
    uidSets.every(set => set.has(uid))
  );

  // Fetch all candidate data in parallel
  const result = await Promise.all(
    userList
      .filter((item) => item !== null)
      .map(async (uid) => {
        try {
          const userInfo = await getUserDataPropsById(uid);
          return userInfo;
        } catch {
          return null;
        }
      })
  );

  return result.filter((item) => item) as userDataProps[];
};

export const createUserDataProps = async (data: userDataProps): Promise<void> => {
  const { runTransaction, createTransactionalOperations } = await import("../utils/transaction-utils");
  const { info, transfer, ...userdata } = data;

  if (!userdata.uid) {
    throw new Error("No uid found in userdata when creating");
  }

  // Use atomic transaction to ensure all-or-nothing creation
  await runTransaction(async (ctx) => {
    const ops = createTransactionalOperations(ctx, userdata.uid);

    // Create user account
    ops.create('user_accounts', userdata.uid, {
      ...userdata,
      createdAt: userdata.createdAt ?? Date.now(),
      updatedAt: userdata.updatedAt ?? Date.now(),
      isActive: userdata.isActive ?? true,
    });

    // Create user info
    ops.create('user_info', userdata.uid, info);

    // Create user transfer if provided
    if (transfer) {
      ops.create('user_transfer', userdata.uid, transfer);
    }
  });
};

export const updateUserDataProps = async (uid: string, data: userDataProps): Promise<void> => {
  console.log('🔷 [updateUserDataProps] START', {
    uid,
    hasInfo: !!data.info,
    hasTransfer: !!data.transfer,
    infoRoles: data.info?.roles
  });

  try {
    const { runTransaction, createTransactionalOperations } = await import("../utils/transaction-utils");
    const { info, transfer, ...userdata } = data;

    if (!uid) {
      console.error('❌ [updateUserDataProps] No uid provided');
      throw new Error("No uid provided for update");
    }

    console.log('📊 [updateUserDataProps] Destructured data:', {
      uid,
      infoUid: info?.uid,
      userDataUid: userdata.uid,
      infoRoles: info?.roles
    });

    userdata.email = userdata.email || "";
    userdata.phone = userdata.phone || "";

    // Use atomic transaction to ensure all-or-nothing update
    await runTransaction(async (ctx) => {
      const ops = createTransactionalOperations(ctx, uid);

      // Update user account
      ops.update('user_accounts', userdata.uid, {
        ...userdata,
        createdAt: userdata.createdAt ?? Date.now(),
        updatedAt: userdata.updatedAt ?? Date.now(),
        isActive: userdata.isActive ?? true,
      });

      // Update user info
      ops.update('user_info', info.uid, info);

      // Update user transfer if provided
      if (transfer) {
        ops.update('user_transfer', transfer.uid, transfer);
      }
    });

    console.log('✅ [updateUserDataProps] All updates completed successfully');

  } catch (error) {
    console.error('❌ [updateUserDataProps] FAILED:', {
      uid,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    });
    throw error;
  }
};
