"use server";

import {
  createUserDataProps,
  getUserDataPropsById,
  updateUserDataProps,
} from "@/lib/database/repositories/web-user-data-props";
import type { userDataProps } from "@/types/auth.types";

export const UserInfoGetPersonalInfo = async (uid: string) => {
  // Get user info, create if not exists
  try {
    if (uid) {
      const userParams = await getUserDataPropsById(uid);
      return userParams ? JSON.stringify(userParams) : undefined;
    }
    return undefined;
  } catch (e) {
    console.error("Error reading web_user_accounts document: ", e);
    console.error(
      "🔍 CHAT DEBUG: Error in UserInfoGetPersonalInfo for uid:",
      uid,
      "Error:",
      e,
    );
    return undefined;
  }
};

export async function updateUserAccountFirestore(userParams: userDataProps) {
  if (!userParams.uid) {
    console.error("No uid found in userParams");
    throw new Error("No uid found in userParams");
  }
  const result = await updateUserDataProps(userParams.uid, userParams);
  return result;
}

export async function setUserAccountFirestore(userParams: userDataProps) {
  if (userParams.uid) {
    console.warn("This uid will be overwritten: ", userParams.uid);
  }
  const result = await createUserDataProps(userParams);
  return result;
}
