"use server";
import {
  createUserDataProps,
  getUserDataPropsById,
  updateUserDataProps as updateUserDataPropsRepo,
} from "@/lib/database/repositories/web-user-data-props";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { PerformanceMonitor } from "@/lib/performance-monitor";
import { seedUserData } from "@/lib/utils/shared/utils";
import { userDataProps } from "@/types/auth.types";

export async function getUserDataWithToken(idToken: string) {
  return PerformanceMonitor.measure("getUserDataWithToken", async () => {
    const user = await getFirebaseAdminAuth().verifyIdToken(idToken);
    if (!user) {
      return null;
    }
    let userData = await getUserDataPropsById(user.uid);
    if (!userData) {
      console.log("User data not found, creating user data");
      const newUserData = seedUserData(user.uid, {
        email: user.email || "",
        phone: "",
      });

      await createUserDataProps(newUserData);
      console.log("User data created successfully, fetching user data");
      userData = await getUserDataPropsById(user.uid);

      if (!userData) {
        console.error("User data creation failed");
        throw new Error("User data creation failed");
      }
    }
    return userData;
  });
}

export async function updateUserDataProps(
  uid: string,
  data: userDataProps
): Promise<void> {
  return updateUserDataPropsRepo(uid, data);
}
