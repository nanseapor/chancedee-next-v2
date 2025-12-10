"use server"

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin"
import type { masterData } from "@/types/master-data.types"

export async function getMasterData() {
  try {
    const db = getFirebaseAdminFirestore()

    // Fetch all master data categories in parallel
    const [jobIndustriesSnapshot, jobFunctionsSnapshot, jobTypesSnapshot, careerLevelsSnapshot, educationLevelsSnapshot, skillsSnapshot] =
      await Promise.all([
        db.collection("master_job_industries").get(),
        db.collection("master_job_functions").get(),
        db.collection("master_job_types").get(),
        db.collection("master_career_levels").get(),
        db.collection("master_education_levels").get(),
        db.collection("master_skills").get(),
      ])

    // Convert snapshots to arrays of data
    const jobIndustries = jobIndustriesSnapshot.docs.map((doc) => {
      const item = doc.data()
      return (
        {
          uid: doc.id,
          code: item.code,
          label: item.label,
          icon: item.icon,
          sort: item.sort,
          members: item.members,
          isActive: item.is_active,
          createAt: item.created_at,
          updateAt: item.updated_at,
          createBy: item.created_by,
          updateBy: item.updated_by,
        }
      )
    }) as masterData[]

    // Convert snapshots to arrays of data
    const jobFunctions = jobFunctionsSnapshot.docs.map((doc) => {
      const item = doc.data()
      return (
        {
          uid: doc.id,
          code: item.code,
          label: item.label,
          icon: item.icon,
          sort: item.sort,
          members: item.members,
          isActive: item.is_active,
          createAt: item.created_at,
          updateAt: item.updated_at,
          createBy: item.created_by,
          updateBy: item.updated_by,
        }
      )
    }) as masterData[]

    const jobTypes = jobTypesSnapshot.docs.map((doc) => {
      const item = doc.data()
      return (
        {
          uid: doc.id,
          code: item.code,
          label: item.label,
          icon: item.icon,
          sort: item.sort,
          members: item.members,
          isActive: item.is_active,
          createAt: item.created_at,
          updateAt: item.updated_at,
          createBy: item.created_by,
          updateBy: item.updated_by,
        }
      )
    }) as masterData[]

    const careerLevels = careerLevelsSnapshot.docs.map((doc) => {
      const item = doc.data()
      return (
        {
          uid: doc.id,
          code: item.code,
          label: item.label,
          icon: item.icon,
          sort: item.sort,
          members: item.members,
          isActive: item.is_active,
          createAt: item.created_at,
          updateAt: item.updated_at,
          createBy: item.created_by,
          updateBy: item.updated_by,
        }
      )
    }) as masterData[]

    const educationLevels = educationLevelsSnapshot.docs.map((doc) => {
      const item = doc.data()
      return (
        {
          uid: doc.id,
          code: item.code,
          label: item.label,
          icon: item.icon,
          sort: item.sort,
          members: item.members,
          isActive: item.is_active,
          createAt: item.created_at,
          updateAt: item.updated_at,
          createBy: item.created_by,
          updateBy: item.updated_by,
        }
      )
    }) as masterData[]

    const skills = skillsSnapshot.docs.map((doc) => {
      const item = doc.data()
      return (
        {
          uid: doc.id,
          code: item.code,
          label: item.label,
          icon: item.icon,
          sort: item.sort,
          members: item.members,
          isActive: item.is_active,
          createAt: item.created_at,
          updateAt: item.updated_at,
          createBy: item.created_by,
          updateBy: item.updated_by,
        }
      )
    }) as masterData[]

    return {
      jobIndustries,
      jobFunctions,
      jobTypes,
      careerLevels,
      educationLevels,
      skills,
    }

  } catch (error) {
    console.error("Error fetching master data:", error)
    // Return empty arrays as fallback
    return {
      jobIndustries: [],
      jobFunctions: [],
      jobTypes: [],
      careerLevels: [],
      educationLevels: [],
      skills: [],
    }
  }
}

export async function getMasterDataByCategory(category: string) {
  try {
    const db = getFirebaseAdminFirestore()

    // Map category to collection name
    const collectionMap: Record<string, string> = {
      jobIndustries: "master_job_industries",
      jobFunctions: "master_job_functions",
      jobTypes: "master_job_types",
      careerLevels: "master_career_levels",
      educationLevels: "master_education_levels",
      skills: "master_skills",
    }

    const collectionName = collectionMap[category]

    if (!collectionName) {
      throw new Error(`Invalid category: ${category}`)
    }

    const snapshot = await db.collection(collectionName).get()

    return snapshot.docs.map((doc) => {
      const item = doc.data()
      return (
        {
          uid: doc.id,
          code: item.code,
          label: item.label,
          icon: item.icon,
          sort: item.sort,
          members: item.members,
          isActive: item.is_active,
          createAt: item.created_at,
          updateAt: item.updated_at,
          createBy: item.created_by,
          updateBy: item.updated_by,
        }
      )
    }) as masterData[]
  } catch (error) {
    console.error(`Error fetching ${category}:`, error)
    return []
  }
}

