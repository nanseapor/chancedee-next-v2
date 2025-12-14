"use server";

import { webUserDataPropsGetByFilter } from "@/lib/database/actions/user-data-props";
import { Filter } from "firebase-admin/firestore";

export async function getCompanyAdminCount(companyId: string): Promise<number> {
  try {
    const filter: Filter = Filter.and(
      Filter.where("info.companyId", "==", companyId),
      Filter.where("info.roles", "array-contains", "admin")
    );

    const admins = await webUserDataPropsGetByFilter({ userInfoFilter: filter });
    return admins?.length || 0;
  } catch (error) {
    console.error("Error counting company admins:", error);
    return 0;
  }
}
