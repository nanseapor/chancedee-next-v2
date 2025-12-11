"use server";
import {
  createCandidateDataProps,
  getCandidateDataPropsById,
  updateCandidateDataProps as updateCandidateDataPropsRepo,
} from "@/lib/database/repositories/web-candidate-data-props";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { PerformanceMonitor } from "@/lib/performance-monitor";
import { seedCandidateData } from "@/lib/utils/shared/utils";
import { candidateDataProps } from "@/types/candidate.types";

const getCandidateDataWithToken = async (idToken: string) => {
  return PerformanceMonitor.measure("getCandidateDataWithToken", async () => {
    const user = await getFirebaseAdminAuth().verifyIdToken(idToken);
    if (!user) {
      return null;
    }
    let candidateData = await getCandidateDataPropsById(user.uid);
    if (!candidateData) {
      console.log("Candidate data not found, creating candidate data");
      const newCandidateData = seedCandidateData(user.uid, {
        email: user.email || "",
        phone: "",
      });

      await createCandidateDataProps(newCandidateData);
      console.log(
        "Candidate data created successfully, fetching candidate data",
      );
      candidateData = await getCandidateDataPropsById(user.uid);

      if (!candidateData) {
        console.error("Candidate data creation failed");
        throw new Error("Candidate data creation failed");
      }
    }
    return candidateData;
  });
};

export default getCandidateDataWithToken;

export async function updateCandidateDataProps(
  uid: string,
  data: candidateDataProps
): Promise<void> {
  return updateCandidateDataPropsRepo(uid, data);
}
