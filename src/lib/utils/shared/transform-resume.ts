import { MasterJobApplicationStatuses } from "@/constants/application";
import type { userDataProps } from "@/types/auth.types";
import type {
    ICandiateSearchResume,
    candidateDataProps,
} from "@/types/candidate.types";
import type { jobApplicationData } from "@/types/job-application.types";
import type { IJobReturnData } from "@/types/job.types";

type resumeDataType = {
  userInfo: userDataProps;
  candidateInfo: candidateDataProps;
  applicationInfo?: jobApplicationData;
  jobInfo?: IJobReturnData;
};

export const transformResumeData = (resumeData: resumeDataType) => {
  const birthdate = resumeData.candidateInfo.birthdate;
  const age = birthdate
    ? (
        new Date().getFullYear() - new Date(birthdate || "").getFullYear()
      ).toString()
    : "-";
  const date = resumeData.candidateInfo.updatedAt
    ? new Date(resumeData.candidateInfo.updatedAt)
    : new Date();

  const candidate: ICandiateSearchResume = {
    id: resumeData.userInfo.uid,
    name: `${resumeData.userInfo.firstnameTH} ${resumeData.userInfo.lastnameTH}`,
    avatarURL: resumeData.userInfo.avatarURL || null,
    age,
    branch: resumeData.candidateInfo.educations?.[0]?.major || "ไม่ระบุ", // สาขา
    date,
    aboutMe: resumeData.candidateInfo.aboutMe,
    educationLevel:
      resumeData.candidateInfo.educations?.[0]?.educationLevel.toString() ||
      "ไม่ระบุ",
    position: resumeData.jobInfo?.data.title || "ไม่ระบุ",
    previouslyWorked:
      resumeData.candidateInfo.works
        ?.filter((w) => w.isCurrent)
        .sort((a, b) =>
          a.endYear && b.endYear ? a.endYear - b.endYear : a.endYear ? 1 : -1,
        )?.[0]?.jobTitle || "ไม่ระบุ",
    experienceYears: resumeData.candidateInfo.experienceYears || 0,
    businessDomain:
      resumeData.candidateInfo.preference?.preferredCompany?.toString() ||
      "ไม่ระบุ",
    address: {
      addressLine1: resumeData.candidateInfo.addressLine1 || "ไม่ระบุ",
      addressLine2: resumeData.candidateInfo.addressLine2 || "ไม่ระบุ",
      province: resumeData.candidateInfo.province || "ไม่ระบุ",
      district: resumeData.candidateInfo.district || "ไม่ระบุ",
      subDistrict: resumeData.candidateInfo.subDistrict || "ไม่ระบุ",
      postCode: resumeData.candidateInfo.postCode || "ไม่ระบุ",
    },
    resumeStatus: resumeData.applicationInfo
      ? resumeData.applicationInfo.status
      : MasterJobApplicationStatuses.new,
    resumeScore: resumeData.userInfo.info.currentStep
      ? `${((resumeData.userInfo.info.currentStep * 100) / 12).toFixed()}%`
      : "0%",
    salary:
      resumeData.candidateInfo.works?.[0]?.salary?.toLocaleString() || "ไม่ระบุ",
    university:
      resumeData.candidateInfo.educations?.[0]?.institution || "ไม่ระบุ",
    expectdSalary:
      resumeData.candidateInfo.preference?.expectedSalary?.toLocaleString() ||
      "ไม่ระบุ",
    userInfo: resumeData.userInfo,
    candidateInfo: resumeData.candidateInfo,
    applicationInfo: resumeData.applicationInfo,
    jobInfo: resumeData.jobInfo?.data,
  };
  return candidate;
};
