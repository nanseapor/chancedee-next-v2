"use server";
import { loadEnvConfig } from "@next/env";
import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath, unstable_cache } from "next/cache";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import {
  masterDataSchema,
  validateMasterData,
} from "@/lib/validations/masterDataSchema";
import type { masterData, masterQueryParams } from "@/types/master-data.types";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export const masterDataGet = async ({ collectionName }: masterQueryParams) => {
  try {
    const parsedCollectionName = collectionName
      .replace(/\s+/g, "-")
      .toLowerCase();
    const cachedMasterData = await unstable_cache(
      async () => {
        const querySnapshot = await getFirebaseAdminFirestore()
          .collection(parsedCollectionName)
          .get();
        if (querySnapshot.docs.length > 0) {
          const result = querySnapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              uid: doc.id,
            };
          });
          const data = masterDataSchema.parse({ data: result });
          return data.data.map((item) => {
            const returnData: masterData = {
              uid: item.uid,
              code: item.code,
              label: item.label,
              icon: item.icon,
              sort: item.sort,
              members: item.members,
              isActive: item.is_active,
              createAt: item.created_at.toMillis(),
              updateAt: item.updated_at.toMillis(),
              createBy: item.created_by?.id,
              updateBy: item.updated_by?.id,
            };
            return returnData;
          });
        } else {
          return null;
        }
      },
      [`data-${parsedCollectionName}`],
      {
        revalidate: 3600,
        tags: ["dataCache", `collection-${parsedCollectionName}`],
      },
    )();
    return cachedMasterData;
  } catch (e) {
    console.error("Error get master document: ", collectionName, e);
    return null;
  }
};

export const selectOptionsGet = async ({
  collectionName,
}: masterQueryParams) => {
  let options: { value: string; label: string }[] = [];
  const res = await masterDataGet({ collectionName });
  if (res) {
    options = res.map((item) => {
      return { value: item.code, label: item.label };
    });
  }
  return options;
};

// Collection names mapping
const collectionNames = {
  jobFunctions: "master_job_functions",
  jobTypes: "master_job_types",
  careerLevels: "master_career_levels",
  educationLevels: "master_education_levels",
  skills: "master_skills",
};

export async function addMasterDataItem(category: string, item: masterData) {
  try {
    const db = getFirebaseAdminFirestore();
    const collectionName =
      collectionNames[category as keyof typeof collectionNames];

    if (!collectionName) {
      throw new Error(`Invalid category: ${category}`);
    }
    const dataToAdd = validateMasterData({
      uid: item.uid,
      code: item.code,
      label: item.label,
      icon: item.icon,
      sort: item.sort,
      members: item.members,
      is_active: true,
      created_at: Timestamp.now(),
      created_by: item.createBy,
      updated_at: Timestamp.now(),
      updated_by: item.updateBy,
    });

    if (!dataToAdd) {
      throw new Error("Invalid data");
    }

    const docRef = await db.collection(collectionName).add(dataToAdd?.data);

    revalidatePath("/admin/master-data");

    return {
      id: docRef.id,
      ...item,
    };
  } catch (error) {
    console.error("Error adding master data item:", error);
    throw error;
  }
}

export async function updateMasterDataItem(category: string, item: masterData) {
  try {
    const db = getFirebaseAdminFirestore();
    const collectionName =
      collectionNames[category as keyof typeof collectionNames];

    if (!collectionName) {
      throw new Error(`Invalid category: ${category}`);
    }

    const dataToAdd = validateMasterData({
      uid: item.uid,
      code: item.code,
      label: item.label,
      icon: item.icon,
      sort: item.sort,
      members: item.members,
      is_active: item.isActive,
      created_at: item.createAt,
      created_by: item.createBy,
      updated_at: Timestamp.now(),
      updated_by: item.updateBy,
    });

    if (!dataToAdd) {
      throw new Error("Invalid data");
    }

    // await db.collection(collectionName).doc(item.uid).update(dataToAdd?.data)

    await db
      .collection(collectionName)
      .doc(item.uid)
      .update({ ...dataToAdd.data });

    revalidatePath("/admin/master-data");

    return true;
  } catch (error) {
    console.error("Error updating master data item:", error);
    throw error;
  }
}

export async function deleteMasterDataItem(category: string, itemId: string) {
  try {
    const db = getFirebaseAdminFirestore();
    const collectionName =
      collectionNames[category as keyof typeof collectionNames];

    if (!collectionName) {
      throw new Error(`Invalid category: ${category}`);
    }

    // await db.collection(collectionName).doc(itemId).delete()
    // Soft delete instead
    await db.collection(collectionName).doc(itemId).update({
      is_active: false,
      updated_at: Timestamp.now(),
    });

    revalidatePath("/admin/master-data");

    return true;
  } catch (error) {
    console.error("Error deleting master data item:", error);
    throw error;
  }
}
