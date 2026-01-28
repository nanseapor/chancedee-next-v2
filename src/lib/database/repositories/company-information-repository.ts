import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { extractDocumentIdOptional } from "@/lib/database/utils/firebase-utils";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FirebaseCompanyData } from "@/types/company.types";

// Import from schema-first approach
import { FirebaseCompanyInformationType } from "../schemas/company-information.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseCompanyInformationType,
  createTime?: number,
  updateTime?: number
): FirebaseCompanyData {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    companyName: firebaseModel.company_name,
    shortDescription: firebaseModel.short_description,
    industry: firebaseModel.industry,
    overview: firebaseModel.overview,
    taxId: firebaseModel.tax_id,
    companySize: firebaseModel.company_size,
    website: firebaseModel.website,
    coverPhoto: firebaseModel.cover_photo,
    profilePhoto: firebaseModel.profile_photo,
    videoLink: firebaseModel.video_link,
    travelMode: firebaseModel.travel_mode,
    travelStation: firebaseModel.travel_station,
    mapLocation: firebaseModel.map_location,
    status: firebaseModel.status,
    benefitsDetails: firebaseModel.benefits_details,
    shortDescriptionText: firebaseModel.short_description_text,
    overviewText: firebaseModel.overview_text,
    benefitsText: firebaseModel.benefits_text,
    isActive: firebaseModel.is_active,
    staff: firebaseModel.staff,
    config: firebaseModel.config,
    createdBy: extractDocumentIdOptional(firebaseModel.created_by),
    updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseCompanyData,
  actorId: string,
  isUpdate = false
): FirebaseCompanyInformationType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    company_name: appModel.companyName,
    short_description: appModel.shortDescription,
    industry: appModel.industry,
    overview: appModel.overview,
    tax_id: appModel.taxId,
    company_size: appModel.companySize,
    website: appModel.website,
    cover_photo: appModel.coverPhoto,
    profile_photo: appModel.profilePhoto,
    video_link: appModel.videoLink,
    travel_mode: appModel.travelMode,
    travel_station: appModel.travelStation,
    map_location: appModel.mapLocation,
    status: appModel.status,
    benefits_details: appModel.benefitsDetails || "",
    short_description_text: appModel.shortDescriptionText || "",
    overview_text: appModel.overviewText || "",
    benefits_text: appModel.benefitsText || "",
    is_active: appModel.isActive,
    staff: appModel.staff,
    config: appModel.config,
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
  };
}

// Create and export the repository
export const companyInformationRepository: IRepository<FirebaseCompanyData> = createRepository<FirebaseCompanyData, FirebaseCompanyInformationType>(
  'company_information',
  transformToAppModel,
  transformToFirebaseModel
);