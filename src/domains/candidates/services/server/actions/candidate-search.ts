"use server";

import { masterDataGet } from "@/domains/admin/services/server/actions/master-data-management";
import { UserInfoGetPersonalInfo } from "@/domains/authentication/services/server/actions/user-account-firestore";
import { transformResumeData } from "@/lib/utils/shared/transform-resume";
import type { userDataProps } from "@/types/auth.types";
import type {
  ICandiateSearchResume,
  ICandidateSearchFilterType,
  ICandidateSearchListData,
  candidateDataProps,
} from "@/types/candidate.types";
import type {
  jobApplicationData,
  jobApplicationReturnData,
} from "@/types/job-application.types";
import type { IJobReturnData } from "@/types/job.types";

import { CandidateAccountGet } from "./candidate-management";

async function getCandidateFilteredResumes({
  filterParams,
  jobInfo,
  jobApplicationInfo,
}: {
  filterParams: ICandidateSearchFilterType;
  jobInfo: IJobReturnData[];
  jobApplicationInfo: jobApplicationReturnData[];
}) {
  const candidateResume: ICandidateSearchListData[] = [];
  const listApplicationStatuses = await masterDataGet({
    collectionName: "master_job_application_statuses",
  });

  console.log(
    "getCandidateFilteredResume: length before filter",
    jobApplicationInfo.length,
  );

  const filteredJobApplication = jobApplicationInfo
    .filter((application) => {
      // Handle status filter - could be string, array, or undefined
      if (filterParams.status) {
        if (Array.isArray(filterParams.status)) {
          // If it's an array and contains "all", don't filter
          if (filterParams.status.includes("all")) return true;

          // Check if any status in the array matches
          return filterParams.status.some((status) =>
            application.data.status
              ?.toLowerCase()
              .includes(status.toLowerCase()),
          );
        } else {
          // String case
          if (filterParams.status === "all") return true;
          return application.data.status
            ?.toLowerCase()
            .includes(filterParams.status.toLowerCase());
        }
      }
      return true;
    })
    .filter((application) => {
      // Handle jobId filter - could be string, array, or undefined
      if (filterParams.jobId) {
        if (Array.isArray(filterParams.jobId)) {
          return filterParams.jobId.includes(application.data.jobId);
        } else {
          return application.data.jobId === filterParams.jobId;
        }
      }
      return true;
    })
    .filter((application) => {
      const expectedSalary = Number(application.data.expectedSalary) || 0;

      // Handle salary range filters
      const minSalary = Array.isArray(filterParams.minSalary)
        ? Number(filterParams.minSalary[0])
        : filterParams.minSalary
          ? Number(filterParams.minSalary)
          : null;

      const maxSalary = Array.isArray(filterParams.maxSalary)
        ? Number(filterParams.maxSalary[0])
        : filterParams.maxSalary
          ? Number(filterParams.maxSalary)
          : null;

      // Apply salary filters
      if (
        minSalary !== null &&
        !isNaN(minSalary) &&
        maxSalary !== null &&
        !isNaN(maxSalary)
      ) {
        return expectedSalary >= minSalary && expectedSalary <= maxSalary;
      } else if (minSalary !== null && !isNaN(minSalary)) {
        return expectedSalary >= minSalary;
      } else if (maxSalary !== null && !isNaN(maxSalary)) {
        return expectedSalary <= maxSalary;
      }

      return true;
    });

  // For debugging
  console.log("getCandidateFilteredResume: Filter params:", filterParams);
  console.log(
    "getCandidateFilteredResume: Total applications:",
    jobApplicationInfo.length,
  );
  console.log(
    "getCandidateFilteredResume: Filtered applications:",
    filteredJobApplication.length,
  );

  await Promise.all(
    filteredJobApplication.map(async (item) => {
      const [candidateInfoRes, userInfoRes] = await Promise.all([
        CandidateAccountGet(item.data.candidateId),
        UserInfoGetPersonalInfo(item.data.candidateId),
      ]);
      if (!candidateInfoRes) return;
      if (!userInfoRes) return;
      candidateResume.push({
        id: item.id,
        data: {
          application: JSON.stringify(item.data),
          candidateInfo: candidateInfoRes,
          userInfo: userInfoRes,
        },
      });
    }),
  );

  console.log(
    "getCandidateFilteredResume: after check candidate info & user info",
    filteredJobApplication.length,
  );

  // mock data
  const paginationData = {
    pageIndex: filterParams.page || 1,
    pageSize: filterParams.pageSize || 10,
    totalRecord: 0,
  };
  paginationData.totalRecord = candidateResume.length;
  const totalPages = Math.ceil(
    candidateResume.length / paginationData.pageSize,
  );

  console.log(
    "getCandidateFilteredResume: Paged resume length",
    candidateResume.length,
  );
  console.log("getCandidateFilteredResume: Total Pages", totalPages);

  const unsortedResumes: ICandiateSearchResume[] = candidateResume
    .map((candidate) => {
      // console.log("Processing application", candidate.id)
      const resumeData = {
        applicationInfo: JSON.parse(
          candidate.data.application,
        ) as jobApplicationData,
        userInfo: JSON.parse(candidate.data.userInfo) as userDataProps,
        candidateInfo: JSON.parse(
          candidate.data.candidateInfo,
        ) as candidateDataProps,
      };

      if (filterParams?.province !== undefined) {
        if (filterParams.district !== undefined) {
          if (
            resumeData.candidateInfo?.district !== filterParams?.district ||
            resumeData.candidateInfo?.province !== filterParams?.province
          ) {
            return null;
          }
        } else {
          if (resumeData.candidateInfo?.province !== filterParams?.province) {
            return null;
          }
        }
      }

      if (filterParams.educationLevels) {
        let existed = false;
        if (Array.isArray(filterParams.educationLevels)) {
          existed =
            resumeData.candidateInfo.educations?.some((val) => {
              return filterParams.educationLevels?.includes(
                val.educationLevel.toString(),
              );
            }) || false;
        } else {
          existed =
            resumeData.candidateInfo.educations?.some((val) => {
              return (
                filterParams.educationLevels === val.educationLevel.toString()
              );
            }) || false;
        }
        if (!existed) {
          return null;
        }
      }

      // if (filterParams.minSalary && filterParams.maxSalary) {
      //   const minSalary = filterParams?.minSalary
      //     ? parseInt(filterParams.minSalary as string)
      //     : 0;
      //   const maxSalary = filterParams?.maxSalary
      //     ? parseInt(filterParams.maxSalary as string)
      //     : 100000;

      //   if (
      //     resumeData.candidateInfo.preference?.expectedSalary &&
      //     resumeData.candidateInfo.preference.expectedSalary < minSalary &&
      //     resumeData.candidateInfo.preference.expectedSalary > maxSalary
      //   ) {
      //     return null;
      //   }
      // }

      const job = jobInfo.find(
        (job) => job.id === resumeData.applicationInfo?.jobId,
      );

      const returnData = transformResumeData({
        userInfo: JSON.parse(candidate.data.userInfo) as userDataProps,
        candidateInfo: JSON.parse(
          candidate.data.candidateInfo,
        ) as candidateDataProps,
        applicationInfo: JSON.parse(
          candidate.data.application,
        ) as jobApplicationData,
        jobInfo: job,
      });

      return returnData;
    })
    .filter((item) => item !== null)
    .sort((a, b) => {
      return b.date.getTime() - a.date.getTime();
    })
    .sort((a, b) => {
      // console.log("status", a.resumeStatus, b.resumeStatus);
      const firstTerm = listApplicationStatuses!.find(
        (item) => item.code === a.resumeStatus,
      );
      const secondTerm = listApplicationStatuses!.find(
        (item) => item.code === b.resumeStatus,
      );

      // console.log("calculation", typeof firstTerm, typeof secondTerm);
      if (firstTerm === undefined || secondTerm === undefined) {
        return 0;
      }
      const result = firstTerm.sort! - secondTerm.sort!;
      return result;
    });

  let filterResumes: ICandiateSearchResume[] = [];

  if (filterParams.experienceYears) {
    if (Array.isArray(filterParams.experienceYears)) {
      if (filterParams.experienceYears.length > 0) {
        filterParams.experienceYears.forEach((val) => {
          if (val === "00") {
            // ไม่มีประสบการณ์
            filterResumes = filterResumes.concat(
              unsortedResumes.filter((resume) => {
                return resume.experienceYears === 0;
              }),
            );
          } else if (val === "01") {
            // น้อยกว่า 2 ปี
            filterResumes = filterResumes.concat(
              unsortedResumes.filter((resume) => {
                const experienceYears = resume.experienceYears;
                return experienceYears > 0 && experienceYears < 2;
              }),
            );
          } else if (val === "02") {
            filterResumes = filterResumes.concat(
              unsortedResumes.filter((resume) => {
                const experienceYears = resume.experienceYears;
                return experienceYears >= 2 && experienceYears < 5;
              }),
            );
            // 2 ถึง 5 ปี
          } else if (val === "05") {
            filterResumes = filterResumes.concat(
              unsortedResumes.filter((resume) => {
                const experienceYears = resume.experienceYears;
                return experienceYears >= 5 && experienceYears < 10;
              }),
            );
            // 5 ถึง 10 ปี
          } else if (val === "10") {
            filterResumes = filterResumes.concat(
              unsortedResumes.filter((resume) => {
                const experienceYears = resume.experienceYears;
                return experienceYears >= 10;
              }),
            );
            // 10 ปีขึ้นไป
          }
        });
      }
    } else if (typeof filterParams.experienceYears === "string") {
      const val = filterParams.experienceYears;
      if (val === "00") {
        // ไม่มีประสบการณ์
        filterResumes = filterResumes.concat(
          unsortedResumes.filter((resume) => {
            return resume.experienceYears === 0;
          }),
        );
      } else if (val === "01") {
        // น้อยกว่า 2 ปี
        filterResumes = filterResumes.concat(
          unsortedResumes.filter((resume) => {
            const experienceYears = resume.experienceYears;
            return experienceYears < 2 && experienceYears > 0;
          }),
        );
      } else if (val === "02") {
        filterResumes = filterResumes.concat(
          unsortedResumes.filter((resume) => {
            const experienceYears = resume.experienceYears;
            return experienceYears >= 2 && experienceYears < 5;
          }),
        );
        // 2 ถึง 5 ปี
      } else if (val === "05") {
        filterResumes = filterResumes.concat(
          unsortedResumes.filter((resume) => {
            const experienceYears = resume.experienceYears;
            return experienceYears >= 5 && experienceYears < 10;
          }),
        );
        // 5 ถึง 10 ปี
      } else if (val === "10") {
        filterResumes = filterResumes.concat(
          unsortedResumes.filter((resume) => {
            const experienceYears = resume.experienceYears;
            return experienceYears >= 10;
          }),
        );
        // 10 ปีขึ้นไป
      }
    }
  } else {
    filterResumes = unsortedResumes;
  }
  console.log(
    "getCandidateFilteredResume: Filtered Resumes",
    filterResumes.length,
  );
  return filterResumes;
}

export default getCandidateFilteredResumes;
