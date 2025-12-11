"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { FirebaseCompanyAccountRequests } from "@/types/admin.types";

import { FirebaseCompanyRequestsType } from "../schemas/company-requests.schema";

// This is experimental, using same collection as company information
// The data will stay and traceable to which company got approved at chat time.
// This allow company profile edit even when the company is not approved.

const webCompanyRequestsGetById = async (uid: string) => {
  try {
    const CompanyRequestsRef = getFirebaseAdminFirestore()
      .collection("company_information")
      .doc(uid);
    const CompanyRequestsSnap = await CompanyRequestsRef.get();
    if (CompanyRequestsSnap.exists) {
      const firebaseCompanyRequests =
        CompanyRequestsSnap.data() as FirebaseCompanyRequestsType;
      const data: FirebaseCompanyAccountRequests = {
        createdAt: CompanyRequestsSnap.createTime?.toMillis() || 0,
        updatedAt: CompanyRequestsSnap.updateTime?.toMillis() || 0,
        companyName: firebaseCompanyRequests.company_name,
        firstNameTH: firebaseCompanyRequests.first_name_th || "",
        lastNameTH: firebaseCompanyRequests.last_name_th || "",
        email: firebaseCompanyRequests.email,
        status: firebaseCompanyRequests.status,
        id: firebaseCompanyRequests.created_by?.id || "",
        companyLogo: firebaseCompanyRequests.company_logo || "",
        country: firebaseCompanyRequests.country || "",
        companySize: firebaseCompanyRequests.company_size || "",
        uid: firebaseCompanyRequests.uid,
        attachedFiles: firebaseCompanyRequests.attached_files,
        createdBy: firebaseCompanyRequests.created_by?.id,
        updatedBy: firebaseCompanyRequests.updated_by?.id
};
      return data;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webCompanyRequestsGetByFilter = async (filter?: Filter) => {
  try {
    const CompanyRequestsRef = getFirebaseAdminFirestore().collection(
      "company_information"
    );
    let CompanyRequestsQuery = CompanyRequestsRef as Query;
    if (filter) CompanyRequestsQuery = CompanyRequestsRef.where(filter);
    const CompanyRequestsSnap = await CompanyRequestsQuery.get();
    if (!CompanyRequestsSnap.empty) {
      const lists = CompanyRequestsSnap.docs.map((doc) => {
        const firebaseCompanyRequests =
          doc.data() as FirebaseCompanyRequestsType;
        const data: FirebaseCompanyAccountRequests = {
          createdAt: doc.createTime?.toMillis() || 0,
          updatedAt: doc.updateTime?.toMillis() || 0,
          companyName: firebaseCompanyRequests.company_name,
          firstNameTH: firebaseCompanyRequests.first_name_th || "",
          lastNameTH: firebaseCompanyRequests.last_name_th || "",
          email: firebaseCompanyRequests.email,
          status: firebaseCompanyRequests.status,
          id: firebaseCompanyRequests.created_by?.id || "",
          companyLogo: firebaseCompanyRequests.company_logo || "",
          country: firebaseCompanyRequests.country || "",
          companySize: firebaseCompanyRequests.company_size || "",
          uid: firebaseCompanyRequests.uid,
          attachedFiles: firebaseCompanyRequests.attached_files,
          createdBy: firebaseCompanyRequests.created_by?.id,
          updatedBy: firebaseCompanyRequests.updated_by?.id
};
        return data;
      });
      return lists;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webCompanyRequestsCreate = async (
  payload: FirebaseCompanyAccountRequests,
  actorId: string,
  uid?: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const CompanyRequestsRef = uid
      ? getFirebaseAdminFirestore().collection("company_information").doc(uid)
      : getFirebaseAdminFirestore().collection("company_information").doc();

    const dataToWrite: FirebaseCompanyRequestsType = {
      uid: CompanyRequestsRef.id,
      created_by: actorRef,
      created_at: Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
      company_name: payload.companyName,
      first_name_th: payload.firstNameTH,
      last_name_th: payload.lastNameTH,
      email: payload.email,
      status: payload.status,
      company_logo: payload.companyLogo,
      country: payload.country,
      company_size: payload.companySize,
      attached_files: payload.attachedFiles
};
    await CompanyRequestsRef.set(dataToWrite, { merge: true });
    return CompanyRequestsRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

const webCompanyRequestsUpdate = async (
  payload: FirebaseCompanyAccountRequests,
  actorId: string,
  uid: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const CompanyRequestsRef = getFirebaseAdminFirestore()
      .collection("company_information")
      .doc(uid);
    const prevDataSnap = await CompanyRequestsRef.get();
    const dataToWrite: FirebaseCompanyRequestsType = {
      uid: CompanyRequestsRef.id,
      created_by: prevDataSnap.data()?.created_by || actorRef,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
      company_name: payload.companyName,
      first_name_th: payload.firstNameTH,
      last_name_th: payload.lastNameTH,
      email: payload.email,
      status: payload.status,
      company_logo: payload.companyLogo,
      country: payload.country,
      company_size: payload.companySize,
      attached_files: payload.attachedFiles
};

    await CompanyRequestsRef.set(dataToWrite, { merge: true });
    return CompanyRequestsRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webCompanyRequestsCreate,
  webCompanyRequestsGetByFilter,
  webCompanyRequestsGetById,
  webCompanyRequestsUpdate
};
